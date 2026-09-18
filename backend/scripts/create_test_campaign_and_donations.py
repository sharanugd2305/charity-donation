import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE','settings')
django.setup()
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from admin_app.models import NGOOrganization, NGOCampaign
from auth_app.models import Donation
from django.test import Client

username = 'test_demo_user'
email = 'test_demo@example.com'
password = 'demo_pass_123'
user, created = User.objects.get_or_create(username=username, defaults={'email': email})
if created:
    user.set_password(password)
    user.save()

# Ensure NGOOrganization exists
ngo, _ = NGOOrganization.objects.get_or_create(name='Demo NGO', defaults={'description':'Demo NGO','location':'Test','status':'approved'})

# Create campaign with explicit target_amount
campaign, camp_created = NGOCampaign.objects.get_or_create(name='Demo Campaign', ngo=ngo, defaults={'description':'Demo campaign','target_amount':50000.0,'raised_amount':0.0,'is_active':True})
if not camp_created:
    campaign.target_amount = 50000.0
    campaign.save()

# Create two donations for this user and campaign
Donation.objects.create(user=user, ngo_name=ngo.name, campaign_name=campaign.name, campaign_id=campaign.id, ngo_id=ngo.id, donation_type='money', amount=5000.0, transaction_id='tx1', status='completed')
Donation.objects.create(user=user, ngo_name=ngo.name, campaign_name=campaign.name, campaign_id=campaign.id, ngo_id=ngo.id, donation_type='money', amount=15000.0, transaction_id='tx2', status='completed')

# Update campaign raised_amount from Donation records
from django.db.models import Sum
raised = Donation.objects.filter(campaign_id=campaign.id, status='completed', donation_type='money').aggregate(total=Sum('amount'))['total'] or 0
campaign.raised_amount = raised
campaign.save()

# Create token for user
token, _ = Token.objects.get_or_create(user=user)

print('Created user:', user.username, 'token:', token.key)

# Call /api/impact/ as this user
c = Client()
resp = c.get('/api/impact/', HTTP_AUTHORIZATION=f'Token {token.key}')
print('status', resp.status_code)
print(resp.content.decode())
