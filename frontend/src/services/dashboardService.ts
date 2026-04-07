import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const dashboardService = {
  getCompanyDashboard: async () => {
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        token = token.replace(/['"]+/g, '').trim();
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get('/dashboard/company', { headers });
    return response.data;
  },

  getSuperAdminDashboard: async () => {
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        token = token.replace(/['"]+/g, '').trim();
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await api.get('/dashboard/superadmin', { headers });
    return response.data;
  }
};