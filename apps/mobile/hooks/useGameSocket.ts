import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { socketService } from '../services/socketService';
import { useGameStore } from '../stores/gameStore';
import { usePlayerStore } from '../stores/playerStore';
import { SERVER_EVENTS, CLIENT_EVENTS } from '@uno/shared';
import {
  RoomCreatedPayload, RoomJoinedPayload, GameStartedPayload,
  GameStateUpdatePayload, CardDrawnPayload, RoundEndedPayload,
  GameEndedPayload, UnoPenaltyPayload, ChallengeResultPayload,
  RoomState, GamePhase, CardColor, PublicGameState,
} from '@uno/shared';

export function useGameSocket() {
  const router = useRouter();
  const {
    setConnected, setRoomCode, setRoomState, setGameState, setMyHand,
    setIsMyTurn, setShowColorPicker, setShowChallengeModal,
    setRoundEnd, setGameEnd, setDrawnCard, roomCode,
  } = useGameStore();
  const { playerId, setPlayerId } = usePlayerStore();

  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on(SERVER_EVENTS.ROOM_CREATED, (data: RoomCreatedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.roomCode);
      setRoomState(data.room);
      router.push(`/lobby/${data.roomCode}`);
    });

    socket.on(SERVER_EVENTS.ROOM_JOINED, (data: RoomJoinedPayload) => {
      setPlayerId(data.playerId);
      setRoomCode(data.room.code);
      setRoomState(data.room);
      router.push(`/lobby/${data.room.code}`);
    });

    socket.on(SERVER_EVENTS.ROOM_UPDATED, (data: { room: RoomState }) => {
      setRoomState(data.room);
    });

    socket.on(SERVER_EVENTS.GAME_STARTED, (data: GameStartedPayload) => {
      setGameState(data.gameState);
      setMyHand(data.hand);
      updateMyTurn(data.gameState);
      router.push(`/game/${data.gameState.roomCode}`);
    });

    socket.on(SERVER_EVENTS.GAME_STATE_UPDATE, (data: GameStateUpdatePayload) => {
      setGameState(data.gameState);
      setMyHand(data.hand);
      updateMyTurn(data.gameState);

      if (data.gameState.phase === GamePhase.CHOOSING_COLOR) {
        const currentId = data.gameState.players[data.gameState.currentPlayerIndex]?.id;
        // The player who played the wild needs to pick color
        if (data.action?.playerId === playerId) {
          setShowColorPicker(true);
        }
      } else {
        setShowColorPicker(false);
      }

      if (data.gameState.phase === GamePhase.CHALLENGING_DRAW_FOUR) {
        const currentId = data.gameState.players[data.gameState.currentPlayerIndex]?.id;
        if (currentId === playerId) {
          setShowChallengeModal(true);
        }
      } else {
        setShowChallengeModal(false);
      }
    });

    socket.on(SERVER_EVENTS.CARD_DRAWN, (data: CardDrawnPayload) => {
      setMyHand(data.hand);
      if (data.canPlay && data.card) {
        setDrawnCard(data.card, true);
      }
    });

    socket.on(SERVER_EVENTS.ROUND_ENDED, (data: RoundEndedPayload) => {
      setRoundEnd(data.winnerId, data.winnerName, data.cumulativeScores);
    });

    socket.on(SERVER_EVENTS.GAME_ENDED, (data: GameEndedPayload) => {
      setGameEnd(data.winnerId, data.winnerName, data.finalScores);
    });

    socket.on(SERVER_EVENTS.ERROR, (data: { message: string }) => {
      console.warn('[Game Error]', data.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off(SERVER_EVENTS.ROOM_CREATED);
      socket.off(SERVER_EVENTS.ROOM_JOINED);
      socket.off(SERVER_EVENTS.ROOM_UPDATED);
      socket.off(SERVER_EVENTS.GAME_STARTED);
      socket.off(SERVER_EVENTS.GAME_STATE_UPDATE);
      socket.off(SERVER_EVENTS.CARD_DRAWN);
      socket.off(SERVER_EVENTS.ROUND_ENDED);
      socket.off(SERVER_EVENTS.GAME_ENDED);
      socket.off(SERVER_EVENTS.ERROR);
    };
  }, []);

  const updateMyTurn = useCallback((gs: PublicGameState) => {
    const currentId = gs.players[gs.currentPlayerIndex]?.id;
    setIsMyTurn(currentId === playerId);
  }, [playerId]);

  const createRoom = useCallback((name: string, avatar: string) => {
    socketService.emit(CLIENT_EVENTS.CREATE_ROOM, { playerName: name, avatar });
  }, []);

  const joinRoom = useCallback((code: string, name: string, avatar: string) => {
    socketService.emit(CLIENT_EVENTS.JOIN_ROOM, { roomCode: code.toUpperCase(), playerName: name, avatar });
  }, []);

  const toggleReady = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.PLAYER_READY, { roomCode });
  }, [roomCode]);

  const startGame = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.START_GAME, { roomCode });
  }, [roomCode]);

  const playCard = useCallback((cardId: string, chosenColor?: CardColor) => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.PLAY_CARD, { roomCode, cardId, chosenColor });
  }, [roomCode]);

  const drawCard = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.DRAW_CARD, { roomCode });
  }, [roomCode]);

  const playDrawnCard = useCallback((play: boolean) => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.PLAY_DRAWN_CARD, { roomCode, play });
  }, [roomCode]);

  const callUno = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.CALL_UNO, { roomCode });
  }, [roomCode]);

  const challengeUno = useCallback((targetPlayerId: string) => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.CHALLENGE_UNO, { roomCode, targetPlayerId });
  }, [roomCode]);

  const challengeDrawFour = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.CHALLENGE_DRAW_FOUR, { roomCode });
  }, [roomCode]);

  const chooseColor = useCallback((color: CardColor) => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.CHOOSE_COLOR, { roomCode, color });
    setShowColorPicker(false);
  }, [roomCode]);

  const addBot = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.ADD_BOT, { roomCode });
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    if (roomCode) socketService.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomCode });
    useGameStore.getState().resetAll();
    router.replace('/home');
  }, [roomCode]);

  return {
    createRoom, joinRoom, toggleReady, startGame,
    playCard, drawCard, playDrawnCard, callUno,
    challengeUno, challengeDrawFour, chooseColor,
    addBot, leaveRoom,
  };
}
