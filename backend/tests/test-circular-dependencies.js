/**
 * test-circular-dependencies.js
 * 
 * Tests for circular dependency detection and resolution
 * Verifies that the system can identify and break circular dependency chains
 */

const dependencyGraphService = require('../services/dependencyGraphService');

describe('Circular Dependency Detection & Resolution', () => {
  
  /**
   * Test 1: Simple 3-node cycle (A→B→C→A)
   */
  describe('Simple Circular Chain (A→B→C→A)', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        {
          _id: 'task-a',
          title: 'Database Setup',
          estimatedHours: 10,
          dependencies: ['task-c']  // A depends on C
        },
        {
          _id: 'task-b',
          title: 'API Development',
          estimatedHours: 20,
          dependencies: ['task-a']  // B depends on A
        },
        {
          _id: 'task-c',
          title: 'Authentication',
          estimatedHours: 15,
          dependencies: ['task-b']  // C depends on B (creates cycle)
        }
      ];
    });

    test('should detect circular dependency', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result).toBeDefined();
      expect(result.hasCycles).toBe(true);
      expect(result.chains).toBeDefined();
      expect(result.chains.length).toBeGreaterThan(0);
    });

    test('should identify all tasks in cycle', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const cycleTaskIds = result.chains[0];
      
      expect(cycleTaskIds).toContain('task-a');
      expect(cycleTaskIds).toContain('task-b');
      expect(cycleTaskIds).toContain('task-c');
      expect(cycleTaskIds.length).toBe(3);
    });

    test('should break circular dependency', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const chainToBreak = result.chains[0];
      
      const fixedTasks = dependencyGraphService.breakCircularDependency(tasks, chainToBreak);
      
      // Verify fixed tasks are returned
      expect(fixedTasks).toBeDefined();
      expect(fixedTasks.length).toBe(3);
      
      // Verify no cycles remain
      const checkResult = dependencyGraphService.detectCircularDependencies(fixedTasks);
      expect(checkResult.hasCycles).toBe(false);
    });

    test('should remove weakest link from cycle', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const chainToBreak = result.chains[0];
      
      const fixedTasks = dependencyGraphService.breakCircularDependency(tasks, chainToBreak);
      
      // At least one task should have dependencies removed
      const dependencyCounts = fixedTasks.map(t => (t.dependencies || []).length);
      const originalCounts = tasks.map(t => (t.dependencies || []).length);
      
      expect(dependencyCounts.some((count, idx) => count < originalCounts[idx])).toBe(true);
    });
  });

  /**
   * Test 2: Complex cycle (4+ node cycle)
   */
  describe('Complex Circular Chain (A→B→C→D→A)', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 'frontend', title: 'Frontend', estimatedHours: 30, dependencies: ['api'] },
        { _id: 'api', title: 'API', estimatedHours: 20, dependencies: ['database'] },
        { _id: 'database', title: 'Database', estimatedHours: 15, dependencies: ['auth'] },
        { _id: 'auth', title: 'Authentication', estimatedHours: 10, dependencies: ['frontend'] }
      ];
    });

    test('should detect 4-node cycle', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result.hasCycles).toBe(true);
      expect(result.chains[0].length).toBe(4);
    });

    test('should break 4-node cycle completely', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const fixedTasks = dependencyGraphService.breakCircularDependency(tasks, result.chains[0]);
      
      const verifyResult = dependencyGraphService.detectCircularDependencies(fixedTasks);
      expect(verifyResult.hasCycles).toBe(false);
    });
  });

  /**
   * Test 3: Multiple cycles
   */
  describe('Multiple Circular Chains', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 'a', title: 'A', estimatedHours: 5, dependencies: ['b'] },
        { _id: 'b', title: 'B', estimatedHours: 5, dependencies: ['a'] },
        { _id: 'c', title: 'C', estimatedHours: 5, dependencies: ['d'] },
        { _id: 'd', title: 'D', estimatedHours: 5, dependencies: ['c'] }
      ];
    });

    test('should detect both cycles', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result.hasCycles).toBe(true);
      expect(result.chains.length).toBeGreaterThanOrEqual(2);
    });

    test('should resolve both cycles', () => {
      let result = dependencyGraphService.detectCircularDependencies(tasks);
      let fixedTasks = [...tasks];
      
      // Break each cycle
      for (const chain of result.chains) {
        fixedTasks = dependencyGraphService.breakCircularDependency(fixedTasks, chain);
      }
      
      // Verify no cycles remain
      const verifyResult = dependencyGraphService.detectCircularDependencies(fixedTasks);
      expect(verifyResult.hasCycles).toBe(false);
    });
  });

  /**
   * Test 4: No cycles
   */
  describe('Acyclic Graph (No Cycles)', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 'setup', title: 'Setup', estimatedHours: 5, dependencies: [] },
        { _id: 'db', title: 'Database', estimatedHours: 10, dependencies: ['setup'] },
        { _id: 'api', title: 'API', estimatedHours: 20, dependencies: ['db'] },
        { _id: 'frontend', title: 'Frontend', estimatedHours: 30, dependencies: ['api'] }
      ];
    });

    test('should return no cycles for acyclic graph', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result.hasCycles).toBe(false);
      expect(result.chains.length).toBe(0);
    });
  });

  /**
   * Test 5: Self-referencing task
   */
  describe('Self-Referencing Task (A→A)', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 'task-a', title: 'Task A', estimatedHours: 10, dependencies: ['task-a'] }
      ];
    });

    test('should detect self-referencing task as cycle', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result.hasCycles).toBe(true);
      expect(result.chains[0]).toContain('task-a');
    });

    test('should remove self-reference', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const fixedTasks = dependencyGraphService.breakCircularDependency(tasks, result.chains[0]);
      
      const fixedTask = fixedTasks.find(t => t._id === 'task-a');
      expect(fixedTask.dependencies).not.toContain('task-a');
    });
  });

  /**
   * Test 6: Cycle with missing task reference
   */
  describe('Cycle with Invalid References', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        { _id: 'task-a', title: 'Task A', estimatedHours: 10, dependencies: ['task-nonexistent'] },
        { _id: 'task-b', title: 'Task B', estimatedHours: 15, dependencies: [] }
      ];
    });

    test('should handle invalid dependency references gracefully', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      
      expect(result).toBeDefined();
      // No cycle since task-nonexistent doesn't exist to create cycle
      expect(result.hasCycles).toBe(false);
    });
  });

  /**
   * Test 7: Large graph performance
   */
  describe('Large Dependency Graph Performance', () => {
    let tasks;

    beforeEach(() => {
      // Create 100 tasks in a chain
      tasks = [];
      for (let i = 0; i < 100; i++) {
        tasks.push({
          _id: `task-${i}`,
          title: `Task ${i}`,
          estimatedHours: 5,
          dependencies: i > 0 ? [`task-${i - 1}`] : []
        });
      }
      // Add cycle at end
      tasks[99].dependencies.push('task-0');
    });

    test('should detect cycle in large graph within reasonable time', () => {
      const startTime = Date.now();
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const endTime = Date.now();
      
      expect(result.hasCycles).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in <1s
    });
  });

  /**
   * Test 8: Cycle breaking preserves task metadata
   */
  describe('Preserve Task Metadata During Cycle Breaking', () => {
    let tasks;

    beforeEach(() => {
      tasks = [
        {
          _id: 'task-a',
          title: 'Database Setup',
          description: 'Set up the database',
          estimatedHours: 10,
          category: 'database',
          skills: ['sql', 'devops'],
          dependencies: ['task-b']
        },
        {
          _id: 'task-b',
          title: 'API Development',
          description: 'Develop API layer',
          estimatedHours: 20,
          category: 'backend',
          skills: ['nodejs', 'express'],
          dependencies: ['task-a']
        }
      ];
    });

    test('should preserve all task fields after breaking cycle', () => {
      const result = dependencyGraphService.detectCircularDependencies(tasks);
      const fixedTasks = dependencyGraphService.breakCircularDependency(tasks, result.chains[0]);
      
      const fixedTaskA = fixedTasks.find(t => t._id === 'task-a');
      
      expect(fixedTaskA.title).toBe('Database Setup');
      expect(fixedTaskA.description).toBe('Set up the database');
      expect(fixedTaskA.estimatedHours).toBe(10);
      expect(fixedTaskA.category).toBe('database');
      expect(fixedTaskA.skills).toEqual(['sql', 'devops']);
    });
  });
});
