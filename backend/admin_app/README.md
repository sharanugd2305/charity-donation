# Admin Backend System

This is a standalone admin backend system for managing the charity donation platform. It uses a separate database (`admin_db.sqlite3`) from the main application.

## Features

- **NGO Management**: Review, approve, reject, and manage NGO organization registrations
- **User Login History**: View and manage users' login history with timestamps and IP addresses
- **Donation Management**: View and manage all donations with filtering capabilities
- **Role-Based Access Control**: Three admin roles (super_admin, admin, moderator)
- **Separate Database**: Uses `admin_db.sqlite3` for complete data isolation

## Setup Instructions

### 1. Run Migrations

```bash
cd donation/backend
python manage.py migrate --database=admin_db
```

### 2. Create Admin User

```bash
python manage.py create_admin_user --username admin --email admin@example.com --password admin123 --role super_admin
```

Available roles:
- `super_admin`: Full access to all features
- `admin`: Can manage NGOs, view donations and login history
- `moderator`: Limited access, can view and moderate content

### 3. Sync Donations from Main Database

To sync existing donations from the main database:

```bash
python manage.py sync_donations
```

This command will copy all donations from the main database to the admin database.

## API Endpoints

### Authentication
- `POST /api/admin/login/` - Admin login

### Dashboard
- `GET /api/admin/dashboard/stats/` - Get dashboard statistics

### NGO Management
- `GET /api/admin/ngos/` - List all NGOs (with filters: ?status=pending&search=keyword)
- `POST /api/admin/ngos/` - Create new NGO
- `GET /api/admin/ngos/<id>/` - Get NGO details
- `PUT /api/admin/ngos/<id>/` - Update NGO
- `DELETE /api/admin/ngos/<id>/` - Deactivate NGO
- `POST /api/admin/ngos/<id>/approval/` - Approve/reject/suspend NGO
  ```json
  {
    "action": "approve",  // or "reject" or "suspend"
    "rejection_reason": "Optional reason for rejection"
  }
  ```

### Login History
- `GET /api/admin/login-history/` - Get login history
  - Filters: `?user_id=1&date_from=2024-01-01&date_to=2024-12-31`

### Donation Management
- `GET /api/admin/donations/` - List all donations
  - Filters: `?status=completed&ngo_id=1&user_id=2&date_from=2024-01-01&date_to=2024-12-31`
- `PUT /api/admin/donations/<id>/` - Update donation status
  ```json
  {
    "status": "completed"  // or "pending", "cancelled", "refunded"
  }
  ```

## Running on Different Port

To run the admin backend on a different port (e.g., 8001):

```bash
python manage.py runserver 8001
```

Or create a separate settings file and run:

```bash
python manage.py runserver 8001 --settings=admin_settings
```

## Database Structure

The admin backend uses `admin_db.sqlite3` which contains:
- `AdminUser`: Admin user profiles with roles
- `NGOOrganization`: NGO registration and management
- `NGOCampaign`: Campaigns for each NGO
- `UserLoginHistory`: User login tracking
- `DonationRecord`: Synced donation records

## Permissions

- `IsAdminUser`: User must have an active admin profile
- `IsSuperAdmin`: User must be a super_admin
- `IsAdminOrModerator`: User must be admin, moderator, or super_admin

## Example API Usage

### Login
```bash
curl -X POST http://localhost:8000/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get NGOs
```bash
curl -X GET http://localhost:8000/api/admin/ngos/?status=pending \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Approve NGO
```bash
curl -X POST http://localhost:8000/api/admin/ngos/1/approval/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```


