import { create } from 'zustand';
import { useSettingsStore } from './settings';

export type UIScreen = 'connection' | 'settings' | 'chat';

interface UIState {
  currentScreen: UIScreen;
  setScreen: (screen: UIScreen) => void;
  tooltipMessage: string | null;
  showTooltip: (message: string) => void;
  peerActive: boolean;
  setPeerActive: (active: boolean) => void;
}

const settingsComplete = () => {
  const { name } = useSettingsStore.getState();
  return !!name;
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: settingsComplete() ? 'connection' : 'settings',
  setScreen: (screen) => set({ currentScreen: settingsComplete() ? screen : 'settings' }),
  tooltipMessage: null,
  showTooltip: (message) => {
    set({ tooltipMessage: message });
    setTimeout(() => set({ tooltipMessage: null }), 2000);
  },
  peerActive: true,
  setPeerActive: (active) => set({ peerActive: active }),
}));
