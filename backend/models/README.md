/**
 * Task Decomposition Models Documentation
 * 
 * This document describes the MongoDB schemas used in the Task Decomposition System
 */

/**
 * SCHEMA: Task (Embedded Schema)
 * Location: models/TaskSchema.js
 * 
 * Used as an embedded sub-document in:
 * - Decomposition model (subtasks array)
 * - Project model (tasks array)
 * 
 * Fields:
 * - taskId: Unique identifier for the task
 * - title: Task name (required)
 * - description: Detailed description
 * - estimatedHours: Estimated work hours (0.5-160)
 * - priority: Priority level (1-10, integer)
 * - dependencies: Array of task IDs this task depends on
 * - category: Task category (e-commerce, auth, payments, etc.)
 * - status: Current status (planned, in-progress, blocked, completed, on-hold)
 * - assignee: Person assigned to the task
 * - skillsRequired: Array of required skills
 * - ambiguityFlags: Array of identified ambiguities with severity
 * - riskLevel: Risk assessment (low, medium, high)
 * - riskFactors: Specific risk descriptions
 * - actualHours: Actual hours spent (once task starts)
 * - completionDate: When task was completed
 * - notes: Additional notes
 * 
 * Virtual Fields:
 * - isOverdue: Boolean indicating if task exceeded 120% of estimated hours
 */

/**
 * SCHEMA: DecompositionPattern
 * Location: models/DecompositionPattern.js
 * Collection: decompositionPatterns
 * 
 * Stores standard decomposition patterns that can be applied to similar tasks.
 * Used to improve decomposition consistency and quality.
 * 
 * Fields:
 * - category: Pattern category (e-commerce, auth, payments, reporting, etc.)
 * - description: What this pattern is used for
 * - keywords: Array of keywords to match in task descriptions
 * - standardTasks: Array of task templates including:
 *   - title: Task title
 *   - description: Task description
 *   - estimatedHours: Standard hours estimate
 *   - priority: Standard priority (1-10)
 *   - order: Sequence order in decomposition
 *   - skillsRequired: Required skills
 * - implicitDependencies: Array of dependency rules:
 *   - fromTaskOrder: Which standard task
 *   - toTaskOrder: Depends on which task
 *   - dependencyType: blocks, requires_output, sequential, parallel
 *   - description: Why this dependency exists
 * - isActive: Whether pattern is active
 * - successRate: Historical success rate (0-100)
 * - usageCount: How many times pattern was used
 * - tags: Searchable tags
 * 
 * Indexes:
 * - (category, isActive)
 * - (keywords)
 * - (createdAt)
 * - (successRate) - for ranking patterns
 * - (usageCount) - for popularity
 */

/**
 * SCHEMA: Decomposition
 * Location: models/Decomposition.js
 * Collection: decompositions
 * 
 * Stores the decomposition results for a single task.
 * 
 * Fields:
 * - taskId: Reference to original Task
 * - originalTask: Title of original task
 * - originalDescription: Full description
 * - subtasks: Array of Task documents (embedded)
 * - decompositionMethod: hierarchical, sequential, parallel, hybrid
 * - complexity: simple, moderate, complex
 * - estimatedTotalHours: Sum of all subtask estimates
 * - actualTotalHours: Sum of actual hours (when complete)
 * - ambiguities: Array of identified ambiguities with severity
 * - patterns: References to DecompositionPatterns that were applied
 * - createdAt: When decomposition was created
 * - updatedAt: When last updated
 * - createdBy: User who created it
 * 
 * Indexes:
 * - (taskId, createdAt)
 * - (decompositionMethod)
 * - (createdAt)
 */

/**
 * SCHEMA: Project
 * Location: models/Project.js
 * Collection: projects
 * 
 * Stores complete project decomposition with all tasks, constraints, and status.
 * 
 * Fields:
 * - projectName: Project identifier (required)
 * - description: Project description
 * - originalDescription: Original task description
 * - decompositionMethod: How tasks were decomposed
 * - constraints: Project constraints:
 *   - maxTasks: Maximum number of tasks
 *   - teamSize: Team size available
 *   - hoursPerDay: Working hours per day
 *   - deadline: Project deadline
 *   - budget: Project budget
 *   - maxConcurrentTasks: Max parallel tasks
 *   - skillRequirements: Map of skill -> required count
 * - tasks: Array of Task documents
 * - taskCount: Number of tasks
 * - totalEstimatedHours: Sum of all estimated hours
 * - totalActualHours: Sum of actual hours
 * - conflicts: Array of identified conflicts:
 *   - taskId1, taskId2: Conflicting tasks
 *   - conflictType: resource, dependency, schedule, skill, unknown
 *   - severity: low, medium, high, critical
 *   - resolution: How conflict was resolved
 * - conflictCount: Number of conflicts
 * - feasibilityScore: 0-100 score of project feasibility
 * - riskAssessment:
 *   - overallRiskLevel: low, medium, high, critical
 *   - riskScore: 0-100 risk score
 *   - identifiedRisks: Array of risk descriptions
 * - warnings: Array of warnings with type and severity
 * - status: draft, analyzing, analyzed, ready, in-progress, completed, archived
 * - successMetrics:
 *   - completionRate: % of tasks completed
 *   - timeAccuracy: Actual/Estimated ratio
 *   - taskCompletionCount: Number completed
 *   - onTimeTaskCount: Number completed on time
 * - assignedTeam: Array of team members with assigned tasks
 * - tags: Searchable tags
 * - createdAt, updatedAt: Timestamps
 * - startDate, completionDate: Project timeline
 * - createdBy: User who created project
 * 
 * Indexes:
 * - (projectName)
 * - (createdAt)
 * - (status, createdAt)
 * - (decompositionMethod)
 * - (feasibilityScore) desc
 * - (constraints.deadline)
 * - (createdBy, createdAt)
 * 
 * Instance Methods:
 * - addTask(taskData): Add new task to project
 * - removeTask(taskId): Remove task from project
 * - getTaskById(taskId): Find task
 * - getTasksByPriority(minPriority): Filter tasks by priority
 * - getTasksByStatus(status): Filter tasks by status
 * - getTaskDependencies(taskId): Get dependent tasks
 * - calculateCriticalPath(): Find critical path through tasks
 * - getResourceAllocation(): Get task allocation by assignee
 */

/**
 * RELATIONSHIPS
 * 
 * Task (Decomposition)
 *   └─> Decomposition (many)
 *         └─> subtasks: [Task embedded documents]
 *         └─> patterns: [DecompositionPattern references]
 * 
 * Project
 *   ├─> tasks: [Task embedded documents]
 *   ├─> assignedTeam: [TeamMember embedded documents]
 *   └─> conflicts: [Conflict embedded documents]
 */

/**
 * QUERY EXAMPLES
 */

// Find all decompositions for a task
// db.decompositions.find({ taskId: ObjectId(...) }).sort({ createdAt: -1 })

// Find patterns by category
// db.decompositionPatterns.find({ category: "e-commerce", isActive: true })

// Find projects by status and deadline
// db.projects.find({ status: "ready", "constraints.deadline": { $lte: new Date() } })

// Find overdue tasks in project
// db.projects.findOne({ _id: ObjectId(...) }).tasks.filter(t => t.actualHours > t.estimatedHours * 1.2)

// Find high-risk projects
// db.projects.find({ "riskAssessment.overallRiskLevel": { $in: ["high", "critical"] } })

module.exports = {
  description: 'Task Decomposition Models Documentation',
};
