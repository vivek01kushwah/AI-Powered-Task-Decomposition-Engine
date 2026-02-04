import React, { useState } from 'react';

/**
 * DecompositionResults Component
 * Displays the full decomposition analysis including tasks, conflicts, warnings, and feasibility
 */
export default function DecompositionResults({ results }) {
  const [expandedTask, setExpandedTask] = useState(null);
  const [expandedConflict, setExpandedConflict] = useState(null);

  // Handle both old and new response formats
  const data = results.data || results;
  const feasibilityScore = data.feasibility?.score ?? data.feasibilityScore ?? 0;
  const tasks = data.decomposition?.tasks || data.tasks || [];
  const conflicts = data.contradictions?.contradictions || data.conflicts || [];
  const warnings = data.feasibility?.warnings || data.warnings || [];
  const clarifyingQuestions = data.ambiguity?.questions || data.clarifyingQuestions || [];

  const getScoreBgClass = (score) => {
    if (score >= 0.7) return 'bg-green-100 border-green-300';
    if (score >= 0.5) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 2:
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 3:
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAmbiguityColor = (ambiguity) => {
    if (ambiguity >= 0.7) return 'text-red-600';
    if (ambiguity >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Feasibility Score */}
          <div className={`p-6 rounded-lg border-2 ${getScoreBgClass(results.feasibilityScore)}`}>
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Feasibility Score
            </h3>
            <div className="text-4xl font-bold mb-2">
              {(results.feasibilityScore * 100).toFixed(0)}%
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  results.feasibilityScore >= 0.7 ? 'bg-green-600' :
                  results.feasibilityScore >= 0.5 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${results.feasibilityScore * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {results.feasibilityScore >= 0.7 ? '✅ Feasible' :
               results.feasibilityScore >= 0.5 ? '⚠️ Challenging' :
               '❌ High Risk'}
            </p>
          </div>

          {/* Task Count */}
          <div className="p-6 rounded-lg bg-blue-50 border-2 border-blue-300">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Total Tasks
            </h3>
            <div className="text-4xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Decomposed subtasks
            </p>
          </div>

          {/* Conflicts */}
          <div className="p-6 rounded-lg bg-orange-50 border-2 border-orange-300">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Conflicts Found
            </h3>
            <div className="text-4xl font-bold text-orange-600">
              {conflicts.length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {conflicts.length > 0 ? 'Requires clarification' : 'None detected'}
            </p>
          </div>

          {/* Warnings */}
          <div className="p-6 rounded-lg bg-purple-50 border-2 border-purple-300">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
              Warnings
            </h3>
            <div className="text-4xl font-bold text-purple-600">
              {warnings.length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Risk factors identified
            </p>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings && warnings.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow-lg p-8 border-l-4 border-red-600">
          <h2 className="text-2xl font-bold text-red-900 mb-4">⚠️ Warnings</h2>
          <div className="space-y-3">
            {warnings.map((warning, idx) => (
              <div key={idx} className="flex items-start bg-white p-4 rounded border border-red-200">
                <span className="text-red-600 font-bold mr-3">•</span>
                {typeof warning === 'string' ? (
                  <p className="text-gray-800">{warning}</p>
                ) : (
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">{warning.title || warning.description || 'Warning'}</p>
                    {warning.description && warning.title && (
                      <p className="text-gray-700 text-sm mt-1">{warning.description}</p>
                    )}
                    {warning.impact && (
                      <p className="text-gray-600 text-sm mt-1"><strong>Impact:</strong> {warning.impact}</p>
                    )}
                    {warning.suggestion && (
                      <p className="text-gray-600 text-sm mt-1"><strong>Suggestion:</strong> {warning.suggestion}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts Section */}
      {conflicts && conflicts.length > 0 && (
        <div className="bg-orange-50 rounded-lg shadow-lg p-8 border-l-4 border-orange-600">
          <h2 className="text-2xl font-bold text-orange-900 mb-4">🔥 Conflicts & Contradictions</h2>
          <div className="space-y-4">
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-orange-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedConflict(expandedConflict === idx ? null : idx)}
                  className="w-full p-4 hover:bg-orange-50 transition flex justify-between items-start"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        {conflict.type?.toUpperCase() || 'CONFLICT'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{conflict.description}</p>
                  </div>
                  <span className="text-orange-600 text-xl">
                    {expandedConflict === idx ? '−' : '+'}
                  </span>
                </button>
                {expandedConflict === idx && conflict.suggestion && (
                  <div className="px-4 pb-4 pt-0 border-t border-orange-200 bg-orange-50">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>💡 Suggestion:</strong>
                    </p>
                    <p className="text-gray-700">{conflict.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clarifying Questions Section */}
      {clarifyingQuestions && clarifyingQuestions.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">❓ Questions for Clarification</h2>
          <div className="space-y-3">
            {clarifyingQuestions.map((question, idx) => (
              <div key={idx} className="flex items-start bg-white p-4 rounded border border-blue-200">
                <span className="text-blue-600 font-bold mr-3 text-lg">{idx + 1}.</span>
                <p className="text-gray-800">{typeof question === 'string' ? question : question.question || question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {tasks && tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Decomposed Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => setExpandedTask(expandedTask === idx ? null : idx)}
                  className="w-full p-4 hover:bg-gray-50 transition flex justify-between items-start"
                >
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                        Priority {task.priority}
                      </span>
                      {task.category && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                          {task.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  </div>
                  <span className="text-gray-600 text-xl ml-4">
                    {expandedTask === idx ? '−' : '+'}
                  </span>
                </button>

                {expandedTask === idx && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-200 bg-gray-50 space-y-4">
                    {/* Core Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Estimated Hours
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {task.estimatedHours}h
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Task ID
                        </p>
                        <p className="text-sm font-mono text-gray-700">{task.id}</p>
                      </div>
                      {task.ambiguityScore !== undefined && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                            Clarity Level
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-300 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  task.ambiguityScore <= 0.3 ? 'bg-green-600' :
                                  task.ambiguityScore <= 0.6 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${(1 - task.ambiguityScore) * 100}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-semibold ${getAmbiguityColor(task.ambiguityScore)}`}>
                              {Math.round((1 - task.ambiguityScore) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dependencies */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Dependencies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {task.dependencies.map((dep, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ambiguity Flags */}
                    {task.ambiguityFlags && task.ambiguityFlags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Ambiguity Flags
                        </p>
                        <ul className="space-y-1">
                          {task.ambiguityFlags.map((flag, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start">
                              <span className="text-yellow-600 mr-2">⚠️</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Hidden Dependencies */}
                    {task.hiddenDependencies && task.hiddenDependencies.length > 0 && (
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-xs font-semibold text-yellow-900 uppercase mb-2">
                          🔍 Inferred Dependencies
                        </p>
                        <ul className="space-y-1">
                          {task.hiddenDependencies.map((dep, i) => (
                            <li key={i} className="text-sm text-yellow-900">
                              • {dep}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
