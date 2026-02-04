const mongoose = require('mongoose');

// This is an embedded schema, not a separate collection
// Used as a sub-document in Decomposition and Project documents
const taskSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 160,
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: 'Estimated hours must be greater than 0',
      },
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: 'Priority must be an integer between 1 and 10',
      },
    },
    dependencies: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['e-commerce', 'auth', 'payments', 'reporting', 'data-processing', 'api', 'deployment', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'blocked', 'completed', 'on-hold'],
      default: 'planned',
    },
    assignee: {
      type: String,
    },
    skillsRequired: [String],
    ambiguityFlags: [
      {
        _id: false,
        flag: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        suggestion: String,
      },
    ],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    riskFactors: [String],
    actualHours: {
      type: Number,
      min: 0,
    },
    completionDate: Date,
    notes: String,
  },
  {
    _id: true,
    timestamps: false,
  }
);

// Virtual to check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (!this.actualHours || !this.estimatedHours) {
    return false;
  }
  return this.actualHours > this.estimatedHours * 1.2; // 20% threshold
});

module.exports = taskSchema;
