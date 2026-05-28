# Backend Setup Instructions

## Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server (or XAMPP/WAMP/MAMP)

## Installation Steps

### 1. Database Setup
1. Open phpMyAdmin or MySQL command line
2. Import the database structure:
   ```sql
   mysql -u root -p < database.sql
   ```
   Or manually execute the SQL in `database.sql`

### 2. Configure Database Connection
Edit `config.php` and update the database credentials if needed:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password
define('DB_NAME', 'Ghar sewa');
```

### 3. Server Setup

#### Option A: Using XAMPP
1. Copy the entire `Project-V` folder to `C:\xampp\htdocs\`
2. Start Apache and MySQL from XAMPP Control Panel
3. Access the application at: `http://localhost/Project-V/Frontend/index.html`

#### Option B: Using PHP Built-in Server
```bash
cd C:\Users\kusha\OneDrive\Desktop\Project-V
php -S localhost:8000 -t .
```
Access at: `http://localhost:8000/Frontend/index.html`

### 4. Update Frontend API URL
If using a different port or domain, update the `API_URL` in `Frontend/script.js`:
```javascript
const API_URL = 'http://localhost/Project-V/Backend';
```

### 5. Configure OTP Email Delivery
To send real password reset OTP emails, create `Backend/.env` from `Backend/.env.example` and set your SMTP credentials there.

Example:
```env
GHARSEWA_SMTP_HOST=smtp.gmail.com
GHARSEWA_SMTP_PORT=587
GHARSEWA_SMTP_USER=your-email@gmail.com
GHARSEWA_SMTP_PASS=your-gmail-app-password
GHARSEWA_MAIL_FROM=your-email@gmail.com
GHARSEWA_MAIL_FROM_NAME=Ghar Sewa
GHARSEWA_BREVO_API_KEY=
```

Notes:
- Use a Gmail App Password if you are using Gmail.
- Optional: add a Brevo API key. The backend tries Brevo first, then SMTP, then PHP mail.
- Keep `Backend/.env` out of version control.
- If SMTP credentials are missing, the backend falls back to logging OTPs in `Backend/otp_log.txt`.

## API Endpoints

### POST `/Backend/signup.php`
Register a new user
```json
{
  "fullName": "Ram Bahadur",
  "email": "ram@example.com",
  "phone": "+977 9812345678",
  "password": "password123",
  "role": "customer" // or "provider" or "admin"
}
```

### POST `/Backend/login.php`
Authenticate user
```json
{
  "email": "ram@example.com",
  "password": "password123"
}
```

### POST `/Backend/profile.php?action=save`
Save or update user profile details
```json
{
  "userId": 1,
  "skills": "Electrical wiring, diagnostics",
  "qualifications": "Diploma in Electrical Engineering",
  "jobPreferences": "Kathmandu, full-time",
  "hiringRequirements": "2+ years field experience"
}
```

### GET `/Backend/profile.php?action=get&userId=1`
Get profile details for a user

### POST `/Backend/jobs.php?action=create`
Create a new job listing (provider/admin only)
```json
{
  "providerId": 1,
  "title": "Field Technician",
  "description": "Install and maintain systems",
  "requirements": "Electrical basics",
  "applicationInstructions": "Submit profile and phone",
  "location": "Kathmandu",
  "industry": "Home Service",
  "experienceLevel": "entry"
}
```

### GET `/Backend/jobs.php?action=list`
Search job listings with optional filters:
- `q`
- `location`
- `industry`
- `experienceLevel`

## Database Schema

### `users` Table
- `id` (PRIMARY KEY)
- `full_name`
- `email` (UNIQUE)
- `phone`
- `password` (hashed)
- `role` (customer/provider/admin)
- `created_at`
- `updated_at`

### `service_providers` Table
- `id` (PRIMARY KEY)
- `user_id` (FOREIGN KEY → users.id)
- `category`
- `experience_years`
- `hourly_rate`
- `rating`
- `total_reviews`
- `bio`
- `location`
- `is_verified`
- `created_at`

### `user_profiles` Table
- `id` (PRIMARY KEY)
- `user_id` (UNIQUE, FOREIGN KEY → users.id)
- `skills`
- `qualifications`
- `job_preferences`
- `hiring_requirements`
- `created_at`
- `updated_at`

### `job_listings` Table
- `id` (PRIMARY KEY)
- `provider_id` (FOREIGN KEY → users.id)
- `title`
- `description`
- `requirements`
- `application_instructions`
- `location`
- `industry`
- `experience_level`
- `status`
- `created_at`
- `updated_at`

## Security Features
- Password hashing using PHP's `password_hash()`
- SQL injection protection using prepared statements
- Email validation
- CORS headers for local development
- Input sanitization

## Troubleshooting

### "Database connection failed"
- Check MySQL service is running
- Verify database credentials in `config.php`
- Ensure `Ghar sewa` database exists

### "CORS policy error"
- Ensure you're accessing via proper URL (not file://)
- Check CORS headers in `config.php`

### "Email already registered"
- User with that email already exists
- Use different email or reset database
