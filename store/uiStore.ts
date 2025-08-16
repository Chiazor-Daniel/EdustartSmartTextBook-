import { create } from 'zustand';

interface UIState {
  isHeaderVisible: boolean;
  setHeaderVisible: (visible: boolean) => void;

  isBottomNavVisible: boolean;
  setBottomNavVisible: (visible: boolean) => void;

  resetUIState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isHeaderVisible: true,
  setHeaderVisible: (visible) => set({ isHeaderVisible: visible }),

  isBottomNavVisible: true,
  setBottomNavVisible: (visible) => set({ isBottomNavVisible: visible }),

  resetUIState: () => set({ isHeaderVisible: true, isBottomNavVisible: true }),
}));
