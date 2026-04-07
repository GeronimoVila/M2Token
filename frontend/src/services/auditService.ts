import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const auditService = {
  getLogs: async (filters?: any, page: number = 1, limit: number = 10) => {
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
        token = token.replace(/['"]+/g, '').trim();
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const params = new URLSearchParams();
    if (filters?.entity && filters.entity !== 'all') params.append('entity', filters.entity);
    if (filters?.empresa) params.append('empresa', filters.empresa);
    if (filters?.proyecto) params.append('proyecto', filters.proyecto);
    if (filters?.usuario) params.append('usuario', filters.usuario);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/audit/logs?${params.toString()}`, { headers });
    return response.data;
  }
};