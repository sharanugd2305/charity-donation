// API Configuration - Update these URLs when backend is ready
const API_BASE_URL = 'http://localhost:8000/api';

const API_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login/`,
  signup: `${API_BASE_URL}/auth/signup/`,
  ngos: `${API_BASE_URL}/ngos/`,
  campaigns: `${API_BASE_URL}/campaigns/`,
  donations: `${API_BASE_URL}/donations/`,
  impact: `${API_BASE_URL}/impact/`,
  userProfile: `${API_BASE_URL}/user/profile/`,
  adminDashboard: `${API_BASE_URL}/admin/dashboard/`,
  feedback: `${API_BASE_URL}/feedback/`,
};

export { API_BASE_URL, API_ENDPOINTS };
