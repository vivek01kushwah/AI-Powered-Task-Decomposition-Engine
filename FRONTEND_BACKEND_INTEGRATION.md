# Frontend-Backend Integration Guide

## Overview
Complete integration documentation for connecting React frontend components with Express.js backend analysis services.

---

## API Integration Points

### 1. DecompositionForm → /api/analyze
**Component:** [frontend/src/components/DecompositionForm.jsx](frontend/src/components/DecompositionForm.jsx)
**Endpoint:** POST `/api/analyze`

**Frontend Code:**
```jsx
import axios from 'axios';

const handleSubmit = async (formData) => {
  try {
    setLoading(true);
    setError(null);

    const response = await axios.post('/api/analyze', {
      description: formData.description,
      teamSize: formData.teamSize,
      hoursPerDay: formData.hoursPerDay,
      maxTasks: formData.maxTasks,
      deadline: formData.deadline
    });

    // Response contains all analysis results
    const analysisResults = response.data;
    
    // Pass to other components
    setTasks(analysisResults.decomposition.tasks);
    setConflicts(analysisResults.contradictions);
    setQuestions(analysisResults.ambiguity.questions);
    setFeasibility(analysisResults.feasibility);
    
  } catch (error) {
    setError(error.response?.data?.error || 'Analysis failed');
  } finally {
    setLoading(false);
  }
};
```

**Backend Code:** See [backend/controllers/analysisController.js](backend/controllers/analysisController.js)

**Request Format:**
```javascript
{
  description: "string (required, min 50 chars)",
  teamSize: number,           // 1-100 (default: 5)
  hoursPerDay: number,        // 1-24 (default: 8)
  maxTasks: number,           // 1-500 (default: 100)
  deadline: "YYYY-MM-DD"      // optional
}
```

**Response Format:**
```javascript
{
  success: boolean,
  timestamp: Date,
  decomposition: {
    taskCount: number,
    tasks: [{
      _id: string,
      title: string,
      category: string,
      description: string,
      priority: number,
      complexity: string,
      estimatedHours: number,
      skills: [string],
      dependencies: [string],
      level: number,
      isCritical: boolean
    }],
    extractedFeatures: [string],
    featureCount: number
  },
  graph: { ... },
  contradictions: { ... },
  ambiguity: { ... },
  feasibility: { ... },
  recommendations: [...],
  summary: { ... },
  decompositionId: string
}
```

---

### 2. TaskList → /api/analyze (response data)
**Component:** [frontend/src/components/TaskList.jsx](frontend/src/components/TaskList.jsx)
**Data Source:** `analysisResults.decomposition.tasks`

**Props:**
```jsx
<TaskList
  tasks={analysisResults.decomposition.tasks}
  criticalPathTasks={analysisResults.graph.criticalPath}
  dependencies={createDependencyMap(analysisResults.decomposition.tasks)}
/>
```

**Category Configuration:**
```javascript
const categories = {
  'setup': { icon: '⚙️', color: 'bg-gray-200' },
  'backend': { icon: '🔧', color: 'bg-blue-200' },
  'frontend': { icon: '🎨', color: 'bg-purple-200' },
  'database': { icon: '💾', color: 'bg-orange-200' },
  'auth': { icon: '🔐', color: 'bg-red-200' },
  'payment': { icon: '💳', color: 'bg-green-200' },
  'testing': { icon: '✅', color: 'bg-yellow-200' },
  'devops': { icon: '🚀', color: 'bg-indigo-200' },
  'documentation': { icon: '📚', color: 'bg-pink-200' }
};
```

---

### 3. ConflictPanel → /api/analyze (response data)
**Component:** [frontend/src/components/ConflictPanel.jsx](frontend/src/components/ConflictPanel.jsx)
**Data Sources:**
- `analysisResults.contradictions`
- `analysisResults.graph` (for conflicts)

**Props:**
```jsx
<ConflictPanel
  conflicts={extractConflicts(analysisResults)}
  contradictions={analysisResults.contradictions}
/>
```

**Data Mapping:**
```javascript
// Contradictions from contradiction detector
contradictions.contradictions.map(c => ({
  description: c.description,
  severity: c.severity,      // critical|high|medium|low
  keywords: c.keywords,
  reasoning: c.reasoning,
  suggestion: c.suggestion
}))

// Conflicts from feasibility and graph analysis
graph.warnings.map(w => ({
  title: w.title,
  description: w.description,
  type: w.type,
  severity: calculateSeverity(w),
  impact: w.impact,
  suggestion: w.suggestion
}))
```

---

### 4. FeasibilityDashboard → /api/analyze (response data)
**Component:** [frontend/src/components/FeasibilityDashboard.jsx](frontend/src/components/FeasibilityDashboard.jsx)
**Data Source:** `analysisResults.feasibility`

**Props:**
```jsx
<FeasibilityDashboard
  feasibility={analysisResults.feasibility}
/>
```

**Data Structure:**
```javascript
{
  score: 0.75,                      // 0-1 scale
  level: 'good',                    // excellent|good|fair|challenging|unrealistic
  metrics: {
    availableHours: 320,
    criticalPathHours: 240,
    totalHours: 400,
    availableDays: 40,
    criticalPathDays: 30,
    parallelism: 1.5,
    bufferDays: 10
  },
  warnings: [
    {
      type: 'timeline|team-capacity|scope-overflow|quality-risk|complexity|team-size|buffer|critical-path',
      title: string,
      description: string
    }
  ],
  riskAdjustments: {
    complexity_risk: -0.1,
    scope_adjustment: -0.05,
    team_risk: 0.0
  },
  actionItems: [string]
}
```

---

### 5. ClarifyQuestions → /api/analyze (response data)
**Component:** [frontend/src/components/ClarifyQuestions.jsx](frontend/src/components/ClarifyQuestions.jsx)
**Data Source:** `analysisResults.ambiguity`

**Props:**
```jsx
<ClarifyQuestions
  questions={analysisResults.ambiguity.questions}
  ambiguity={{
    score: analysisResults.ambiguity.score,
    level: analysisResults.ambiguity.level,
    factors: analysisResults.ambiguity.factors
  }}
/>
```

**Data Structure:**
```javascript
{
  score: 0.65,                      // 0-1 (clarity score)
  level: 'fair',                    // excellent|good|fair|poor|critical
  totalQuestions: 8,
  questions: [
    {
      question: string,
      priority: 'critical|high|medium|low',
      category: 'scope|timeline|resources|...',
      type: 'clarification|scope|timeline|...',
      rationale: string,
      suggestedAnswerAreas: [string],
      impact: string
    }
  ],
  criticalQuestions: 2,
  factors: [string]                 // vague terms found
}
```

---

## Complete Example Implementation

### App.jsx Integration
```jsx
import React, { useState } from 'react';
import DecompositionForm from './components/DecompositionForm';
import TaskList from './components/TaskList';
import ConflictPanel from './components/ConflictPanel';
import FeasibilityDashboard from './components/FeasibilityDashboard';
import ClarifyQuestions from './components/ClarifyQuestions';
import axios from 'axios';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setActiveTab('tasks');

      const response = await axios.post('/api/analyze', {
        description: formData.description,
        teamSize: formData.teamSize,
        hoursPerDay: formData.hoursPerDay,
        maxTasks: formData.maxTasks,
        deadline: formData.deadline
      });

      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
      setActiveTab('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Task Decomposition Platform
          </h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      {analysisResult && (
        <nav className="bg-white border-b border-gray-200 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 flex gap-4">
            {[
              { id: 'form', label: '📋 New Analysis', icon: '✏️' },
              { id: 'tasks', label: '📋 Tasks', icon: '📋' },
              { id: 'conflicts', label: '⚠️ Conflicts', icon: '⚠️' },
              { id: 'feasibility', label: '⚡ Feasibility', icon: '⚡' },
              { id: 'questions', label: '❓ Questions', icon: '❓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {error && (
          <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin text-4xl">⚙️</div>
          </div>
        )}

        {!analysisResult && !loading && (
          <DecompositionForm onSubmit={handleFormSubmit} isLoading={loading} error={error} />
        )}

        {analysisResult && (
          <div>
            {activeTab === 'form' && (
              <DecompositionForm onSubmit={handleFormSubmit} isLoading={loading} />
            )}
            {activeTab === 'tasks' && (
              <TaskList
                tasks={analysisResult.decomposition.tasks}
                criticalPathTasks={analysisResult.graph.criticalPath}
                dependencies={createDependencyMap(analysisResult.decomposition.tasks)}
              />
            )}
            {activeTab === 'conflicts' && (
              <ConflictPanel
                conflicts={extractConflicts(analysisResult)}
                contradictions={analysisResult.contradictions}
              />
            )}
            {activeTab === 'feasibility' && (
              <FeasibilityDashboard feasibility={analysisResult.feasibility} />
            )}
            {activeTab === 'questions' && (
              <ClarifyQuestions
                questions={analysisResult.ambiguity.questions}
                ambiguity={{
                  score: analysisResult.ambiguity.score,
                  level: analysisResult.ambiguity.level,
                  factors: analysisResult.ambiguity.factors
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper Functions
function createDependencyMap(tasks) {
  const map = {};
  tasks.forEach(task => {
    map[task._id] = task.dependencies || [];
  });
  return map;
}

function extractConflicts(analysisResult) {
  const conflicts = [];
  
  if (analysisResult.graph.hasCircularDependencies) {
    conflicts.push({
      title: 'Circular Dependencies',
      description: 'Task dependencies form a cycle',
      type: 'dependencies',
      severity: 'critical',
      impact: 'Cannot execute project with circular dependencies',
      suggestion: 'Review and break circular dependency chains'
    });
  }

  if ((analysisResult.feasibility.warnings || []).length > 0) {
    conflicts.push(...analysisResult.feasibility.warnings);
  }

  return conflicts;
}
```

---

## Server Setup

### server.js Integration
```javascript
const express = require('express');
const mongoose = require('mongoose');
const analysisRoutes = require('./routes/analysisRoutes');
const projectRoutes = require('./routes/projectRoutes');
const patternRoutes = require('./routes/patternRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('frontend/build'));

// Routes
app.use('/api', analysisRoutes);        // Analysis pipeline
app.use('/api', projectRoutes);         // Project management
app.use('/api', patternRoutes);         // Pattern library

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/task-decomposition')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────┐
│    DecompositionForm.jsx            │
│  (Capture Requirements & Constraints)│
└──────────────┬──────────────────────┘
               │ POST /api/analyze
               ▼
┌─────────────────────────────────────┐
│    analysisController.analyzeProject│
├─────────────────────────────────────┤
│ Step 1: taskDecomposer              │
│   → Extract features                │
│   → Generate 67 task templates      │
│                                     │
│ Step 2: dependencyGraphService      │
│   → Detect circular dependencies    │
│   → Calculate critical path         │
│   → Find parallelization opps       │
│                                     │
│ Step 3: contradictionDetector       │
│   → Find conflicting requirements   │
│   → Generate resolution strategies  │
│                                     │
│ Step 4: ambiguityScorer             │
│   → Score requirement clarity       │
│   → Generate clarifying questions   │
│                                     │
│ Step 5: feasibilityCalculator       │
│   → Calculate feasibility score     │
│   → Generate warnings & actions     │
│                                     │
│ Step 6: Save to Decomposition model │
│                                     │
│ Step 7: Generate unified recs       │
└──────────────┬──────────────────────┘
               │ Return unified analysis
               ▼
┌──────────────────────────────────────┐
│    Frontend Components              │
├──────────────────────────────────────┤
│  TaskList.jsx                       │
│   ├─ Category grouping              │
│   ├─ Priority color-coding          │
│   ├─ Critical path highlighting     │
│   └─ Dependency expansion           │
│                                    │
│  ConflictPanel.jsx                 │
│   ├─ Contradiction display          │
│   ├─ Conflict resolution            │
│   └─ Severity badges               │
│                                    │
│  FeasibilityDashboard.jsx          │
│   ├─ Score gauge (0-1)             │
│   ├─ Timeline breakdown            │
│   ├─ Warnings display              │
│   └─ Recommendations               │
│                                    │
│  ClarifyQuestions.jsx              │
│   ├─ Question list                 │
│   ├─ Priority filtering            │
│   ├─ Copy functionality            │
│   └─ Clarity score display         │
└──────────────────────────────────────┘
```

---

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost/task-decomposition
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

---

## Error Handling

### Frontend Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling
```javascript
try {
  // ... service call
} catch (error) {
  console.error('Service error:', error);
  return {
    error: error.message,
    fallback: defaultValues
  };
}
```

---

## Performance Optimization

### Frontend
- Memoize components: `React.memo(Component)`
- Lazy load components: `React.lazy()`
- Debounce search: `useCallback` with delay
- Virtualize long lists: `react-window`

### Backend
- Index MongoDB collections (already done)
- Cache analysis results
- Implement request throttling
- Use connection pooling

---

## Testing Checklist

- [ ] Form validation works correctly
- [ ] API calls return expected data
- [ ] Components render all data properly
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Error handling displays user-friendly messages
- [ ] Loading states show correctly
- [ ] Tab navigation works smoothly
- [ ] Copy-to-clipboard functionality works
- [ ] Expand/collapse sections work
- [ ] Filtering and sorting work

---

## Deployment

### Frontend
```bash
npm run build
# Deploy frontend/build to static host
```

### Backend
```bash
npm install
NODE_ENV=production node server.js
# Deploy to Node.js host with MongoDB connection
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyze` | Full analysis pipeline |
| POST | `/api/analyze/quick` | Quick decomposition only |
| GET | `/api/analyze/history` | Get analysis history |
| GET | `/api/analyze/:id` | Get specific analysis |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/patterns` | List patterns |
| POST | `/api/patterns/seed` | Seed sample patterns |

---

## Troubleshooting

### "Cannot POST /api/analyze"
- Check that analysisRoutes.js is imported in server.js
- Verify Express app is listening on correct port

### "MongoDB connection failed"
- Check MONGODB_URI environment variable
- Ensure MongoDB service is running
- Verify connection string format

### "CORS error"
- Add CORS middleware to Express
- Update CORS_ORIGIN in .env
- Check frontend API_URL matches backend

### "Tasks not displaying"
- Check API response includes decomposition.tasks
- Verify TaskList props receive correct data structure
- Check browser console for JavaScript errors

---

## Next Steps

1. ✅ Create React components (DONE)
2. ✅ Create analysisController (DONE)
3. ✅ Create analysisRoutes (DONE)
4. [ ] Update server.js to include analysisRoutes
5. [ ] Configure CORS and middleware
6. [ ] Add authentication (optional)
7. [ ] Implement error boundaries
8. [ ] Add unit tests
9. [ ] Deploy to production

