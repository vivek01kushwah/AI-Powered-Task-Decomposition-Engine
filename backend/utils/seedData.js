/**
 * Seed Data Generator
 * Provides sample data for testing and development
 */

const seedData = {
  // Sample Decomposition Patterns
  patterns: [
    {
      category: 'e-commerce',
      description: 'Standard e-commerce platform decomposition',
      keywords: ['shopping', 'cart', 'checkout', 'payment', 'product', 'store'],
      standardTasks: [
        {
          title: 'Setup {task} Infrastructure',
          description: 'Configure hosting, databases, and infrastructure',
          estimatedHours: 16,
          priority: 10,
          order: 1,
          skillsRequired: ['devops', 'cloud'],
        },
        {
          title: 'Database Design for {task}',
          description: 'Design database schema and models',
          estimatedHours: 12,
          priority: 9,
          order: 2,
          skillsRequired: ['database-design', 'sql'],
        },
        {
          title: 'API Development for {task}',
          description: 'Implement REST/GraphQL APIs',
          estimatedHours: 24,
          priority: 9,
          order: 3,
          skillsRequired: ['backend', 'nodejs', 'python'],
        },
        {
          title: 'Frontend Development for {task}',
          description: 'Build user interface',
          estimatedHours: 32,
          priority: 8,
          order: 4,
          skillsRequired: ['frontend', 'react', 'vue'],
        },
        {
          title: 'Testing {task}',
          description: 'Unit, integration, and E2E testing',
          estimatedHours: 20,
          priority: 9,
          order: 5,
          skillsRequired: ['qa', 'testing'],
        },
        {
          title: 'Deployment {task}',
          description: 'Deploy to production',
          estimatedHours: 8,
          priority: 9,
          order: 6,
          skillsRequired: ['devops', 'deployment'],
        },
      ],
      implicitDependencies: [
        { fromTaskOrder: 1, toTaskOrder: 2, dependencyType: 'blocks', description: 'Need infrastructure before DB' },
        { fromTaskOrder: 2, toTaskOrder: 3, dependencyType: 'requires_output', description: 'API depends on DB schema' },
        { fromTaskOrder: 3, toTaskOrder: 4, dependencyType: 'requires_output', description: 'Frontend needs API' },
        { fromTaskOrder: 4, toTaskOrder: 5, dependencyType: 'blocks', description: 'Test after code complete' },
        { fromTaskOrder: 5, toTaskOrder: 6, dependencyType: 'blocks', description: 'Deploy after testing' },
      ],
      isActive: true,
      successRate: 85,
      usageCount: 12,
      createdBy: 'system',
    },
    {
      category: 'auth',
      description: 'Authentication system decomposition',
      keywords: ['auth', 'login', 'authentication', 'security', 'password'],
      standardTasks: [
        {
          title: 'Design {task} Architecture',
          description: 'Plan authentication flow and security',
          estimatedHours: 8,
          priority: 10,
          order: 1,
          skillsRequired: ['security', 'architecture'],
        },
        {
          title: 'Implement {task} Backend',
          description: 'Build auth server and token management',
          estimatedHours: 16,
          priority: 10,
          order: 2,
          skillsRequired: ['backend', 'security'],
        },
        {
          title: 'Frontend {task}',
          description: 'Build login/signup UI and flows',
          estimatedHours: 12,
          priority: 8,
          order: 3,
          skillsRequired: ['frontend', 'ux'],
        },
        {
          title: 'Security Testing {task}',
          description: 'Security audit and penetration testing',
          estimatedHours: 16,
          priority: 10,
          order: 4,
          skillsRequired: ['security', 'qa'],
        },
      ],
      implicitDependencies: [
        { fromTaskOrder: 1, toTaskOrder: 2, dependencyType: 'blocks' },
        { fromTaskOrder: 2, toTaskOrder: 3, dependencyType: 'requires_output' },
        { fromTaskOrder: 3, toTaskOrder: 4, dependencyType: 'blocks' },
      ],
      isActive: true,
      successRate: 92,
      usageCount: 8,
      createdBy: 'system',
    },
    {
      category: 'api',
      description: 'REST API development decomposition',
      keywords: ['api', 'rest', 'endpoint', 'service'],
      standardTasks: [
        {
          title: 'API Specification for {task}',
          description: 'Define endpoints and data models',
          estimatedHours: 6,
          priority: 9,
          order: 1,
          skillsRequired: ['design', 'documentation'],
        },
        {
          title: 'Core Implementation {task}',
          description: 'Implement core API logic',
          estimatedHours: 20,
          priority: 9,
          order: 2,
          skillsRequired: ['backend'],
        },
        {
          title: 'Integration {task}',
          description: 'Integrate with external services',
          estimatedHours: 10,
          priority: 7,
          order: 3,
          skillsRequired: ['integration', 'backend'],
        },
        {
          title: 'Documentation {task}',
          description: 'Create API documentation',
          estimatedHours: 4,
          priority: 6,
          order: 4,
          skillsRequired: ['documentation'],
        },
      ],
      implicitDependencies: [
        { fromTaskOrder: 1, toTaskOrder: 2, dependencyType: 'requires_output' },
        { fromTaskOrder: 2, toTaskOrder: 3, dependencyType: 'sequential' },
        { fromTaskOrder: 2, toTaskOrder: 4, dependencyType: 'blocks' },
      ],
      isActive: true,
      successRate: 88,
      usageCount: 6,
      createdBy: 'system',
    },
  ],

  // Sample Projects
  projects: [
    {
      projectName: 'Mobile Banking App',
      description: 'Develop a secure mobile banking application with account management, transfers, and transactions',
      originalDescription: 'Develop a secure mobile banking application with account management, transfers, and transactions',
      decompositionMethod: 'hierarchical',
      constraints: {
        maxTasks: 30,
        teamSize: 6,
        hoursPerDay: 8,
        deadline: '2026-06-30',
        budget: 150000,
        maxConcurrentTasks: 4,
        skillRequirements: {
          'backend': 2,
          'mobile': 2,
          'security': 2,
          'devops': 1,
        },
      },
      createdBy: 'user123',
      status: 'draft',
      tags: ['mobile', 'banking', 'finance'],
    },
    {
      projectName: 'Real-time Notification System',
      description: 'Build a scalable real-time notification system supporting email, SMS, and push notifications',
      originalDescription: 'Build a scalable real-time notification system supporting email, SMS, and push notifications',
      decompositionMethod: 'sequential',
      constraints: {
        maxTasks: 20,
        teamSize: 4,
        hoursPerDay: 8,
        deadline: '2026-04-30',
        budget: 80000,
        maxConcurrentTasks: 3,
      },
      createdBy: 'user456',
      status: 'analyzing',
      tags: ['notifications', 'realtime', 'system'],
    },
  ],

  // Sample Tasks for Project
  tasks: [
    {
      taskId: 'task_1',
      title: 'Set up Development Environment',
      description: 'Configure development tools, repositories, and local environment setup',
      estimatedHours: 4,
      priority: 10,
      category: 'general',
      status: 'planned',
      skillsRequired: ['devops', 'development'],
      dependencies: [],
    },
    {
      taskId: 'task_2',
      title: 'Database Schema Design',
      description: 'Design and create MongoDB schemas for all entities',
      estimatedHours: 12,
      priority: 9,
      category: 'data-processing',
      status: 'planned',
      skillsRequired: ['database-design', 'mongodb'],
      dependencies: ['task_1'],
    },
    {
      taskId: 'task_3',
      title: 'Authentication System',
      description: 'Implement secure authentication and authorization',
      estimatedHours: 16,
      priority: 10,
      category: 'auth',
      status: 'planned',
      skillsRequired: ['backend', 'security'],
      dependencies: ['task_2'],
    },
    {
      taskId: 'task_4',
      title: 'API Endpoints Development',
      description: 'Implement all REST API endpoints',
      estimatedHours: 32,
      priority: 9,
      category: 'api',
      status: 'planned',
      skillsRequired: ['backend', 'nodejs'],
      dependencies: ['task_3', 'task_2'],
    },
    {
      taskId: 'task_5',
      title: 'Frontend UI Development',
      description: 'Build responsive user interface components',
      estimatedHours: 24,
      priority: 8,
      category: 'general',
      status: 'planned',
      skillsRequired: ['frontend', 'react', 'tailwind'],
      dependencies: ['task_1'],
    },
    {
      taskId: 'task_6',
      title: 'Integration Testing',
      description: 'Create and run integration tests',
      estimatedHours: 16,
      priority: 9,
      category: 'general',
      status: 'planned',
      skillsRequired: ['qa', 'testing'],
      dependencies: ['task_4', 'task_5'],
    },
    {
      taskId: 'task_7',
      title: 'Deployment Setup',
      description: 'Configure CI/CD pipeline and deployment',
      estimatedHours: 8,
      priority: 8,
      category: 'deployment',
      status: 'planned',
      skillsRequired: ['devops', 'deployment'],
      dependencies: ['task_6'],
    },
  ],

  // Sample Team Members
  teamMembers: [
    {
      memberId: 'user_001',
      name: 'Alice Johnson',
      role: 'Lead Developer',
      assignedTasks: ['task_1', 'task_2', 'task_4'],
    },
    {
      memberId: 'user_002',
      name: 'Bob Smith',
      role: 'Frontend Developer',
      assignedTasks: ['task_5'],
    },
    {
      memberId: 'user_003',
      name: 'Carol White',
      role: 'QA Engineer',
      assignedTasks: ['task_6'],
    },
    {
      memberId: 'user_004',
      name: 'David Brown',
      role: 'DevOps Engineer',
      assignedTasks: ['task_7'],
    },
  ],
};

/**
 * Example usage in test file:
 * 
 * const mongoose = require('mongoose');
 * const Project = require('../models/Project');
 * const DecompositionPattern = require('../models/DecompositionPattern');
 * const seedData = require('./seedData');
 * 
 * async function seedDatabase() {
 *   try {
 *     // Clear existing data
 *     await Project.deleteMany({});
 *     await DecompositionPattern.deleteMany({});
 * 
 *     // Seed patterns
 *     await DecompositionPattern.insertMany(seedData.patterns);
 *     console.log('Patterns seeded');
 * 
 *     // Seed projects
 *     const projects = seedData.projects.map(p => ({
 *       ...p,
 *       tasks: seedData.tasks,
 *       assignedTeam: seedData.teamMembers,
 *     }));
 *     await Project.insertMany(projects);
 *     console.log('Projects seeded');
 * 
 *   } catch (error) {
 *     console.error('Seeding error:', error);
 *   }
 * }
 * 
 * module.exports = { seedData, seedDatabase };
 */

module.exports = seedData;
