import { api } from '@/lib/api';

export const tendersService = {
  create: async (data: any) => {
    const res = await api.post('/tenders', data);
    return res.data;
  },

  getByProject: async (projectId: string) => {
    const res = await api.get(`/tenders/project/${projectId}`);
    return res.data;
  },

  getOpenTenders: async () => {
    const res = await api.get('/tenders/marketplace/open');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/tenders/${id}`);
    return res.data;
  }
};