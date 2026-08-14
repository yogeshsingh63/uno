import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  toggleHaptics: () => void;
  setHaptics: (enabled: boolean) => void;
  toggleSound: () => void;
  setSound: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hapticsEnabled: true,
      soundEnabled: true,
      toggleHaptics: () => set((s) => ({ hapticsEnabled: !s.hapticsEnabled })),
      setHaptics: (enabled) => set({ hapticsEnabled: enabled }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setSound: (enabled) => set({ soundEnabled: enabled }),
    }),
    {
      name: 'uno-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
