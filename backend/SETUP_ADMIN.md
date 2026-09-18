# Admin Backend Setup Guide

## Quick Setup

### Step 1: Run Migrations
```bash
cd donation/backend
python manage.py migrate --database=admin_db
```

### Step 2: Create Admin User
```bash
python manage.py create_admin_user --username admin --email admin@example.com --password admin123 --role super_admin
```

### Step 3: Sync Existing Donations (Optional)
```bash
python manage.py sync_donations
```

### Step 4: Run Admin Server on Different Port
```bash
# Option 1: Using the script
python run_admin_server.py

# Option 2: Direct command
python manage.py runserver 8001
```

## Access Points

- **Main Application**: http://localhost:8000
- **Admin Backend API**: http://localhost:8001/api/admin/
- **Django Admin Panel**: http://localhost:8001/admin/

## Testing the API

### 1. Login as Admin
```bash
curl -X POST http://localhost:8001/api/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Response will include a token:
```json
{
  "token": "your_token_here",
  "username": "admin",
  "role": "super_admin",
  "user_id": 1
}
```

### 2. Get Dashboard Stats
```bash
curl -X GET http://localhost:8001/api/admin/dashboard/stats/ \
  -H "Authorization: Token your_token_here"
```

### 3. List NGOs
```bash
curl -X GET http://localhost:8001/api/admin/ngos/?status=pending \
  -H "Authorization: Token your_token_here"
```

### 4. Approve an NGO
```bash
curl -X POST http://localhost:8001/api/admin/ngos/1/approval/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

## Admin Roles

- **super_admin**: Full access to all features
- **admin**: Can manage NGOs, view donations and login history
- **moderator**: Limited access for content moderation

## Database

The admin backend uses a separate database: `admin_db.sqlite3`

This ensures complete data isolation from the main application database.


