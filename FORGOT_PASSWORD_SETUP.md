# Forgot Password Implementation - Setup Guide

## ✅ Completed Implementation

### Frontend Changes
1. **auth.html** - Added forgot password UI:
   - "Forgot password?" link in login form
   - Forgot password form (email input)
   - OTP verification form (OTP + new password input)
   - All forms integrated into auth modal

2. **script.js** - Added forgot password functions:
   - `handleForgotPassword(e)` - Sends OTP to email
   - `handleVerifyOTP(e)` - Verifies OTP and resets password
   - Updated `openAuth(mode)` - Supports 'forgot' and 'otp' modes
   - Updated `switchForm(to)` - Routes between login/register/forgot
   - Form event listeners attached in DOMContentLoaded

### Backend Implementation
1. **forgot-password.php** - Two-step password reset:
   - `send-otp` action: Generates 6-digit OTP, sends to email
   - `verify-otp` action: Validates OTP, updates password
   - OTP expires after 10 minutes
   - Passwords hashed with bcrypt

2. **migrate_otp.php** - Database migration helper script

---

## ⚙️ Setup Steps

### Step 1: Run Database Migration

**Option A: Via PHP Migration Script**
```
Visit: http://localhost:8000/Backend/migrate_otp.php
```

**Option B: Manual SQL**
```sql
ALTER TABLE users ADD COLUMN otp VARCHAR(6) NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL DEFAULT NULL;
```

**Option C: Import SQL File**
```bash
mysql -u root gharsewa < Database/add_otp_columns.sql
```

### Step 2: Verify Installation

1. Open login page: http://localhost:8000/Frontend/auth.html
2. Click "Forgot password?" link
3. Enter email and click "Send OTP"
4. Check email for OTP (or check `Backend/otp_log.txt` for testing)
5. Enter OTP and new password, click "Reset Password"

---

## 📝 File Changes Summary

| File | Changes |
|------|---------|
| Frontend/auth.html | Added forgot password forms |
| Frontend/script.js | Added password reset functions |
| Backend/forgot-password.php | NEW - OTP generation and verification |
| Backend/migrate_otp.php | NEW - Database migration helper |
| Database/add_otp_columns.sql | NEW - Migration SQL |
| API_DOCUMENTATION.md | NEW - Full API documentation |

---

## 🧪 Testing the Feature

### Test Flow:
1. **Send OTP**: Use email that exists in users table
2. **Check OTP**: Look in `Backend/otp_log.txt`
3. **Verify**: Enter OTP (expires in 10 minutes)
4. **Reset**: Enter new password (8+ chars, uppercase, lowercase, number)

### Example API Calls:
```bash
# Send OTP
curl -X POST http://localhost:8000/Backend/forgot-password.php \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","action":"send-otp"}'

# Verify OTP (use value from otp_log.txt)
curl -X POST http://localhost:8000/Backend/forgot-password.php \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "otp":"123456",
    "password":"NewPassword123",
    "action":"verify-otp"
  }'
```

---

## 🔐 Security Features

✅ Passwords hashed with bcrypt  
✅ OTP expires after 10 minutes  
✅ Email existence not revealed (prevents user enumeration)  
✅ OTP cleared after successful password reset  
✅ CORS headers enabled for cross-origin requests  
✅ Password requirements enforced (8+ chars, mixed case, numbers)  

---

## 📧 Email Configuration

### Development (Default)
- OTP logged to `Backend/otp_log.txt`
- No email server required for testing

### Production (Configure in forgot-password.php)
```php
// Add SMTP configuration
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'app-password';
```

---

## 📋 Database Schema

New columns added to `users` table:
```sql
otp VARCHAR(6) NULL DEFAULT NULL         -- 6-digit OTP
otp_expiry DATETIME NULL DEFAULT NULL    -- OTP expiration time
```

---

## 🚀 API Reference

See **API_DOCUMENTATION.md** for complete API documentation including:
- All endpoints (login, signup, forgot-password, profile, jobs)
- Request/response formats
- Error handling
- Examples

---

## ⚠️ Troubleshooting

### Issue: OTP not sent
**Solution**: 
- Check `Backend/otp_log.txt` for OTP value (development)
- Verify database columns exist: `SELECT * FROM users LIMIT 1;`
- Ensure user exists in database

### Issue: "Invalid OTP" error
**Solution**:
- Verify OTP hasn't expired (10 minute limit)
- Check exact OTP value from log file
- Ensure email matches in both requests

### Issue: Migration fails
**Solution**:
- Check if columns already exist: `SHOW COLUMNS FROM users;`
- Run migration manually using phpMyAdmin or MySQL CLI
- Verify database connection in config.php

---

## 🎯 Current API Structure

The application uses a **PHP-based REST JSON API**:

```
┌─────────────────────────────────────────┐
│         Frontend (HTML/CSS/JS)          │
│  ├─ auth.html (login/register/forgot)   │
│  ├─ index.html (home)                   │
│  ├─ script.js (logic)                   │
│  └─ style.css (styling)                 │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  PHP REST API       │
        │  (localhost:8000)   │
        ├─ login.php         │
        ├─ signup.php        │
        ├─ forgot-password.php (NEW)
        ├─ profile.php       │
        └─ jobs.php          │
        │
┌───────▼────────────────────────────┐
│   MariaDB (gharsewa database)       │
│   ├─ users table                    │
│   │  ├─ id, fullName, email, phone  │
│   │  ├─ password, role              │
│   │  ├─ otp (NEW)                   │
│   │  └─ otp_expiry (NEW)            │
│   └─ (other tables)                 │
└────────────────────────────────────┘
```

