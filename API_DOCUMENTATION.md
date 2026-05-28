# Ghar Sewa - API Documentation

## Current API Structure

The application uses a **PHP-based REST API** with JSON communication.

### API Endpoint Pattern
- **Base URL**: `http://localhost:8000/Backend/` (or configured backend URL)
- **Protocol**: POST/GET with JSON
- **Response Format**: JSON

### Current API Endpoints

#### 1. **Authentication**

##### Login
- **Endpoint**: `login.php`
- **Method**: POST
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123",
    "role": "customer|provider|admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "fullName": "Ram Bahadur",
      "email": "ram@example.com",
      "phone": "9841234567",
      "role": "customer"
    }
  }
  ```

##### Signup
- **Endpoint**: `signup.php`
- **Method**: POST
- **Payload**:
  ```json
  {
    "fullName": "Ram Bahadur",
    "email": "ram@example.com",
    "phone": "9841234567",
    "password": "Password123",
    "role": "customer|provider|admin",
    "category": "Plumber"
  }
  ```
- **Response**: Same as Login endpoint

##### Forgot Password - Send OTP
- **Endpoint**: `forgot-password.php`
- **Method**: POST
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "action": "send-otp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent to email",
    "email": "user@example.com"
  }
  ```

##### Forgot Password - Verify OTP & Reset
- **Endpoint**: `forgot-password.php`
- **Method**: POST
- **Payload**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "password": "NewPassword123",
    "action": "verify-otp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```

#### 2. **Profile Management**
- **Endpoint**: `profile.php?action=save` or `profile.php?action=get&userId={id}`
- **Method**: POST/GET
- **Usage**: Save and retrieve user profile data

#### 3. **Jobs**
- **Endpoint**: `jobs.php?action=create` or `jobs.php?action=list`
- **Method**: POST/GET
- **Usage**: Create and search job postings

---

## Setup Instructions

### Step 1: Add OTP Columns to Database

Run the migration SQL:
```sql
ALTER TABLE users ADD COLUMN otp VARCHAR(6) NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL DEFAULT NULL;
```

Or execute the migration file:
```bash
mysql -u root -p gharsewa < Database/add_otp_columns.sql
```

### Step 2: Backend Requirements

The backend uses:
- PHP 7.2+
- MariaDB/MySQL with a `users` table
- Native PHP `mail()` function (or configure SMTP)

### Step 3: Frontend Integration

The forgot password flow is integrated into `auth.html`:
1. User clicks "Forgot password?" link
2. Enters email → Backend sends OTP to email
3. User enters OTP + new password → Password reset

### Step 4: Email Configuration (Optional)

For production, configure SMTP in `forgot-password.php`:
```php
// Add after mail() call
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'app-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;
```

---

## Frontend Implementation

### Key Functions in script.js

1. **handleForgotPassword(e)** - Send OTP to email
2. **handleVerifyOTP(e)** - Verify OTP and reset password
3. **openAuth(mode)** - Updated to support 'forgot' and 'otp' modes
4. **switchForm(to)** - Route between login, register, and forgot password

### OTP Generation

- **Length**: 6 digits (000000 - 999999)
- **Expiry**: 10 minutes
- **Delivery**: Email (logged to `otp_log.txt` for development)
- **Storage**: `users.otp` and `users.otp_expiry` columns

---

## Testing the Feature

### Test Case 1: Send OTP
```bash
curl -X POST http://localhost:8000/Backend/forgot-password.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gharsewa.com","action":"send-otp"}'
```

### Test Case 2: Verify OTP
```bash
curl -X POST http://localhost:8000/Backend/forgot-password.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gharsewa.com","otp":"123456","password":"NewPass123","action":"verify-otp"}'
```

### Check OTP Log
```bash
cat Backend/otp_log.txt
```

---

## Security Notes

- ✅ Passwords are hashed using bcrypt
- ✅ OTP expires after 10 minutes
- ✅ Email existence is not revealed (prevents user enumeration)
- ✅ Password reset clears OTP after successful verification
- ✅ CORS headers enabled for cross-origin requests

---

## Troubleshooting

### OTP not received
- Check `Backend/otp_log.txt` for OTP value
- Verify `users.otp` and `users.otp_expiry` columns exist
- Check mail server configuration

### "Invalid OTP" error
- Verify OTP hasn't expired (10 minute limit)
- Check OTP value matches exactly (case-sensitive)

### Password reset fails
- Ensure password meets requirements: 8+ chars, uppercase, lowercase, number
- Check database connection in `config.php`

