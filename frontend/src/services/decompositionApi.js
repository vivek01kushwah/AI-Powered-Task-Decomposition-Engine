import axios from 'axios';

// Get API URL from environment or use localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Decompose a project description into tasks
 */
export const decomposeProject = async (data) => {
  try {
    const response = await apiClient.post('/api/decompose', data);
    return response.data;
  } catch (error) {
    console.error('Decomposition error:', error);
    throw error;
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Get database status
 */
export const getDatabaseStatus = async () => {
  try {
    const response = await apiClient.get('/api/debug/db-status');
    return response.data;
  } catch (error) {
    console.error('Database status error:', error);
    throw error;
  }
};

/**
 * Get recent analysis results
 */
export const getRecentAnalysis = async () => {
  try {
    const response = await apiClient.get('/api/debug/recent-analysis');
    return response.data;
  } catch (error) {
    console.error('Recent analysis error:', error);
    throw error;
  }
};

export default apiClient;
