# Deployment Guide - Rural Complaints System

## Local Development (Working Now!)

Your server is running on `http://localhost:5000`

### To run locally:

**Terminal 1 - Start Server:**
```bash
cd server
npm install  # if not done yet
npm start
# Should see: "Server running on port 5000"
```

**Terminal 2 - Start Client:**
```bash
cd client
npm install  # if not done yet
npm run dev
# Should open http://localhost:3000
```

**Terminal 3 - Start Admin:**
```bash
cd admin
npm install  # if not done yet
npm run dev
# Should open http://localhost:5173 or similar
```

The `.env.local` file in client folder already has: `VITE_API_URL=http://localhost:5000/api`

---

## Deployed Sites Configuration

### For Netlify/Vercel Deployment:

**Step 1: Deploy Server First**

Deploy your server to a platform like Render, Railway, or Heroku:
- Get your deployed server URL (e.g., `https://rural-complaints-api.render.com`)

**Step 2: Update Client Environment**

For each deployed site, set environment variable in deployment settings:

**Client App:**
```
VITE_API_URL=https://rural-complaints-api.render.com/api
```

**Admin App:**
```
VITE_API_URL=https://rural-complaints-api.render.com/api
```

### Server Deployment URL Example:
If deploying to Render:
```
https://rural-complaints-api.render.com/api
```

---

## Environment Files Setup

### Client `.env.local` (Development)
```
VITE_API_URL=http://localhost:5000/api
```

### Client `.env.production` (For Build)
```
VITE_API_URL=https://your-deployed-api-url/api
```

### Server `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rural-complaints
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## Troubleshooting

### Error: "net::ERR_CONNECTION_REFUSED"
- **Cause**: Server is not running
- **Fix**: Make sure server is running with `npm start` in the server folder

### Error: "Network Error" on deployed site
- **Cause**: API URL is pointing to localhost instead of deployed API
- **Fix**: Set `VITE_API_URL` environment variable in deployment settings (Netlify/Vercel)

### Complaints not submitting
1. Check browser console for API URL being used
2. Verify server is running (`http://localhost:5000/api/health` should work)
3. Check network tab to see actual request URL

---

## CORS Configuration

Server already has CORS enabled for:
- http://localhost:3000 (client)
- http://localhost:3001 (alternative)
- http://localhost:3002 (alternative)
- https://ruralvoice.netlify.app (deployed client)
- https://admin-ruralvoice.netlify.app (deployed admin)

To add more origins, update `server/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-deployed-url.netlify.app'
  ],
  credentials: true
}));
```

---

## MongoDB Connection

Current setup uses MongoDB Atlas (cloud):
- Connection string in `.env` as `MONGODB_URI`
- If using local MongoDB, change to: `mongodb://localhost:27017/rural-complaints`

---

## Next Steps

1. ✅ Server is running locally on port 5000
2. ✅ Client has correct `.env.local` setup
3. 📝 When deploying:
   - Deploy server first, get the URL
   - Set `VITE_API_URL` in client deployment settings
   - Add deployed URL to CORS in server if needed
