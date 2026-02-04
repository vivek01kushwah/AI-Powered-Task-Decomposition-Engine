const express = require('express');
const analysisController = require('../controllers/analysisController');

/**
 * analysisRoutes.js
 * 
 * Routes for the complete analysis pipeline
 * Coordinates task decomposition, contradiction detection, ambiguity analysis, and feasibility assessment
 */

const router = express.Router();

/**
 * POST /api/analyze
 * 
 * Complete analysis pipeline
 * 
 * Request Body:
 * {
 *   description: string (required, min 50 chars),
 *   teamSize: number (default: 5),
 *   hoursPerDay: number (default: 8),
 *   maxTasks: number (default: 100),
 *   deadline: string (ISO date, optional),
 *   projectId: string (optional),
 *   patternId: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   timestamp: Date,
 *   decomposition: {
 *     taskCount: number,
 *     tasks: Task[],
 *     extractedFeatures: string[],
 *     featureCount: number
 *   },
 *   graph: {
 *     hasCircularDependencies: boolean,
 *     criticalPath: string[],
 *     criticalPathLength: number,
 *     parallelizableTasks: string[],
 *     parallelismScore: number,
 *     taskLevels: object
 *   },
 *   contradictions: {
 *     count: number,
 *     contradictions: Contradiction[],
 *     highSeverityCount: number
 *   },
 *   ambiguity: {
 *     score: number,
 *     level: string,
 *     totalQuestions: number,
 *     questions: Question[],
 *     criticalQuestions: number
 *   },
 *   feasibility: {
 *     score: number,
 *     level: string,
 *     metrics: object,
 *     warnings: Warning[],
 *     actionItems: string[]
 *   },
 *   recommendations: Recommendation[],
 *   summary: object,
 *   decompositionId: string
 * }
 */
router.post('/analyze', analysisController.analyzeProject);

/**
 * POST /api/analyze/quick
 * 
 * Quick analysis - task decomposition only
 * Faster, returns only tasks without full pipeline analysis
 * 
 * Request Body:
 * {
 *   description: string (required),
 *   maxTasks: number (default: 50)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   taskCount: number,
 *   tasks: Task[],
 *   features: string[]
 * }
 */
router.post('/analyze/quick', analysisController.quickAnalysis);

/**
 * GET /api/analyze/history
 * 
 * Get analysis history
 * Returns list of previous analyses
 * 
 * Query Parameters:
 * - limit: number (default: 10, max: 100)
 * - offset: number (default: 0)
 * 
 * Response:
 * {
 *   success: boolean,
 *   total: number,
 *   count: number,
 *   decompositions: [
 *     {
 *       id: string,
 *       description: string,
 *       taskCount: number,
 *       feasibilityScore: number,
 *       clarityScore: number,
 *       date: Date
 *     }
 *   ]
 * }
 */
router.get('/analyze/history', analysisController.getAnalysisHistory);

/**
 * GET /api/analyze/:decompositionId
 * 
 * Get specific analysis result
 * Retrieve full analysis by decomposition ID
 * 
 * URL Parameters:
 * - decompositionId: MongoDB ObjectId
 * 
 * Response:
 * {
 *   success: boolean,
 *   decomposition: Decomposition
 * }
 */
router.get('/analyze/:decompositionId', analysisController.getAnalysisResult);

module.exports = router;
