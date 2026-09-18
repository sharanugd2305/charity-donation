from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import Sum, Count, Q
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .models import Donation, UserActivity, UserProfile
from admin_app.models import NGOCampaign
import logging
from decimal import Decimal
from django.utils import timezone as dj_timezone
import datetime

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Return client IP address from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class SignupView(APIView):
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Signup request data: {data}")
            
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if username:
                username = str(username).strip()
            if email:
                email = str(email).strip()
            if password:
                password = str(password).strip()

            if not username:
                return Response({'error': 'Username is required', 'received_data': str(data)}, status=status.HTTP_400_BAD_REQUEST)
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not password:
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                validate_email(email)
            except ValidationError:
                return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(username=username, email=email, password=password)
            token, created = Token.objects.get_or_create(user=user)
            # Record signup activity
            try:
                UserActivity.objects.create(
                    user=user,
                    activity_type='signup',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details='User signed up via API',
                )
            except Exception as e:
                logger.error(f"Failed to record signup activity: {e}")
            return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response({'error': f'Signup failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Login request data: {data}")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Content-Type: {request.META.get('CONTENT_TYPE')}")
            logger.info(f"Raw POST: {request.POST}")

            username = data.get('username') or request.POST.get('username')
            password = data.get('password') or request.POST.get('password')

            # If username is not provided, try to get user by email
            if not username:
                email = data.get('email') or request.POST.get('email')
                if email:
                    from django.contrib.auth.models import User
                    try:
                        user_obj = User.objects.get(email=email)
                        username = user_obj.username
                    except User.DoesNotExist:
                        return Response({
                            'error': 'Invalid email or password',
                            'received_data': str(data),
                            'post_data': str(request.POST.dict())
                        }, status=status.HTTP_401_UNAUTHORIZED)

            logger.info(f"Username: {username}, Password: {password}")

            if not username:
                return Response({
                    'error': 'Username or email is required',
                    'received_data': str(data),
                    'post_data': str(request.POST.dict())
                }, status=status.HTTP_400_BAD_REQUEST)
            if not password:
                return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = authenticate(username=username, password=password)
            if user is None:
                # Record failed login attempt
                try:
                    attempted_user = None
                    from django.contrib.auth.models import User as DjUser
                    attempted_user = DjUser.objects.filter(username=username).first()
                    UserActivity.objects.create(
                        user=attempted_user,
                        activity_type='failed_login',
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        details=f'Failed login attempt for {username or "unknown"}',
                    )
                except Exception as e:
                    logger.error(f"Failed to record failed login activity: {e}")

                return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_401_UNAUTHORIZED)

            token, created = Token.objects.get_or_create(user=user)
            # Record successful login activity
            try:
                UserActivity.objects.create(
                    user=user,
                    activity_type='login',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details='User logged in via API',
                )
            except Exception as e:
                logger.error(f"Failed to record login activity: {e}")

            # Also record admin_app.UserLoginHistory so admin dashboard shows login
            try:
                from admin_app.models import UserLoginHistory
                UserLoginHistory.objects.create(
                    user=user,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
            except Exception as e:
                logger.error(f"Failed to record admin login history: {e}")

            return Response({'token': token.key, 'username': user.username}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response({'error': f'Login failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DonationView(APIView):
    """View to create and list donations"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create a new donation"""
        try:
            data = request.data
            logger.info(f"Donation request received: {data}")
            
            # Extract donation data
            ngo_name = data.get('ngo_name', '')
            campaign_name = data.get('campaign_name', '')
            campaign_id = data.get('campaign_id')
            ngo_id = data.get('ngo_id')
            donation_type = data.get('donation_type', 'money')
            amount = data.get('amount')
            item_type = data.get('item_type', '')
            quantity = data.get('quantity', '')
            description = data.get('description', '')
            address = data.get('address', '')
            anonymous = data.get('anonymous', False)
            transaction_id = data.get('transaction_id')
            
            # Validate required fields
            if not ngo_name or not campaign_name or not campaign_id or not ngo_id or not transaction_id:
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
            if donation_type == 'money' and not amount:
                return Response({'error': 'Amount is required for money donations'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create donation
            donation = Donation.objects.create(
                user=request.user,
                ngo_name=ngo_name,
                campaign_name=campaign_name,
                campaign_id=campaign_id,
                ngo_id=ngo_id,
                donation_type=donation_type,
                amount=float(amount) if amount else None,
                item_type=item_type,
                quantity=quantity,
                description=description,
                address=address,
                anonymous=anonymous,
                transaction_id=transaction_id,
                status='completed'
            )
            
            logger.info(f"Donation created: {donation.id}")
            
            return Response({
                'message': 'Donation created successfully',
                'donation': {
                    'id': donation.id,
                    'transaction_id': donation.transaction_id,
                    'campaign_name': donation.campaign_name,
                    'ngo_name': donation.ngo_name,
                    'donation_type': donation.donation_type,
                    'amount': float(donation.amount) if donation.amount else None,
                    'status': donation.status,
                    'created_at': donation.created_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Donation creation error: {str(e)}", exc_info=True)
            return Response({'error': f'Donation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get user's donations"""
        try:
            donations = Donation.objects.filter(user=request.user).order_by('-created_at')
            donations_data = []
            for donation in donations:
                donations_data.append({
                    'id': donation.id,
                    'ngo': donation.ngo_name,
                    'campaign': donation.campaign_name,
                    'donation_type': donation.donation_type,
                    'amount': float(donation.amount) if donation.amount else None,
                    'item_type': donation.item_type,
                    'quantity': donation.quantity,
                    'status': donation.status,
                    'date': donation.created_at.strftime('%Y-%m-%d'),
                    'transaction_id': donation.transaction_id,
                    'campaign_id': donation.campaign_id,
                    'anonymous': donation.anonymous,
                })
            return Response({'donations': donations_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching donations: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve donations'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@require_http_methods(["GET"])
def user_dashboard(request):
    """Get user dashboard data"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        user = request.user
        donations = Donation.objects.filter(user=user)
        activities = UserActivity.objects.filter(user=user)[:10]
        
        total_donated = donations.aggregate(Sum('amount'))['amount__sum'] or 0
        total_donations = donations.count()
        
        activity_data = []
        for activity in activities:
                # provide ISO (timezone-aware) and unix ms timestamp for frontend formatting
                ts = activity.timestamp
                try:
                    ts_iso = dj_timezone.localtime(ts).isoformat()
                except Exception:
                    ts_iso = activity.timestamp.isoformat()
                try:
                    ts_ms = int(ts.timestamp() * 1000)
                except Exception:
                    ts_ms = None

                activity_data.append({
                    'type': activity.activity_type,
                    'timestamp_iso': ts_iso,
                    'timestamp_ms': ts_ms,
                    'details': activity.details
                })
        
        return JsonResponse({
            'username': user.username,
            'email': user.email,
            'total_donated': float(total_donated),
            'total_donations': total_donations,
            'recent_activities': activity_data
        }, status=200)
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}", exc_info=True)
        return JsonResponse({'error': 'Failed to retrieve dashboard data'}, status=500)

class ImpactView(APIView):
    """View to get donation impact statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's donation impact"""
        try:
            user_donations = Donation.objects.filter(user=request.user)
            
            money_donated = user_donations.filter(donation_type='money').aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            # Get unique campaigns and NGOs
            unique_campaigns = user_donations.values('campaign_id').distinct().count()
            unique_ngos = user_donations.values('ngo_id').distinct().count()
            
            # Estimate lives impacted (rough calculation: ₹1000 per life)
            estimated_lives = int(float(money_donated) / 1000) if money_donated else 0
            
            # Get active campaigns (campaigns with donations in last 30 days)
            from django.utils import timezone
            from datetime import timedelta
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_donations = user_donations.filter(created_at__gte=thirty_days_ago)
            
            # Build active campaigns list
            active_campaigns_data = []
            campaign_ids = recent_donations.values('campaign_id', 'campaign_name', 'ngo_name').distinct()
            
            for camp in campaign_ids:
                camp_donations = recent_donations.filter(campaign_id=camp['campaign_id'])
                total_donated = camp_donations.filter(donation_type='money').aggregate(
                    total=Sum('amount')
                )['total'] or 0
                # Try to fetch real campaign goal/target from NGOCampaign model
                goal = None
                try:
                    campaign_obj = NGOCampaign.objects.filter(id=camp['campaign_id']).first()
                    if campaign_obj and getattr(campaign_obj, 'target_amount', None) is not None:
                        goal = float(campaign_obj.target_amount)
                except Exception:
                    goal = None

                # Fallback: if no real goal found, fall back to heuristic
                if not goal:
                    goal = float(total_donated) * 1.5 if total_donated else 10000
                
                active_campaigns_data.append({
                    'campaign_id': camp['campaign_id'],
                    'campaign_name': camp['campaign_name'],
                    'ngo_name': camp['ngo_name'],
                    'total_donated': float(total_donated),
                    'goal': goal,
                    'progress_percentage': int((float(total_donated) / goal) * 100) if goal > 0 else 0,
                    'donation_count': camp_donations.count(),
                    'category': 'General'  # Default category
                })
            
            impact_data = {
                'total_donations': user_donations.count(),
                'money_donated': float(money_donated),
                'clothes_donations': user_donations.filter(donation_type='clothes').count(),
                'food_donations': user_donations.filter(donation_type='food').count(),
                'unique_campaigns': unique_campaigns,
                'unique_ngos': unique_ngos,
                'estimated_lives_impacted': estimated_lives,
                'active_campaigns': active_campaigns_data,
            }
            
            return Response(impact_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Impact calculation error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to calculate impact'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    """View to get and update user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        try:
            user = request.user
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Construct full name
            name = ''
            if user.first_name and user.last_name:
                name = f"{user.first_name} {user.last_name}"
            elif user.first_name:
                name = user.first_name
            elif user.last_name:
                name = user.last_name
            else:
                name = user.username
            
            return Response({
                'username': user.username,
                'email': user.email,
                'name': name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': profile.phone or '',
                'address': profile.address or '',
                'joined_date': user.date_joined.isoformat(),
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat(),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Profile fetch error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update user profile"""
        try:
            user = request.user
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            # Handle name field - split into first_name and last_name
            name = request.data.get('name', '')
            if name:
                name_parts = name.strip().split(' ', 1)
                user.first_name = name_parts[0]
                user.last_name = name_parts[1] if len(name_parts) > 1 else ''
            else:
                user.first_name = request.data.get('first_name', user.first_name)
                user.last_name = request.data.get('last_name', user.last_name)
            user.save()
            
            profile.phone = request.data.get('phone', profile.phone)
            profile.address = request.data.get('address', profile.address)
            profile.save()
            
            # Construct full name for response
            full_name = ''
            if user.first_name and user.last_name:
                full_name = f"{user.first_name} {user.last_name}"
            elif user.first_name:
                full_name = user.first_name
            elif user.last_name:
                full_name = user.last_name
            else:
                full_name = user.username
            
            return Response({
                'message': 'Profile updated successfully',
                'username': user.username,
                'email': user.email,
                'name': full_name,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': profile.phone or '',
                'address': profile.address or '',
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to update profile'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDashboardStatsView(APIView):
    """Admin dashboard statistics"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get admin statistics"""
        try:
            total_users = User.objects.count()
            total_donations = Donation.objects.count()
            total_amount = Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0
            total_activities = UserActivity.objects.count()
            
            money_donations = Donation.objects.filter(donation_type='money').count()
            clothes_donations = Donation.objects.filter(donation_type='clothes').count()
            food_donations = Donation.objects.filter(donation_type='food').count()
            
            completed_donations = Donation.objects.filter(status='completed').count()
            pending_donations = Donation.objects.filter(status='pending').count()
            cancelled_donations = Donation.objects.filter(status='cancelled').count()
            
            stats = {
                'total_users': total_users,
                'total_donations': total_donations,
                'total_amount_donated': float(total_amount),
                'total_activities': total_activities,
                'donation_types': {
                    'money': money_donations,
                    'clothes': clothes_donations,
                    'food': food_donations,
                },
                'donation_status': {
                    'completed': completed_donations,
                    'pending': pending_donations,
                    'cancelled': cancelled_donations,
                }
            }
            # attach recent activities (for admin overview)
            try:
                recent = []
                for activity in UserActivity.objects.all().order_by('-timestamp')[:10]:
                    ts = activity.timestamp
                    try:
                        ts_iso = dj_timezone.localtime(ts).isoformat()
                    except Exception:
                        ts_iso = activity.timestamp.isoformat()
                    try:
                        ts_ms = int(ts.timestamp() * 1000)
                    except Exception:
                        ts_ms = None
                    recent.append({
                        'id': activity.id,
                        'user': activity.user.username if activity.user else 'Unknown',
                        'activity_type': activity.activity_type,
                        'timestamp_iso': ts_iso,
                        'timestamp_ms': ts_ms,
                        'details': activity.details,
                    })
                stats['recent_activities'] = recent
            except Exception as e:
                logger.error(f"Failed to attach recent activities: {e}")

            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Admin stats error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve stats'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminUsersView(APIView):
    """Admin view for managing users"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """List all users"""
        try:
            users = User.objects.all()
            users_data = []
            
            for user in users:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                donation_count = Donation.objects.filter(user=user).count()
                total_donated = Donation.objects.filter(user=user).aggregate(Sum('amount'))['amount__sum'] or 0
                
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'joined_date': user.date_joined.isoformat(),
                    'donation_count': donation_count,
                    'total_donated': float(total_donated),
                    'phone': profile.phone,
                })
            
            return Response(users_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Admin users error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve users'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AdminActivitiesView(APIView):
    """Admin view for user activities"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """List all user activities"""
        try:
            activities = UserActivity.objects.all().order_by('-timestamp')[:100]
            activities_data = []
            
            for activity in activities:
                username = activity.user.username if activity.user else "Unknown"
                ts = activity.timestamp
                try:
                    ts_iso = dj_timezone.localtime(ts).isoformat()
                except Exception:
                    ts_iso = activity.timestamp.isoformat()
                try:
                    ts_ms = int(ts.timestamp() * 1000)
                except Exception:
                    ts_ms = None

                activities_data.append({
                    'id': activity.id,
                    'user': username,
                    'activity_type': activity.activity_type,
                    'timestamp_iso': ts_iso,
                    'timestamp_ms': ts_ms,
                    'ip_address': activity.ip_address,
                    'details': activity.details,
                })
            
            return Response(activities_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Admin activities error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve activities'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminAnalyticsView(APIView):
    """Admin view for analytics"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get analytics data"""
        try:
            total_donations = Donation.objects.count()
            total_amount = Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0
            
            ngo_stats = Donation.objects.values('ngo_name').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-count')[:10]
            
            campaign_stats = Donation.objects.values('campaign_name').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-count')[:10]
            
            monthly_donations = []
            from django.db.models.functions import TruncMonth
            from django.db.models import F
            monthly_data = Donation.objects.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                count=Count('id'),
                total=Sum('amount')
            ).order_by('month')
            
            for item in monthly_data:
                if item['month']:
                    monthly_donations.append({
                        'month': item['month'].isoformat(),
                        'count': item['count'],
                        'total': float(item['total']) if item['total'] else 0,
                    })
            
            analytics = {
                'total_donations': total_donations,
                'total_amount': float(total_amount),
                'top_ngos': [
                    {
                        'name': ngo['ngo_name'],
                        'count': ngo['count'],
                        'total': float(ngo['total_amount']) if ngo['total_amount'] else 0,
                    }
                    for ngo in ngo_stats
                ],
                'top_campaigns': [
                    {
                        'name': campaign['campaign_name'],
                        'count': campaign['count'],
                        'total': float(campaign['total_amount']) if campaign['total_amount'] else 0,
                    }
                    for campaign in campaign_stats
                ],
                'monthly_donations': monthly_donations,
            }
            
            return Response(analytics, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Analytics error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve analytics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NGOListView(APIView):
    """View to get NGOs with actual raised amounts from donations"""
    permission_classes = []  # Allow anyone to view NGOs

    def get(self, request):
        """Get list of NGOs with campaigns and actual raised amounts"""
        try:
            ngos_structure = [
                {
                    'id': 1,
                    'name': 'Education for All',
                    'description': 'Providing quality education to underprivileged children across India',
                    'location': 'Mumbai, India',
                    'founded': 2010,
                    'website': 'https://educationforall.org',
                    'contact': 'contact@educationforall.org',
                    'impact': 'Educated 50,000+ children',
                    'image': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
                    'campaigns': [
                        {'id': 1, 'name': 'Rural School Development', 'description': 'Building schools in rural areas', 'target': 500000},
                        {'id': 2, 'name': 'Digital Learning Initiative', 'description': 'Providing tablets and online resources', 'target': 300000},
                    ],
                },
                {
                    'id': 2,
                    'name': 'Food for Hunger',
                    'description': 'Fighting hunger and malnutrition in rural communities',
                    'location': 'Delhi, India',
                    'founded': 2008,
                    'website': 'https://foodforhunger.org',
                    'contact': 'info@foodforhunger.org',
                    'impact': 'Served 100,000+ meals',
                    'image': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
                    'campaigns': [
                        {'id': 3, 'name': 'Daily Meal Program', 'description': 'Providing nutritious meals to children', 'target': 400000},
                    ],
                },
                {
                    'id': 3,
                    'name': 'Healthcare for All',
                    'description': 'Bringing healthcare services to remote areas',
                    'location': 'Bangalore, India',
                    'founded': 2012,
                    'website': 'https://healthcareforall.org',
                    'contact': 'support@healthcareforall.org',
                    'impact': 'Treated 75,000+ patients',
                    'image': 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=400',
                    'campaigns': [
                        {'id': 4, 'name': 'Mobile Medical Camps', 'description': 'Setting up camps in underserved areas', 'target': 600000},
                    ],
                },
                {
                    'id': 4,
                    'name': 'Child Welfare Society',
                    'description': 'Protecting and nurturing children in need across India',
                    'location': 'Chennai, India',
                    'founded': 2015,
                    'website': 'https://childwelfare.org',
                    'contact': 'help@childwelfare.org',
                    'impact': 'Helped 25,000+ children',
                    'image': '/images/child.webp',
                    'campaigns': [
                        {'id': 5, 'name': 'Orphanage Support', 'description': 'Providing food and education to orphans', 'target': 450000},
                        {'id': 6, 'name': 'Child Health Program', 'description': 'Medical care for underprivileged children', 'target': 350000},
                    ],
                },
                {
                    'id': 5,
                    'name': 'Rural Education Initiative',
                    'description': 'Bringing quality education to rural and tribal areas',
                    'location': 'Kolkata, India',
                    'founded': 2009,
                    'website': 'https://ruraleducation.org',
                    'contact': 'learn@ruraleducation.org',
                    'impact': 'Educated 40,000+ rural children',
                    'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
                    'campaigns': [
                        {'id': 7, 'name': 'Mobile Libraries', 'description': 'Bringing books to remote villages', 'target': 550000},
                    ],
                },
                {
                    'id': 6,
                    'name': 'Animal Welfare Society',
                    'description': 'Protecting and caring for stray animals',
                    'location': 'Pune, India',
                    'founded': 2011,
                    'website': 'https://animalwelfare.org',
                    'contact': 'care@animalwelfare.org',
                    'impact': 'Rescued 15,000+ animals',
                    'image': 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
                    'campaigns': [
                        {'id': 8, 'name': 'Sterilization Drive', 'description': 'Controlling animal population', 'target': 300000},
                        {'id': 9, 'name': 'Shelter Construction', 'description': 'Building shelters for animals', 'target': 700000},
                    ],
                },
                {
                    'id': 7,
                    'name': 'Disaster Relief Fund',
                    'description': 'Providing immediate aid during natural disasters',
                    'location': 'Hyderabad, India',
                    'founded': 2013,
                    'website': 'https://disasterrelief.org',
                    'contact': 'relief@disasterrelief.org',
                    'impact': 'Helped 50,000+ affected people',
                    'image': '/images/global.jpg',
                    'campaigns': [
                        {'id': 10, 'name': 'Flood Response', 'description': 'Aid for flood victims', 'target': 800000},
                    ],
                },
                {
                    'id': 8,
                    'name': 'Elder Care Foundation',
                    'description': 'Supporting elderly citizens with care and companionship',
                    'location': 'Ahmedabad, India',
                    'founded': 2007,
                    'website': 'https://eldercare.org',
                    'contact': 'support@eldercare.org',
                    'impact': 'Cared for 20,000+ elders',
                    'image': '/images/elder.jpg',
                    'campaigns': [
                        {'id': 11, 'name': 'Home Care Services', 'description': 'Providing in-home care', 'target': 400000},
                        {'id': 12, 'name': 'Senior Centers', 'description': 'Building community centers', 'target': 600000},
                    ],
                },
                {
                    'id': 9,
                    'name': "Children's Education Trust",
                    'description': 'Focusing on holistic development of underprivileged children',
                    'location': 'Jaipur, India',
                    'founded': 2014,
                    'website': 'https://childreneducation.org',
                    'contact': 'grow@childreneducation.org',
                    'impact': 'Nurtured 35,000+ children',
                    'image': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
                    'campaigns': [
                        {'id': 13, 'name': 'After School Programs', 'description': 'Extra-curricular activities for kids', 'target': 250000},
                    ],
                },
                {
                    'id': 10,
                    'name': 'Old Age Homes Network',
                    'description': 'Providing dignified living for senior citizens',
                    'location': 'Varanasi, India',
                    'founded': 2006,
                    'website': 'https://oldagehomes.org',
                    'contact': 'care@oldagehomes.org',
                    'impact': 'Sheltered 15,000+ seniors',
                    'image': '/images/old.jpg',
                    'campaigns': [
                        {'id': 14, 'name': 'Senior Living Facilities', 'description': 'Building comfortable homes for elders', 'target': 900000},
                        {'id': 15, 'name': 'Medical Care for Elders', 'description': 'Healthcare services for seniors', 'target': 350000},
                    ],
                },
            ]
            
            for ngo in ngos_structure:
                for campaign in ngo['campaigns']:
                    raised = Donation.objects.filter(
                        campaign_id=campaign['id'],
                        donation_type='money',
                        status='completed'
                    ).aggregate(total=Sum('amount'))['total'] or 0
                    campaign['raised'] = float(raised)
            
            return Response(ngos_structure, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"NGO list error: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve NGOs'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
