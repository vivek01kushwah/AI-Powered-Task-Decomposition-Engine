import React, { useState } from 'react';
import { decomposeProject } from '../services/decompositionApi';

/**
 * DecompositionForm Component
 * 
 * Captures project description and constraints from user
 * Submits to /api/decompose endpoint for project decomposition analysis
 */
export default function DecompositionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    description: '',
    constraints: {
      teamSize: 5,
      hoursPerDay: 8,
      maxTasks: 100
      // deadline: ''  // COMMENTED OUT: NOT NEEDED
    }
  });

  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        description: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        constraints: {
          ...prev.constraints,
          [name]: isNaN(value) ? value : parseFloat(value)
        }
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters for proper analysis';
    }

    if (formData.constraints.teamSize < 1 || formData.constraints.teamSize > 100) {
      newErrors.teamSize = 'Team size must be between 1 and 100';
    }

    if (formData.constraints.hoursPerDay < 1 || formData.constraints.hoursPerDay > 24) {
      newErrors.hoursPerDay = 'Hours per day must be between 1 and 24';
    }

    if (formData.constraints.maxTasks < 1 || formData.constraints.maxTasks > 500) {
      newErrors.maxTasks = 'Max tasks must be between 1 and 500';
    }

    // Deadline validation - COMMENTED OUT: NOT NEEDED
    // if (formData.constraints.deadline && isNaN(Date.parse(formData.constraints.deadline))) {
    //   newErrors.deadline = 'Please enter a valid deadline date';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLocalLoading(true);

    try {
      // Format data for backend
      const requestData = {
        description: formData.description,
        teamSize: formData.constraints.teamSize,
        hoursPerDay: formData.constraints.hoursPerDay,
        maxTasks: formData.constraints.maxTasks
        // deadline: formData.constraints.deadline || undefined  // COMMENTED OUT: NOT NEEDED
      };

      const response = await decomposeProject(requestData);
      
      if (onSubmit) {
        onSubmit(response);
      }

      // Reset form
      setFormData({
        description: '',
        constraints: {
          teamSize: 5,
          hoursPerDay: 8,
          maxTasks: 100
          // deadline: ''  // COMMENTED OUT: NOT NEEDED
        }
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to decompose project';
      setErrors({ submit: errorMessage });
    } finally {
      setLocalLoading(false);
    }
  };

  const isFormLoading = localLoading || isLoading;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Project Decomposition</h2>
        <p className="text-gray-600">
          Describe your project and set constraints. Our AI will decompose it into actionable tasks.
        </p>
      </div>

      {/* Error Alert */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">❌ {errors.submit}</p>
        </div>
      )}

      {/* Project Description Section */}
      <div className="mb-8">
        <label htmlFor="description" className="block text-lg font-semibold text-gray-700 mb-3">
          Project Description
          <span className="text-red-500 ml-1">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Include key features, technologies, and requirements. Example: "E-commerce platform with product catalog, shopping cart, and Stripe payment integration"
        </p>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project in detail..."
          rows="6"
          className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm focus:outline-none transition ${
            errors.description
              ? 'border-red-500 focus:border-red-600 bg-red-50'
              : 'border-gray-300 focus:border-blue-500 bg-white'
          }`}
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">⚠️ {errors.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          {formData.description.length} characters
        </p>
      </div>

      {/* Constraints Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Project Constraints</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Size */}
          <div>
            <label htmlFor="teamSize" className="block text-sm font-semibold text-gray-700 mb-2">
              Team Size
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="teamSize"
                name="teamSize"
                value={formData.constraints.teamSize}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full px-4 py-2 pr-20 border-2 rounded-lg focus:outline-none transition ${
                  errors.teamSize
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500 pointer-events-none font-medium">members</span>
            </div>
            {errors.teamSize && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.teamSize}</p>
            )}
            <p className="mt-2 text-xs text-gray-600">1-100 recommended</p>
          </div>

          {/* Hours Per Day */}
          <div>
            <label htmlFor="hoursPerDay" className="block text-sm font-semibold text-gray-700 mb-2">
              Hours Per Day
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="hoursPerDay"
                name="hoursPerDay"
                value={formData.constraints.hoursPerDay}
                onChange={handleChange}
                min="1"
                max="24"
                step="0.5"
                className={`w-full px-4 py-2 pr-16 border-2 rounded-lg focus:outline-none transition ${
                  errors.hoursPerDay
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500 pointer-events-none font-medium">hrs</span>
            </div>
            {errors.hoursPerDay && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.hoursPerDay}</p>
            )}
            <p className="mt-2 text-xs text-gray-600">Typical: 8 hours/day</p>
          </div>

          {/* Max Tasks */}
          <div>
            <label htmlFor="maxTasks" className="block text-sm font-semibold text-gray-700 mb-2">
              Max Tasks
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="maxTasks"
                name="maxTasks"
                value={formData.constraints.maxTasks}
                onChange={handleChange}
                min="1"
                max="500"
                className={`w-full px-4 py-2 pr-20 border-2 rounded-lg focus:outline-none transition ${
                  errors.maxTasks
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              <span className="absolute right-4 top-2.5 text-gray-500 pointer-events-none font-medium">tasks</span>
            </div>
            {errors.maxTasks && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.maxTasks}</p>
            )}
            <p className="mt-2 text-xs text-gray-600">1-500 recommended</p>
          </div>

          {/* Deadline - COMMENTED OUT: NOT NEEDED */}
          {/* 
          <div>
            <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
              Target Deadline
              <span className="text-gray-400 ml-1">(Optional)</span>
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.constraints.deadline}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                errors.deadline
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.deadline && (
              <p className="mt-2 text-sm text-red-600">⚠️ {errors.deadline}</p>
            )}
            <p className="mt-2 text-xs text-gray-600">If not set, assumes 30 days</p>
          </div>
          */}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isFormLoading}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
            isFormLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isFormLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              🚀 Decompose Project
            </>
          )}
        </button>
        <button
          type="reset"
          disabled={isFormLoading}
          className="py-3 px-6 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Pro Tip:</strong> Be specific with your project description. Include technologies, must-have features, and any special requirements for better decomposition.
        </p>
      </div>
    </form>
  );
}
