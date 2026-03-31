import { api } from '@/lib/api';

export const bidsService = {
  create: async (data: any) => {
    const res = await api.post('/bids', data);
    return res.data;
  },

  getByTender: async (tenderId: string) => {
    const res = await api.get(`/bids/tender/${tenderId}`);
    return res.data;
  },

  getMyBids: async () => {
    const res = await api.get('/bids/my-bids');
    return res.data;
  },

  adjudicate: async (bidId: string) => {
    const res = await api.post(`/bids/${bidId}/adjudicate`);
    return res.data;
  }
};