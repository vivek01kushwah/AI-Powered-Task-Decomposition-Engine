import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiService = {
  // Task endpoints
  getTasks: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return axios.get(`${API_BASE_URL}/tasks${params ? '?' + params : ''}`);
  },

  getTaskById: (id) => axios.get(`${API_BASE_URL}/tasks/${id}`),

  createTask: (taskData) => axios.post(`${API_BASE_URL}/tasks`, taskData),

  updateTask: (id, taskData) => axios.put(`${API_BASE_URL}/tasks/${id}`, taskData),

  deleteTask: (id) => axios.delete(`${API_BASE_URL}/tasks/${id}`),

  // Decomposition endpoints
  decomposeTask: (taskId, method) =>
    axios.post(`${API_BASE_URL}/decompositions/decompose`, { taskId, method }),

  getDecomposition: (id) => axios.get(`${API_BASE_URL}/decompositions/${id}`),

  getTaskDecompositions: (taskId) =>
    axios.get(`${API_BASE_URL}/decompositions/task/${taskId}`),

  updateDecomposition: (id, data) =>
    axios.put(`${API_BASE_URL}/decompositions/${id}`, data),

  deleteDecomposition: (id) => axios.delete(`${API_BASE_URL}/decompositions/${id}`),
};

export default apiService;
