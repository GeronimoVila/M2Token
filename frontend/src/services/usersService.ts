import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 403 && 
      (error.response?.data?.error?.includes('suspendida') || 
       error.response?.data?.message?.includes('suspendida') || 
       error.response?.data?.error?.includes('revocada'))
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        
        if (!window.location.pathname.includes('/auth/login')) {
          try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
          } catch (logoutError) {
          }
          
          window.location.href = '/auth/login?error=account_suspended';
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface UserProfileData {
  name?: string;
  password?: string;
  walletAddress?: string;
  cuil?: string;
  cuit?: string;
  cbu?: string;
  alias?: string;
  razonSocial?: string;
  category?: string;
  specialties?: string[];
  address?: string;
  description?: string;
  phone?: string;
  website?: string;
}

export const usersService = {
  async getProviders(params?: { category?: string; location?: string; search?: string }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `${API_URL}/users/providers${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Error al cargar proveedores');
    
    const result = await res.json();
    return result.success !== undefined ? result.data : result;
  },

  getMe: async (token?: string) => { 
    const response = await axios.get(`${API_URL}/users/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    });
    return response.data.data || response.data;
  },

  updateProfile: async (data: UserProfileData, token?: string) => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : '');
    const response = await axios.patch(`${API_URL}/users/profile`, data, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        withCredentials: true,
    });
    return response.data;
  },

  getMyCompany: async (token: string) => {
    const response = await axios.get(`${API_URL}/companies/my-company`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    });

    const data = response.data.success !== undefined ? response.data.data : response.data;
    if (Array.isArray(data)) return data.length > 0 ? data[0] : {};
    return data || {};
  },

  updateMyCompany: async (data: any, token: string) => {
    const response = await axios.patch(`${API_URL}/companies/my-company`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    });
    return response.data;
  },

  getTeam: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const response = await axios.get(`${API_URL}/users/team`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    });
    return response.data.data || response.data;
  },

  inviteUser: async (data: { email: string; name: string; role: string }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const response = await axios.post(`${API_URL}/users/invite`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    });
    
    return response.data.success !== undefined ? response.data.data : response.data;
  },

  getAllUsers: async (page: number = 1, limit: number = 20, search: string = '') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString() 
    });
    
    if (search) params.append('search', search);

    const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });
    return response.data;
  },

  toggleUserStatus: async (userId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const response = await axios.patch(`${API_URL}/users/${userId}/toggle-status`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });
    return response.data;
  }
};