const mongoose = require('mongoose');

const decompositionPatternSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['e-commerce', 'auth', 'payments', 'reporting', 'data-processing', 'api', 'deployment', 'general'],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      required: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    standardTasks: [
      {
        _id: false,
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        estimatedHours: {
          type: Number,
          min: 0.5,
          max: 160,
          default: 4,
        },
        priority: {
          type: Number,
          min: 1,
          max: 10,
          default: 5,
        },
        category: {
          type: String,
        },
        order: {
          type: Number,
          required: true,
        },
        skillsRequired: [String],
      },
    ],
    implicitDependencies: [
      {
        _id: false,
        fromTaskOrder: {
          type: Number,
          required: true,
        },
        toTaskOrder: {
          type: Number,
          required: true,
        },
        dependencyType: {
          type: String,
          enum: ['blocks', 'requires_output', 'sequential', 'parallel'],
          default: 'blocks',
        },
        description: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
    collection: 'decompositionPatterns',
  }
);

// Indexes
decompositionPatternSchema.index({ category: 1, isActive: 1 });
decompositionPatternSchema.index({ keywords: 1 });
decompositionPatternSchema.index({ createdAt: -1 });
decompositionPatternSchema.index({ successRate: -1 });
decompositionPatternSchema.index({ usageCount: -1 });

// Validate standardTasks
decompositionPatternSchema.pre('save', function (next) {
  // Ensure standardTasks have unique orders
  const orders = this.standardTasks.map((task) => task.order);
  if (new Set(orders).size !== orders.length) {
    return next(new Error('Standard tasks must have unique order values'));
  }

  // Validate dependencies reference existing task orders
  const validOrders = new Set(orders);
  for (const dep of this.implicitDependencies) {
    if (!validOrders.has(dep.fromTaskOrder) || !validOrders.has(dep.toTaskOrder)) {
      return next(new Error('Dependency references non-existent task order'));
    }
    if (dep.fromTaskOrder === dep.toTaskOrder) {
      return next(new Error('Task cannot depend on itself'));
    }
  }

  next();
});

module.exports = mongoose.model('DecompositionPattern', decompositionPatternSchema);
