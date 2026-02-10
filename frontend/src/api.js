import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const getCurrentUser = () =>
  api.get('/auth/me');

// Users
export const getUsers = () =>
  api.get('/users');

export const createUser = (userData) =>
  api.post('/users', userData);

// Operatives
export const getOperatives = () =>
  api.get('/operatives');

export const getOperative = (id) =>
  api.get(`/operatives/${id}`);

export const createOperative = (data) =>
  api.post('/operatives', data);

export const updateOperative = (id, data) =>
  api.put(`/operatives/${id}`, data);

export const deleteOperative = (id) =>
  api.delete(`/operatives/${id}`);

// Jobs
export const getJobs = () =>
  api.get('/jobs');

export const getJob = (id) =>
  api.get(`/jobs/${id}`);

export const createJob = (data) =>
  api.post('/jobs', data);

export const updateJob = (id, data) =>
  api.put(`/jobs/${id}`, data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`);

export const addJobUpdate = (id, update_text) =>
  api.post(`/jobs/${id}/updates`, { update_text });

// Risk Assessments
export const getRiskAssessments = () =>
  api.get('/risk-assessments');

export const getJobRiskAssessments = (jobId) =>
  api.get(`/jobs/${jobId}/risk-assessments`);

export const createRiskAssessment = (data) =>
  api.post('/risk-assessments', data);

export const updateRiskAssessment = (id, data) =>
  api.put(`/risk-assessments/${id}`, data);

export const deleteRiskAssessment = (id) =>
  api.delete(`/risk-assessments/${id}`);

// Method Statements
export const getMethodStatements = () =>
  api.get('/method-statements');

export const getJobMethodStatements = (jobId) =>
  api.get(`/jobs/${jobId}/method-statements`);

export const createMethodStatement = (data) =>
  api.post('/method-statements', data);

export const updateMethodStatement = (id, data) =>
  api.put(`/method-statements/${id}`, data);

export const deleteMethodStatement = (id) =>
  api.delete(`/method-statements/${id}`);

// Dashboard
export const getDashboardStats = () =>
  api.get('/dashboard/stats');

export default api;
