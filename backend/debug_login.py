import os
import django
from django.contrib.auth import authenticate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth.models import User
from admin_app.models import AdminUser

def debug_users():
    print("\n=== Debugging Users and Admin Profiles ===")
    
    users = User.objects.all()
    print(f"Found {users.count()} users in 'default' database.")
    
    for user in users:
        print(f"\nUser: {user.username} (ID: {user.id})")
        print(f"  Email: {user.email}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Pass: {user.password[:20]}...")

        # Try to access reverse relation
        try:
            # This relies on Django's routing to find AdminUser in admin_db
            # because we defined the relation in AdminUser
            profile = user.admin_profile 
            print(f"  [SUCCESS] Admin Profile found via related_name!")
            print(f"    Role: {profile.role}")
            print(f"    Is Active: {profile.is_active}")
        except Exception as e:
            print(f"  [FAIL] Could not access user.admin_profile: {e}")
            
            # Try manual lookup in admin_db
            try:
                profile = AdminUser.objects.using('admin_db').get(user_id=user.id)
                print(f"  [SUCCESS] Admin Profile found via MANUAL lookup in admin_db!")
                print(f"    Role: {profile.role}")
            except AdminUser.DoesNotExist:
                print(f"  [FAIL] No AdminUser found in admin_db for user_id={user.id}")

if __name__ == '__main__':
    debug_users()
