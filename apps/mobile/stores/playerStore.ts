import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayerStore {
  playerId: string | null;
  playerName: string;
  avatar: string;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      playerId: null,
      playerName: '',
      avatar: '😎',
      setPlayerId: (id) => set({ playerId: id }),
      setPlayerName: (name) => set({ playerName: name }),
      setAvatar: (avatar) => set({ avatar }),
      reset: () => set({ playerId: null, playerName: '', avatar: '😎' }),
    }),
    {
      name: 'uno-player-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
