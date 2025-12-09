import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  name: string;
  avatar: string;
  stunServer: string;
  turnServer: string;
  turnUsername: string;
  turnPassword: string;
  setSettings: (name: string, avatar: string, stun: string, turn: string, username: string, password: string) => void;
  setName: (name: string) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  name: '',
  avatar: '',
  stunServer: 'stun:stun.l.google.com:19302',
  turnServer: '',
  turnUsername: '',
  turnPassword: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setSettings: (name, avatar, stunServer, turnServer, turnUsername, turnPassword) =>
        set({ name, avatar, stunServer, turnServer, turnUsername, turnPassword }),
      setName: (name) => set({ name }),
      resetToDefaults: () => set({...defaultSettings, name: get().name }),
    }),
    {
      name: 'webrtc-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
