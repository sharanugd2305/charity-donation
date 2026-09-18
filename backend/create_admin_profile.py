import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth.models import User
from admin_app.models import AdminUser

def create_admin_profile():
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        print("Usage: python create_admin_profile.py <username> [role]")
        print("Attempting to fix user 'xyz' as default...")
        username = 'xyz'
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        print(f"Error: User '{username}' not found.")
        return

    print(f"Found user: {user.username} (ID: {user.id})")
    
    # Check if profile exists
    try:
        profile = AdminUser.objects.using('admin_db').get(user_id=user.id)
        print(f"User already has an admin profile with role: {profile.role}")
        return
    except AdminUser.DoesNotExist:
        pass

    if len(sys.argv) > 2:
        role = sys.argv[2]
    else:
        role = 'admin'
    
    try:
        admin_user = AdminUser(
            user_id=user.id,
            role=role,
            is_active=True
        )
        admin_user.save(using='admin_db')
        
        # Ensure user is staff
        if not user.is_staff:
            user.is_staff = True
            user.save()
            print("Updated user to staff status.")
            
        print(f"Successfully created AdminUser profile for '{username}'!")
        
    except Exception as e:
        print(f"Error creating profile: {e}")

if __name__ == '__main__':
    create_admin_profile()
