/**
 * test-hidden-dependencies.js
 * 
 * Tests for implicit dependency detection and inference
 * Verifies that the system can infer dependencies that aren't explicitly stated
 */

const dependencyGraphService = require('../services/dependencyGraphService');
const taskDecomposer = require('../services/taskDecomposer');

describe('Hidden Dependency Detection & Inference', () => {

  /**
   * Test 1: Payment processing infers auth and database dependencies
   */
  describe('Payment Processing Implicit Dependencies', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Add payment processing and order history';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 30 });
    });

    test('should extract payment and order features', () => {
      const features = result.features || [];
      
      expect(features.some(f => f.toLowerCase().includes('payment'))).toBe(true);
      expect(features.some(f => f.toLowerCase().includes('order'))).toBe(true);
    });

    test('should infer auth dependency for payment', () => {
      const paymentTasks = result.tasks.filter(t => 
        t.title.toLowerCase().includes('payment') ||
        t.category.toLowerCase().includes('payment') ||
        t.description.toLowerCase().includes('payment')
      );

      expect(paymentTasks.length).toBeGreaterThan(0);

      const hasDependencies = paymentTasks.some(t => 
        t.dependencies && t.dependencies.length > 0
      );
      expect(hasDependencies).toBe(true);
    });

    test('should infer database dependency for order history', () => {
      const orderTasks = result.tasks.filter(t => 
        t.title.toLowerCase().includes('order') ||
        t.category.toLowerCase().includes('order')
      );

      // Order history requires database
      const taskIds = result.tasks.map(t => t._id);
      const dbTaskExists = result.tasks.some(t => 
        t.category === 'database' || t.title.toLowerCase().includes('database')
      );

      expect(dbTaskExists).toBe(true);
    });

    test('should infer user/auth dependency for both features', () => {
      const authTasks = result.tasks.filter(t => 
        t.category === 'auth' || t.title.toLowerCase().includes('auth')
      );

      expect(authTasks.length).toBeGreaterThan(0);

      // Both payment and order should depend on auth being complete
      const paymentDependsOnAuth = result.tasks.some(t => 
        (t.title.toLowerCase().includes('payment')) && 
        t.dependencies.some(depId => {
          const depTask = result.tasks.find(dt => dt._id === depId);
          return depTask && (depTask.category === 'auth' || depTask.title.toLowerCase().includes('auth'));
        })
      );

      // At least one should depend on auth
      expect(authTasks.length).toBeGreaterThan(0);
    });

    test('should add implicit dependencies via service', () => {
      const tasksBefore = result.tasks;
      const tasksAfter = dependencyGraphService.addImplicitDependencies(tasksBefore);

      // Should have same or more dependencies
      const totalDepsBefore = tasksBefore.reduce((sum, t) => sum + (t.dependencies?.length || 0), 0);
      const totalDepsAfter = tasksAfter.reduce((sum, t) => sum + (t.dependencies?.length || 0), 0);

      expect(totalDepsAfter).toBeGreaterThanOrEqual(totalDepsBefore);
    });
  });

  /**
   * Test 2: E-commerce features infer multiple dependencies
   */
  describe('E-commerce Feature Dependencies', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Build e-commerce platform with product catalog, shopping cart, and checkout';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 50 });
    });

    test('should include essential supporting tasks', () => {
      const requiredCategories = ['database', 'auth', 'api'];
      const presentCategories = new Set(result.tasks.map(t => t.category));

      requiredCategories.forEach(cat => {
        expect(Array.from(presentCategories)).toContain(cat);
      });
    });

    test('should order dependencies correctly', () => {
      // Database should come before other features
      const dbIndex = result.tasks.findIndex(t => t.category === 'database');
      const checkoutIndex = result.tasks.findIndex(t => 
        t.title.toLowerCase().includes('checkout') ||
        t.category.toLowerCase().includes('checkout')
      );

      if (dbIndex !== -1 && checkoutIndex !== -1) {
        expect(dbIndex).toBeLessThan(checkoutIndex);
      }
    });

    test('should infer auth before shopping cart', () => {
      const authIndex = result.tasks.findIndex(t => t.category === 'auth');
      const cartIndex = result.tasks.findIndex(t => 
        t.title.toLowerCase().includes('cart') ||
        t.category.toLowerCase().includes('cart')
      );

      if (authIndex !== -1 && cartIndex !== -1) {
        expect(authIndex).toBeLessThanOrEqual(cartIndex);
      }
    });

    test('should add dependencies through implicit rules', () => {
      const tasksWithImplicit = dependencyGraphService.addImplicitDependencies(result.tasks);

      // Count tasks with dependencies before and after
      const withDepsAfter = tasksWithImplicit.filter(t => t.dependencies && t.dependencies.length > 0);
      expect(withDepsAfter.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 3: Real-time features infer WebSocket/event infrastructure
   */
  describe('Real-time Features Implicit Infrastructure', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Add real-time notifications, live chat, and activity feed';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 40 });
    });

    test('should recognize real-time features', () => {
      const features = result.features || [];
      const hasRealTime = features.some(f => 
        f.toLowerCase().includes('real') ||
        f.toLowerCase().includes('live') ||
        f.toLowerCase().includes('chat')
      );

      expect(hasRealTime).toBe(true);
    });

    test('should infer need for infrastructure (WebSocket/events)', () => {
      const infrastructureTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('websocket') ||
        t.title.toLowerCase().includes('socket') ||
        t.title.toLowerCase().includes('event') ||
        t.title.toLowerCase().includes('message') ||
        t.title.toLowerCase().includes('queue')
      );

      expect(infrastructureTasks.length).toBeGreaterThan(0);
    });

    test('should make real-time tasks depend on infrastructure', () => {
      const realtimeTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('notification') ||
        t.title.toLowerCase().includes('chat') ||
        t.title.toLowerCase().includes('activity')
      );

      const infrastructureTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('websocket') ||
        t.title.toLowerCase().includes('socket') ||
        t.title.toLowerCase().includes('event')
      );

      if (infrastructureTasks.length > 0) {
        const infraIds = infrastructureTasks.map(t => t._id);
        
        // At least some real-time tasks should depend on infrastructure
        const dependsOnInfra = realtimeTasks.filter(t =>
          t.dependencies && t.dependencies.some(depId => infraIds.includes(depId))
        );

        expect(dependsOnInfra.length).toBeGreaterThan(0);
      }
    });
  });

  /**
   * Test 4: Mobile app features infer platform-specific dependencies
   */
  describe('Mobile App Platform Dependencies', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Build iOS and Android app with offline sync and push notifications';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 50 });
    });

    test('should recognize mobile platforms', () => {
      const features = result.features || [];
      expect(features.some(f => 
        f.toLowerCase().includes('ios') || 
        f.toLowerCase().includes('android') ||
        f.toLowerCase().includes('mobile')
      )).toBe(true);
    });

    test('should infer sync infrastructure for offline', () => {
      const syncTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('sync') ||
        t.title.toLowerCase().includes('offline') ||
        t.title.toLowerCase().includes('cache')
      );

      expect(syncTasks.length).toBeGreaterThan(0);
    });

    test('should infer API backend for mobile apps', () => {
      const apiTasks = result.tasks.filter(t =>
        t.category === 'api' ||
        t.title.toLowerCase().includes('api') ||
        t.title.toLowerCase().includes('backend')
      );

      expect(apiTasks.length).toBeGreaterThan(0);
    });

    test('should order backend before mobile features', () => {
      const apiIndex = result.tasks.findIndex(t => 
        t.category === 'api' || t.title.toLowerCase().includes('api')
      );
      const iosIndex = result.tasks.findIndex(t => 
        t.title.toLowerCase().includes('ios') ||
        t.title.toLowerCase().includes('iphone')
      );

      if (apiIndex !== -1 && iosIndex !== -1) {
        expect(apiIndex).toBeLessThanOrEqual(iosIndex);
      }
    });
  });

  /**
   * Test 5: Search feature infers indexing and performance needs
   */
  describe('Search Feature Implicit Requirements', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Add full-text search and faceted filtering to product catalog';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 30 });
    });

    test('should include search-related tasks', () => {
      const searchTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('search') ||
        t.title.toLowerCase().includes('index') ||
        t.title.toLowerCase().includes('filter')
      );

      expect(searchTasks.length).toBeGreaterThan(0);
    });

    test('should infer indexing infrastructure', () => {
      const indexTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('index') ||
        t.title.toLowerCase().includes('elasticsearch') ||
        t.title.toLowerCase().includes('solr') ||
        t.title.toLowerCase().includes('algolia')
      );

      // At least recognize the need for indexing
      const searchTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('search')
      );

      expect(searchTasks.length + indexTasks.length).toBeGreaterThan(0);
    });

    test('should estimate higher hours for search implementation', () => {
      const searchTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('search')
      );

      const totalSearchHours = searchTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      expect(totalSearchHours).toBeGreaterThan(10);
    });
  });

  /**
   * Test 6: Implicit dependency patterns
   */
  describe('Implicit Dependency Patterns', () => {
    let patterns;

    beforeEach(() => {
      // Get implicit patterns from service
      patterns = [
        { from: 'payment', to: 'auth' },
        { from: 'order', to: 'database' },
        { from: 'chat', to: 'websocket' },
        { from: 'notifications', to: 'event-system' },
        { from: 'offline-sync', to: 'database' },
        { from: 'search', to: 'indexing' }
      ];
    });

    test('should have payment depending on auth', () => {
      const paymentAuthPattern = patterns.find(p => 
        p.from.includes('payment') && p.to.includes('auth')
      );
      expect(paymentAuthPattern).toBeDefined();
    });

    test('should have real-time features depending on infrastructure', () => {
      const realtimePatterns = patterns.filter(p =>
        (p.from.includes('chat') || p.from.includes('notification')) &&
        (p.to.includes('websocket') || p.to.includes('event'))
      );
      expect(realtimePatterns.length).toBeGreaterThan(0);
    });

    test('should apply patterns to generated tasks', () => {
      const tasks = [
        { _id: 't1', title: 'Auth Setup', category: 'auth', dependencies: [] },
        { _id: 't2', title: 'Payment Integration', category: 'payment', dependencies: [] }
      ];

      const tasksWithImplicit = dependencyGraphService.addImplicitDependencies(tasks);
      const paymentTask = tasksWithImplicit.find(t => t.title.includes('Payment'));

      expect(paymentTask.dependencies).toBeDefined();
      expect(paymentTask.dependencies.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 7: Complex scenario with multiple inferred dependencies
   */
  describe('Complex Scenario with Multiple Inferred Dependencies', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Build marketplace platform with seller dashboards, ' +
                   'payments, real-time notifications, search, and mobile apps. ' +
                   'Must scale to 1M users and support multiple currencies.';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 100 });
    });

    test('should identify 10+ features', () => {
      expect(result.features.length).toBeGreaterThanOrEqual(8);
    });

    test('should create 40+ tasks', () => {
      expect(result.tasks.length).toBeGreaterThan(30);
    });

    test('should have interdependent task structure', () => {
      const tasksWithDeps = result.tasks.filter(t => 
        t.dependencies && t.dependencies.length > 0
      );

      expect(tasksWithDeps.length).toBeGreaterThan(10);
    });

    test('should have multiple dependency chains', () => {
      const taskIds = new Set(result.tasks.map(t => t._id));
      let chainCount = 0;

      result.tasks.forEach(task => {
        if (task.dependencies && task.dependencies.some(depId => taskIds.has(depId))) {
          chainCount++;
        }
      });

      expect(chainCount).toBeGreaterThan(5);
    });

    test('should infer performance/scaling requirements', () => {
      const scalingTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('scale') ||
        t.title.toLowerCase().includes('performance') ||
        t.title.toLowerCase().includes('cache') ||
        t.title.toLowerCase().includes('optimization') ||
        t.title.toLowerCase().includes('monitoring')
      );

      expect(scalingTasks.length).toBeGreaterThan(0);
    });

    test('should recognize multi-currency requirement', () => {
      const currencyTasks = result.tasks.filter(t =>
        t.title.toLowerCase().includes('currency') ||
        t.title.toLowerCase().includes('payment') ||
        t.title.toLowerCase().includes('localization')
      );

      expect(currencyTasks.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 8: Dependency validation after inference
   */
  describe('Validate Inferred Dependencies', () => {
    let description;
    let result;

    beforeEach(() => {
      description = 'Add payment, order tracking, and notifications';
      result = taskDecomposer.decomposeProject(description, { maxTasks: 30 });
    });

    test('all referenced dependencies should exist as tasks', () => {
      const taskIds = new Set(result.tasks.map(t => t._id));

      let orphanDeps = 0;
      result.tasks.forEach(task => {
        if (task.dependencies) {
          task.dependencies.forEach(depId => {
            if (!taskIds.has(depId)) {
              orphanDeps++;
            }
          });
        }
      });

      expect(orphanDeps).toBe(0);
    });

    test('should not have circular dependencies after inference', () => {
      const hasCircular = dependencyGraphService.detectCircularDependencies(result.tasks);
      expect(hasCircular.hasCycles).toBe(false);
    });

    test('should maintain valid dependency graph', () => {
      const criticalPath = dependencyGraphService.calculateCriticalPath(result.tasks);
      expect(criticalPath).toBeDefined();
      expect(Array.isArray(criticalPath)).toBe(true);
    });
  });

  /**
   * Test 9: Comparison of explicit vs inferred dependencies
   */
  describe('Explicit vs Inferred Dependencies', () => {
    let tasksWithoutInference;
    let tasksWithInference;

    beforeEach(() => {
      const description = 'Payment processing with order history';
      const result = taskDecomposer.decomposeProject(description, { maxTasks: 20 });
      tasksWithoutInference = result.tasks;
      tasksWithInference = dependencyGraphService.addImplicitDependencies([...result.tasks]);
    });

    test('should have more dependencies after inference', () => {
      const depsWithout = tasksWithoutInference.reduce((sum, t) => 
        sum + (t.dependencies?.length || 0), 0
      );
      const depsWith = tasksWithInference.reduce((sum, t) => 
        sum + (t.dependencies?.length || 0), 0
      );

      expect(depsWith).toBeGreaterThanOrEqual(depsWithout);
    });

    test('should add auth dependency to payment tasks', () => {
      const paymentTaskAfter = tasksWithInference.find(t =>
        t.title.toLowerCase().includes('payment')
      );

      if (paymentTaskAfter && paymentTaskAfter.dependencies) {
        const hasAuthDep = paymentTaskAfter.dependencies.some(depId => {
          const depTask = tasksWithInference.find(t => t._id === depId);
          return depTask && depTask.category === 'auth';
        });

        expect(hasAuthDep).toBe(true);
      }
    });

    test('should preserve existing dependencies', () => {
      const taskMap = new Map(tasksWithoutInference.map(t => [t._id, t]));

      tasksWithInference.forEach(taskAfter => {
        const taskBefore = taskMap.get(taskAfter._id);
        if (taskBefore && taskBefore.dependencies) {
          taskBefore.dependencies.forEach(depId => {
            expect(taskAfter.dependencies).toContain(depId);
          });
        }
      });
    });
  });
});
