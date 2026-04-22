# Feedback Form Integration Guide

## Frontend to Backend Connection

The feedback form has been integrated to send emails using the backend API.

## Frontend Configuration

### Environment Variables

Add to your `.env.local` or `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

For production, use your production backend URL:
```env
VITE_BACKEND_URL=https://api.yourdomain.com
```

### Updated Form Handling

The feedback form in `home-page.jsx` now:

1. **Validates input** on the client side using HTML5 validation
2. **Sends data to backend** via POST request to `/api/v1/feedback/submit`
3. **Handles responses** and shows success/error messages
4. **Clears form** on successful submission
5. **Provides user feedback** with loading state

## How It Works

### Request Flow

```
User fills form → Frontend validates → POST to /api/v1/feedback/submit
↓
Backend validates again → Prepares email
↓
Sends 2 emails:
  1. Confirmation to user
  2. Feedback details to admin
↓
Returns success/error response → Frontend shows message
```

### API Request Example

```javascript
fetch('http://localhost:5000/api/v1/feedback/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Your feedback here...'
  })
})
```

## Frontend Code Changes

The `handleSubmit` function in FeedbackForm now:

```javascript
const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/feedback/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (data.success) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } else {
      setSubmitStatus('error');
    }

    setTimeout(() => setSubmitStatus(null), 3000);
  } catch (error) {
    console.error('Error:', error);
    setSubmitStatus('error');
    setTimeout(() => setSubmitStatus(null), 3000);
  } finally {
    setIsSubmitting(false);
  }
}, [formData]);
```

## Testing the Integration

### Step 1: Start Backend Server
```bash
cd backend
npm install  # If nodemailer not installed yet
npm run dev
```

### Step 2: Start Frontend Server
```bash
cd frontend
npm run dev
```

### Step 3: Test the Feedback Form
1. Navigate to home page
2. Scroll to "Feedback Form" section
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Message: "This is a test feedback"
4. Click "Send Feedback"
5. Should see "Thank you" success message
6. Check both your email and admin email for messages

### Step 4: Check Logs
- Frontend console (F12): Should show successful request
- Backend console: Should show email sending logs

## Error Handling

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS Error | Check CORS_ORIGIN in backend .env |
| 404 Error | Verify backend is running on correct port |
| Email not sending | Check EMAIL_HOST, EMAIL_PORT, credentials in .env |
| Validation error | Check all fields meet requirements |
| Network error | Verify backend URL in VITE_BACKEND_URL |

## Security Considerations

✅ **Backend validates** all input again (not just frontend)  
✅ **CORS enabled** for specified origins only  
✅ **Credentials protected** in .env (not in code)  
✅ **Rate limiting** can be added later  
✅ **HTTPS recommended** for production  

## Production Deployment

For production, ensure:

1. **Update .env variables:**
   ```env
   VITE_BACKEND_URL=https://api.yourdomain.com
   NODE_ENV=production
   ```

2. **Backend .env for production:**
   ```env
   PORT=5000
   CORS_ORIGIN=https://yourdomain.com
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=noreply@yourdomain.com
   EMAIL_PASSWORD=your_app_password
   FEEDBACK_EMAIL_RECIPIENT=admin@yourdomain.com
   ```

3. **Add rate limiting** (optional but recommended):
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const feedbackLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5 // 5 requests per window
   });
   
   router.post('/submit', feedbackLimiter, feedbackValidation, ...);
   ```

## Files Modified/Created

### Backend
- `/modules/feedback/controllers/feedback.controller.js` - API handler
- `/modules/feedback/routes/feedback.routes.js` - API routes
- `/modules/feedback/services/feedback.service.js` - Email logic
- `/modules/feedback/validators/feedback.validation.js` - Input validation
- `/server.js` - Added feedback routes
- `/modules/feedback/FEEDBACK_SETUP.md` - Setup guide

### Frontend
- `/src/components/home-page.jsx` - Updated handleSubmit function

## Next Steps

1. ✅ Add email credentials to backend `.env`
2. ✅ Test the form locally
3. ✅ Deploy to production
4. ✅ Monitor email delivery
5. ✅ Consider adding rate limiting
6. ✅ Add feedback form response handling (optional)

## Support

For issues or questions, refer to:
- Backend setup: `/backend/modules/feedback/FEEDBACK_SETUP.md`
- API documentation: Check POST endpoint details in this guide
