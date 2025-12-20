# API Configuration Guide

## Problem: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error occurs when the frontend tries to connect to the backend API but receives an HTML page instead of JSON. This usually happens when:

1. **Backend server is not running**
2. **Wrong API URL configured**
3. **CORS issues**
4. **ngrok tunnel is down**

## Solution

### Option 1: Local Backend (Recommended for Development)

1. **Start the backend server:**
   ```bash
   cd api
   npm install
   npm start
   ```
   The server should start on `http://localhost:4000`

2. **Update frontend `.env.local`:**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Option 2: Using ngrok

If you need to expose your local backend to the internet:

1. **Start the backend server:**
   ```bash
   cd api
   npm start
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 4000
   ```
   
3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

4. **Update frontend `.env.local`:**
   ```
   NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```

5. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Verify Backend is Running

Open your browser or use curl:
```bash
curl http://localhost:4000/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-12-20T..."
}
```

## Current Configuration

- **Frontend**: `http://localhost:3000`
- **Backend**: Check `.env.local` or defaults to `http://localhost:4000`

## Common Issues

1. **Backend not running**: Start it with `npm start` in the `api` folder
2. **Port already in use**: Change the port in `api/.env` or kill the process
3. **ngrok tunnel expired**: Restart ngrok and update the URL
4. **CORS errors**: Backend is configured to allow all origins
