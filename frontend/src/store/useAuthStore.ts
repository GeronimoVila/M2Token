import { create } from 'zustand';
import { usersService } from '@/services/usersService';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  fetchUser: async () => {
    try {
      const userData = await usersService.getMe();
      set({ user: userData, isLoading: false });
    } catch (error) {
      console.error("No hay sesión activa");
      set({ user: null, isLoading: false });
    }
  },

  logout: () => set({ user: null, isLoading: false }),
}));