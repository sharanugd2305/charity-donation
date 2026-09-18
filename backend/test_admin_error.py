import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from admin_app.models import AdminUser
from django.contrib.auth.models import User

def test_admin_user_admin():
    print("Testing AdminUser Access...")
    
    # 1. Fetch all AdminUsers
    try:
        admin_users = AdminUser.objects.using('admin_db').all()
        print(f"Found {admin_users.count()} AdminUser(s).")
        
        for admin_user in admin_users:
            print(f"\nAdminUser ID: {admin_user.id}")
            print(f"  Role: {admin_user.role}")
            print(f"  User ID (FK): {admin_user.user_id}")
            
            # 2. Try to access the related User object
            try:
                user = admin_user.user
                print(f"  [SUCCESS] Linked User: {user.username} (ID: {user.id})")
            except Exception as e:
                print(f"  [FAIL] Error accessing related user: {e}")
                
                # 3. Manual Fetch as fallback test
                try:
                    user = User.objects.using('default').get(id=admin_user.user_id)
                    print(f"  [MANUAL] User found in default db: {user.username}")
                except Exception as e2:
                    print(f"  [MANUAL FAIL] User lookup failed: {e2}")

    except Exception as e:
        print(f"Error querying AdminUser: {e}")

if __name__ == '__main__':
    test_admin_user_admin()
