from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from .models import AdminUser, NGOOrganization, NGOCampaign, UserLoginHistory, DonationRecord, Feedback, Contact
from .permissions import IsAdminUser, IsSuperAdmin, IsAdminOrModerator
import logging
from datetime import timedelta
from django.utils import timezone as dj_timezone
import datetime

logger = logging.getLogger(__name__)

class AdminLoginView(APIView):
    """Admin login endpoint"""
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            if user is None:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if user is an admin
            try:
                admin_profile = user.admin_profile
                if not admin_profile.is_active:
                    return Response({'error': 'Admin account is deactivated'}, status=status.HTTP_403_FORBIDDEN)
            except AdminUser.DoesNotExist:
                return Response({'error': 'User is not an admin'}, status=status.HTTP_403_FORBIDDEN)
            
            # Record login history
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            UserLoginHistory.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'username': user.username,
                'role': admin_profile.role,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Admin login error: {str(e)}", exc_info=True)
            return Response({'error': f'Login failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NGOListView(APIView):
    """List and create NGO organizations"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def get(self, request):
        """Get list of NGOs with filters"""
        try:
            status_filter = request.query_params.get('status', None)
            search = request.query_params.get('search', None)
            
            ngos = NGOOrganization.objects.all()
            
            if status_filter:
                ngos = ngos.filter(status=status_filter)
            
            if search:
                ngos = ngos.filter(
                    Q(name__icontains=search) |
                    Q(description__icontains=search) |
                    Q(location__icontains=search)
                )
            
            ngos_data = []
            for ngo in ngos:
                ngos_data.append({
                    'id': ngo.id,
                    'name': ngo.name,
                    'description': ngo.description,
                    'location': ngo.location,
                    'founded': ngo.founded,
                    'website': ngo.website,
                    'contact_email': ngo.contact_email,
                    'contact_phone': ngo.contact_phone,
                    'impact': ngo.impact,
                    'image_url': ngo.image_url,
                    'status': ngo.status,
                    'registration_date': ngo.registration_date.isoformat(),
                    'approved_date': ngo.approved_date.isoformat() if ngo.approved_date else None,
                    'approved_by': ngo.approved_by.username if ngo.approved_by else None,
                    'rejection_reason': ngo.rejection_reason,
                    'is_active': ngo.is_active,
                    'campaigns_count': ngo.campaigns.count(),
                })
            
            return Response({'ngos': ngos_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching NGOs: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve NGOs'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create new NGO organization"""
        try:
            data = request.data
            ngo = NGOOrganization.objects.create(
                name=data.get('name'),
                description=data.get('description'),
                location=data.get('location'),
                founded=data.get('founded'),
                website=data.get('website'),
                contact_email=data.get('contact_email'),
                contact_phone=data.get('contact_phone'),
                impact=data.get('impact'),
                image_url=data.get('image_url'),
                status='pending'
            )
            
            return Response({
                'message': 'NGO created successfully',
                'ngo': {
                    'id': ngo.id,
                    'name': ngo.name,
                    'status': ngo.status
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating NGO: {str(e)}", exc_info=True)
            return Response({'error': f'Failed to create NGO: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NGODetailView(APIView):
    """Manage individual NGO"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def get(self, request, pk):
        """Get NGO details"""
        try:
            ngo = NGOOrganization.objects.get(pk=pk)
            campaigns = ngo.campaigns.all()
            
            ngo_data = {
                'id': ngo.id,
                'name': ngo.name,
                'description': ngo.description,
                'location': ngo.location,
                'founded': ngo.founded,
                'website': ngo.website,
                'contact_email': ngo.contact_email,
                'contact_phone': ngo.contact_phone,
                'impact': ngo.impact,
                'image_url': ngo.image_url,
                'status': ngo.status,
                'registration_date': ngo.registration_date.isoformat(),
                'approved_date': ngo.approved_date.isoformat() if ngo.approved_date else None,
                'approved_by': ngo.approved_by.username if ngo.approved_by else None,
                'rejection_reason': ngo.rejection_reason,
                'is_active': ngo.is_active,
                'campaigns': [{
                    'id': camp.id,
                    'name': camp.name,
                    'description': camp.description,
                    'target_amount': float(camp.target_amount),
                    'raised_amount': float(camp.raised_amount),
                    'start_date': camp.start_date.isoformat(),
                    'end_date': camp.end_date.isoformat() if camp.end_date else None,
                    'is_active': camp.is_active,
                } for camp in campaigns]
            }
            
            return Response(ngo_data, status=status.HTTP_200_OK)
        except NGOOrganization.DoesNotExist:
            return Response({'error': 'NGO not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching NGO: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve NGO'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, pk):
        """Update NGO"""
        try:
            ngo = NGOOrganization.objects.get(pk=pk)
            data = request.data
            
            ngo.name = data.get('name', ngo.name)
            ngo.description = data.get('description', ngo.description)
            ngo.location = data.get('location', ngo.location)
            ngo.founded = data.get('founded', ngo.founded)
            ngo.website = data.get('website', ngo.website)
            ngo.contact_email = data.get('contact_email', ngo.contact_email)
            ngo.contact_phone = data.get('contact_phone', ngo.contact_phone)
            ngo.impact = data.get('impact', ngo.impact)
            ngo.image_url = data.get('image_url', ngo.image_url)
            ngo.is_active = data.get('is_active', ngo.is_active)
            ngo.save()
            
            return Response({'message': 'NGO updated successfully'}, status=status.HTTP_200_OK)
        except NGOOrganization.DoesNotExist:
            return Response({'error': 'NGO not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating NGO: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to update NGO'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, pk):
        """Deactivate NGO (soft delete)"""
        try:
            ngo = NGOOrganization.objects.get(pk=pk)
            ngo.is_active = False
            ngo.save()
            return Response({'message': 'NGO deactivated successfully'}, status=status.HTTP_200_OK)
        except NGOOrganization.DoesNotExist:
            return Response({'error': 'NGO not found'}, status=status.HTTP_404_NOT_FOUND)

class NGOApprovalView(APIView):
    """Approve or reject NGO registrations"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def post(self, request, pk):
        """Approve or reject NGO"""
        try:
            ngo = NGOOrganization.objects.get(pk=pk)
            action = request.data.get('action')  # 'approve' or 'reject'
            rejection_reason = request.data.get('rejection_reason', '')
            
            if action == 'approve':
                ngo.status = 'approved'
                ngo.approved_date = timezone.now()
                ngo.approved_by = request.user
                ngo.rejection_reason = None
                ngo.save()
                return Response({'message': 'NGO approved successfully'}, status=status.HTTP_200_OK)
            
            elif action == 'reject':
                ngo.status = 'rejected'
                ngo.rejection_reason = rejection_reason
                ngo.save()
                return Response({'message': 'NGO rejected successfully'}, status=status.HTTP_200_OK)
            
            elif action == 'suspend':
                ngo.status = 'suspended'
                ngo.is_active = False
                ngo.save()
                return Response({'message': 'NGO suspended successfully'}, status=status.HTTP_200_OK)
            
            else:
                return Response({'error': 'Invalid action. Use approve, reject, or suspend'}, status=status.HTTP_400_BAD_REQUEST)
        except NGOOrganization.DoesNotExist:
            return Response({'error': 'NGO not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error processing NGO approval: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to process approval'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLoginHistoryView(APIView):
    """View user login history"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def get(self, request):
        """Get login history with filters"""
        try:
            user_id = request.query_params.get('user_id', None)
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            
            login_history = UserLoginHistory.objects.all()
            
            if user_id:
                login_history = login_history.filter(user_id=user_id)
            
            if date_from:
                login_history = login_history.filter(login_time__gte=date_from)
            
            if date_to:
                login_history = login_history.filter(login_time__lte=date_to)
            
            history_data = []
            for entry in login_history[:100]:  # Limit to 100 most recent
                # Provide ISO with timezone and unix ms for reliable frontend rendering
                try:
                    login_iso = dj_timezone.localtime(entry.login_time).isoformat()
                except Exception:
                    login_iso = entry.login_time.isoformat()
                try:
                    login_ms = int(entry.login_time.timestamp() * 1000)
                except Exception:
                    login_ms = None

                logout_iso = None
                logout_ms = None
                if entry.logout_time:
                    try:
                        logout_iso = dj_timezone.localtime(entry.logout_time).isoformat()
                    except Exception:
                        logout_iso = entry.logout_time.isoformat()
                    try:
                        logout_ms = int(entry.logout_time.timestamp() * 1000)
                    except Exception:
                        logout_ms = None

                history_data.append({
                    'id': entry.id,
                    'user_id': entry.user.id,
                    'username': entry.user.username,
                    'email': entry.user.email,
                    'login_time_iso': login_iso,
                    'login_time_ms': login_ms,
                    'logout_time_iso': logout_iso,
                    'logout_time_ms': logout_ms,
                    'ip_address': entry.ip_address,
                    'user_agent': entry.user_agent,
                    'session_duration': str(entry.session_duration) if entry.session_duration else None,
                })
            
            return Response({'login_history': history_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching login history: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve login history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DonationManagementView(APIView):
    """Manage donations"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def get(self, request):
        """Get donations with filters"""
        try:
            status_filter = request.query_params.get('status', None)
            ngo_id = request.query_params.get('ngo_id', None)
            user_id = request.query_params.get('user_id', None)
            date_from = request.query_params.get('date_from', None)
            date_to = request.query_params.get('date_to', None)
            
            donations = DonationRecord.objects.all()
            
            if status_filter:
                donations = donations.filter(status=status_filter)
            if ngo_id:
                donations = donations.filter(ngo_id=ngo_id)
            if user_id:
                donations = donations.filter(user_id=user_id)
            if date_from:
                donations = donations.filter(donation_date__gte=date_from)
            if date_to:
                donations = donations.filter(donation_date__lte=date_to)
            
            donations_data = []
            for donation in donations[:100]:  # Limit to 100
                donations_data.append({
                    'id': donation.id,
                    'user_id': donation.user_id,
                    'username': donation.username,
                    'user_email': donation.user_email,
                    'ngo_name': donation.ngo_name,
                    'campaign_name': donation.campaign_name,
                    'campaign_id': donation.campaign_id,
                    'ngo_id': donation.ngo_id,
                    'donation_type': donation.donation_type,
                    'amount': float(donation.amount) if donation.amount else None,
                    'item_type': donation.item_type,
                    'quantity': donation.quantity,
                    'payment_method': donation.payment_method,
                    'status': donation.status,
                    'transaction_id': donation.transaction_id,
                    'donation_date': donation.donation_date.isoformat(),
                })
            
            return Response({'donations': donations_data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching donations: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve donations'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, pk):
        """Update donation status"""
        try:
            donation = DonationRecord.objects.get(pk=pk)
            new_status = request.data.get('status')
            
            if new_status in ['pending', 'completed', 'cancelled', 'refunded']:
                donation.status = new_status
                donation.save()
                return Response({'message': 'Donation status updated'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        except DonationRecord.DoesNotExist:
            return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminDashboardStatsView(APIView):
    """Get admin dashboard statistics"""
    permission_classes = [IsAuthenticated, IsAdminOrModerator]
    
    def get(self, request):
        """Get dashboard stats"""
        try:
            # NGO stats
            total_ngos = NGOOrganization.objects.count()
            pending_ngos = NGOOrganization.objects.filter(status='pending').count()
            approved_ngos = NGOOrganization.objects.filter(status='approved').count()
            rejected_ngos = NGOOrganization.objects.filter(status='rejected').count()
            
            # Donation stats
            total_donations = DonationRecord.objects.count()
            total_amount = DonationRecord.objects.aggregate(Sum('amount'))['amount__sum'] or 0
            completed_donations = DonationRecord.objects.filter(status='completed').count()
            
            # User login stats
            total_logins = UserLoginHistory.objects.count()
            recent_logins = UserLoginHistory.objects.filter(
                login_time__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            stats = {
                'ngos': {
                    'total': total_ngos,
                    'pending': pending_ngos,
                    'approved': approved_ngos,
                    'rejected': rejected_ngos,
                },
                'donations': {
                    'total': total_donations,
                    'total_amount': float(total_amount),
                    'completed': completed_donations,
                },
                'logins': {
                    'total': total_logins,
                    'recent_7_days': recent_logins,
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve stats'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FeedbackView(APIView):
    """View to handle user feedback submissions"""
    
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Feedback submission: {data}")
            
            rating = data.get('rating', 5)
            category = data.get('category', 'general')
            message = data.get('message', '')
            
            if not message or message.strip() == '':
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            feedback = Feedback.objects.create(
                user=request.user if request.user.is_authenticated else None,
                user_email=request.user.email if request.user.is_authenticated else data.get('email', ''),
                user_name=data.get('name') or (request.user.username if request.user.is_authenticated else 'Anonymous'),
                rating=int(rating),
                category=category,
                message=message.strip()
            )
            
            logger.info(f"Feedback created: {feedback.id}")
            
            return Response({
                'message': 'Feedback submitted successfully',
                'feedback_id': feedback.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Feedback submission error: {str(e)}", exc_info=True)
            return Response({'error': f'Feedback submission failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        try:
            permission_classes = [IsAuthenticated, IsAdminOrModerator]
            
            if not request.user.is_authenticated:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
            try:
                admin_profile = request.user.admin_profile
            except AdminUser.DoesNotExist:
                return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
            
            page = int(request.query_params.get('page', 1))
            search = request.query_params.get('search', '')
            category = request.query_params.get('category', '')
            unread_only = request.query_params.get('unread', 'false').lower() == 'true'
            
            feedbacks = Feedback.objects.all()
            
            if unread_only:
                feedbacks = feedbacks.filter(is_read=False)
            
            if search:
                feedbacks = feedbacks.filter(
                    Q(message__icontains=search) |
                    Q(user_name__icontains=search) |
                    Q(user_email__icontains=search)
                )
            
            if category:
                feedbacks = feedbacks.filter(category=category)
            
            total_count = feedbacks.count()
            items_per_page = 20
            total_pages = (total_count + items_per_page - 1) // items_per_page
            
            start = (page - 1) * items_per_page
            end = start + items_per_page
            paginated_feedbacks = feedbacks[start:end]
            
            feedbacks_data = []
            for fb in paginated_feedbacks:
                feedbacks_data.append({
                    'id': fb.id,
                    'user_name': fb.user_name,
                    'user_email': fb.user_email,
                    'rating': fb.rating,
                    'category': fb.category,
                    'message': fb.message,
                    'is_read': fb.is_read,
                    'created_at': fb.created_at.isoformat(),
                    'updated_at': fb.updated_at.isoformat(),
                })
            
            return Response({
                'feedbacks': feedbacks_data,
                'total': total_count,
                'page': page,
                'total_pages': total_pages
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching feedbacks: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve feedbacks'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContactView(APIView):
    """View to handle contact form submissions"""
    
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Contact submission: {data}")
            
            name = data.get('name', '')
            email = data.get('email', '')
            subject = data.get('subject', '')
            message = data.get('message', '')
            
            if not all([name, email, subject, message]):
                return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            contact = Contact.objects.create(
                user=request.user if request.user.is_authenticated else None,
                name=name.strip(),
                email=email.strip(),
                subject=subject.strip(),
                message=message.strip()
            )
            
            logger.info(f"Contact created: {contact.id}")
            
            return Response({
                'message': 'Contact message sent successfully',
                'contact_id': contact.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Contact submission error: {str(e)}", exc_info=True)
            return Response({'error': f'Contact submission failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
            try:
                admin_profile = request.user.admin_profile
            except AdminUser.DoesNotExist:
                return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)
            
            page = int(request.query_params.get('page', 1))
            search = request.query_params.get('search', '')
            unread_only = request.query_params.get('unread', 'false').lower() == 'true'
            
            contacts = Contact.objects.all()
            
            if unread_only:
                contacts = contacts.filter(is_read=False)
            
            if search:
                contacts = contacts.filter(
                    Q(message__icontains=search) |
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(subject__icontains=search)
                )
            
            total_count = contacts.count()
            items_per_page = 20
            total_pages = (total_count + items_per_page - 1) // items_per_page
            
            start = (page - 1) * items_per_page
            end = start + items_per_page
            paginated_contacts = contacts[start:end]
            
            contacts_data = []
            for contact in paginated_contacts:
                contacts_data.append({
                    'id': contact.id,
                    'name': contact.name,
                    'email': contact.email,
                    'subject': contact.subject,
                    'message': contact.message,
                    'is_read': contact.is_read,
                    'response': contact.response,
                    'responded_at': contact.responded_at.isoformat() if contact.responded_at else None,
                    'responded_by': contact.responded_by.username if contact.responded_by else None,
                    'created_at': contact.created_at.isoformat(),
                    'updated_at': contact.updated_at.isoformat(),
                })
            
            return Response({
                'contacts': contacts_data,
                'total': total_count,
                'page': page,
                'total_pages': total_pages
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching contacts: {str(e)}", exc_info=True)
            return Response({'error': 'Failed to retrieve contacts'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
