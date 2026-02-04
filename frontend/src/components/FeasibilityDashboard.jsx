import React, { useState, useEffect } from 'react';

/**
 * FeasibilityDashboard Component
 * 
 * Visualizes project feasibility score with gauge, warnings, and timeline breakdown
 * Shows available vs required hours and provides recommendations
 */
export default function FeasibilityDashboard({ feasibility = {} }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score on mount
    const score = feasibility.score || 0;
    let current = 0;
    const timer = setInterval(() => {
      current += score / 20;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 50);

    return () => clearInterval(timer);
  }, [feasibility.score]);

  /**
   * Get feasibility level and color
   */
  const getFeasibilityConfig = (score) => {
    score = score || 0;
    if (score >= 0.9) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-400',
        gaugeColor: '#10b981',
        emoji: '🚀'
      };
    } else if (score >= 0.7) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-400',
        gaugeColor: '#3b82f6',
        emoji: '✅'
      };
    } else if (score >= 0.5) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-400',
        gaugeColor: '#f59e0b',
        emoji: '⚠️'
      };
    } else if (score >= 0.3) {
      return {
        level: 'Challenging',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        gaugeColor: '#f97316',
        emoji: '💪'
      };
    } else {
      return {
        level: 'Unrealistic',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-400',
        gaugeColor: '#ef4444',
        emoji: '❌'
      };
    }
  };

  const config = getFeasibilityConfig(feasibility.score);

  /**
   * Get warning icon and color
   */
  const getWarningConfig = (warningType) => {
    const configs = {
      'timeline': {
        icon: '⏰',
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-400'
      },
      'team-capacity': {
        icon: '👥',
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-400'
      },
      'scope-overflow': {
        icon: '📦',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-400'
      },
      'quality-risk': {
        icon: '⚙️',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-400'
      },
      'complexity': {
        icon: '🧩',
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-400'
      },
      'team-size': {
        icon: '👤',
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        border: 'border-pink-400'
      },
      'buffer': {
        icon: '📊',
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        border: 'border-indigo-400'
      },
      'critical-path': {
        icon: '🔗',
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        border: 'border-cyan-400'
      }
    };
    return configs[warningType] || configs['timeline'];
  };

  /**
   * Render circular gauge
   */
  const renderGauge = () => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 1) * circumference;

    return (
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={config.gaugeColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${config.color}`}>
              {(animatedScore * 100).toFixed(0)}%
            </div>
            <div className={`text-sm font-semibold ${config.color} mt-2`}>
              {config.level}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render timeline breakdown
   */
  const renderTimeline = () => {
    if (!feasibility.metrics) return null;

    const available = feasibility.metrics.availableHours || 0;
    const required = feasibility.metrics.criticalPathHours || 0;
    const total = feasibility.metrics.totalHours || 0;
    const maxHours = Math.max(available, required, total);

    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">⏱️ Timeline Breakdown</h4>

        {/* Available Hours */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Available Hours</label>
            <span className="text-sm font-bold text-green-600">{available.toFixed(1)} hrs</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${(available / maxHours) * 100}%` }}
            />
          </div>
        </div>

        {/* Critical Path Hours */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Critical Path Required</label>
            <span className="text-sm font-bold text-blue-600">{required.toFixed(1)} hrs</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${(required / maxHours) * 100}%` }}
            />
          </div>
        </div>

        {/* Total Hours */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Total All Tasks</label>
            <span className="text-sm font-bold text-purple-600">{total.toFixed(1)} hrs</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full"
              style={{ width: `${(total / maxHours) * 100}%` }}
            />
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-gray-200">
          {feasibility.metrics.availableDays && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {feasibility.metrics.availableDays}
              </div>
              <div className="text-xs text-gray-600 mt-1">Available Days</div>
            </div>
          )}
          {feasibility.metrics.criticalPathDays && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {feasibility.metrics.criticalPathDays}
              </div>
              <div className="text-xs text-gray-600 mt-1">Critical Path Days</div>
            </div>
          )}
          {feasibility.metrics.parallelism && (
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {feasibility.metrics.parallelism.toFixed(2)}x
              </div>
              <div className="text-xs text-gray-600 mt-1">Parallelism</div>
            </div>
          )}
          {feasibility.metrics.bufferDays && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${feasibility.metrics.bufferDays > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {feasibility.metrics.bufferDays > 0 ? '+' : ''}{feasibility.metrics.bufferDays}
              </div>
              <div className="text-xs text-gray-600 mt-1">Buffer Days</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render recommendations
   */
  const renderRecommendations = () => {
    const score = feasibility.score || 0;
    let recommendations = [];

    if (score >= 0.9) {
      recommendations = [
        '✅ Project timeline is very comfortable',
        '✅ Team has sufficient capacity',
        '✅ Recommend proceeding with planned scope'
      ];
    } else if (score >= 0.7) {
      recommendations = [
        '✅ Timeline is manageable',
        '⚠️ Consider adding 10-15% buffer',
        '✓ Team capacity is adequate for scope'
      ];
    } else if (score >= 0.5) {
      recommendations = [
        '⚠️ Timeline is tight',
        '⚠️ Consider reducing scope by 20%',
        '⚠️ Add additional team members or resources',
        '⚠️ Implement aggressive project management'
      ];
    } else if (score >= 0.3) {
      recommendations = [
        '❌ Timeline is very challenging',
        '❌ Recommend reducing scope by 40-50%',
        '❌ Consider extending deadline',
        '❌ Significantly increase team size',
        '❌ Focus only on MVP features'
      ];
    } else {
      recommendations = [
        '❌ Project timeline is unrealistic',
        '❌ Major scope reduction required (70%+)',
        '❌ Deadline negotiation necessary',
        '❌ Phase project into multiple releases',
        '❌ Reassess requirements completely'
      ];
    }

    return (
      <div className={`${config.bg} border-2 ${config.border} rounded-lg p-6 mb-6`}>
        <h4 className={`text-lg font-semibold ${config.color} mb-4`}>💡 Recommendations</h4>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className={`text-sm ${config.color} flex items-start gap-3`}>
              <span className="mt-1">{rec.charAt(0)}</span>
              <span>{rec.slice(3)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {config.emoji} Feasibility Assessment
        </h2>
        <p className="text-gray-600">
          Analysis of project timeline and resource requirements
        </p>
      </div>

      {/* Main Score Gauge */}
      <div className={`${config.bg} border-2 ${config.border} rounded-lg p-8 mb-8`}>
        {renderGauge()}
        <div className="text-center">
          <p className={`text-lg font-semibold ${config.color} mb-2`}>
            Overall Feasibility Score
          </p>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            {config.level === 'Excellent' && 'Your project has excellent feasibility. You have comfortable resources and timeline.'}
            {config.level === 'Good' && 'Your project is feasible. Some areas need attention but overall healthy.'}
            {config.level === 'Fair' && 'Your project is challenging. Careful planning and risk management required.'}
            {config.level === 'Challenging' && 'Your project is very tight. Major adjustments needed to succeed.'}
            {config.level === 'Unrealistic' && 'Your project timeline is not achievable with current constraints.'}
          </p>
        </div>
      </div>

      {/* Timeline Breakdown */}
      {renderTimeline()}

      {/* Warnings */}
      {feasibility.warnings && feasibility.warnings.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Project Warnings</h4>
          <div className="space-y-3">
            {feasibility.warnings.map((warning, idx) => {
              const warnConfig = getWarningConfig(warning.type);
              return (
                <div
                  key={idx}
                  className={`${warnConfig.bg} border-2 ${warnConfig.border} rounded-lg p-4 flex items-start gap-4`}
                >
                  <span className="text-xl flex-shrink-0">{warnConfig.icon}</span>
                  <div className="flex-1">
                    <h5 className={`font-semibold ${warnConfig.text} mb-1`}>
                      {warning.title || warning.type.replace(/-/g, ' ').toUpperCase()}
                    </h5>
                    <p className={`text-sm ${warnConfig.text}`}>{warning.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Risk Adjustments */}
      {feasibility.riskAdjustments && Object.keys(feasibility.riskAdjustments).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Risk Adjustments</h4>
          <div className="space-y-3">
            {Object.entries(feasibility.riskAdjustments).map(([type, value]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium">
                  {type.replace(/_/g, ' ').toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${
                    value > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {feasibility.actionItems && feasibility.actionItems.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">⏭️ Action Items</h4>
          <ol className="space-y-2">
            {feasibility.actionItems.map((item, idx) => (
              <li key={idx} className="text-sm text-blue-900 flex gap-3">
                <span className="font-semibold flex-shrink-0">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
