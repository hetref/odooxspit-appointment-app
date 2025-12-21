# 📅 Book Now ~ Schedule Smarter, Work Better Together

<div align="center">

**A comprehensive, full-stack appointment booking and management system**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Desktop App](#-desktop-app-tauri)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**OdooXspit Appointment App** is a modern, production-ready appointment booking system designed for organizations and businesses. It enables organizations to manage appointments, resources, team members, and bookings with ease. The system includes a web application, REST API backend, and a cross-platform desktop application built with Tauri.

### 🎯 What Makes It Special?

- **Multi-Platform**: Web app (Next.js) + Desktop app (Tauri)
- **Role-Based Access**: USER and ORGANIZATION roles with granular permissions
- **Complete Booking System**: Time slot management, conflict detection, and automatic/manual assignment
- **Payment Integration**: Razorpay Connect OAuth for per-organization payment accounts
- **AI Voice Integration**: Bolna integration for voice-based appointment management
- **Real-time Notifications**: Comprehensive notification system for all user actions
- **Session Management**: Track and manage active sessions across multiple devices
- **Media Management**: AWS S3 integration for file uploads
- **Security First**: JWT auth, bcrypt password hashing, CORS, rate limiting, and Helmet security

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- ✅ User registration with email verification
- ✅ Role-based access control (USER, ORGANIZATION)
- ✅ JWT access tokens (15 min expiry) + Refresh tokens (30 days)
- ✅ Password reset via email
- ✅ Multi-device session management with device tracking
- ✅ Logout from specific devices or all devices
- ✅ Automatic organization creation for ORGANIZATION role
- ✅ USER to ORGANIZATION account conversion

### 🏢 **Organization Management**
- ✅ Create and manage organizations with business hours
- ✅ Add/remove team members
- ✅ Resource management (rooms, equipment, staff)
- ✅ Custom appointment types with flexible scheduling
- ✅ Organization-specific Razorpay payment integration
- ✅ Bolna AI agent configuration per organization

### 📅 **Appointment System**
- ✅ Flexible appointment types (USER-based or RESOURCE-based)
- ✅ Custom duration and pricing per appointment
- ✅ Automatic or visitor-based assignment
- ✅ Multiple or single slot bookings
- ✅ Custom questions for booking forms
- ✅ Introduction and confirmation messages
- ✅ Publish/unpublish appointments
- ✅ Secret links for private appointments with expiry
- ✅ Expiry by time or booking capacity

### 🗓️ **Booking Management**
- ✅ Available time slot calculation with conflict detection
- ✅ Real-time availability checking
- ✅ Booking cancellation with policy enforcement
- ✅ User and organization booking history
- ✅ Booking status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- ✅ Custom user responses to appointment questions

### 💳 **Payment Processing**
- ✅ Razorpay Connect OAuth integration
- ✅ Per-organization payment accounts
- ✅ Order creation and webhook-driven payment updates
- ✅ Payment status tracking (PENDING, PAID, FAILED, REFUNDED)
- ✅ Free and paid appointments support

### 🔔 **Notification System**
- ✅ Real-time notifications for all major events
- ✅ Appointment, booking, payment, and organization notifications
- ✅ Mark as read/unread
- ✅ Notification dropdown with real-time updates
- ✅ 15+ notification types

### 🤖 **AI Voice Integration (Bolna)**
- ✅ Create and manage AI voice agents
- ✅ Initiate voice calls for appointment reminders
- ✅ Track call status, duration, and recordings
- ✅ Call transcripts and metadata

### 📁 **Media Management**
- ✅ AWS S3 integration for file uploads
- ✅ Support for images, videos, documents, and audio
- ✅ 50MB file size limit
- ✅ Custom bucket and path configuration
- ✅ File type validation

### 🔒 **Security Features**
- ✅ Helmet.js for HTTP headers security
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Bcrypt password hashing (12 rounds)
- ✅ HttpOnly cookies for refresh tokens
- ✅ Token rotation on every refresh
- ✅ Device and IP tracking
- ✅ Prevents user enumeration

---

## 🛠️ Tech Stack

### **Frontend (Web & Desktop)**
- **Framework**: Next.js 16.1.0 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Forms**: Custom components with validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode
- **Notifications**: Sonner

### **Backend (API)**
- **Runtime**: Node.js
- **Framework**: Express 4.21.2
- **Database**: PostgreSQL
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer (SMTP)
- **File Upload**: Multer + AWS S3
- **Payment**: Razorpay Connect OAuth
- **Security**: Helmet, CORS, express-rate-limit
- **AI Voice**: Bolna API integration

### **Desktop App**
- **Framework**: Tauri 2.x
- **Frontend**: Next.js (same as web)
- **Language**: Rust (Tauri backend)
- **Cross-Platform**: Windows, macOS, Linux

### **DevOps & Tools**
- **Database Migrations**: Prisma Migrate
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: Nodemon, TypeScript compiler

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                            │
├──────────────────┬──────────────────┬──────────────────────┤
│  Web App         │  Desktop App     │  Mobile (Future)     │
│  (Next.js)       │  (Tauri)         │                      │
└──────────────────┴──────────────────┴──────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│               (Express REST API - Port 4000)                │
└─────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Authentication │ │   Business   │ │   Integration    │
│   Services     │ │    Logic     │ │    Services      │
│                │ │              │ │                  │
│ • JWT Auth     │ │ • Orgs       │ │ • AWS S3         │
│ • Sessions     │ │ • Bookings   │ │ • Razorpay       │
│ • Email        │ │ • Resources  │ │ • Bolna AI       │
└────────────────┘ └──────────────┘ └──────────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                         │
│                   (Prisma ORM)                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│                   (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](./docs/images/landing-page.png)

### User Dashboard
![User Dashboard](./docs/images/user-dashboard.png)

### Organization Dashboard
![Organization Dashboard](./docs/images/org-dashboard.png)

### Appointment Creation
![Appointment Creation](./docs/images/create-appointment.png)

### Booking Interface
![Booking Interface](./docs/images/booking-interface.png)

### Available Slots
![Available Slots](./docs/images/available-slots.png)

### Notifications
![Notifications](./docs/images/notifications.png)

### Payment Integration
![Payment Integration](./docs/images/payment-razorpay.png)

### Session Management
![Session Management](./docs/images/session-management.png)

### Desktop App
![Desktop App](./docs/images/desktop-app.png)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)
- **(Optional) Rust** - For Tauri desktop app - [Install](https://www.rust-lang.org/tools/install)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/odooxspit-appointment-app.git
cd odooxspit-appointment-app
```

#### 2. Install Dependencies

**Backend (API)**
```bash
cd api
npm install
```

**Frontend (Web App)**
```bash
cd ../frontend
npm install
```

**Desktop App (Tauri) - Optional**
```bash
cd ../tauri
npm install
```

#### 3. Set Up PostgreSQL Database

Start PostgreSQL and create a database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE appointment_app;
\q
```

Or use pgAdmin, DBeaver, or any PostgreSQL GUI tool.

### Environment Variables

#### Backend (.env)

Create a `.env` file in the `api` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/appointment_app?schema=public"

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
FROM_NAME=BookNow Appointments

# Base URL (for email links)
BASE_URL=http://localhost:4000

# AWS S3 Configuration (for media uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name

# Razorpay Connect Configuration
RAZORPAY_CLIENT_ID=your-razorpay-partner-client-id
RAZORPAY_CLIENT_SECRET=your-razorpay-partner-client-secret
RAZORPAY_OAUTH_AUTHORIZE_URL=https://auth.razorpay.com/authorize
RAZORPAY_OAUTH_TOKEN_URL=https://auth.razorpay.com/token
RAZORPAY_API_BASE_URL=https://api.razorpay.com/v1
RAZORPAY_REDIRECT_URI=http://localhost:4000/auth/razorpay/callback
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-signing-secret
RAZORPAY_STATE_SECRET=change-this-state-secret

# Bolna AI Configuration (Optional)
BOLNA_API_BASE_URL=https://api.bolna.dev
```

**Important Notes**:
- For Gmail SMTP, use an [App Password](https://support.google.com/accounts/answer/185833)
- Replace all placeholder values with your actual credentials
- Never commit `.env` to version control

#### Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Running the Application

#### 1. Run Database Migrations

```bash
cd api
npx prisma migrate dev
npx prisma generate
```

#### 2. Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The API will start at `http://localhost:4000`

#### 3. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The web app will start at `http://localhost:3000`

#### 4. (Optional) Run Desktop App

In a new terminal:

```bash
cd tauri
npm run tauri dev
```

### 🎉 You're All Set!

- **Web App**: http://localhost:3000
- **API**: http://localhost:4000
- **Database Studio**: Run `npm run prisma:studio` in `api` directory

---

## 📂 Project Structure

```
odooxspit-appointment-app/
│
├── api/                          # Backend API
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   │
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── bookingController.js
│   │   │   ├── organizationController.js
│   │   │   └── ...
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js
│   │   │   ├── booking.js
│   │   │   ├── organization.js
│   │   │   └── ...
│   │   │
│   │   ├── middlewares/          # Custom middleware
│   │   │   └── requireAuth.js
│   │   │
│   │   ├── lib/                  # Utility libraries
│   │   │   ├── auth.js
│   │   │   ├── mailer.js
│   │   │   ├── prisma.js
│   │   │   ├── razorpay.js
│   │   │   ├── bolnaClient.js
│   │   │   └── s3.js
│   │   │
│   │   ├── utils/                # Helper functions
│   │   │   ├── crypto.js
│   │   │   └── deviceParser.js
│   │   │
│   │   └── server.js             # Express app entry point
│   │
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── README.md
│
├── frontend/                     # Next.js Web App
│   ├── app/                      # App Router pages
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── (dashboard)/          # Dashboard pages
│   │   ├── appointment/          # Appointment pages
│   │   ├── org/                  # Organization pages
│   │   ├── search/               # Search page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/               # React components
│   │   ├── auth/                 # Auth components
│   │   ├── booking/              # Booking components
│   │   ├── dashboard/            # Dashboard components
│   │   └── ui/                   # Reusable UI components
│   │
│   ├── contexts/                 # React contexts
│   │   └── UserContext.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-auth.ts
│   │   └── use-mobile.ts
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth helpers
│   │   ├── routes.ts             # Route constants
│   │   └── types.ts              # TypeScript types
│   │
│   ├── public/                   # Static assets
│   ├── .env.local                # Environment variables
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── tauri/                        # Desktop App (same structure as frontend)
│   ├── src-tauri/                # Tauri Rust backend
│   │   ├── src/
│   │   │   └── main.rs
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   │
│   └── [Same as frontend]
│
├── docs/                         # Documentation
│   └── images/                   # Screenshots and images
│
├── .gitignore
├── LICENSE
└── README.md                     # This file
```

---

## 📚 API Documentation

Comprehensive API documentation is available in the [api/README.md](./api/README.md) file.

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/verify-email` - Verify email
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password

#### User Management
- `GET /user/me` - Get current user profile
- `PUT /user/update` - Update user profile
- `DELETE /user/delete` - Delete user account
- `POST /user/convert-to-organization` - Convert USER to ORGANIZATION

#### Organization
- `POST /organization/members` - Add member (admin only)
- `GET /organization/members` - Get all members
- `POST /organization/resources` - Create resource
- `GET /organization/resources` - Get all resources
- `DELETE /organization/resources/:id` - Delete resource

#### Appointments
- `POST /organization/appointments` - Create appointment
- `GET /organization/appointments` - Get all appointments
- `GET /organization/appointments/:id` - Get single appointment
- `PUT /organization/appointments/:id` - Update appointment
- `DELETE /organization/appointments/:id` - Delete appointment

#### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get user bookings
- `GET /bookings/:id` - Get booking details
- `PUT /bookings/:id/cancel` - Cancel booking
- `GET /organization/bookings` - Get organization bookings

#### Public (No Auth Required)
- `GET /public/organizations/:id/appointments` - Browse public appointments
- `GET /public/appointments/:id/slots` - Get available slots

For complete API documentation, see [api/README.md](./api/README.md).

---

## 🖥️ Desktop App (Tauri)

The desktop application provides the same functionality as the web app with additional benefits:

- **Native Performance**: Faster than browser-based apps
- **Offline Capability**: Work without internet (with limitations)
- **System Integration**: Better OS integration
- **Privacy**: No browser tracking
- **Cross-Platform**: Windows, macOS, and Linux

### Building Desktop App

```bash
cd tauri
npm run tauri build
```

Built apps will be in `tauri/src-tauri/target/release/bundle/`

---

## 🚀 Deployment

### Backend (API)

**Option 1: Traditional Hosting (VPS, AWS EC2)**

1. Set up PostgreSQL database
2. Install Node.js
3. Clone repository and install dependencies
4. Set environment variables
5. Run migrations
6. Start with PM2: `pm2 start src/server.js`

**Option 2: Platform as a Service**

- **Railway**: One-click deploy
- **Heroku**: Buildpack support
- **Render**: PostgreSQL included
- **DigitalOcean App Platform**: Managed solution

### Frontend (Web App)

**Option 1: Vercel (Recommended)**

```bash
cd frontend
vercel --prod
```

**Option 2: Netlify**

```bash
cd frontend
npm run build
netlify deploy --prod --dir=out
```

**Option 3: Self-Hosted**

```bash
cd frontend
npm run build
npm start
```

### Desktop App

Build for your target platform:

```bash
cd tauri
npm run tauri build
```

Distribute the generated installers.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com
- Portfolio: https://yourwebsite.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Tauri](https://tauri.app/) - Build smaller, faster desktop apps
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Bolna](https://bolna.dev/) - AI voice platform

---

## 📞 Support

If you encounter any issues or have questions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/odooxspit-appointment-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/odooxspit-appointment-app/discussions)
- **Email**: support@yourdomain.com

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video call integration
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Recurring appointments
- [ ] Waiting list management
- [ ] Custom branding per organization
- [ ] API rate limiting per organization
- [ ] Webhook support for third-party integrations

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Your Name]

</div>
