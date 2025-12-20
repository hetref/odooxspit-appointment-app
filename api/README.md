# Authentication API

A complete, production-ready authentication API built with Express, Prisma 7, JWT, and PostgreSQL. Features include user registration with role-based access (USER/ORGANIZATION), email verification, login, refresh token rotation, password reset, business management, and protected user routes.

## 🚀 Features

- ✅ User registration with email verification
- ✅ **Role-based access control (USER and ORGANIZATION)**
- ✅ **Business management for organizations**
- ✅ **USER to ORGANIZATION conversion**
- ✅ JWT-based access tokens (15 minutes expiry)
- ✅ Rotating refresh tokens (30 days expiry, stored as HttpOnly cookies)
- ✅ Password reset via email
- ✅ Protected user routes
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email sending with nodemailer (Gmail SMTP)
- ✅ Security best practices (Helmet, CORS, Rate Limiting)
- ✅ PostgreSQL database with Prisma 7
- ✅ Token rotation on every refresh
- ✅ Force logout on password change
- ✅ Prevents user enumeration
- ✅ **Session management with device tracking**
- ✅ **View all active sessions with timestamps**
- ✅ **Logout from specific devices**
- ✅ **Logout from all devices**
- ✅ **Track IP address, browser, OS, and device type**
- ✅ **AWS S3 media upload and delete**
- ✅ **Customizable S3 bucket and path**
- ✅ **File type validation (images, videos, documents, audio)**
- ✅ **50MB file size limit**

## 📦 Tech Stack

- **Language**: JavaScript (Node.js)
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: JWT + Refresh Tokens
- **Password Hashing**: bcrypt
- **Email**: nodemailer

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (v12 or higher) installed and running

### Step 1: Clone and Install

```bash
cd api
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=4000
 (PostgreSQL)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/auth_api"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m

# Refresh Token Configuration
REFRESH_TOKEN_EXPIRES_DAYS=30

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Email Configuration
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Auth API

# Base URL (for email links)
BASE_URL=http://localhost:4000

# AWS S3 Configuration (for media uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=demo-test-aryu-me
```

**Important Notes**:
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- AWS credentials can be obtained from AWS IAM console
- Ensure your AWS S3 bucket exists and IAM user has appropriate permissions (s3:PutObject, s3:DeleteObject, s3:GetObject)
- The S3 bucket name defaults to "demo-test-aryu-me" if not specifiedPostgreSQL Database

First, ensure PostgreSQL is running, then create the database:

**Using psql (command line)**:
```bash
psql -U postgres
CREATE DATABASE auth_api;
\q
```

**Or using pgAdmin** or any PostgreSQL GUI tool.

### Step 4: Run Database Migrations
5: Start the Server

```bash
npm run dev
```

The server will start at `http://localhost:4000`

**Troubleshooting Database Connection**:
- Ensure PostgreSQL is running: `sudo service postgresql status` (Linux) or check Services (Windows)
- Verify credentials in `.env` match your PostgreSQL setup
- Test connection: `psql -U postgres -d auth_api
This will:
- Connect to your PostgreSQL database
- Create all necessary tables
npx prisma migrate dev --name init
```

This will:
- Create the SQLite database at `prisma/dev.db`
- Apply all migrations
- Generate Prisma Client

### Step 4: Start the Server

```bash
npm run dev
```

The server will start at `http://localhost:4000`

## 📚 API Documentation

### Base URL

```
http://localhost:4000
```

### Authentication Flow

1. **Register** → Choose role (USER or ORGANIZATION) → Receive verification email
2. **Verify Email** → Click link in email
3. **Login** → Receive access token + refresh token (cookie) + Session created with device info
4. **Access Protected Routes** → Use access token in Authorization header
5. **Refresh Token** → Get new access token when expired
6. **Manage Sessions** → View and manage all active sessions
7. **Convert to Organization** → USER can upgrade to ORGANIZATION with business details
8. **Logout** → Revoke refresh token and end session

---

## 🔐 Auth Endpoints

### 1. Register

Create a new user account with optional role selection (USER or ORGANIZATION).

**Endpoint**: `POST /auth/register`

**Request Body** (USER):
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "role": "USER"
}
```

**Request Body** (ORGANIZATION):
```json
{
  "email": "business@example.com",
  "password": "SecurePassword123",
  "name": "Jane Smith",
  "role": "ORGANIZATION",
  "business": {
    "name": "Tech Solutions Inc.",
    "location": "New York, NY",
    "workingHours": "Mon-Fri 9AM-5PM",
    "description": "Leading technology solutions provider"
  }
}
```

**Response** (201 Created) - USER:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "userId": "clx123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Response** (201 Created) - ORGANIZATION:
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "userId": "clx456def",
    "email": "business@example.com",
    "name": "Jane Smith",
    "role": "ORGANIZATION",
    "business": {
      "id": "clx789ghi",
      "name": "Tech Solutions Inc.",
      "location": "New York, NY"
    }
  }
}
```

**Validation**:
- Email must be valid format
- Password must be at least 8 characters
- Email must be unique
- Role must be either "USER" or "ORGANIZATION" (defaults to "USER")
- If role is "ORGANIZATION", business name and location are required
- If role is "USER", business data is ignored

**Email Sent**: Verification link to user's email

---

### 2. Verify Email

Verify user's email address using the token from the email.

**Endpoint**: `GET /auth/verify-email?token=TOKEN&email=EMAIL`

**Query Parameters**:
- `token`: Verification token from email
- `email`: User's email address

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid or expired verification token."
}
```

---

### 3. Resend Verification Email

Request a new verification email if the previous one expired or was lost.

**Endpoint**: `POST /auth/resend-verification-email`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Verification email sent successfully. Please check your inbox."
}
```

**Security Features**:
- Rate limited to 1 request per 2 minutes per email
- Invalidates old unused tokens
- Prevents user enumeration (always returns success for non-existent users)
- Only works for unverified accounts

**Error Responses**:

Already verified (400 Bad Request):
```json
{
  "success": false,
  "message": "Email is already verified."
}
```

Rate limit exceeded (429 Too Many Requests):
```json
{
  "success": false,
  "message": "Please wait 2 minutes before requesting another verification email."
}
```

---

### 4. Login

Authenticate user and receive tokens.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "abc123def456...",
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true
    }
  }
}
```

**Cookies Set**:
- `refreshToken`: HttpOnly, Secure (in production), SameSite=Strict, 30 days expiry

**Note**: The refresh token is provided in both the response body (for easy testing/non-browser clients) and as an HttpOnly cookie (recommended for browser security).

**Error Responses**:

Email not verified (403 Forbidden):
```json
{
  "success": false,
  "message": "Please verify your email before logging in."
}
```

Invalid credentials (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### 5. Refresh Token

Get a new access token using the refresh token.

**Endpoint**: `POST /auth/refresh-token`

**Request Options**:

**Option 1 - Using Cookie (Recommended for browsers)**:
No body required, refresh token is automatically sent via cookie.

**Option 2 - Using Request Body (For testing/non-browser clients)**:
```json
{
  "refreshToken": "abc123def456..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "xyz789ghi012..."
  }
}
```

**Behavior**:
- Old refresh token is revoked
- New refresh token is generated and set in cookie (rotation)
- New access token and refresh token are returned in response
- The API accepts refresh token from either cookie or request body

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "message": "Invalid or expired refresh token."
}
```

---

### 6. Logout

Revoke refresh token and clear cookie.

**Endpoint**: `POST /auth/logout`

**Request Options**:

**Option 1 - Using Cookie (Automatic for browsers)**:
No body required, refresh token is automatically sent via cookie.

**Option 2 - Using Request Body (For API clients)**:
```json
{
  "refreshToken": "abc123def456..."
}
```

**Note**: Use the **plain refresh token** from the login response, not the hashed version from the database.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful."
}
```

**Behavior**:
- Refresh token is revoked in database
- Cookie is cleared
- Session is logged for tracking purposes

---

### 7. Request Password Reset

Request a password reset email.

**Endpoint**: `POST /auth/request-password-reset`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Security**: Always returns success to prevent user enumeration.

**Email Sent**: Password reset link (valid for 1 hour)

---

### 8. Reset Password

Reset password using token from email.

**Endpoint**: `POST /auth/reset-password`

**Request Body**:
```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "newPassword": "NewSecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Behavior**:
- Password is updated
- All refresh tokens are revoked (force logout everywhere)
- Token is marked as used

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid or expired reset token."
}
```

---

## � Session Management Endpoints

**All session endpoints require authentication**. Include access token in Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 9. Get All Active Sessions

View all active sessions (logged-in devices) for the current user.

**Endpoint**: `GET /sessions`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "clx123abc",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "lastUsedAt": "2024-01-15T14:25:00.000Z",
        "expiresAt": "2024-02-14T10:30:00.000Z",
        "ipAddress": "192.168.1.100",
        "deviceName": "Google Chrome on Windows 10/11 (Desktop)",
        "deviceType": "Desktop",
        "browser": "Google Chrome",
        "os": "Windows 10/11",
        "isCurrent": true
      },
      {
        "id": "clx456def",
        "createdAt": "2024-01-14T08:15:00.000Z",
        "lastUsedAt": "2024-01-15T09:00:00.000Z",
        "expiresAt": "2024-02-13T08:15:00.000Z",
        "ipAddress": "192.168.1.105",
        "deviceName": "Safari on iOS (Mobile)",
        "deviceType": "Mobile",
        "browser": "Safari",
        "os": "iOS",
        "isCurrent": false
      }
    ],
    "totalSessions": 2
  }
}
```

**Notes**:
- `isCurrent`: Indicates if this is the session making the request
- `lastUsedAt`: Updates when the session's refresh token is used
- Sessions are ordered by `lastUsedAt` (most recent first)

---

### 10. Get Current Session

Get details about the current active session.

**Endpoint**: `GET /sessions/current`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Options** (refresh token can be provided in multiple ways):

**Option 1 - Query Parameter** (Recommended for GET):
```
GET /sessions/current?refreshToken=abc123def456...
```

**Option 2 - Custom Header**:
```
X-Refresh-Token: abc123def456...
```

**Option 3 - Request Body**:
```json
{
  "refreshToken": "abc123def456..."
}
```

**Option 4 - Cookie** (Automatic):
Cookie is sent automatically if set during login.

**Response** (200 OK) - With refresh token:
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "clx123abc",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastUsedAt": "2024-01-15T14:25:00.000Z",
      "expiresAt": "2024-02-14T10:30:00.000Z",
      "ipAddress": "192.168.1.100",
      "deviceName": "Google Chrome on Windows 10/11 (Desktop)",
      "deviceType": "Desktop",
      "browser": "Google Chrome",
      "os": "Windows 10/11",
      "isCurrent": true
    }
  }
}
```

**Response** (200 OK) - Without refresh token (returns most recent session):
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "clx123abc",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastUsedAt": "2024-01-15T14:25:00.000Z",
      "expiresAt": "2024-02-14T10:30:00.000Z",
      "ipAddress": "192.168.1.100",
      "deviceName": "Google Chrome on Windows 10/11 (Desktop)",
      "deviceType": "Desktop",
      "browser": "Google Chrome",
      "os": "Windows 10/11",
      "isCurrent": false
    }
  },
  "message": "Showing most recently used session. Include refresh token for exact current session."
}
```

**Notes**:
- Refresh token can be provided in request body or cookie
- Without refresh token, returns the most recently active session
- `isCurrent` is `true` only when refresh token is provided and matches the session
- **IMPORTANT**: Use the **plain refresh token** from the login response (e.g., `abc123def...`), NOT the hashed version stored in the database

**Example with refresh token**:
```javascript
// After login, save the plain refresh token
const loginResponse = await login();
const plainRefreshToken = loginResponse.data.refreshToken; // "abc123def456..."

// Use this plain token to get current session
const response = await fetch('/sessions/current', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: plainRefreshToken // Use the plain token, not the hashed one
  })
});
```

---

### 11. Revoke a Specific Session

Logout from a specific device/session.

**Endpoint**: `DELETE /sessions/:sessionId`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**URL Parameters**:
- `sessionId`: The ID of the session to revoke

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session revoked successfully."
}
```

**Error Response** (400 Bad Request) - Trying to revoke current session:
```json
{
  "success": false,
  "message": "Cannot revoke current session. Use logout endpoint instead."
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Session not found or already revoked."
}
```

**Notes**:
- Cannot revoke the current session using this endpoint (use `/auth/logout` instead)
- Only the session owner can revoke their sessions

---

### 12. Logout from Other Devices

Revoke all sessions except the current one.

**Endpoint**: `POST /sessions/revoke-others`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully revoked 3 other session(s).",
  "data": {
    "revokedCount": 3
  }
}
```

**Use Case**: User wants to stay logged in on current device but logout from all other devices.

---

### 13. Logout from All Devices

Revoke all sessions including the current one (global logout).

**Endpoint**: `POST /sessions/revoke-all`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully logged out from all devices."
}
```

**Behavior**:
- All refresh tokens are revoked
- Refresh token cookie is cleared
- User must login again on all devices
- Useful for security purposes (e.g., compromised account)

---

## 📤 Media Management Endpoints

**All media endpoints require authentication**. Include access token in Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 17. Upload Media to S3

Upload a media file (image, video, document, or audio) to AWS S3.

**Endpoint**: `POST /media/upload`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data
```

**Request Body** (form-data):
- `file`: The file to upload (required)
- `bucket`: S3 bucket name (optional, defaults to `AWS_S3_BUCKET` env var or "demo-test-aryu-me")
- `path`: Custom path/folder in S3 (optional, e.g., "users/avatars")

**Supported File Types**:
- **Images**: jpeg, jpg, png, gif, webp, svg
- **Videos**: mp4, mpeg, mov, avi, webm
- **Documents**: pdf, doc, docx, xls, xlsx
- **Audio**: mp3, wav, webm

**File Size Limit**: 50MB

**Response** (201 Created):
```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "fileName": "1705320600000-a3b4c5.jpg",
    "originalName": "profile-photo.jpg",
    "path": "users/avatars/1705320600000-a3b4c5.jpg",
    "bucket": "demo-test-aryu-me",
    "url": "https://demo-test-aryu-me.s3.us-east-1.amazonaws.com/users/avatars/1705320600000-a3b4c5.jpg",
    "size": 245678,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

No file provided (400 Bad Request):
```json
{
  "success": false,
  "message": "No file uploaded. Please provide a file."
}
```

Invalid file type (400 Bad Request):
```json
{
  "success": false,
  "message": "Invalid file type. Only images, videos, documents, and audio files are allowed."
}
```

File too large (413 Payload Too Large):
```json
{
  "success": false,
  "message": "File too large. Maximum size is 50MB."
}
```

**Example with cURL**:
```bash
curl -X POST http://localhost:4000/media/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "path=users/avatars" \
  -F "bucket=my-custom-bucket"
```

**Example with Postman**:
1. Set method to POST
2. URL: `{{baseUrl}}/media/upload`
3. Headers: `Authorization: Bearer {{accessToken}}`
4. Body: Select "form-data"
5. Add key `file` with type "File" and select your file
6. (Optional) Add key `path` with value like "users/avatars"
7. (Optional) Add key `bucket` with your bucket name

---

### 18. Delete Media from S3

Delete a media file from AWS S3.

**Endpoint**: `DELETE /media/delete`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body**:
```json
{
  "path": "users/avatars/1705320600000-a3b4c5.jpg",
  "bucket": "demo-test-aryu-me"
}
```

**Parameters**:
- `path`: The S3 key/path of the file to delete (required)
- `bucket`: S3 bucket name (optional, defaults to `AWS_S3_BUCKET` env var or "demo-test-aryu-me")

**Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully.",
  "data": {
    "path": "users/avatars/1705320600000-a3b4c5.jpg",
    "bucket": "demo-test-aryu-me",
    "deletedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

**Error Responses**:

Missing path (400 Bad Request):
```json
{
  "success": false,
  "message": "File path is required."
}
```

File not found (404 Not Found):
```json
{
  "success": false,
  "message": "File not found in S3 bucket."
}
```

**Example with cURL**:
```bash
curl -X DELETE http://localhost:4000/media/delete \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "users/avatars/1705320600000-a3b4c5.jpg",
    "bucket": "demo-test-aryu-me"
  }'
```

**Notes**:
- The file must exist in the specified bucket
- You must have permissions to delete from the bucket
- Deletion is permanent and cannot be undone
- The `path` should be the exact S3 key (including any folder structure)

---

## �👤 User Endpoints

**All user endpoints require authentication**. Include access token in Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 14. Get Profile (Get Me)

Get current user's profile with role and business information (if applicable).

**Endpoint**: `GET /user/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK) - USER:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "emailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "business": null
    }
  }
}
```

**Response** (200 OK) - ORGANIZATION:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx456def",
      "email": "business@example.com",
      "name": "Jane Smith",
      "role": "ORGANIZATION",
      "emailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "business": {
        "id": "clx789ghi",
        "name": "Tech Solutions Inc.",
        "location": "New York, NY",
        "workingHours": "Mon-Fri 9AM-5PM",
        "description": "Leading technology solutions provider",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    }
  }
}
```

---

### 15. Convert USER to ORGANIZATION

Convert an existing USER account to an ORGANIZATION account by creating business details.

**Endpoint**: `POST /user/convert-to-organization`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body**:
```json
{
  "business": {
    "name": "Tech Solutions Inc.",
    "location": "New York, NY",
    "workingHours": "Mon-Fri 9AM-5PM",
    "description": "Leading technology solutions provider"
  }
}
```

**Required Fields**:
- `business.name`: Business name (required)
- `business.location`: Business location (required)
- `business.workingHours`: Working hours (optional)
- `business.description`: Business description (optional)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully converted to ORGANIZATION.",
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ORGANIZATION"
    },
    "business": {
      "id": "clx789ghi",
      "name": "Tech Solutions Inc.",
      "location": "New York, NY",
      "workingHours": "Mon-Fri 9AM-5PM",
      "description": "Leading technology solutions provider"
    }
  }
}
```

**Error Responses**:

Already an ORGANIZATION (400 Bad Request):
```json
{
  "success": false,
  "message": "User is already an ORGANIZATION."
}
```

Missing business data (400 Bad Request):
```json
{
  "success": false,
  "message": "Business name and location are required."
}
```

**Rules**:
- Only users with role "USER" can convert
- Business name and location are mandatory
- Conversion creates a new business record
- User role is updated to "ORGANIZATION"
- Operation is atomic (transaction-based)
- Cannot downgrade from ORGANIZATION to USER

**Use Case**: A regular user wants to start offering appointment services and needs to register their business.

---

### 16. Update Profile

Update user's profile information.

**Endpoint**: `PUT /user/update`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body** (all fields optional):
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com",
  "password": "NewPassword123",
  "currentPassword": "OldPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "newemail@example.com",
      "name": "Jane Doe",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:45:00.000Z"
    }
  }
}
```

**Notes**:
- Changing email sets `emailVerified` to false and automatically sends verification email
- Changing password requires `currentPassword`
- Changing password revokes all refresh tokens (force logout)

---

### 17. Delete Account

Delete user's account permanently.

**Endpoint**: `DELETE /user/delete`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Request Body**:
```json
{
  "password": "CurrentPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```

**Behavior**:
- User account is permanently deleted
- All related data is deleted (cascade)
- Refresh token cookie is cleared

---

## 🧪 Testing with Postman

### Import Environment

Create a Postman environment with these variables:

- `baseUrl`: `http://localhost:4000`
- `accessToken`: (will be set automatically)
- `refreshToken`: (will be set automatically)
- `email`: `test@example.com`
- `password`: `TestPassword123`

### Test Flow

#### 1. Register (as USER)

```
POST {{baseUrl}}/auth/register
Body (JSON):
{
  "email": "{{email}}",
  "password": "{{password}}",
  "name": "Test User",
  "role": "USER"
}
```

#### 1b. Register (as ORGANIZATION - Alternative)

```
POST {{baseUrl}}/auth/register
Body (JSON):
{
  "email": "business@example.com",
  "password": "{{password}}",
  "name": "Business Owner",
  "role": "ORGANIZATION",
  "business": {
    "name": "Test Business",
    "location": "New York, NY",
    "workingHours": "Mon-Fri 9AM-5PM",
    "description": "Test business description"
  }
}
```

#### 2. Verify Email

Check your email for the verification link. Copy the token and email from the URL.

```
GET {{baseUrl}}/auth/verify-email?token=TOKEN_FROM_EMAIL&email={{email}}
```

#### 3. Resend Verification Email (Optional)

If you didn't receive the verification email or it expired:

```
POST {{baseUrl}}/auth/resend-verification-email
Body (JSON):
{
  "email": "{{email}}"
}
```

**Note**: This is rate-limited to 1 request per 2 minutes per email.

#### 4. Login

```
POST {{baseUrl}}/auth/login
Body (JSON):
{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

**Tests Tab** (to save access token and refresh token):
```javascript
const response = pm.response.json();
if (response.success && response.data) {
    if (response.data.accessToken) {
        pm.environment.set("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
        pm.environment.set("refreshToken", response.data.refreshToken);
    }
}
```

#### 5. Get Profile

```
GET {{baseUrl}}/user/me
Headers:
Authorization: Bearer {{accessToken}}
```

**Response**: Will include role and business information (if user is ORGANIZATION).

#### 6. Convert USER to ORGANIZATION (Optional)

Only applicable if you registered as a USER and want to upgrade:

```
POST {{baseUrl}}/user/convert-to-organization
Headers:
Authorization: Bearer {{accessToken}}
Body (JSON):
{
  "business": {
    "name": "My New Business",
    "location": "San Francisco, CA",
    "workingHours": "Mon-Sat 10AM-6PM",
    "description": "Business description here"
  }
}
```

**Note**: This step is only for USER accounts. ORGANIZATION accounts already have business data.

#### 7. Update Profile

#### 7. Update Profile

```
PUT {{baseUrl}}/user/update
Headers:
Authorization: Bearer {{accessToken}}
Body (JSON):
{
  "name": "Updated Name"
}
```

#### 8. Refresh Token

```
POST {{baseUrl}}/auth/refresh-token
```

**Tests Tab** (to save new tokens):
```javascript
const response = pm.response.json();
if (response.success) {
    if (response.data.accessToken) {
        pm.environment.set("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
        pm.environment.set("refreshToken", response.data.refreshToken);
    }
}
```

#### 9. Logout

```
POST {{baseUrl}}/auth/logout
```

#### 10. Request Password Reset

```
POST {{baseUrl}}/auth/request-password-reset
Body (JSON):
{
  "email": "{{email}}"
}
```

#### 11. Reset Password

Check email for reset link, copy token:

```
POST {{baseUrl}}/auth/reset-password
Body (JSON):
{
  "token": "TOKEN_FROM_EMAIL",
  "email": "{{email}}",
  "newPassword": "NewPassword123"
}
```

#### 12. Delete Account

#### 12. Delete Account

```
DELETE {{baseUrl}}/user/delete
Headers:
Authorization: Bearer {{accessToken}}
Body (JSON):
{
  "password": "{{password}}"
}
```

#### 13. Get All Sessions

```
GET {{baseUrl}}/sessions
Headers:
Authorization: Bearer {{accessToken}}
```

**Response**: Lists all active sessions with device info, IP addresses, and timestamps.

#### 14. Get Current Session

```
GET {{baseUrl}}/sessions/current
Headers:
Authorization: Bearer {{accessToken}}
```

**Response**: Details about the current session making the request.

#### 15. Revoke a Specific Session

First, get the session ID from the "Get All Sessions" response, then:

```
DELETE {{baseUrl}}/sessions/SESSION_ID_HERE
Headers:
Authorization: Bearer {{accessToken}}
```

Replace `SESSION_ID_HERE` with the actual session ID (e.g., `clx123abc`).

**Note**: Cannot revoke the current session using this endpoint.

#### 16. Logout from Other Devices

```
POST {{baseUrl}}/sessions/revoke-others
Headers:
Authorization: Bearer {{accessToken}}
```

**Response**: Revokes all sessions except the current one. Returns count of revoked sessions.

#### 17. Logout from All Devices

```
POST {{baseUrl}}/sessions/revoke-all
Headers:
Authorization: Bearer {{accessToken}}
```

**Response**: Revokes all sessions including current. User is logged out everywhere.

#### 18. Upload Media to S3

```
POST {{baseUrl}}/media/upload
Headers:
Authorization: Bearer {{accessToken}}
Body (form-data):
- file: [Select your file]
- path: users/avatars
- bucket: demo-test-aryu-me
```

**Example with Postman**:
1. Set method to POST
2. URL: `{{baseUrl}}/media/upload`
3. Headers: `Authorization: Bearer {{accessToken}}`
4. Body: Select "form-data"
5. Add key `file` with type "File" and select your file
6. (Optional) Add key `path` with value like "users/avatars"
7. (Optional) Add key `bucket` with your bucket name

**Response**: Returns file URL, path, size, and other metadata.

#### 19. Delete Media from S3

```
DELETE {{baseUrl}}/media/delete
Headers:
Authorization: Bearer {{accessToken}}
Content-Type: application/json
Body (JSON):
{
  "path": "users/avatars/1705320600000-a3b4c5.jpg",
  "bucket": "demo-test-aryu-me"
}
```

**Response**: Confirms file deletion with path and timestamp.

---

## 🔒 Security Features

### Password Security
- Passwords hashed with bcrypt (12 rounds)
- Minimum 8 characters required
- Password validation on registration and update

### Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 30 days
- Refresh tokens stored hashed in database
- Refresh tokens are rotated on every use
- HttpOnly cookies prevent XSS attacks
- Secure flag in production
- SameSite=Strict prevents CSRF

### Email Security
- Email verification required before login
- Password reset tokens expire in 1 hour
- Email verification tokens expire in 24 hours
- Tokens are single-use

### API Security
- Rate limiting (100 requests per 15 minutes globally)
- Stricter rate limiting for auth routes (20 requests per 15 minutes)
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Prevents user enumeration (password reset always returns success)

### Session Security
- Force logout everywhere on password change
- Manual logout revokes refresh token
- Account deletion clears all sessions
- **Session tracking with device fingerprinting**
- **IP address logging for security monitoring**
- **User agent parsing (browser, OS, device type)**
- **Session timestamps (created, last used, expiry)**
- **Granular session management (revoke specific or all sessions)**
- **Current session identification to prevent accidental logout**

---

## � How Session Management Works

### Session Lifecycle

1. **Login**: User logs in → Session created with device fingerprint
2. **Session Tracking**: IP, browser, OS, device type are recorded
3. **Activity Monitoring**: `lastUsedAt` updates on token refresh
4. **View Sessions**: User can see all active sessions with details
5. **Selective Logout**: Revoke specific sessions or all at once
6. **Auto Cleanup**: Expired sessions are automatically invalidated

### Session Information Captured

Each session (refresh token) stores:
- **Device Name**: e.g., "Google Chrome on Windows 10/11 (Desktop)"
- **IP Address**: Client's IP address at login
- **Browser**: Chrome, Firefox, Safari, Edge, etc.
- **Operating System**: Windows, macOS, Linux, iOS, Android
- **Device Type**: Desktop, Mobile, or Tablet
- **Timestamps**: Created at, last used at, expires at

### Use Cases

- **Security Monitoring**: See where you're logged in
- **Suspicious Activity**: Detect unauthorized access
- **Remote Logout**: Logout from lost/stolen devices
- **Session Cleanup**: Remove old/inactive sessions
- **Privacy Control**: Clear all sessions when needed

---

## 🔄 How Refresh Tokens Work

### Token Lifecycle

1. **Login**: User receives access token (15m) + refresh token (30d) + Session created with metadata
2. **API Calls**: Client uses access token in Authorization header
3. **Token Expiry**: Access token expires after 15 minutes
4. **Refresh**: Client calls `/auth/refresh-token` with refresh token cookie
5. **Rotation**: Old refresh token revoked, new one issued with updated metadata
6. **Session Update**: `lastUsedAt` timestamp is updated
7. **Repeat**: Client receives new access token

### Token Storage

**Access Token**:
- Stored in client memory/localStorage
- Sent in Authorization header: `Bearer TOKEN`
- Short-lived (15 minutes)

**Refresh Token**:
- **Client Side**: Store the **plain token** from login response (e.g., `abc123def456...`)
- **Server Side**: Stores the **hashed version** in database (SHA-256)
- **Important**: Always use the plain token from the login response, not the database value
- Stored as HttpOnly cookie (automatic) or in secure storage
- Automatically sent with requests to `/auth/refresh-token`
- Rotated on every use

**Why Two Versions?**
- **Plain Token**: Returned to client, used for API requests
- **Hashed Token**: Stored in database for security (if database is compromised, tokens can't be used)
- System automatically hashes the plain token before database lookup
- This is a security best practice (similar to password hashing)

### Security Benefits

- **Short-lived access tokens** minimize damage if stolen
- **HttpOnly cookies** prevent XSS attacks on refresh tokens
- **Token rotation** prevents refresh token reuse
- **Hashed storage** protects tokens in database
- **Automatic revocation** on password change or logout

---

## 📂 Project Structure

```
api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── dev.db                 # PostgreSQL database
├── src/
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── userController.js     # User logic
│   │   ├── sessionController.js  # Session management logic
│   │   └── mediaController.js    # Media upload/delete logic
│   ├── lib/
│   │   ├── auth.js            # Auth utilities (JWT, tokens, hashing, sessions)
│   │   ├── mailer.js          # Email sending
│   │   ├── prisma.js          # Prisma client
│   │   └── s3.js              # AWS S3 client configuration
│   ├── middlewares/
│   │   └── requireAuth.js     # Auth middleware
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── user.js            # User routes
│   │   ├── session.js         # Session management routes
│   │   └── media.js           # Media upload/delete routes
│   ├── utils/
│   │   ├── crypto.js          # Crypto utilities
│   │   └── deviceParser.js    # Device/browser/OS parsing
│   └── server.js              # Express server
├── .env                       # Environment variables (create from .env.example)
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🎯 Available Scripts

```bash
# Development
npm run dev                    # Start development server
DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/auth_api` |
| `
# Production
npm start                      # Start production server

# Database
npm run prisma:migrate         # Run migrations
npm run prisma:generate        # Generate Prisma Client
npm run prisma:studio          # Open Prisma Studio (GUI)
npm run prisma:reset           # Reset database (delete all data)
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/auth_api` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Refresh token expiry | `30` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | Required |
| `SMTP_PASS` | SMTP password | Required |
| `FROM_EMAIL` | Sender email | Same as `SMTP_USER` |
| `FROM_NAME` | Sender name | `Auth API` |
| `BASE_URL` | API base URL (for email links) | `http://localhost:4000` |
| `AWS_REGION` | AWS S3 region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | Required |
| `AWS_S3_BUCKET` | S3 bucket name | `demo-test-aryu-me` |

---

## 🐛 Common Errors

### Database errors

**Problem**: `PrismaClientInitializationError` or connection errors

**Solutions**:
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in `.env` is correct
3. Create the database: `createdb auth_api`
4. Run migrations: `npx prisma migrate dev`
5. Check PostgreSQL logs for connection issues
## 🐛 Common Errors

### Email not sending

**Problem**: Verification or reset emails not sent

**Solutions**:
1. Check SMTP credentials in `.env`
2. For Gmail, use [App Password](https://support.google.com/accounts/answer/185833)
3. Check console for email errors
4. Ensure `SMTP_USER` and `SMTP_PASS` are set

### Database errors

**Problem**: `PrismaClientInitializationError`

**Solution**: Run migrations:
```bash
npx prisma migrate dev
```

### Token errors

**Problem**: "Invalid or expired token"

**Solutions**:
1. Check JWT_SECRET is set
2. Access token may have expired (use refresh token)
3. Refresh token may have expired (login again)

### CORS errors

**Problem**: CORS policy blocking requests

**Solution**: Update `CORS_ORIGIN` in `.env` to match your frontend URL

---

## 📊 Database Schema

### User
- `id`: String (CUID)
- `email`: String (unique)
- `password`: String (hashed)
- `name`: String (optional)
- `role`: Enum (USER, ORGANIZATION) - default: USER
- `emailVerified`: Boolean
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relationships:
  - `business`: One-to-one with Business (optional)
  - `refreshTokens`: One-to-many with RefreshToken
  - `emailVerificationTokens`: One-to-many with EmailVerificationToken
  - `passwordResetTokens`: One-to-many with PasswordResetToken

### Business
- `id`: String (CUID)
- `name`: String (required)
- `location`: String (required)
- `workingHours`: String (optional)
- `description`: String (optional)
- `userId`: String (unique, foreign key to User)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- Relationships:
  - `user`: One-to-one with User (required, cascade delete)

**Business Rules**:
- USER role → business must be null
- ORGANIZATION role → business must exist
- One business per user (one-to-one relationship)
- Business is deleted when user is deleted (cascade)
- User can convert from USER to ORGANIZATION via API

### RefreshToken (Session)
- `id`: String (CUID)
- `token`: String (hashed, unique)
- `userId`: String
- `expiresAt`: DateTime
- `revoked`: Boolean
- `createdAt`: DateTime
- `lastUsedAt`: DateTime (tracks session activity)
- `ipAddress`: String (IP address of login)
- `userAgent`: String (full user agent string)
- `deviceName`: String (human-readable device description)
- `deviceType`: String (Desktop/Mobile/Tablet)
- `browser`: String (browser name)
- `os`: String (operating system)

### EmailVerificationToken
- `id`: String (CUID)
- `token`: String (hashed, unique)
- `userId`: String
- `email`: String
- `expiresAt`: DateTime
- `used`: Boolean
- `createdAt`: DateTime

### PasswordResetToken
- `id`: String (CUID)
- `token`: String (hashed, unique)
- `userId`: String
- `email`: String
- `expiresAt`: DateTime
- `used`: Boolean
- `createdAt`: DateTime

---

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=use-a-very-long-random-string-here
CORS_ORIGIN=https://your-frontend-domain.com
BASE_URL=https://your-api-domain.com
```
Use managed PostgreSQL service (AWS RDS, DigitalOcean, Supabase, etc.)
- ✅ Enable SSL for PostgreSQL connections in production
- ✅ Enable logging and monitoring
- ✅ Set up automated backups
- ✅ Configure connection pooling for better performance

### PostgreSQL Production Configuration

For production, use a managed PostgreSQL service and enable SSL:

**Connection String with SSL**:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**Connection Pooling** (for serverless/high-traffic):
Add `?connection_limit=10&pool_timeout=10` to your DATABASE_URL or use PgBouncer.Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

3. Run migrations:
```bash
npx prisma migrate dev
```

---

## 📝 License

ISC

---

## 👨‍💻 Support

For issues or questions, please open an issue in the repository.

---

**Made with ❤️ using Express, Prisma 7, PostgreSQL, and JWT**
