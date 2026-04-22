# Email Configuration and Feedback Setup Guide

## Overview
The feedback form now integrates with Nodemailer to send emails. The backend will:
1. Send a confirmation email to the user
2. Send the feedback details to your admin email

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration (SMTP Settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
FEEDBACK_EMAIL_RECIPIENT=your_business_email@gmail.com
```

## Setup Instructions

### Option 1: Using Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Google Account
   - Go to myaccount.google.com
   - Click "Security" in the left sidebar
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Copy this password

3. **Add to .env**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_password
   FEEDBACK_EMAIL_RECIPIENT=admin@speakify.com
   ```

### Option 2: Using Other Email Providers

Get SMTP credentials from your email provider:

**Common SMTP Servers:**
- Gmail: smtp.gmail.com (port 587)
- Outlook: smtp.office365.com (port 587)
- SendGrid: smtp.sendgrid.net (port 587)
- AWS SES: email-smtp.[region].amazonaws.com (port 587)

Then configure in .env:
```env
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
FEEDBACK_EMAIL_RECIPIENT=admin_email
```

## API Endpoint

### Submit Feedback
- **URL:** `/api/v1/feedback/submit`
- **Method:** POST
- **Content-Type:** application/json

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great course! Very informative."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully. Confirmation email sent.",
  "data": {
    "adminEmailId": "message-id-1",
    "userEmailId": "message-id-2"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## Validation Rules

- **Name:** Required, 2-100 characters
- **Email:** Required, valid email format
- **Message:** Required, 10-2000 characters

## Features

✅ Sends confirmation email to user  
✅ Sends feedback details to admin email  
✅ Input validation on both frontend and backend  
✅ HTML formatted emails with professional styling  
✅ Error handling and logging  
✅ Rate limiting ready (can be added)  

## Testing

Use curl or Postman to test:

```bash
curl -X POST http://localhost:5000/api/v1/feedback/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test feedback message"
  }'
```

## Troubleshooting

### "Failed to send feedback email"
- Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD in .env
- Make sure credentials are correct
- For Gmail: Verify you used App Password (not regular password)

### "Bad credentials"
- Verify EMAIL_USER and EMAIL_PASSWORD/EMAIL_PASS match
- Gmail: Regenerate App Password and try again
- Check for extra spaces in .env values

### Emails not being received
- Check FEEDBACK_EMAIL_RECIPIENT is correct
- Check spam folder
- Verify EMAIL_USER address is valid

## Security Notes

⚠️ Never commit .env file to version control  
⚠️ Use App Passwords for Gmail, not your account password  
⚠️ Store all credentials securely  
⚠️ Consider adding rate limiting for production  

## Next Steps

1. Add credentials to `.env` file
2. Test the endpoint with curl or Postman
3. Update frontend to call the API (see frontend integration guide)
4. Monitor email delivery in production
