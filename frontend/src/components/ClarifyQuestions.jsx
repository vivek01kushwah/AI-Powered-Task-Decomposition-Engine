import React, { useState } from 'react';

/**
 * ClarifyQuestions Component
 * 
 * Displays ambiguity clarifying questions to improve requirement clarity
 * Allows copying questions and prioritizing them by importance
 */
export default function ClarifyQuestions({ questions = [], ambiguity = {} }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low

  /**
   * Copy question to clipboard
   */
  const copyToClipboard = (question, index) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * Toggle question expansion
   */
  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  /**
   * Get priority color and icon
   */
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          icon: '🔴',
          bg: 'bg-red-100',
          border: 'border-red-400',
          badge: 'bg-red-500 text-white',
          text: 'text-red-800'
        };
      case 'high':
        return {
          icon: '🟠',
          bg: 'bg-orange-100',
          border: 'border-orange-400',
          badge: 'bg-orange-500 text-white',
          text: 'text-orange-800'
        };
      case 'medium':
        return {
          icon: '🟡',
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          badge: 'bg-yellow-500 text-white',
          text: 'text-yellow-800'
        };
      default:
        return {
          icon: '🟢',
          bg: 'bg-green-100',
          border: 'border-green-400',
          badge: 'bg-green-500 text-white',
          text: 'text-green-800'
        };
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category) => {
    const icons = {
      'scope': '📦',
      'timeline': '⏰',
      'resources': '👥',
      'requirements': '✅',
      'constraints': '🔒',
      'assumptions': '💭',
      'success-criteria': '🎯',
      'technical': '⚙️',
      'design': '🎨',
      'performance': '⚡'
    };
    return icons[category] || '❓';
  };

  /**
   * Get question type icon
   */
  const getQuestionTypeIcon = (type) => {
    const icons = {
      'clarification': '🤔',
      'scope': '📋',
      'timeline': '📅',
      'resources': '💼',
      'constraint': '⛔',
      'assumption': '🎲',
      'criterion': '🏆',
      'definition': '📖'
    };
    return icons[type] || '❓';
  };

  // Filter questions based on priority
  let filteredQuestions = questions;
  if (filterPriority !== 'all') {
    filteredQuestions = questions.filter(q => q.priority === filterPriority);
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filteredQuestions = [...filteredQuestions].sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 4;
    const bPriority = priorityOrder[b.priority] ?? 4;
    return aPriority - bPriority;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">❓ Clarifying Questions</h2>
        <p className="text-gray-600">
          Answer these questions to improve requirement clarity and project definition
        </p>
      </div>

      {/* No Questions Message */}
      {questions.length === 0 && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-2xl font-semibold text-green-800 mb-2">Requirements Are Clear</h3>
          <p className="text-green-700">
            Your project specifications are well-defined. No clarifying questions needed!
          </p>
        </div>
      )}

      {/* Filter Bar */}
      {questions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center">Filter by Priority:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filterPriority === priority
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {priority === 'all' ? '📊 All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              {priority !== 'all' && (
                <span className="ml-2 text-xs">
                  ({questions.filter(q => q.priority === priority).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Questions List */}
      {filteredQuestions.length > 0 && (
        <div className="space-y-4 mb-8">
          {filteredQuestions.map((question, idx) => {
            const priorityConfig = getPriorityConfig(question.priority);
            const isExpanded = expandedQuestions[idx];
            const typeIcon = getQuestionTypeIcon(question.type);

            return (
              <div key={idx} className={`${priorityConfig.bg} border-2 ${priorityConfig.border} rounded-lg overflow-hidden`}>
                {/* Question Header */}
                <div className={`px-6 py-4 flex items-start justify-between ${priorityConfig.bg}`}>
                  <div className="flex items-start gap-4 flex-1">
                    {/* Priority Indicator */}
                    <div className="flex-shrink-0 pt-1">
                      {priorityConfig.icon}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{typeIcon}</span>
                        <h3 className={`font-semibold ${priorityConfig.text}`}>
                          Question {(questions.indexOf(question) + 1)}
                        </h3>
                        <span className={`${priorityConfig.badge} px-2 py-1 rounded text-xs font-bold`}>
                          {question.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                      </div>
                      <p className={`${priorityConfig.text} font-medium leading-relaxed`}>
                        {question.question}
                      </p>
                      {question.category && (
                        <p className={`text-sm ${priorityConfig.text} opacity-75 mt-2`}>
                          {getCategoryIcon(question.category)} Category: {question.category.replace(/-/g, ' ').toUpperCase()}
                        </p>
                      )}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyToClipboard(question.question, idx)}
                      className={`flex-shrink-0 px-3 py-2 rounded text-sm font-semibold transition ${
                        copiedIndex === idx
                          ? 'bg-green-500 text-white'
                          : `${priorityConfig.badge} bg-opacity-20 hover:bg-opacity-30`
                      }`}
                    >
                      {copiedIndex === idx ? '✅ Copied' : '📋 Copy'}
                    </button>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleQuestion(idx)}
                    className={`flex-shrink-0 ml-4 p-2 rounded transition ${priorityConfig.bg} hover:opacity-75`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${priorityConfig.text}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`px-6 py-4 border-t-2 ${priorityConfig.border} border-opacity-20`}>
                    {/* Rationale */}
                    {question.rationale && (
                      <div className="mb-4">
                        <h4 className={`font-semibold ${priorityConfig.text} mb-2 text-sm`}>Why This Question?</h4>
                        <p className={`text-sm ${priorityConfig.text} opacity-85 bg-white bg-opacity-50 p-3 rounded`}>
                          {question.rationale}
                        </p>
                      </div>
                    )}

                    {/* Suggested Answer Areas */}
                    {question.suggestedAnswerAreas && question.suggestedAnswerAreas.length > 0 && (
                      <div className="mb-4">
                        <h4 className={`font-semibold ${priorityConfig.text} mb-2 text-sm`}>Areas to Address:</h4>
                        <ul className="space-y-2">
                          {question.suggestedAnswerAreas.map((area, areaIdx) => (
                            <li key={areaIdx} className={`text-sm ${priorityConfig.text} opacity-85 flex items-start gap-2`}>
                              <span className="mt-1">→</span>
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Impact of Not Answering */}
                    {question.impact && (
                      <div className="bg-white bg-opacity-70 p-4 rounded">
                        <h4 className={`font-semibold ${priorityConfig.text} mb-2 text-sm`}>Impact if Unaddressed:</h4>
                        <p className={`text-sm ${priorityConfig.text}`}>{question.impact}</p>
                      </div>
                    )}

                    {/* Answer Placeholder */}
                    <div className="mt-4 pt-4 border-t-2 border-opacity-20 border-gray-300">
                      <label className={`font-semibold ${priorityConfig.text} text-sm block mb-2`}>Your Answer:</label>
                      <textarea
                        placeholder="Enter your answer here..."
                        className={`w-full px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 ${priorityConfig.border}`}
                        rows="3"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.priority === 'critical').length}
            </div>
            <div className="text-xs text-red-700 mt-1">Critical</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {questions.filter(q => q.priority === 'high').length}
            </div>
            <div className="text-xs text-orange-700 mt-1">High Priority</div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.priority === 'medium').length}
            </div>
            <div className="text-xs text-yellow-700 mt-1">Medium</div>
          </div>
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.priority === 'low').length}
            </div>
            <div className="text-xs text-green-700 mt-1">Low Priority</div>
          </div>
        </div>
      )}

      {/* Ambiguity Score (if available) */}
      {ambiguity && ambiguity.score !== undefined && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Requirement Clarity Score</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-900">Overall Clarity</span>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(ambiguity.score * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all"
                style={{ width: `${ambiguity.score * 100}%` }}
              />
            </div>
          </div>

          {/* Clarity Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Clarity Level:</h4>
              <p className={`text-lg font-bold ${
                ambiguity.score >= 0.9 ? 'text-green-600' :
                ambiguity.score >= 0.7 ? 'text-blue-600' :
                ambiguity.score >= 0.5 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {ambiguity.score >= 0.9 ? 'Excellent' :
                 ambiguity.score >= 0.7 ? 'Good' :
                 ambiguity.score >= 0.5 ? 'Fair' :
                 'Needs Improvement'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Improvement Potential:</h4>
              <p className="text-lg font-bold text-blue-600">
                {Math.round((1 - ambiguity.score) * 100)}%
              </p>
            </div>
          </div>

          {/* Ambiguity Factors */}
          {ambiguity.factors && ambiguity.factors.length > 0 && (
            <div className="mt-6 pt-6 border-t-2 border-blue-400">
              <h4 className="font-semibold text-blue-900 mb-3">Ambiguity Factors Found:</h4>
              <div className="flex flex-wrap gap-2">
                {ambiguity.factors.map((factor, idx) => (
                  <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">💡 Recommendations</h3>
        <ul className="space-y-3">
          <li className="text-sm text-purple-900 flex items-start gap-3">
            <span className="mt-1">1️⃣</span>
            <span>Answer critical and high-priority questions first to address key ambiguities</span>
          </li>
          <li className="text-sm text-purple-900 flex items-start gap-3">
            <span className="mt-1">2️⃣</span>
            <span>Involve stakeholders in answering questions about scope and success criteria</span>
          </li>
          <li className="text-sm text-purple-900 flex items-start gap-3">
            <span className="mt-1">3️⃣</span>
            <span>Document answers clearly and share with team for alignment</span>
          </li>
          <li className="text-sm text-purple-900 flex items-start gap-3">
            <span className="mt-1">4️⃣</span>
            <span>Re-run analysis after addressing questions to improve clarity score</span>
          </li>
          <li className="text-sm text-purple-900 flex items-start gap-3">
            <span className="mt-1">5️⃣</span>
            <span>Use clarified requirements to update decomposition and feasibility plans</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
