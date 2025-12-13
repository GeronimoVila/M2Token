import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateAssignmentData {
  projectId: string;
  providerId: string;
}

export const assignmentsService = {
  async assignProvider(data: CreateAssignmentData) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al asignar proveedor');
    }
    
    const result = await res.json();
    return result.success ? result.data : result;
  },

  async getMyAssignments() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_URL}/assignments/my-projects`, { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!res.ok) throw new Error('Error al cargar asignaciones');
    const result = await res.json();
    return result.success ? result.data : result;
  },

  getMyProjects: async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/assignments/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Error al obtener proyectos' };
    }
  },
};