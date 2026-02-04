/**
 * Project Controller
 * Handles all project-related operations including decomposition,
 * conflict detection, and feasibility analysis
 */

const Project = require('../models/Project');
const DecompositionPattern = require('../models/DecompositionPattern');
const decompositionService = require('../services/decompositionService');
const logger = require('../utils/logger');

// Create a new project with task decomposition
exports.createProject = async (req, res, next) => {
  try {
    const {
      projectName,
      description,
      decompositionMethod,
      constraints,
      createdBy,
    } = req.body;

    if (!projectName || !description || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'projectName, description, and createdBy are required',
      });
    }

    const project = new Project({
      projectName,
      description,
      originalDescription: description,
      decompositionMethod: decompositionMethod || 'hierarchical',
      constraints: constraints || {},
      createdBy,
      status: 'draft',
    });

    await project.save();

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    next(error);
  }
};

// Get all projects with filters
exports.getProjects = async (req, res, next) => {
  try {
    const { status, createdBy, decompositionMethod } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    if (decompositionMethod) filter.decompositionMethod = decompositionMethod;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .select('-tasks'); // Exclude tasks array for list view

    res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    next(error);
  }
};

// Get project by ID with full details
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    next(error);
  }
};

// Decompose a project description into tasks
exports.decomposeProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { decompositionMethod } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project.status = 'analyzing';
    await project.save();

    // Perform decomposition
    const decomposedTask = {
      title: project.projectName,
      description: project.description,
    };

    const decompositionResult = await decompositionService.decomposeTask(
      decomposedTask,
      decompositionMethod || project.decompositionMethod
    );

    // Add tasks to project
    project.tasks = decompositionResult.subtasks.map((task, idx) => ({
      ...task,
      taskId: `task_${idx + 1}`,
    }));

    // Analyze conflicts
    const conflicts = analyzeConflicts(project.tasks, project.constraints);
    project.conflicts = conflicts;

    // Calculate feasibility
    const feasibility = calculateFeasibility(project);
    project.feasibilityScore = feasibility.score;
    project.riskAssessment = feasibility.riskAssessment;
    project.warnings = feasibility.warnings;

    project.status = 'analyzed';
    await project.save();

    res.json({
      success: true,
      data: project,
      message: 'Project decomposed successfully',
    });
  } catch (error) {
    logger.error('Error decomposing project:', error);
    next(error);
  }
};

// Add a task to project
exports.addTaskToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const taskData = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const newTask = project.addTask(taskData);
    await project.save();

    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task added to project',
    });
  } catch (error) {
    logger.error('Error adding task:', error);
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.body.lastModifiedBy || 'unknown' },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    next(error);
  }
};

// Get resource allocation for project
exports.getResourceAllocation = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const allocation = project.getResourceAllocation();

    res.json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    logger.error('Error calculating allocation:', error);
    next(error);
  }
};

// Get critical path for project
exports.getCriticalPath = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const criticalPath = project.calculateCriticalPath();
    const pathTasks = criticalPath.map((taskId) => project.getTaskById(taskId));

    const totalHours = pathTasks.reduce((sum, task) => sum + (task?.estimatedHours || 0), 0);

    res.json({
      success: true,
      data: {
        criticalPath,
        tasks: pathTasks,
        totalEstimatedHours: totalHours,
      },
    });
  } catch (error) {
    logger.error('Error calculating critical path:', error);
    next(error);
  }
};

// Helper: Analyze conflicts between tasks
function analyzeConflicts(tasks, constraints) {
  const conflicts = [];
  const tasksByAssignee = {};

  // Group tasks by assignee
  for (const task of tasks) {
    if (task.assignee) {
      if (!tasksByAssignee[task.assignee]) {
        tasksByAssignee[task.assignee] = [];
      }
      tasksByAssignee[task.assignee].push(task);
    }
  }

  // Check resource conflicts (too many concurrent tasks)
  for (const [assignee, assignedTasks] of Object.entries(tasksByAssignee)) {
    const totalHours = assignedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const maxAvailableHours = (constraints.hoursPerDay || 8) * 5; // 1 week

    if (totalHours > maxAvailableHours * 2) {
      // More than 2 weeks of work
      conflicts.push({
        taskId1: assignedTasks[0].taskId,
        taskId2: assignedTasks[1]?.taskId,
        conflictType: 'resource',
        description: `Assignee "${assignee}" has too many tasks (${totalHours} hours)`,
        severity: 'high',
      });
    }
  }

  // Check skill requirement conflicts
  const skillCounts = {};
  for (const task of tasks) {
    for (const skill of task.skillsRequired || []) {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  }

  for (const [skill, count] of Object.entries(skillCounts)) {
    if (count > (constraints.skillRequirements?.[skill] || 1) * 2) {
      conflicts.push({
        taskId1: tasks.find((t) => t.skillsRequired?.includes(skill))?.taskId,
        taskId2: tasks.find((t) => t.skillsRequired?.includes(skill) && t !== tasks[0])?.taskId,
        conflictType: 'skill',
        description: `Too many tasks require skill "${skill}" (${count} tasks)`,
        severity: 'medium',
      });
    }
  }

  return conflicts;
}

// Helper: Calculate project feasibility
function calculateFeasibility(project) {
  let score = 100;
  const riskFactors = [];
  const warnings = [];

  // Check task count
  if (project.taskCount > (project.constraints.maxTasks || 100)) {
    score -= 15;
    riskFactors.push('Too many tasks for scope');
    warnings.push({
      type: 'feasibility',
      severity: 'warning',
      message: `Project has ${project.taskCount} tasks, exceeds limit of ${project.constraints.maxTasks}`,
    });
  }

  // Check estimated hours vs constraints
  const hoursPerDay = project.constraints.hoursPerDay || 8;
  const teamSize = project.constraints.teamSize || 1;
  const daysAvailable = project.constraints.deadline
    ? Math.ceil((project.constraints.deadline - new Date()) / (1000 * 60 * 60 * 24))
    : 30;

  const totalCapacity = hoursPerDay * teamSize * daysAvailable;
  if (project.totalEstimatedHours > totalCapacity) {
    score -= 20;
    riskFactors.push('Not enough capacity');
    warnings.push({
      type: 'schedule',
      severity: 'warning',
      message: `Total estimated hours (${project.totalEstimatedHours}) exceeds team capacity (${totalCapacity})`,
    });
  }

  // Check for ambiguities
  const ambiguityCount = project.tasks.filter((t) => t.ambiguityFlags?.length > 0).length;
  if (ambiguityCount > project.taskCount * 0.3) {
    score -= 10;
    riskFactors.push('Too many ambiguities');
  }

  // Check conflicts
  if (project.conflictCount > 0) {
    score -= Math.min(project.conflictCount * 5, 15);
    riskFactors.push(`${project.conflictCount} conflicts identified`);
  }

  // Determine risk level
  let overallRiskLevel = 'low';
  if (score < 70) overallRiskLevel = 'high';
  else if (score < 85) overallRiskLevel = 'medium';

  return {
    score: Math.max(0, score),
    riskAssessment: {
      overallRiskLevel,
      riskScore: 100 - Math.max(0, score),
      identifiedRisks: riskFactors,
    },
    warnings,
  };
}

module.exports = exports;
