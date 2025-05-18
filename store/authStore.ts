import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
  token: string | null;
  expiresAt: string | null;
  user: {
    id: number;
    email: string;
    full_name: string;
    user_type: string;
    organization: {
      id: number;
      name: string;
    };
  } | null;
  login: (token: string, expiresAt: string, userData: any) => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      isLoading: false,
      error: null,
      login: (token, expiresAt, userData) => set({ token, expiresAt, user: userData }),
      logout: () => set({ token: null, expiresAt: null, user: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        return !!token && new Date(expiresAt || '') > new Date();
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
