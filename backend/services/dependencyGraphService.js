/**
 * Dependency Graph Service
 * 
 * Provides advanced graph algorithms for task dependency analysis:
 * - Circular dependency detection and resolution
 * - Critical path calculation for project scheduling
 * - Parallelization opportunities identification
 * - Implicit dependency inference from common patterns
 * 
 * All algorithms work with task objects containing:
 * {
 *   taskId: string,
 *   title: string,
 *   estimatedHours: number,
 *   dependencies: [taskId1, taskId2, ...],
 *   priority: number (1-10),
 *   category: string
 * }
 */

/**
 * ALGORITHM 1: Detect Circular Dependencies using DFS
 * 
 * Depth-First Search (DFS) with recursion stack to detect cycles.
 * Time Complexity: O(V + E) where V = tasks, E = dependencies
 * Space Complexity: O(V) for visited set and recursion stack
 * 
 * How it works:
 * 1. Maintain 3 node states: unvisited (white), visiting (gray), visited (black)
 * 2. For each unvisited task, do DFS
 * 3. During DFS, if we reach a "gray" node, we found a cycle
 * 4. Backtrack and record the cycle path
 * 
 * @param {Array} tasks - Array of task objects with dependencies
 * @returns {Object} { hasCycles: boolean, cycles: [cycle chains as strings], details: [] }
 */
function detectCircularDependencies(tasks) {
  // Create task map for O(1) lookup
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  
  // States: 'unvisited', 'visiting', 'visited'
  const state = {};
  const cycles = [];
  
  // Initialize all tasks as unvisited
  tasks.forEach(task => {
    state[task.taskId] = 'unvisited';
  });

  /**
   * DFS Helper - explores task and its dependencies
   * 
   * @param {string} taskId - Current task being explored
   * @param {Array} path - Current path from root to this task
   * @param {Map} visited - Track which nodes are in current path
   * @returns {boolean} true if cycle detected from this node
   */
  function dfs(taskId, path, visited) {
    const task = taskMap.get(taskId);
    
    // Task not found - skip
    if (!task) return false;

    // Already fully visited in previous DFS traversal
    if (state[taskId] === 'visited') return false;

    // Cycle detected: we're revisiting a task in current path
    if (state[taskId] === 'visiting') {
      // Find where cycle starts and extract cycle chain
      const cycleStartIdx = path.indexOf(taskId);
      const cycleChain = path.slice(cycleStartIdx).map(id => {
        const t = taskMap.get(id);
        return t ? t.title : id;
      });
      
      // Add task that completes cycle
      cycleChain.push(task.title);
      
      // Format as readable cycle string
      const cycleStr = cycleChain.join(' → ');
      if (!cycles.includes(cycleStr)) {
        cycles.push(cycleStr);
      }
      
      return true;
    }

    // Mark as visiting before exploring dependencies
    state[taskId] = 'visiting';
    path.push(taskId);
    visited.add(taskId);

    // Explore all dependencies
    const hasCycle = task.dependencies.some(depId => 
      dfs(depId, path, visited)
    );

    // Backtrack: remove from current path
    path.pop();
    visited.delete(taskId);
    
    // Mark as visited after exploring all descendants
    state[taskId] = 'visited';

    return hasCycle;
  }

  // Run DFS from each unvisited task
  tasks.forEach(task => {
    if (state[task.taskId] === 'unvisited') {
      dfs(task.taskId, [], new Set());
    }
  });

  return {
    hasCycles: cycles.length > 0,
    cycles: cycles,
    details: cycles.map((cycle, idx) => ({
      cycleId: idx + 1,
      chain: cycle,
      severity: 'critical'
    }))
  };
}

/**
 * ALGORITHM 2: Break Circular Dependencies
 * 
 * Analyzes cycle and removes the weakest link to break it.
 * Strategy: Remove dependency with lowest priority/importance.
 * 
 * Weakest dependency is determined by:
 * 1. Priority of dependent task (lower = weaker)
 * 2. Hours required (lower = easier to skip)
 * 3. Whether it's "required" vs "sequential"
 * 
 * @param {Array} tasks - Original task array with cycle
 * @param {string} cycleStr - Cycle chain like "A → B → C → A"
 * @returns {Object} { success: boolean, tasks: modified tasks, removed: {from, to}, warning: string }
 */
function breakCircularDependency(tasks, cycleStr) {
  // Parse cycle string to get task sequence
  // "Task A → Task B → Task C → Task A"
  const parts = cycleStr.split(' → ');
  const cycleTaskTitles = parts.map(p => p.trim());
  
  // Create task map for lookup
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  const titleToId = new Map(tasks.map(t => [t.title, t.taskId]));

  // Find cycle task IDs
  const cycleTaskIds = cycleTaskTitles
    .filter(title => titleToId.has(title))
    .map(title => titleToId.get(title));

  if (cycleTaskIds.length < 2) {
    return {
      success: false,
      tasks: tasks,
      error: 'Could not parse cycle'
    };
  }

  // Find the weakest dependency in the cycle
  let weakestDep = null;
  let weakestScore = Infinity;
  let fromTaskId = null;
  let toTaskId = null;

  // Check each dependency in cycle
  for (let i = 0; i < cycleTaskIds.length; i++) {
    const currentId = cycleTaskIds[i];
    const nextId = cycleTaskIds[(i + 1) % cycleTaskIds.length];
    
    const currentTask = taskMap.get(currentId);
    if (!currentTask || !currentTask.dependencies.includes(nextId)) {
      continue;
    }

    // Calculate weakness score (lower score = weaker dependency)
    const nextTask = taskMap.get(nextId);
    const nextPriority = nextTask?.priority || 5; // Default priority 5
    const nextHours = nextTask?.estimatedHours || 8; // Default 8 hours
    
    // Score = priority + hours (lower = weaker = easier to break)
    const score = nextPriority + (nextHours / 10);

    if (score < weakestScore) {
      weakestScore = score;
      weakestDep = nextId;
      fromTaskId = currentId;
      toTaskId = nextId;
    }
  }

  if (!weakestDep || !fromTaskId || !toTaskId) {
    return {
      success: false,
      tasks: tasks,
      error: 'Could not identify dependency to break'
    };
  }

  // Create modified task list with dependency removed
  const modifiedTasks = tasks.map(task => {
    if (task.taskId === fromTaskId) {
      return {
        ...task,
        dependencies: task.dependencies.filter(depId => depId !== toTaskId)
      };
    }
    return task;
  });

  const fromTask = taskMap.get(fromTaskId);
  const toTask = taskMap.get(toTaskId);

  return {
    success: true,
    tasks: modifiedTasks,
    removed: {
      from: fromTask?.title || fromTaskId,
      to: toTask?.title || toTaskId
    },
    warning: `Circular dependency broken. Removed: "${fromTask?.title || fromTaskId}" → "${toTask?.title || toTaskId}". Verify this doesn't affect project logic.`,
    details: {
      cycleAnalyzed: cycleStr,
      dependencyRemovedScore: weakestScore,
      affectedTasks: [fromTaskId, toTaskId]
    }
  };
}

/**
 * ALGORITHM 3: Calculate Critical Path
 * 
 * Critical Path Method (CPM) for project scheduling:
 * 1. Topological Sort to establish task ordering
 * 2. Forward Pass: calculate earliest start/finish times
 * 3. Backward Pass: calculate latest start/finish times
 * 4. Critical Path: tasks where Early Start = Late Start
 * 
 * Time Complexity: O(V + E) for topological sort + O(V) for passes
 * 
 * Critical path = longest duration path from start to end
 * Shows which tasks are "critical" (delays affect project end date)
 * 
 * @param {Array} tasks - Task array with dependencies
 * @returns {Object} { criticalPath: [taskIds], duration: hours, tasks: with slack times }
 */
function calculateCriticalPath(tasks) {
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  
  // Step 1: Topological Sort using Kahn's algorithm
  const inDegree = {};
  const adjacencyList = {};
  const durations = {};

  // Initialize
  tasks.forEach(task => {
    inDegree[task.taskId] = 0;
    adjacencyList[task.taskId] = [];
    durations[task.taskId] = task.estimatedHours || 1;
  });

  // Build graph
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      if (adjacencyList[depId]) {
        adjacencyList[depId].push(task.taskId);
        inDegree[task.taskId]++;
      }
    });
  });

  // Kahn's algorithm for topological sort
  const queue = Object.keys(inDegree).filter(taskId => inDegree[taskId] === 0);
  const topologicalOrder = [];
  
  while (queue.length > 0) {
    const taskId = queue.shift();
    topologicalOrder.push(taskId);

    adjacencyList[taskId].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles (DAG requirement)
  if (topologicalOrder.length !== tasks.length) {
    return {
      success: false,
      error: 'Cycle detected in task dependencies. Cannot calculate critical path.',
      criticalPath: []
    };
  }

  // Step 2: Forward Pass - Calculate earliest start and finish times
  const earliestStart = {};
  const earliestFinish = {};

  topologicalOrder.forEach(taskId => {
    const task = taskMap.get(taskId);
    const deps = task.dependencies;

    if (deps.length === 0) {
      // Start task (no dependencies)
      earliestStart[taskId] = 0;
    } else {
      // Maximum finish time of all dependencies
      earliestStart[taskId] = Math.max(
        ...deps.map(depId => earliestFinish[depId] || 0)
      );
    }

    earliestFinish[taskId] = earliestStart[taskId] + durations[taskId];
  });

  // Step 3: Backward Pass - Calculate latest start and finish times
  const latestStart = {};
  const latestFinish = {};
  const projectEndTime = Math.max(...Object.values(earliestFinish));

  // Identify end tasks (tasks with no successors)
  const endTasks = topologicalOrder.filter(taskId => {
    return !tasks.some(t => t.dependencies.includes(taskId) && 
                          !t.dependencies.some(d => taskMap.get(d) === undefined));
  });

  // Initialize end tasks
  topologicalOrder.reverse().forEach(taskId => {
    const task = taskMap.get(taskId);
    const successors = tasks.filter(t => t.dependencies.includes(taskId));

    if (successors.length === 0) {
      // End task
      latestFinish[taskId] = projectEndTime;
    } else {
      // Minimum start time of all successors
      latestFinish[taskId] = Math.min(
        ...successors.map(succ => latestStart[succ.taskId] || projectEndTime)
      );
    }

    latestStart[taskId] = latestFinish[taskId] - durations[taskId];
  });

  // Step 4: Identify Critical Path (slack = 0)
  const criticalTasks = topologicalOrder.filter(taskId => 
    earliestStart[taskId] === latestStart[taskId]
  );

  // Build critical path sequence (longest path)
  const criticalPath = [];
  let currentTaskId = criticalTasks.find(taskId => {
    const task = taskMap.get(taskId);
    return task.dependencies.length === 0;
  });

  while (currentTaskId) {
    criticalPath.push(currentTaskId);
    
    // Find next task in critical path
    const task = taskMap.get(currentTaskId);
    const nextTask = tasks.find(t => 
      t.dependencies.includes(currentTaskId) &&
      criticalTasks.includes(t.taskId) &&
      earliestStart[t.taskId] === earliestFinish[currentTaskId]
    );

    currentTaskId = nextTask?.taskId;
  }

  return {
    success: true,
    criticalPath: criticalPath,
    duration: projectEndTime,
    stats: {
      totalTasks: tasks.length,
      criticalTaskCount: criticalTasks.length,
      criticalPercentage: ((criticalTasks.length / tasks.length) * 100).toFixed(1)
    },
    taskMetrics: Object.fromEntries(
      topologicalOrder.map(taskId => [taskId, {
        earliestStart: earliestStart[taskId],
        earliestFinish: earliestFinish[taskId],
        latestStart: latestStart[taskId],
        latestFinish: latestFinish[taskId],
        slack: latestStart[taskId] - earliestStart[taskId],
        isCritical: earliestStart[taskId] === latestStart[taskId]
      }])
    )
  };
}

/**
 * ALGORITHM 4: Find Parallelizable Tasks
 * 
 * Groups tasks that can run concurrently (no direct dependencies).
 * Uses level-based grouping where each level contains tasks that:
 * - All have same dependencies satisfied before them
 * - Can all start at the same time
 * - Can run with same team members
 * 
 * Respects team size constraints to ensure practical parallelization.
 * 
 * @param {Array} tasks - Task array with dependencies and team constraint
 * @param {number} teamSize - Number of available team members (optional)
 * @returns {Object} { levels: [taskGroups], parallelizationScore, estimate: hours saved }
 */
function findParallelizableTasks(tasks, teamSize = 5) {
  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  
  // Calculate task levels (depth in dependency graph)
  const taskLevel = {};
  const visited = new Set();

  /**
   * BFS to calculate level for each task
   * Level = max level of dependencies + 1
   */
  function calculateLevels(taskId, levelMap = {}) {
    if (taskLevel[taskId] !== undefined) {
      return taskLevel[taskId];
    }

    const task = taskMap.get(taskId);
    if (!task) return 0;

    if (task.dependencies.length === 0) {
      taskLevel[taskId] = 0;
      return 0;
    }

    const depLevels = task.dependencies
      .map(depId => calculateLevels(depId))
      .filter(level => level !== undefined);

    taskLevel[taskId] = (Math.max(...depLevels) || 0) + 1;
    return taskLevel[taskId];
  }

  // Calculate levels for all tasks
  tasks.forEach(task => calculateLevels(task.taskId));

  // Group tasks by level
  const levelGroups = {};
  tasks.forEach(task => {
    const level = taskLevel[task.taskId];
    if (!levelGroups[level]) {
      levelGroups[level] = [];
    }
    levelGroups[level].push(task);
  });

  // Convert to sorted array
  const levels = Object.keys(levelGroups)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(level => levelGroups[level]);

  // Analyze parallelization potential
  const parallelGroups = levels.map((group, levelIdx) => {
    // Check if tasks in group can actually run in parallel
    const canParallelize = group.every(task1 => {
      return group.every(task2 => {
        if (task1.taskId === task2.taskId) return true;
        // No direct dependency between them
        return !task1.dependencies.includes(task2.taskId) &&
               !task2.dependencies.includes(task1.taskId);
      });
    });

    // Check team size constraint
    const teamRequired = Math.min(group.length, teamSize);
    const canExecute = teamRequired <= teamSize;

    // Calculate hours saved if parallelized vs sequential
    const sequentialHours = group.reduce((sum, t) => sum + t.estimatedHours, 0);
    const parallelHours = Math.max(...group.map(t => t.estimatedHours));

    return {
      level: levelIdx,
      tasks: group.map(t => ({
        taskId: t.taskId,
        title: t.title,
        hours: t.estimatedHours,
        priority: t.priority
      })),
      parallelizable: canParallelize,
      executable: canExecute,
      teamRequired: teamRequired,
      taskCount: group.length,
      sequentialHours: sequentialHours,
      parallelHours: parallelHours,
      hoursSaved: Math.max(0, sequentialHours - parallelHours)
    };
  });

  // Calculate overall parallelization score
  const totalSequentialHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const estimatedParallelHours = parallelGroups
    .reduce((sum, group) => sum + group.parallelHours, 0);
  const totalHoursSaved = totalSequentialHours - estimatedParallelHours;
  const parallelizationScore = Math.round((totalHoursSaved / totalSequentialHours) * 100);

  return {
    levels: parallelGroups,
    parallelizationScore: parallelizationScore,
    estimate: {
      sequentialHours: totalSequentialHours,
      parallelHours: estimatedParallelHours,
      hoursSaved: totalHoursSaved,
      timeReduction: `${parallelizationScore}%`
    },
    summary: {
      totalLevels: parallelGroups.length,
      fullyParallel: parallelGroups.filter(g => g.parallelizable && g.executable).length,
      requiresTeamExpansion: parallelGroups.filter(g => !g.executable).length
    }
  };
}

/**
 * ALGORITHM 5: Add Implicit Dependencies
 * 
 * Pattern-based dependency inference using common domain patterns.
 * Detects missing dependencies based on task categories and keywords.
 * 
 * Example patterns:
 * - "Payment" tasks must come after "Authentication" tasks
 * - "Deployment" must come after "Testing"
 * - "API" must come after "Database Design"
 * - "Frontend" must come after "API Specification"
 * 
 * @param {Array} tasks - Task array potentially with missing dependencies
 * @returns {Object} { tasks: updated tasks, added: [{from, to, reason}], warnings: [] }
 */
function addImplicitDependencies(tasks) {
  // Define dependency patterns (if category A exists, it needs B first)
  const dependencyPatterns = [
    // Category patterns
    {
      type: 'category',
      dependent: ['payment', 'billing', 'transactions'],
      prerequisite: ['authentication', 'auth', 'security'],
      reason: 'Payment requires authentication'
    },
    {
      type: 'category',
      dependent: ['deployment', 'release', 'production'],
      prerequisite: ['testing', 'qa', 'validation'],
      reason: 'Deployment requires testing'
    },
    {
      type: 'category',
      dependent: ['frontend', 'ui', 'client'],
      prerequisite: ['api', 'backend', 'server'],
      reason: 'Frontend requires API specification'
    },
    {
      type: 'category',
      dependent: ['api', 'backend', 'server'],
      prerequisite: ['database', 'db', 'persistence'],
      reason: 'API requires database design'
    },
    {
      type: 'category',
      dependent: ['integration', 'integration-testing'],
      prerequisite: ['api', 'backend', 'frontend'],
      reason: 'Integration requires API and Frontend'
    },
    {
      type: 'category',
      dependent: ['documentation', 'docs'],
      prerequisite: ['api', 'implementation'],
      reason: 'Documentation needs implementation'
    },
    // Keyword patterns
    {
      type: 'keyword',
      dependent: ['payment', 'checkout', 'stripe', 'paypal'],
      prerequisite: ['login', 'auth', 'signin'],
      reason: 'Payment flows need authentication first'
    },
    {
      type: 'keyword',
      dependent: ['profile', 'account', 'user-settings'],
      prerequisite: ['registration', 'signup', 'auth'],
      reason: 'User profiles need registration'
    }
  ];

  const taskMap = new Map(tasks.map(t => [t.taskId, t]));
  const added = [];
  const warnings = [];

  // Helper to check if task matches pattern
  function matchesPattern(task, patterns) {
    const taskTitle = task.title.toLowerCase();
    const taskCategory = (task.category || '').toLowerCase();

    return patterns.some(pattern => 
      taskTitle.includes(pattern) || taskCategory.includes(pattern)
    );
  }

  // Check each dependency pattern
  dependencyPatterns.forEach(pattern => {
    const dependentTasks = tasks.filter(task => 
      matchesPattern(task, pattern.dependent)
    );

    const prerequisiteTasks = tasks.filter(task => 
      matchesPattern(task, pattern.prerequisite)
    );

    // For each dependent task, add dependencies to prerequisite tasks
    dependentTasks.forEach(depTask => {
      prerequisiteTasks.forEach(preTask => {
        // Check if dependency already exists
        const hasExisting = depTask.dependencies.includes(preTask.taskId);
        
        if (!hasExisting && depTask.taskId !== preTask.taskId) {
          added.push({
            from: preTask.title,
            to: depTask.title,
            reason: pattern.reason,
            pattern: pattern.type,
            priority: 'high'
          });
        }
      });
    });
  });

  // Apply changes to task list
  let modifiedTasks = tasks.map(task => {
    const newDeps = task.dependencies || [];
    
    added.forEach(dep => {
      const fromTask = tasks.find(t => t.title === dep.from);
      if (fromTask && task.title === dep.to && !newDeps.includes(fromTask.taskId)) {
        newDeps.push(fromTask.taskId);
      }
    });

    return {
      ...task,
      dependencies: newDeps
    };
  });

  // Detect any warnings
  if (added.length > 0) {
    warnings.push({
      type: 'info',
      message: `Added ${added.length} implicit dependencies based on pattern analysis`,
      severity: 'medium'
    });
  }

  // Check for conflicts
  const circularCheck = detectCircularDependencies(modifiedTasks);
  if (circularCheck.hasCycles) {
    warnings.push({
      type: 'error',
      message: 'Implicit dependencies created circular dependencies',
      cycles: circularCheck.cycles,
      severity: 'critical'
    });
    
    // If cycles created, don't apply changes
    return {
      tasks: tasks,
      added: [],
      warnings: warnings,
      error: 'Could not add implicit dependencies due to circular conflict'
    };
  }

  return {
    tasks: modifiedTasks,
    added: added,
    warnings: warnings,
    stats: {
      dependenciesAdded: added.length,
      patternMatches: dependencyPatterns.filter(p => 
        added.some(a => a.pattern === p.type)
      ).length
    }
  };
}

/**
 * Export all functions
 */
module.exports = {
  detectCircularDependencies,
  breakCircularDependency,
  calculateCriticalPath,
  findParallelizableTasks,
  addImplicitDependencies
};
