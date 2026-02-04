/**
 * Ambiguity Scorer Service
 * 
 * Evaluates requirement clarity and identifies ambiguous language.
 * Provides actionable scoring and clarifying questions to improve specifications.
 * 
 * Ambiguity Categories:
 * 1. Vague Qualifiers - adjectives without measurable definition
 * 2. Missing Metrics - concepts without numbers or units
 * 3. Subjective Terms - beauty, intuitiveness, user experience (no universal definition)
 * 4. Unclear Scope - imprecise language about what, when, or how much
 */

/**
 * Vague Qualifiers Pattern Library
 * Words that sound descriptive but lack measurable criteria
 */
const vagueQualifiers = {
  'fast': {
    category: 'performance',
    severity: 0.8,
    metrics: ['response time (ms)', 'load time (seconds)', 'throughput (req/sec)'],
    question: 'What is the target response time in milliseconds?'
  },
  'slow': {
    category: 'performance',
    severity: 0.8,
    metrics: ['acceptable latency (ms)', 'timeout threshold (sec)'],
    question: 'What is the maximum acceptable latency?'
  },
  'quick': {
    category: 'timeline',
    severity: 0.75,
    metrics: ['hours', 'days', 'weeks'],
    question: 'How many hours/days/weeks is "quick"?'
  },
  'good': {
    category: 'quality',
    severity: 0.85,
    metrics: ['test coverage %', 'defect rate', 'quality metrics'],
    question: 'What quality metrics define "good" (test coverage, defect rate, etc)?'
  },
  'nice': {
    category: 'quality',
    severity: 0.85,
    metrics: ['acceptance criteria', 'quality standards'],
    question: 'What are the specific requirements for this "nice" feature?'
  },
  'user-friendly': {
    category: 'usability',
    severity: 0.8,
    metrics: ['task completion rate', 'learning curve (hours)', 'SUS score'],
    question: 'How will you measure "user-friendliness"? (task completion time, learning curve?)'
  },
  'intuitive': {
    category: 'usability',
    severity: 0.85,
    metrics: ['user test results', 'cognitive load measurement'],
    question: 'What does "intuitive" mean for this interface? Provide target user personas'
  },
  'beautiful': {
    category: 'aesthetics',
    severity: 0.9,
    metrics: ['design mockups', 'style guide', 'reference designs'],
    question: 'What design style or examples represent "beautiful" for your project?'
  },
  'modern': {
    category: 'aesthetics',
    severity: 0.8,
    metrics: ['design trends', 'competitor analysis', 'reference designs'],
    question: 'What design trends or examples define "modern" for your domain?'
  },
  'simple': {
    category: 'complexity',
    severity: 0.75,
    metrics: ['feature count', 'UI elements', 'learning time'],
    question: 'What should be simplified? (features, interface, documentation?)'
  },
  'complex': {
    category: 'complexity',
    severity: 0.75,
    metrics: ['feature list', 'integration points', 'supported scenarios'],
    question: 'What specific complexity is required? Please detail all features needed'
  },
  'robust': {
    category: 'reliability',
    severity: 0.8,
    metrics: ['uptime %', 'mean time between failures', 'error recovery time'],
    question: 'What uptime % or reliability target defines "robust"?'
  },
  'scalable': {
    category: 'performance',
    severity: 0.8,
    metrics: ['max users', 'data volume', 'growth rate'],
    question: 'How many users/transactions/data volume must it scale to?'
  },
  'performant': {
    category: 'performance',
    severity: 0.8,
    metrics: ['response time', 'throughput', 'resource usage'],
    question: 'What are the specific performance requirements (latency, throughput)?'
  },
  'reliable': {
    category: 'reliability',
    severity: 0.8,
    metrics: ['uptime %', 'error rate', 'MTBF'],
    question: 'What uptime percentage or MTBF (mean time between failures) is required?'
  },
  'secure': {
    category: 'security',
    severity: 0.85,
    metrics: ['encryption standards', 'authentication methods', 'penetration testing'],
    question: 'What specific security standards or compliance requirements (e.g., OWASP, ISO)?'
  },
  'accessible': {
    category: 'accessibility',
    severity: 0.75,
    metrics: ['WCAG level', 'screen reader compatibility', 'keyboard navigation'],
    question: 'What accessibility standard (WCAG 2.1 Level AA)? Target user capabilities?'
  },
  'comprehensive': {
    category: 'scope',
    severity: 0.75,
    metrics: ['feature list', 'supported scenarios', 'edge cases'],
    question: 'What specific features or scenarios must be included?'
  },
  'thorough': {
    category: 'quality',
    severity: 0.75,
    metrics: ['test coverage', 'review checklist', 'validation criteria'],
    question: 'What defines thorough testing or review (coverage %, test count)?'
  },
  'premium': {
    category: 'quality/aesthetics',
    severity: 0.8,
    metrics: ['design quality', 'feature set', 'performance targets'],
    question: 'What premium features or quality standards are expected?'
  },
  'seamless': {
    category: 'integration',
    severity: 0.8,
    metrics: ['response time', 'data consistency', 'error rates'],
    question: 'What metrics define seamless integration (latency, error rate)?'
  },
  'smooth': {
    category: 'usability',
    severity: 0.75,
    metrics: ['animation fps', 'scroll smoothness', 'frame rate'],
    question: 'What animation/performance targets define smooth (fps, latency)?'
  }
};

/**
 * Subjective Terms - concepts with no universal definition
 */
const subjectiveTerms = {
  'beautiful': {
    category: 'aesthetics',
    severity: 0.95,
    impact: 'high',
    requires: 'visual mockups, design reference, style guide'
  },
  'elegant': {
    category: 'aesthetics',
    severity: 0.9,
    impact: 'medium',
    requires: 'code style examples, design patterns'
  },
  'intuitive': {
    category: 'usability',
    severity: 0.9,
    impact: 'high',
    requires: 'user testing, personas, interaction examples'
  },
  'natural': {
    category: 'usability',
    severity: 0.85,
    impact: 'high',
    requires: 'user behavior research, UX testing'
  },
  'professional': {
    category: 'aesthetics/quality',
    severity: 0.8,
    impact: 'medium',
    requires: 'quality standards, examples, maturity metrics'
  },
  'friendly': {
    category: 'usability',
    severity: 0.8,
    impact: 'medium',
    requires: 'tone guidelines, example interactions'
  },
  'epic': {
    category: 'scope/quality',
    severity: 0.85,
    impact: 'medium',
    requires: 'feature list, success metrics'
  },
  'awesome': {
    category: 'quality',
    severity: 0.9,
    impact: 'medium',
    requires: 'specific quality criteria'
  },
  'cool': {
    category: 'aesthetics',
    severity: 0.85,
    impact: 'low',
    requires: 'examples, reference designs'
  },
  'slick': {
    category: 'aesthetics',
    severity: 0.8,
    impact: 'low',
    requires: 'design mockups'
  },
  'trendy': {
    category: 'aesthetics',
    severity: 0.8,
    impact: 'low',
    requires: 'trend analysis, examples'
  }
};

/**
 * Unclear Scope Patterns - imprecise language about deliverables
 */
const unclearScopePatterns = [
  {
    pattern: /handle\s+(this|that|various|different)/gi,
    severity: 0.8,
    category: 'scope',
    issue: 'Unspecified scope - "handle" is too vague',
    question: 'Specifically, what scenarios or cases must be handled?'
  },
  {
    pattern: /work\s+(well|properly|correctly|fine)/gi,
    severity: 0.75,
    category: 'quality',
    issue: 'Undefined success criteria - "work well" is vague',
    question: 'How will you measure if it "works well"? (tests, metrics?)'
  },
  {
    pattern: /support\s+(everything|all|various)/gi,
    severity: 0.8,
    category: 'scope',
    issue: 'Unbounded scope - "support everything" is unlimited',
    question: 'What specifically needs to be supported? (list required scenarios)'
  },
  {
    pattern: /able\s+to\s+(\w+)/gi,
    severity: 0.7,
    category: 'scope',
    issue: 'Functional requirement without acceptance criteria',
    question: 'Beyond being able to X, what level of performance/quality is needed?'
  },
  {
    pattern: /make\s+(sure|certain|clear)/gi,
    severity: 0.75,
    category: 'quality',
    issue: 'Vague quality assurance requirement',
    question: 'How will you verify this? (tests, reviews, metrics?)'
  },
  {
    pattern: /ensure\s+(\w+)\s+(works|functions)/gi,
    severity: 0.7,
    category: 'quality',
    issue: 'Undefined acceptance criteria',
    question: 'What tests or validation will prove this works?'
  },
  {
    pattern: /etc\.?|and\s+so\s+on|like|such as/gi,
    severity: 0.8,
    category: 'scope',
    issue: 'Incomplete list - implies more undefined items',
    question: 'Please provide the complete list without "etc" or "such as"'
  }
];

/**
 * Conditional/Modal Language - suggests uncertainty
 */
const modalLanguage = {
  'should': { severity: 0.65, type: 'soft-requirement' },
  'may': { severity: 0.75, type: 'uncertain' },
  'might': { severity: 0.75, type: 'uncertain' },
  'could': { severity: 0.7, type: 'uncertain' },
  'possibly': { severity: 0.8, type: 'uncertain' },
  'maybe': { severity: 0.85, type: 'uncertain' },
  'if possible': { severity: 0.8, type: 'uncertain' },
  'ideally': { severity: 0.75, type: 'wishful' },
  'hopefully': { severity: 0.8, type: 'wishful' },
  'appears': { severity: 0.7, type: 'uncertain' },
  'seems': { severity: 0.75, type: 'uncertain' },
  'probably': { severity: 0.8, type: 'uncertain' }
};

/**
 * ALGORITHM 1: Score Requirement Clarity
 * 
 * Scoring approach:
 * 1. Baseline score starts at 1.0 (perfectly clear)
 * 2. For each ambiguity found, subtract severity factor
 * 3. Positive signals (numbers, metrics) add to clarity
 * 4. Final score normalized to 0-1 range
 * 
 * Score interpretation:
 * 0.9-1.0: Excellent (actionable, specific)
 * 0.7-0.9: Good (mostly clear, minor clarifications needed)
 * 0.5-0.7: Fair (needs significant clarification)
 * 0.2-0.5: Poor (highly ambiguous, major rework needed)
 * 0.0-0.2: Critical (unusable as specification)
 * 
 * @param {string} text - The requirement text to score
 * @returns {Object} Detailed clarity analysis with score and issues
 */
function scoreRequirement(text) {
  if (!text || typeof text !== 'string') {
    return {
      score: 0,
      level: 'critical',
      error: 'Invalid input - expected non-empty string'
    };
  }

  const lowerText = text.toLowerCase();
  let clarityScore = 1.0;
  const issues = [];
  const positives = [];

  // DETRACTION 1: Check for vague qualifiers
  Object.entries(vagueQualifiers).forEach(([term, data]) => {
    if (lowerText.includes(term)) {
      const deduction = data.severity * 0.08; // Each vague term reduces score by 5-8%
      clarityScore -= deduction;
      issues.push({
        type: 'vague-qualifier',
        term: term,
        severity: data.severity,
        suggestedMetrics: data.metrics,
        question: data.question,
        deduction: deduction.toFixed(3)
      });
    }
  });

  // DETRACTION 2: Check for subjective terms
  Object.entries(subjectiveTerms).forEach(([term, data]) => {
    if (lowerText.includes(term)) {
      const deduction = data.severity * 0.08;
      clarityScore -= deduction;
      issues.push({
        type: 'subjective-term',
        term: term,
        severity: data.severity,
        requires: data.requires,
        question: `Define what "${term}" means for this project`,
        deduction: deduction.toFixed(3)
      });
    }
  });

  // DETRACTION 3: Check for unclear scope patterns
  unclearScopePatterns.forEach(patternObj => {
    const matches = text.match(patternObj.pattern);
    if (matches) {
      matches.forEach(match => {
        const deduction = patternObj.severity * 0.08;
        clarityScore -= deduction;
        issues.push({
          type: 'unclear-scope',
          matched: match,
          severity: patternObj.severity,
          issue: patternObj.issue,
          question: patternObj.question,
          deduction: deduction.toFixed(3)
        });
      });
    }
  });

  // DETRACTION 4: Check for modal language (uncertainty)
  Object.entries(modalLanguage).forEach(([term, data]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(match => {
        const deduction = data.severity * 0.05;
        clarityScore -= deduction;
        issues.push({
          type: 'modal-language',
          term: term,
          severity: data.severity,
          modalType: data.type,
          advice: `Replace with definitive language (must, will, shall)`,
          deduction: deduction.toFixed(3)
        });
      });
    }
  });

  // ADDITION 1: Check for measurable criteria (numbers, metrics)
  const numberPatterns = [
    /\d+\s*(seconds?|ms|milliseconds?|minutes?|hours?|days?|weeks?|months?)/gi,
    /\d+\s*(%|percent|percentage)/gi,
    /\d+\s*(users?|requests?|concurrent|simultaneous)/gi,
    /\d+\s*(gb?|mb?|kb?|bytes?)/gi,
    /(sla|uptime|availability|coverage|throughput|latency|response\s+time)[\s:]*\d+/gi,
    /(must|will|shall|require|required)\s+\w+/gi
  ];

  let metricsFound = 0;
  numberPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      metricsFound += matches.length;
      positives.push({
        type: 'measurable-criteria',
        example: matches[0]
      });
    }
  });

  // Add points for clear metrics (up to +0.15)
  const metricsBonus = Math.min(metricsFound * 0.02, 0.15);
  clarityScore += metricsBonus;

  // ADDITION 2: Check for definitive language
  const definitiveTerms = ['must', 'will', 'shall', 'required', 'mandatory'];
  let definitiveCount = 0;
  definitiveTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      definitiveCount += matches.length;
    }
  });

  if (definitiveCount > 0) {
    const definitiveBonus = Math.min(definitiveCount * 0.01, 0.1);
    clarityScore += definitiveBonus;
    positives.push({
      type: 'definitive-language',
      count: definitiveCount,
      bonus: definitiveBonus.toFixed(3)
    });
  }

  // Normalize score to 0-1 range
  clarityScore = Math.max(0, Math.min(1, clarityScore));

  // Determine clarity level
  let clarityLevel = 'critical';
  if (clarityScore >= 0.9) clarityLevel = 'excellent';
  else if (clarityScore >= 0.7) clarityLevel = 'good';
  else if (clarityScore >= 0.5) clarityLevel = 'fair';
  else if (clarityScore >= 0.2) clarityLevel = 'poor';

  return {
    score: Math.round(clarityScore * 100) / 100,
    level: clarityLevel,
    issues: {
      total: issues.length,
      byType: {
        vagueQualifiers: issues.filter(i => i.type === 'vague-qualifier').length,
        subjectiveTerms: issues.filter(i => i.type === 'subjective-term').length,
        unclearScope: issues.filter(i => i.type === 'unclear-scope').length,
        modalLanguage: issues.filter(i => i.type === 'modal-language').length
      },
      details: issues.sort((a, b) => parseFloat(b.deduction) - parseFloat(a.deduction))
    },
    positives: {
      total: positives.length,
      details: positives
    },
    recommendation: getRecommendation(clarityScore),
    text: text
  };
}

/**
 * ALGORITHM 2: Generate Clarifying Questions
 * 
 * Process:
 * 1. Score the requirement to identify ambiguities
 * 2. Extract issue details and generate targeted questions
 * 3. Prioritize questions by impact (critical issues first)
 * 4. Group questions by category (scope, metrics, quality, etc)
 * 5. Return ordered, actionable questions
 * 
 * @param {string} description - Project description with ambiguous requirements
 * @returns {Object} Organized clarifying questions with impact prioritization
 */
function generateClarifyingQuestions(description) {
  const analysis = scoreRequirement(description);
  const questions = [];
  const questionsAsked = new Set(); // Prevent duplicates

  // Generate questions from identified issues
  analysis.issues.details.forEach(issue => {
    if (!questionsAsked.has(issue.question)) {
      questionsAsked.add(issue.question);
      questions.push({
        priority: 'high',
        category: issue.category || issue.type,
        severity: parseFloat(issue.deduction),
        question: issue.question,
        context: `Found "${issue.term || issue.matched}" in requirements`,
        impact: 'Clarifying this will reduce project misalignment'
      });
    }
  });

  // Additional contextual questions based on score
  if (analysis.score < 0.5) {
    questions.push({
      priority: 'critical',
      category: 'scope',
      severity: 1.0,
      question: 'What are the 5 most critical success criteria for this project?',
      context: 'Overall requirement clarity is low',
      impact: 'Establishes baseline understanding of project goals'
    });
  }

  if (analysis.issues.details.some(i => i.type === 'unclear-scope')) {
    questions.push({
      priority: 'critical',
      category: 'scope',
      severity: 0.95,
      question: 'What is the minimum viable feature set (MVP)?',
      context: 'Scope appears unbounded or unclear',
      impact: 'Prevents scope creep and enables better planning'
    });
  }

  if (analysis.issues.details.some(i => i.type === 'subjective-term')) {
    questions.push({
      priority: 'high',
      category: 'acceptance-criteria',
      severity: 0.9,
      question: 'Can you provide 3-5 reference examples or mockups for subjective goals?',
      context: 'Project has subjective terms needing definition',
      impact: 'Visual examples eliminate subjective interpretation'
    });
  }

  if (analysis.issues.total > 5) {
    questions.push({
      priority: 'critical',
      category: 'general',
      severity: 0.95,
      question: 'Can you rewrite the requirements using specific numbers, dates, or measurable criteria?',
      context: 'Multiple ambiguities detected',
      impact: 'Concrete specifications enable accurate estimation and planning'
    });
  }

  // Sort by priority and severity
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  questions.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.severity - a.severity;
  });

  // Group by category
  const grouped = {};
  questions.forEach(q => {
    if (!grouped[q.category]) {
      grouped[q.category] = [];
    }
    grouped[q.category].push(q);
  });

  return {
    requirementScore: analysis.score,
    requirementLevel: analysis.level,
    totalQuestions: questions.length,
    questions: questions,
    byCategory: grouped,
    summary: {
      critical: questions.filter(q => q.priority === 'critical').length,
      high: questions.filter(q => q.priority === 'high').length,
      medium: questions.filter(q => q.priority === 'medium').length
    }
  };
}

/**
 * Generate recommendation based on clarity score
 * 
 * @private
 * @param {number} score - Clarity score (0-1)
 * @returns {Object} Actionable recommendation
 */
function getRecommendation(score) {
  if (score >= 0.9) {
    return {
      action: 'PROCEED',
      message: 'Requirements are clear and actionable',
      effort: 'minimal clarification needed'
    };
  } else if (score >= 0.7) {
    return {
      action: 'CLARIFY_MINOR',
      message: 'Good specifications with minor ambiguities',
      effort: 'Address highlighted issues before development'
    };
  } else if (score >= 0.5) {
    return {
      action: 'CLARIFY_SIGNIFICANT',
      message: 'Significant ambiguities present',
      effort: 'Substantial clarification needed; address questions before estimation'
    };
  } else if (score >= 0.2) {
    return {
      action: 'REWORK_REQUIRED',
      message: 'Highly ambiguous specifications',
      effort: 'Major rework required; risk of project failure without clarification'
    };
  } else {
    return {
      action: 'REJECT',
      message: 'Specifications unusable in current state',
      effort: 'Complete specification rewrite required before proceeding'
    };
  }
}

/**
 * Batch score multiple requirements
 * Useful for analyzing entire project description
 * 
 * @param {Array} requirements - Array of requirement strings
 * @returns {Object} Summary statistics and individual scores
 */
function scoreRequirements(requirements) {
  if (!Array.isArray(requirements)) {
    return {
      error: 'Expected array of requirements'
    };
  }

  const scores = requirements.map((req, idx) => ({
    index: idx,
    text: req,
    ...scoreRequirement(req)
  }));

  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const totalIssues = scores.reduce((sum, s) => sum + s.issues.total, 0);

  return {
    count: requirements.length,
    averageScore: Math.round(avgScore * 100) / 100,
    averageLevel: avgScore >= 0.9 ? 'excellent' : 
                  avgScore >= 0.7 ? 'good' :
                  avgScore >= 0.5 ? 'fair' :
                  avgScore >= 0.2 ? 'poor' : 'critical',
    totalIssues: totalIssues,
    scores: scores
  };
}

/**
 * Export all functions
 */
module.exports = {
  scoreRequirement,
  generateClarifyingQuestions,
  scoreRequirements,
  vagueQualifiers,
  subjectiveTerms,
  unclearScopePatterns,
  modalLanguage
};
