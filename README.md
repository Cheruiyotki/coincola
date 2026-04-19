# CoinCola Clone - Login UI and Auth Demo

A small full-stack authentication demo that recreates the CoinCola-style login experience shown in the reference screenshots.

## Overview

This project includes:

- a static frontend in `public/` with a CoinCola-style login page
- email and phone login tabs
- a searchable country-code picker for phone login
- client-side validation and loading/error states
- an Express API for register, login, logout, and token verification
- a simple protected `dashboard.html` page after successful login

## Current UI

The login page is set up to match the provided screenshots as closely as possible in structure and behavior:

- top white header with CoinCola branding
- active `Log In` button, `Sign Up` text action, and globe icon
- large centered white login panel
- `Login by email` active by default
- email and phone tab switching
- password field with eye toggle
- footer link columns, lower brand section, app badges, and help button

## Project Structure

```text
coincola/
|-- public/
|   |-- index.html        # CoinCola-style login page
|   |-- styles.css        # Frontend styling
|   |-- auth.js           # Login page behavior
|   |-- dashboard.html    # Simple protected landing page
|   `-- dashboard.js      # Dashboard auth guard and logout
|-- backend/
|   |-- server.js         # Express server and static hosting
|   |-- routes/
|   |   `-- auth.js       # Auth API routes
|   `-- middleware/
|       `-- auth.js       # JWT middleware
|-- models/
|   `-- User.js           # MongoDB user schema
|-- package.json
|-- package-lock.json
`-- README.md
```

## Features

### Frontend

- CoinCola-style login layout based on the supplied screenshots
- Email login tab
- Phone login tab with country code selector
- Country search for supported phone-login countries
- Browser geolocation attempt for default country selection
- Password visibility toggle
- Inline validation and error display
- Loading overlay during login
- Local-storage token persistence
- Automatic redirect to dashboard when the stored token is still valid

### Backend

- User registration
- Login with email or phone
- JWT token generation and verification
- Password hashing with bcrypt
- MongoDB persistence with Mongoose
- Protected token verification route
- Local static hosting for the frontend
- CORS support for common local frontend origins

## Supported Phone Login Countries

The current phone-login country list is intentionally small and matches the app data:

| Country | Code |
|---|---|
| Nigeria | `+234` |
| Ghana | `+233` |
| Kenya | `+254` |

## Requirements

- Node.js 14+
- npm
- MongoDB running locally or through MongoDB Atlas

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file. Example:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/coincola
JWT_SECRET=your-secure-secret-key-here
CLIENT_URL=http://localhost:8000
```

3. Start MongoDB if you are using a local database.

## Running the App

### Option 1: Run everything from the backend server

The backend serves the API and the static frontend.

```bash
npm start
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/dashboard`

### Option 2: Run backend and frontend separately

Start the backend:

```bash
npm run dev
```

Start the static frontend in another terminal:

```bash
npm run serve-frontend
```

Then open:

- frontend: `http://localhost:8000/`
- backend API: `http://localhost:3000/api`

The frontend JavaScript is already set up to talk to the backend on port `3000`.

## API Endpoints

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Example body:

```json
{
  "email": "user@example.com",
  "phone": "+2348012345678",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login With Email

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123",
  "loginType": "email"
}
```

### Login With Phone

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "phone": "+2348012345678",
  "password": "password123",
  "loginType": "phone"
}
```

### Verify Token

```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Auth Flow

1. The user opens the login page.
2. The page defaults to `Login by email`, matching the screenshot layout.
3. The user can switch to phone login and choose a supported country code.
4. On successful login, the token and user are stored in `localStorage`.
5. The user is redirected to `dashboard.html`.
6. The dashboard re-verifies the token with `/api/auth/verify`.
7. If the token is missing or invalid, the user is returned to the login page.

## Notes About Static Hosting

`backend/server.js` now serves the contents of `public/`, so running the backend alone is enough to load the frontend locally.

Allowed local frontend origins currently include:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:8000`
- `http://127.0.0.1:8000`

If `CLIENT_URL` is set in `.env`, that value is also allowed.

## Verification Performed

The following checks were run after the UI and behavior updates:

- `node --check public/auth.js`
- `node --check public/dashboard.js`
- `node --check backend/server.js`

These confirm the updated scripts parse correctly.

## Troubleshooting

### MongoDB connection error

- Make sure MongoDB is running
- Confirm `MONGODB_URI` is correct in `.env`

### CORS error

- Make sure your frontend is running on one of the allowed local origins
- If needed, set `CLIENT_URL` explicitly in `.env`

### Login succeeds but redirect fails

- Make sure the backend is running if you are using token verification
- If using the static frontend on port `8000`, also run the backend on port `3000`

### Invalid token

- Clear `localStorage`
- Log in again to generate a fresh token

## Future Improvements

- registration page and UI
- forgot-password flow
- richer dashboard
- social login
- rate limiting on login attempts
- improved test coverage

## License

MIT

## Disclaimer

This is an educational project and is not affiliated with or endorsed by CoinCola.
