# Quick Start Guide

## 🚀 Getting Started with Task Decomposition Platform

This guide will help you set up and run the complete system in less than 15 minutes.

---

## Prerequisites

- **Node.js** 14+ ([Download](https://nodejs.org/))
- **MongoDB** 4.4+ ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn** package manager
- **Git** for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cat > .env << EOF
MONGODB_URI=mongodb://localhost/task-decomposition
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
EOF
```

#### Frontend (.env)
```bash
cd ../frontend
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
EOF
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

### 4. Seed Database

```bash
cd backend
node scripts/seedPatterns.js

# Expected output:
# ✅ Database connected
# ✅ Clearing existing patterns
# ✅ Seeding 8 patterns...
# ✅ Pattern 1: E-commerce (10 tasks)
# ...
# ✅ Database seeding completed
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm start

# Expected output:
# 🚀 Server running on port 5000
# ✅ MongoDB connected
```

### Start Frontend Development Server (New Terminal)

```bash
cd frontend
npm start

# Browser opens automatically to http://localhost:3000
```

---

## Using the Application

### 1. Submit Project Description

1. Navigate to http://localhost:3000
2. Enter project description (min 50 characters)
3. Set constraints:
   - Team Size: 5-10 people
   - Hours Per Day: 8-10 hours
   - Max Tasks: 50-100 tasks
   - Deadline: Pick a date
4. Click "Analyze"

### 2. View Results

#### Tasks Tab
- View decomposed tasks organized by category
- Click expand arrow to see task details
- Check critical path (red-highlighted tasks)
- Review dependencies

#### Conflicts Tab
- Review contradictions in requirements
- Read severity badges
- Click to expand for resolution suggestions
- Check affected tasks

#### Feasibility Tab
- View feasibility gauge (0-1 scale)
- Check available vs required hours
- Review warnings
- Read recommendations

#### Questions Tab
- Answer clarifying questions
- Filter by priority
- Copy questions to document
- Track clarity score

---

## API Testing with cURL

### Quick Test
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Build an e-commerce platform with user authentication, product catalog, shopping cart, payment processing, order management, and admin dashboard. Users should be able to browse products, add to cart, checkout securely, and manage their orders. Admin should manage inventory and view sales reports.",
    "teamSize": 5,
    "hoursPerDay": 8,
    "maxTasks": 100,
    "deadline": "2024-12-31"
  }'
```

### Get Analysis History
```bash
curl http://localhost:5000/api/analyze/history
```

---

## Project Structure

```
assignment-vab/
├─ backend/
│  ├─ models/          # MongoDB schemas
│  ├─ controllers/     # Request handlers
│  ├─ routes/          # API endpoints
│  ├─ services/        # Business logic
│  ├─ scripts/         # Utilities (seed, etc.)
│  ├─ server.js        # Express app
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/   # React components
│  │  ├─ App.jsx       # Main app
│  │  └─ index.js      # Entry point
│  └─ package.json
├─ package.json        # Root dependencies
└─ README.md
```

---

## Common Issues & Solutions

### MongoDB Connection Failed
```
Error: Cannot connect to MongoDB
Solution:
1. Ensure MongoDB is running: `mongosh`
2. Check MONGODB_URI in .env
3. If using Atlas, check IP whitelist
```

### Port Already in Use
```
Error: Port 5000 already in use
Solution:
1. Kill process on port 5000
2. macOS/Linux: `lsof -ti:5000 | xargs kill -9`
3. Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
4. Or change PORT in .env
```

### CORS Error
```
Error: CORS policy blocked request
Solution:
1. Check CORS_ORIGIN in backend .env
2. Ensure REACT_APP_API_URL matches backend URL
3. Restart backend server
```

### React Component Not Loading
```
Error: Components not rendering
Solution:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm cache clean --force`
3. Restart development server
```

---

## Development Commands

### Backend
```bash
cd backend

# Start development server with auto-reload
npm start

# Run tests (when added)
npm test

# Run seed script
node scripts/seedPatterns.js

# Verify seed data
node scripts/seedPatterns.js verify
```

### Frontend
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests (when added)
npm test

# Run linting
npm run lint
```

---

## Key Endpoints Reference

### Analysis
- `POST /api/analyze` - Full analysis pipeline
- `POST /api/analyze/quick` - Quick decomposition
- `GET /api/analyze/history` - Analysis history
- `GET /api/analyze/:id` - Retrieve specific analysis

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Patterns
- `GET /api/patterns` - List patterns
- `POST /api/patterns/seed` - Seed patterns
- `GET /api/patterns/:id` - Get pattern

---

## Database Inspection

### Using MongoDB Shell
```bash
# Connect
mongosh

# Use database
use task-decomposition

# List collections
show collections

# View patterns
db.decompositionpatterns.find().limit(1).pretty()

# View decompositions
db.decompositions.find().limit(1).pretty()

# Count documents
db.decompositionpatterns.countDocuments()
```

### Using MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse collections visually
4. Create, read, update, delete documents

---

## Performance Tips

### Frontend
- Use development tools: Chrome DevTools (F12)
- Check Performance tab for slow renders
- Use React DevTools extension
- Monitor Network tab for API calls

### Backend
- Check logs: Look for slow queries
- Monitor CPU/Memory: `htop` or Task Manager
- Database indexes already created
- Response times should be <600ms

---

## Next Steps

### After Initial Setup
1. ✅ Verify all components load
2. ✅ Test with sample project description
3. ✅ Review analysis results
4. ✅ Check database has seeded data
5. ✅ Test all tabs/features

### For Development
1. Review [Frontend-Backend Integration Guide](FRONTEND_BACKEND_INTEGRATION.md)
2. Read [React Components README](frontend/src/components/README.md)
3. Check [Database Schema Guide](SCHEMA_GUIDE.md)
4. Add your own test cases
5. Customize for your needs

### For Production
1. Build frontend: `npm run build`
2. Configure production MongoDB
3. Set NODE_ENV=production
4. Deploy backend to server
5. Deploy frontend to static host
6. Configure CI/CD pipeline

---

## Useful Resources

### Documentation
- [Frontend-Backend Integration](FRONTEND_BACKEND_INTEGRATION.md)
- [React Components Guide](frontend/src/components/README.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Database Schema](SCHEMA_GUIDE.md)
- [Architecture Overview](IMPLEMENTATION_SUMMARY.md)

### External Resources
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/tools/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Code editor
- [React DevTools](https://react-devtools-tutorial.vercel.app/) - React debugging

---

## Troubleshooting Checklist

- [ ] MongoDB is running (test with `mongosh`)
- [ ] Backend server started successfully
- [ ] Frontend development server started
- [ ] Can access http://localhost:3000
- [ ] Can submit form without errors
- [ ] API returns results within 1 second
- [ ] All tabs display correctly
- [ ] Browser console has no errors
- [ ] Network tab shows successful API calls
- [ ] Database has seeded patterns

---

## Getting Help

### Check Logs
```bash
# Backend logs
tail -f backend/logs/*.log

# Frontend logs
# Open browser DevTools (F12) → Console tab

# MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Debug Mode
```bash
# Backend with debug logging
DEBUG=* npm start

# Frontend with React Strict Mode
# Already enabled in development
```

### Common Searches
- "MongoDB not connecting" - Check MONGODB_URI
- "CORS error" - Check CORS_ORIGIN
- "Component not rendering" - Check console errors
- "API returns 500" - Check backend logs

---

## Quick Reference

### Project Description Example
```
"Build an e-commerce platform with:
- User authentication (signup/login)
- Product catalog with search and filtering
- Shopping cart and checkout process
- Payment integration (Stripe)
- Order tracking and history
- Admin dashboard for inventory management
- Email notifications
- Mobile responsive design"
```

### Recommended Constraints
- Team Size: 5-10
- Hours Per Day: 8
- Max Tasks: 100
- Deadline: 3-6 months from now

### Expected Results
- Tasks: 40-60
- Features: 12-20
- Critical Path: 20-40 tasks
- Feasibility: 0.4-0.8 (depends on constraints)

---

## Support & Feedback

For issues or suggestions:
1. Check existing documentation
2. Review GitHub issues
3. Check troubleshooting section
4. Review code comments
5. Contact development team

---

**🎉 You're ready to go! Start with Step 1: Installation**

Happy analyzing! 🚀
