const express = require('express');
const router = express.Router();
const decompositionController = require('../controllers/decompositionController');

// Decompose a task
router.post('/decompose', decompositionController.decomposeTask);

// Get decomposition by ID
router.get('/:id', decompositionController.getDecomposition);

// Get all decompositions for a task
router.get('/task/:taskId', decompositionController.getTaskDecompositions);

// Update decomposition
router.put('/:id', decompositionController.updateDecomposition);

// Delete decomposition
router.delete('/:id', decompositionController.deleteDecomposition);

module.exports = router;
