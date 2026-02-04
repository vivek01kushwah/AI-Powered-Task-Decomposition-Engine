const mongoose = require('mongoose');

// Use Mixed type for flexibility since the analysis structure is complex and variable
const analysisResultSchema = new mongoose.Schema(
  {
    // Project Information
    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Flexible fields - accept any data structure
    tasks: mongoose.Schema.Types.Mixed,
    extractedFeatures: mongoose.Schema.Types.Mixed,
    constraints: mongoose.Schema.Types.Mixed,
    analysis: mongoose.Schema.Types.Mixed,
    recommendations: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed,
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    strict: false  // Allow any fields to be saved
  }
);

// Indexes for better query performance
analysisResultSchema.index({ 'createdAt': -1 });
analysisResultSchema.index({ 'projectDescription': 'text' });

module.exports = mongoose.model('AnalysisResult', analysisResultSchema);
