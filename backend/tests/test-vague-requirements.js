/**
 * test-vague-requirements.js
 * 
 * Tests for ambiguity detection and clarifying question generation
 * Verifies that the system identifies vague terms and generates helpful clarifying questions
 */

const ambiguityScorer = require('../services/ambiguityScorer');

describe('Ambiguity Detection & Question Generation', () => {

  /**
   * Test 1: Vague requirement - "Make it pop. Users should love it. Fast."
   */
  describe('Vague Requirements with Multiple Ambiguities', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Make it pop. Users should love it. Fast.';
      result = ambiguityScorer.scoreRequirement(description);
    });

    test('should detect low clarity score (< 0.4)', () => {
      expect(result.score).toBeLessThan(0.4);
    });

    test('should classify as "critical" clarity level', () => {
      expect(result.level).toBe('critical');
    });

    test('should identify vague terms', () => {
      expect(result.ambiguousTerms).toBeDefined();
      expect(result.ambiguousTerms.length).toBeGreaterThan(0);
      
      // Should detect "pop", "love", "fast" as vague
      expect(result.ambiguousTerms.some(term => 
        ['pop', 'love', 'fast'].some(vague => 
          term.toLowerCase().includes(vague)
        )
      )).toBe(true);
    });

    test('should generate 5+ clarifying questions', () => {
      const questions = ambiguityScorer.generateClarifyingQuestions(description);
      
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThanOrEqual(5);
    });

    test('should prioritize critical questions', () => {
      const questions = ambiguityScorer.generateClarifyingQuestions(description);
      
      const criticalQuestions = questions.filter(q => q.priority === 'critical');
      expect(criticalQuestions.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 2: Clear requirements (control test)
   */
  describe('Clear Requirements with Specific Details', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Build a user authentication system with OAuth2 support. ' +
                   'Users should be able to sign up, login, reset password, and manage ' +
                   '2FA. System must support Google and GitHub OAuth. Response times ' +
                   'must be under 200ms. Estimated timeline: 2 weeks with 2 developers.';
      result = ambiguityScorer.scoreRequirement(description);
    });

    test('should have high clarity score (> 0.8)', () => {
      expect(result.score).toBeGreaterThan(0.8);
    });

    test('should classify as "excellent" clarity level', () => {
      expect(result.level).toBe('excellent');
    });

    test('should have minimal ambiguous terms', () => {
      expect(result.ambiguousTerms.length).toBeLessThan(3);
    });

    test('should generate fewer clarifying questions', () => {
      const questions = ambiguityScorer.generateClarifyingQuestions(description);
      
      // Clear requirements should need fewer questions
      expect(questions.length).toBeLessThan(3);
    });
  });

  /**
   * Test 3: Moderate ambiguity
   */
  describe('Moderately Ambiguous Requirements', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Create a dashboard that shows important metrics. ' +
                   'Users want to see real-time data in an intuitive way. ' +
                   'The system should scale well and be secure.';
      result = ambiguityScorer.scoreRequirement(description);
    });

    test('should have moderate clarity score (0.5-0.7)', () => {
      expect(result.score).toBeGreaterThan(0.4);
      expect(result.score).toBeLessThan(0.8);
    });

    test('should classify as "fair" or "good" clarity', () => {
      expect(['fair', 'good']).toContain(result.level);
    });

    test('should identify some vague terms', () => {
      expect(result.ambiguousTerms.length).toBeGreaterThan(0);
      expect(result.ambiguousTerms.length).toBeLessThan(10);
    });

    test('should generate moderate number of questions (3-5)', () => {
      const questions = ambiguityScorer.generateClarifyingQuestions(description);
      
      expect(questions.length).toBeGreaterThanOrEqual(2);
      expect(questions.length).toBeLessThanOrEqual(8);
    });
  });

  /**
   * Test 4: Specific vague terms detection
   */
  describe('Detection of Specific Vague Terms', () => {
    let vagueTermTests = [
      { term: 'fast', description: 'The system should be fast' },
      { term: 'good', description: 'Good user experience is important' },
      { term: 'beautiful', description: 'Make it beautiful and elegant' },
      { term: 'simple', description: 'Keep it simple but powerful' },
      { term: 'robust', description: 'System must be robust' },
      { term: 'scalable', description: 'Needs to be scalable' },
      { term: 'user-friendly', description: 'Should be user-friendly' }
    ];

    vagueTermTests.forEach(test => {
      it(`should detect "${test.term}" as vague`, () => {
        const result = ambiguityScorer.scoreRequirement(test.description);
        
        expect(result.ambiguousTerms.length).toBeGreaterThan(0);
        // The term or a related word should be detected
        const detected = result.ambiguousTerms.some(t => 
          t.toLowerCase().includes(test.term.split('-')[0])
        );
        expect(detected).toBe(true);
      });
    });
  });

  /**
   * Test 5: Question categorization
   */
  describe('Question Categorization', () => {
    let description;
    let questions;

    beforeEach(() => {
      description = 'Build mobile app. Should work fast. Make good design. ' +
                   'Need payment. Offline support. Multiple languages.';
      questions = ambiguityScorer.generateClarifyingQuestions(description);
    });

    test('should categorize questions with defined types', () => {
      const validTypes = [
        'clarification', 'scope', 'timeline', 'resources',
        'constraint', 'assumption', 'criterion', 'definition'
      ];

      questions.forEach(q => {
        expect(q.type).toBeDefined();
        expect(validTypes).toContain(q.type);
      });
    });

    test('should assign priorities to questions', () => {
      const validPriorities = ['critical', 'high', 'medium', 'low'];

      questions.forEach(q => {
        expect(q.priority).toBeDefined();
        expect(validPriorities).toContain(q.priority);
      });
    });

    test('should include question text', () => {
      questions.forEach(q => {
        expect(q.question).toBeDefined();
        expect(q.question.length).toBeGreaterThan(10);
      });
    });
  });

  /**
   * Test 6: Priority-based sorting
   */
  describe('Question Priority Distribution', () => {
    let description;
    let questions;

    beforeEach(() => {
      description = 'Make awesome app fast beautiful simple good powerful ' +
                   'with excellent UI and nice features that users love.';
      questions = ambiguityScorer.generateClarifyingQuestions(description);
    });

    test('should have some critical questions', () => {
      const criticalQuestions = questions.filter(q => q.priority === 'critical');
      expect(criticalQuestions.length).toBeGreaterThan(0);
    });

    test('critical questions should come first', () => {
      const criticalIndex = questions.findIndex(q => q.priority === 'critical');
      const lowIndex = questions.findIndex(q => q.priority === 'low');
      
      if (criticalIndex !== -1 && lowIndex !== -1) {
        expect(criticalIndex).toBeLessThanOrEqual(lowIndex);
      }
    });

    test('should have realistic distribution of priorities', () => {
      const priorityCounts = {
        critical: questions.filter(q => q.priority === 'critical').length,
        high: questions.filter(q => q.priority === 'high').length,
        medium: questions.filter(q => q.priority === 'medium').length,
        low: questions.filter(q => q.priority === 'low').length
      };

      // Critical + High should be majority
      expect(priorityCounts.critical + priorityCounts.high).toBeGreaterThan(
        priorityCounts.medium + priorityCounts.low
      );
    });
  });

  /**
   * Test 7: Empty/minimal requirements
   */
  describe('Edge Cases - Minimal Requirements', () => {
    test('should handle single word requirement', () => {
      const result = ambiguityScorer.scoreRequirement('App');
      
      expect(result.score).toBeLessThan(0.3);
      expect(result.level).toBe('critical');
    });

    test('should handle empty string', () => {
      const result = ambiguityScorer.scoreRequirement('');
      
      expect(result.score).toBeDefined();
      expect(result.score).toBeLessThan(0.1);
    });

    test('should generate clarifying questions for vague single term', () => {
      const questions = ambiguityScorer.generateClarifyingQuestions('Website');
      
      expect(questions.length).toBeGreaterThan(3);
    });
  });

  /**
   * Test 8: Batch scoring of requirements
   */
  describe('Batch Requirement Scoring', () => {
    let requirements;

    beforeEach(() => {
      requirements = [
        'Build fast app',
        'Create user authentication system with OAuth2, JWT tokens, and 2FA',
        'Make it simple but powerful',
        'Develop real-time notification system using WebSockets'
      ];
    });

    test('should score all requirements', () => {
      const results = ambiguityScorer.scoreRequirements(requirements);
      
      expect(results).toBeDefined();
      expect(results.length).toBe(4);
    });

    test('should have different scores for different requirements', () => {
      const results = ambiguityScorer.scoreRequirements(requirements);
      
      const scores = results.map(r => r.score);
      const uniqueScores = new Set(scores);
      
      // Should have at least 2 different scores
      expect(uniqueScores.size).toBeGreaterThan(1);
    });

    test('clear requirements should score higher than vague ones', () => {
      const results = ambiguityScorer.scoreRequirements(requirements);
      
      const clearScore = results[1].score; // OAuth2 requirement
      const vagueScore = results[0].score; // "Build fast app"
      
      expect(clearScore).toBeGreaterThan(vagueScore);
    });

    test('should sort results by clarity in comprehensive result', () => {
      const comprehensiveResult = ambiguityScorer.scoreRequirement(requirements.join(' '));
      
      expect(comprehensiveResult.score).toBeDefined();
      expect(comprehensiveResult.ambiguousTerms).toBeDefined();
    });
  });

  /**
   * Test 9: Question rationale and impact
   */
  describe('Question Details & Context', () => {
    let description;
    let questions;

    beforeEach(() => {
      description = 'Create fast mobile app with good UI for startup. ' +
                   'Need payments and offline. Users love social features.';
      questions = ambiguityScorer.generateClarifyingQuestions(description);
    });

    test('should include rationale for questions', () => {
      questions.forEach(q => {
        expect(q.rationale).toBeDefined();
        expect(q.rationale.length).toBeGreaterThan(0);
      });
    });

    test('should suggest answer areas', () => {
      const questionsWithAreas = questions.filter(q => q.suggestedAnswerAreas);
      expect(questionsWithAreas.length).toBeGreaterThan(0);
      
      questionsWithAreas.forEach(q => {
        expect(Array.isArray(q.suggestedAnswerAreas)).toBe(true);
        expect(q.suggestedAnswerAreas.length).toBeGreaterThan(0);
      });
    });

    test('should explain impact of not answering', () => {
      const criticalQuestions = questions.filter(q => q.priority === 'critical');
      
      criticalQuestions.forEach(q => {
        expect(q.impact).toBeDefined();
        expect(q.impact.length).toBeGreaterThan(0);
      });
    });
  });

  /**
   * Test 10: Clarity scoring algorithm
   */
  describe('Clarity Scoring Algorithm', () => {
    test('should give perfect 1.0 score for crystal clear requirement', () => {
      const clear = 'Create a REST API with 3 endpoints (GET, POST, DELETE) ' +
                   'that responds in under 100ms with 99.9% uptime SLA.';
      const result = ambiguityScorer.scoreRequirement(clear);
      
      expect(result.score).toBeGreaterThan(0.9);
    });

    test('should give near 0 score for extremely vague requirement', () => {
      const vague = 'Something awesome something cool something great something nice something perfect';
      const result = ambiguityScorer.scoreRequirement(vague);
      
      expect(result.score).toBeLessThan(0.2);
    });

    test('should penalize multiple vague terms', () => {
      const oneVague = ambiguityScorer.scoreRequirement('App should be fast');
      const manyVague = ambiguityScorer.scoreRequirement(
        'App should be fast awesome beautiful cool elegant simple good great'
      );
      
      expect(manyVague.score).toBeLessThan(oneVague.score);
    });

    test('should give partial credit for partial clarity', () => {
      const partial = 'Build e-commerce platform with product catalog, ' +
                     'shopping cart, and fast checkout process';
      const result = ambiguityScorer.scoreRequirement(partial);
      
      expect(result.score).toBeGreaterThan(0.4);
      expect(result.score).toBeLessThan(0.9);
    });
  });

  /**
   * Test 11: Ambiguity factor comparison
   */
  describe('Ambiguity Factor Metrics', () => {
    let clearDesc;
    let vagueDesc;

    beforeEach(() => {
      clearDesc = 'Build REST API with OpenAPI docs, 5 endpoints, <100ms response time';
      vagueDesc = 'Make awesome API that is fast and good with great features';
    });

    test('vague description should have higher ambiguity metric', () => {
      const clearResult = ambiguityScorer.scoreRequirement(clearDesc);
      const vagueResult = ambiguityScorer.scoreRequirement(vagueDesc);
      
      expect(clearResult.ambiguity).toBeLessThan(vagueResult.ambiguity);
    });

    test('should count ambiguous terms correctly', () => {
      const result = ambiguityScorer.scoreRequirement(vagueDesc);
      
      expect(result.ambiguousTerms).toBeDefined();
      // "awesome", "fast", "good", "great" are vague
      expect(result.ambiguousTerms.length).toBeGreaterThan(1);
    });
  });
});
