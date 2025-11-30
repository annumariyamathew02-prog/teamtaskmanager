// client/src/services/teamService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/teams';

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

// Get all teams for the logged-in user
export const getTeams = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

// Get team by ID
export const getTeamById = async (teamId) => {
  try {
    const response = await api.get(`/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

// Create a new team
export const createTeam = async (teamData) => {
  try {
    const response = await api.post('/', teamData);
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Update a team
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await api.put(`/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

// Delete a team
export const deleteTeam = async (teamId) => {
  try {
    const response = await api.delete(`/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};