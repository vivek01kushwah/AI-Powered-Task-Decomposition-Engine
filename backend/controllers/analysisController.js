const Project = require('../models/Project');
const Decomposition = require('../models/Decomposition');
const AnalysisResult = require('../models/AnalysisResult');
const taskDecomposer = require('../services/taskDecomposer');
const dependencyGraphService = require('../services/dependencyGraphService');
const contradictionDetector = require('../services/contradictionDetector');
const ambiguityScorer = require('../services/ambiguityScorer');
const feasibilityCalculator = require('../services/feasibilityCalculator');

/**
 * analysisController.js
 * 
 * Orchestrates all analysis services in a complete pipeline
 * Coordinates task decomposition, contradiction detection, ambiguity analysis, and feasibility calculation
 */

/**
 * POST /api/analyze
 * Complete analysis pipeline for a project
 * 
 * Handles:
 * 1. Task decomposition from project description
 * 2. Dependency graph analysis
 * 3. Contradiction detection
 * 4. Ambiguity scoring and clarifying questions
 * 5. Feasibility calculation
 * 
 * Returns unified analysis result
 */
exports.analyzeProject = async (req, res) => {
  try {
    const {
      description,
      teamSize = 5,
      hoursPerDay = 8,
      maxTasks = 100,
      deadline,
      projectId,
      patternId
    } = req.body;

    // Validate input
    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Project description is required'
      });
    }

    if (description.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Project description must be at least 50 characters'
      });
    }

    // ============================================
    // STEP 1: Task Decomposition
    // ============================================
    console.log('📋 Step 1: Decomposing project into tasks...');
    
    let decompositionResult;
    try {
      const result = taskDecomposer.decomposeProject(
        description,
        {
          maxTasks,
          includeMetadata: true
        }
      );

      // Handle both formats: { success, decomposition } and { tasks, ... }
      if (result.decomposition) {
        decompositionResult = {
          success: result.success,
          tasks: result.decomposition.tasks || [],
          features: result.decomposition.features || [],
          summary: result.decomposition.summary || {}
        };
      } else if (result.tasks) {
        decompositionResult = result;
      } else {
        throw new Error('Invalid decomposition result format');
      }

      // Validate we got tasks
      if (!decompositionResult.tasks || !Array.isArray(decompositionResult.tasks)) {
        throw new Error('Decomposition returned invalid tasks format');
      }

      if (decompositionResult.tasks.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No tasks could be decomposed from the description. Please add more specific keywords like: auth, payment, api, database, users, etc.'
        });
      }
    } catch (error) {
      console.error('❌ Task decomposition failed:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Task decomposition failed: ' + error.message
      });
    }

    // ============================================
    // STEP 2: Dependency Graph Analysis
    // ============================================
    console.log('🔗 Step 2: Analyzing task dependencies...');
    
    let graphAnalysis = {};
    try {
      // Ensure tasks have required properties for graph analysis
      const tasksForGraph = decompositionResult.tasks.map(task => ({
        taskId: task.taskId || task.id || `task-${Math.random()}`,
        title: task.title || 'Unknown Task',
        estimatedHours: task.estimatedHours || 0,
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        priority: task.priority || 5,
        category: task.category || 'general'
      }));

      // Detect circular dependencies
      const hasCycles = dependencyGraphService.detectCircularDependencies(tasksForGraph);

      // Calculate critical path
      const criticalPath = dependencyGraphService.calculateCriticalPath(tasksForGraph);

      // Find parallelizable tasks
      const parallelizable = dependencyGraphService.findParallelizableTasks(tasksForGraph);

      graphAnalysis = {
        hasCircularDependencies: hasCycles?.hasCycles || false,
        circularChains: hasCycles?.cycles || [],
        criticalPath: Array.isArray(criticalPath) ? criticalPath : [],
        parallelizableTasks: Array.isArray(parallelizable) ? parallelizable : [],
        totalTasks: decompositionResult.tasks.length,
        taskLevels: calculateTaskLevels(tasksForGraph),
        parallelismOpportunity: (Array.isArray(parallelizable) ? parallelizable.length : 0) / decompositionResult.tasks.length
      };

      // If circular dependencies found, attempt to break them
      if (hasCycles?.hasCycles) {
        console.warn('⚠️ Circular dependencies detected. Attempting to resolve...');
        const resolved = dependencyGraphService.breakCircularDependency(
          tasksForGraph,
          hasCycles.cycles?.[0]
        );
        if (resolved?.tasks) {
          decompositionResult.tasks = resolved.tasks.map((t, idx) => ({
            ...decompositionResult.tasks[idx],
            dependencies: t.dependencies
          }));
          graphAnalysis.circularDependenciesResolved = true;
        }
      }
    } catch (error) {
      console.error('❌ Dependency analysis failed:', error.message);
      graphAnalysis = {
        hasCircularDependencies: false,
        circularChains: [],
        criticalPath: [],
        parallelizableTasks: [],
        parallelismOpportunity: 0,
        error: error.message
      };
    }

    // ============================================
    // STEP 3: Contradiction Detection
    // ============================================
    console.log('🔄 Step 3: Detecting requirement contradictions...');
    
    let contradictions = {};
    try {
      const contradictionAnalysis = contradictionDetector.detectContradictions(description);
      contradictions = contradictionDetector.generateReport(contradictionAnalysis);
    } catch (error) {
      console.error('❌ Contradiction detection failed:', error.message);
      contradictions = {
        error: error.message,
        contradictions: []
      };
    }

    // ============================================
    // STEP 4: Ambiguity Scoring & Questions
    // ============================================
    console.log('❓ Step 4: Analyzing requirement clarity...');
    
    let ambiguityAnalysis = {};
    try {
      // Score the overall requirement
      const requirementScore = ambiguityScorer.scoreRequirement(description);

      // Generate clarifying questions
      let questions = ambiguityScorer.generateClarifyingQuestions(description);
      
      // Ensure questions is an array
      if (!Array.isArray(questions)) {
        questions = [];
      }

      ambiguityAnalysis = {
        score: requirementScore?.score || 0.5,
        level: requirementScore?.level || 'medium',
        factors: requirementScore?.ambiguousTerms || [],
        vagueness: requirementScore?.ambiguity || 0.5,
        questions: questions,
        totalQuestions: questions.length,
        criticalQuestions: questions.filter(q => q && q.priority === 'critical').length || 0,
        highPriorityQuestions: questions.filter(q => q && q.priority === 'high').length || 0
      };
    } catch (error) {
      console.error('❌ Ambiguity analysis failed:', error.message);
      ambiguityAnalysis = {
        error: error.message,
        questions: [],
        score: 0.5,
        level: 'medium',
        totalQuestions: 0,
        criticalQuestions: 0,
        highPriorityQuestions: 0
      };
    }

    // ============================================
    // STEP 5: Feasibility Calculation
    // ============================================
    console.log('⚡ Step 5: Calculating project feasibility...');
    
    let feasibilityAnalysis = {};
    try {
      feasibilityAnalysis = feasibilityCalculator.calculateFeasibility(
        decompositionResult.tasks,
        {
          teamSize,
          hoursPerDay,
          deadline: deadline ? new Date(deadline) : null,
          criticalPath: graphAnalysis.criticalPath,
          parallelism: graphAnalysis.parallelismOpportunity
        }
      );

      // Generate detailed report
      const feasibilityReport = feasibilityCalculator.generateReport(feasibilityAnalysis);
      feasibilityAnalysis.report = feasibilityReport;
    } catch (error) {
      console.error('❌ Feasibility calculation failed:', error.message);
      feasibilityAnalysis = {
        error: error.message,
        score: 0,
        warnings: []
      };
    }

    // ============================================
    // STEP 6: Save to Database
    // ============================================
    console.log('💾 Step 6: Saving analysis results...');
    
    let savedDecomposition = null;
    try {
      const decompositionData = {
        projectDescription: description,
        tasks: decompositionResult.tasks,
        extractedFeatures: decompositionResult.features,
        constraints: {
          teamSize,
          hoursPerDay,
          maxTasks,
          deadline: deadline ? new Date(deadline) : null
        },
        analysis: {
          graph: graphAnalysis,
          contradictions,
          ambiguity: ambiguityAnalysis,
          feasibility: feasibilityAnalysis
        },
        metadata: {
          analysisDate: new Date(),
          version: '1.0',
          serviceVersions: {
            taskDecomposer: '1.0',
            dependencyGraphService: '1.0',
            contradictionDetector: '1.0',
            ambiguityScorer: '1.0',
            feasibilityCalculator: '1.0'
          }
        }
      };

      savedDecomposition = await AnalysisResult.create(decompositionData);
      console.log('✅ Analysis saved to database with ID:', savedDecomposition._id);
    } catch (error) {
      console.error('⚠️ Failed to save analysis to database:', error.message);
      // Continue without saving - analysis is still valid
    }

    // ============================================
    // STEP 7: Generate Recommendations
    // ============================================
    console.log('💡 Step 7: Generating recommendations...');
    
    const recommendations = generateRecommendations(
      decompositionResult,
      contradictions,
      ambiguityAnalysis,
      feasibilityAnalysis,
      graphAnalysis
    );

    // ============================================
    // Return Unified Analysis Result
    // ============================================
    const analysisResult = {
      success: true,
      timestamp: new Date(),
      
      // Decomposition Results
      decomposition: {
        taskCount: decompositionResult.tasks.length,
        tasks: decompositionResult.tasks,
        extractedFeatures: decompositionResult.features || [],
        featureCount: (decompositionResult.features || []).length
      },

      // Dependency Graph Results
      graph: {
        hasCircularDependencies: graphAnalysis.hasCircularDependencies,
        circularChains: graphAnalysis.circularChains,
        criticalPath: graphAnalysis.criticalPath,
        criticalPathLength: graphAnalysis.criticalPath?.length || 0,
        parallelizableTasks: graphAnalysis.parallelizableTasks,
        parallelismScore: graphAnalysis.parallelismOpportunity,
        taskLevels: graphAnalysis.taskLevels
      },

      // Contradiction Detection Results
      contradictions: {
        count: contradictions.contradictions?.length || 0,
        contradictions: contradictions.contradictions || [],
        highSeverityCount: (contradictions.contradictions || []).filter(c => c.severity === 'critical' || c.severity === 'high').length
      },

      // Ambiguity Analysis Results
      ambiguity: {
        score: ambiguityAnalysis.score || 0,
        level: ambiguityAnalysis.level || 'unknown',
        totalQuestions: ambiguityAnalysis.totalQuestions || 0,
        questions: ambiguityAnalysis.questions || [],
        criticalQuestions: ambiguityAnalysis.criticalQuestions || 0,
        factors: ambiguityAnalysis.factors || []
      },

      // Feasibility Results
      feasibility: {
        score: feasibilityAnalysis.score || 0,
        level: feasibilityAnalysis.level || 'unknown',
        metrics: feasibilityAnalysis.metrics || {},
        warnings: feasibilityAnalysis.warnings || [],
        riskAdjustments: feasibilityAnalysis.riskAdjustments || {},
        actionItems: feasibilityAnalysis.actionItems || []
      },

      // Unified Recommendations
      recommendations,

      // Database Reference
      decompositionId: savedDecomposition?._id || null,

      // Summary
      summary: {
        totalTasks: decompositionResult.tasks.length,
        averageTaskHours: calculateAverageTaskHours(decompositionResult.tasks),
        criticalPathHours: feasibilityAnalysis.metrics?.criticalPathHours || 0,
        estimatedDays: Math.ceil((feasibilityAnalysis.metrics?.criticalPathHours || 0) / (hoursPerDay || 8)),
        feasibilityRating: feasibilityAnalysis.level,
        clarityScore: ambiguityAnalysis.score,
        contradictionRisk: contradictions.contradictions?.length > 0 ? 'HIGH' : 'LOW'
      }
    };

    res.status(200).json(analysisResult);

  } catch (error) {
    console.error('❌ Analysis pipeline failed:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis pipeline failed: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * POST /api/analyze/quick
 * Quick analysis (decomposition only, no full pipeline)
 */
exports.quickAnalysis = async (req, res) => {
  try {
    const { description, maxTasks = 50 } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Project description is required'
      });
    }

    const result = taskDecomposer.decomposeProject(description, { maxTasks });

    res.status(200).json({
      success: true,
      taskCount: result.tasks.length,
      tasks: result.tasks,
      features: result.features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analyze/history
 * Get analysis history for user
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const decompositions = await Decomposition.find()
      .sort({ 'metadata.analysisDate': -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Decomposition.countDocuments();

    res.status(200).json({
      success: true,
      total,
      count: decompositions.length,
      decompositions: decompositions.map(d => ({
        id: d._id,
        description: d.projectDescription.substring(0, 100) + '...',
        taskCount: d.tasks.length,
        feasibilityScore: d.analysis?.feasibility?.score || 0,
        clarityScore: d.analysis?.ambiguity?.score || 0,
        date: d.metadata.analysisDate
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * GET /api/analyze/:decompositionId
 * Get specific analysis result
 */
exports.getAnalysisResult = async (req, res) => {
  try {
    const { decompositionId } = req.params;

    const decomposition = await Decomposition.findById(decompositionId);

    if (!decomposition) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      decomposition
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Helper Functions
 */

/**
 * Calculate task levels (0 = no dependencies, N = depends on level N-1)
 */
function calculateTaskLevels(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {};
  }

  const levels = {};
  const visited = new Set();

  const getLevel = (taskId) => {
    if (levels[taskId] !== undefined) return levels[taskId];
    if (visited.has(taskId)) return 0; // Cycle detected, treat as 0

    visited.add(taskId);
    // Handle both _id (MongoDB) and taskId (taskDecomposer) formats
    const task = tasks.find(t => (t._id?.toString() === taskId.toString() || t.taskId === taskId));
    
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      levels[taskId] = 0;
      return 0;
    }

    const maxDepLevel = Math.max(
      0,
      ...(task.dependencies && Array.isArray(task.dependencies) 
        ? task.dependencies.map(depId => getLevel(depId)) 
        : [0])
    );
    levels[taskId] = maxDepLevel + 1;
    return levels[taskId];
  };

  // Handle both _id (MongoDB) and taskId (taskDecomposer) formats
  tasks.forEach(task => getLevel(task._id || task.taskId));
  return levels;
}

/**
 * Calculate average task hours
 */
function calculateAverageTaskHours(tasks) {
  if (tasks.length === 0) return 0;
  const total = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  return total / tasks.length;
}

/**
 * Generate unified recommendations from all analyses
 */
function generateRecommendations(decomposition, contradictions, ambiguity, feasibility, graph) {
  const recommendations = [];

  // Ensure tasks exist
  const tasks = (decomposition && decomposition.tasks) || [];
  if (tasks.length === 0) {
    return recommendations;
  }

  // Decomposition recommendations
  if (tasks.length > 100) {
    recommendations.push({
      category: 'scope',
      severity: 'high',
      message: 'Project has over 100 tasks. Consider breaking into phases or consolidating similar tasks.',
      source: 'taskDecomposer'
    });
  }

  // Graph recommendations
  if (graph.hasCircularDependencies) {
    recommendations.push({
      category: 'dependencies',
      severity: 'critical',
      message: 'Circular dependencies detected. These must be resolved before project execution.',
      source: 'dependencyGraphService'
    });
  }

  if (graph.parallelismOpportunity > 0.5) {
    recommendations.push({
      category: 'optimization',
      severity: 'medium',
      message: `High parallelization opportunity (${Math.round(graph.parallelismOpportunity * 100)}%). Consider parallel task execution.`,
      source: 'dependencyGraphService'
    });
  }

  // Contradiction recommendations
  const highContradictions = (contradictions.contradictions || []).filter(
    c => c.severity === 'critical' || c.severity === 'high'
  );

  if (highContradictions.length > 0) {
    recommendations.push({
      category: 'requirements',
      severity: 'high',
      message: `${highContradictions.length} critical requirement contradictions found. Resolve before proceeding.`,
      source: 'contradictionDetector'
    });
  }

  // Ambiguity recommendations
  if (ambiguity.score < 0.7) {
    recommendations.push({
      category: 'clarity',
      severity: 'high',
      message: `Requirements clarity is low (${Math.round(ambiguity.score * 100)}%). Answer clarifying questions to improve.`,
      source: 'ambiguityScorer'
    });
  }

  if ((ambiguity.criticalQuestions || 0) > 0) {
    recommendations.push({
      category: 'clarity',
      severity: 'critical',
      message: `${ambiguity.criticalQuestions} critical clarifying questions need answers.`,
      source: 'ambiguityScorer'
    });
  }

  // Feasibility recommendations
  if (feasibility.score < 0.7) {
    recommendations.push({
      category: 'feasibility',
      severity: 'high',
      message: `Project feasibility score is low (${Math.round(feasibility.score * 100)}%). Consider scope reduction, deadline extension, or team expansion.`,
      source: 'feasibilityCalculator'
    });
  }

  if ((feasibility.warnings || []).length > 0) {
    const criticalWarnings = feasibility.warnings.filter(w => w.type === 'timeline' || w.type === 'team-capacity');
    if (criticalWarnings.length > 0) {
      recommendations.push({
        category: 'feasibility',
        severity: 'high',
        message: `${criticalWarnings.length} critical feasibility warnings. Review timeline and team capacity.`,
        source: 'feasibilityCalculator'
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return recommendations;
}

module.exports = exports;
