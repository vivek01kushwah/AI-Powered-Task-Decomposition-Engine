# Complete Deployment Guide: Vercel + Render + MongoDB Atlas

This guide provides step-by-step instructions for deploying your **AI-Powered Task Decomposition Engine** on Vercel (frontend) and Render (backend) with MongoDB Atlas as the cloud database.

---

## **Prerequisites**

Before starting, ensure you have:
- ✅ GitHub account (your repo is already there)
- ✅ GitHub repo: `https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine.git`
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Render account (sign up at https://render.com)
- ✅ MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)

---

## **Step 1: Set Up MongoDB Atlas (Cloud Database)**

Since your current MongoDB Compass database is local, Render cannot access it. You need to migrate to MongoDB Atlas.

### 1.1 Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Sign Up"** (or sign in if you have an account)
3. Create a free M0 cluster:
   - **Cloud Provider**: AWS
   - **Region**: Your region (e.g., ap-south-1 for India)
   - **Cluster Name**: `task-decomposition-cluster`
4. Click **"Create Cluster"** (wait 2-3 minutes for creation)

### 1.2 Create Database User

1. In MongoDB Atlas, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Set credentials:
   - **Username**: `taskuser`
   - **Password**: Create a strong password (e.g., `P@ssw0rd123!TaskDB`)
   - **Save this password!**
4. Add role: **"Built-in Role"** → Select **"Atlas Admin"**
5. Click **"Add User"**

### 1.3 Get Connection String

1. Go to **"Database"** → Click **"Connect"** button
2. Select **"Drivers"**
3. Choose **Node.js** and version **3.12+**
4. Copy the connection string:
   ```
   mongodb+srv://taskuser:<PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace:
   - `<PASSWORD>` with your actual password: `P@ssw0rd123!TaskDB`
   - Add `/taskdb` at the end before `?`
   
   **Final**: `mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority`

### 1.4 Allow Network Access

1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

---

## **Step 2: Prepare Backend Environment Files**

Update your backend environment configuration.

### 2.1 Create `.env.production` in Backend

Create file: `backend/.env.production`

```env
# Database Configuration
MONGODB_URI=mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-for-production
JWT_EXPIRE=7d

# CORS (Update after Vercel deployment with actual Vercel URL)
CORS_ORIGIN=https://your-app-name.vercel.app

# Logging
LOG_LEVEL=info
```

### 2.2 Update Backend `server.js`

Your `server.js` already has proper CORS configuration:
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

✅ **No changes needed** - this is already correct!

---

## **Step 3: Deploy Backend on Render**

### 3.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 3.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select: `AI-Powered-Task-Decomposition-Engine`
4. Click **"Connect"**

### 3.3 Configure Deployment Settings

In the deployment form, enter:

| Setting | Value |
|---------|-------|
| **Name** | `task-decomposition-api` |
| **Environment** | `Node` |
| **Region** | `Singapore` (or your preferred region) |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 3.4 Add Environment Variables

Click **"Add Environment Variable"** and add these one by one:

1. **MONGODB_URI**
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority`

2. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

3. **PORT**
   - Key: `PORT`
   - Value: `5000`

4. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `your-super-secret-key-minimum-32-characters-long-for-production`

5. **CORS_ORIGIN** (leave empty for now, we'll update after Vercel deployment)
   - Key: `CORS_ORIGIN`
   - Value: `http://localhost:3000` (temporary, will update later)

### 3.5 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see a green checkmark
4. **Copy your Render URL** (e.g., `https://task-decomposition-api.onrender.com`)
5. Save this URL - you'll need it for the frontend!

---

## **Step 4: Configure Frontend for Vercel**

### 4.1 Update Frontend Environment

Edit or create: `frontend/.env.production`

```env
REACT_APP_API_URL=https://task-decomposition-api.onrender.com
VITE_API_URL=https://task-decomposition-api.onrender.com
```

### 4.2 Ensure API Service Uses Environment Variable

Check `frontend/src/services/apiService.js` or similar:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    process.env.VITE_API_URL || 
                    'http://localhost:5000';

export const decomposeProject = (data) => {
  return axios.post(`${API_BASE_URL}/api/decompose`, data);
};
```

---

## **Step 5: Deploy Frontend on Vercel**

### 5.1 Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Paste your GitHub URL: `https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine.git`
5. Click **"Continue"**

### 5.2 Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Create React App` (or auto-detect) |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

### 5.3 Add Environment Variables

1. Click **"Environment Variables"**
2. Add the variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://task-decomposition-api.onrender.com`

### 5.4 Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. Once completed, Vercel shows your live URL: `https://your-app-name.vercel.app`
4. **Copy this URL** - you need it for the final step!

---

## **Step 6: Update Render CORS**

Now that Vercel has given you the final URL, update Render to allow requests from it:

1. Go to https://render.com
2. Click on your service: `task-decomposition-api`
3. Go to **"Environment"** tab
4. Find `CORS_ORIGIN` variable
5. Update its value to your Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
6. Click **"Save"** (Render will restart the service automatically)
7. Wait 1-2 minutes for the service to restart

---

## **Step 7: Test Your Deployment**

### 7.1 Test Backend

Open your terminal and test the backend API:

```bash
curl https://task-decomposition-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2026-02-04T10:00:00Z"
}
```

### 7.2 Test Frontend

1. Open `https://your-app-name.vercel.app` in your browser
2. You should see the Task Decomposition Platform homepage
3. Try:
   - Enter a project description
   - Click "Analyze"
   - Verify it connects to the backend API

### 7.3 Check Browser Console

If you see API errors:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors mentioning CORS or API URL
4. Verify the `CORS_ORIGIN` in Render matches your Vercel URL exactly

---

## **Step 8: Troubleshooting**

### Issue: CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Go to Render dashboard → your service
2. Check `CORS_ORIGIN` exactly matches your Vercel URL
3. Example: `https://my-project-123abc.vercel.app` (no trailing slash)

### Issue: Backend Not Responding

**Error**: `Cannot reach backend at https://task-decomposition-api.onrender.com`

**Solution**:
1. Check Render service status (green light = running)
2. Test directly: `curl https://task-decomposition-api.onrender.com/api/health`
3. Check MongoDB connection:
   - Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
   - Verify credentials in connection string

### Issue: Database Connection Failed

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
1. Verify `MONGODB_URI` in Render environment variables
2. Check username/password in connection string
3. In MongoDB Atlas → Network Access → ensure 0.0.0.0/0 is allowed

### Issue: Build Fails on Vercel

**Error**: `Build failed` during deployment

**Solution**:
1. Check build logs on Vercel dashboard
2. Ensure `frontend/` folder exists and has valid `package.json`
3. Clear build cache: Vercel → Settings → Git → Redeploy

---

## **Environment Variables Summary**

### MongoDB Atlas
```
Username: taskuser
Password: P@ssw0rd123!TaskDB
Connection String: mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
```

### Render (Backend)
```
MONGODB_URI=mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
CORS_ORIGIN=https://your-app-name.vercel.app
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://task-decomposition-api.onrender.com
```

---

## **Post-Deployment Checklist**

- [ ] MongoDB Atlas cluster created and running
- [ ] Backend deployed on Render with all environment variables set
- [ ] Frontend deployed on Vercel with API URL configured
- [ ] Render CORS_ORIGIN updated to Vercel URL
- [ ] Backend health check responds at `/api/health`
- [ ] Frontend loads without console errors
- [ ] Can submit project description and get results
- [ ] API calls visible in browser network tab

---

## **Next Steps**

After deployment:

1. **Enable Auto-Deploy**: 
   - Vercel: Automatically deploys on push to main
   - Render: Configure webhooks for auto-deploy

2. **Monitor Performance**:
   - Vercel: Dashboard → Analytics
   - Render: Dashboard → Metrics

3. **Set Up Alerts**:
   - Render: Enable email alerts for deployments/failures
   - Vercel: Enable deployment notifications

4. **Scale if Needed**:
   - Render: Upgrade from free to paid tier if needed
   - MongoDB Atlas: Upgrade from M0 to M2/M10 for production

---

## **Support**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com/
- **Your Repo**: https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine

---

**Good luck with your deployment! 🚀**
