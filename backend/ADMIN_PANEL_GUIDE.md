# Django Admin Panel Setup Guide

## Quick Setup

### Step 1: Run Migrations
```bash
cd donation/backend
python manage.py migrate --database=admin_db
python manage.py migrate  # For main database (includes User model)
```

### Step 2: Create Superuser for Admin Panel
```bash
# Option 1: Using Django's createsuperuser
python manage.py createsuperuser

# Option 2: Using our setup script
python setup_admin_panel.py

# Option 3: Using management command
python manage.py create_admin_user --username admin --email admin@example.com --password admin123 --role super_admin
```

**Important**: After creating the user, make sure they have `is_staff=True` and `is_superuser=True`:
```python
python manage.py shell
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='admin')
>>> user.is_staff = True
>>> user.is_superuser = True
>>> user.save()
```

### Step 3: Run Server
```bash
python manage.py runserver 8001
```

### Step 4: Access Admin Panel
Open your browser and go to: **http://localhost:8001/admin/**

Login with your superuser credentials.

## Admin Panel Features

The admin panel includes:

### 1. **Admin Users** (`AdminUser`)
- Manage admin user roles (super_admin, admin, moderator)
- Activate/deactivate admin accounts
- View who created each admin

### 2. **NGO Organizations** (`NGOOrganization`)
- View all NGO registrations
- Approve/reject/suspend NGOs
- Edit NGO details
- See status badges (Pending, Approved, Rejected, Suspended)
- View campaign count for each NGO
- Filter by status, date, location

### 3. **NGO Campaigns** (`NGOCampaign`)
- Manage campaigns for each NGO
- View progress bars showing funding progress
- Set target and raised amounts
- Activate/deactivate campaigns

### 4. **User Login History** (`UserLoginHistory`)
- View all user login records
- See IP addresses and user agents
- Track session durations
- Filter by date and user
- **Read-only** (automatically created on login)

### 5. **Donation Records** (`DonationRecord`)
- View all donations
- Filter by status, type, date, NGO, user
- Update donation status
- Bulk actions: Mark as completed/cancelled/refunded
- See amount with color coding
- **Read-only** (synced from main database)

## Admin Panel Features

- **Color-coded status badges** for easy visual identification
- **Progress bars** for campaign funding
- **Date hierarchy** for easy date-based filtering
- **Search functionality** across all models
- **Bulk actions** for efficient management
- **Recent actions** panel showing your activity history
- **Custom list displays** with formatted data

## Customization

The admin panel is fully customizable. You can:
- Add custom actions
- Create custom views
- Add filters and search fields
- Customize the appearance
- Add inline editing

## Troubleshooting

### Can't access admin panel?
1. Make sure user has `is_staff=True` and `is_superuser=True`
2. Check that migrations are run: `python manage.py migrate --database=admin_db`
3. Verify server is running on port 8001

### Models not showing?
1. Check that `admin_app` is in `INSTALLED_APPS` in settings.py
2. Verify models are registered in `admin_app/admin.py`
3. Run migrations: `python manage.py migrate --database=admin_db`

### Database errors?
1. Make sure admin_db database exists
2. Run migrations: `python manage.py migrate --database=admin_db`
3. Check database router configuration in settings.py


