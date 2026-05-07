import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { socketService } from '../services/socketService';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { SERVER_EVENTS, CLIENT_EVENTS } from '@uno/shared';
import {
  RoomCreatedPayload, RoomJoinedPayload, GameStartedPayload,
  GameStateUpdatePayload, CardDrawnPayload, RoundEndedPayload,
  GameEndedPayload, ChallengeResultPayload, EmojiReactionPayload,
  PlayerDisconnectedPayload, PlayerReconnectedPayload, HostChangedPayload,
  UnoDeclaredPayload, UnoCaughtPayload,
  RoomState, TurnState, CardColor, PublicGameState, RoomSettings,
} from '@uno/shared';

export function useGameSocket() {
  const router = useRouter();
  const store = useGameStore;
  const {
    setConnected, setRoomCode, setRoomState, setGameState, setMyHand,
    setIsMyTurn, setShowColorPicker, setShowChallengeModal,
    setRoundEnd, setGameEnd, setDrawnCard, addToast, addEmojiReaction,
    roomCode,
  } = useGameStore();
  const { playerId, setPlayerId } = usePlayerStore();

  // Use refs for values that change but we need inside the stable effect
  const playerIdRef = useRef(playerId);
  playerIdRef.current = playerId;

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => store.getState().setConnected(true));
    socket.on('disconnect', () => store.getState().setConnected(false));

    // Helper: check if it's my turn from game state
    const checkMyTurn = (gs: PublicGameState) => {
      const currentId = gs.players[gs.currentPlayerIndex]?.id;
      const myId = playerIdRef.current;
      store.getState().setIsMyTurn(currentId === myId);
    };

    // ---- Room Events ----
    socket.on(SERVER_EVENTS.ROOM_CREATED, (data: RoomCreatedPayload) => {
      usePlayerStore.getState().setPlayerId(data.playerId);
      playerIdRef.current = data.playerId;
      store.getState().setRoomCode(data.roomCode);
      store.getState().setRoomState(data.room);
      router.push(`/lobby/${data.roomCode}`);
    });

    socket.on(SERVER_EVENTS.ROOM_JOINED, (data: RoomJoinedPayload) => {
      usePlayerStore.getState().setPlayerId(data.playerId);
      playerIdRef.current = data.playerId;
      store.getState().setRoomCode(data.room.code);
      store.getState().setRoomState(data.room);
      router.push(`/lobby/${data.room.code}`);
    });

    socket.on(SERVER_EVENTS.ROOM_UPDATED, (data: { room: RoomState }) => {
      store.getState().setRoomState(data.room);
    });

    socket.on(SERVER_EVENTS.PLAYER_JOINED, (data: { player: { name: string } }) => {
      store.getState().addToast({ message: `${data.player.name} joined!`, type: 'info' });
    });

    socket.on(SERVER_EVENTS.PLAYER_LEFT, (data: { playerId: string }) => {
      store.getState().addToast({ message: `A player left the room`, type: 'info' });
    });

    // ---- Game Lifecycle ----
    socket.on(SERVER_EVENTS.GAME_STARTED, (data: GameStartedPayload) => {
      store.getState().setGameState(data.gameState);
      store.getState().setMyHand(data.hand);
      checkMyTurn(data.gameState);
      router.push(`/game/${data.gameState.roomCode}`);
    });

    socket.on(SERVER_EVENTS.GAME_STATE_UPDATE, (data: GameStateUpdatePayload) => {
      const s = store.getState();
      s.setGameState(data.gameState);
      s.setMyHand(data.hand);
      checkMyTurn(data.gameState);

      const myId = playerIdRef.current;

      // Handle color picker — show for current player when awaiting color
      if (data.gameState.turnState === TurnState.AWAITING_COLOR) {
        const currentId = data.gameState.players[data.gameState.currentPlayerIndex]?.id;
        if (currentId === myId) {
          s.setShowColorPicker(true);
        }
      } else {
        s.setShowColorPicker(false);
      }

      // Handle challenge modal — show for challenged player
      if (data.gameState.turnState === TurnState.AWAITING_CHALLENGE) {
        const currentId = data.gameState.players[data.gameState.currentPlayerIndex]?.id;
        if (currentId === myId) {
          s.setShowChallengeModal(true);
        }
      } else {
        s.setShowChallengeModal(false);
      }

      // Clear drawn card state on new turn
      if (data.gameState.turnState === TurnState.AWAITING_PLAY) {
        s.setDrawnCard(null, false);
      }
    });

    // ---- Card Events ----
    socket.on(SERVER_EVENTS.CARD_DRAWN, (data: CardDrawnPayload) => {
      store.getState().setMyHand(data.hand);
      if (data.canPlay && data.card) {
        store.getState().setDrawnCard(data.card, true);
      } else {
        store.getState().setDrawnCard(null, false);
      }
    });

    // ---- UNO Events ----
    socket.on(SERVER_EVENTS.UNO_DECLARED, (data: UnoDeclaredPayload) => {
      const gs = store.getState().gameState;
      const playerName = gs?.players.find(p => p.id === data.playerId)?.name || 'Player';
      store.getState().addToast({ message: `📣 ${playerName} said UNO!`, type: 'uno' });
    });

    socket.on(SERVER_EVENTS.UNO_CAUGHT, (data: UnoCaughtPayload) => {
      const gs = store.getState().gameState;
      const targetName = gs?.players.find(p => p.id === data.targetPlayerId)?.name || 'Player';
      store.getState().addToast({ message: `🚨 ${targetName} was CAUGHT! +2 cards`, type: 'warning' });
    });

    // ---- Challenge Events ----
    socket.on(SERVER_EVENTS.CHALLENGE_RESULT, (data: ChallengeResultPayload) => {
      if (data.success) {
        store.getState().addToast({ message: `Challenge succeeded! Penalty applied`, type: 'success' });
      } else {
        store.getState().addToast({ message: `Challenge failed! +6 cards penalty`, type: 'error' });
      }
    });

    // ---- Round/Game End ----
    socket.on(SERVER_EVENTS.ROUND_ENDED, (data: RoundEndedPayload) => {
      store.getState().setRoundEnd(data.winnerId, data.winnerName, data.cumulativeScores);
    });

    socket.on(SERVER_EVENTS.GAME_ENDED, (data: GameEndedPayload) => {
      store.getState().setGameEnd(data.winnerId, data.winnerName, data.finalScores);
    });

    // ---- Connection Events ----
    socket.on(SERVER_EVENTS.PLAYER_DISCONNECTED, (data: PlayerDisconnectedPayload) => {
      const gs = store.getState().gameState;
      const playerName = gs?.players.find(p => p.id === data.playerId)?.name || 'Player';
      store.getState().addToast({ message: `${playerName} disconnected`, type: 'warning' });
    });

    socket.on(SERVER_EVENTS.PLAYER_RECONNECTED, (data: PlayerReconnectedPayload) => {
      const gs = store.getState().gameState;
      const playerName = gs?.players.find(p => p.id === data.playerId)?.name || 'Player';
      store.getState().addToast({ message: `${playerName} reconnected!`, type: 'success' });
    });

    socket.on(SERVER_EVENTS.HOST_CHANGED, (data: HostChangedPayload) => {
      store.getState().addToast({ message: `Host has changed`, type: 'info' });
    });

    // ---- Emoji ----
    socket.on(SERVER_EVENTS.EMOJI_REACTION, (data: EmojiReactionPayload) => {
      store.getState().addEmojiReaction(data.playerId, data.emoji);
    });

    // ---- Reshuffled ----
    socket.on(SERVER_EVENTS.DRAW_PILE_RESHUFFLED, () => {
      store.getState().addToast({ message: `🔄 Deck reshuffled!`, type: 'info' });
    });

    // ---- Error ----
    socket.on(SERVER_EVENTS.ERROR, (data: { message: string }) => {
      console.warn('[Game Error]', data.message);
      store.getState().addToast({ message: data.message, type: 'error' });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      Object.values(SERVER_EVENTS).forEach(event => socket.off(event));
    };
  }, []);

  // ---- Emitters — use store.getState() for always-current values ----
  const createRoom = useCallback((name: string, avatar: string) => {
    socketService.emit(CLIENT_EVENTS.CREATE_ROOM, { playerName: name, avatar });
  }, []);

  const joinRoom = useCallback((code: string, name: string, avatar: string) => {
    socketService.emit(CLIENT_EVENTS.JOIN_ROOM, { roomCode: code.toUpperCase(), playerName: name, avatar });
  }, []);

  const toggleReady = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.PLAYER_READY, { roomCode: rc });
  }, []);

  const startGame = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.START_GAME, { roomCode: rc });
  }, []);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.UPDATE_SETTINGS, { roomCode: rc, settings });
  }, []);

  const playCard = useCallback((cardId: string, declaredColor?: CardColor) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.PLAY_CARD, { roomCode: rc, cardId, declaredColor });
  }, []);

  const drawCard = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.DRAW_CARD, { roomCode: rc });
  }, []);

  const passTurn = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.PASS_TURN, { roomCode: rc });
  }, []);

  const playDrawnCard = useCallback((play: boolean) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.PLAY_DRAWN_CARD, { roomCode: rc, play });
  }, []);

  const declareUno = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.DECLARE_UNO, { roomCode: rc });
  }, []);

  const callCatch = useCallback((targetPlayerId: string) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.CALL_CATCH, { roomCode: rc, targetPlayerId });
  }, []);

  const challengeDrawFour = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.CHALLENGE_WD4, { roomCode: rc });
  }, []);

  const acceptDrawFour = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.ACCEPT_WD4, { roomCode: rc });
  }, []);

  const chooseColor = useCallback((color: CardColor) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.CHOOSE_COLOR, { roomCode: rc, color });
    store.getState().setShowColorPicker(false);
  }, []);

  const sendEmoji = useCallback((emoji: string) => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.SEND_EMOJI, { roomCode: rc, emoji });
  }, []);

  const addBot = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.ADD_BOT, { roomCode: rc });
  }, []);

  const leaveRoom = useCallback(() => {
    const rc = store.getState().roomCode;
    if (rc) socketService.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomCode: rc });
    store.getState().resetAll();
    router.replace('/home');
  }, []);

  return {
    createRoom, joinRoom, toggleReady, startGame, updateSettings,
    playCard, drawCard, passTurn, playDrawnCard,
    declareUno, callCatch, challengeDrawFour, acceptDrawFour,
    chooseColor, sendEmoji, addBot, leaveRoom,
  };
}
