import { api } from "../lib/api"; 

export const blockchainService = {

  async getBalance(wallet: string, projectId: string) {
    const response = await api.get(`/blockchain/balance`, {
      params: { wallet, projectId }
    });
    
    return response.data.data || response.data; 
  },
};