const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  budget?: number;
  status: 'planning' | 'in_progress' | 'finished' | 'paused';
  createdAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  address?: string;
  budget?: number;
  status?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token') || '';
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const projectsService = {
  async getAll() {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Error al obtener proyectos');
    
    const result = await res.json();
    return result.success ? result.data : result;
  },

  async create(data: CreateProjectData) {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al crear proyecto');
    }

    const result = await res.json();
    return result.success ? result.data : result;
  },

  async getById(id: string) {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include', 
    });

    if (!res.ok) throw new Error('Error al obtener el proyecto');
    
    const result = await res.json();
    return result.success ? result.data : result;
  },
  
  async update(id: string, data: Partial<CreateProjectData>) {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar el proyecto');
    }

    const result = await res.json();
    return result.success ? result.data : result;
  },
};