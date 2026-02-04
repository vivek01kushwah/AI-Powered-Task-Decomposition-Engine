import React, { useState } from 'react';

/**
 * TaskList Component
 * 
 * Displays decomposed tasks organized by category
 * Shows dependencies, critical path highlighting, and priority color-coding
 */
export default function TaskList({ tasks = [], criticalPathTasks = [] }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedDependencies, setExpandedDependencies] = useState({});

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {});

  /**
   * Get priority color and label
   */
  const getPriorityColor = (priority) => {
    if (priority >= 8) return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-500' };
    if (priority >= 6) return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-500' };
    return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-500' };
  };

  /**
   * Get priority label
   */
  const getPriorityLabel = (priority) => {
    if (priority >= 8) return 'High';
    if (priority >= 6) return 'Medium';
    return 'Low';
  };

  /**
   * Get complexity badge color
   */
  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'complex':
        return 'bg-purple-100 text-purple-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  /**
   * Toggle category expansion
   */
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  /**
   * Toggle dependency visibility
   */
  const toggleDependencies = (taskId) => {
    setExpandedDependencies(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  /**
   * Get dependency task details
   */
  const getDependencyTask = (depId) => {
    return tasks.find(t => t.taskId === depId);
  };

  /**
   * Check if task is on critical path
   */
  const isOnCriticalPath = (taskId) => {
    return criticalPathTasks.includes(taskId);
  };

  // Category colors and icons
  const categoryConfig = {
    setup: { icon: '🔧', color: 'bg-indigo-600', label: 'Setup & Configuration' },
    backend: { icon: '⚙️', color: 'bg-slate-600', label: 'Backend Development' },
    frontend: { icon: '🎨', color: 'bg-pink-600', label: 'Frontend Development' },
    database: { icon: '🗄️', color: 'bg-cyan-600', label: 'Database' },
    authentication: { icon: '🔐', color: 'bg-orange-600', label: 'Authentication' },
    payment: { icon: '💳', color: 'bg-green-600', label: 'Payment Integration' },
    testing: { icon: '✅', color: 'bg-emerald-600', label: 'Testing & QA' },
    devops: { icon: '🚀', color: 'bg-blue-600', label: 'Deployment & DevOps' },
    documentation: { icon: '📚', color: 'bg-amber-600', label: 'Documentation' },
    other: { icon: '📋', color: 'bg-gray-600', label: 'Other' }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Decomposed Tasks</h2>
        <p className="text-gray-600">
          {tasks.length} tasks organized by category. Tasks on the critical path are highlighted.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{criticalPathTasks.length}</div>
          <div className="text-sm text-gray-600">Critical Path</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(tasks.reduce((sum, t) => sum + t.estimatedHours, 0) * 10) / 10}
          </div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
          <div className="text-2xl font-bold text-amber-600">{Object.keys(tasksByCategory).length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </div>

      {/* Tasks by Category */}
      <div className="space-y-6">
        {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
          const config = categoryConfig[category] || categoryConfig.other;
          const isExpanded = expandedCategories[category] !== false;
          const categoryHours = categoryTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

          return (
            <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full ${config.color} text-white px-6 py-4 flex items-center justify-between font-semibold hover:opacity-90 transition`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div className="text-left">
                    <div>{config.label}</div>
                    <div className="text-sm font-normal opacity-90">
                      {categoryTasks.length} tasks • {Math.round(categoryHours * 10) / 10} hours
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Category Tasks */}
              {isExpanded && (
                <div className="p-6 space-y-4">
                  {categoryTasks.map((task, idx) => {
                    const priorityColor = getPriorityColor(task.priority);
                    const isCritical = isOnCriticalPath(task.taskId);
                    const hasDeps = task.dependencies && task.dependencies.length > 0;

                    return (
                      <div
                        key={task.taskId}
                        className={`p-4 rounded-lg border-2 transition ${
                          isCritical
                            ? 'border-red-400 bg-red-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-blue-400'
                        }`}
                      >
                        {/* Task Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-gray-700">
                                {(idx + 1).toString().padStart(2, '0')}.
                              </span>
                              <h4 className="text-lg font-semibold text-gray-800">
                                {task.title}
                              </h4>
                              {isCritical && (
                                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                  ⚡ CRITICAL PATH
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 ml-7">{task.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Task Metadata */}
                        <div className="ml-7 flex flex-wrap gap-2 mb-3">
                          {/* Estimated Hours */}
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            ⏱️ {task.estimatedHours} hours
                          </div>

                          {/* Priority */}
                          <div className={`${priorityColor.bg} ${priorityColor.text} px-3 py-1 rounded-full text-sm font-medium`}>
                            {getPriorityLabel(task.priority)} Priority
                          </div>

                          {/* Complexity */}
                          <div className={`${getComplexityColor(task.complexity)} px-3 py-1 rounded-full text-sm font-medium`}>
                            {task.complexity ? task.complexity.charAt(0).toUpperCase() + task.complexity.slice(1) : 'Moderate'}
                          </div>

                          {/* Task Level/Order */}
                          {task.level !== undefined && (
                            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              Level {task.level}
                            </div>
                          )}
                        </div>

                        {/* Skills Required */}
                        {task.skillsRequired && task.skillsRequired.length > 0 && (
                          <div className="ml-7 mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2">SKILLS REQUIRED:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.skillsRequired.map((skill, idx) => (
                                <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dependencies Section */}
                        {hasDeps && (
                          <div className="ml-7">
                            <button
                              onClick={() => toggleDependencies(task.taskId)}
                              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedDependencies[task.taskId] ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                              📎 Dependencies ({task.dependencies.length})
                            </button>

                            {expandedDependencies[task.taskId] && (
                              <div className="mt-2 ml-6 space-y-2 border-l-2 border-blue-300 pl-4">
                                {task.dependencies.map((depId, depIdx) => {
                                  const depTask = getDependencyTask(depId);
                                  return (
                                    <div key={depIdx} className="text-sm">
                                      <div className="text-gray-700">
                                        <span className="font-semibold text-blue-600">→</span> {depTask?.title || depId}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {depTask ? `${depTask.estimatedHours} hours` : 'Unknown'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tasks Yet</h3>
          <p className="text-gray-600">
            Submit a project description to decompose it into tasks
          </p>
        </div>
      )}

      {/* Legend */}
      {tasks.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Priority Levels:</h5>
              <div className="space-y-2 text-sm">
                <div>🔴 <strong>High (8+)</strong> - Red badge</div>
                <div>🟡 <strong>Medium (6-7)</strong> - Yellow badge</div>
                <div>🟢 <strong>Low (&lt;6)</strong> - Green badge</div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Complexity:</h5>
              <div className="space-y-2 text-sm">
                <div><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Simple</span> - Quick wins</div>
                <div><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Moderate</span> - Standard work</div>
                <div><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Complex</span> - Challenging</div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-sm text-gray-700 mb-2">Special:</h5>
              <div className="space-y-2 text-sm">
                <div>⚡ <strong>Critical Path</strong> - Delays affect project end date</div>
                <div>📎 <strong>Dependencies</strong> - Must complete prerequisites first</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
