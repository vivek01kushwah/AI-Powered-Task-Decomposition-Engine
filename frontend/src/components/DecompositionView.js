import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DecompositionView() {
  const { id } = useParams();
  const [decomposition, setDecomposition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecomposition();
  }, [id]);

  const fetchDecomposition = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/decompositions/${id}`);
      const data = await response.json();
      if (data.success) {
        setDecomposition(data.data);
      }
    } catch (error) {
      console.error('Error fetching decomposition:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!decomposition) {
    return <div className="text-center py-12">Decomposition not found</div>;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{decomposition.originalTask}</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Method</h3>
            <p className="text-lg font-bold text-gray-900">{decomposition.decompositionMethod}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Complexity</h3>
            <p className="text-lg font-bold text-gray-900">{decomposition.complexity}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Estimated Hours</h3>
            <p className="text-lg font-bold text-gray-900">{decomposition.estimatedTotalHours}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Subtasks</h3>
            <p className="text-lg font-bold text-gray-900">{decomposition.subtasks.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subtasks</h2>
        <div className="space-y-4">
          {decomposition.subtasks.map((subtask, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{subtask.title}</h3>
                  <p className="text-gray-600 mt-2">{subtask.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(subtask.priority)}`}>
                  {subtask.priority}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">Estimated Hours:</span>
                <span className="text-lg font-bold text-blue-600">{subtask.estimatedHours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Summary</h3>
        <p className="text-blue-700">
          This task has been decomposed into <strong>{decomposition.subtasks.length}</strong> subtasks using the{' '}
          <strong>{decomposition.decompositionMethod}</strong> method. The estimated total effort is{' '}
          <strong>{decomposition.estimatedTotalHours} hours</strong>, with a complexity level of{' '}
          <strong>{decomposition.complexity}</strong>.
        </p>
      </div>
    </div>
  );
}

export default DecompositionView;
