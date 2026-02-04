const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Get all projects
router.get('/', projectController.getProjects);

// Create new project
router.post('/', projectController.createProject);

// Get project by ID
router.get('/:id', projectController.getProject);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Decompose project
router.post('/:id/decompose', projectController.decomposeProject);

// Add task to project
router.post('/:id/tasks', projectController.addTaskToProject);

// Get resource allocation
router.get('/:id/resources', projectController.getResourceAllocation);

// Get critical path
router.get('/:id/critical-path', projectController.getCriticalPath);

module.exports = router;
