from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from admin_app.models import AdminUser

class Command(BaseCommand):
    help = 'Create an admin user for the admin backend'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Admin username')
        parser.add_argument('--email', type=str, required=True, help='Admin email')
        parser.add_argument('--password', type=str, required=True, help='Admin password')
        parser.add_argument('--role', type=str, default='admin', choices=['super_admin', 'admin', 'moderator'], help='Admin role')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        role = options['role']
        
        # Create or get user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email}
        )
        
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'User "{username}" created successfully'))
        else:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists, password updated'))
        
        # Create or update admin profile
        admin_profile, created = AdminUser.objects.get_or_create(
            user=user,
            defaults={'role': role}
        )
        
        if not created:
            admin_profile.role = role
            admin_profile.is_active = True
            admin_profile.save()
            self.stdout.write(self.style.WARNING(f'Admin profile for "{username}" updated'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Admin profile for "{username}" created with role "{role}"'))
        
        self.stdout.write(self.style.SUCCESS(f'Admin user setup complete!'))
        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Role: {role}'))


