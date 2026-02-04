const DecompositionPattern = require('../models/DecompositionPattern');
const logger = require('../utils/logger');

// Task decomposition service
const decompositionService = {
  // Main decomposition logic
  decomposeTask: async (task, method = 'hierarchical') => {
    try {
      const taskTitle = task.title;
      const taskDescription = task.description || '';

      // Try to match with existing patterns
      const matchedPattern = await findMatchingPattern(taskDescription);

      let subtasks, complexity, estimatedTotalHours, ambiguities = [];

      if (matchedPattern) {
        // Use pattern-based decomposition
        ({ subtasks, complexity, estimatedTotalHours, ambiguities } = await patternBasedDecomposition(
          taskTitle,
          taskDescription,
          matchedPattern,
          method
        ));
      } else {
        // Use algorithm-based decomposition
        ({ subtasks, complexity, estimatedTotalHours, ambiguities } = generateSubtasks(
          taskTitle,
          taskDescription,
          method
        ));
      }

      return {
        subtasks,
        complexity,
        estimatedTotalHours,
        ambiguities,
        matchedPattern: matchedPattern ? matchedPattern._id : null,
      };
    } catch (error) {
      logger.error('Error in decomposeTask:', error);
      throw error;
    }
  },

  // Find similar patterns for a task
  findRelevantPatterns: async (description, limit = 5) => {
    try {
      const keywords = extractKeywords(description);
      const patterns = await DecompositionPattern.find({
        $and: [
          { isActive: true },
          { keywords: { $in: keywords } },
        ],
      })
        .sort({ successRate: -1, usageCount: -1 })
        .limit(limit);

      return patterns;
    } catch (error) {
      logger.error('Error finding relevant patterns:', error);
      return [];
    }
  },

  // Record pattern usage
  recordPatternUsage: async (patternId, success = true) => {
    try {
      await DecompositionPattern.findByIdAndUpdate(
        patternId,
        {
          $inc: { usageCount: 1 },
          ...(success && { $inc: { successRate: 1 } }),
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error recording pattern usage:', error);
    }
  },

  // Validate task dependencies
  validateDependencies: (tasks) => {
    const taskIds = new Set(tasks.map((t) => t.taskId));
    const errors = [];

    for (const task of tasks) {
      for (const depId of task.dependencies || []) {
        if (!taskIds.has(depId)) {
          errors.push(`Task "${task.title}" depends on non-existent task "${depId}"`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Calculate critical path
  calculateCriticalPath: (tasks) => {
    const visited = new Set();
    const depths = {};

    const dfs = (taskId, depth = 0) => {
      if (visited.has(taskId)) return depth;
      visited.add(taskId);

      const task = tasks.find((t) => t.taskId === taskId);
      if (!task) return depth;

      let maxChildDepth = depth;
      for (const depId of task.dependencies || []) {
        const childDepth = dfs(depId, depth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }

      depths[taskId] = maxChildDepth;
      return maxChildDepth;
    };

    for (const task of tasks) {
      dfs(task.taskId);
    }

    return Object.entries(depths)
      .sort((a, b) => b[1] - a[1])
      .map(([taskId]) => taskId);
  },

  // Identify ambiguities in task description
  identifyAmbiguities: (description, tasks) => {
    const ambiguities = [];
    const ambiguityPatterns = [
      { pattern: /\b(maybe|might|could|possibly|perhaps)\b/gi, flag: 'Uncertain phrasing', severity: 'medium' },
      { pattern: /\b(etc|and so on|etc\.)\b/gi, flag: 'Incomplete specification', severity: 'high' },
      { pattern: /\b(various|multiple|several|different)\b/gi, flag: 'Vague plural', severity: 'medium' },
      { pattern: /\b(fast|quick|efficient|large|small|big)\b/gi, flag: 'Relative adjective', severity: 'low' },
      { pattern: /\b(all|everything|anything|nothing)\b/gi, flag: 'Absolute term', severity: 'medium' },
    ];

    for (const { pattern, flag, severity } of ambiguityPatterns) {
      if (pattern.test(description)) {
        ambiguities.push({
          flag,
          severity,
          description: `Detected in task description: "${flag}"`,
          affectedTasks: [],
        });
      }
    }

    // Check for unspecified dependencies
    if (tasks.length > 5 && !description.toLowerCase().includes('sequence')) {
      ambiguities.push({
        flag: 'Unclear sequencing',
        severity: 'medium',
        description: 'Large number of tasks without clear sequencing',
        affectedTasks: tasks.map((t) => t.taskId),
      });
    }

    return ambiguities;
  },
};

// Helper: Find matching pattern
async function findMatchingPattern(description) {
  try {
    const keywords = extractKeywords(description);
    if (keywords.length === 0) return null;

    const pattern = await DecompositionPattern.findOne({
      $and: [
        { isActive: true },
        { keywords: { $in: keywords } },
      ],
    }).sort({ successRate: -1 });

    return pattern;
  } catch (error) {
    logger.error('Error finding matching pattern:', error);
    return null;
  }
}

// Helper: Pattern-based decomposition
async function patternBasedDecomposition(taskTitle, description, pattern, method) {
  let subtasks = [];

  if (method === 'hierarchical' || method === 'hybrid') {
    subtasks = pattern.standardTasks.map((stdTask) => ({
      title: stdTask.title.replace(/{task}/g, taskTitle),
      description: stdTask.description || '',
      estimatedHours: stdTask.estimatedHours,
      priority: stdTask.priority,
      category: stdTask.category,
      skillsRequired: stdTask.skillsRequired || [],
      dependencies: resolveDependencies(pattern.implicitDependencies, stdTask.order),
    }));
  } else if (method === 'sequential') {
    subtasks = pattern.standardTasks
      .sort((a, b) => a.order - b.order)
      .map((stdTask, idx) => ({
        title: stdTask.title.replace(/{task}/g, taskTitle),
        description: stdTask.description || '',
        estimatedHours: stdTask.estimatedHours,
        priority: stdTask.priority,
        category: stdTask.category,
        skillsRequired: stdTask.skillsRequired || [],
        dependencies: idx > 0 ? [pattern.standardTasks[idx - 1].order.toString()] : [],
      }));
  } else if (method === 'parallel') {
    subtasks = pattern.standardTasks.map((stdTask) => ({
      title: stdTask.title.replace(/{task}/g, taskTitle),
      description: stdTask.description || '',
      estimatedHours: stdTask.estimatedHours,
      priority: stdTask.priority,
      category: stdTask.category,
      skillsRequired: stdTask.skillsRequired || [],
      dependencies: [],
    }));
  }

  const complexity = assessComplexity(subtasks.length);
  const estimatedTotalHours = calculateEstimatedHours(subtasks);
  const ambiguities = decompositionService.identifyAmbiguities(description, subtasks);

  return {
    subtasks,
    complexity,
    estimatedTotalHours,
    ambiguities,
  };
}

// Helper: Extract keywords from description
function extractKeywords(description) {
  if (!description) return [];
  return description
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 10);
}

// Helper: Resolve dependencies
function resolveDependencies(implicitDeps, taskOrder) {
  return implicitDeps
    .filter((dep) => dep.toTaskOrder === taskOrder)
    .map((dep) => `task_${dep.fromTaskOrder}`);
}

// Helper: Generate subtasks algorithmically
function generateSubtasks(taskTitle, taskDescription, method) {
  const subtasks = [];

  if (method === 'hierarchical') {
    subtasks.push(
      {
        taskId: 'task_1',
        title: `Plan: ${taskTitle}`,
        description: 'Break down the main task into smaller components and create a detailed plan',
        estimatedHours: 2,
        priority: 10,
        category: 'general',
        skillsRequired: ['analysis', 'planning'],
        dependencies: [],
      },
      {
        taskId: 'task_2',
        title: `Design: ${taskTitle}`,
        description: 'Create a design or architecture for the solution',
        estimatedHours: 3,
        priority: 9,
        category: 'general',
        skillsRequired: ['design', 'architecture'],
        dependencies: ['task_1'],
      },
      {
        taskId: 'task_3',
        title: `Implement: ${taskTitle}`,
        description: 'Execute the implementation of the solution',
        estimatedHours: 8,
        priority: 8,
        category: 'general',
        skillsRequired: ['development', 'coding'],
        dependencies: ['task_2'],
      },
      {
        taskId: 'task_4',
        title: `Test: ${taskTitle}`,
        description: 'Test and validate the solution thoroughly',
        estimatedHours: 4,
        priority: 9,
        category: 'general',
        skillsRequired: ['testing', 'qa'],
        dependencies: ['task_3'],
      },
      {
        taskId: 'task_5',
        title: `Deploy: ${taskTitle}`,
        description: 'Deploy the solution to production',
        estimatedHours: 2,
        priority: 8,
        category: 'deployment',
        skillsRequired: ['deployment', 'devops'],
        dependencies: ['task_4'],
      }
    );
  } else if (method === 'sequential') {
    subtasks.push(
      {
        taskId: 'task_1',
        title: `Analyze: ${taskTitle}`,
        description: 'Understand the requirements and scope',
        estimatedHours: 2,
        priority: 10,
        category: 'general',
        skillsRequired: ['analysis'],
        dependencies: [],
      },
      {
        taskId: 'task_2',
        title: `Prepare: ${taskTitle}`,
        description: 'Gather resources and prepare environment',
        estimatedHours: 2,
        priority: 8,
        category: 'general',
        skillsRequired: ['preparation'],
        dependencies: ['task_1'],
      },
      {
        taskId: 'task_3',
        title: `Execute: ${taskTitle}`,
        description: 'Perform the main work sequentially',
        estimatedHours: 5,
        priority: 10,
        category: 'general',
        skillsRequired: ['execution'],
        dependencies: ['task_2'],
      },
      {
        taskId: 'task_4',
        title: `Review: ${taskTitle}`,
        description: 'Review and finalize the work',
        estimatedHours: 2,
        priority: 9,
        category: 'general',
        skillsRequired: ['review', 'qa'],
        dependencies: ['task_3'],
      }
    );
  } else if (method === 'parallel') {
    subtasks.push(
      {
        taskId: 'task_1',
        title: `Prepare: ${taskTitle}`,
        description: 'Gather resources and setup',
        estimatedHours: 1,
        priority: 10,
        category: 'general',
        skillsRequired: ['preparation'],
        dependencies: [],
      },
      {
        taskId: 'task_2',
        title: `Component A: ${taskTitle}`,
        description: 'First parallel component',
        estimatedHours: 4,
        priority: 8,
        category: 'general',
        skillsRequired: ['development'],
        dependencies: ['task_1'],
      },
      {
        taskId: 'task_3',
        title: `Component B: ${taskTitle}`,
        description: 'Second parallel component',
        estimatedHours: 4,
        priority: 8,
        category: 'general',
        skillsRequired: ['development'],
        dependencies: ['task_1'],
      },
      {
        taskId: 'task_4',
        title: `Component C: ${taskTitle}`,
        description: 'Third parallel component',
        estimatedHours: 4,
        priority: 8,
        category: 'general',
        skillsRequired: ['development'],
        dependencies: ['task_1'],
      },
      {
        taskId: 'task_5',
        title: `Integration: ${taskTitle}`,
        description: 'Integrate all components together',
        estimatedHours: 3,
        priority: 9,
        category: 'integration',
        skillsRequired: ['integration', 'testing'],
        dependencies: ['task_2', 'task_3', 'task_4'],
      }
    );
  }

  const complexity = assessComplexity(subtasks.length);
  const estimatedTotalHours = calculateEstimatedHours(subtasks);
  const ambiguities = decompositionService.identifyAmbiguities(taskDescription, subtasks);

  return {
    subtasks,
    complexity,
    estimatedTotalHours,
    ambiguities,
  };
}

// Helper: Assess complexity
function assessComplexity(subtaskCount) {
  if (subtaskCount <= 2) return 'simple';
  if (subtaskCount <= 4) return 'moderate';
  return 'complex';
}

// Helper: Calculate estimated hours
function calculateEstimatedHours(subtasks) {
  return subtasks.reduce((total, subtask) => total + (subtask.estimatedHours || 0), 0);
}

module.exports = decompositionService;
