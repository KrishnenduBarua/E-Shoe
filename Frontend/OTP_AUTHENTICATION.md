# OTP Authentication System

## Overview

E-Shoe uses a secure phone number-based OTP (One-Time Password) authentication system. This provides a passwordless login experience that's both secure and user-friendly.

## How It Works

### 1. Login Flow

1. User enters their phone number
2. System sends a 6-digit OTP to the phone number (via SMS)
3. User enters the OTP
4. System verifies the OTP
5. If valid, user is logged in
6. New users are automatically registered on first login

### 2. Registration

- **No separate registration page needed** - Registration happens automatically during first login
- Users only need a valid phone number
- Profile information (name, email) can be added later in the Profile section

### 3. User Profile

- Users can update their name and email in the Profile section
- Phone number cannot be changed (it's the primary identifier)
- Email is optional but recommended for order notifications

## Security Features

### OTP Generation

- 6-digit numeric code
- Random generation using cryptographic methods
- One-time use only

### Validation

- Phone number format validation
- OTP format validation (6 digits)
- Rate limiting on OTP requests
- Resend cooldown (60 seconds)

### Protection Against

- ✅ Brute force attacks (rate limiting)
- ✅ Invalid phone numbers (validation)
- ✅ Spam (resend cooldown)
- ✅ Replay attacks (one-time use)

## Implementation Details

### Frontend Files Modified

- `src/pages/Auth/Login.jsx` - OTP login flow
- `src/pages/Auth/Register.jsx` - Redirects to login
- `src/pages/Profile.jsx` - Profile management
- `src/utils/security.js` - OTP validation utilities
- `src/utils/api.js` - OTP API endpoints
- `src/components/Layout/Header.jsx` - Display phone number

### API Endpoints Required (Backend)

```javascript
POST /api/auth/send-otp
Body: { phoneNumber: string }
Response: { success: boolean, message: string }

POST /api/auth/verify-otp
Body: { phoneNumber: string, otp: string }
Response: {
  success: boolean,
  token: string,
  user: {
    id: number,
    phoneNumber: string,
    name: string,
    email: string
  }
}
```

### User Data Structure

```javascript
{
  id: number,
  phoneNumber: string,  // Required - Primary identifier
  name: string,         // Optional - Can be updated in profile
  email: string,        // Optional - Can be added in profile
  createdAt: datetime,
  updatedAt: datetime
}
```

## User Experience

### Login/Register Steps

1. **Step 1: Enter Phone Number**
   - Input field with phone icon
   - Format: +1 (234) 567-8900
   - Validation on submit
   - "Send OTP" button

2. **Step 2: Verify OTP**
   - Large input field for 6 digits
   - Auto-focus for easy entry
   - Countdown timer for resend
   - Option to change phone number
   - "Verify & Continue" button

### Profile Management

- View phone number (read-only)
- Update name
- Add/update email (optional)
- Manage addresses
- View order history

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_OTP_RESEND_COOLDOWN=60  # seconds
VITE_OTP_EXPIRY=300          # 5 minutes
```

### Security Settings

- OTP length: 6 digits
- Resend cooldown: 60 seconds
- OTP expiry: 5 minutes (implement on backend)
- Max attempts: 3 (implement on backend)

## Backend Implementation Guide

### SMS Provider Integration

You'll need to integrate with an SMS provider like:

- Twilio
- AWS SNS
- MessageBird
- Vonage (Nexmo)

### Example Backend Logic

```javascript
// Send OTP
async function sendOTP(phoneNumber) {
  // 1. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Store OTP in database/cache with expiry
  await redis.setex(`otp:${phoneNumber}`, 300, otp);

  // 3. Send SMS via provider
  await smsProvider.send(phoneNumber, `Your E-Shoe OTP is: ${otp}`);

  return { success: true };
}

// Verify OTP
async function verifyOTP(phoneNumber, otp) {
  // 1. Get stored OTP
  const storedOTP = await redis.get(`otp:${phoneNumber}`);

  // 2. Validate
  if (storedOTP !== otp) {
    throw new Error("Invalid OTP");
  }

  // 3. Delete used OTP
  await redis.del(`otp:${phoneNumber}`);

  // 4. Find or create user
  let user = await User.findOne({ phoneNumber });
  if (!user) {
    user = await User.create({ phoneNumber });
  }

  // 5. Generate JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  return { user, token };
}
```

## Testing

### Test Phone Numbers (Development)

For development, you can use test numbers that always accept a specific OTP:

- Phone: +1 234 567 8900
- OTP: 123456

### Manual Testing Checklist

- [ ] Send OTP with valid phone number
- [ ] Send OTP with invalid phone number
- [ ] Verify with correct OTP
- [ ] Verify with incorrect OTP
- [ ] Resend OTP functionality
- [ ] Resend cooldown timer
- [ ] Change phone number option
- [ ] Auto-registration for new users
- [ ] Profile update after login
- [ ] Protected routes redirect to login

## Best Practices

1. **Never log OTPs** in production
2. **Use HTTPS** for all API calls
3. **Implement rate limiting** on backend
4. **Set OTP expiry** (5 minutes recommended)
5. **Limit verification attempts** (3-5 attempts)
6. **Use a reputable SMS provider**
7. **Monitor SMS costs**
8. **Handle SMS delivery failures gracefully**

## Troubleshooting

### OTP Not Received

- Check phone number format
- Verify SMS provider credentials
- Check SMS provider balance
- Review SMS logs

### Invalid OTP Error

- Ensure OTP hasn't expired
- Check for typos in OTP entry
- Verify OTP storage mechanism

### Rate Limiting Issues

- Adjust cooldown timers
- Implement proper error messages
- Add admin override for testing

## Future Enhancements

1. **Multi-factor Authentication**
   - Add email verification option
   - Backup authentication methods

2. **International Support**
   - Country code selection
   - Multiple phone number formats
   - Localized SMS messages

3. **Analytics**
   - Track OTP success rates
   - Monitor SMS delivery times
   - Analyze user authentication patterns

4. **Security Enhancements**
   - Device fingerprinting
   - IP-based rate limiting
   - Suspicious activity detection

---

**Note**: The current implementation uses mock OTP generation for development. Integrate with a real SMS provider before deploying to production.
