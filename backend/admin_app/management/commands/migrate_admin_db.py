from django.core.management.base import BaseCommand
from django.db import connections, transaction
from admin_app.models import DonationRecord, AdminUser, NGOOrganization, NGOCampaign, UserLoginHistory

class Command(BaseCommand):
    help = 'Migrate all admin_app data from admin_db.sqlite3 to db.sqlite3'

    def handle(self, *args, **options):
        # Connect to old admin_db
        admin_db = connections['old_admin']
        models = [
            (DonationRecord, 'admin_app_donationrecord'),
            (AdminUser, 'admin_app_adminuser'),
            (NGOOrganization, 'admin_app_ngoorganization'),
            (NGOCampaign, 'admin_app_ngocampaign'),
            (UserLoginHistory, 'admin_app_userloginhistory'),
        ]
        for model, table in models:
            with admin_db.cursor() as cursor:
                cursor.execute(f'SELECT * FROM {table}')
                rows = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                self.stdout.write(f'Migrating {len(rows)} records from {table}...')
                for row in rows:
                    data = dict(zip(columns, row))
                    # Remove id to let Django auto-assign
                    data.pop('id', None)
                    try:
                        with transaction.atomic():
                            model.objects.create(**data)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error: {e}'))
        self.stdout.write(self.style.SUCCESS('Migration complete!'))
