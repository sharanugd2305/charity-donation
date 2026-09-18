#!/usr/bin/env python
"""
Quick setup script for admin panel
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth.models import User
from admin_app.models import AdminUser

def create_superuser():
    """Create a superuser for Django admin"""
    username = input("Enter admin username (default: admin): ").strip() or "admin"
    email = input("Enter admin email (default: admin@example.com): ").strip() or "admin@example.com"
    password = input("Enter admin password (default: admin123): ").strip() or "admin123"
    
    # Create or get user
    user, created = User.objects.using('default').get_or_create(
        username=username,
        defaults={'email': email, 'is_staff': True, 'is_superuser': True}
    )
    
    if created:
        user.set_password(password)
        user.save(using='default')
        print(f"✓ Superuser '{username}' created successfully!")
    else:
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using='default')
        print(f"✓ Superuser '{username}' updated successfully!")
    
    # Also create AdminUser profile
    admin_profile, created = AdminUser.objects.using('admin_db').get_or_create(
        user=user,
        defaults={'role': 'super_admin', 'is_active': True}
    )
    
    if not created:
        admin_profile.role = 'super_admin'
        admin_profile.is_active = True
        admin_profile.save(using='admin_db')
        print(f"✓ Admin profile for '{username}' updated!")
    else:
        print(f"✓ Admin profile for '{username}' created!")
    
    print("\n" + "="*50)
    print("Admin Panel Setup Complete!")
    print("="*50)
    print(f"Username: {username}")
    print(f"Password: {password}")
    print(f"\nAccess admin panel at: http://localhost:8001/admin/")
    print("="*50)

if __name__ == '__main__':
    create_superuser()


