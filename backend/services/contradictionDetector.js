/**
 * Contradiction Detector Service
 * 
 * Detects logical contradictions in project requirements and constraints.
 * Uses pattern matching and semantic analysis to identify:
 * - Iron Triangle violations (speed, quality, cost trade-offs)
 * - Technical contradictions (e.g., "mobile-first" with heavy desktop features)
 * - Scope contradictions (e.g., "simple" vs "comprehensive")
 * - Resource contradictions (e.g., "low budget" with "enterprise features")
 * 
 * All contradictions include severity scoring and contextual suggestions
 */

/**
 * Keyword Dictionary - Maps opposite/conflicting concepts
 * Each keyword has:
 * - category: type of requirement (scope, performance, quality, budget, etc)
 * - conflicts: array of keywords that contradict this one
 * - severity: base severity when conflict occurs (0-1)
 * - suggestedAlternative: recommendation for resolution
 */
const keywordDictionary = {
  // SCOPE CONTRADICTIONS
  'simple': {
    category: 'scope',
    conflicts: ['comprehensive', 'premium', 'advanced', 'full-featured', 'enterprise'],
    severity: 0.8,
    suggestedAlternative: 'Define MVP vs phase 2 deliverables'
  },
  'quick': {
    category: 'performance/timeline',
    conflicts: ['thorough', 'high-quality', 'premium', 'rigorous-testing', 'comprehensive'],
    severity: 0.85,
    suggestedAlternative: 'Establish phased delivery timeline'
  },
  'fast': {
    category: 'performance/timeline',
    conflicts: ['robust', 'thorough', 'security-hardened', 'comprehensive-testing'],
    severity: 0.85,
    suggestedAlternative: 'Plan iterative delivery with quick MVP first'
  },
  'cheap': {
    category: 'budget',
    conflicts: ['scalable', 'enterprise', 'premium', 'high-performance', 'redundant'],
    severity: 0.9,
    suggestedAlternative: 'Prioritize features by business value'
  },
  'low-budget': {
    category: 'budget',
    conflicts: ['enterprise', 'scalable', 'redundant', 'premium', 'high-performance'],
    severity: 0.9,
    suggestedAlternative: 'Start with MVP, plan for scaling later'
  },

  // QUALITY CONTRADICTIONS
  'high-quality': {
    category: 'quality',
    conflicts: ['quick', 'fast', 'cheap'],
    severity: 0.8,
    suggestedAlternative: 'Define quality standards and timeline separately'
  },
  'premium': {
    category: 'quality/scope',
    conflicts: ['simple', 'quick', 'cheap', 'low-budget'],
    severity: 0.85,
    suggestedAlternative: 'Clarify premium features vs standard features'
  },
  'thorough': {
    category: 'quality/timeline',
    conflicts: ['quick', 'fast', 'cheap'],
    severity: 0.8,
    suggestedAlternative: 'Schedule quality phase separately'
  },

  // SCALABILITY CONTRADICTIONS
  'scalable': {
    category: 'infrastructure',
    conflicts: ['cheap', 'low-budget', 'simple', 'quick'],
    severity: 0.85,
    suggestedAlternative: 'Plan architecture for future scaling'
  },
  'enterprise': {
    category: 'scope/infrastructure',
    conflicts: ['cheap', 'low-budget', 'simple', 'quick'],
    severity: 0.9,
    suggestedAlternative: 'Build enterprise-grade features incrementally'
  },
  'robust': {
    category: 'quality/reliability',
    conflicts: ['quick', 'simple', 'cheap'],
    severity: 0.8,
    suggestedAlternative: 'Implement robustness patterns gradually'
  },

  // TECHNICAL CONTRADICTIONS
  'mobile-first': {
    category: 'platform',
    conflicts: ['desktop-heavy', 'feature-rich', 'complex-ui'],
    severity: 0.75,
    suggestedAlternative: 'Use responsive design, progressive enhancement'
  },
  'desktop-heavy': {
    category: 'platform',
    conflicts: ['mobile-first', 'responsive', 'lightweight'],
    severity: 0.75,
    suggestedAlternative: 'Adopt responsive design framework'
  },
  'lightweight': {
    category: 'performance',
    conflicts: ['feature-rich', 'comprehensive', 'enterprise'],
    severity: 0.7,
    suggestedAlternative: 'Modularize features and lazy-load'
  },
  'feature-rich': {
    category: 'scope',
    conflicts: ['simple', 'lightweight', 'quick'],
    severity: 0.75,
    suggestedAlternative: 'Separate core features from nice-to-haves'
  },

  // SECURITY & PERFORMANCE
  'high-performance': {
    category: 'performance',
    conflicts: ['cheap', 'simple', 'quick'],
    severity: 0.8,
    suggestedAlternative: 'Identify critical performance paths'
  },
  'security-hardened': {
    category: 'security',
    conflicts: ['fast', 'quick', 'simple'],
    severity: 0.85,
    suggestedAlternative: 'Implement security by design, not after'
  },

  // ARCHITECTURE CONTRADICTIONS
  'microservices': {
    category: 'architecture',
    conflicts: ['simple', 'quick', 'cheap', 'monolithic'],
    severity: 0.85,
    suggestedAlternative: 'Start monolithic, migrate to microservices later'
  },
  'monolithic': {
    category: 'architecture',
    conflicts: ['scalable', 'enterprise', 'modular'],
    severity: 0.8,
    suggestedAlternative: 'Design for modularity even in monolith'
  },

  // TESTING CONTRADICTIONS
  'comprehensive-testing': {
    category: 'quality',
    conflicts: ['quick', 'fast', 'cheap'],
    severity: 0.8,
    suggestedAlternative: 'Plan testing phases with risk-based prioritization'
  },
  'rigorous-testing': {
    category: 'quality',
    conflicts: ['quick', 'fast'],
    severity: 0.75,
    suggestedAlternative: 'Automate testing to reduce timeline impact'
  },

  // REDUNDANCY
  'redundant': {
    category: 'infrastructure',
    conflicts: ['cheap', 'simple', 'quick'],
    severity: 0.8,
    suggestedAlternative: 'Plan for high-availability in phases'
  }
};

/**
 * Contradiction Patterns - Define specific conflicting pairs
 * These are explicit patterns that trigger contradictions
 * Format: [keyword1, keyword2, severity, explanation, suggestion]
 */
const contradictionPatterns = [
  // Iron Triangle Violations
  [
    'fast',
    'high-quality',
    0.9,
    'Cannot deliver high-quality work quickly without adequate resources',
    'Choose: speed (MVP) or quality (thorough testing). Or: add budget for more team members'
  ],
  [
    'cheap',
    'premium',
    0.95,
    'Premium features require significant investment to implement and maintain',
    'Either increase budget or reduce scope to core features only'
  ],
  [
    'quick',
    'comprehensive',
    0.88,
    'Comprehensive solutions require substantial development and testing time',
    'Phase the project: MVP first, then add comprehensive features'
  ],

  // Timeline vs Quality
  [
    'fast',
    'security-hardened',
    0.92,
    'Security hardening cannot be rushed without introducing vulnerabilities',
    'Plan security review phase or build security features incrementally'
  ],
  [
    'quick',
    'rigorous-testing',
    0.85,
    'Rigorous testing takes time incompatible with quick delivery',
    'Use automated testing, risk-based testing, or extend timeline'
  ],

  // Budget vs Scale
  [
    'low-budget',
    'scalable',
    0.9,
    'Scalable architecture requires investment in infrastructure and design',
    'Build for current load, refactor for scale when budget allows'
  ],
  [
    'cheap',
    'enterprise',
    0.95,
    'Enterprise solutions require significant investment in features, support, and infrastructure',
    'Focus on SMB features first, plan enterprise features as revenue grows'
  ],

  // Platform Contradictions
  [
    'mobile-first',
    'feature-rich',
    0.75,
    'Feature-rich applications are difficult to implement on mobile platforms',
    'Prioritize essential features for mobile, move complex features to web'
  ],
  [
    'mobile-first',
    'desktop-heavy',
    0.9,
    'Mobile-first and desktop-heavy are opposing design philosophies',
    'Adopt responsive design that works well on both platforms'
  ],

  // Architecture Contradictions
  [
    'microservices',
    'quick',
    0.88,
    'Microservices architecture adds complexity and development overhead',
    'Start with monolith for speed, migrate to microservices when needed'
  ],
  [
    'monolithic',
    'scalable',
    0.8,
    'Monolithic architecture becomes difficult to scale and maintain at enterprise level',
    'Design monolith for modularity, plan for eventual migration'
  ],

  // Tech Stack Contradictions
  [
    'lightweight',
    'comprehensive',
    0.8,
    'Comprehensive features often require heavier frameworks and libraries',
    'Choose appropriate framework for feature scope'
  ],
  [
    'simple',
    'high-performance',
    0.75,
    'Achieving high performance often requires complex optimization techniques',
    'Identify performance-critical paths and optimize selectively'
  ],

  // Delivery Method Contradictions
  [
    'quick',
    'comprehensive-testing',
    0.85,
    'Comprehensive testing requires significant time and resources',
    'Plan testing phase after quick MVP delivery'
  ],
  [
    'cheap',
    'high-performance',
    0.85,
    'High-performance optimization requires investment in infrastructure and specialized expertise',
    'Use cost-effective optimization techniques or increase budget'
  ],

  // Scope vs Timeline
  [
    'feature-rich',
    'quick',
    0.85,
    'Delivering many features quickly requires substantial team capacity',
    'Reduce feature scope or extend timeline'
  ],
  [
    'premium',
    'quick',
    0.9,
    'Premium implementation quality requires careful design and testing time',
    'Either extend timeline or reduce quality expectations'
  ],

  // Additional Contradictions
  [
    'simple',
    'enterprise',
    0.9,
    'Enterprise solutions require complexity in features, security, and scalability',
    'Focus on core enterprise features, phase additional capabilities'
  ],
  [
    'low-budget',
    'redundant',
    0.92,
    'Redundancy (high availability) requires significant infrastructure investment',
    'Plan for single-point failure tolerance, add redundancy when budget allows'
  ],
  [
    'quick',
    'modular',
    0.7,
    'Modular architecture adds initial design complexity but enables faster future changes',
    'Accept slightly longer initial timeline for faster modifications later'
  ]
];

/**
 * ALGORITHM: Pattern-Based Contradiction Detection
 * 
 * Steps:
 * 1. Extract keywords from description and constraints (case-insensitive)
 * 2. Check for direct keyword-to-keyword contradictions
 * 3. Check for pattern-based contradictions
 * 4. Calculate severity for each contradiction
 * 5. Generate contextual suggestions
 * 6. Return sorted by severity (highest first)
 * 
 * Time Complexity: O(n * m) where n = keywords found, m = pattern definitions
 * 
 * @param {string} description - Project description/requirements text
 * @param {Object} constraints - Project constraints object
 * @returns {Array} Array of contradiction objects sorted by severity
 */
function detectContradictions(description = '', constraints = {}) {
  const contradictions = [];
  
  // Combine description and constraints into searchable text
  const combinedText = [
    description || '',
    Object.values(constraints)
      .map(v => typeof v === 'string' ? v : JSON.stringify(v))
      .join(' ')
  ].join(' ').toLowerCase();

  // Extract keywords found in text
  const foundKeywords = Object.keys(keywordDictionary).filter(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );

  if (foundKeywords.length === 0) {
    return {
      contradictions: [],
      summary: {
        totalContradictions: 0,
        severity: 'none',
        hasCritical: false
      }
    };
  }

  // Check for direct keyword contradictions
  for (let i = 0; i < foundKeywords.length; i++) {
    for (let j = i + 1; j < foundKeywords.length; j++) {
      const keyword1 = foundKeywords[i];
      const keyword2 = foundKeywords[j];
      const keywordData1 = keywordDictionary[keyword1];
      const keywordData2 = keywordDictionary[keyword2];

      // Check if these keywords conflict
      if (keywordData1.conflicts.includes(keyword2) || 
          keywordData2.conflicts.includes(keyword1)) {
        
        // Calculate severity as average of both keywords' base severities
        const baseSeverity = (keywordData1.severity + keywordData2.severity) / 2;
        
        contradictions.push({
          type: 'keyword-contradiction',
          keywords: [keyword1, keyword2],
          category: [keywordData1.category, keywordData2.category],
          severity: baseSeverity,
          description: `"${keyword1}" conflicts with "${keyword2}"`,
          suggestion: keywordData1.suggestedAlternative || keywordData2.suggestedAlternative,
          reasoning: `${keyword1} is a ${keywordData1.category} requirement that conflicts with ${keyword2} (${keywordData2.category})`
        });
      }
    }
  }

  // Check for explicit contradiction patterns
  contradictionPatterns.forEach(pattern => {
    const [keyword1, keyword2, severity, explanation, suggestion] = pattern;
    const keyword1Found = foundKeywords.includes(keyword1);
    const keyword2Found = foundKeywords.includes(keyword2);

    if (keyword1Found && keyword2Found) {
      contradictions.push({
        type: 'pattern-contradiction',
        keywords: [keyword1, keyword2],
        severity: severity,
        description: explanation,
        suggestion: suggestion,
        reasoning: 'Pattern-based contradiction detected from project requirements'
      });
    }
  });

  // Remove duplicates and sort by severity
  const uniqueContradictions = Array.from(
    new Map(
      contradictions.map(c => [
        [c.keywords[0], c.keywords[1]].sort().join('-'),
        c
      ])
    ).values()
  );

  uniqueContradictions.sort((a, b) => b.severity - a.severity);

  // Calculate summary statistics
  const criticalCount = uniqueContradictions.filter(c => c.severity >= 0.85).length;
  const warningCount = uniqueContradictions.filter(c => c.severity >= 0.7 && c.severity < 0.85).length;
  const infoCount = uniqueContradictions.filter(c => c.severity < 0.7).length;

  const maxSeverity = uniqueContradictions.length > 0 
    ? uniqueContradictions[0].severity 
    : 0;

  let overallSeverity = 'none';
  if (maxSeverity >= 0.85) overallSeverity = 'critical';
  else if (maxSeverity >= 0.7) overallSeverity = 'warning';
  else if (maxSeverity > 0) overallSeverity = 'info';

  return {
    contradictions: uniqueContradictions,
    keywords: {
      found: foundKeywords,
      count: foundKeywords.length
    },
    summary: {
      totalContradictions: uniqueContradictions.length,
      criticalCount: criticalCount,
      warningCount: warningCount,
      infoCount: infoCount,
      severity: overallSeverity,
      hasCritical: criticalCount > 0,
      averageSeverity: uniqueContradictions.length > 0
        ? (uniqueContradictions.reduce((sum, c) => sum + c.severity, 0) / uniqueContradictions.length).toFixed(2)
        : 0
    }
  };
}

/**
 * Generate detailed contradiction report for stakeholder review
 * Includes recommendations prioritized by severity
 * 
 * @param {string} description - Project description
 * @param {Object} constraints - Project constraints
 * @returns {Object} Detailed report with analysis
 */
function generateReport(description = '', constraints = {}) {
  const analysis = detectContradictions(description, constraints);

  if (analysis.summary.totalContradictions === 0) {
    return {
      status: 'pass',
      message: 'No significant contradictions detected',
      recommendations: []
    };
  }

  const recommendations = analysis.contradictions.map((contradiction, index) => ({
    priority: index + 1,
    severity: contradiction.severity,
    severityLevel: contradiction.severity >= 0.85 ? 'CRITICAL' : 
                   contradiction.severity >= 0.7 ? 'WARNING' : 'INFO',
    contradiction: contradiction.description,
    reasoning: contradiction.reasoning,
    recommendation: contradiction.suggestion,
    affectedKeywords: contradiction.keywords
  }));

  return {
    status: analysis.summary.hasCritical ? 'fail' : 'warning',
    summary: analysis.summary,
    keywords: analysis.keywords,
    recommendations: recommendations,
    resolutionPriority: {
      critical: recommendations.filter(r => r.severityLevel === 'CRITICAL'),
      warnings: recommendations.filter(r => r.severityLevel === 'WARNING'),
      info: recommendations.filter(r => r.severityLevel === 'INFO')
    }
  };
}

/**
 * Get specific contradiction context and resolution strategies
 * 
 * @param {string} keyword1 - First keyword
 * @param {string} keyword2 - Second keyword
 * @returns {Object} Detailed context and strategies
 */
function getResolutionStrategies(keyword1, keyword2) {
  const pattern = contradictionPatterns.find(p => 
    (p[0] === keyword1 && p[1] === keyword2) ||
    (p[0] === keyword2 && p[1] === keyword1)
  );

  if (!pattern) {
    return {
      found: false,
      message: 'No specific resolution strategy found'
    };
  }

  const [kw1, kw2, severity, explanation, suggestion] = pattern;
  
  return {
    found: true,
    contradiction: explanation,
    severity: severity,
    primarySuggestion: suggestion,
    strategies: generateStrategies(kw1, kw2, severity),
    tradeoffs: analyzeTradeoffs(kw1, kw2)
  };
}

/**
 * Generate multiple resolution strategies for a contradiction
 * 
 * @private
 * @param {string} keyword1 - First keyword
 * @param {string} keyword2 - Second keyword
 * @param {number} severity - Severity level (0-1)
 * @returns {Array} Array of resolution strategies
 */
function generateStrategies(keyword1, keyword2, severity) {
  const strategies = [];

  // General strategies based on keyword categories
  const data1 = keywordDictionary[keyword1];
  const data2 = keywordDictionary[keyword2];

  if (data1.category === 'timeline' || data2.category === 'timeline') {
    strategies.push({
      name: 'Phased Delivery',
      description: 'Break project into phases to address both timeline and quality concerns',
      effort: 'medium'
    });
  }

  if (data1.category === 'budget' || data2.category === 'budget') {
    strategies.push({
      name: 'Prioritization Matrix',
      description: 'Use MoSCoW method to prioritize features, defer nice-to-haves',
      effort: 'low'
    });
    strategies.push({
      name: 'Budget Reallocation',
      description: 'Increase budget or reduce scope to resolve budget conflicts',
      effort: 'medium'
    });
  }

  if (data1.category === 'scope' || data2.category === 'scope') {
    strategies.push({
      name: 'Scope Definition',
      description: 'Clearly define MVP vs nice-to-have features',
      effort: 'low'
    });
    strategies.push({
      name: 'Feature Gates',
      description: 'Implement feature flags to enable features progressively',
      effort: 'medium'
    });
  }

  if (data1.category === 'infrastructure' || data2.category === 'infrastructure') {
    strategies.push({
      name: 'Incremental Architecture',
      description: 'Start simple, evolve architecture as needs grow',
      effort: 'medium'
    });
  }

  if (data1.category === 'quality' || data2.category === 'quality') {
    strategies.push({
      name: 'Quality Tiers',
      description: 'Define acceptable quality levels for MVP vs release',
      effort: 'low'
    });
    strategies.push({
      name: 'Automated Testing',
      description: 'Invest in automated testing to reduce manual QA time',
      effort: 'medium'
    });
  }

  return strategies;
}

/**
 * Analyze trade-offs between two keywords
 * 
 * @private
 * @param {string} keyword1 - First keyword
 * @param {string} keyword2 - Second keyword
 * @returns {Array} Trade-off options
 */
function analyzeTradeoffs(keyword1, keyword2) {
  return [
    {
      option: `Prioritize "${keyword1}"`,
      implies: `De-prioritize "${keyword2}"`,
      risk: 'May miss important aspects of ' + keyword2,
      scenario: 'Use when ' + keyword1 + ' is critical business requirement'
    },
    {
      option: `Prioritize "${keyword2}"`,
      implies: `De-prioritize "${keyword1}"`,
      risk: 'May miss important aspects of ' + keyword1,
      scenario: 'Use when ' + keyword2 + ' is critical business requirement'
    },
    {
      option: 'Balance Both (Hybrid)',
      implies: 'Extend timeline or increase budget',
      risk: 'More resources required, slower decision making',
      scenario: 'Use when both requirements are equally important'
    }
  ];
}

/**
 * Export all functions
 */
module.exports = {
  detectContradictions,
  generateReport,
  getResolutionStrategies,
  keywordDictionary,
  contradictionPatterns
};
