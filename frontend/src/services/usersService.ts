import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UserProfileData {
  walletAddress?: string;
  cuil?: string;
  cbu?: string;
  alias?: string;
  razonSocial?: string;
}

export const usersService = {
  async getProviders() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/users/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Error al cargar proveedores');
    
    const result = await res.json();
    return result.success ? result.data : result;
  },

  getMe: async (token: string) => {
    const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (data: UserProfileData, token: string) => {
    const response = await axios.patch(`${API_URL}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};