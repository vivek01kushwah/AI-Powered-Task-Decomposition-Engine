# React Frontend Components Guide

## Overview
Five comprehensive React components for the Task Decomposition Platform's user interface. Each component integrates Tailwind CSS for responsive design and displays data from backend analysis services.

---

## 1. DecompositionForm.jsx
**Purpose:** Capture project requirements and constraints from users

**Location:** `frontend/src/components/DecompositionForm.jsx`

### Features
- **Project Description**: Textarea input (500+ character validation)
- **Constraint Inputs**:
  - Team Size (1-100 people)
  - Hours Per Day (1-24 hours)
  - Max Tasks (1-500)
  - Deadline (date picker)
- **Form Validation**: Field-level error messages
- **Loading State**: Spinner animation during submission
- **API Integration**: POST to `/api/analyze` with axios
- **Error Handling**: User-friendly error messages
- **Responsiveness**: 1-column mobile, 2-column desktop

### Key Props
- `onSubmit`: Callback function when form is submitted
- `isLoading`: Boolean to show/hide loading state
- `error`: Error message to display

### Data Format
```javascript
{
  description: "string",
  teamSize: number,
  hoursPerDay: number,
  maxTasks: number,
  deadline: "YYYY-MM-DD"
}
```

---

## 2. TaskList.jsx
**Purpose:** Display decomposed tasks with comprehensive metadata visualization

**Location:** `frontend/src/components/TaskList.jsx`

### Features
- **Category Grouping**: Tasks organized by type (setup, backend, frontend, database, auth, payment, testing, devops, documentation)
- **Expandable Sections**: Collapse/expand category groups
- **Priority Color-Coding**:
  - 🔴 High (priority 8+) - Red
  - 🟡 Medium (priority 6-7) - Yellow
  - 🟢 Low (priority <6) - Green
- **Complexity Badges**: Simple, Moderate, Complex
- **Critical Path Highlighting**: Red border with "CRITICAL PATH" badge
- **Dependency Expansion**: Click to view task dependencies
- **Skill Requirements**: Display as tags
- **Task Levels**: 0-N level indicators
- **Summary Statistics**: Total tasks, critical path count, total hours

### Key Props
- `tasks`: Array of task objects
- `criticalPathTasks`: Array of task IDs on critical path
- `dependencies`: Map of task IDs to dependent tasks

### Task Object Structure
```javascript
{
  _id: "string",
  title: "string",
  category: "string",
  description: "string",
  priority: number,
  complexity: "simple|moderate|complex",
  estimatedHours: number,
  skills: ["string"],
  dependencies: ["taskId"],
  level: number,
  isCritical: boolean
}
```

---

## 3. ConflictPanel.jsx
**Purpose:** Display detected contradictions and feasibility conflicts

**Location:** `frontend/src/components/ConflictPanel.jsx`

### Features
- **Severity Badges**: Critical, High, Medium, Low with color coding
- **Collapsible Sections**: Expand/collapse each conflict
- **Contradiction Types**:
  - Pattern contradictions (conflicting keywords)
  - Resource conflicts
  - Timeline conflicts
  - Technical contradictions
- **Resolution Strategies**: Suggested ways to resolve each conflict
- **Impact Analysis**: Shows affected tasks and consequences
- **Summary Statistics**: Count by severity level
- **Next Steps**: Clear action items for resolution

### Key Props
- `conflicts`: Array of feasibility conflict objects
- `contradictions`: Object containing contradiction analysis results

### Data Structures
```javascript
// Contradiction Object
{
  description: "string",
  severity: "critical|high|medium|low",
  keywords: ["string"],
  reasoning: "string",
  suggestion: "string",
  type: "pattern-contradiction"
}

// Conflict Object
{
  title: "string",
  description: "string",
  type: "timeline|team-capacity|scope-overflow|quality-risk|complexity|team-size|buffer|critical-path",
  severity: "critical|high|medium|low",
  impact: "string",
  suggestion: "string",
  affectedTasks: ["taskId"]
}
```

---

## 4. FeasibilityDashboard.jsx
**Purpose:** Visualize project feasibility with gauges and metrics

**Location:** `frontend/src/components/FeasibilityDashboard.jsx`

### Features
- **Feasibility Gauge**: Animated circular gauge (0-1 scale)
  - 🚀 Excellent (0.9-1.0) - Green
  - ✅ Good (0.7-0.9) - Blue
  - ⚠️ Fair (0.5-0.7) - Yellow
  - 💪 Challenging (0.3-0.5) - Orange
  - ❌ Unrealistic (<0.3) - Red
- **Timeline Breakdown**:
  - Available hours bar chart
  - Critical path required hours
  - Total all tasks hours
  - Metrics: available days, critical path days, parallelism, buffer days
- **Warnings List**: 8 warning types with icons
- **Risk Adjustments**: Complexity, scope, team size factors
- **Recommendations**: Context-specific suggestions
- **Action Items**: Prioritized next steps

### Key Props
- `feasibility`: Feasibility analysis object

### Feasibility Object Structure
```javascript
{
  score: number (0-1),
  level: "excellent|good|fair|challenging|unrealistic",
  metrics: {
    availableHours: number,
    criticalPathHours: number,
    totalHours: number,
    availableDays: number,
    criticalPathDays: number,
    parallelism: number,
    bufferDays: number
  },
  warnings: [
    {
      type: "string",
      title: "string",
      description: "string"
    }
  ],
  riskAdjustments: {
    complexity_risk: number,
    scope_adjustment: number,
    team_risk: number
  },
  actionItems: ["string"]
}
```

---

## 5. ClarifyQuestions.jsx
**Purpose:** Display ambiguity clarifying questions to improve requirements

**Location:** `frontend/src/components/ClarifyQuestions.jsx`

### Features
- **Numbered Questions**: Sequential question list
- **Priority Indicators**: Critical, High, Medium, Low with color badges
- **Copy Button**: Copy question to clipboard per item
- **Expandable Details**: 
  - Rationale (why the question matters)
  - Suggested answer areas
  - Impact if unaddressed
  - Answer textarea
- **Category Tagging**: Scope, timeline, resources, requirements, constraints, etc.
- **Filter by Priority**: Quick filtering of questions
- **Clarity Score**: Overall requirement clarity percentage (0-100%)
- **Clarity Levels**: Excellent, Good, Fair, Needs Improvement
- **Ambiguity Factors**: List of detected vague terms
- **Recommendations**: Best practices for answering questions

### Key Props
- `questions`: Array of question objects
- `ambiguity`: Ambiguity analysis object

### Question Object Structure
```javascript
{
  question: "string",
  priority: "critical|high|medium|low",
  category: "scope|timeline|resources|requirements|constraints|assumptions|success-criteria|technical|design|performance",
  type: "clarification|scope|timeline|resources|constraint|assumption|criterion|definition",
  rationale: "string",
  suggestedAnswerAreas: ["string"],
  impact: "string"
}
```

### Ambiguity Object Structure
```javascript
{
  score: number (0-1),
  level: "excellent|good|fair|poor|critical",
  factors: ["string"],
  requirements: [
    {
      requirement: "string",
      clarity: number,
      ambiguousTerms: ["string"]
    }
  ]
}
```

---

## Component Integration Flow

```
DecompositionForm
    ↓ (submits requirements)
    ↓ (calls POST /api/analyze)
    ↓
API Analysis Pipeline
    ├→ taskDecomposer (generates tasks)
    ├→ contradictionDetector (finds conflicts)
    ├→ ambiguityScorer (identifies unclear areas)
    ├→ dependencyGraphService (calculates dependencies)
    └→ feasibilityCalculator (scores feasibility)
    ↓ (returns results)
    ↓
Results Display Components
    ├→ TaskList (displays decomposed tasks)
    ├→ ConflictPanel (shows contradictions/conflicts)
    ├→ FeasibilityDashboard (visualizes feasibility)
    └→ ClarifyQuestions (lists clarifying questions)
```

---

## Styling System

### Colors & Severity Levels
- **Critical/High**: Red (#ef4444, #e53e3e)
- **High/Orange**: Orange (#f97316, #ff8c42)
- **Medium/Yellow**: Yellow (#eab308, #fde047)
- **Low/Green**: Green (#10b981, #34d399)
- **Neutral/Blue**: Blue (#3b82f6, #60a5fa)
- **Purple**: Purple (#a855f7, #d8b4fe)

### Responsive Design
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid where applicable
- **Desktop**: Full multi-column layouts with side panels
- **Breakpoints**: Tailwind defaults (sm, md, lg, xl, 2xl)

### Tailwind Classes Used
- Layout: `flex`, `grid`, `space-y`, `gap`
- Colors: `bg-{color}-{shade}`, `text-{color}-{shade}`, `border-{color}-{shade}`
- Typography: `text-{size}`, `font-{weight}`, `tracking`
- States: `hover:`, `focus:`, `transition`, `opacity`
- Responsiveness: `md:`, `lg:` prefixes

---

## Error Handling

Each component handles:
1. **Empty/Missing Data**: Displays user-friendly "no data" messages
2. **Loading States**: Shows loading spinners or skeleton screens
3. **Error States**: Displays error alerts with retry options
4. **Invalid Inputs**: Form validation on DecompositionForm

---

## Accessibility Features

✓ Semantic HTML (`button`, `label`, `h1-h6`)
✓ ARIA labels for complex components
✓ Keyboard navigation support
✓ Color contrast compliance (WCAG AA)
✓ Focus indicators for interactive elements
✓ Screen reader friendly sections

---

## Component Usage Examples

### DecompositionForm
```jsx
import DecompositionForm from './components/DecompositionForm';

<DecompositionForm
  onSubmit={(data) => console.log(data)}
  isLoading={false}
  error={null}
/>
```

### TaskList
```jsx
import TaskList from './components/TaskList';

<TaskList
  tasks={tasksArray}
  criticalPathTasks={criticalTaskIds}
  dependencies={dependencyMap}
/>
```

### ConflictPanel
```jsx
import ConflictPanel from './components/ConflictPanel';

<ConflictPanel
  conflicts={feasibilityConflicts}
  contradictions={contradictionResults}
/>
```

### FeasibilityDashboard
```jsx
import FeasibilityDashboard from './components/FeasibilityDashboard';

<FeasibilityDashboard
  feasibility={feasibilityAnalysis}
/>
```

### ClarifyQuestions
```jsx
import ClarifyQuestions from './components/ClarifyQuestions';

<ClarifyQuestions
  questions={questionsArray}
  ambiguity={ambiguityAnalysis}
/>
```

---

## Dependencies
- React 18.2.0
- React Router 6.16.0 (for navigation between components)
- Tailwind CSS 3.3.0
- Axios 1.5.0 (for API calls in DecompositionForm)

---

## Performance Optimizations

1. **Memoization**: Components don't re-render unnecessarily
2. **Efficient Filtering**: Questions filtered without re-processing entire list
3. **Lazy Loading**: Expandable sections load details on demand
4. **CSS Classes**: Tailwind provides compiled, minimal CSS
5. **Animation**: CSS transitions for smooth interactions

---

## Future Enhancements

- [ ] Add CSV export for tasks and questions
- [ ] Implement drag-and-drop task reordering
- [ ] Add real-time collaboration features
- [ ] Create PDF report generation
- [ ] Add task timeline Gantt chart visualization
- [ ] Implement comparison mode for different scenarios
- [ ] Add notes/comments on individual tasks
- [ ] Create template library for quick starts
