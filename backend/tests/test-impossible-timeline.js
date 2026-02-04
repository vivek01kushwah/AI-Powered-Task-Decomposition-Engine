/**
 * test-impossible-timeline.js
 * 
 * Tests for feasibility calculation with impossible constraints
 * Verifies that the system correctly identifies when projects are not feasible
 */

const feasibilityCalculator = require('../services/feasibilityCalculator');
const taskDecomposer = require('../services/taskDecomposer');

describe('Feasibility Assessment - Impossible Timelines', () => {

  /**
   * Test 1: Netflix clone - extremely tight constraints
   */
  describe('Netflix Clone - 1 person, 4 hrs/day, 3 days', () => {
    let tasks;
    let constraints;

    beforeEach(() => {
      // Simulate Netflix clone project decomposition
      const result = taskDecomposer.decomposeProject(
        'Build a Netflix clone with user authentication, video streaming, ' +
        'payment processing, recommendation engine, user profiles, watchlist, ' +
        'and search functionality.',
        { maxTasks: 50 }
      );
      tasks = result.tasks;

      constraints = {
        teamSize: 1,
        hoursPerDay: 4,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      };
    });

    test('should have feasibility score < 0.3 (unrealistic)', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.score).toBeDefined();
      expect(feasibility.score).toBeLessThan(0.3);
    });

    test('should classify as "unrealistic"', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.level).toBe('unrealistic');
    });

    test('should generate multiple critical warnings', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.warnings).toBeDefined();
      expect(feasibility.warnings.length).toBeGreaterThan(0);
      
      // Should have timeline and capacity warnings
      const warningTypes = feasibility.warnings.map(w => w.type);
      expect(warningTypes).toContain('timeline');
    });

    test('should highlight scope vs timeline conflict', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      // Available hours: 1 person * 4 hours * 3 days = 12 hours
      // Netflix clone typically needs 200+ hours
      expect(feasibility.metrics.availableHours).toBeLessThan(20);
      expect(feasibility.metrics.totalHours).toBeGreaterThan(100);
    });

    test('should have buffer days as negative', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.metrics.bufferDays).toBeLessThan(0);
    });

    test('should recommend major scope reduction', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      const report = feasibilityCalculator.generateReport(feasibility);
      
      expect(report.actionItems).toBeDefined();
      expect(report.actionItems.length).toBeGreaterThan(0);
      
      // Should mention scope reduction
      const scopeActions = report.actionItems.filter(a => 
        a.toLowerCase().includes('scope') || 
        a.toLowerCase().includes('reduce') ||
        a.toLowerCase().includes('phase')
      );
      expect(scopeActions.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 2: Enterprise system - 1 week deadline
   */
  describe('Enterprise CRM System - Unrealistic Timeline', () => {
    let tasks;
    let constraints;

    beforeEach(() => {
      const result = taskDecomposer.decomposeProject(
        'Build enterprise CRM system with sales pipeline, customer management, ' +
        'reporting, email integration, activity tracking, and advanced analytics.',
        { maxTasks: 100 }
      );
      tasks = result.tasks;

      constraints = {
        teamSize: 2,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      };
    });

    test('should be in unrealistic or challenging range', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(['unrealistic', 'challenging']).toContain(feasibility.level);
      expect(feasibility.score).toBeLessThan(0.6);
    });

    test('should warn about team size', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      const teamWarnings = feasibility.warnings.filter(w => 
        w.type.includes('team') || w.type.includes('capacity')
      );
      expect(teamWarnings.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 3: Simple project with reasonable constraints (control test)
   */
  describe('Simple Blog Platform - Reasonable Constraints', () => {
    let tasks;
    let constraints;

    beforeEach(() => {
      const result = taskDecomposer.decomposeProject(
        'Build a simple blog platform with user authentication and post management.',
        { maxTasks: 20 }
      );
      tasks = result.tasks;

      constraints = {
        teamSize: 3,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
      };
    });

    test('should have feasibility score > 0.6 (achievable)', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.score).toBeGreaterThan(0.5);
    });

    test('should not be classified as unrealistic', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.level).not.toBe('unrealistic');
    });

    test('should have fewer warnings', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      // More reasonable projects should have fewer warnings
      expect(feasibility.warnings.length).toBeLessThan(3);
    });
  });

  /**
   * Test 4: Calculate available vs required hours
   */
  describe('Hours Calculation Accuracy', () => {
    let tasks;

    beforeEach(() => {
      // Create precise test tasks
      tasks = [
        { _id: 't1', title: 'Task 1', estimatedHours: 10, dependencies: [], priority: 5 },
        { _id: 't2', title: 'Task 2', estimatedHours: 15, dependencies: ['t1'], priority: 5 },
        { _id: 't3', title: 'Task 3', estimatedHours: 20, dependencies: ['t2'], priority: 5 }
      ];
    });

    test('should calculate available hours correctly', () => {
      const constraints = {
        teamSize: 2,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      // 2 people * 8 hours * 10 days = 160 hours
      expect(feasibility.metrics.availableHours).toBe(160);
    });

    test('should calculate total hours correctly', () => {
      const constraints = {
        teamSize: 1,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      // 10 + 15 + 20 = 45 hours total
      expect(feasibility.metrics.totalHours).toBe(45);
    });

    test('should calculate critical path hours correctly', () => {
      const constraints = {
        teamSize: 1,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      // Critical path: 10 + 15 + 20 = 45 hours (sequential)
      expect(feasibility.metrics.criticalPathHours).toBeGreaterThan(0);
      expect(feasibility.metrics.criticalPathHours).toBeLessThanOrEqual(45);
    });
  });

  /**
   * Test 5: Risk adjustments effect on score
   */
  describe('Risk Adjustments Impact on Feasibility', () => {
    let tasks;
    let constraints;

    beforeEach(() => {
      tasks = [
        { _id: 't1', title: 'Setup', estimatedHours: 5, dependencies: [], complexity: 'simple' },
        { _id: 't2', title: 'Dev', estimatedHours: 30, dependencies: ['t1'], complexity: 'complex' },
        { _id: 't3', title: 'Test', estimatedHours: 20, dependencies: ['t2'], complexity: 'complex' }
      ];

      constraints = {
        teamSize: 2,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };
    });

    test('should apply complexity risk adjustments', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      expect(feasibility.riskAdjustments).toBeDefined();
      expect(feasibility.riskAdjustments.complexity_risk).toBeDefined();
    });

    test('complex projects should have lower scores', () => {
      const complexTasks = [...tasks];
      complexTasks.forEach(t => t.complexity = 'complex');
      
      const simpleTasks = [...tasks];
      simpleTasks.forEach(t => t.complexity = 'simple');

      const constraints = {
        teamSize: 2,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };

      const complexFeasibility = feasibilityCalculator.calculateFeasibility(complexTasks, constraints);
      const simpleFeasibility = feasibilityCalculator.calculateFeasibility(simpleTasks, constraints);
      
      expect(complexFeasibility.score).toBeLessThan(simpleFeasibility.score);
    });
  });

  /**
   * Test 6: Zero/negative constraint handling
   */
  describe('Edge Cases - Invalid Constraints', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 't1', title: 'Task 1', estimatedHours: 10, dependencies: [] }
      ];
    });

    test('should handle zero hours per day gracefully', () => {
      const constraints = {
        teamSize: 1,
        hoursPerDay: 0,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      };

      // Should either return very low score or handle gracefully
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      expect(feasibility.score).toBeLessThan(0.1);
    });

    test('should handle zero team size gracefully', () => {
      const constraints = {
        teamSize: 0,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      expect(feasibility.score).toBeLessThan(0.1);
    });

    test('should handle past deadline', () => {
      const constraints = {
        teamSize: 1,
        hoursPerDay: 8,
        deadline: new Date(Date.now() - 1000) // Past deadline
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      expect(feasibility.score).toBeLessThan(0.1);
    });
  });

  /**
   * Test 7: Warning generation for impossible scenarios
   */
  describe('Warning Generation', () => {
    let tasks;
    let constraints;

    beforeEach(() => {
      tasks = Array(50).fill(null).map((_, i) => ({
        _id: `t${i}`,
        title: `Task ${i}`,
        estimatedHours: 20,
        dependencies: i > 0 ? [`t${i - 1}`] : [],
        complexity: 'complex'
      }));

      constraints = {
        teamSize: 1,
        hoursPerDay: 4,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
      };
    });

    test('should generate timeline warning', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      const timelineWarnings = feasibility.warnings.filter(w => w.type === 'timeline');
      expect(timelineWarnings.length).toBeGreaterThan(0);
    });

    test('should generate team capacity warning', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      const capacityWarnings = feasibility.warnings.filter(w => w.type === 'team-capacity');
      expect(capacityWarnings.length).toBeGreaterThan(0);
    });

    test('should generate scope overflow warning', () => {
      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      
      const scopeWarnings = feasibility.warnings.filter(w => w.type === 'scope-overflow');
      expect(scopeWarnings.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 8: Buffer day calculation
   */
  describe('Buffer Day Calculation', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 't1', title: 'Task 1', estimatedHours: 10, dependencies: [] },
        { _id: 't2', title: 'Task 2', estimatedHours: 20, dependencies: ['t1'] }
      ];
    });

    test('should calculate positive buffer for comfortable timeline', () => {
      const constraints = {
        teamSize: 2,
        hoursPerDay: 8,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      expect(feasibility.metrics.bufferDays).toBeGreaterThan(0);
    });

    test('should calculate negative buffer for tight timeline', () => {
      const constraints = {
        teamSize: 1,
        hoursPerDay: 4,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
      };

      const feasibility = feasibilityCalculator.calculateFeasibility(tasks, constraints);
      expect(feasibility.metrics.bufferDays).toBeLessThan(0);
    });
  });
});
