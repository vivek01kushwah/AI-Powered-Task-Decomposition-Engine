import React, { useState } from 'react';

/**
 * ConflictPanel Component
 * 
 * Displays detected contradictions in project requirements
 * Shows severity, descriptions, and suggested resolutions
 */
export default function ConflictPanel({ conflicts = [], contradictions = [] }) {
  const [expandedConflicts, setExpandedConflicts] = useState({});
  const [expandedContradictions, setExpandedContradictions] = useState({});

  const toggleConflict = (conflictId) => {
    setExpandedConflicts(prev => ({
      ...prev,
      [conflictId]: !prev[conflictId]
    }));
  };

  const toggleContradiction = (contradictionId) => {
    setExpandedContradictions(prev => ({
      ...prev,
      [contradictionId]: !prev[contradictionId]
    }));
  };

  /**
   * Get severity color and icon
   */
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-red-800',
          badge: 'bg-red-500 text-white',
          icon: '🚨'
        };
      case 'high':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-400',
          text: 'text-orange-800',
          badge: 'bg-orange-500 text-white',
          icon: '⚠️'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          badge: 'bg-yellow-500 text-white',
          icon: '⚡'
        };
      default:
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-400',
          text: 'text-blue-800',
          badge: 'bg-blue-500 text-white',
          icon: 'ℹ️'
        };
    }
  };

  /**
   * Get conflict type icon
   */
  const getConflictTypeIcon = (type) => {
    const icons = {
      'timeline': '⏰',
      'team-capacity': '👥',
      'scope-overflow': '📦',
      'quality-risk': '⚙️',
      'complexity-risk': '🧩',
      'team-risk': '👤',
      'buffer-risk': '📊',
      'critical-path': '🔗'
    };
    return icons[type] || '⚠️';
  };

  // Check if we have any conflicts or contradictions
  const hasConflicts = (conflicts && conflicts.length > 0) || false;
  const hasContradictions = (contradictions && contradictions.contradictions && contradictions.contradictions.length > 0) || false;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis & Conflicts</h2>
        <p className="text-gray-600">
          Review detected contradictions and conflicts in your project specifications
        </p>
      </div>

      {/* No Issues Message */}
      {!hasConflicts && !hasContradictions && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-semibold text-green-800 mb-2">No Issues Detected</h3>
          <p className="text-green-700">
            Your project specifications are clear and consistent. Ready to proceed!
          </p>
        </div>
      )}

      {/* Contradictions Section */}
      {hasContradictions && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🔄 Contradictions ({contradictions.contradictions.length})
            </h3>
            <p className="text-gray-600">
              Conflicting requirements that need resolution
            </p>
          </div>

          <div className="space-y-4">
            {contradictions.contradictions.map((contradiction, idx) => {
              const severity = getSeverityConfig(contradiction.severity);
              const isExpanded = expandedContradictions[idx];

              return (
                <div key={idx} className={`${severity.bg} border-2 ${severity.border} rounded-lg overflow-hidden`}>
                  {/* Contradiction Header */}
                  <button
                    onClick={() => toggleContradiction(idx)}
                    className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition ${severity.bg}`}
                  >
                    <div className="flex items-center gap-4 text-left flex-1">
                      <span className="text-2xl">{severity.icon}</span>
                      <div>
                        <h4 className={`font-semibold ${severity.text}`}>{contradiction.description}</h4>
                        <p className={`text-sm ${severity.text} opacity-75`}>
                          {contradiction.keywords.join(' ↔ ')}
                        </p>
                      </div>
                      <div className={`${severity.badge} px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>
                        {contradiction.severity.toUpperCase()}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 ml-2 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''} ${severity.text}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Contradiction Details */}
                  {isExpanded && (
                    <div className="px-6 py-4 border-t-2 border-opacity-20 border-gray-400">
                      {contradiction.reasoning && (
                        <div className="mb-4">
                          <h5 className={`font-semibold ${severity.text} mb-2`}>Reasoning:</h5>
                          <p className={`text-sm ${severity.text}`}>{contradiction.reasoning}</p>
                        </div>
                      )}

                      <div className="mb-4">
                        <h5 className={`font-semibold ${severity.text} mb-2`}>Suggestion:</h5>
                        <p className={`text-sm ${severity.text} bg-white bg-opacity-50 p-3 rounded`}>
                          {contradiction.suggestion}
                        </p>
                      </div>

                      {contradiction.type === 'pattern-contradiction' && (
                        <div className="mt-4 pt-4 border-t-2 border-opacity-20 border-gray-400">
                          <h5 className={`font-semibold ${severity.text} mb-2`}>Conflicting Requirements:</h5>
                          <div className="flex items-center justify-between bg-white bg-opacity-50 p-3 rounded">
                            <div className="text-center flex-1">
                              <div className="font-semibold text-gray-800">{contradiction.keywords[0]}</div>
                            </div>
                            <div className="text-xl mx-4">🔄</div>
                            <div className="text-center flex-1">
                              <div className="font-semibold text-gray-800">{contradiction.keywords[1]}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feasibility Conflicts Section */}
      {hasConflicts && (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              ⚠️ Project Feasibility Issues ({conflicts.length})
            </h3>
            <p className="text-gray-600">
              Resource and timeline constraints that may affect project success
            </p>
          </div>

          <div className="space-y-4">
            {conflicts.map((conflict, idx) => {
              const severity = getSeverityConfig(conflict.severity || 'medium');
              const isExpanded = expandedConflicts[idx];

              return (
                <div key={idx} className={`${severity.bg} border-2 ${severity.border} rounded-lg overflow-hidden`}>
                  {/* Conflict Header */}
                  <button
                    onClick={() => toggleConflict(idx)}
                    className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition ${severity.bg}`}
                  >
                    <div className="flex items-center gap-4 text-left flex-1">
                      <span className="text-2xl">{getConflictTypeIcon(conflict.type)}</span>
                      <div>
                        <h4 className={`font-semibold ${severity.text}`}>{conflict.title}</h4>
                        <p className={`text-sm ${severity.text} opacity-75`}>{conflict.description}</p>
                      </div>
                      <div className={`${severity.badge} px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>
                        {(conflict.severity || 'medium').toUpperCase()}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 ml-2 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''} ${severity.text}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Conflict Details */}
                  {isExpanded && (
                    <div className="px-6 py-4 border-t-2 border-opacity-20 border-gray-400">
                      {conflict.impact && (
                        <div className="mb-4">
                          <h5 className={`font-semibold ${severity.text} mb-2`}>Impact:</h5>
                          <p className={`text-sm ${severity.text} bg-white bg-opacity-50 p-3 rounded`}>
                            {conflict.impact}
                          </p>
                        </div>
                      )}

                      {conflict.suggestion && (
                        <div className="mb-4">
                          <h5 className={`font-semibold ${severity.text} mb-2`}>Recommendation:</h5>
                          <p className={`text-sm ${severity.text} bg-white bg-opacity-50 p-3 rounded`}>
                            {conflict.suggestion}
                          </p>
                        </div>
                      )}

                      {conflict.affectedTasks && conflict.affectedTasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t-2 border-opacity-20 border-gray-400">
                          <h5 className={`font-semibold ${severity.text} mb-2`}>Affected Tasks:</h5>
                          <div className="flex flex-wrap gap-2">
                            {conflict.affectedTasks.map((taskId, idx) => (
                              <span key={idx} className="bg-white bg-opacity-70 px-3 py-1 rounded text-sm font-mono text-gray-700">
                                {taskId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {(hasConflicts || hasContradictions) && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-4">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hasContradictions && (
              <>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {contradictions.contradictions.filter(c => c.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Contradictions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {contradictions.contradictions.filter(c => c.severity === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
              </>
            )}
            {hasConflicts && (
              <>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {conflicts.filter(c => c.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {conflicts.filter(c => c.severity === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Severity</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      {(hasConflicts || hasContradictions) && (
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-400 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4">⏭️ Next Steps</h4>
          <ul className="space-y-2 text-sm text-blue-900">
            <li>✓ Review all detected issues above</li>
            <li>✓ Prioritize which conflicts to resolve first</li>
            <li>✓ Implement suggested resolutions</li>
            <li>✓ Re-run analysis to verify improvements</li>
          </ul>
        </div>
      )}
    </div>
  );
}
