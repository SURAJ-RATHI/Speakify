# Payment System Setup Guide

## Overview
The payment system uses Razorpay for secure payment processing with proper signature verification.

## Required Environment Variables

Add these to your `.env` file in the `backend/` directory:

```env
# Razorpay API Credentials (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

## How to Get Razorpay Credentials

1. Create a Razorpay account at https://razorpay.com
2. Log in to your Razorpay dashboard
3. Go to Settings > API Keys
4. Copy your Key ID and Key Secret
5. Add them to your `.env` file

## Frontend Configuration

Add to your `.env` file in the `frontend/` directory:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

## Payment Flow

### 1. User Initiates Payment
- User selects a course and clicks "Pay"
- Frontend calls `/api/v1/payments/create-order`

### 2. Backend Creates Razorpay Order
- Server validates user and course details
- Creates a Razorpay order using the Razorpay API
- Stores payment record in database with status "pending"
- Returns `razorpayOrderId` to frontend

### 3. User Completes Payment
- Razorpay checkout modal opens with the order ID
- User enters payment details
- Razorpay processes the payment

### 4. Payment Verification
- Frontend calls `/api/v1/payments/verify` with:
  - `paymentId` - Database payment record ID
  - `razorpayOrderId` - Razorpay order ID
  - `razorpayPaymentId` - Razorpay payment ID
  - `razorpaySignature` - Razorpay signature (for verification)

### 5. Backend Validates Payment
- Verifies Razorpay signature using HMAC-SHA256
- Confirms payment details match the order
- Fetches payment details from Razorpay API
- Updates payment status to "completed"
- Returns success response

## API Endpoints

### POST `/api/v1/payments/create-order`
Creates a payment order in both database and Razorpay.

**Request Body:**
```json
{
  "courseId": "course_slug",
  "courseName": "Course Name",
  "amount": 999
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "paymentId": "64f3d8e9f8c7a9b5c1d2e3f4",
    "razorpayOrderId": "order_XXXXX",
    "amount": 999,
    "courseName": "Course Name",
    "email": "user@example.com",
    "currency": "INR"
  }
}
```

### POST `/api/v1/payments/verify`
Verifies payment and marks it as completed.

**Request Body:**
```json
{
  "paymentId": "64f3d8e9f8c7a9b5c1d2e3f4",
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and completed successfully",
  "data": {
    "paymentId": "64f3d8e9f8c7a9b5c1d2e3f4",
    "razorpayPaymentId": "pay_XXXXX",
    "status": "completed",
    "courseName": "Course Name",
    "email": "user@example.com",
    "amount": 999
  }
}
```

### GET `/api/v1/payments/history`
Retrieves user's payment history.

**Response:**
```json
{
  "success": true,
  "message": "Payment history retrieved",
  "data": [
    {
      "_id": "64f3d8e9f8c7a9b5c1d2e3f4",
      "courseName": "Course Name",
      "courseId": "course_slug",
      "amount": 999,
      "paymentStatus": "completed",
      "purchasedAt": "2024-04-23T10:30:00.000Z"
    }
  ]
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Razorpay credentials not configured" | Missing `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` | Add to `.env` file |
| "Invalid payment signature" | Signature doesn't match | Verify Key Secret is correct |
| "Payment amount mismatch" | Order amount doesn't match payment | Check course pricing |
| "Payment not captured" | Payment status is not captured | Contact Razorpay support |

## Testing

### Test Cards for Razorpay Sandbox
- **Success:** 4111 1111 1111 1111, Any future expiry, Any CVV
- **Decline:** 4111 1111 1111 1112
- **Timeout:** Any other card number

Note: Use sandbox credentials in development (`https://dashboard.razorpay.com` with sandbox toggle)

## Security Features

1. ✅ Signature Verification - Validates every payment with HMAC-SHA256
2. ✅ Amount Verification - Confirms payment amount matches order
3. ✅ Order ID Verification - Ensures payment belongs to correct order
4. ✅ Status Verification - Confirms payment is captured by Razorpay
5. ✅ User Authentication - All endpoints require authentication
6. ✅ Error Logging - All errors logged for debugging

## Troubleshooting

### Payment modal not opening?
- Check browser console for errors
- Verify `VITE_RAZORPAY_KEY_ID` is set in frontend `.env`
- Confirm Razorpay script loads successfully

### Payment verified but not shown as completed?
- Check database Payment record status
- Verify Razorpay credentials in backend `.env`
- Check server logs for signature verification errors

### "Invalid payment signature" error?
- Verify `RAZORPAY_KEY_SECRET` is correct
- Ensure signature is properly formatted
- Check no whitespace in credentials
