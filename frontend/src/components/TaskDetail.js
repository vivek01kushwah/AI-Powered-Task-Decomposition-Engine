import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TaskDetail({ onTaskUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${id}`);
      const data = await response.json();
      if (data.success) {
        setTask(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setTask(data.data);
        setIsEditing(false);
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDecompose = async () => {
    try {
      const response = await fetch('/api/decompositions/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, method: 'hierarchical' }),
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/decomposition/${data.data._id}`);
      }
    } catch (error) {
      console.error('Error decomposing task:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!task) {
    return <div className="text-center py-12">Task not found</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="text-3xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          )}
        </div>
        <div className="space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDecompose}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Decompose Task
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(task);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          {isEditing ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          ) : (
            <p className="text-gray-900">{task.status}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          {isEditing ? (
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <p className="text-gray-900">{task.priority}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        {isEditing ? (
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="4"
          />
        ) : (
          <p className="text-gray-900">{task.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
          {isEditing ? (
            <input
              type="text"
              name="assignee"
              value={formData.assignee || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="text-gray-900">{task.assignee || 'Not assigned'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
          {isEditing ? (
            <input
              type="date"
              name="deadline"
              value={formData.deadline ? formData.deadline.split('T')[0] : ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="text-gray-900">
              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
        <p className="text-gray-600">{new Date(task.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default TaskDetail;
