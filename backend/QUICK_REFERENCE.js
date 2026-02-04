#!/usr/bin/env node

/**
 * Quick Start Guide - Task Decomposition Schemas
 * 
 * This file provides quick reference examples for using the schemas
 */

// ============================================
// 1. CREATE A PROJECT
// ============================================

const exampleCreateProject = `
POST /api/projects
{
  "projectName": "E-commerce Platform",
  "description": "Build a complete e-commerce web application",
  "decompositionMethod": "hierarchical",
  "constraints": {
    "maxTasks": 50,
    "teamSize": 5,
    "hoursPerDay": 8,
    "deadline": "2026-06-30",
    "budget": 200000,
    "maxConcurrentTasks": 4,
    "skillRequirements": {
      "backend": 2,
      "frontend": 2,
      "devops": 1
    }
  },
  "createdBy": "john.doe@company.com"
}

Response: 201 Created
{
  "success": true,
  "data": { /* full project object */ },
  "message": "Project created successfully"
}
`;

// ============================================
// 2. DECOMPOSE A PROJECT
// ============================================

const exampleDecomposeProject = `
POST /api/projects/{projectId}/decompose
{
  "decompositionMethod": "hierarchical"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "projectName": "E-commerce Platform",
    "status": "analyzed",
    "taskCount": 12,
    "tasks": [
      {
        "taskId": "task_1",
        "title": "Plan: E-commerce Platform",
        "estimatedHours": 2,
        "priority": 10,
        "dependencies": [],
        "category": "general",
        "status": "planned"
      },
      // ... more tasks
    ],
    "feasibilityScore": 78,
    "riskAssessment": {
      "overallRiskLevel": "medium",
      "riskScore": 22,
      "identifiedRisks": [...]
    },
    "conflicts": [
      {
        "taskId1": "task_2",
        "taskId2": "task_3",
        "conflictType": "resource",
        "severity": "medium",
        "description": "..."
      }
    ],
    "warnings": [...]
  }
}
`;

// ============================================
// 3. QUERY PROJECTS WITH FILTERS
// ============================================

const exampleQueryProjects = `
GET /api/projects?status=analyzed&createdBy=john.doe@company.com&decompositionMethod=hierarchical

Response: 200 OK
{
  "success": true,
  "data": [ /* array of projects */ ],
  "count": 3
}
`;

// ============================================
// 4. GET RESOURCE ALLOCATION
// ============================================

const exampleResourceAllocation = `
GET /api/projects/{projectId}/resources

Response: 200 OK
{
  "success": true,
  "data": {
    "john.doe@company.com": {
      "tasks": ["task_1", "task_3", "task_5"],
      "totalHours": 48
    },
    "jane.smith@company.com": {
      "tasks": ["task_2", "task_4"],
      "totalHours": 32
    }
  }
}
`;

// ============================================
// 5. GET CRITICAL PATH
// ============================================

const exampleCriticalPath = `
GET /api/projects/{projectId}/critical-path

Response: 200 OK
{
  "success": true,
  "data": {
    "criticalPath": ["task_1", "task_2", "task_4", "task_7"],
    "tasks": [
      {
        "taskId": "task_1",
        "title": "Plan: E-commerce Platform",
        "estimatedHours": 2
      },
      // ... tasks on critical path
    ],
    "totalEstimatedHours": 48
  }
}
`;

// ============================================
// 6. CREATE A DECOMPOSITION PATTERN
// ============================================

const exampleCreatePattern = `
POST /api/patterns
{
  "category": "e-commerce",
  "description": "Standard e-commerce platform decomposition",
  "keywords": ["shopping", "cart", "checkout", "payment", "store"],
  "standardTasks": [
    {
      "title": "Setup {task} Infrastructure",
      "description": "Configure hosting, databases, and infrastructure",
      "estimatedHours": 16,
      "priority": 10,
      "order": 1,
      "skillsRequired": ["devops", "cloud"]
    },
    {
      "title": "Database Design for {task}",
      "description": "Design database schema and models",
      "estimatedHours": 12,
      "priority": 9,
      "order": 2,
      "skillsRequired": ["database-design", "sql"]
    },
    // ... more tasks
  ],
  "implicitDependencies": [
    {
      "fromTaskOrder": 1,
      "toTaskOrder": 2,
      "dependencyType": "blocks",
      "description": "Need infrastructure before DB"
    },
    // ... more dependencies
  ],
  "createdBy": "system"
}

Response: 201 Created
{
  "success": true,
  "data": { /* full pattern object */ },
  "message": "Pattern created successfully"
}
`;

// ============================================
// 7. SEARCH PATTERNS
// ============================================

const exampleSearchPatterns = `
GET /api/patterns/search?query=e-commerce+checkout

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "category": "e-commerce",
      "description": "Standard e-commerce platform decomposition",
      "successRate": 85,
      "usageCount": 12
    }
  ],
  "query": "e-commerce checkout",
  "count": 1
}
`;

// ============================================
// 8. GET PATTERN STATISTICS
// ============================================

const examplePatternStats = `
GET /api/patterns/stats/summary

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "e-commerce",
      "count": 3,
      "avgSuccessRate": 85.33,
      "avgUsageCount": 8.67,
      "totalUsage": 26
    },
    {
      "_id": "auth",
      "count": 2,
      "avgSuccessRate": 92,
      "avgUsageCount": 5,
      "totalUsage": 10
    }
  ]
}
`;

// ============================================
// 9. ADD TASK TO PROJECT
// ============================================

const exampleAddTask = `
POST /api/projects/{projectId}/tasks
{
  "title": "Custom Implementation Task",
  "description": "Implement custom features",
  "estimatedHours": 8,
  "priority": 7,
  "category": "general",
  "skillsRequired": ["backend", "testing"],
  "dependencies": []
}

Response: 201 Created
{
  "success": true,
  "data": {
    "taskId": "task_custom_1",
    "title": "Custom Implementation Task",
    "estimatedHours": 8,
    // ... full task object
  },
  "message": "Task added to project"
}
`;

// ============================================
// 10. RECORD PATTERN USAGE
// ============================================

const exampleRecordUsage = `
POST /api/patterns/{patternId}/usage
{
  "success": true
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "usageCount": 13,
    "successRate": 85.38
  },
  "message": "Pattern usage recorded"
}
`;

// ============================================
// 11. VALIDATION EXAMPLES
// ============================================

const exampleValidation = `
// Using schemaValidator utility

const { validateProject, validateTask, detectCircularDependencies } = require('./utils/schemaValidator');

// Validate a project
const validation = validateProject(projectData);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Validate individual task
const taskValidation = validateTask(taskData);
console.log('Task valid:', taskValidation.isValid);

// Detect circular dependencies
const cycles = detectCircularDependencies(tasks);
if (cycles.hasCycles) {
  console.log('Circular dependencies found:', cycles.cycleTaskIds);
}
`;

// ============================================
// 12. PROJECT INSTANCE METHODS
// ============================================

const exampleProjectMethods = `
// Get project from database
const project = await Project.findById(projectId);

// Add a new task
const newTask = project.addTask({
  title: 'New Task',
  estimatedHours: 4,
  priority: 5
});

// Get task by ID
const task = project.getTaskById('task_5');

// Get high-priority tasks
const importantTasks = project.getTasksByPriority(8);

// Get tasks by status
const completedTasks = project.getTasksByStatus('completed');

// Get dependencies for a task
const dependencies = project.getTaskDependencies('task_5');

// Calculate critical path
const criticalPath = project.calculateCriticalPath();
// Returns: ['task_1', 'task_2', 'task_4', 'task_7']

// Get resource allocation
const allocation = project.getResourceAllocation();
// Returns: {
//   'john@company.com': { tasks: [...], totalHours: 48 },
//   'jane@company.com': { tasks: [...], totalHours: 32 }
// }

// Save project after changes
await project.save();
`;

// ============================================
// 13. SCHEMA FIELDS AT A GLANCE
// ============================================

const schemaFieldsReference = `
TASK SCHEMA
-----------
taskId (String)               - Unique identifier
title (String)                - Task name
description (String)          - Detailed description
estimatedHours (Number)       - 0.5-160 hours
priority (Number)             - 1-10 (integer)
dependencies (Array)          - Task IDs
category (String)             - e-commerce, auth, api, etc.
status (String)               - planned, in-progress, completed, etc.
assignee (String)             - Person assigned
skillsRequired (Array)        - Required skills
ambiguityFlags (Array)        - Identified ambiguities
riskLevel (String)            - low, medium, high
actualHours (Number)          - Hours actually spent
completionDate (Date)         - When completed

PROJECT SCHEMA
--------------
projectName (String)          - Project identifier
description (String)          - Project description
decompositionMethod (String)  - hierarchical, sequential, parallel, hybrid
constraints (Object)          - Project constraints
  - maxTasks, teamSize, hoursPerDay, deadline, budget, etc.
tasks (Array)                 - Array of Task documents
taskCount (Number)            - Number of tasks
totalEstimatedHours (Number)  - Sum of estimates
totalActualHours (Number)     - Sum of actual hours
conflicts (Array)             - Identified conflicts
feasibilityScore (Number)     - 0-100 score
riskAssessment (Object)       - Risk analysis
  - overallRiskLevel, riskScore, identifiedRisks
warnings (Array)              - Project warnings
status (String)               - draft, analyzed, ready, in-progress, etc.
successMetrics (Object)       - Completion tracking
assignedTeam (Array)          - Team members
createdBy (String)            - Creator ID

PATTERN SCHEMA
--------------
category (String)             - Pattern category
description (String)          - What it's for
keywords (Array)              - Match keywords
standardTasks (Array)         - Task templates
  - title, estimatedHours, priority, order, skillsRequired
implicitDependencies (Array)  - Dependency rules
  - fromTaskOrder, toTaskOrder, dependencyType, description
isActive (Boolean)            - Active status
successRate (Number)          - 0-100 rate
usageCount (Number)           - Times used
`;

// ============================================
// 14. COMMON QUERIES
// ============================================

const commonQueries = `
// Find all active projects
const projects = await Project.find({ status: { $ne: 'archived' } });

// Find high-risk projects
const riskyProjects = await Project.find({
  'riskAssessment.overallRiskLevel': { $in: ['high', 'critical'] }
});

// Find projects near deadline
const upcoming = await Project.find({
  'constraints.deadline': { 
    $gte: new Date(),
    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});

// Find projects by team
const teamProjects = await Project.find({
  'assignedTeam.memberId': 'user123'
});

// Find patterns by category
const patterns = await DecompositionPattern.find({
  category: 'e-commerce',
  isActive: true
}).sort({ successRate: -1 });

// Find top-performing patterns
const topPatterns = await DecompositionPattern.find({
  isActive: true
}).sort({ successRate: -1 }).limit(10);

// Find all decompositions for a task
const decompositions = await Decomposition.find({
  taskId: taskId
}).sort({ createdAt: -1 });
`;

// ============================================
// EXPORT
// ============================================

module.exports = {
  exampleCreateProject,
  exampleDecomposeProject,
  exampleQueryProjects,
  exampleResourceAllocation,
  exampleCriticalPath,
  exampleCreatePattern,
  exampleSearchPatterns,
  examplePatternStats,
  exampleAddTask,
  exampleRecordUsage,
  exampleValidation,
  exampleProjectMethods,
  schemaFieldsReference,
  commonQueries,
};

/**
 * QUICK REFERENCE CHECKLIST
 * 
 * [ ] Install dependencies: npm install
 * [ ] Create .env file with MONGO_URI
 * [ ] Start MongoDB service
 * [ ] Run backend: npm run dev
 * [ ] Seed database: Use seedData.js
 * [ ] Test endpoints: Use Postman/curl
 * [ ] Check SCHEMA_GUIDE.md for details
 * [ ] Review implementation in each model file
 * [ ] Use schemaValidator for validation
 * [ ] Monitor project feasibility scores
 * [ ] Track pattern success rates
 * [ ] Use instance methods for analysis
 * 
 * DOCUMENTATION FILES
 * 
 * [ ] SCHEMA_GUIDE.md - Comprehensive schema reference
 * [ ] IMPLEMENTATION_SUMMARY.md - Implementation details
 * [ ] models/README.md - Model documentation
 * [ ] QUICK_REFERENCE.js - This file
 * 
 */
