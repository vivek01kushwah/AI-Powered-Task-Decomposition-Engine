# Visual Deployment Guide: Step-by-Step

> This guide provides detailed text-based instructions with key steps highlighted. Follow exactly as written.

---

## **PHASE 1: MongoDB Atlas Setup**

### Step 1.1: Create MongoDB Atlas Account
```
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" or "Sign In"
3. Create a new account with GitHub (easiest)
```

### Step 1.2: Create Free Cluster
```
After login:
1. Click "Create a Deployment"
2. Select "Free" tier
3. Choose your region (Asia → ap-south-1)
4. Name your cluster: "task-decomposition-cluster"
5. Click "Create Deployment"
6. ⏳ WAIT 2-3 MINUTES FOR CLUSTER TO BE READY
```

### Step 1.3: Create Database User
```
When cluster is ready:
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Enter:
   - Username: taskuser
   - Password: P@ssw0rd123!TaskDB (save this!)
   - Auth Method: Password
4. Add Built-in Role: "Atlas Admin"
5. Click "Add User"
```

### Step 1.4: Get MongoDB Connection String
```
1. Go back to "Databases" (left menu)
2. Click your cluster name → "Connect"
3. Choose "Drivers" → Node.js → version 3.12+
4. Copy the connection string:
   mongodb+srv://taskuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
5. Replace:
   - <password> with: P@ssw0rd123!TaskDB
   - Add /taskdb after the URL, before the ?
6. FINAL STRING:
   mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
7. SAVE THIS! You'll need it for Render.
```

### Step 1.5: Allow Network Access
```
1. Click "Network Access" (left menu)
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere"
4. Click "Confirm"
   (This allows Render to connect from any IP)
```

✅ **MongoDB Atlas Setup Complete!**

---

## **PHASE 2: Render Backend Deployment**

### Step 2.1: Create Render Account
```
1. Go to: https://render.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Render to access your GitHub repositories
```

### Step 2.2: Create New Web Service
```
After login to Render:
1. Click "New +" (top right)
2. Select "Web Service"
3. You'll be asked to select a repository
4. Find your repo: "AI-Powered-Task-Decomposition-Engine"
5. Click "Connect"
```

### Step 2.3: Configure Deployment Settings
```
In the deployment form, fill in:

Name:                    task-decomposition-api
Environment:             Node
Region:                  Singapore (choose closest to you)
Root Directory:          backend
Build Command:           npm install
Start Command:           npm start
Plan:                    Free (for testing)
```

### Step 2.4: Add Environment Variables
```
For each variable, click "Add Environment Variable":

Variable 1:
  Key:    MONGODB_URI
  Value:  mongodb+srv://taskuser:P@ssw0rd123!TaskDB@cluster0.xxxxx.mongodb.net/taskdb?retryWrites=true&w=majority
  (Paste the MongoDB connection string from Step 1.4)

Variable 2:
  Key:    NODE_ENV
  Value:  production

Variable 3:
  Key:    PORT
  Value:  5000

Variable 4:
  Key:    JWT_SECRET
  Value:  your-super-secret-key-minimum-32-characters-long-for-production
  (Create a strong, random string. Use: openssl rand -base64 32)

Variable 5:
  Key:    CORS_ORIGIN
  Value:  http://localhost:3000
  (We'll update this after Vercel deployment)
```

### Step 2.5: Deploy Backend
```
1. Click "Create Web Service"
2. ⏳ WAIT 5-10 MINUTES for deployment
3. You'll see deployment logs in the dashboard
4. When complete, you'll see: "Deployment successful" ✅
5. Copy your Render URL from the top of the page
   Example: https://task-decomposition-api.onrender.com
6. SAVE THIS URL! You need it for frontend.
```

✅ **Render Backend Deployment Complete!**

---

## **PHASE 3: Vercel Frontend Deployment**

### Step 3.1: Create Vercel Account
```
1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub
4. Authorize Vercel to access your GitHub repositories
```

### Step 3.2: Import Project
```
After login to Vercel:
1. Click "Add New" (top left)
2. Select "Project"
3. Click "Import Git Repository"
4. Paste your repo URL:
   https://github.com/vivek01kushwah/AI-Powered-Task-Decomposition-Engine.git
5. Click "Continue"
```

### Step 3.3: Configure Project
```
Vercel auto-detects settings. Verify/set:

Framework Preset:        Create React App (auto-detected)
Root Directory:          frontend
Build Command:           npm run build
Output Directory:        build
Install Command:         npm install
Node Version:            18.x (or higher)
```

### Step 3.4: Add Environment Variables
```
Click "Environment Variables" and add:

Name:                    REACT_APP_API_URL
Value:                   https://task-decomposition-api.onrender.com
(Use your Render URL from Phase 2, Step 2.5)

Leave other environment variables empty unless you know they're needed.
```

### Step 3.5: Deploy Frontend
```
1. Click "Deploy"
2. ⏳ WAIT 3-5 MINUTES for deployment
3. You'll see a progress bar and build logs
4. When complete, you'll see: "Congratulations! Your site is live" ✅
5. Click on "Visit" to see your live site
6. Copy your Vercel URL from the page
   Example: https://task-decomposition-api-vivek01kushwah.vercel.app
7. SAVE THIS URL! You need it to update Render CORS.
```

✅ **Vercel Frontend Deployment Complete!**

---

## **PHASE 4: Update Render CORS (Critical!)**

### Step 4.1: Go Back to Render
```
1. Open: https://dashboard.render.com
2. Find your service: "task-decomposition-api"
3. Click on it to open
```

### Step 4.2: Update CORS Environment Variable
```
1. Click "Environment" tab (right side)
2. Find the "CORS_ORIGIN" variable
3. Click the "✏️" (edit) icon
4. Change the value from:
   http://localhost:3000
   to:
   https://your-vercel-url.vercel.app
   (Use your exact Vercel URL from Phase 3, Step 3.5)
5. Click "Save"
6. ⏳ WAIT 1-2 MINUTES for Render to restart the service
7. Check the dashboard - you should see "Deployed" ✅
```

✅ **CORS Configuration Complete! This is Critical!**

---

## **PHASE 5: Testing Your Deployment**

### Step 5.1: Test Backend API
```
Open terminal and run:
  curl https://task-decomposition-api.onrender.com/api/health

Expected response:
  {"status":"Server is running","timestamp":"2026-02-04T10:00:00Z"}

If this works, your backend is connected correctly! ✅
```

### Step 5.2: Test Frontend
```
1. Open your browser
2. Go to: https://your-vercel-url.vercel.app
3. The homepage should load without errors
4. You should see the Task Decomposition form
```

### Step 5.3: Test Full Integration
```
1. On the homepage, scroll down
2. Enter a project description in the form:
   "I need to build an e-commerce website with payment processing,
    user authentication, product catalog, and order tracking.
    I have a team of 3 people and 2 weeks deadline."
3. Click "Analyze" button
4. You should see the results appear
5. Check browser DevTools (F12 → Console) for errors

If you see results, the integration works! ✅
```

### Step 5.4: Verify API Communication
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh the page
4. Look for requests to:
   - https://task-decomposition-api.onrender.com/api/*
5. All requests should have status 200 or 201 ✅
6. If you see status 403 or 404, check CORS_ORIGIN in Render
```

✅ **Testing Complete!**

---

## **Troubleshooting**

### Problem: CORS Error in Browser

**Error Message**:
```
Access to XMLHttpRequest blocked by CORS policy:
No 'Access-Control-Allow-Origin' header
```

**Solution**:
```
1. Go to: https://dashboard.render.com
2. Select your service: task-decomposition-api
3. Click "Environment"
4. Find CORS_ORIGIN
5. Verify it EXACTLY matches your Vercel URL
   (Including https:// and .vercel.app)
6. No trailing slashes!
7. Click Save
8. Wait 2 minutes for restart
9. Refresh your browser
```

### Problem: API Returns 404 Error

**Error Message**:
```
Cannot POST /api/decompose (404)
```

**Solution**:
```
1. Check your frontend .env.production file
2. Verify REACT_APP_API_URL is correct:
   Should be: https://task-decomposition-api.onrender.com
   (The exact URL from your Render dashboard)
3. Redeploy frontend on Vercel:
   - Go to Vercel dashboard
   - Click your project
   - Click "Redeploy" button
   - Select "Use default build settings"
4. Wait 3-5 minutes
5. Refresh browser
```

### Problem: MongoDB Connection Error

**Error Message** (in Render logs):
```
Error: connect ECONNREFUSED
MongoError: authentication failed
```

**Solution**:
```
1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Check Network Access:
   - Click "Network Access"
   - Verify 0.0.0.0/0 is allowed
   - If not, click "Add IP Address" → "Allow Access from Anywhere"
3. Verify connection string in Render:
   - Go to Render dashboard
   - Check MONGODB_URI environment variable
   - Make sure password is correct (P@ssw0rd123!TaskDB)
4. In Render, click "Manual Deploy" to restart
5. Check logs for connection success
```

### Problem: Vercel Deployment Failed

**Error Message**:
```
Build failed: npm ERR! code ENOENT
```

**Solution**:
```
1. Go to Vercel dashboard
2. Click your project
3. Go to "Settings" → "Git"
4. Scroll down and click "Clear Build Cache"
5. Click "Redeploy"
6. Wait for new deployment
7. If still failing, check:
   - frontend/package.json exists
   - frontend/public/index.html exists
   - No syntax errors in frontend code
```

---

## **Final Checklist**

Before declaring success, verify:

- [ ] MongoDB Atlas cluster is running
- [ ] Database user created (taskuser)
- [ ] Network access allows 0.0.0.0/0
- [ ] Render deployment shows green ✅
- [ ] Vercel deployment shows green ✅
- [ ] Backend API responds to /api/health
- [ ] Frontend loads without errors
- [ ] API calls show in Network tab
- [ ] Project decomposition works
- [ ] No CORS errors in console
- [ ] No 404 errors in Network tab

---

## **Next Steps After Deployment**

1. **Share your live links**:
   - Frontend: https://your-vercel-url.vercel.app
   - Backend API: https://task-decomposition-api.onrender.com

2. **Optional: Enable Auto-Redeployment**:
   - Vercel: Already auto-deploys on push to main
   - Render: Add GitHub webhook in Settings → Git

3. **Monitor Performance**:
   - Vercel: Dashboard → Analytics
   - Render: Dashboard → Metrics

4. **Upgrade if Needed**:
   - Render: Upgrade to paid plan for always-on service
   - MongoDB Atlas: Upgrade to M2 for production

---

**Congratulations! Your application is now live! 🎉**
