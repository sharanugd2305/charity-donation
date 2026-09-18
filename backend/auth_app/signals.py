from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Donation
from admin_app.models import DonationRecord
from django.contrib.auth.models import User

@receiver(post_save, sender=Donation)
def sync_donation_to_admin_db(sender, instance, created, **kwargs):
    """
    Automatically sync new donations to the admin database
    """
    try:
        # Get user details
        user = instance.user
        username = user.username
        email = user.email
        
        # Create or update DonationRecord in admin_db
        DonationRecord.objects.using('admin_db').update_or_create(
            main_donation_id=instance.id,
            defaults={
                'user_id': user.id,
                'username': username,
                'user_email': email,
                'ngo_name': instance.ngo_name,
                'campaign_name': instance.campaign_name,
                'campaign_id': instance.campaign_id,
                'ngo_id': instance.ngo_id,
                'donation_type': instance.donation_type,
                'amount': instance.amount,
                'item_type': instance.item_type,
                'quantity': instance.quantity,
                'status': instance.status,
                'transaction_id': instance.transaction_id,
                'donation_date': instance.created_at,
                # 'payment_method': 'upi' # Default is already set in model
            }
        )
        print(f"Successfully synced donation {instance.id} to admin database")
    except Exception as e:
        print(f"Error syncing donation to admin db: {str(e)}")
