# Task Decomposition Schema Guide

## Overview

This document provides a comprehensive guide to the MongoDB schemas used in the Task Decomposition API.

## Table of Contents

1. [Task Schema](#task-schema)
2. [DecompositionPattern Schema](#decompositionpattern-schema)
3. [Decomposition Schema](#decomposition-schema)
4. [Project Schema](#project-schema)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Validation Rules](#validation-rules)
8. [Usage Examples](#usage-examples)

---

## Task Schema

**File**: `models/TaskSchema.js` (Embedded)

### Overview
Task is an embedded sub-document schema used within Decomposition and Project documents. It represents individual tasks within a project decomposition.

### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `taskId` | String | ✓ | Unique | Unique identifier for the task |
| `title` | String | ✓ | 1-255 chars | Task name/title |
| `description` | String | | Max 2000 chars | Detailed task description |
| `estimatedHours` | Number | ✓ | 0.5-160 | Hours estimate for task |
| `priority` | Number | ✓ | 1-10 (integer) | Priority level (1=low, 10=urgent) |
| `dependencies` | [String] | | Task IDs | Array of task IDs this depends on |
| `category` | String | | Enum | e-commerce, auth, payments, reporting, data-processing, api, deployment, general |
| `status` | String | | Enum | planned, in-progress, blocked, completed, on-hold |
| `assignee` | String | | | Person/team assigned |
| `skillsRequired` | [String] | | | Required skills for task |
| `ambiguityFlags` | [Object] | | | Identified ambiguities |
| `riskLevel` | String | | Enum | low, medium, high |
| `riskFactors` | [String] | | | Specific risk descriptions |
| `actualHours` | Number | | ≥ 0 | Hours actually spent |
| `completionDate` | Date | | | When task was completed |
| `notes` | String | | | Additional notes |

### Ambiguity Flags Structure
```javascript
{
  flag: String,           // Description of ambiguity
  severity: String,       // low, medium, high
  suggestion: String      // Suggested resolution
}
```

### Virtual Fields

- **isOverdue**: Boolean - Returns true if actualHours > estimatedHours * 1.2

---

## DecompositionPattern Schema

**File**: `models/DecompositionPattern.js` (Collection: `decompositionPatterns`)

### Overview
Stores standard decomposition patterns that can be applied to similar tasks. These patterns improve consistency and quality of task decomposition.

### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `category` | String | ✓ | Enum | Pattern category (e-commerce, auth, etc.) |
| `description` | String | ✓ | | What this pattern is used for |
| `keywords` | [String] | ✓ | Lowercase | Keywords to match in descriptions |
| `standardTasks` | [Object] | ✓ | | Array of task templates |
| `implicitDependencies` | [Object] | | | Dependency rules between tasks |
| `isActive` | Boolean | | | Whether pattern is active |
| `successRate` | Number | | 0-100 | Historical success rate |
| `usageCount` | Number | | ≥ 0 | Times pattern was used |
| `tags` | [String] | | | Searchable tags |
| `createdAt` | Date | | | Created timestamp |
| `updatedAt` | Date | | | Last modified timestamp |
| `createdBy` | String | | | User who created pattern |

### Standard Task Structure
```javascript
{
  title: String,                    // Task title (can use {task} placeholder)
  description: String,              // Task description
  estimatedHours: Number,           // Standard hours (0.5-160)
  priority: Number,                 // Priority (1-10)
  category: String,                 // Task category
  order: Number,                    // Sequence order (unique)
  skillsRequired: [String]          // Required skills
}
```

### Implicit Dependency Structure
```javascript
{
  fromTaskOrder: Number,            // Which task number
  toTaskOrder: Number,              // Depends on task number
  dependencyType: String,           // blocks, requires_output, sequential, parallel
  description: String               // Why this dependency exists
}
```

### Pre-save Validation
- Standard tasks must have unique order values
- Dependencies must reference valid task orders
- Tasks cannot depend on themselves

### Indexes
- `(category, isActive)`
- `(keywords)`
- `(createdAt)`
- `(successRate)` - For ranking
- `(usageCount)` - For popularity

---

## Decomposition Schema

**File**: `models/Decomposition.js` (Collection: `decompositions`)

### Overview
Stores the complete decomposition results for a single task, including all generated subtasks and related metadata.

### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `taskId` | ObjectId | ✓ | Ref Task | Reference to original task |
| `originalTask` | String | ✓ | | Title of original task |
| `originalDescription` | String | | | Full original description |
| `subtasks` | [Task] | ✓ | | Array of Task documents |
| `decompositionMethod` | String | | Enum | hierarchical, sequential, parallel, hybrid |
| `complexity` | String | | Enum | simple, moderate, complex |
| `estimatedTotalHours` | Number | | | Sum of subtask estimates |
| `actualTotalHours` | Number | | | Sum of actual hours |
| `ambiguities` | [Object] | | | Identified ambiguities |
| `patterns` | [ObjectId] | | Ref DecompositionPattern | Patterns applied |
| `createdAt` | Date | | | Created timestamp |
| `updatedAt` | Date | | | Last modified timestamp |
| `createdBy` | String | | | User who created |

### Ambiguity Structure
```javascript
{
  description: String,              // What the ambiguity is
  affectedTasks: [String],         // Task IDs affected
  severity: String                  // low, medium, high
}
```

### Indexes
- `(taskId, createdAt)`
- `(decompositionMethod)`
- `(createdAt)`

---

## Project Schema

**File**: `models/Project.js` (Collection: `projects`)

### Overview
Stores complete project decomposition with all tasks, constraints, and project status. This is the main container for a complete project analysis.

### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `projectName` | String | ✓ | | Project identifier |
| `description` | String | ✓ | | Project description |
| `originalDescription` | String | | | Original task description |
| `decompositionMethod` | String | | Enum | hierarchical, sequential, parallel, hybrid |
| `constraints` | Object | | | Project constraints |
| `tasks` | [Task] | | | Array of Task documents |
| `taskCount` | Number | | | Number of tasks |
| `totalEstimatedHours` | Number | | | Sum of all estimates |
| `totalActualHours` | Number | | | Sum of actual hours |
| `conflicts` | [Object] | | | Identified conflicts |
| `conflictCount` | Number | | | Number of conflicts |
| `feasibilityScore` | Number | | 0-100 | Project feasibility |
| `riskAssessment` | Object | | | Risk analysis |
| `warnings` | [Object] | | | Project warnings |
| `status` | String | | Enum | draft, analyzing, analyzed, ready, in-progress, completed, archived |
| `successMetrics` | Object | | | Project success tracking |
| `assignedTeam` | [Object] | | | Team assignments |
| `tags` | [String] | | | Searchable tags |
| `createdAt` | Date | | | Created timestamp |
| `updatedAt` | Date | | | Last modified timestamp |
| `startDate` | Date | | | Project start date |
| `completionDate` | Date | | | Project completion date |
| `createdBy` | String | ✓ | | User who created |
| `lastModifiedBy` | String | | | Last modified by |

### Constraints Structure
```javascript
{
  maxTasks: Number,                 // Max tasks (1-1000, default: 100)
  teamSize: Number,                 // Team size (1-500, default: 5)
  hoursPerDay: Number,              // Working hours/day (1-24, default: 8)
  deadline: Date,                   // Project deadline
  budget: Number,                   // Project budget (≥0)
  maxConcurrentTasks: Number,       // Max parallel tasks (default: 3)
  skillRequirements: {              // Map skill -> required count
    [skill]: Number
  }
}
```

### Conflict Structure
```javascript
{
  taskId1: String,                  // First task
  taskId2: String,                  // Second task
  conflictType: String,             // resource, dependency, schedule, skill, unknown
  description: String,              // Conflict description
  severity: String,                 // low, medium, high, critical
  resolution: String                // How conflict was resolved
}
```

### Risk Assessment Structure
```javascript
{
  overallRiskLevel: String,         // low, medium, high, critical
  riskScore: Number,                // 0-100 score
  identifiedRisks: [String]         // Risk descriptions
}
```

### Success Metrics Structure
```javascript
{
  completionRate: Number,           // % completed (0-100)
  timeAccuracy: Number,             // actual/estimated ratio
  taskCompletionCount: Number,      // Tasks completed
  onTimeTaskCount: Number           // Tasks on time
}
```

### Warnings Structure
```javascript
{
  type: String,                     // ambiguity, dependency, resource, schedule, feasibility, skill
  message: String,                  // Warning message
  severity: String,                 // info, warning, error, critical
  affectedTasks: [String],         // Affected task IDs
  suggestion: String                // Suggestion to resolve
}
```

### Instance Methods

#### addTask(taskData)
Add new task to project. Returns the new task object.
```javascript
project.addTask({
  title: "New Task",
  estimatedHours: 4,
  priority: 5
});
```

#### removeTask(taskId)
Remove task from project.
```javascript
project.removeTask('task_1');
```

#### getTaskById(taskId)
Find specific task.
```javascript
const task = project.getTaskById('task_1');
```

#### getTasksByPriority(minPriority)
Filter tasks by minimum priority.
```javascript
const importantTasks = project.getTasksByPriority(7);
```

#### getTasksByStatus(status)
Filter tasks by status.
```javascript
const inProgressTasks = project.getTasksByStatus('in-progress');
```

#### getTaskDependencies(taskId)
Get all tasks that a task depends on.
```javascript
const dependencies = project.getTaskDependencies('task_5');
```

#### calculateCriticalPath()
Calculate critical path through project. Returns array of task IDs.
```javascript
const criticalPath = project.calculateCriticalPath();
```

#### getResourceAllocation()
Get task allocation by assignee. Returns object with assignee -> {tasks, totalHours}.
```javascript
const allocation = project.getResourceAllocation();
// { "John Doe": { tasks: [...], totalHours: 40 }, ... }
```

### Pre-save Middleware
- Calculates `taskCount`, `totalEstimatedHours`, `totalActualHours`
- Validates all dependencies exist
- Calculates success metrics
- Updates conflict count

### Indexes
- `(projectName)`
- `(createdAt)`
- `(status, createdAt)`
- `(decompositionMethod)`
- `(feasibilityScore)` desc
- `(constraints.deadline)`
- `(createdBy, createdAt)`

---

## Relationships

```
Task (original)
  └─> Decomposition (1 to many)
        ├─> subtasks: [Task] (embedded)
        └─> patterns: [DecompositionPattern] (references)

Project
  ├─> tasks: [Task] (embedded)
  ├─> assignedTeam: [TeamMember] (embedded)
  ├─> conflicts: [Conflict] (embedded)
  └─> warnings: [Warning] (embedded)
```

---

## Indexes Summary

### DecompositionPattern
- `category`, `isActive` - Fast pattern lookup
- `keywords` - Pattern matching
- `successRate` - Ranking patterns
- `usageCount` - Popularity sorting

### Decomposition
- `taskId`, `createdAt` - Task history
- `decompositionMethod` - Filter by method

### Project
- `projectName` - Project lookup
- `status`, `createdAt` - Status filtering
- `createdBy`, `createdAt` - User projects
- `feasibilityScore` - Risk assessment
- `constraints.deadline` - Deadline sorting

---

## Validation Rules

### Task Validation
```javascript
{
  taskId: Required, unique
  title: Required, 1-255 chars
  estimatedHours: Required, 0.5-160, positive
  priority: Required, 1-10 integer
  dependencies: Valid task IDs
  category: Valid enum
  status: Valid enum
  actualHours: ≥ 0
}
```

### Pattern Validation
```javascript
{
  category: Required
  description: Required
  keywords: Required, non-empty array
  standardTasks: Required, non-empty array
  standardTasks[].order: Unique integers
  implicitDependencies: Valid orders
  No self-dependencies
}
```

### Project Validation
```javascript
{
  projectName: Required
  description: Required
  createdBy: Required
  All tasks: Valid schemas
  All dependencies: Task IDs exist
  No circular dependencies
  Resource allocation: Within constraints
}
```

---

## Usage Examples

### Create a Project with Decomposition

```javascript
const project = await Project.create({
  projectName: 'Build E-commerce Platform',
  description: 'Create a complete e-commerce web application',
  decompositionMethod: 'hierarchical',
  constraints: {
    maxTasks: 50,
    teamSize: 5,
    hoursPerDay: 8,
    deadline: new Date('2026-06-30')
  },
  createdBy: 'user123'
});
```

### Add Tasks

```javascript
project.addTask({
  title: 'Setup Database',
  description: 'Configure MongoDB and create schemas',
  estimatedHours: 8,
  priority: 9,
  skillsRequired: ['mongodb', 'database-design']
});

await project.save();
```

### Query Projects by Status

```javascript
const activeProjects = await Project.find({
  status: 'in-progress',
  createdBy: 'user123'
}).sort({ createdAt: -1 });
```

### Find Patterns by Category

```javascript
const ecommercePatterns = await DecompositionPattern.find({
  category: 'e-commerce',
  isActive: true
}).sort({ successRate: -1 });
```

### Get High-Risk Projects

```javascript
const riskyProjects = await Project.find({
  'riskAssessment.overallRiskLevel': { $in: ['high', 'critical'] }
});
```

### Calculate Resource Allocation

```javascript
const project = await Project.findById(projectId);
const allocation = project.getResourceAllocation();
// Check if anyone is overloaded
for (const [assignee, data] of Object.entries(allocation)) {
  if (data.totalHours > 160) {
    console.log(`${assignee} is overloaded with ${data.totalHours} hours`);
  }
}
```

### Get Critical Path

```javascript
const project = await Project.findById(projectId);
const criticalPath = project.calculateCriticalPath();
const pathTasks = criticalPath.map(id => project.getTaskById(id));
const duration = pathTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
console.log(`Critical path: ${duration} hours`);
```

---

## Validation Utilities

See `utils/schemaValidator.js` for helper functions:

- `validateTask(task)` - Validate task schema
- `validatePattern(pattern)` - Validate pattern schema
- `validateProject(project)` - Validate project schema
- `detectCircularDependencies(tasks)` - Detect cycles
- `calculateTaskCriticality(task, allTasks)` - Task criticality score
- `estimateEffortRange(task)` - PERT estimation
- `validateResourceAvailability(project)` - Check resource constraints

---

## API Endpoints

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/decompose` - Decompose project
- `POST /api/projects/:id/tasks` - Add task
- `GET /api/projects/:id/resources` - Resource allocation
- `GET /api/projects/:id/critical-path` - Critical path

### Patterns
- `POST /api/patterns` - Create pattern
- `GET /api/patterns` - List patterns
- `GET /api/patterns/:id` - Get pattern
- `PUT /api/patterns/:id` - Update pattern
- `DELETE /api/patterns/:id` - Deactivate pattern
- `GET /api/patterns/category/:category` - Patterns by category
- `GET /api/patterns/search?query=...` - Search patterns
- `GET /api/patterns/stats/summary` - Pattern statistics
- `POST /api/patterns/:patternId/usage` - Record pattern usage

---

## Best Practices

1. **Always validate before saving** - Use schemaValidator utilities
2. **Use appropriate decomposition method** - Choose based on project type
3. **Monitor feasibility scores** - Address risks early
4. **Track resource allocation** - Prevent overloading
5. **Document ambiguities** - Capture unknowns for resolution
6. **Use patterns** - Reuse proven decomposition patterns
7. **Record lessons learned** - Update patterns with success rates
8. **Regular status updates** - Keep project status current
9. **Identify risks early** - Use risk assessment features
10. **Manage dependencies carefully** - Avoid circular dependencies
