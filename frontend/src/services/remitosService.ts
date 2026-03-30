import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateRemitoPayload {
  projectId: string;
  numeroRemito: string;
  descripcion: string;
  monto: number;
  fechaEntrega: string;
  file: File;
}

const getHeaders = (token?: string, isMultipart = false) => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (isMultipart) headers['Content-Type'] = 'multipart/form-data';
  return headers;
};

export const remitosService = {
  upload: async (payload: CreateRemitoPayload, token?: string) => {
    const formData = new FormData();
    
    formData.append('projectId', payload.projectId);
    formData.append('numeroRemito', payload.numeroRemito);
    formData.append('descripcion', payload.descripcion);
    formData.append('monto', payload.monto.toString());
    formData.append('fechaEntrega', payload.fechaEntrega);
    formData.append('file', payload.file);

    try {
      const response = await axios.post(`${API_URL}/remitos`, formData, {
        headers: getHeaders(token, true),
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error subiendo remito:', error);
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  getByProject: async (projectId: string, token?: string) => {
    if (!projectId || projectId === 'undefined') {
        throw new Error("ID de proyecto inválido");
    }

    try {
      const response = await axios.get(`${API_URL}/remitos/project/${projectId}`, {
        headers: getHeaders(token),
        withCredentials: true,
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return response.data; 
      
    } catch (error: any) {
      throw error.response?.data || { message: 'Error al obtener remitos' };
    }
  },

  validate: async (id: string, estado: 'validado' | 'rechazado', token?: string) => {
    try {
      const response = await axios.patch(
        `${API_URL}/remitos/${id}/validate`,
        { estado }, 
        { 
          headers: getHeaders(token),
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Error al validar remito' };
    }
  },

  getMyRemitos: async (token?: string) => {
    try {
      const response = await axios.get(`${API_URL}/remitos/my-remitos`, {
        headers: getHeaders(token),
        withCredentials: true,
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Error al obtener mis remitos' };
    }
  },
};