/**
 * Task Decomposer Service
 * 
 * Orchestrates the decomposition of project descriptions into structured tasks.
 * Integrates with:
 * - Feature extraction (keyword matching, pattern recognition)
 * - Task templates from DecompositionPattern collection
 * - Complexity heuristics for time estimation
 * - Priority calculation based on dependencies and urgency
 * 
 * Process:
 * 1. Extract features from description
 * 2. Map features to task templates
 * 3. Generate base tasks
 * 4. Calculate estimates using heuristics
 * 5. Calculate priorities
 * 6. Return comprehensive task array
 */

/**
 * Feature Keywords - Maps keywords to feature categories
 * Each category triggers specific task generation patterns
 */
const featureKeywords = {
  // Authentication & Security
  'auth': {
    category: 'authentication',
    featureName: 'User Authentication',
    taskTemplates: ['auth-design', 'auth-backend', 'auth-frontend', 'auth-testing'],
    baseEstimate: 8,
    keywords: ['auth', 'login', 'signin', 'logout', 'signup', 'registration', 'password', 'session']
  },
  'oauth': {
    category: 'authentication',
    featureName: 'OAuth Integration',
    taskTemplates: ['oauth-setup', 'oauth-backend', 'oauth-frontend'],
    baseEstimate: 6,
    keywords: ['oauth', 'google login', 'github login', 'third-party', 'sso']
  },
  'mfa': {
    category: 'authentication',
    featureName: 'Multi-Factor Authentication',
    taskTemplates: ['mfa-design', 'mfa-backend', 'mfa-frontend'],
    baseEstimate: 10,
    keywords: ['mfa', 'two-factor', 'otp', 'authenticator', '2fa']
  },

  // Payment & E-commerce
  'payment': {
    category: 'payment',
    featureName: 'Payment Processing',
    taskTemplates: ['payment-design', 'payment-backend', 'payment-integration', 'payment-testing'],
    baseEstimate: 12,
    keywords: ['payment', 'checkout', 'stripe', 'paypal', 'billing', 'invoice', 'transactions']
  },
  'cart': {
    category: 'ecommerce',
    featureName: 'Shopping Cart',
    taskTemplates: ['cart-design', 'cart-backend', 'cart-frontend', 'cart-testing'],
    baseEstimate: 8,
    keywords: ['cart', 'shopping cart', 'checkout', 'items', 'order']
  },
  'catalog': {
    category: 'ecommerce',
    featureName: 'Product Catalog',
    taskTemplates: ['catalog-design', 'catalog-backend', 'catalog-frontend', 'catalog-api'],
    baseEstimate: 10,
    keywords: ['catalog', 'products', 'inventory', 'listing', 'browse', 'search']
  },
  'products': {
    category: 'ecommerce',
    featureName: 'Product Management',
    taskTemplates: ['product-crud', 'product-api', 'product-ui'],
    baseEstimate: 8,
    keywords: ['product', 'products', 'sku', 'pricing', 'inventory']
  },

  // User Management
  'users': {
    category: 'user-management',
    featureName: 'User Management',
    taskTemplates: ['user-design', 'user-backend', 'user-frontend', 'user-testing'],
    baseEstimate: 8,
    keywords: ['users', 'user management', 'profiles', 'accounts', 'admin', 'permissions']
  },
  'profile': {
    category: 'user-management',
    featureName: 'User Profiles',
    taskTemplates: ['profile-backend', 'profile-frontend', 'profile-api'],
    baseEstimate: 6,
    keywords: ['profile', 'user profile', 'account settings', 'personal info']
  },
  'roles': {
    category: 'authorization',
    featureName: 'Role-Based Access Control',
    taskTemplates: ['rbac-design', 'rbac-backend', 'rbac-frontend'],
    baseEstimate: 8,
    keywords: ['roles', 'permissions', 'rbac', 'access control', 'admin', 'user roles']
  },

  // Database & Data
  'database': {
    category: 'database',
    featureName: 'Database Design',
    taskTemplates: ['db-design', 'db-schema', 'db-migration'],
    baseEstimate: 4,
    keywords: ['database', 'db', 'schema', 'migration', 'sql', 'mongo', 'postgresql']
  },
  'data': {
    category: 'data-management',
    featureName: 'Data Management',
    taskTemplates: ['data-design', 'data-backend', 'data-api'],
    baseEstimate: 6,
    keywords: ['data', 'import', 'export', 'sync', 'cache']
  },

  // Frontend & UI
  'dashboard': {
    category: 'frontend',
    featureName: 'Dashboard',
    taskTemplates: ['dashboard-design', 'dashboard-frontend', 'dashboard-testing'],
    baseEstimate: 8,
    keywords: ['dashboard', 'analytics', 'metrics', 'charts', 'reporting']
  },
  'responsive': {
    category: 'frontend',
    featureName: 'Responsive Design',
    taskTemplates: ['responsive-design', 'mobile-frontend', 'tablet-frontend'],
    baseEstimate: 6,
    keywords: ['responsive', 'mobile', 'mobile-first', 'responsive design']
  },
  'ui': {
    category: 'frontend',
    featureName: 'User Interface',
    taskTemplates: ['ui-design', 'ui-frontend', 'ui-testing'],
    baseEstimate: 6,
    keywords: ['ui', 'interface', 'design', 'component', 'layout']
  },
  'search': {
    category: 'frontend',
    featureName: 'Search Functionality',
    taskTemplates: ['search-backend', 'search-frontend', 'search-indexing'],
    baseEstimate: 6,
    keywords: ['search', 'filter', 'query', 'full-text', 'elasticsearch']
  },

  // API & Integration
  'api': {
    category: 'backend',
    featureName: 'API Development',
    taskTemplates: ['api-design', 'api-implementation', 'api-testing', 'api-documentation'],
    baseEstimate: 8,
    keywords: ['api', 'rest', 'graphql', 'endpoints', 'integration']
  },
  'webhooks': {
    category: 'backend',
    featureName: 'Webhooks',
    taskTemplates: ['webhook-design', 'webhook-backend'],
    baseEstimate: 5,
    keywords: ['webhooks', 'events', 'notifications', 'event-driven']
  },
  'notifications': {
    category: 'backend',
    featureName: 'Notifications',
    taskTemplates: ['notification-design', 'notification-backend', 'notification-frontend'],
    baseEstimate: 6,
    keywords: ['notifications', 'email', 'sms', 'push', 'alerts']
  },

  // DevOps & Deployment
  'deployment': {
    category: 'devops',
    featureName: 'Deployment',
    taskTemplates: ['deployment-setup', 'deployment-automation', 'deployment-testing'],
    baseEstimate: 4,
    keywords: ['deployment', 'deploy', 'docker', 'kubernetes', 'ci/cd', 'devops']
  },
  'monitoring': {
    category: 'devops',
    featureName: 'Monitoring & Logging',
    taskTemplates: ['monitoring-setup', 'logging-setup', 'alerts'],
    baseEstimate: 5,
    keywords: ['monitoring', 'logging', 'metrics', 'performance', 'alerts']
  },
  'scaling': {
    category: 'backend',
    featureName: 'Scalability',
    taskTemplates: ['caching', 'optimization', 'load-balancing'],
    baseEstimate: 8,
    keywords: ['scalable', 'scale', 'performance', 'optimization', 'caching']
  },

  // Testing
  'testing': {
    category: 'testing',
    featureName: 'Testing Strategy',
    taskTemplates: ['unit-tests', 'integration-tests', 'e2e-tests'],
    baseEstimate: 6,
    keywords: ['testing', 'test', 'unit', 'integration', 'e2e', 'qa']
  },
  'documentation': {
    category: 'documentation',
    featureName: 'Documentation',
    taskTemplates: ['api-docs', 'user-docs', 'dev-docs'],
    baseEstimate: 4,
    keywords: ['documentation', 'docs', 'readme', 'api-docs']
  }
};

/**
 * Task Templates - Define task structure for each feature
 * Format: taskId -> task definition with base attributes
 */
const taskTemplates = {
  // Setup Tasks
  'setup-project': {
    title: 'Project Setup',
    category: 'setup',
    baseHours: 2,
    priority: 10,
    dependencies: []
  },
  'environment-config': {
    title: 'Environment Configuration',
    category: 'setup',
    baseHours: 1,
    priority: 10,
    dependencies: ['setup-project']
  },

  // Authentication Tasks
  'auth-design': {
    title: 'Authentication System Design',
    category: 'backend',
    baseHours: 3,
    priority: 8,
    dependencies: ['database-design']
  },
  'auth-backend': {
    title: 'Authentication Backend Implementation',
    category: 'backend',
    baseHours: 6,
    priority: 8,
    dependencies: ['auth-design']
  },
  'auth-frontend': {
    title: 'Authentication UI Implementation',
    category: 'frontend',
    baseHours: 4,
    priority: 8,
    dependencies: ['auth-backend']
  },
  'auth-testing': {
    title: 'Authentication Testing',
    category: 'testing',
    baseHours: 3,
    priority: 8,
    dependencies: ['auth-frontend']
  },

  // Database Tasks
  'database-design': {
    title: 'Database Schema Design',
    category: 'database',
    baseHours: 3,
    priority: 9,
    dependencies: []
  },
  'db-schema': {
    title: 'Database Schema Implementation',
    category: 'database',
    baseHours: 2,
    priority: 9,
    dependencies: ['database-design']
  },
  'db-migration': {
    title: 'Database Migration Setup',
    category: 'database',
    baseHours: 2,
    priority: 7,
    dependencies: ['db-schema']
  },

  // Payment Tasks
  'payment-design': {
    title: 'Payment Flow Design',
    category: 'backend',
    baseHours: 3,
    priority: 8,
    dependencies: ['database-design', 'auth-backend']
  },
  'payment-backend': {
    title: 'Payment Backend Implementation',
    category: 'backend',
    baseHours: 8,
    priority: 8,
    dependencies: ['payment-design']
  },
  'payment-integration': {
    title: 'Payment Gateway Integration',
    category: 'backend',
    baseHours: 5,
    priority: 8,
    dependencies: ['payment-backend']
  },
  'payment-testing': {
    title: 'Payment Testing',
    category: 'testing',
    baseHours: 4,
    priority: 8,
    dependencies: ['payment-integration']
  },

  // API Tasks
  'api-design': {
    title: 'API Design & Specification',
    category: 'backend',
    baseHours: 3,
    priority: 8,
    dependencies: ['database-design']
  },
  'api-implementation': {
    title: 'API Implementation',
    category: 'backend',
    baseHours: 8,
    priority: 8,
    dependencies: ['api-design']
  },
  'api-testing': {
    title: 'API Testing',
    category: 'testing',
    baseHours: 4,
    priority: 7,
    dependencies: ['api-implementation']
  },
  'api-documentation': {
    title: 'API Documentation',
    category: 'documentation',
    baseHours: 3,
    priority: 6,
    dependencies: ['api-implementation']
  },

  // Frontend Tasks
  'ui-design': {
    title: 'UI/UX Design',
    category: 'frontend',
    baseHours: 4,
    priority: 7,
    dependencies: []
  },
  'ui-frontend': {
    title: 'Frontend Components Implementation',
    category: 'frontend',
    baseHours: 8,
    priority: 7,
    dependencies: ['ui-design', 'api-design']
  },
  'responsive-design': {
    title: 'Responsive Design Implementation',
    category: 'frontend',
    baseHours: 4,
    priority: 7,
    dependencies: ['ui-frontend']
  },

  // Testing Tasks
  'unit-tests': {
    title: 'Unit Tests',
    category: 'testing',
    baseHours: 6,
    priority: 6,
    dependencies: ['api-implementation']
  },
  'integration-tests': {
    title: 'Integration Tests',
    category: 'testing',
    baseHours: 5,
    priority: 6,
    dependencies: ['unit-tests', 'api-implementation']
  },
  'e2e-tests': {
    title: 'End-to-End Tests',
    category: 'testing',
    baseHours: 5,
    priority: 6,
    dependencies: ['integration-tests', 'ui-frontend']
  },

  // Deployment Tasks
  'deployment-setup': {
    title: 'Deployment Environment Setup',
    category: 'devops',
    baseHours: 3,
    priority: 5,
    dependencies: ['environment-config']
  },
  'deployment-automation': {
    title: 'CI/CD Pipeline Setup',
    category: 'devops',
    baseHours: 4,
    priority: 5,
    dependencies: ['deployment-setup']
  },
  'monitoring-setup': {
    title: 'Monitoring & Logging Setup',
    category: 'devops',
    baseHours: 3,
    priority: 5,
    dependencies: ['deployment-automation']
  }
};

/**
 * Estimation Heuristics
 * Base time adjustments based on complexity factors
 */
const estimationHeuristics = {
  'setup': { baseHours: 2, range: [1, 3] },
  'database': { baseHours: 3, range: [1, 6] },
  'auth': { baseHours: 8, range: [6, 12] },
  'payment': { baseHours: 12, range: [10, 15] },
  'api': { baseHours: 8, range: [6, 12] },
  'backend': { baseHours: 6, range: [4, 10] },
  'frontend': { baseHours: 5, range: [2, 8] },
  'testing': { baseHours: 5, range: [3, 8] },
  'deployment': { baseHours: 4, range: [2, 6] },
  'documentation': { baseHours: 3, range: [1, 5] }
};

/**
 * ALGORITHM 1: Extract Features from Description
 * 
 * Process:
 * 1. Convert description to lowercase
 * 2. Search for feature keywords
 * 3. For each keyword found, extract associated feature
 * 4. Calculate feature importance based on mention frequency
 * 5. Return sorted list of features
 * 
 * Time Complexity: O(n * m) where n = description length, m = keywords count
 * 
 * @param {string} description - Project description
 * @returns {Array} Array of extracted features with details
 */
function extractFeatures(description) {
  if (!description || typeof description !== 'string') {
    return [];
  }

  const lowerDescription = description.toLowerCase();
  const extractedFeatures = [];
  const featureMap = new Map();

  // Search for keywords in description
  Object.entries(featureKeywords).forEach(([key, feature]) => {
    // Check each keyword pattern for this feature
    feature.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerDescription.match(regex);

      if (matches && matches.length > 0) {
        if (!featureMap.has(key)) {
          featureMap.set(key, {
            ...feature,
            mentions: matches.length,
            importance: matches.length
          });
        } else {
          const existing = featureMap.get(key);
          existing.mentions += matches.length;
          existing.importance = Math.min(existing.importance + matches.length, 10);
        }
      }
    });
  });

  // Convert map to array and sort by importance
  Array.from(featureMap.values())
    .sort((a, b) => b.importance - a.importance)
    .forEach(feature => {
      extractedFeatures.push({
        category: feature.category,
        featureName: feature.featureName,
        baseEstimate: feature.baseEstimate,
        taskTemplates: feature.taskTemplates,
        mentions: feature.mentions,
        importance: feature.importance
      });
    });

  return extractedFeatures;
}

/**
 * ALGORITHM 2: Generate Tasks from Features
 * 
 * Process:
 * 1. For each feature, get associated task templates
 * 2. Create task objects from templates
 * 3. Calculate complexity adjustments based on feature importance
 * 4. Apply estimation heuristics
 * 5. Assign initial dependencies
 * 
 * @param {Array} features - Extracted features array
 * @param {Object} constraints - Project constraints
 * @returns {Array} Generated tasks with estimates
 */
function generateTasks(features, constraints = {}) {
  const tasks = [];
  const taskIds = new Set();
  let taskIdCounter = 1;

  // Add setup tasks (always)
  const setupTask = {
    taskId: `task-${taskIdCounter++}`,
    title: 'Project Setup',
    description: 'Initial project setup and configuration',
    category: 'setup',
    estimatedHours: 2,
    priority: 10,
    dependencies: [],
    complexity: 'simple',
    skillsRequired: ['devops', 'project-management']
  };
  tasks.push(setupTask);
  taskIds.add('setup');

  // Add database design task (usually needed)
  const dbTask = {
    taskId: `task-${taskIdCounter++}`,
    title: 'Database Design',
    description: 'Design and plan database schema',
    category: 'database',
    estimatedHours: 3,
    priority: 9,
    dependencies: [`task-${taskIdCounter - 2}`], // Depends on setup
    complexity: 'moderate',
    skillsRequired: ['database-design', 'sql-or-nosql']
  };
  tasks.push(dbTask);
  taskIds.add('database');

  // Generate tasks from features
  features.forEach((feature, featureIdx) => {
    // Complexity multiplier based on importance
    const complexityMultiplier = 0.8 + (feature.importance / 10) * 0.4; // 0.8 to 1.2

    feature.taskTemplates.forEach(templateId => {
      if (taskTemplates[templateId] && !taskIds.has(templateId)) {
        const template = taskTemplates[templateId];
        const estimatedHours = Math.round(template.baseHours * complexityMultiplier * 10) / 10;

        const task = {
          taskId: `task-${taskIdCounter++}`,
          title: template.title,
          description: `${feature.featureName}: ${template.title}`,
          category: template.category,
          estimatedHours: estimatedHours,
          priority: template.priority,
          dependencies: template.dependencies.map(dep => 
            tasks.find(t => t.title === taskTemplates[dep]?.title)?.taskId
          ).filter(Boolean),
          complexity: estimatedHours < 4 ? 'simple' : 
                     estimatedHours < 8 ? 'moderate' : 'complex',
          skillsRequired: getSkillsForCategory(template.category),
          featureCategory: feature.category
        };

        tasks.push(task);
        taskIds.add(templateId);
      }
    });
  });

  // Add testing tasks (percentage of development time)
  if (!taskIds.has('testing')) {
    const devHours = tasks
      .filter(t => ['backend', 'frontend', 'api'].includes(t.category))
      .reduce((sum, t) => sum + t.estimatedHours, 0);
    
    const testingHours = Math.round(devHours * 0.2);

    const testTask = {
      taskId: `task-${taskIdCounter++}`,
      title: 'Testing & QA',
      description: 'Comprehensive testing including unit, integration, and E2E tests',
      category: 'testing',
      estimatedHours: testingHours,
      priority: 6,
      dependencies: [], // Will be updated in dependency resolution
      complexity: 'moderate',
      skillsRequired: ['testing', 'qa']
    };

    tasks.push(testTask);
  }

  // Add deployment tasks (if not present)
  if (!taskIds.has('deployment')) {
    const deployTask = {
      taskId: `task-${taskIdCounter++}`,
      title: 'Deployment & DevOps',
      description: 'Setup deployment pipeline, CI/CD, and production environment',
      category: 'devops',
      estimatedHours: 4,
      priority: 5,
      dependencies: [],
      complexity: 'moderate',
      skillsRequired: ['devops', 'deployment']
    };

    tasks.push(deployTask);
  }

  return tasks;
}

/**
 * Get skills required for a category
 * @private
 */
function getSkillsForCategory(category) {
  const skillMap = {
    'backend': ['backend-development', 'node.js', 'database-design'],
    'frontend': ['frontend-development', 'react', 'css', 'html'],
    'database': ['database-design', 'sql', 'performance-optimization'],
    'authentication': ['backend-development', 'security', 'encryption'],
    'payment': ['backend-development', 'payment-integration', 'security'],
    'testing': ['testing', 'qa', 'automation'],
    'devops': ['devops', 'docker', 'deployment'],
    'documentation': ['technical-writing'],
    'setup': ['devops', 'project-management']
  };
  return skillMap[category] || ['general-development'];
}

/**
 * ALGORITHM 3: Calculate Task Priorities
 * 
 * Priority calculation factors:
 * 1. Dependency count (tasks with many dependents = higher priority)
 * 2. Critical path membership (tasks on critical path = higher priority)
 * 3. Category importance (setup > backend > frontend)
 * 4. Complexity (more complex = higher priority, done first)
 * 5. User-mentioned urgency keywords
 * 
 * Priority Score = (dependencyCount * 0.3) + (categoryWeight * 0.4) + 
 *                  (complexityWeight * 0.2) + (urgencyWeight * 0.1)
 * 
 * @param {Array} tasks - Task array
 * @param {string} description - Original description (for urgency detection)
 * @returns {Array} Tasks with updated priorities
 */
function calculatePriorities(tasks, description = '') {
  // Calculate dependency metrics for each task
  const dependencyMetrics = {};
  
  tasks.forEach(task => {
    // Count how many tasks depend on this task
    const dependentCount = tasks.filter(t => 
      t.dependencies.includes(task.taskId)
    ).length;

    dependencyMetrics[task.taskId] = {
      dependentCount: dependentCount,
      level: task.dependencies.length // Dependency depth
    };
  });

  // Category weights (importance order)
  const categoryWeights = {
    'setup': 10,
    'database': 9,
    'backend': 8,
    'authentication': 8,
    'payment': 8,
    'api': 8,
    'frontend': 7,
    'testing': 6,
    'devops': 5,
    'documentation': 4
  };

  // Complexity weights
  const complexityWeights = {
    'complex': 10,
    'moderate': 5,
    'simple': 2
  };

  // Urgency keywords in description
  const urgencyKeywords = ['urgent', 'asap', 'critical', 'priority', 'first', 'immediately'];
  const hasUrgency = urgencyKeywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );

  // Calculate priority for each task
  tasks.forEach(task => {
    const metrics = dependencyMetrics[task.taskId];
    const categoryWeight = categoryWeights[task.category] || 5;
    const complexityWeight = complexityWeights[task.complexity] || 5;
    
    // Base priority from template
    let basePriority = task.priority || 5;

    // Calculate composite priority
    const dependencyFactor = Math.min(metrics.dependentCount * 1.5, 10);
    const categoryFactor = categoryWeight;
    const complexityFactor = complexityWeight;
    const urgencyFactor = hasUrgency ? 3 : 0;

    // Weighted calculation
    const priorityScore = (
      (dependencyFactor * 0.3) +
      (categoryFactor * 0.4) +
      (complexityFactor * 0.2) +
      (urgencyFactor * 0.1)
    );

    task.priority = Math.round(priorityScore);
    task.priorityDetails = {
      dependencyFactor: dependencyFactor.toFixed(2),
      categoryFactor: categoryFactor,
      complexityFactor: complexityFactor,
      urgencyFactor: urgencyFactor,
      baseScore: basePriority
    };
  });

  // Sort by priority (descending)
  return tasks.sort((a, b) => b.priority - a.priority);
}

/**
 * ALGORITHM 4: Resolve Task Dependencies
 * 
 * Ensures dependencies are properly linked and identifies critical path
 * 
 * @param {Array} tasks - Tasks with dependency information
 * @returns {Array} Tasks with resolved dependencies
 */
function resolveDependencies(tasks) {
  // Validate and fix dependency references
  tasks.forEach(task => {
    if (!task.dependencies) {
      task.dependencies = [];
    }

    // Keep only valid task IDs
    task.dependencies = task.dependencies.filter(depId =>
      tasks.some(t => t.taskId === depId)
    );
  });

  // Calculate task levels (for parallelization)
  const taskLevels = {};
  const visited = new Set();

  function calculateLevel(taskId) {
    if (taskLevels[taskId] !== undefined) {
      return taskLevels[taskId];
    }

    const task = tasks.find(t => t.taskId === taskId);
    if (!task || task.dependencies.length === 0) {
      taskLevels[taskId] = 0;
      return 0;
    }

    const depLevels = task.dependencies.map(depId => calculateLevel(depId));
    taskLevels[taskId] = Math.max(...depLevels) + 1;
    return taskLevels[taskId];
  }

  tasks.forEach(task => calculateLevel(task.taskId));

  tasks.forEach(task => {
    task.level = taskLevels[task.taskId];
  });

  return tasks;
}

/**
 * Main Orchestrator Function
 * 
 * Decomposes a project description into structured tasks
 * 
 * @param {string} description - Project description/requirements
 * @param {Object} constraints - Project constraints { deadline, budget, teamSize, maxHours, etc }
 * @returns {Object} Complete decomposition result
 */
function decomposeProject(description, constraints = {}) {
  // Validate input
  if (!description || typeof description !== 'string') {
    return {
      success: false,
      error: 'Description must be a non-empty string'
    };
  }

  // Step 1: Extract Features
  const features = extractFeatures(description);

  if (features.length === 0) {
    return {
      success: false,
      error: 'No recognized features found in description. Please include keywords like: auth, payment, api, database, etc.'
    };
  }

  // Step 2: Generate Tasks
  let tasks = generateTasks(features, constraints);

  // Step 3: Resolve Dependencies
  tasks = resolveDependencies(tasks);

  // Step 4: Calculate Priorities
  tasks = calculatePriorities(tasks, description);

  // Step 5: Calculate Summary Metrics
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const tasksByCategory = {};
  const tasksByComplexity = {};

  tasks.forEach(task => {
    // Group by category
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = 0;
    }
    tasksByCategory[task.category]++;

    // Group by complexity
    if (!tasksByComplexity[task.complexity]) {
      tasksByComplexity[task.complexity] = 0;
    }
    tasksByComplexity[task.complexity]++;
  });

  return {
    success: true,
    decomposition: {
      description: description,
      features: features,
      tasks: tasks,
      summary: {
        totalTasks: tasks.length,
        totalEstimatedHours: Math.round(totalHours * 10) / 10,
        estimatedDays: Math.round((totalHours / 8) * 10) / 10,
        tasksByCategory: tasksByCategory,
        tasksByComplexity: tasksByComplexity,
        criticalPathLength: Math.max(...tasks.map(t => t.level || 0)) + 1
      },
      constraints: constraints,
      metadata: {
        extractedFeatures: features.length,
        generatedTasks: tasks.length,
        decomposedAt: new Date().toISOString()
      }
    }
  };
}

/**
 * Export all functions
 */
module.exports = {
  decomposeProject,
  extractFeatures,
  generateTasks,
  calculatePriorities,
  resolveDependencies,
  featureKeywords,
  taskTemplates,
  estimationHeuristics
};
