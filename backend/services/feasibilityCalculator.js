/**
 * Feasibility Calculator Service
 * 
 * Evaluates project feasibility based on:
 * - Available team capacity vs estimated effort
 * - Critical path constraints
 * - Task parallelization potential
 * - Team skill requirements
 * - Scope constraints
 * 
 * Produces feasibility score (0-1) and detailed warnings for risk mitigation
 */

/**
 * ALGORITHM: Feasibility Score Calculation
 * 
 * Process:
 * 1. Calculate total estimated hours from all tasks
 * 2. Identify critical path and sum critical path hours
 * 3. Calculate available hours: teamSize × hoursPerDay × daysUntilDeadline
 * 4. Calculate parallel efficiency: min(teamSize, maxParallelTasks) / teamSize
 * 5. Compute raw feasibility score
 * 6. Adjust score based on risk factors
 * 7. Map to feasibility range (0-1)
 * 8. Generate contextual warnings
 * 
 * Score Interpretation:
 * score > 1.3: Comfortable (feasibility 0.9-1.0) - Extra buffer
 * score 1.0-1.3: Tight but doable (feasibility 0.6-0.9) - Manageable risk
 * score 0.7-1.0: Aggressive (feasibility 0.4-0.6) - High risk
 * score < 0.7: Unrealistic (feasibility 0.0-0.4) - Project failure risk
 * 
 * @param {Array} tasks - Array of task objects with estimatedHours, priority, complexity
 * @param {Object} constraints - { teamSize, hoursPerDay, deadline, maxTasks, skillRequirements }
 * @returns {Object} Feasibility analysis with score, warnings, breakdown
 */
function calculateFeasibility(tasks, constraints = {}) {
  // Validate inputs
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {
      success: false,
      error: 'Tasks array must be non-empty',
      feasibilityScore: 0
    };
  }

  // Extract and validate constraints with defaults
  const {
    teamSize = 5,
    hoursPerDay = 8,
    deadline = null,
    maxTasks = 100,
    skillRequirements = {}
  } = constraints;

  // Validate constraint values
  if (teamSize <= 0 || hoursPerDay <= 0 || hoursPerDay > 24) {
    return {
      success: false,
      error: 'Invalid constraints: teamSize > 0, 0 < hoursPerDay <= 24',
      feasibilityScore: 0
    };
  }

  // ===== STEP 1: Calculate Task Metrics =====
  const taskMetrics = calculateTaskMetrics(tasks);
  const {
    totalEstimatedHours,
    criticalPathHours,
    maxParallelTasks,
    tasksByComplexity,
    tasksByCategory
  } = taskMetrics;

  // ===== STEP 2: Calculate Available Capacity =====
  let daysUntilDeadline = 30; // Default to 30 days
  if (deadline && typeof deadline === 'string') {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    daysUntilDeadline = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));
  } else if (typeof deadline === 'number') {
    daysUntilDeadline = Math.max(1, deadline);
  }

  const availableHours = teamSize * hoursPerDay * daysUntilDeadline;

  // ===== STEP 3: Calculate Parallel Efficiency =====
  // Efficiency increases with parallelizable tasks, up to team size
  const parallelEfficiency = Math.min(maxParallelTasks, teamSize) / teamSize;

  // ===== STEP 4: Calculate Raw Feasibility Score =====
  // Core formula: (Available Capacity × Parallel Efficiency) / Critical Path
  // This normalizes to: how many times over can we complete critical path
  const rawScore = criticalPathHours > 0
    ? (availableHours * parallelEfficiency) / criticalPathHours
    : availableHours > 0 ? 2.0 : 1.0;

  // ===== STEP 5: Apply Risk Adjustment Factors =====
  let adjustedScore = rawScore;

  // Factor 1: Complexity Risk (more complex tasks = harder to parallelize)
  const complexityRiskFactor = calculateComplexityRisk(tasksByComplexity);
  adjustedScore *= (1 - complexityRiskFactor * 0.1);

  // Factor 2: Scope Creep Risk (many tasks = higher uncertainty)
  const scopeRiskFactor = Math.min(tasks.length / maxTasks, 1.0);
  adjustedScore *= (1 - scopeRiskFactor * 0.05);

  // Factor 3: Team Availability Risk (small teams less flexible)
  const teamRiskFactor = teamSize < 3 ? 0.9 : teamSize < 5 ? 0.95 : 1.0;
  adjustedScore *= teamRiskFactor;

  // ===== STEP 6: Map Score to Feasibility Range =====
  let feasibilityScore;
  let feasibilityLevel;
  let recommendation;

  if (adjustedScore > 1.3) {
    // Comfortable: plenty of buffer
    feasibilityScore = Math.min(adjustedScore * 0.33, 1.0);
    feasibilityLevel = 'comfortable';
    recommendation = 'Project is well-scoped. Proceed with confidence.';
  } else if (adjustedScore >= 1.0) {
    // Tight but doable: manageable with good planning
    feasibilityScore = 0.6 + (adjustedScore - 1.0) * 0.3;
    feasibilityLevel = 'tight-but-doable';
    recommendation = 'Project is feasible but requires careful planning and execution.';
  } else if (adjustedScore >= 0.7) {
    // Aggressive: requires tight execution, risks present
    feasibilityScore = 0.4 + (adjustedScore - 0.7) * 0.4;
    feasibilityLevel = 'aggressive';
    recommendation = 'Project is ambitious. Risks require active mitigation.';
  } else {
    // Unrealistic: high probability of failure
    feasibilityScore = Math.max(adjustedScore * 0.57, 0);
    feasibilityLevel = 'unrealistic';
    recommendation = 'Project is infeasible as currently scoped. Significant changes needed.';
  }

  // ===== STEP 7: Generate Warnings =====
  const warnings = generateWarnings({
    tasks,
    feasibilityLevel,
    adjustedScore,
    totalEstimatedHours,
    criticalPathHours,
    availableHours,
    maxParallelTasks,
    teamSize,
    maxTasks,
    tasksByComplexity
  });

  // ===== STEP 8: Generate Breakdown =====
  const breakdown = {
    totalEstimatedHours: Math.round(totalEstimatedHours * 10) / 10,
    criticalPathHours: Math.round(criticalPathHours * 10) / 10,
    availableHours: Math.round(availableHours * 10) / 10,
    teamCapacity: {
      teamSize: teamSize,
      hoursPerDay: hoursPerDay,
      daysAvailable: daysUntilDeadline,
      totalCapacity: availableHours
    },
    parallelization: {
      maxParallelTasks: maxParallelTasks,
      parallelEfficiency: (parallelEfficiency * 100).toFixed(1) + '%',
      teamUtilization: (Math.min(maxParallelTasks, teamSize) / teamSize * 100).toFixed(1) + '%'
    },
    taskDistribution: tasksByComplexity,
    categories: tasksByCategory,
    bufferHours: Math.max(0, Math.round((availableHours - totalEstimatedHours) * 10) / 10)
  };

  // ===== STEP 9: Calculate Risk Metrics =====
  const riskMetrics = {
    complexityRisk: (complexityRiskFactor * 100).toFixed(1) + '%',
    scopeRisk: (scopeRiskFactor * 100).toFixed(1) + '%',
    teamRisk: ((1 - teamRiskFactor) * 100).toFixed(1) + '%',
    overallRiskLevel: feasibilityScore > 0.75 ? 'low' : 
                      feasibilityScore > 0.5 ? 'medium' : 
                      feasibilityScore > 0.25 ? 'high' : 'critical'
  };

  return {
    success: true,
    feasibilityScore: isNaN(feasibilityScore) ? 0.5 : Math.round(feasibilityScore * 1000) / 1000,
    feasibilityLevel: feasibilityLevel,
    recommendation: recommendation,
    warnings: warnings,
    breakdown: breakdown,
    riskMetrics: riskMetrics,
    metrics: {
      rawScore: Math.round(rawScore * 100) / 100,
      adjustedScore: Math.round(adjustedScore * 100) / 100,
      riskAdjustments: {
        complexity: complexityRiskFactor.toFixed(3),
        scope: scopeRiskFactor.toFixed(3),
        team: ((1 - teamRiskFactor) * 100).toFixed(1) + '%'
      }
    }
  };
}

/**
 * Calculate task metrics including critical path
 * 
 * @private
 * @param {Array} tasks - Task array
 * @returns {Object} Metrics: totalHours, criticalPathHours, maxParallel, distributions
 */
function calculateTaskMetrics(tasks) {
  let totalEstimatedHours = 0;
  let criticalPathHours = 0;
  let maxParallelTasks = 0;
  const tasksByComplexity = { simple: 0, moderate: 0, complex: 0 };
  const tasksByCategory = {};

  // Calculate total hours and count by complexity
  tasks.forEach(task => {
    totalEstimatedHours += (task.estimatedHours || 0);

    const complexity = task.complexity || 'moderate';
    tasksByComplexity[complexity] = (tasksByComplexity[complexity] || 0) + 1;

    const category = task.category || 'other';
    tasksByCategory[category] = (tasksByCategory[category] || 0) + 1;
  });

  // Calculate critical path (longest dependency chain)
  // Tasks with level = 0 (no dependencies) can be done in parallel
  const taskLevels = {};
  const calculateLevel = (taskId, visited = new Set()) => {
    if (taskLevels[taskId] !== undefined) {
      return taskLevels[taskId];
    }

    if (visited.has(taskId)) {
      return 0; // Prevent infinite recursion
    }

    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return 0;

    visited.add(taskId);

    if (!task.dependencies || task.dependencies.length === 0) {
      taskLevels[taskId] = task.estimatedHours || 0;
      return taskLevels[taskId];
    }

    const depHours = task.dependencies
      .map(depId => calculateLevel(depId, new Set(visited)))
      .reduce((sum, hours) => sum + hours, 0);

    taskLevels[taskId] = depHours + (task.estimatedHours || 0);
    return taskLevels[taskId];
  };

  // Find critical path (longest duration path)
  const taskDurations = tasks.map(task => ({
    taskId: task.taskId,
    duration: calculateLevel(task.taskId)
  }));

  criticalPathHours = Math.max(
    ...taskDurations.map(t => t.duration),
    totalEstimatedHours / tasks.length // At minimum, critical path is average task time
  );

  // Calculate max parallel tasks (tasks at same level with no dependencies)
  const levelGroups = {};
  tasks.forEach(task => {
    const level = task.level || 0;
    levelGroups[level] = (levelGroups[level] || 0) + 1;
  });

  maxParallelTasks = Math.max(...Object.values(levelGroups), 1);

  return {
    totalEstimatedHours,
    criticalPathHours,
    maxParallelTasks,
    tasksByComplexity,
    tasksByCategory
  };
}

/**
 * Calculate complexity-based risk factor
 * More complex tasks are harder to parallelize and more prone to overruns
 * 
 * @private
 * @param {Object} distribution - { simple, moderate, complex } counts
 * @returns {number} Risk factor (0-1)
 */
function calculateComplexityRisk(distribution) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) return 0;

  // Complex tasks weighted higher in risk calculation
  const complexPercentage = (distribution.complex || 0) / total;
  const moderatePercentage = (distribution.moderate || 0) / total;
  
  // Risk increases with complexity
  // 100% complex = 0.4 risk factor
  // 100% simple = 0.0 risk factor
  return complexPercentage * 0.4 + moderatePercentage * 0.1;
}

/**
 * Generate contextual warnings based on feasibility analysis
 * 
 * @private
 * @param {Object} params - Analysis parameters
 * @returns {Array} Array of warning objects
 */
function generateWarnings(params) {
  const {
    tasks,
    feasibilityLevel,
    adjustedScore,
    totalEstimatedHours,
    criticalPathHours,
    availableHours,
    maxParallelTasks,
    teamSize,
    maxTasks,
    tasksByComplexity
  } = params;

  const warnings = [];

  // WARNING 1: Timeline Feasibility
  if (adjustedScore < 1.0) {
    warnings.push({
      type: 'timeline',
      severity: adjustedScore < 0.7 ? 'critical' : adjustedScore < 0.85 ? 'high' : 'medium',
      title: 'Timeline Concern',
      description: `Timeline is ${adjustedScore >= 0.7 ? 'aggressive' : 'unrealistic'} for current scope`,
      impact: `Need ${Math.round((totalEstimatedHours - availableHours) / 10) * 10} more hours or ${Math.ceil((totalEstimatedHours - availableHours) / (teamSize * 8))} more days`,
      suggestion: adjustedScore < 0.7 
        ? 'Consider reducing scope, extending deadline, or increasing team size'
        : 'Plan carefully; identify and eliminate non-critical tasks'
    });
  }

  // WARNING 2: Team Size vs Parallelizable Tasks
  if (maxParallelTasks > teamSize) {
    const excessTasks = maxParallelTasks - teamSize;
    warnings.push({
      type: 'team-capacity',
      severity: excessTasks > 5 ? 'high' : 'medium',
      title: 'Team Size Constraint',
      description: `${maxParallelTasks} tasks can run in parallel, but only ${teamSize} team members available`,
      impact: `${excessTasks} parallel tasks cannot run simultaneously`,
      suggestion: `Either increase team size to ${maxParallelTasks} or serialize ${excessTasks} tasks`
    });
  }

  // WARNING 3: Scope Overflow
  if (tasks.length > maxTasks) {
    warnings.push({
      type: 'scope-overflow',
      severity: 'high',
      title: 'Scope Exceeds Constraints',
      description: `${tasks.length} tasks exceed maximum of ${maxTasks}`,
      impact: `Project ${Math.round((tasks.length / maxTasks - 1) * 100)}% over scope limit`,
      suggestion: `Remove ${tasks.length - maxTasks} tasks or renegotiate maxTasks constraint`
    });
  }

  // WARNING 4: Quality Risk (Low Hours per Task)
  const avgHoursPerTask = totalEstimatedHours / tasks.length;
  if (avgHoursPerTask < 3) {
    warnings.push({
      type: 'quality-risk',
      severity: 'high',
      title: 'Rushing Risk',
      description: `Average ${avgHoursPerTask.toFixed(1)} hours per task is too low`,
      impact: 'Tasks may lack proper design, testing, or documentation',
      suggestion: 'Consolidate tasks, increase estimates, or extend timeline to allow proper execution'
    });
  }

  // WARNING 5: High Complexity
  const complexPercentage = (tasksByComplexity.complex || 0) / tasks.length;
  if (complexPercentage > 0.3) {
    warnings.push({
      type: 'complexity-risk',
      severity: 'medium',
      title: 'High Project Complexity',
      description: `${(complexPercentage * 100).toFixed(0)}% of tasks are complex`,
      impact: 'Greater likelihood of technical challenges, overruns, and integration issues',
      suggestion: 'Plan additional time for complex tasks; consider spike investigations early'
    });
  }

  // WARNING 6: Small Team Risk
  if (teamSize < 3) {
    warnings.push({
      type: 'team-risk',
      severity: 'high',
      title: 'Understaffed Team',
      description: `Team size of ${teamSize} is very small`,
      impact: 'No redundancy; illness or departure creates critical bottleneck; limited parallel work',
      suggestion: 'Add team members or reduce scope significantly'
    });
  } else if (teamSize < 5) {
    warnings.push({
      type: 'team-risk',
      severity: 'medium',
      title: 'Limited Team Flexibility',
      description: `Team size of ${teamSize} provides limited flexibility`,
      impact: 'Reduced ability to handle unexpected issues or skill gaps',
      suggestion: 'Plan buffers; identify cross-training opportunities'
    });
  }

  // WARNING 7: No Buffer Time
  if (availableHours < totalEstimatedHours * 1.1) {
    const bufferPercentage = ((availableHours / totalEstimatedHours - 1) * 100).toFixed(0);
    warnings.push({
      type: 'buffer-risk',
      severity: bufferPercentage < -10 ? 'critical' : 'medium',
      title: 'Insufficient Buffer',
      description: `Only ${Math.max(0, bufferPercentage)}% buffer time available`,
      impact: 'No room for unexpected issues, rework, or learning curve',
      suggestion: 'Add ${Math.round(totalEstimatedHours * 0.15)}-${Math.round(totalEstimatedHours * 0.25)} hours buffer; reduce scope or extend timeline'
    });
  }

  // WARNING 8: Critical Path Too Long
  if (criticalPathHours > availableHours / teamSize) {
    warnings.push({
      type: 'critical-path',
      severity: 'medium',
      title: 'Long Critical Path',
      description: `Critical path (${criticalPathHours.toFixed(1)} hours) limits parallelization`,
      impact: 'Team cannot be fully utilized even with perfect task distribution',
      suggestion: 'Look for dependencies that can be broken; parallel some sequential tasks'
    });
  }

  // Sort warnings by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return warnings;
}

/**
 * Generate detailed feasibility report with recommendations
 * 
 * @param {Array} tasks - Task array
 * @param {Object} constraints - Constraints object
 * @returns {Object} Comprehensive feasibility report
 */
function generateReport(tasks, constraints = {}) {
  const analysis = calculateFeasibility(tasks, constraints);

  if (!analysis.success) {
    return analysis;
  }

  const actionItems = generateActionItems(analysis, tasks);

  return {
    ...analysis,
    actionItems: actionItems,
    summary: generateSummary(analysis, tasks)
  };
}

/**
 * Generate action items based on feasibility analysis
 * 
 * @private
 * @param {Object} analysis - Feasibility analysis result
 * @param {Array} tasks - Task array
 * @returns {Array} Prioritized action items
 */
function generateActionItems(analysis, tasks) {
  const actions = [];

  if (analysis.feasibilityScore < 0.4) {
    actions.push({
      priority: 'critical',
      action: 'Renegotiate Project Scope',
      details: 'Remove non-essential features; focus on MVP only',
      estimatedImpact: 'Could improve feasibility by 20-40%'
    });

    actions.push({
      priority: 'critical',
      action: 'Request Additional Time',
      details: `Extend deadline by ${Math.ceil((analysis.breakdown.totalEstimatedHours - analysis.breakdown.availableHours) / 40)} weeks`,
      estimatedImpact: 'Could improve feasibility to 70%+'
    });
  }

  if (analysis.feasibilityScore < 0.6 && analysis.breakdown.teamCapacity.teamSize < 8) {
    actions.push({
      priority: 'high',
      action: 'Expand Team',
      details: `Add 2-3 developers to reach optimal team size`,
      estimatedImpact: 'Could improve feasibility by 15-25%'
    });
  }

  if (analysis.warnings.some(w => w.type === 'quality-risk')) {
    actions.push({
      priority: 'high',
      action: 'Consolidate Tasks',
      details: 'Merge small tasks to ensure each gets sufficient time',
      estimatedImpact: 'Improves quality and reduces overhead'
    });
  }

  if (analysis.warnings.some(w => w.type === 'critical-path')) {
    actions.push({
      priority: 'medium',
      action: 'Review Dependencies',
      details: 'Identify and parallelize sequential tasks',
      estimatedImpact: 'Could reduce critical path by 10-20%'
    });
  }

  return actions;
}

/**
 * Generate human-readable summary
 * 
 * @private
 * @param {Object} analysis - Analysis result
 * @param {Array} tasks - Task array
 * @returns {string} Summary text
 */
function generateSummary(analysis, tasks) {
  const score = analysis.feasibilityScore;
  const level = analysis.feasibilityLevel;

  let summary = `Project Feasibility: ${(score * 100).toFixed(0)}% (${level})\n\n`;
  summary += analysis.recommendation + '\n\n';
  summary += `Key Metrics:\n`;
  summary += `- Total Effort: ${analysis.breakdown.totalEstimatedHours} hours\n`;
  summary += `- Critical Path: ${analysis.breakdown.criticalPathHours} hours\n`;
  summary += `- Team Capacity: ${analysis.breakdown.availableHours} hours\n`;
  summary += `- Buffer: ${analysis.breakdown.bufferHours} hours\n`;
  summary += `- Tasks: ${tasks.length}\n`;
  summary += `- Risks: ${analysis.warnings.length}`;

  return summary;
}

/**
 * Export all functions
 */
module.exports = {
  calculateFeasibility,
  generateReport,
  calculateTaskMetrics,
  calculateComplexityRisk,
  generateWarnings,
  generateActionItems
};
