const mongoose = require('mongoose');
const taskSchema = require('./TaskSchema');

const constraintSchema = new mongoose.Schema(
  {
    _id: false,
    maxTasks: {
      type: Number,
      min: 1,
      max: 1000,
      default: 100,
    },
    teamSize: {
      type: Number,
      min: 1,
      max: 500,
      default: 5,
    },
    hoursPerDay: {
      type: Number,
      min: 1,
      max: 24,
      default: 8,
    },
    deadline: {
      type: Date,
    },
    budget: {
      type: Number,
      min: 0,
    },
    maxConcurrentTasks: {
      type: Number,
      min: 1,
      default: 3,
    },
    skillRequirements: {
      type: Map,
      of: Number, // Maps skill name to required count
    },
  },
  { timestamps: false }
);

const conflictSchema = new mongoose.Schema(
  {
    _id: false,
    taskId1: {
      type: String,
      required: true,
    },
    taskId2: {
      type: String,
      required: true,
    },
    conflictType: {
      type: String,
      enum: ['resource', 'dependency', 'schedule', 'skill', 'unknown'],
      default: 'unknown',
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    resolution: String,
  },
  { timestamps: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    originalDescription: {
      type: String,
      required: true,
    },
    decompositionMethod: {
      type: String,
      enum: ['hierarchical', 'sequential', 'parallel', 'hybrid'],
      default: 'hierarchical',
      index: true,
    },
    constraints: {
      type: constraintSchema,
      default: () => ({}),
    },
    tasks: {
      type: [taskSchema],
      default: [],
    },
    taskCount: {
      type: Number,
      default: 0,
      index: true,
    },
    totalEstimatedHours: {
      type: Number,
      default: 0,
    },
    totalActualHours: {
      type: Number,
      default: 0,
    },
    conflicts: {
      type: [conflictSchema],
      default: [],
    },
    conflictCount: {
      type: Number,
      default: 0,
    },
    feasibilityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    riskAssessment: {
      overallRiskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      identifiedRisks: [String],
    },
    warnings: [
      {
        _id: false,
        type: {
          type: String,
          enum: ['ambiguity', 'dependency', 'resource', 'schedule', 'feasibility', 'skill'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ['info', 'warning', 'error', 'critical'],
          default: 'warning',
        },
        affectedTasks: [String],
        suggestion: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'analyzing', 'analyzed', 'ready', 'in-progress', 'completed', 'archived'],
      default: 'draft',
      index: true,
    },
    successMetrics: {
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      timeAccuracy: {
        type: Number,
        min: 0,
        default: 0, // Ratio of actualHours / estimatedHours
      },
      taskCompletionCount: {
        type: Number,
        default: 0,
      },
      onTimeTaskCount: {
        type: Number,
        default: 0,
      },
    },
    assignedTeam: [
      {
        _id: false,
        memberId: String,
        name: String,
        role: String,
        assignedTasks: [String],
      },
    ],
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    startDate: Date,
    completionDate: Date,
    createdBy: {
      type: String,
      required: true,
    },
    lastModifiedBy: String,
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

// Indexes for efficient querying
projectSchema.index({ projectName: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ decompositionMethod: 1 });
projectSchema.index({ feasibilityScore: -1 });
projectSchema.index({ 'constraints.deadline': 1 });
projectSchema.index({ createdBy: 1, createdAt: -1 });

// Pre-save middleware to calculate derived fields
projectSchema.pre('save', function (next) {
  // Update task count
  this.taskCount = this.tasks.length;

  // Calculate total estimated and actual hours
  this.totalEstimatedHours = this.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  this.totalActualHours = this.tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

  // Update conflict count
  this.conflictCount = this.conflicts.length;

  // Validate that all task dependencies exist
  const taskIds = new Set(this.tasks.map((t) => t.taskId));
  for (const task of this.tasks) {
    for (const depId of task.dependencies) {
      if (!taskIds.has(depId)) {
        return next(new Error(`Task dependency "${depId}" does not exist in project`));
      }
    }
  }

  // Update success metrics
  if (this.taskCount > 0) {
    const completedTasks = this.tasks.filter((t) => t.status === 'completed');
    this.successMetrics.completionRate = (completedTasks.length / this.taskCount) * 100;
    this.successMetrics.taskCompletionCount = completedTasks.length;

    // Calculate time accuracy
    const tasksWithHours = this.tasks.filter((t) => t.estimatedHours && t.actualHours);
    if (tasksWithHours.length > 0) {
      const accuracies = tasksWithHours.map((t) => t.actualHours / t.estimatedHours);
      this.successMetrics.timeAccuracy =
        accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    }

    // Count on-time tasks
    this.successMetrics.onTimeTaskCount = this.tasks.filter(
      (t) => t.actualHours && t.actualHours <= t.estimatedHours * 1.1 // 10% tolerance
    ).length;
  }

  next();
});

// Instance methods
projectSchema.methods.addTask = function (taskData) {
  const newTask = {
    taskId: `task_${this.tasks.length + 1}`,
    ...taskData,
  };
  this.tasks.push(newTask);
  return newTask;
};

projectSchema.methods.removeTask = function (taskId) {
  this.tasks = this.tasks.filter((t) => t.taskId !== taskId);
};

projectSchema.methods.getTaskById = function (taskId) {
  return this.tasks.find((t) => t.taskId === taskId);
};

projectSchema.methods.getTasksByPriority = function (minPriority = 1) {
  return this.tasks.filter((t) => t.priority >= minPriority).sort((a, b) => b.priority - a.priority);
};

projectSchema.methods.getTasksByStatus = function (status) {
  return this.tasks.filter((t) => t.status === status);
};

projectSchema.methods.getTaskDependencies = function (taskId) {
  const task = this.getTaskById(taskId);
  if (!task) return [];
  return this.tasks.filter((t) => task.dependencies.includes(t.taskId));
};

projectSchema.methods.calculateCriticalPath = function () {
  // Simple implementation - can be enhanced with more sophisticated algorithms
  const visited = new Set();
  const maxDepth = {};

  const dfs = (taskId, depth = 0) => {
    if (visited.has(taskId)) return depth;
    visited.add(taskId);

    const task = this.getTaskById(taskId);
    if (!task) return depth;

    let maxChildDepth = depth;
    for (const depId of task.dependencies) {
      const childDepth = dfs(depId, depth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    maxDepth[taskId] = maxChildDepth;
    return maxChildDepth;
  };

  for (const task of this.tasks) {
    dfs(task.taskId);
  }

  return Object.entries(maxDepth)
    .sort((a, b) => b[1] - a[1])
    .map(([taskId]) => taskId);
};

projectSchema.methods.getResourceAllocation = function () {
  const allocation = {};

  for (const task of this.tasks) {
    if (task.assignee) {
      if (!allocation[task.assignee]) {
        allocation[task.assignee] = {
          tasks: [],
          totalHours: 0,
        };
      }
      allocation[task.assignee].tasks.push(task.taskId);
      allocation[task.assignee].totalHours += task.estimatedHours;
    }
  }

  return allocation;
};

module.exports = mongoose.model('Project', projectSchema);
