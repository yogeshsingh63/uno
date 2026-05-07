import { create } from 'zustand';
import {
  Card, CardColor, PublicGameState, RoomState, RoomStatus,
  GamePhase, TurnState, PlayerGameState, RoomSettings,
} from '@uno/shared';

// ---- Game Slice ----
interface GameSlice {
  gameState: PublicGameState | null;
  roomCode: string | null;
  roomState: RoomState | null;
  isConnected: boolean;

  setConnected: (connected: boolean) => void;
  setRoomCode: (code: string | null) => void;
  setRoomState: (state: RoomState | null) => void;
  setGameState: (state: PublicGameState) => void;
}

// ---- Hand Slice ----
interface HandSlice {
  myHand: Card[];
  drawnCard: Card | null;
  canPlayDrawnCard: boolean;
  canCallUno: boolean;

  setMyHand: (hand: Card[]) => void;
  setDrawnCard: (card: Card | null, canPlay: boolean) => void;
}

// ---- UI Slice ----
interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'uno';
  duration?: number;
}

interface UISlice {
  isMyTurn: boolean;
  showColorPicker: boolean;
  showChallengeModal: boolean;
  showEndRoundModal: boolean;
  showFinalWinnerModal: boolean;
  toasts: Toast[];
  emojiReactions: { playerId: string; emoji: string; id: string }[];

  setIsMyTurn: (isMyTurn: boolean) => void;
  setShowColorPicker: (show: boolean) => void;
  setShowChallengeModal: (show: boolean) => void;
  setShowEndRoundModal: (show: boolean) => void;
  setShowFinalWinnerModal: (show: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  addEmojiReaction: (playerId: string, emoji: string) => void;
}

// ---- Round/Game End Slice ----
interface EndSlice {
  roundWinnerId: string | null;
  roundWinnerName: string | null;
  cumulativeScores: Record<string, number>;
  gameWinnerId: string | null;
  gameWinnerName: string | null;
  finalScores: Record<string, number>;

  setRoundEnd: (winnerId: string, winnerName: string, scores: Record<string, number>) => void;
  setGameEnd: (winnerId: string, winnerName: string, scores: Record<string, number>) => void;
}

// ---- Combined Store ----
type GameStore = GameSlice & HandSlice & UISlice & EndSlice & {
  resetGame: () => void;
  resetAll: () => void;
};

let toastCounter = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  // ---- Game Slice ----
  isConnected: false,
  roomCode: null,
  roomState: null,
  gameState: null,

  setConnected: (connected) => set({ isConnected: connected }),
  setRoomCode: (code) => set({ roomCode: code }),
  setRoomState: (state) => set({ roomState: state }),
  setGameState: (state) => set({ gameState: state }),

  // ---- Hand Slice ----
  myHand: [],
  drawnCard: null,
  canPlayDrawnCard: false,
  canCallUno: false,

  setMyHand: (hand) => set({
    myHand: hand,
    canCallUno: hand.length === 2,
  }),
  setDrawnCard: (card, canPlay) => set({ drawnCard: card, canPlayDrawnCard: canPlay }),

  // ---- UI Slice ----
  isMyTurn: false,
  showColorPicker: false,
  showChallengeModal: false,
  showEndRoundModal: false,
  showFinalWinnerModal: false,
  toasts: [],
  emojiReactions: [],

  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  setShowColorPicker: (show) => set({ showColorPicker: show }),
  setShowChallengeModal: (show) => set({ showChallengeModal: show }),
  setShowEndRoundModal: (show) => set({ showEndRoundModal: show }),
  setShowFinalWinnerModal: (show) => set({ showFinalWinnerModal: show }),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-1), { ...toast, id }], // Max 2 toasts
    }));
    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, toast.duration || 2500);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
  addEmojiReaction: (playerId, emoji) => {
    const id = `emoji-${++toastCounter}`;
    set((state) => ({
      emojiReactions: [...state.emojiReactions, { playerId, emoji, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        emojiReactions: state.emojiReactions.filter(e => e.id !== id),
      }));
    }, 1500);
  },

  // ---- End Slice ----
  roundWinnerId: null,
  roundWinnerName: null,
  cumulativeScores: {},
  gameWinnerId: null,
  gameWinnerName: null,
  finalScores: {},

  setRoundEnd: (winnerId, winnerName, scores) => set({
    roundWinnerId: winnerId,
    roundWinnerName: winnerName,
    cumulativeScores: scores,
    showEndRoundModal: true,
  }),
  setGameEnd: (winnerId, winnerName, scores) => set({
    gameWinnerId: winnerId,
    gameWinnerName: winnerName,
    finalScores: scores,
    showFinalWinnerModal: true,
  }),

  // ---- Resets ----
  resetGame: () => set({
    gameState: null,
    myHand: [],
    isMyTurn: false,
    canCallUno: false,
    showColorPicker: false,
    showChallengeModal: false,
    showEndRoundModal: false,
    showFinalWinnerModal: false,
    drawnCard: null,
    canPlayDrawnCard: false,
    roundWinnerId: null,
    roundWinnerName: null,
    gameWinnerId: null,
    gameWinnerName: null,
    toasts: [],
    emojiReactions: [],
  }),

  resetAll: () => set({
    isConnected: false,
    roomCode: null,
    roomState: null,
    gameState: null,
    myHand: [],
    isMyTurn: false,
    canCallUno: false,
    showColorPicker: false,
    showChallengeModal: false,
    showEndRoundModal: false,
    showFinalWinnerModal: false,
    drawnCard: null,
    canPlayDrawnCard: false,
    roundWinnerId: null,
    roundWinnerName: null,
    cumulativeScores: {},
    gameWinnerId: null,
    gameWinnerName: null,
    finalScores: {},
    toasts: [],
    emojiReactions: [],
  }),
}));
