# Quick Start Guide

This guide will help you get the OdooXspit Appointment App running on your local machine in minutes.

## Prerequisites

Make sure you have these installed:
- ✅ Node.js (v16+) - [Download](https://nodejs.org/)
- ✅ PostgreSQL (v12+) - [Download](https://www.postgresql.org/)
- ✅ Git - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/hetref/odooxspit-appointment-app.git
cd odooxspit-appointment-app
```

## Step 2: Set Up PostgreSQL Database

### Windows (pgAdmin or psql)
```bash
# Start PostgreSQL service
# Then create database
psql -U postgres
CREATE DATABASE appointment_app;
\q
```

### macOS
```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb appointment_app
```

### Linux
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb appointment_app
```

## Step 3: Backend Setup

```bash
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your credentials
# Minimum required:
# - DATABASE_URL
# - JWT_SECRET
# - SMTP credentials (for email)

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Start backend server
npm run dev
```

Backend should now be running at http://localhost:4000

## Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start frontend
npm run dev
```

Frontend should now be running at http://localhost:3000

## Step 5: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" and create an account
3. Check your email for verification (check spam folder)
4. Verify your email and log in
5. Explore the dashboard!

## Common Issues & Solutions

### Database Connection Error
**Problem:** `Can't reach database server`

**Solution:**
- Make sure PostgreSQL is running
- Check DATABASE_URL in `.env` matches your PostgreSQL credentials
- Default: `postgresql://postgres:password@localhost:5432/appointment_app`

### Email Not Sending
**Problem:** Verification emails not received

**Solution:**
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833)
- Check SMTP settings in `.env`
- Check spam folder

### Port Already in Use
**Problem:** `Port 4000 already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill
```

Or change PORT in `.env` file.

### Prisma Client Not Generated
**Problem:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd api
npx prisma generate
```

## Next Steps

- [ ] Explore the dashboard
- [ ] Create an organization (convert to ORGANIZATION role)
- [ ] Add team members
- [ ] Create resources
- [ ] Set up appointments
- [ ] Make a test booking
- [ ] Configure payment integration (optional)

## Need Help?

- 📖 Read the full [README.md](README.md)
- 🐛 [Report an issue](https://github.com/hetref/odooxspit-appointment-app/issues)
- 💬 [Ask in Discussions](https://github.com/hetref/odooxspit-appointment-app/discussions)

## Optional: Desktop App

To run the desktop app:

```bash
cd tauri

# Install dependencies
npm install

# Install Rust (if not already installed)
# Visit: https://rustup.rs/

# Run desktop app
npm run tauri dev
```

Enjoy! 🚀
