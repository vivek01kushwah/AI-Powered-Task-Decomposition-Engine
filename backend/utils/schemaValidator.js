/**
 * Schema Validation Utility
 * Provides validation helpers for complex schema operations
 */

const logger = require('./logger');

// Validate Task schema
const validateTask = (task) => {
  const errors = [];

  if (!task.taskId) errors.push('taskId is required');
  if (!task.title) errors.push('title is required');
  if (typeof task.estimatedHours !== 'number' || task.estimatedHours <= 0) {
    errors.push('estimatedHours must be a positive number');
  }
  if (!Number.isInteger(task.priority) || task.priority < 1 || task.priority > 10) {
    errors.push('priority must be an integer between 1 and 10');
  }

  if (task.dependencies && !Array.isArray(task.dependencies)) {
    errors.push('dependencies must be an array');
  }

  const validCategories = ['e-commerce', 'auth', 'payments', 'reporting', 'data-processing', 'api', 'deployment', 'general'];
  if (task.category && !validCategories.includes(task.category)) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }

  const validStatuses = ['planned', 'in-progress', 'blocked', 'completed', 'on-hold'];
  if (task.status && !validStatuses.includes(task.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate DecompositionPattern schema
const validatePattern = (pattern) => {
  const errors = [];

  if (!pattern.category) errors.push('category is required');
  if (!pattern.description) errors.push('description is required');
  if (!Array.isArray(pattern.keywords) || pattern.keywords.length === 0) {
    errors.push('keywords must be a non-empty array');
  }

  if (!Array.isArray(pattern.standardTasks) || pattern.standardTasks.length === 0) {
    errors.push('standardTasks must be a non-empty array');
  } else {
    // Validate each standard task
    const orders = new Set();
    for (let i = 0; i < pattern.standardTasks.length; i++) {
      const task = pattern.standardTasks[i];
      if (!task.title) errors.push(`standardTasks[${i}].title is required`);
      if (!Number.isInteger(task.order)) errors.push(`standardTasks[${i}].order must be an integer`);
      if (orders.has(task.order)) errors.push(`standardTasks[${i}].order must be unique`);
      orders.add(task.order);
    }
  }

  if (Array.isArray(pattern.implicitDependencies)) {
    const validOrders = new Set(pattern.standardTasks.map((t) => t.order));
    for (let i = 0; i < pattern.implicitDependencies.length; i++) {
      const dep = pattern.implicitDependencies[i];
      if (!validOrders.has(dep.fromTaskOrder)) {
        errors.push(`implicitDependencies[${i}].fromTaskOrder references non-existent task`);
      }
      if (!validOrders.has(dep.toTaskOrder)) {
        errors.push(`implicitDependencies[${i}].toTaskOrder references non-existent task`);
      }
      if (dep.fromTaskOrder === dep.toTaskOrder) {
        errors.push(`implicitDependencies[${i}]: task cannot depend on itself`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate Project schema
const validateProject = (project) => {
  const errors = [];

  if (!project.projectName) errors.push('projectName is required');
  if (!project.description) errors.push('description is required');
  if (!project.createdBy) errors.push('createdBy is required');

  const validMethods = ['hierarchical', 'sequential', 'parallel', 'hybrid'];
  if (project.decompositionMethod && !validMethods.includes(project.decompositionMethod)) {
    errors.push(`decompositionMethod must be one of: ${validMethods.join(', ')}`);
  }

  if (project.constraints) {
    const constraints = project.constraints;
    if (constraints.maxTasks && constraints.maxTasks < 1) {
      errors.push('constraints.maxTasks must be at least 1');
    }
    if (constraints.teamSize && constraints.teamSize < 1) {
      errors.push('constraints.teamSize must be at least 1');
    }
    if (constraints.hoursPerDay && (constraints.hoursPerDay < 1 || constraints.hoursPerDay > 24)) {
      errors.push('constraints.hoursPerDay must be between 1 and 24');
    }
  }

  // Validate tasks if present
  if (project.tasks && Array.isArray(project.tasks)) {
    const taskIds = new Set(project.tasks.map((t) => t.taskId));
    for (let i = 0; i < project.tasks.length; i++) {
      const taskValidation = validateTask(project.tasks[i]);
      if (!taskValidation.isValid) {
        errors.push(`tasks[${i}]: ${taskValidation.errors.join(', ')}`);
      }

      // Validate dependencies
      if (project.tasks[i].dependencies) {
        for (const depId of project.tasks[i].dependencies) {
          if (!taskIds.has(depId)) {
            errors.push(`tasks[${i}]: dependency "${depId}" does not exist`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Detect circular dependencies
const detectCircularDependencies = (tasks) => {
  const visited = new Set();
  const recursionStack = new Set();

  const hasCycle = (taskId, graph) => {
    visited.add(taskId);
    recursionStack.add(taskId);

    const neighbors = graph[taskId] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor, graph)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(taskId);
    return false;
  };

  // Build adjacency graph
  const graph = {};
  for (const task of tasks) {
    graph[task.taskId] = task.dependencies || [];
  }

  // Check for cycles
  const cycles = [];
  for (const task of tasks) {
    visited.clear();
    recursionStack.clear();
    if (hasCycle(task.taskId, graph)) {
      cycles.push(task.taskId);
    }
  }

  return {
    hasCycles: cycles.length > 0,
    cycleTaskIds: cycles,
  };
};

// Calculate task criticality
const calculateTaskCriticality = (task, allTasks) => {
  const dependentCount = allTasks.filter((t) =>
    (t.dependencies || []).includes(task.taskId)
  ).length;

  const dependencyCount = (task.dependencies || []).length;
  const criticalityScore = (dependentCount * 2 + dependencyCount) / (allTasks.length || 1);

  let level = 'low';
  if (criticalityScore > 0.5) level = 'medium';
  if (criticalityScore > 0.8) level = 'high';

  return {
    score: criticalityScore,
    level,
    dependentCount,
    dependencyCount,
  };
};

// Estimate task effort range
const estimateEffortRange = (task) => {
  const estimate = task.estimatedHours || 0;
  const pessimisticMultiplier = 1.5;
  const optimisticMultiplier = 0.75;

  return {
    pessimistic: estimate * pessimisticMultiplier,
    mostLikely: estimate,
    optimistic: estimate * optimisticMultiplier,
    expectedValue: (estimate * pessimisticMultiplier + estimate * 4 + estimate * optimisticMultiplier) / 6,
  };
};

// Validate resource availability
const validateResourceAvailability = (project) => {
  const allocation = {};
  const issues = [];

  for (const task of project.tasks || []) {
    if (task.assignee) {
      if (!allocation[task.assignee]) {
        allocation[task.assignee] = { hours: 0, tasks: [] };
      }
      allocation[task.assignee].hours += task.estimatedHours;
      allocation[task.assignee].tasks.push(task.taskId);
    }
  }

  const constraints = project.constraints || {};
  const maxHoursPerPerson = (constraints.hoursPerDay || 8) * 5 * 4; // 4 weeks

  for (const [assignee, data] of Object.entries(allocation)) {
    if (data.hours > maxHoursPerPerson) {
      issues.push({
        assignee,
        allocatedHours: data.hours,
        maxHours: maxHoursPerPerson,
        overload: data.hours - maxHoursPerPerson,
        severity: 'high',
      });
    }
  }

  return {
    allocation,
    issues,
    isValid: issues.length === 0,
  };
};

module.exports = {
  validateTask,
  validatePattern,
  validateProject,
  detectCircularDependencies,
  calculateTaskCriticality,
  estimateEffortRange,
  validateResourceAvailability,
};
