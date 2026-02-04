/**
 * Decomposition Patterns Controller
 * Manages decomposition patterns for consistent and efficient task breakdown
 */

const DecompositionPattern = require('../models/DecompositionPattern');
const logger = require('../utils/logger');

// Get all active patterns
exports.getPatterns = async (req, res, next) => {
  try {
    const { category, isActive, sort } = req.query;
    const filter = { isActive: isActive !== 'false' };

    if (category) filter.category = category;

    const patterns = await DecompositionPattern.find(filter).sort(
      sort === 'usage' ? { usageCount: -1 } : { successRate: -1 }
    );

    res.json({
      success: true,
      data: patterns,
      count: patterns.length,
    });
  } catch (error) {
    logger.error('Error fetching patterns:', error);
    next(error);
  }
};

// Get pattern by ID
exports.getPattern = async (req, res, next) => {
  try {
    const pattern = await DecompositionPattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found',
      });
    }

    res.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    logger.error('Error fetching pattern:', error);
    next(error);
  }
};

// Create new pattern
exports.createPattern = async (req, res, next) => {
  try {
    const {
      category,
      description,
      keywords,
      standardTasks,
      implicitDependencies,
      createdBy,
    } = req.body;

    if (!category || !description || !keywords || !standardTasks) {
      return res.status(400).json({
        success: false,
        message: 'category, description, keywords, and standardTasks are required',
      });
    }

    const pattern = new DecompositionPattern({
      category,
      description,
      keywords: keywords.map((k) => k.toLowerCase()),
      standardTasks,
      implicitDependencies: implicitDependencies || [],
      createdBy: createdBy || 'unknown',
    });

    await pattern.save();

    res.status(201).json({
      success: true,
      data: pattern,
      message: 'Pattern created successfully',
    });
  } catch (error) {
    logger.error('Error creating pattern:', error);
    next(error);
  }
};

// Update pattern
exports.updatePattern = async (req, res, next) => {
  try {
    const pattern = await DecompositionPattern.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found',
      });
    }

    res.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    logger.error('Error updating pattern:', error);
    next(error);
  }
};

// Delete pattern (soft delete)
exports.deletePattern = async (req, res, next) => {
  try {
    const pattern = await DecompositionPattern.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found',
      });
    }

    res.json({
      success: true,
      message: 'Pattern deactivated successfully',
    });
  } catch (error) {
    logger.error('Error deleting pattern:', error);
    next(error);
  }
};

// Get patterns by category
exports.getPatternsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const patterns = await DecompositionPattern.find({
      category,
      isActive: true,
    }).sort({ successRate: -1 });

    res.json({
      success: true,
      data: patterns,
      category,
      count: patterns.length,
    });
  } catch (error) {
    logger.error('Error fetching patterns by category:', error);
    next(error);
  }
};

// Search patterns by keywords
exports.searchPatterns = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const keywords = query.toLowerCase().split(/\s+/);

    const patterns = await DecompositionPattern.find({
      isActive: true,
      keywords: { $in: keywords },
    }).sort({ successRate: -1 });

    res.json({
      success: true,
      data: patterns,
      query,
      count: patterns.length,
    });
  } catch (error) {
    logger.error('Error searching patterns:', error);
    next(error);
  }
};

// Get pattern statistics
exports.getPatternStats = async (req, res, next) => {
  try {
    const stats = await DecompositionPattern.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgSuccessRate: { $avg: '$successRate' },
          avgUsageCount: { $avg: '$usageCount' },
          totalUsage: { $sum: '$usageCount' },
        },
      },
      { $sort: { totalUsage: -1 } },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting pattern stats:', error);
    next(error);
  }
};

// Record pattern usage success
exports.recordUsage = async (req, res, next) => {
  try {
    const { patternId } = req.params;
    const { success } = req.body;

    const pattern = await DecompositionPattern.findById(patternId);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        message: 'Pattern not found',
      });
    }

    pattern.usageCount += 1;
    if (success) {
      // Update success rate
      const newSuccessCount = Math.round((pattern.successRate / 100) * pattern.usageCount) + 1;
      pattern.successRate = (newSuccessCount / pattern.usageCount) * 100;
    }

    await pattern.save();

    res.json({
      success: true,
      data: pattern,
      message: 'Pattern usage recorded',
    });
  } catch (error) {
    logger.error('Error recording pattern usage:', error);
    next(error);
  }
};

module.exports = exports;
