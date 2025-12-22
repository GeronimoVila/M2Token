import { api } from "@/lib/api";

export interface CreateCanjeDto {
  projectId: string;
  amountTokens: number;
  tipo: 'DINERO' | 'ACTIVO';
  descripcionActivo?: string;
}

export const canjesService = {

  async getMyCanjes() {
    const response = await api.get('/canjes/my-canjes');
    return response.data.data || response.data;
  },

  async createCanje(data: CreateCanjeDto) {
    const response = await api.post('/canjes', data);
    return response.data.data || response.data;
  },

  async getCanjesByProject(projectId: string) {
    const response = await api.get(`/canjes/project/${projectId}`);
    return response.data.data || response.data;
  },

  async confirmPaymentAndBurn(canjeId: string) {
    const response = await api.post(`/canjes/${canjeId}/confirm-payment`);
    return response.data.data || response.data;
  }
};