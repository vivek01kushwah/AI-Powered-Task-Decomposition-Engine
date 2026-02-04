const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task-decomposition-api', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes - Comment out problematic routes for now
// app.use('/api/tasks', require('./routes/taskRoutes'));
// app.use('/api/decompositions', require('./routes/decompositionRoutes'));
// app.use('/api/projects', require('./routes/projectRoutes'));
// app.use('/api/patterns', require('./routes/patternRoutes'));
// app.use('/api/analyze', require('./routes/analysisRoutes'));

// Main decompose endpoint for assessment task
const analysisController = require('./controllers/analysisController');
app.post('/api/decompose', analysisController.analyzeProject);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Diagnostic endpoint - Check database connection
app.get('/api/debug/db-status', async (req, res) => {
  try {
    const AnalysisResult = require('./models/AnalysisResult');
    const count = await AnalysisResult.countDocuments();
    res.json({
      success: true,
      message: 'Database connected',
      analysisResultsCount: count,
      mongooseState: mongoose.connection.readyState,
      mongooseStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      mongooseState: mongoose.connection.readyState
    });
  }
});

// Diagnostic endpoint - Get last analysis results
app.get('/api/debug/recent-analysis', async (req, res) => {
  try {
    const AnalysisResult = require('./models/AnalysisResult');
    const results = await AnalysisResult.find().sort({ createdAt: -1 }).limit(5);
    res.json({
      success: true,
      count: results.length,
      results: results.map(r => ({
        _id: r._id,
        projectDescription: r.projectDescription?.substring(0, 100) + '...',
        tasksCount: r.tasks?.length || 0,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
