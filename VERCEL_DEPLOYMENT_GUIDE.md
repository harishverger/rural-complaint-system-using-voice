# Vercel Deployment Guide

## Overview
This guide will help you deploy the Rural Complaint System to Vercel. The project consists of three separate deployments:
1. **Server** (Backend API) - Node.js/Express
2. **Client** (User Frontend) - React/Vite
3. **Admin** (Admin Dashboard) - React/Vite

---

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. Your GitHub repository pushed with latest code
4. MongoDB Atlas connection string
5. JWT secret key

---

## Step 1: Deploy Server (Backend API)

### 1.1 Navigate to server directory
```bash
cd server
```

### 1.2 Login to Vercel
```bash
vercel login
```

### 1.3 Deploy to Vercel
```bash
vercel
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Select your account
- Link to existing project: **N**
- Project name: `rural-complaint-server` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: **N**

### 1.4 Add Environment Variables
After deployment, add environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Click on **Settings** → **Environment Variables**
3. Add the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 1.5 Deploy to Production
```bash
vercel --prod
```

**Note your server URL** (e.g., `https://rural-complaint-server.vercel.app`)

---

## Step 2: Deploy Client (User Frontend)

### 2.1 Update Client Environment Variables
Edit `client/.env.production`:
```env
VITE_API_URL=https://YOUR_SERVER_URL.vercel.app/api
```
Replace `YOUR_SERVER_URL` with your actual server URL from Step 1.5

### 2.2 Navigate to client directory
```bash
cd ../client
```

### 2.3 Deploy to Vercel
```bash
vercel
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Select your account
- Link to existing project: **N**
- Project name: `rural-complaint-client` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: **N**

### 2.4 Deploy to Production
```bash
vercel --prod
```

**Note your client URL** (e.g., `https://rural-complaint-client.vercel.app`)

---

## Step 3: Deploy Admin (Admin Dashboard)

### 3.1 Update Admin Environment Variables
Create `admin/.env.production`:
```env
VITE_API_URL=https://YOUR_SERVER_URL.vercel.app/api
```
Replace `YOUR_SERVER_URL` with your actual server URL from Step 1.5

### 3.2 Navigate to admin directory
```bash
cd ../admin
```

### 3.3 Deploy to Vercel
```bash
vercel
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Select your account
- Link to existing project: **N**
- Project name: `rural-complaint-admin` (or your preferred name)
- Directory: `./` (current directory)
- Override settings: **N**

### 3.4 Deploy to Production
```bash
vercel --prod
```

**Note your admin URL** (e.g., `https://rural-complaint-admin.vercel.app`)

---

## Step 4: Update CORS Settings

### 4.1 Update Server CORS
Edit `server/index.js` and update the CORS origin array with your deployed URLs:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://rural-complaint-client.vercel.app',  // Your client URL
    'https://rural-complaint-admin.vercel.app'     // Your admin URL
  ],
  credentials: true
}));
```

### 4.2 Redeploy Server
```bash
cd server
vercel --prod
```

---

## Step 5: Test Your Deployment

### Test Client App
1. Visit your client URL
2. Try selecting a language
3. Record a voice complaint
4. Submit a complaint
5. Check "My Complaints"

### Test Admin Dashboard
1. Visit your admin URL
2. Login with admin credentials
3. View complaints dashboard
4. Assign volunteers
5. Update complaint status
6. Delete complaints

---

## Alternative: Deploy via Vercel Dashboard

### For each app (Server, Client, Admin):

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: 
     - Server: Other
     - Client/Admin: Vite
   - **Root Directory**: Select `server`, `client`, or `admin`
   - **Build Command**: `npm run build` (for client/admin)
   - **Output Directory**: `dist` (for client/admin)
5. Add Environment Variables (for server):
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=5000`
6. Add Environment Variables (for client/admin):
   - `VITE_API_URL=https://your-server-url.vercel.app/api`
7. Click **Deploy**

---

## Troubleshooting

### Issue: 404 on Client Routes
**Solution**: Vercel.json already includes rewrites. Make sure it's present in the deployment.

### Issue: API Requests Failing
**Solution**: 
1. Check CORS settings in server
2. Verify VITE_API_URL is correct in client/admin
3. Check Network tab in browser DevTools

### Issue: Environment Variables Not Working
**Solution**: 
1. Make sure they're added in Vercel dashboard
2. Redeploy after adding environment variables
3. For Vite apps, variables must start with `VITE_`

### Issue: MongoDB Connection Failed
**Solution**: 
1. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify connection string is correct
3. Check if IP whitelist includes Vercel's IPs

---

## Important Notes

1. **Free Tier Limits**: Vercel free tier has limits on:
   - Bandwidth: 100GB/month
   - Serverless function execution time: 10 seconds
   - Build time: 45 minutes/month

2. **File Uploads**: Vercel serverless functions have a 4.5MB payload limit. For larger files, consider using a cloud storage service like Cloudinary or AWS S3.

3. **MongoDB Atlas**: Make sure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) or add Vercel's IP ranges.

4. **Custom Domains**: You can add custom domains in Vercel dashboard under project settings.

---

## Your Deployed URLs

After deployment, you'll have three URLs:

- **Client (User App)**: https://rural-complaint-client.vercel.app
- **Admin Dashboard**: https://rural-complaint-admin.vercel.app
- **Server API**: https://rural-complaint-server.vercel.app

Share the Client URL with users and Admin URL with administrators!

---

## Updating Your Deployment

To update any app after making changes:

```bash
cd <server|client|admin>
git pull origin main  # Get latest changes
vercel --prod        # Deploy to production
```

Or enable **Auto-Deploy** in Vercel dashboard to automatically deploy when you push to GitHub!
