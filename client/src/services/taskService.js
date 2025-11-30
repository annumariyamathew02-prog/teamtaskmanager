// client/src/services/taskService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all tasks for the logged-in user
export const getTasks = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized error (token expired, etc.)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get tasks by status
export const getTasksByStatus = async (status) => {
  try {
    const response = await api.get(`/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${status} tasks:`, error);
    throw error;
  }
};

// Get tasks by team
export const getTasksByTeam = async (teamId) => {
  try {
    const response = await api.get(`/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    throw error;
  }
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByStatus,
  getTasksByTeam,
};