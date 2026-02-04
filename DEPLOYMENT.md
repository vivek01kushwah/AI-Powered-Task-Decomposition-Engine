# Deployment Guide

Complete guide for deploying the Task Decomposition Platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Continuous Integration/Deployment](#continuous-integrationdeployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- **GitHub**: Source code repository
- **MongoDB Atlas**: Cloud database (free tier available)
- **Railway or Render**: Backend hosting
- **Vercel or Netlify**: Frontend hosting
- **Docker Hub** (optional): Container registry

### Tools

```bash
# Node.js 18+ and npm 9+
node --version    # v18.0.0+
npm --version     # v9.0.0+

# Git
git --version     # v2.40.0+

# Docker (optional)
docker --version  # v20.0.0+
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

Railway is the fastest way to deploy. Auto-scales and handles environment variables.

#### Step 1: Connect GitHub Repository

1. Go to https://railway.app
2. Click "Create New Project"
3. Select "GitHub"
4. Authorize Railway with your GitHub account
5. Select your repository
6. Select `backend` folder as root directory

#### Step 2: Configure Environment Variables

Railway will automatically detect `railway.json`. Add secrets:

1. Go to Project → Variables
2. Add required variables:

```
MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/taskdb
JWT_SECRET: generate-strong-secret-32-chars-long
CORS_ORIGIN: https://your-frontend-url.vercel.app
NODE_ENV: production
```

#### Step 3: Trigger Deployment

1. Push to GitHub `main` branch
2. Railway auto-deploys (3-5 minutes)
3. Get API URL from Railway dashboard (e.g., https://task-api.railway.app)
4. Save for frontend configuration

#### Step 4: Test Deployment

```bash
# Get deployment URL from Railway dashboard
API_URL="https://task-api.railway.app"

# Test health endpoint
curl $API_URL/api/health

# Expected response:
# {"status":"OK","timestamp":"2026-02-04T10:00:00Z"}
```

### Option 2: Render

Alternative to Railway with similar features.

#### Step 1: Create Web Service

1. Go to https://render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Select `backend` as root directory

#### Step 2: Configure Service

```
Name: task-decomposition-api
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Standard
```

#### Step 3: Set Environment Variables

Go to Environment → Add Environment Variable:

```
MONGODB_URI = mongodb+srv://user:pass@...
JWT_SECRET = your-secret-key
CORS_ORIGIN = https://your-frontend-url.vercel.app
NODE_ENV = production
PORT = 5000
```

#### Step 4: Deploy

Click "Create Web Service" → Automatic deployment begins (5-10 minutes)

### Option 3: Docker + Cloud Run (GCP)

For more control and cost efficiency at scale.

#### Step 1: Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

#### Step 2: Build Image

```bash
cd backend
docker build -t task-decomposition-api:latest .
```

#### Step 3: Push to Docker Hub

```bash
docker tag task-decomposition-api:latest yourname/task-decomposition-api:latest
docker push yourname/task-decomposition-api:latest
```

#### Step 4: Deploy to Cloud Run

```bash
gcloud run deploy task-decomposition-api \
  --image yourname/task-decomposition-api:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=$MONGODB_URI,JWT_SECRET=$JWT_SECRET
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel optimizes React/Vite apps automatically.

#### Step 1: Connect GitHub

1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Select `frontend` folder as root directory

#### Step 2: Configure Build Settings

Vercel auto-detects Vite:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Step 3: Set Environment Variables

1. Project Settings → Environment Variables
2. Add for all environments:

```
VITE_API_URL = https://task-api.railway.app
VITE_APP_NAME = Task Decomposition Platform
```

#### Step 4: Deploy

Click "Deploy" → Automatic build and deployment (2-3 minutes)

#### Step 5: Verify

Go to Vercel-provided URL (e.g., https://task-decomposition.vercel.app)

### Option 2: Netlify

Alternative with good Vite support.

#### Step 1: Connect Site

1. Go to https://netlify.com
2. Click "Add new site"
3. Select your GitHub repository
4. Select `frontend` as root directory

#### Step 2: Configure Build

```
Build Command: npm run build
Publish Directory: dist
Base Directory: frontend
```

#### Step 3: Set Environment Variables

Build & Deploy → Environment:

```
VITE_API_URL=https://task-api.railway.app
VITE_APP_NAME=Task Decomposition Platform
```

#### Step 4: Deploy

Click "Deploy" → Automatic build (3-5 minutes)

### Option 3: GitHub Pages

Free but limited (no backend API without proxy).

```bash
# frontend/vite.config.js
export default {
  base: '/task-decomposition/',
  // ... rest of config
}

# Deploy
npm run build
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

---

## Database Setup

### MongoDB Atlas (Recommended)

#### Step 1: Create Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or GitHub

#### Step 2: Create Cluster

1. Click "Create a Deployment"
2. Select "FREE" tier
3. Select region closest to users (e.g., us-east-1)
4. Click "Create"
5. Wait 5-10 minutes for cluster to initialize

#### Step 3: Create Database User

1. Go to Database Access
2. Click "Add New Database User"
3. Username: (e.g., taskapp)
4. Password: (generate secure password, save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

#### Step 4: Configure IP Access

1. Go to Network Access
2. Click "Add IP Address"
3. For development: Add your IP
4. For production: Add "0.0.0.0/0" (allow all, then restrict later)
5. Click "Confirm"

#### Step 5: Get Connection String

1. Go to Clusters → Connect
2. Select "Drivers"
3. Choose Node.js 4.1 or later
4. Copy connection string:

```
mongodb+srv://taskapp:password@cluster.mongodb.net/taskdb?retryWrites=true&w=majority
```

5. Replace `<password>` with your actual password
6. Save as `MONGODB_URI` in deployment environment

#### Step 6: Create Database

```bash
# Backend will auto-create on first connection
# Or use MongoDB Atlas UI:
# 1. Clusters → Collections
# 2. Create database "taskdb"
# 3. Create collections: projects, tasks, analyses, requirements
```

### Self-Hosted MongoDB (Advanced)

For on-premises or testing:

```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Linux
sudo apt-get install mongodb-org

# Start service
mongod

# Connect
mongo mongodb://localhost:27017/taskdb

# Create admin user
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["root"]
})

# Get connection string
mongodb://admin:password@localhost:27017/taskdb?authSource=admin
```

---

## Environment Configuration

### Backend Production .env

```bash
# Copy from .env.example
cp backend/.env.example backend/.env.production

# Edit with production values
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskdb
JWT_SECRET=your-very-long-secret-key-min-32-characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://task-decomposition.vercel.app
LOG_LEVEL=info
MAX_TASKS=100
```

### Frontend Production .env

```bash
# Copy from .env.example
cp frontend/.env.example frontend/.env.production

# Edit with production values
VITE_API_URL=https://task-api.railway.app
VITE_APP_NAME=Task Decomposition Platform
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
```

### Secrets Management

**Never commit .env files to git!**

1. Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

2. Use deployment platform's secret management:
   - **Railway**: Project → Variables → Secrets
   - **Render**: Environment → Encrypted environment variables
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Build & Deploy → Environment → Secrets

3. For local development:
```bash
# Copy template and edit
cp backend/.env.example backend/.env.local
# Add your local values
```

---

## Continuous Integration/Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Build frontend
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy backend to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Deploy frontend to Vercel
        run: |
          npm install -g vercel
          vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Manual Deployment

If not using GitHub Actions:

```bash
# Backend
cd backend
npm install
npm test
npm run build
git push origin main  # Railway auto-deploys

# Frontend
cd frontend
npm install
npm run build
git push origin main  # Vercel auto-deploys
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl https://task-api.railway.app/api/health

# Check MongoDB connection
curl https://task-api.railway.app/api/db-status

# Check frontend
curl https://task-decomposition.vercel.app
```

### Logging

#### Backend Logs

**Railway**:
```bash
# View logs from CLI
railway logs

# Or in dashboard: Project → Logs
```

**Render**:
```bash
# View logs from dashboard: Services → Logs
# Or use CLI:
render logs task-decomposition-api --follow
```

#### Frontend Logs

**Vercel**:
1. Dashboard → Logs
2. Select deployment and log type
3. Filter by error level

**Netlify**:
1. Site settings → Build & deploy → Build log
2. Or: Logs → Functions

### Monitoring Tools (Optional)

```bash
# Sentry (Error tracking)
npm install @sentry/node @sentry/tracing

# DataDog (Monitoring)
npm install @datadog/browser-rum

# LogRocket (Session replay)
npm install logrocket
```

### Backup Strategy

**MongoDB Atlas**:
1. Automatic daily backups (30-day retention)
2. Manual backup: Database → Backup
3. Restore: Data Migration → Restore

**Code**:
1. Regular GitHub commits
2. Automated backups via GitHub Enterprise
3. Mirror repository to Bitbucket/GitLab

### Database Maintenance

```bash
# Monitor database performance
# MongoDB Atlas → Performance Advisor

# Optimize indexes
# MongoDB Atlas → Indexes

# Monitor storage
# MongoDB Atlas → Metrics → Storage
```

---

## Troubleshooting

### Backend Issues

#### "Cannot connect to MongoDB"
```
Error: connect ECONNREFUSED
→ Check MONGODB_URI in environment variables
→ Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for dev)
→ Check cluster is running
→ Test connection: mongosh "mongodb+srv://user:pass@..."
```

#### "CORS Error"
```
Error: Access to XMLHttpRequest blocked by CORS policy
→ Check CORS_ORIGIN matches frontend URL
→ Verify it's in backend environment variables
→ Restart backend after changes
```

#### "JWT Token Invalid"
```
Error: JsonWebTokenError: invalid token
→ Ensure JWT_SECRET is consistent across deployments
→ Check token format: "Bearer token"
→ Regenerate token via /auth/login
→ Check token hasn't expired (JWT_EXPIRE)
```

#### "Out of Memory"
```
Error: JavaScript heap out of memory
→ Increase memory allocation: NODE_OPTIONS="--max-old-space-size=1024"
→ Upgrade hosting plan
→ Optimize database queries
```

### Frontend Issues

#### "API Connection Refused"
```
Error: Cannot reach http://localhost:5000
→ Verify backend is running
→ Check VITE_API_URL in .env matches backend
→ Check firewall/network settings
→ Try CORS proxy if on different domain
```

#### "Build Fails"
```
Error: npm run build fails
→ Clear node_modules: rm -rf node_modules && npm install
→ Check Node version: node --version (needs 18+)
→ Check for TypeScript errors: npx tsc --noEmit
→ Review build output for specific errors
```

#### "Blank Page in Production"
```
→ Check browser console for errors
→ Verify VITE_API_URL is correct
→ Check if assets are loading (Network tab)
→ Try clearing cache: Ctrl+Shift+Delete (Ctrl+Cmd+Delete on Mac)
→ Check if service worker needs update
```

### Database Issues

#### "Replica Set Error"
```
Error: connect ENOTFOUND
→ MongoDB Atlas only: use SRV connection string
→ Not local connection string
→ Format: mongodb+srv://... (not mongodb://)
```

#### "Authentication Failed"
```
Error: authentication failed
→ Check username and password
→ Verify URL-encoded special chars: ? → %3F, @ → %40
→ Check database user exists
→ Verify user has correct privileges
```

#### "Storage Quota Exceeded"
```
Error: Space allocation exhausted
→ MongoDB Atlas: Increase cluster tier
→ Or: Delete old data/archives
→ Or: Compress collections
```

### Deployment Issues

#### "Railway: Deployment Stuck"
```
→ Check build logs: Railway → Logs
→ Verify railway.json is correct
→ Check for infinite loops in startup code
→ Try manual rebuild: Railway → Redeploy
```

#### "Vercel: Build Fails"
```
→ Check build output
→ Verify Node version matches
→ Check environment variables are set
→ Try clearing cache: Settings → Git → Clear deployments
```

### Performance Issues

#### "Slow Response Time"
```
→ Check database performance: MongoDB Atlas → Performance Advisor
→ Add indexes for frequently queried fields
→ Upgrade hosting plan
→ Check for N+1 query problems
→ Use caching (Redis)
```

#### "High Memory Usage"
```
→ Check for memory leaks: Use --inspect flag
→ Limit task decomposition (MAX_TASKS)
→ Archive old projects
→ Upgrade hosting plan
```

---

## Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] API endpoints respond correctly
- [ ] Database connection works
- [ ] Authentication flow works
- [ ] Task decomposition completes
- [ ] Analysis services functional
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place
- [ ] SSL certificate valid
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers set

---

## Rollback Procedure

If deployment has critical issues:

```bash
# Railway: Automatic rollback
# Dashboard → Deployments → Redeploy previous version

# Render: Revert to previous version
# Service → Deploys → Select previous → Redeploy

# Vercel: Instant rollback
# Dashboard → Deployments → ... → Rollback

# Manual: Revert to previous code
git revert <commit-hash>
git push origin main
```

---

## Production Checklist

### Security
- [ ] HTTPS enabled on all endpoints
- [ ] JWT tokens configured
- [ ] MongoDB user privileges restricted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention (Mongoose)
- [ ] CORS whitelist configured

### Performance
- [ ] Database indexes optimized
- [ ] Caching strategy implemented
- [ ] CDN enabled (Vercel/Netlify auto)
- [ ] Compression enabled
- [ ] Image optimization
- [ ] Bundle size optimized

### Reliability
- [ ] Automated backups configured
- [ ] Health checks implemented
- [ ] Error tracking enabled
- [ ] Logging implemented
- [ ] Alerting configured
- [ ] Uptime monitoring

### Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Data retention policy set
- [ ] GDPR compliance (if EU users)
- [ ] Rate limiting in place
- [ ] DDoS protection enabled

---

**Last Updated:** February 4, 2026
**Status:** Production Ready
