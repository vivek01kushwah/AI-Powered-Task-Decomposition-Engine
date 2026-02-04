const express = require('express');
const router = express.Router();
const patternController = require('../controllers/patternController');

// Get all patterns
router.get('/', patternController.getPatterns);

// Create new pattern
router.post('/', patternController.createPattern);

// Get pattern statistics
router.get('/stats/summary', patternController.getPatternStats);

// Search patterns
router.get('/search', patternController.searchPatterns);

// Get pattern by ID
router.get('/:id', patternController.getPattern);

// Update pattern
router.put('/:id', patternController.updatePattern);

// Delete pattern
router.delete('/:id', patternController.deletePattern);

// Get patterns by category
router.get('/category/:category', patternController.getPatternsByCategory);

// Record pattern usage
router.post('/:patternId/usage', patternController.recordUsage);

module.exports = router;
