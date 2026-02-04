const Decomposition = require('../models/Decomposition');
const Task = require('../models/Task');
const decompositionService = require('../services/decompositionService');
const logger = require('../utils/logger');

// Decompose task
exports.decomposeTask = async (req, res, next) => {
  try {
    const { taskId, method } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const decomposition = await decompositionService.decomposeTask(task, method);

    const savedDecomposition = new Decomposition({
      taskId,
      originalTask: task.title,
      subtasks: decomposition.subtasks,
      decompositionMethod: method || 'hierarchical',
      complexity: decomposition.complexity,
      estimatedTotalHours: decomposition.estimatedTotalHours,
    });

    await savedDecomposition.save();

    res.status(201).json({
      success: true,
      data: savedDecomposition,
    });
  } catch (error) {
    logger.error('Error decomposing task:', error);
    next(error);
  }
};

// Get decomposition by ID
exports.getDecomposition = async (req, res, next) => {
  try {
    const decomposition = await Decomposition.findById(req.params.id).populate('taskId');

    if (!decomposition) {
      return res.status(404).json({
        success: false,
        message: 'Decomposition not found',
      });
    }

    res.json({
      success: true,
      data: decomposition,
    });
  } catch (error) {
    logger.error('Error fetching decomposition:', error);
    next(error);
  }
};

// Get all decompositions for a task
exports.getTaskDecompositions = async (req, res, next) => {
  try {
    const decompositions = await Decomposition.find({
      taskId: req.params.taskId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: decompositions,
    });
  } catch (error) {
    logger.error('Error fetching decompositions:', error);
    next(error);
  }
};

// Update decomposition
exports.updateDecomposition = async (req, res, next) => {
  try {
    const decomposition = await Decomposition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!decomposition) {
      return res.status(404).json({
        success: false,
        message: 'Decomposition not found',
      });
    }

    res.json({
      success: true,
      data: decomposition,
    });
  } catch (error) {
    logger.error('Error updating decomposition:', error);
    next(error);
  }
};

// Delete decomposition
exports.deleteDecomposition = async (req, res, next) => {
  try {
    const decomposition = await Decomposition.findByIdAndDelete(req.params.id);

    if (!decomposition) {
      return res.status(404).json({
        success: false,
        message: 'Decomposition not found',
      });
    }

    res.json({
      success: true,
      message: 'Decomposition deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting decomposition:', error);
    next(error);
  }
};
