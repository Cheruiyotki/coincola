# CoinCola Clone - Login System

A full-stack login authentication system for educational purposes, mimicking the CoinCola platform design.

## Project Structure

```
coincola/
├── public/
│   ├── index.html       # Login page HTML
│   ├── styles.css       # Styling
│   └── auth.js          # Frontend authentication logic
├── backend/
│   ├── server.js        # Express server
│   ├── routes/
│   │   └── auth.js      # Authentication routes
│   └── middleware/
│       └── auth.js      # JWT authentication middleware
├── models/
│   └── User.js          # MongoDB User schema
├── package.json         # Dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Features

### Frontend
- ✅ Responsive login page (matches CoinCola design)
- ✅ **Phone Login with Country Code Selection**
  - 🌍 Auto-detect country based on user's geolocation
  - 🔍 Searchable country dropdown with 20+ countries
  - 🏳️ Flag emojis for easy identification
  - 📱 Support for international phone numbers
- ✅ Email login option
- ✅ Password visibility toggle
- ✅ Form validation (client & server-side)
- ✅ Error handling with user feedback
- ✅ Loading states
- ✅ Local storage for token management
- ✅ Automatic redirect for authenticated users

### Backend
- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and verification
- ✅ MongoDB database integration
- ✅ Protected routes with middleware
- ✅ Last login tracking
- ✅ Account status management
- ✅ Input validation
- ✅ CORS enabled

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone and navigate to project:**
```bash
cd coincola
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Edit .env with your settings:**
```env
MONGODB_URI=mongodb://localhost:27017/coincola
JWT_SECRET=your-secure-secret-key-here
```

5. **Start MongoDB** (if running locally):
```bash
mongod
```

## Running the Application

### Start Backend Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

### Start Frontend (in another terminal)
```bash
npm run serve-frontend
```
Frontend runs on `http://localhost:8000`

Visit `http://localhost:8000` to see the login page.

## API Endpoints

### Authentication

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login with Email**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "loginType": "email"
}
```

**Login with Phone**
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+12345678901",
  "password": "password123",
  "loginType": "phone"
}
```

**Verify Token**
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Logout**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Authentication Flow

1. **Registration:**
   - User submits email/phone, password, name
   - Backend validates and hashes password with bcrypt
   - User saved to MongoDB
   - JWT token generated and sent to client

2. **Login:**
   - User chooses email or phone login method
   - For phone: Country code is auto-detected via geolocation
   - User can select different country from searchable dropdown
   - Backend verifies credentials
   - JWT token generated (expires in 7 days)
   - Token stored in localStorage
   - User redirected to dashboard

3. **Protected Routes:**
   - Frontend checks for token in localStorage
   - Token sent in Authorization header
   - Backend verifies JWT using middleware
   - Protected resource accessed

## 🌍 Supported Countries for Phone Login

The following countries are supported (20+ countries):

| Country | Code | Flag |
|---------|------|------|
| United States | +1 | 🇺🇸 |
| Canada | +1 | 🇨🇦 |
| United Kingdom | +44 | 🇬🇧 |
| Nigeria | +234 | 🇳🇬 |
| Ghana | +233 | 🇬🇭 |
| Kenya | +254 | 🇰🇪 |
| South Africa | +27 | 🇿🇦 |
| Egypt | +20 | 🇪🇬 |
| India | +91 | 🇮🇳 |
| China | +86 | 🇨🇳 |
| Japan | +81 | 🇯🇵 |
| Australia | +61 | 🇦🇺 |
| Germany | +49 | 🇩🇪 |
| France | +33 | 🇫🇷 |
| Spain | +34 | 🇪🇸 |
| Italy | +39 | 🇮🇹 |
| Brazil | +55 | 🇧🇷 |
| Mexico | +52 | 🇲🇽 |
| Singapore | +65 | 🇸🇬 |
| Malaysia | +60 | 🇲🇾 |
| Thailand | +66 | 🇹🇭 |
| Philippines | +63 | 🇵🇭 |
| Indonesia | +62 | 🇮🇩 |

**How Country Code Auto-Detection Works:**
1. Browser requests user's geolocation (with permission)
2. Latitude & Longitude is reverse-geocoded using OpenStreetMap API
3. Country name is matched with country code dictionary
4. Default country is set in the dropdown
5. User can change country anytime

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration
- ✅ CORS protection
- ✅ Input validation
- ✅ Account status verification
- ✅ Secure password comparison
- ✅ Token verification middleware
- ✅ Error messages don't leak information

## Testing the Login

**Test Account:**
```
Email: test@example.com
Password: password123
```

**Create an account:**
1. Modify `/public/auth.js` to include a registration function
2. Or use MongoDB to insert a test user directly

## Styling

The frontend uses:
- **CSS Grid** for responsive layouts
- **Flexbox** for component alignment
- **CSS Variables** for easy theming
- **Linear Gradients** for backgrounds
- **Smooth Transitions** for interactions
- **Mobile-first Responsive Design**

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| CLIENT_URL | Frontend URL for CORS |

## Database Schema

**User Model:**
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  isEmailVerified: Boolean,
  isPhoneVerified: Boolean,
  twoFactorEnabled: Boolean,
  status: String (active|suspended|deleted),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps for Development

1. **Email Verification:**
   - Send verification email on registration
   - Implement email confirmation flow

2. **Password Reset:**
   - Add forgot password functionality
   - Send reset link via email

3. **Two-Factor Authentication:**
   - Implement OTP or authenticator app

4. **Social Login:**
   - Add Google/GitHub OAuth

5. **Dashboard:**
   - Create protected dashboard page
   - Add user profile management

6. **Advanced Security:**
   - Rate limiting on login attempts
   - IP whitelisting
   - Session management

## Troubleshooting

**"MongoDB connection error"**
- Ensure MongoDB is running
- Check MONGODB_URI in .env

**"CORS error"**
- Check CLIENT_URL matches your frontend
- Ensure CORS is properly configured

**"Invalid token"**
- Token might be expired (7-day expiration)
- Delete from localStorage and login again

## License

MIT License - For educational purposes only.

## Disclaimer

This is an educational project created to learn authentication concepts. It's not associated with or endorsed by CoinCola. Use responsibly and follow all legal requirements when deploying to production.
