# 📱 SMS Setup Guide for CNC FB

## 🔧 How to Enable Real SMS Functionality

### Current Status
- ✅ SMS system is integrated but running in **DEMO MODE**
- 📱 SMS messages are logged to console instead of being sent
- 🔐 Password reset codes are generated and stored properly

### To Enable Real SMS:

#### 1. Get Twilio Account
1. Go to [Twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Get your credentials:
   - Account SID
   - Auth Token
   - Twilio Phone Number

#### 2. Set Environment Variables
Create a `.env` file in your project root:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
```

#### 3. Enable SMS in Code
In `server.js`, change:

```javascript
const SMS_CONFIG = {
  enabled: false, // Change this to true
  // ... rest of config
};
```

#### 4. Install dotenv (Optional)
```bash
npm install dotenv
```

Then add to top of `server.js`:
```javascript
require('dotenv').config();
```

### 📋 SMS Message Format
When enabled, users will receive:
```
CNC FB: Your password reset code is 123456. Valid for 10 minutes. Do not share this code with anyone.
```

### 🔒 Security Features
- ✅ 6-digit random codes
- ✅ 10-minute expiration
- ✅ Rate limiting (can be added)
- ✅ Phone number validation
- ✅ Secure code storage

### 💰 Cost
- Twilio free tier: 15 SMS/month
- Paid: ~$0.0075 per SMS
- Perfect for small to medium applications

### 🧪 Testing
1. Use Twilio's test credentials for development
2. Test with your own phone number first
3. Monitor SMS delivery in Twilio console

### 🚀 Production Deployment
1. Use environment variables for credentials
2. Enable SMS_CONFIG.enabled = true
3. Monitor SMS delivery rates
4. Set up webhook for delivery status

---

**Current Demo Mode:**
- SMS messages are logged to console
- Users see demo codes in the interface
- Perfect for development and testing
