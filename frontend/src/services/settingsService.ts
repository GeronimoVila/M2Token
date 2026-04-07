import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const settingsService = {
  getGlobalSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/global`, {
      withCredentials: true,
    });
    return response.data;
  },

  updateGlobalSettings: async (data: { precioM2: number; tokensPorM2: number }) => {
    const response = await axios.put(`${API_URL}/settings/global`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`, {
      withCredentials: true,
    });
    return response.data.data || response.data;
  },

  createCategory: async (name: string, description?: string) => {
    const response = await axios.post(`${API_URL}/categories`, { name, description }, {
      withCredentials: true,
    });
    return response.data;
  },

  deleteCategory: async (categoryId: string) => {
    const response = await axios.delete(`${API_URL}/categories/${categoryId}`, {
      withCredentials: true,
    });
    return response.data;
  }
};