-- Add OTP support to users table for password reset functionality
ALTER TABLE users ADD COLUMN otp VARCHAR(6) NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL DEFAULT NULL;
