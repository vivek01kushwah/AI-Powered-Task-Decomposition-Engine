# Deployment Quick Reference Checklist

## Before You Start

- [ ] You have GitHub access to: `https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine`
- [ ] Create accounts:
  - [ ] Vercel: https://vercel.com
  - [ ] Render: https://render.com
  - [ ] MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

## MongoDB Atlas Setup (5-10 minutes)

1. **Create Free Cluster**
   - [ ] Go to https://www.mongodb.com/cloud/atlas
   - [ ] Create M0 cluster (free tier)
   - [ ] Choose region closest to you
   - [ ] Wait for cluster to be ready

2. **Create Database User**
   - [ ] Go to "Database Access"
   - [ ] Create user: `taskuser`
   - [ ] Set password: `P@ssw0rd123!TaskDB` (or your own)
   - [ ] Assign role: "Atlas Admin"

3. **Get Connection String**
   - [ ] Go to "Clusters" → "Connect"
   - [ ] Select "Drivers" → Node.js
   - [ ] Copy connection string
   - [ ] Replace `<PASSWORD>` with actual password
   - [ ] Add `/taskdb` before `?`
   - [ ] **Save this URL!**

4. **Allow Network Access**
   - [ ] Go to "Network Access"
   - [ ] Click "Add IP Address"
   - [ ] Select "Allow access from anywhere" (0.0.0.0/0)
   - [ ] Click "Confirm"

---

## Backend Deployment on Render (10-15 minutes)

1. **Prepare Files**
   - [ ] Verify `backend/.env.production` exists
   - [ ] Update `MONGODB_URI` with Atlas connection string
   - [ ] Update `JWT_SECRET` with a strong key (32+ characters)

2. **Create Render Account**
   - [ ] Go to https://render.com
   - [ ] Sign up with GitHub
   - [ ] Authorize access to repositories

3. **Deploy Service**
   - [ ] Click "New +" → "Web Service"
   - [ ] Select repository: `AI-Powered-Task-Decomposition-Engine`
   - [ ] Fill form:
     - Name: `task-decomposition-api`
     - Environment: `Node`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Add Environment Variables to Render**
   - [ ] MONGODB_URI: `mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority`
   - [ ] NODE_ENV: `production`
   - [ ] PORT: `5000`
   - [ ] JWT_SECRET: (your secret key)
   - [ ] CORS_ORIGIN: `http://localhost:3000` (temporary)

5. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait 5-10 minutes for deployment
   - [ ] **Copy your Render URL** (e.g., `https://task-decomposition-api.onrender.com`)
   - [ ] Save this URL!

---

## Frontend Deployment on Vercel (10-15 minutes)

1. **Prepare Files**
   - [ ] Verify `frontend/.env.production` exists
   - [ ] Update `REACT_APP_API_URL` with your Render URL

2. **Create Vercel Account**
   - [ ] Go to https://vercel.com
   - [ ] Sign up with GitHub
   - [ ] Authorize access to repositories

3. **Import Project**
   - [ ] Click "Add New" → "Project"
   - [ ] Paste repo URL: `https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine.git`
   - [ ] Click "Continue"

4. **Configure**
   - [ ] Root Directory: `frontend`
   - [ ] Framework Preset: `Create React App`
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `build`

5. **Add Environment Variable**
   - [ ] REACT_APP_API_URL: `https://task-decomposition-api.onrender.com`

6. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait 3-5 minutes
   - [ ] **Copy your Vercel URL** (e.g., `https://my-project-123abc.vercel.app`)
   - [ ] Save this URL!

---

## Final Configuration (5 minutes)

1. **Update Render CORS**
   - [ ] Go to Render dashboard
   - [ ] Select `task-decomposition-api`
   - [ ] Go to "Environment" tab
   - [ ] Update `CORS_ORIGIN` to your Vercel URL
   - [ ] Click "Save"
   - [ ] Wait 1-2 minutes for restart

---

## Testing (5 minutes)

1. **Test Backend**
   ```bash
   curl https://task-decomposition-api.onrender.com/api/health
   ```
   - [ ] Should return success response

2. **Test Frontend**
   - [ ] Open `https://your-vercel-url.vercel.app`
   - [ ] Homepage should load
   - [ ] Try decomposing a project
   - [ ] Check API calls work

3. **Check for Errors**
   - [ ] Open DevTools (F12)
   - [ ] Go to Console tab
   - [ ] No red errors should appear
   - [ ] Network tab shows successful API calls

---

## Troubleshooting Quick Links

| Issue | Check |
|-------|-------|
| CORS Error | Render `CORS_ORIGIN` matches Vercel URL exactly |
| API 404 | Render deployment URL in frontend `.env.production` |
| MongoDB connection fails | MongoDB Atlas IP whitelist (should be 0.0.0.0/0) |
| Frontend won't load | Vercel build logs for errors |
| Backend won't start | Render logs for MongoDB connection issues |

---

## URLs You'll Need

| Service | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| GitHub Repo | https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine |

---

## Important Notes

⚠️ **IMPORTANT**: After deploying on Vercel, you MUST:
1. Copy your Vercel URL
2. Go back to Render
3. Update `CORS_ORIGIN` environment variable
4. Save and wait for restart

Without this step, your frontend will get CORS errors!

---

**Total Time**: ~45-60 minutes for complete deployment

**Status**: [ ] In Progress / [ ] Completed
