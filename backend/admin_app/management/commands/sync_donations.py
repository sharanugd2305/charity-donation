"""
Management command to sync donations from main database to admin database
"""
from django.core.management.base import BaseCommand
from django.db import connections
from admin_app.models import DonationRecord
from django.utils import timezone
from datetime import datetime
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Sync donations from main database to admin database'

    def handle(self, *args, **options):
        # Access main database
        main_db = connections['default']
        
        # Query donations from main database
        with main_db.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, user_id, ngo_name, campaign_name, campaign_id, ngo_id,
                    donation_type, amount, item_type, quantity, status,
                    transaction_id, created_at, anonymous
                FROM auth_app_donation
                ORDER BY created_at DESC
            """)
            
            donations = cursor.fetchall()
            self.stdout.write(f'Found {len(donations)} donations in main database')
            
            synced_count = 0
            skipped_count = 0
            
            for donation in donations:
                donation_id, user_id, ngo_name, campaign_name, campaign_id, ngo_id, \
                donation_type, amount, item_type, quantity, status, transaction_id, created_at, anonymous = donation
                
                # Check if already synced
                if DonationRecord.objects.filter(main_donation_id=donation_id).exists():
                    skipped_count += 1
                    continue
                
                # Get user info from main database
                try:
                    with main_db.cursor() as user_cursor:
                        user_cursor.execute("SELECT username, email FROM auth_user WHERE id = %s", [user_id])
                        user_data = user_cursor.fetchone()
                        if user_data:
                            username, email = user_data
                        else:
                            username = f'user_{user_id}'
                            email = ''
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Could not fetch user {user_id}: {str(e)}'))
                    username = f'user_{user_id}'
                    email = ''
                
                # Create donation record in admin database
                try:
                    DonationRecord.objects.create(
                        main_donation_id=donation_id,
                        user_id=user_id,
                        username=username,
                        user_email=email,
                        ngo_name=ngo_name,
                        campaign_name=campaign_name,
                        campaign_id=campaign_id,
                        ngo_id=ngo_id,
                        donation_type=donation_type,
                        amount=amount,
                        item_type=item_type,
                        quantity=quantity,
                        payment_method='upi',  # Default, can be updated
                        status=status,
                        transaction_id=transaction_id,
                        donation_date=created_at if isinstance(created_at, datetime) else timezone.now()
                    )
                    synced_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error syncing donation {donation_id}: {str(e)}'))
            
            self.stdout.write(self.style.SUCCESS(f'Sync complete!'))
            self.stdout.write(self.style.SUCCESS(f'Synced: {synced_count} donations'))
            self.stdout.write(self.style.WARNING(f'Skipped: {skipped_count} donations (already synced)'))

