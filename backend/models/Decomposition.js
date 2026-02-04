const mongoose = require('mongoose');
const taskSchema = require('./TaskSchema');

const decompositionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    originalTask: {
      type: String,
      required: true,
      trim: true,
    },
    originalDescription: {
      type: String,
    },
    subtasks: {
      type: [taskSchema],
      default: [],
    },
    decompositionMethod: {
      type: String,
      enum: ['hierarchical', 'sequential', 'parallel', 'hybrid'],
      default: 'hierarchical',
      index: true,
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
    },
    estimatedTotalHours: {
      type: Number,
      default: 0,
    },
    actualTotalHours: {
      type: Number,
      default: 0,
    },
    ambiguities: [
      {
        _id: false,
        description: String,
        affectedTasks: [String],
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
      },
    ],
    patterns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DecompositionPattern',
      },
    ],
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
    createdBy: String,
  },
  { timestamps: true, collection: 'decompositions' }
);

// Indexes
decompositionSchema.index({ taskId: 1, createdAt: -1 });
decompositionSchema.index({ decompositionMethod: 1 });
decompositionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
decompositionSchema.pre('save', function (next) {
  this.estimatedTotalHours = this.subtasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  this.actualTotalHours = this.subtasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
  next();
});

module.exports = mongoose.model('Decomposition', decompositionSchema);
