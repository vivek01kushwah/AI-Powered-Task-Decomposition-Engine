/**
 * Seed Script for DecompositionPattern Collection
 * 
 * Populates MongoDB with reusable decomposition patterns for common project types.
 * Run with: node scripts/seedPatterns.js
 * 
 * Patterns included:
 * 1. E-commerce (shopping cart, products, payments)
 * 2. Authentication (login, signup, JWT, password reset)
 * 3. Mobile Responsive (responsive design, touch gestures)
 * 4. Social Media (users, posts, comments, feeds)
 * 5. Real-time Chat (messaging, notifications, presence)
 * 6. Content Management (CMS, blogs, publishing)
 * 7. Analytics Dashboard (reporting, metrics, visualization)
 * 8. API Integration (REST API, third-party integrations)
 */

const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Pattern Schema Reference
 * Matches the DecompositionPattern model structure
 */
const patternSchema = {
  category: String,
  keywords: [String],
  description: String,
  standardTasks: [
    {
      title: String,
      estimatedHours: Number,
      priority: Number,
      order: Number,
      skillsRequired: [String]
    }
  ],
  implicitDependencies: [
    {
      fromTaskOrder: Number,
      toTaskOrder: Number,
      dependencyType: String,
      description: String
    }
  ],
  successRate: Number,
  usageCount: Number,
  isActive: Boolean
};

/**
 * Comprehensive Patterns for Common Project Types
 */
const patterns = [
  // ===== PATTERN 1: E-COMMERCE =====
  {
    category: 'e-commerce',
    keywords: ['shop', 'cart', 'product', 'checkout', 'payment', 'ecommerce', 'store', 'catalog', 'commerce'],
    description: 'Complete e-commerce platform with product catalog, shopping cart, and payment processing',
    standardTasks: [
      {
        title: 'Setup MERN Project Structure',
        estimatedHours: 2,
        priority: 10,
        order: 1,
        skillsRequired: ['node.js', 'react', 'devops']
      },
      {
        title: 'Design Database Schema (Users, Products, Orders)',
        estimatedHours: 4,
        priority: 9,
        order: 2,
        skillsRequired: ['database-design', 'mongodb']
      },
      {
        title: 'Implement JWT Authentication',
        estimatedHours: 6,
        priority: 9,
        order: 3,
        skillsRequired: ['backend-development', 'security', 'node.js']
      },
      {
        title: 'Create Product CRUD API',
        estimatedHours: 8,
        priority: 8,
        order: 4,
        skillsRequired: ['backend-development', 'rest-api', 'node.js']
      },
      {
        title: 'Build Product Listing UI',
        estimatedHours: 6,
        priority: 8,
        order: 5,
        skillsRequired: ['frontend-development', 'react', 'css']
      },
      {
        title: 'Implement Shopping Cart State Management',
        estimatedHours: 6,
        priority: 8,
        order: 6,
        skillsRequired: ['frontend-development', 'react', 'state-management']
      },
      {
        title: 'Integrate Payment Gateway (Stripe)',
        estimatedHours: 10,
        priority: 8,
        order: 7,
        skillsRequired: ['backend-development', 'payment-integration', 'security']
      },
      {
        title: 'Create Order History & Management Page',
        estimatedHours: 6,
        priority: 7,
        order: 8,
        skillsRequired: ['frontend-development', 'react', 'backend-integration']
      },
      {
        title: 'Implement Responsive Navbar & Layout',
        estimatedHours: 4,
        priority: 7,
        order: 9,
        skillsRequired: ['frontend-development', 'css', 'responsive-design']
      },
      {
        title: 'Setup Deployment Pipeline (CI/CD)',
        estimatedHours: 4,
        priority: 6,
        order: 10,
        skillsRequired: ['devops', 'deployment', 'github-actions']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'sequential',
        description: 'Project setup must precede schema design'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'Authentication requires database schema'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'API requires authentication system'
      },
      {
        fromTaskOrder: 4,
        toTaskOrder: 5,
        dependencyType: 'requires_output',
        description: 'UI requires Product API'
      },
      {
        fromTaskOrder: 5,
        toTaskOrder: 6,
        dependencyType: 'blocks',
        description: 'Product listing must exist before cart'
      },
      {
        fromTaskOrder: 6,
        toTaskOrder: 7,
        dependencyType: 'blocks',
        description: 'Cart required before payment integration'
      },
      {
        fromTaskOrder: 7,
        toTaskOrder: 8,
        dependencyType: 'requires_output',
        description: 'Order history requires payment system'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 7,
        dependencyType: 'requires_output',
        description: 'Payment integration requires authentication'
      }
    ],
    successRate: 92,
    usageCount: 24,
    isActive: true
  },

  // ===== PATTERN 2: AUTHENTICATION SYSTEM =====
  {
    category: 'auth',
    keywords: ['auth', 'login', 'signup', 'authentication', 'user', 'password', 'jwt', 'session'],
    description: 'User authentication system with JWT, login, signup, and password reset',
    standardTasks: [
      {
        title: 'Design Authentication Architecture',
        estimatedHours: 3,
        priority: 9,
        order: 1,
        skillsRequired: ['backend-development', 'security', 'architecture']
      },
      {
        title: 'Implement JWT Token Generation & Validation',
        estimatedHours: 4,
        priority: 9,
        order: 2,
        skillsRequired: ['backend-development', 'node.js', 'security']
      },
      {
        title: 'Build User Registration API',
        estimatedHours: 4,
        priority: 8,
        order: 3,
        skillsRequired: ['backend-development', 'node.js', 'password-hashing']
      },
      {
        title: 'Build User Login API',
        estimatedHours: 3,
        priority: 8,
        order: 4,
        skillsRequired: ['backend-development', 'node.js']
      },
      {
        title: 'Implement Password Reset Flow',
        estimatedHours: 5,
        priority: 7,
        order: 5,
        skillsRequired: ['backend-development', 'email-service', 'security']
      },
      {
        title: 'Create Login UI Form',
        estimatedHours: 3,
        priority: 8,
        order: 6,
        skillsRequired: ['frontend-development', 'react', 'form-handling']
      },
      {
        title: 'Create Registration UI Form',
        estimatedHours: 3,
        priority: 8,
        order: 7,
        skillsRequired: ['frontend-development', 'react', 'form-validation']
      },
      {
        title: 'Implement Auth State Management',
        estimatedHours: 4,
        priority: 8,
        order: 8,
        skillsRequired: ['frontend-development', 'react', 'state-management']
      },
      {
        title: 'Setup Protected Routes & Middleware',
        estimatedHours: 3,
        priority: 8,
        order: 9,
        skillsRequired: ['backend-development', 'frontend-development', 'middleware']
      },
      {
        title: 'Test Authentication Flows',
        estimatedHours: 4,
        priority: 8,
        order: 10,
        skillsRequired: ['testing', 'qa', 'security-testing']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'sequential',
        description: 'Design must precede implementation'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'JWT required for registration'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'JWT required for login'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 6,
        dependencyType: 'requires_output',
        description: 'API required for UI'
      },
      {
        fromTaskOrder: 4,
        toTaskOrder: 7,
        dependencyType: 'requires_output',
        description: 'API required for UI'
      },
      {
        fromTaskOrder: 6,
        toTaskOrder: 8,
        dependencyType: 'blocks',
        description: 'Forms required for state management'
      }
    ],
    successRate: 95,
    usageCount: 31,
    isActive: true
  },

  // ===== PATTERN 3: MOBILE RESPONSIVE =====
  {
    category: 'mobile',
    keywords: ['mobile', 'responsive', 'mobile-first', 'touch', 'tablet', 'breakpoints'],
    description: 'Mobile-responsive design with touch support and responsive breakpoints',
    standardTasks: [
      {
        title: 'Setup Responsive Design Framework (Tailwind/Bootstrap)',
        estimatedHours: 2,
        priority: 8,
        order: 1,
        skillsRequired: ['frontend-development', 'css', 'tailwind']
      },
      {
        title: 'Implement Mobile-First CSS Breakpoints',
        estimatedHours: 6,
        priority: 8,
        order: 2,
        skillsRequired: ['frontend-development', 'css', 'responsive-design']
      },
      {
        title: 'Create Mobile Navigation Menu',
        estimatedHours: 4,
        priority: 8,
        order: 3,
        skillsRequired: ['frontend-development', 'react', 'ux-design']
      },
      {
        title: 'Optimize Images for Mobile',
        estimatedHours: 3,
        priority: 7,
        order: 4,
        skillsRequired: ['frontend-development', 'performance-optimization']
      },
      {
        title: 'Implement Touch Gesture Handlers',
        estimatedHours: 4,
        priority: 7,
        order: 5,
        skillsRequired: ['frontend-development', 'javascript', 'touch-events']
      },
      {
        title: 'Test on Multiple Devices & Browsers',
        estimatedHours: 5,
        priority: 8,
        order: 6,
        skillsRequired: ['testing', 'qa', 'cross-browser-testing']
      },
      {
        title: 'Setup PWA (Progressive Web App) Features',
        estimatedHours: 4,
        priority: 6,
        order: 7,
        skillsRequired: ['frontend-development', 'pwa', 'service-workers']
      },
      {
        title: 'Optimize Performance for Mobile Networks',
        estimatedHours: 4,
        priority: 7,
        order: 8,
        skillsRequired: ['frontend-development', 'performance-optimization', 'network-optimization']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'sequential',
        description: 'Framework setup before breakpoint implementation'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'Responsive framework needed for navigation'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 4,
        dependencyType: 'blocks',
        description: 'Responsive design needs optimization'
      },
      {
        fromTaskOrder: 1,
        toTaskOrder: 6,
        dependencyType: 'blocks',
        description: 'Implementation before testing'
      }
    ],
    successRate: 88,
    usageCount: 19,
    isActive: true
  },

  // ===== PATTERN 4: SOCIAL MEDIA =====
  {
    category: 'social-media',
    keywords: ['social', 'feed', 'post', 'comment', 'like', 'follow', 'user-profile'],
    description: 'Social media platform with posts, comments, likes, and user profiles',
    standardTasks: [
      {
        title: 'Design Social Database Schema',
        estimatedHours: 5,
        priority: 9,
        order: 1,
        skillsRequired: ['database-design', 'mongodb', 'architecture']
      },
      {
        title: 'Implement User Profile System',
        estimatedHours: 8,
        priority: 8,
        order: 2,
        skillsRequired: ['backend-development', 'node.js', 'crud-operations']
      },
      {
        title: 'Build Post CRUD API',
        estimatedHours: 8,
        priority: 8,
        order: 3,
        skillsRequired: ['backend-development', 'rest-api', 'node.js']
      },
      {
        title: 'Implement Comments System',
        estimatedHours: 6,
        priority: 7,
        order: 4,
        skillsRequired: ['backend-development', 'mongodb', 'nested-documents']
      },
      {
        title: 'Build Like/Reaction System',
        estimatedHours: 5,
        priority: 7,
        order: 5,
        skillsRequired: ['backend-development', 'mongodb', 'performance-optimization']
      },
      {
        title: 'Create Feed Algorithm',
        estimatedHours: 10,
        priority: 8,
        order: 6,
        skillsRequired: ['backend-development', 'algorithms', 'performance-optimization']
      },
      {
        title: 'Build User Feed UI',
        estimatedHours: 8,
        priority: 8,
        order: 7,
        skillsRequired: ['frontend-development', 'react', 'infinite-scroll']
      },
      {
        title: 'Implement Follow System',
        estimatedHours: 6,
        priority: 7,
        order: 8,
        skillsRequired: ['backend-development', 'relationships', 'mongodb']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'requires_output',
        description: 'Schema required for user profiles'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'blocks',
        description: 'User system needed for posts'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'Posts API required for comments'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 5,
        dependencyType: 'requires_output',
        description: 'Posts API required for likes'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 6,
        dependencyType: 'requires_output',
        description: 'Posts required for feed'
      },
      {
        fromTaskOrder: 6,
        toTaskOrder: 7,
        dependencyType: 'requires_output',
        description: 'Algorithm required for UI'
      }
    ],
    successRate: 85,
    usageCount: 12,
    isActive: true
  },

  // ===== PATTERN 5: REAL-TIME CHAT =====
  {
    category: 'real-time',
    keywords: ['chat', 'messaging', 'real-time', 'websocket', 'notifications', 'presence'],
    description: 'Real-time chat system with WebSockets, notifications, and user presence',
    standardTasks: [
      {
        title: 'Setup WebSocket Infrastructure (Socket.io)',
        estimatedHours: 4,
        priority: 9,
        order: 1,
        skillsRequired: ['backend-development', 'websocket', 'socket.io', 'node.js']
      },
      {
        title: 'Design Message Database Schema',
        estimatedHours: 3,
        priority: 9,
        order: 2,
        skillsRequired: ['database-design', 'mongodb', 'optimization']
      },
      {
        title: 'Implement Message CRUD Operations',
        estimatedHours: 6,
        priority: 8,
        order: 3,
        skillsRequired: ['backend-development', 'node.js', 'mongodb']
      },
      {
        title: 'Build User Presence System',
        estimatedHours: 4,
        priority: 7,
        order: 4,
        skillsRequired: ['backend-development', 'websocket', 'state-management']
      },
      {
        title: 'Implement Push Notifications',
        estimatedHours: 5,
        priority: 7,
        order: 5,
        skillsRequired: ['backend-development', 'notification-service', 'firebase']
      },
      {
        title: 'Create Chat UI with Message Display',
        estimatedHours: 8,
        priority: 8,
        order: 6,
        skillsRequired: ['frontend-development', 'react', 'real-time-updates']
      },
      {
        title: 'Implement Message Typing Indicators',
        estimatedHours: 3,
        priority: 6,
        order: 7,
        skillsRequired: ['frontend-development', 'websocket', 'react']
      },
      {
        title: 'Setup Message Encryption (Optional)',
        estimatedHours: 6,
        priority: 6,
        order: 8,
        skillsRequired: ['backend-development', 'security', 'encryption']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'WebSocket required for message operations'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'Schema required for message storage'
      },
      {
        fromTaskOrder: 1,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'WebSocket required for presence'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 6,
        dependencyType: 'requires_output',
        description: 'API required for UI'
      }
    ],
    successRate: 82,
    usageCount: 8,
    isActive: true
  },

  // ===== PATTERN 6: CONTENT MANAGEMENT SYSTEM =====
  {
    category: 'cms',
    keywords: ['cms', 'blog', 'content', 'publishing', 'articles', 'pages', 'editor'],
    description: 'Content Management System with blog posts, pages, and rich text editor',
    standardTasks: [
      {
        title: 'Design Content Database Schema',
        estimatedHours: 4,
        priority: 9,
        order: 1,
        skillsRequired: ['database-design', 'mongodb', 'versioning']
      },
      {
        title: 'Build Content CRUD API',
        estimatedHours: 8,
        priority: 8,
        order: 2,
        skillsRequired: ['backend-development', 'rest-api', 'node.js']
      },
      {
        title: 'Implement Rich Text Editor (Draft.js/Quill)',
        estimatedHours: 6,
        priority: 8,
        order: 3,
        skillsRequired: ['frontend-development', 'react', 'rich-text-editing']
      },
      {
        title: 'Setup User Roles & Permissions',
        estimatedHours: 6,
        priority: 8,
        order: 4,
        skillsRequired: ['backend-development', 'authorization', 'node.js']
      },
      {
        title: 'Implement Content Versioning',
        estimatedHours: 5,
        priority: 6,
        order: 5,
        skillsRequired: ['backend-development', 'mongodb', 'version-control']
      },
      {
        title: 'Create Content Management Dashboard',
        estimatedHours: 10,
        priority: 8,
        order: 6,
        skillsRequired: ['frontend-development', 'react', 'data-management']
      },
      {
        title: 'Setup SEO & Meta Tags',
        estimatedHours: 4,
        priority: 7,
        order: 7,
        skillsRequired: ['frontend-development', 'seo', 'meta-tags']
      },
      {
        title: 'Implement Content Publishing Workflow',
        estimatedHours: 5,
        priority: 7,
        order: 8,
        skillsRequired: ['backend-development', 'workflow-engine', 'node.js']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'requires_output',
        description: 'Schema required for API'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'API required for editor'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'API required for permissions'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 6,
        dependencyType: 'requires_output',
        description: 'API required for dashboard'
      }
    ],
    successRate: 87,
    usageCount: 14,
    isActive: true
  },

  // ===== PATTERN 7: ANALYTICS DASHBOARD =====
  {
    category: 'analytics',
    keywords: ['analytics', 'dashboard', 'metrics', 'reporting', 'charts', 'data-visualization'],
    description: 'Analytics dashboard with real-time metrics, charts, and reporting',
    standardTasks: [
      {
        title: 'Design Analytics Database Schema',
        estimatedHours: 4,
        priority: 9,
        order: 1,
        skillsRequired: ['database-design', 'mongodb', 'time-series-data']
      },
      {
        title: 'Implement Event Tracking System',
        estimatedHours: 6,
        priority: 8,
        order: 2,
        skillsRequired: ['backend-development', 'event-tracking', 'node.js']
      },
      {
        title: 'Build Analytics API Endpoints',
        estimatedHours: 8,
        priority: 8,
        order: 3,
        skillsRequired: ['backend-development', 'data-aggregation', 'rest-api']
      },
      {
        title: 'Create Charts & Visualizations (Chart.js/D3)',
        estimatedHours: 8,
        priority: 8,
        order: 4,
        skillsRequired: ['frontend-development', 'react', 'data-visualization']
      },
      {
        title: 'Implement Real-time Dashboard Updates',
        estimatedHours: 6,
        priority: 7,
        order: 5,
        skillsRequired: ['frontend-development', 'websocket', 'react']
      },
      {
        title: 'Build Filters & Date Range Selection',
        estimatedHours: 5,
        priority: 7,
        order: 6,
        skillsRequired: ['frontend-development', 'react', 'form-handling']
      },
      {
        title: 'Setup Report Export (PDF/CSV)',
        estimatedHours: 4,
        priority: 6,
        order: 7,
        skillsRequired: ['backend-development', 'report-generation', 'node.js']
      },
      {
        title: 'Implement Data Caching & Optimization',
        estimatedHours: 5,
        priority: 6,
        order: 8,
        skillsRequired: ['backend-development', 'caching', 'performance-optimization']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'requires_output',
        description: 'Schema required for event tracking'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'Event tracking required for API'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 4,
        dependencyType: 'requires_output',
        description: 'API required for charts'
      },
      {
        fromTaskOrder: 4,
        toTaskOrder: 5,
        dependencyType: 'blocks',
        description: 'Charts required for real-time updates'
      }
    ],
    successRate: 83,
    usageCount: 9,
    isActive: true
  },

  // ===== PATTERN 8: API INTEGRATION =====
  {
    category: 'api',
    keywords: ['api', 'rest', 'integration', 'third-party', 'external-api', 'webhook'],
    description: 'RESTful API development with third-party integrations and webhooks',
    standardTasks: [
      {
        title: 'Design API Architecture & Specification (OpenAPI)',
        estimatedHours: 4,
        priority: 9,
        order: 1,
        skillsRequired: ['api-design', 'documentation', 'rest-api']
      },
      {
        title: 'Setup Express.js API Server',
        estimatedHours: 3,
        priority: 9,
        order: 2,
        skillsRequired: ['backend-development', 'node.js', 'express']
      },
      {
        title: 'Implement Core API Endpoints',
        estimatedHours: 12,
        priority: 8,
        order: 3,
        skillsRequired: ['backend-development', 'node.js', 'rest-api']
      },
      {
        title: 'Setup API Authentication & Authorization',
        estimatedHours: 6,
        priority: 8,
        order: 4,
        skillsRequired: ['backend-development', 'security', 'jwt']
      },
      {
        title: 'Implement Third-Party API Integrations',
        estimatedHours: 8,
        priority: 7,
        order: 5,
        skillsRequired: ['backend-development', 'http-clients', 'integration']
      },
      {
        title: 'Setup Webhook Handling',
        estimatedHours: 5,
        priority: 6,
        order: 6,
        skillsRequired: ['backend-development', 'webhook-handling', 'security']
      },
      {
        title: 'Implement API Rate Limiting & Throttling',
        estimatedHours: 3,
        priority: 7,
        order: 7,
        skillsRequired: ['backend-development', 'middleware', 'performance']
      },
      {
        title: 'Create API Documentation',
        estimatedHours: 4,
        priority: 7,
        order: 8,
        skillsRequired: ['technical-writing', 'api-documentation']
      },
      {
        title: 'Write API Tests & Integration Tests',
        estimatedHours: 8,
        priority: 8,
        order: 9,
        skillsRequired: ['testing', 'jest', 'integration-testing']
      }
    ],
    implicitDependencies: [
      {
        fromTaskOrder: 1,
        toTaskOrder: 2,
        dependencyType: 'sequential',
        description: 'Design before implementation'
      },
      {
        fromTaskOrder: 2,
        toTaskOrder: 3,
        dependencyType: 'requires_output',
        description: 'Server setup required for endpoints'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 4,
        dependencyType: 'blocks',
        description: 'Endpoints must exist before auth'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 5,
        dependencyType: 'blocks',
        description: 'Core API required before integrations'
      },
      {
        fromTaskOrder: 3,
        toTaskOrder: 9,
        dependencyType: 'blocks',
        description: 'Implementation before testing'
      }
    ],
    successRate: 90,
    usageCount: 17,
    isActive: true
  }
];

/**
 * Main Seed Function
 * Connects to MongoDB and inserts patterns
 */
async function seedPatterns() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/task-decomposition';
    
    console.log(`\n📚 Seeding Decomposition Patterns...`);
    console.log(`Connecting to: ${mongoUri}\n`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB\n');

    // Get the database
    const db = mongoose.connection.db;
    const patternsCollection = db.collection('decompositionpatterns');

    // Clear existing patterns (optional)
    const deleteResult = await patternsCollection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing patterns\n`);

    // Insert new patterns with timestamps
    const patternsWithTimestamps = patterns.map(pattern => ({
      ...pattern,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const insertResult = await patternsCollection.insertMany(patternsWithTimestamps);
    
    console.log(`✅ Successfully seeded ${insertResult.insertedIds.length} patterns:\n`);
    
    patterns.forEach((pattern, idx) => {
      const taskCount = pattern.standardTasks.length;
      const depCount = pattern.implicitDependencies.length;
      console.log(`  ${idx + 1}. ${pattern.category.toUpperCase()}`);
      console.log(`     - Keywords: ${pattern.keywords.join(', ')}`);
      console.log(`     - Tasks: ${taskCount} | Dependencies: ${depCount}`);
      console.log(`     - Success Rate: ${pattern.successRate}% | Usage: ${pattern.usageCount}`);
      console.log();
    });

    // Display summary statistics
    const patternCategories = new Set(patterns.map(p => p.category));
    const totalTasks = patterns.reduce((sum, p) => sum + p.standardTasks.length, 0);
    const totalDependencies = patterns.reduce((sum, p) => sum + p.implicitDependencies.length, 0);

    console.log('📊 Seed Summary:');
    console.log(`   Total Patterns: ${patterns.length}`);
    console.log(`   Categories: ${Array.from(patternCategories).join(', ')}`);
    console.log(`   Total Task Templates: ${totalTasks}`);
    console.log(`   Total Dependencies: ${totalDependencies}`);
    console.log(`   Average Tasks per Pattern: ${(totalTasks / patterns.length).toFixed(1)}`);
    console.log(`   Average Success Rate: ${(patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length).toFixed(1)}%\n`);

    // Create indexes for performance
    console.log('🔍 Creating indexes...\n');
    
    await patternsCollection.createIndex({ category: 1, isActive: 1 });
    await patternsCollection.createIndex({ keywords: 1 });
    await patternsCollection.createIndex({ createdAt: -1 });
    await patternsCollection.createIndex({ successRate: -1 });
    await patternsCollection.createIndex({ usageCount: -1 });

    console.log('✅ Indexes created successfully\n');

    console.log('🎉 Seeding completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding patterns:', error.message);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Verify seed data
 */
async function verifySeed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/task-decomposition';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = mongoose.connection.db;
    const patternsCollection = db.collection('decompositionpatterns');

    const count = await patternsCollection.countDocuments();
    const categories = await patternsCollection.distinct('category');
    const activePatterns = await patternsCollection.countDocuments({ isActive: true });

    console.log('\n✅ Seed Verification:\n');
    console.log(`   Total Patterns: ${count}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   Active Patterns: ${activePatterns}`);
    console.log();

    // Show sample pattern
    const sample = await patternsCollection.findOne({});
    if (sample) {
      console.log(`   Sample Pattern: ${sample.category}`);
      console.log(`   - Keywords: ${sample.keywords.join(', ')}`);
      console.log(`   - Task Count: ${sample.standardTasks.length}`);
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying seed:', error.message);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifySeed();
  } else {
    seedPatterns();
  }
}

module.exports = { patterns, seedPatterns, verifySeed };
