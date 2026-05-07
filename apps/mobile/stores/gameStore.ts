import { create } from 'zustand';
import {
  Card, CardColor, PublicGameState, RoomState, RoomStatus,
  GamePhase, PlayerGameState,
} from '../../../packages/shared/src/types';

interface GameStore {
  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Room
  roomCode: string | null;
  roomState: RoomState | null;
  setRoomCode: (code: string | null) => void;
  setRoomState: (state: RoomState | null) => void;

  // Game
  gameState: PublicGameState | null;
  myHand: Card[];
  isMyTurn: boolean;
  canCallUno: boolean;
  showColorPicker: boolean;
  showChallengeModal: boolean;
  showEndRoundModal: boolean;
  showFinalWinnerModal: boolean;
  drawnCard: Card | null;
  canPlayDrawnCard: boolean;

  // Actions
  setGameState: (state: PublicGameState) => void;
  setMyHand: (hand: Card[]) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setShowColorPicker: (show: boolean) => void;
  setShowChallengeModal: (show: boolean) => void;
  setShowEndRoundModal: (show: boolean) => void;
  setShowFinalWinnerModal: (show: boolean) => void;
  setDrawnCard: (card: Card | null, canPlay: boolean) => void;

  // Round/Game end data
  roundWinnerId: string | null;
  roundWinnerName: string | null;
  cumulativeScores: Record<string, number>;
  gameWinnerId: string | null;
  gameWinnerName: string | null;
  finalScores: Record<string, number>;

  setRoundEnd: (winnerId: string, winnerName: string, scores: Record<string, number>) => void;
  setGameEnd: (winnerId: string, winnerName: string, scores: Record<string, number>) => void;

  // Reset
  resetGame: () => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  roomCode: null,
  roomState: null,
  setRoomCode: (code) => set({ roomCode: code }),
  setRoomState: (state) => set({ roomState: state }),

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

  setGameState: (state) => set({ gameState: state }),
  setMyHand: (hand) => set((prev) => {
    const canCallUno = hand.length === 2; // about to play down to 1
    return { myHand: hand, canCallUno };
  }),
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  setShowColorPicker: (show) => set({ showColorPicker: show }),
  setShowChallengeModal: (show) => set({ showChallengeModal: show }),
  setShowEndRoundModal: (show) => set({ showEndRoundModal: show }),
  setShowFinalWinnerModal: (show) => set({ showFinalWinnerModal: show }),
  setDrawnCard: (card, canPlay) => set({ drawnCard: card, canPlayDrawnCard: canPlay }),

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
  }),
}));
