"""
Custom admin site configuration for better organization
"""
from django.contrib import admin
from django.contrib.admin import AdminSite

class CharityAdminSite(AdminSite):
    site_header = "Charity Donation Admin Panel"
    site_title = "Admin Panel"
    index_title = "Welcome to Charity Donation Administration"

# You can use this custom site if you want a completely separate admin interface
# charity_admin_site = CharityAdminSite(name='charity_admin')


