import os
import django
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from admin_app.models import NGOOrganization, DonationRecord, UserLoginHistory

def read_dashboard():
    print("\n" + "="*40)
    print("ADMIN DASHBOARD STATISTICS")
    print("="*40)

    # NGO Stats
    total_ngos = NGOOrganization.objects.count()
    pending_ngos = NGOOrganization.objects.filter(status='pending').count()
    approved_ngos = NGOOrganization.objects.filter(status='approved').count()
    rejected_ngos = NGOOrganization.objects.filter(status='rejected').count()

    print(f"\n[NGOs]")
    print(f"Total:    {total_ngos}")
    print(f"Pending:  {pending_ngos}")
    print(f"Approved: {approved_ngos}")
    print(f"Rejected: {rejected_ngos}")

    # Donation Stats
    total_donations = DonationRecord.objects.count()
    total_amount = DonationRecord.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    completed_donations = DonationRecord.objects.filter(status='completed').count()

    print(f"\n[Donations]")
    print(f"Total Count:  {total_donations}")
    print(f"Total Amount: INR {total_amount:,.2f}")
    print(f"Completed:    {completed_donations}")

    # Login Stats
    total_logins = UserLoginHistory.objects.count()
    recent_logins = UserLoginHistory.objects.filter(
        login_time__gte=timezone.now() - timedelta(days=7)
    ).count()

    print(f"\n[System]")
    print(f"Total Logins: {total_logins}")
    print(f"Recent (7d):  {recent_logins}")
    print("\n" + "="*40 + "\n")

if __name__ == "__main__":
    read_dashboard()
