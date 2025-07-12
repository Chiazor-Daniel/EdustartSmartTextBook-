import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type User = {
  id: number;
  email: string;
  full_name: string;
  user_type: string;
  organization: {
    id: number;
    name: string;
  };
};

type AuthState = {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

// Initialize state from cache
const initializeState = async () => {
  try {
    const token = await AsyncStorage.getItem('auth-token');
    const userStr = await AsyncStorage.getItem('auth-user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.error('Error initializing auth state:', error);
    return { token: null, user: null };
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (token, userData) => {
        try {
          await AsyncStorage.setItem('auth-token', token);
          await AsyncStorage.setItem('auth-user', JSON.stringify(userData));
          set({ token, user: userData });
        } catch (error) {
          console.error('Error storing auth data:', error);
          throw error;
        }
      },
      logout: async () => {
        try {
          await AsyncStorage.removeItem('auth-token');
          await AsyncStorage.removeItem('auth-user');
          set({ token: null, user: null });
        } catch (error) {
          console.error('Error clearing auth data:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => async (state) => {
        if (!state) {
          const { token, user } = await initializeState();
          useAuthStore.setState({ token, user });
        }
      }
    }
  )
);
