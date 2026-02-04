const Task = require('../models/Task');
const logger = require('../utils/logger');

// Get all tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    next(error);
  }
};

// Get task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    logger.error('Error fetching task:', error);
    next(error);
  }
};

// Create task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, deadline, assignee, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const task = new Task({
      title,
      description,
      priority,
      deadline,
      assignee,
      tags,
    });

    const savedTask = await task.save();
    res.status(201).json({
      success: true,
      data: savedTask,
    });
  } catch (error) {
    logger.error('Error creating task:', error);
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting task:', error);
    next(error);
  }
};
