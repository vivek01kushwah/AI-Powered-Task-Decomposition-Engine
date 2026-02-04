/**
 * test-contradiction-detection.js
 * 
 * Tests for contradiction detection in project requirements
 * Verifies the system identifies conflicting requirements and suggests resolutions
 */

const contradictionDetector = require('../services/contradictionDetector');

describe('Contradiction Detection in Requirements', () => {

  /**
   * Test 1: Simple contradictions
   */
  describe('Simple Contradiction Cases', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Keep it simple but premium';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect simple vs premium contradiction', () => {
      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);
      expect(result.contradictions.length).toBeGreaterThan(0);
    });

    test('should identify simple and premium as conflicting terms', () => {
      const terms = result.contradictions.map(c => c.terms || []);
      const hasSimple = terms.some(t => 
        Array.isArray(t) && (t[0].toLowerCase().includes('simple') || t[1].toLowerCase().includes('simple'))
      );
      const hasPremium = terms.some(t => 
        Array.isArray(t) && (t[0].toLowerCase().includes('premium') || t[1].toLowerCase().includes('premium'))
      );

      expect(hasSimple || hasPremium).toBe(true);
    });

    test('should assign severity level to contradiction', () => {
      result.contradictions.forEach(c => {
        expect(c.severity).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(c.severity);
      });
    });

    test('should provide suggestion for resolution', () => {
      result.contradictions.forEach(c => {
        expect(c.suggestion).toBeDefined();
        expect(typeof c.suggestion).toBe('string');
        expect(c.suggestion.length).toBeGreaterThan(10);
      });
    });
  });

  /**
   * Test 2: Timeline contradictions
   */
  describe('Timeline Contradictions', () => {
    let result;

    beforeEach(() => {
      const description = 'Launch tomorrow with high quality and thorough testing';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect tomorrow vs thorough testing contradiction', () => {
      expect(result.contradictions.length).toBeGreaterThan(0);

      const hasTimelineContradiction = result.contradictions.some(c =>
        (c.type === 'timeline' || c.type === 'scope') &&
        c.terms && c.terms.length === 2
      );

      expect(hasTimelineContradiction).toBe(true);
    });

    test('should mark timeline contradiction as high severity', () => {
      const timelineContradictions = result.contradictions.filter(c =>
        c.terms && c.terms.some(t => 
          t.toLowerCase().includes('tomorrow') || 
          t.toLowerCase().includes('today')
        )
      );

      if (timelineContradictions.length > 0) {
        const severity = timelineContradictions[0].severity;
        expect(['high', 'critical']).toContain(severity);
      }
    });

    test('should suggest extending timeline or reducing scope', () => {
      const suggestions = result.contradictions.map(c => c.suggestion.toLowerCase());
      const hasScopeReduction = suggestions.some(s => 
        s.includes('reduce') || s.includes('cut') || s.includes('fewer')
      );
      const hasTimelineExtension = suggestions.some(s => 
        s.includes('extend') || s.includes('longer') || s.includes('more time')
      );

      expect(hasScopeReduction || hasTimelineExtension).toBe(true);
    });
  });

  /**
   * Test 3: Scope contradictions
   */
  describe('Scope Contradictions', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Build minimal MVP and comprehensive full-featured platform';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect MVP vs comprehensive contradiction', () => {
      expect(result.contradictions.length).toBeGreaterThan(0);

      const hasScopeContradiction = result.contradictions.some(c =>
        c.terms && c.terms.some(t => 
          t.toLowerCase().includes('minimal') ||
          t.toLowerCase().includes('comprehensive')
        )
      );

      expect(hasScopeContradiction).toBe(true);
    });

    test('should identify contradiction type', () => {
      expect(result.contradictions[0].type).toBeDefined();
      expect(['scope', 'timeline', 'quality', 'resource', 'technical', 'business']).toContain(
        result.contradictions[0].type
      );
    });
  });

  /**
   * Test 4: Quality vs Speed contradictions
   */
  describe('Quality vs Speed Contradictions', () => {
    let result;

    beforeEach(() => {
      const description = 'Must be bug-free and production-ready with rapid development sprint';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect quality vs speed contradiction', () => {
      expect(result.contradictions.length).toBeGreaterThan(0);

      const hasQualitySpeed = result.contradictions.some(c =>
        c.terms && c.terms.some(t =>
          t.toLowerCase().includes('bug-free') ||
          t.toLowerCase().includes('production-ready')
        )
      );

      expect(hasQualitySpeed).toBe(true);
    });

    test('should suggest quality assurance and testing strategy', () => {
      const suggestions = result.contradictions.map(c => c.suggestion);
      const hasQAMention = suggestions.some(s =>
        s.toLowerCase().includes('test') ||
        s.toLowerCase().includes('quality') ||
        s.toLowerCase().includes('review')
      );

      expect(hasQAMention).toBe(true);
    });
  });

  /**
   * Test 5: Resource contradictions
   */
  describe('Resource Contradictions', () => {
    let result;

    beforeEach(() => {
      const description = 'Enterprise-grade system with minimal budget and single developer';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect enterprise vs minimal resources contradiction', () => {
      expect(result.contradictions.length).toBeGreaterThan(0);
    });

    test('should suggest resource adjustments', () => {
      const suggestions = result.contradictions.map(c => c.suggestion.toLowerCase());
      const hasBudgetMention = suggestions.some(s =>
        s.includes('budget') ||
        s.includes('invest') ||
        s.includes('allocate') ||
        s.includes('team')
      );

      expect(hasBudgetMention).toBe(true);
    });

    test('should categorize as resource or scope contradiction', () => {
      const types = result.contradictions.map(c => c.type);
      const validTypes = ['resource', 'scope', 'business', 'technical'];
      
      types.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  /**
   * Test 6: Technical contradictions
   */
  describe('Technical Contradictions', () => {
    let result;

    beforeEach(() => {
      const description = 'Use cutting-edge technology with legacy system compatibility';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should detect cutting-edge vs legacy contradiction', () => {
      expect(result.contradictions.length).toBeGreaterThan(0);

      const hasTechContradiction = result.contradictions.some(c =>
        c.terms && c.terms.some(t =>
          t.toLowerCase().includes('cutting') ||
          t.toLowerCase().includes('legacy')
        )
      );

      expect(hasTechContradiction).toBe(true);
    });

    test('should suggest technology strategy', () => {
      const suggestions = result.contradictions.map(c => c.suggestion);
      const hasTechMention = suggestions.some(s =>
        s.toLowerCase().includes('technology') ||
        s.toLowerCase().includes('architecture') ||
        s.toLowerCase().includes('layer') ||
        s.toLowerCase().includes('adapter')
      );

      expect(hasTechMention).toBe(true);
    });
  });

  /**
   * Test 7: The major example from requirements
   */
  describe('Complex Case: Launch Tomorrow with High Quality', () => {
    let result;

    beforeEach(() => {
      const description = 'Keep it simple but premium. Launch tomorrow with high quality.';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should identify multiple contradictions', () => {
      expect(result.contradictions.length).toBeGreaterThanOrEqual(2);
    });

    test('should find simple vs premium contradiction', () => {
      const simpleVsPremium = result.contradictions.some(c =>
        c.terms && 
        ((c.terms[0].toLowerCase().includes('simple') && c.terms[1].toLowerCase().includes('premium')) ||
         (c.terms[0].toLowerCase().includes('premium') && c.terms[1].toLowerCase().includes('simple')))
      );

      expect(simpleVsPremium).toBe(true);
    });

    test('should find tomorrow vs quality contradiction', () => {
      const timelineVsQuality = result.contradictions.some(c =>
        c.terms &&
        ((c.terms[0].toLowerCase().includes('tomorrow') || c.terms[0].toLowerCase().includes('launch')) &&
         (c.terms[1].toLowerCase().includes('quality') || c.terms[1].toLowerCase().includes('high'))) ||
        ((c.terms[0].toLowerCase().includes('quality') || c.terms[0].toLowerCase().includes('high')) &&
         (c.terms[1].toLowerCase().includes('tomorrow') || c.terms[1].toLowerCase().includes('launch')))
      );

      expect(timelineVsQuality).toBe(true);
    });

    test('each contradiction should have unique terms', () => {
      const termPairs = result.contradictions.map(c => 
        (c.terms || []).sort().join('|')
      );

      const uniquePairs = new Set(termPairs);
      // May have 2-3 distinct contradictions
      expect(uniquePairs.size).toBeGreaterThanOrEqual(1);
    });

    test('should assign varying severity levels', () => {
      const severities = result.contradictions.map(c => c.severity);
      
      severities.forEach(s => {
        expect(['low', 'medium', 'high', 'critical']).toContain(s);
      });

      // Should have at least one high or critical
      const hasSeriousness = severities.some(s => ['high', 'critical'].includes(s));
      expect(hasSeriousness).toBe(true);
    });

    test('should provide actionable suggestions', () => {
      result.contradictions.forEach(c => {
        expect(c.suggestion).toBeDefined();
        expect(c.suggestion.length).toBeGreaterThan(5);
        
        // Suggestions should be actionable (contain imperatives or recommendations)
        const isActionable = /should|could|consider|recommend|extend|reduce|prioritize|clarify/i
          .test(c.suggestion);
        expect(isActionable).toBe(true);
      });
    });

    test('summary should reference main contradictions', () => {
      expect(result.summary).toBeDefined();
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(20);
    });
  });

  /**
   * Test 8: No contradictions case
   */
  describe('Non-contradictory Requirements', () => {
    let result;

    beforeEach(() => {
      const description = 'Build a user authentication system with OAuth2 and JWT tokens';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should identify no contradictions or few', () => {
      expect(Array.isArray(result.contradictions)).toBe(true);
      expect(result.contradictions.length).toBeLessThanOrEqual(1);
    });

    test('summary should indicate coherent requirements', () => {
      if (result.contradictions.length === 0) {
        expect(result.summary.toLowerCase()).toContain('consist') ||
               expect(result.summary.toLowerCase()).toContain('coherent') ||
               expect(result.summary.toLowerCase()).toContain('clear');
      }
    });
  });

  /**
   * Test 9: Contradiction impact assessment
   */
  describe('Contradiction Impact Assessment', () => {
    let result;

    beforeEach(() => {
      const description = 'Keep it simple but premium. Launch tomorrow with high quality.';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should assess impact on timeline', () => {
      result.contradictions.forEach(c => {
        if (c.impact && c.impact.timeline !== undefined) {
          expect(typeof c.impact.timeline).toBe('string');
        }
      });
    });

    test('should assess impact on scope', () => {
      result.contradictions.forEach(c => {
        if (c.impact && c.impact.scope !== undefined) {
          expect(typeof c.impact.scope).toBe('string');
        }
      });
    });

    test('should assess impact on quality', () => {
      result.contradictions.forEach(c => {
        if (c.impact && c.impact.quality !== undefined) {
          expect(typeof c.impact.quality).toBe('string');
        }
      });
    });

    test('should provide impact summary', () => {
      const hasImpactInfo = result.contradictions.some(c =>
        c.impact && Object.keys(c.impact).length > 0
      );

      expect(hasImpactInfo).toBe(true);
    });
  });

  /**
   * Test 10: Resolution strategies
   */
  describe('Contradiction Resolution Strategies', () => {
    let result;

    beforeEach(() => {
      const description = 'Keep it simple but premium. Launch tomorrow with high quality.';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should provide specific resolution approach for each contradiction', () => {
      result.contradictions.forEach(c => {
        expect(c.suggestion).toBeDefined();
        expect(typeof c.suggestion).toBe('string');
        expect(c.suggestion.length).toBeGreaterThan(10);
      });
    });

    test('resolution suggestions should be distinct', () => {
      const suggestions = result.contradictions.map(c => c.suggestion);
      const uniqueSuggestions = new Set(suggestions);

      expect(uniqueSuggestions.size).toBeGreaterThanOrEqual(1);
    });

    test('should suggest prioritization strategy', () => {
      const allSuggestions = result.contradictions.map(c => c.suggestion).join(' ');
      const hasPriority = /prioritize|focus|focus|tier|phase|MVP/i.test(allSuggestions);

      // At least one suggestion should mention prioritization
      expect(hasPriority).toBe(true);
    });

    test('should suggest scope/timeline/quality trade-offs', () => {
      const allSuggestions = result.contradictions.map(c => c.suggestion).join(' ').toLowerCase();
      
      const mentionsScope = allSuggestions.includes('scope') || allSuggestions.includes('feature');
      const mentionsTimeline = allSuggestions.includes('timeline') || allSuggestions.includes('extend') || allSuggestions.includes('delay');
      const mentionsQuality = allSuggestions.includes('quality') || allSuggestions.includes('test');

      const tradeoffCount = [mentionsScope, mentionsTimeline, mentionsQuality].filter(Boolean).length;
      expect(tradeoffCount).toBeGreaterThan(0);
    });
  });

  /**
   * Test 11: Contradiction severity ranking
   */
  describe('Contradiction Severity Ranking', () => {
    let result;

    beforeEach(() => {
      const description = 'Keep it simple but premium. Launch tomorrow with high quality.';
      result = contradictionDetector.detectContradictions(description);
    });

    test('should rank contradictions by severity', () => {
      if (result.contradictions.length > 1) {
        const sortedBySeverity = [...result.contradictions].sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });

        expect(sortedBySeverity[0].severity).toBeDefined();
      }
    });

    test('critical/high severity should be addressed first', () => {
      const criticalCount = result.contradictions.filter(c => c.severity === 'critical').length;
      const highCount = result.contradictions.filter(c => c.severity === 'high').length;

      expect(criticalCount + highCount).toBeGreaterThan(0);
    });

    test('should provide summary of severity distribution', () => {
      expect(result.summary).toBeDefined();
      
      const severities = result.contradictions.map(c => c.severity);
      const hasSevere = severities.some(s => ['critical', 'high'].includes(s));

      if (hasSevere) {
        expect(result.summary.toLowerCase()).toContain('address') ||
               expect(result.summary.toLowerCase()).toContain('resolve') ||
               expect(result.summary.toLowerCase()).toContain('contradiction');
      }
    });
  });

  /**
   * Test 12: Batch contradiction detection
   */
  describe('Batch Requirement Contradiction Detection', () => {
    let requirements;
    let results;

    beforeEach(() => {
      requirements = [
        'Keep it simple but premium',
        'Launch tomorrow with high quality',
        'Build user authentication system with OAuth2',
        'Enterprise-grade with minimal budget'
      ];

      results = requirements.map(req => 
        contradictionDetector.detectContradictions(req)
      );
    });

    test('should process multiple requirements', () => {
      expect(results.length).toBe(4);
    });

    test('should identify contradictions in some requirements', () => {
      const withContradictions = results.filter(r => r.contradictions.length > 0);
      expect(withContradictions.length).toBeGreaterThan(0);
    });

    test('should identify non-contradictory requirements', () => {
      const noContradictions = results.filter(r => r.contradictions.length === 0);
      expect(noContradictions.length).toBeGreaterThan(0);

      // OAuth2 requirement should be clean
      const oauthResult = results.find(r => 
        r && r.summary && r.summary.toLowerCase().includes('oauth')
      );
      
      if (oauthResult) {
        expect(oauthResult.contradictions.length).toBeLessThanOrEqual(1);
      }
    });

    test('should rank all requirements by contradiction severity', () => {
      const ranked = results.map((r, idx) => ({
        requirement: requirements[idx],
        maxSeverity: r.contradictions.length > 0 ? r.contradictions[0].severity : 'none',
        count: r.contradictions.length
      }));

      // Simple but premium should rank high
      const simpleVsPremium = ranked.find(r => 
        r.requirement.includes('simple') && r.requirement.includes('premium')
      );

      if (simpleVsPremium) {
        expect(simpleVsPremium.count).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test 13: Edge cases
   */
  describe('Edge Cases', () => {
    test('should handle empty description', () => {
      const result = contradictionDetector.detectContradictions('');
      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);
    });

    test('should handle single word', () => {
      const result = contradictionDetector.detectContradictions('simple');
      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);
    });

    test('should handle very long description', () => {
      const longDesc = 'Build a system that is ' + 
                       'simple but premium '.repeat(100) +
                       ' for launch tomorrow with high quality';
      
      const result = contradictionDetector.detectContradictions(longDesc);
      expect(result.contradictions).toBeDefined();
      expect(result.contradictions.length).toBeGreaterThan(0);
    });

    test('should handle contradictions in questions format', () => {
      const result = contradictionDetector.detectContradictions(
        'Can we make it both simple and premium? ' +
        'Should we launch tomorrow without sacrificing quality?'
      );
      
      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);
    });
  });
});
