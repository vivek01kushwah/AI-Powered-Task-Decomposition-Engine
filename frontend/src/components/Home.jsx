import React, { useState } from 'react';
import DecompositionForm from './DecompositionForm';
import DecompositionResults from './DecompositionResults';

/**
 * Home Component
 * Main landing page with decomposition form and results display
 */
export default function Home() {
  const [results, setResults] = useState(null);

  const handleDecomposition = (data) => {
    setResults(data);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Task Decomposition Engine
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Break down complex project descriptions into atomic, actionable tasks
          </p>
          <p className="text-lg text-blue-100">
            Handle ambiguous requirements • Detect contradictions • Calculate feasibility
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Form Section */}
        <div className="mb-12">
          <DecompositionForm onSubmit={handleDecomposition} />
        </div>

        {/* Results Section */}
        {results && (
          <div id="results-section" className="mt-16">
            <DecompositionResults results={results} />
          </div>
        )}

        {/* Empty State */}
        {!results && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Submit a project description above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
