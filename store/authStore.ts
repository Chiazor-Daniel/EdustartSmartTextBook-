import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUIStore } from "./uiStore";

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

const isClient = typeof window !== "undefined"; // only true on device/browser

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (token, userData) => {
        if (isClient) {
          try {
            await AsyncStorage.setItem("auth-token", token);
            await AsyncStorage.setItem("auth-user", JSON.stringify(userData));
          } catch (error) {
            console.error("Error storing auth data:", error);
          }
        }
        set({ token, user: userData });
        useUIStore.getState().resetUIState();
      },
      logout: async () => {
        if (isClient) {
          try {
            await AsyncStorage.removeItem("auth-token");
            await AsyncStorage.removeItem("auth-user");
          } catch (error) {
            console.error("Error clearing auth data:", error);
          }
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: isClient ? createJSONStorage(() => AsyncStorage) : undefined,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => async (state) => {
        if (!state && isClient) {
          try {
            const token = await AsyncStorage.getItem("auth-token");
            const userStr = await AsyncStorage.getItem("auth-user");
            const user = userStr ? JSON.parse(userStr) : null;
            useAuthStore.setState({ token, user });
          } catch (error) {
            console.error("Error initializing auth state:", error);
          }
        }
      },
    },
  ),
);
