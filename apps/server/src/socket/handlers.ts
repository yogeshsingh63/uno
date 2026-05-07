import { Server, Socket } from 'socket.io';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../../packages/shared/src/events';
import {
  CreateRoomPayload, JoinRoomPayload, PlayCardPayload, DrawCardPayload,
  PlayDrawnCardPayload, CallUnoPayload, ChallengeUnoPayload, ChallengeDrawFourPayload,
  ChooseColorPayload, StartGamePayload, PlayerReadyPayload, LeaveRoomPayload, AddBotPayload,
  GamePhase, CardColor, RoomStatus,
} from '../../packages/shared/src/types';
import { RoomManager } from '../rooms/RoomManager';
import { Player } from '../game/Player';
import { BotPlayer } from '../ai/BotPlayer';

const roomManager = new RoomManager();
const socketPlayerMap = new Map<string, string>(); // socketId → playerId
const playerSocketMap = new Map<string, string>(); // playerId → socketId

function emitGameState(io: Server, roomCode: string) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;

  const publicState = room.game.getPublicState();
  publicState.roomCode = roomCode;

  for (const player of room.players) {
    const socketId = playerSocketMap.get(player.id);
    if (socketId && !player.isBot) {
      io.to(socketId).emit(SERVER_EVENTS.GAME_STATE_UPDATE, {
        gameState: publicState,
        hand: player.hand,
        action: room.game.lastAction,
      });
    }
  }

  // Trigger bot play if it's a bot's turn
  setTimeout(() => handleBotTurn(io, roomCode), 1500);
}

function handleBotTurn(io: Server, roomCode: string) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;
  if (room.game.phase !== GamePhase.PLAYING && room.game.phase !== GamePhase.CHALLENGING_DRAW_FOUR) return;

  const currentPlayer = room.game.getCurrentPlayer();
  if (!currentPlayer.isBot) return;

  const bot = new BotPlayer(room.game, currentPlayer);

  if (room.game.phase === GamePhase.CHALLENGING_DRAW_FOUR) {
    const shouldChallenge = bot.shouldChallengeDrawFour();
    if (shouldChallenge) {
      const result = room.game.challengeDrawFour(currentPlayer.id);
      if (result.success) {
        io.to(roomCode).emit(SERVER_EVENTS.CHALLENGE_RESULT, {
          success: result.challengeWon,
          challengerId: currentPlayer.id,
          challengedId: room.game.lastWildDrawFourPlayerId,
          penaltyPlayerId: result.penaltyPlayerId,
          penaltyCards: result.penaltyCount,
        });
      }
    } else {
      room.game.acceptDrawFour(currentPlayer.id);
    }
    emitGameState(io, roomCode);
    return;
  }

  const action = bot.decideAction();

  if (action.type === 'play') {
    const chosenColor = action.card?.type === 'WILD' || action.card?.type === 'WILD_DRAW_FOUR'
      ? bot.chooseColor() : undefined;

    // Call UNO if down to 1 card after playing
    if (currentPlayer.hand.length === 2) {
      room.game.callUno(currentPlayer.id);
      io.to(roomCode).emit(SERVER_EVENTS.UNO_CALLED, { playerId: currentPlayer.id });
    }

    const result = room.game.playCard(currentPlayer.id, action.cardId!, chosenColor);
    if (result.success) {
      if (room.game.phase === GamePhase.CHOOSING_COLOR && chosenColor) {
        room.game.chooseColor(currentPlayer.id, chosenColor);
      }
      checkRoundEnd(io, roomCode);
      emitGameState(io, roomCode);
    }
  } else {
    const result = room.game.drawCard(currentPlayer.id);
    if (result.success && result.canPlay && result.card) {
      setTimeout(() => {
        room.game!.playDrawnCard(currentPlayer.id, true);
        emitGameState(io, roomCode);
      }, 1000);
    } else {
      emitGameState(io, roomCode);
    }
  }
}

function checkRoundEnd(io: Server, roomCode: string) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;

  if (room.game.phase === GamePhase.ROUND_OVER) {
    const winner = room.game.getPlayerById(room.game.winnerIdThisRound!);
    io.to(roomCode).emit(SERVER_EVENTS.ROUND_ENDED, {
      winnerId: room.game.winnerIdThisRound,
      winnerName: winner?.name ?? 'Unknown',
      roundScore: { roundNumber: room.game.roundNumber, winnerId: room.game.winnerIdThisRound, playerScores: {} },
      cumulativeScores: room.game.scores,
      gameOver: false,
    });
  }

  if (room.game.phase === GamePhase.GAME_OVER) {
    const winner = room.game.getPlayerById(room.game.winnerIdGame!);
    io.to(roomCode).emit(SERVER_EVENTS.GAME_ENDED, {
      winnerId: room.game.winnerIdGame,
      winnerName: winner?.name ?? 'Unknown',
      finalScores: room.game.scores,
    });
    room.status = RoomStatus.GAME_ENDED;
  }
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ---- Create Room ----
    socket.on(CLIENT_EVENTS.CREATE_ROOM, (data: CreateRoomPayload) => {
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const player = new Player(playerId, data.playerName, data.avatar, true);

      socketPlayerMap.set(socket.id, playerId);
      playerSocketMap.set(playerId, socket.id);

      const room = roomManager.createRoom(player);
      socket.join(room.code);

      socket.emit(SERVER_EVENTS.ROOM_CREATED, {
        roomCode: room.code,
        room: room.getRoomState(),
        playerId,
      });
    });

    // ---- Join Room ----
    socket.on(CLIENT_EVENTS.JOIN_ROOM, (data: JoinRoomPayload) => {
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const player = new Player(playerId, data.playerName, data.avatar);

      const room = roomManager.joinRoom(data.roomCode, player);
      if (!room) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Room not found or full' });
        return;
      }

      socketPlayerMap.set(socket.id, playerId);
      playerSocketMap.set(playerId, socket.id);
      socket.join(room.code);

      socket.emit(SERVER_EVENTS.ROOM_JOINED, { room: room.getRoomState(), playerId });
      socket.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
    });

    // ---- Player Ready ----
    socket.on(CLIENT_EVENTS.PLAYER_READY, (data: PlayerReadyPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      player.isReady = !player.isReady;
      io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
    });

    // ---- Start Game ----
    socket.on(CLIENT_EVENTS.START_GAME, (data: StartGamePayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room) return;
      if (room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only host can start' });
        return;
      }
      if (!room.allReady()) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Not all players ready' });
        return;
      }

      const game = room.startGame();
      const publicState = game.getPublicState();
      publicState.roomCode = room.code;

      for (const p of room.players) {
        const sid = playerSocketMap.get(p.id);
        if (sid && !p.isBot) {
          io.to(sid).emit(SERVER_EVENTS.GAME_STARTED, {
            gameState: publicState,
            hand: p.hand,
          });
        }
      }

      setTimeout(() => handleBotTurn(io, room.code), 2000);
    });

    // ---- Play Card ----
    socket.on(CLIENT_EVENTS.PLAY_CARD, (data: PlayCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      // Call UNO auto-check: if playing leaves 1 card and hasn't called
      const player = room.game.getPlayerById(playerId);
      if (player && player.hand.length === 2 && !player.hasCalledUno) {
        // Don't auto-penalize here — give them a window
      }

      const result = room.game.playCard(playerId, data.cardId, data.chosenColor);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid move' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    });

    // ---- Draw Card ----
    socket.on(CLIENT_EVENTS.DRAW_CARD, (data: DrawCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.drawCard(playerId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot draw' });
        return;
      }

      socket.emit(SERVER_EVENTS.CARD_DRAWN, {
        card: result.card,
        canPlay: result.canPlay,
        hand: room.game.getPlayerById(playerId)?.hand || [],
      });

      if (!result.canPlay) {
        emitGameState(io, data.roomCode);
      }
    });

    // ---- Play Drawn Card ----
    socket.on(CLIENT_EVENTS.PLAY_DRAWN_CARD, (data: PlayDrawnCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      room.game.playDrawnCard(playerId, data.play);
      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    });

    // ---- Choose Color ----
    socket.on(CLIENT_EVENTS.CHOOSE_COLOR, (data: ChooseColorPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.chooseColor(playerId, data.color);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid color' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    });

    // ---- Call UNO ----
    socket.on(CLIENT_EVENTS.CALL_UNO, (data: CallUnoPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.callUno(playerId);
      if (result.success) {
        io.to(room.code).emit(SERVER_EVENTS.UNO_CALLED, { playerId });
      }
    });

    // ---- Challenge UNO ----
    socket.on(CLIENT_EVENTS.CHALLENGE_UNO, (data: ChallengeUnoPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.challengeUno(playerId, data.targetPlayerId);
      if (result.success && result.penalized) {
        io.to(room.code).emit(SERVER_EVENTS.UNO_PENALTY, {
          playerId: result.penaltyPlayerId,
          playerName: room.game.getPlayerById(result.penaltyPlayerId!)?.name,
          penaltyCards: 2,
        });
        emitGameState(io, data.roomCode);
      }
    });

    // ---- Challenge Draw Four ----
    socket.on(CLIENT_EVENTS.CHALLENGE_DRAW_FOUR, (data: ChallengeDrawFourPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.challengeDrawFour(playerId);
      if (result.success) {
        io.to(room.code).emit(SERVER_EVENTS.CHALLENGE_RESULT, {
          success: result.challengeWon,
          challengerId: playerId,
          challengedId: room.game.lastWildDrawFourPlayerId,
          penaltyPlayerId: result.penaltyPlayerId,
          penaltyCards: result.penaltyCount,
        });
        emitGameState(io, data.roomCode);
      }
    });

    // ---- Add Bot ----
    socket.on(CLIENT_EVENTS.ADD_BOT, (data: AddBotPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || room.hostId !== playerId) return;

      const bot = roomManager.addBotToRoom(data.roomCode);
      if (bot) {
        io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
      }
    });

    // ---- Leave Room ----
    socket.on(CLIENT_EVENTS.LEAVE_ROOM, (data: LeaveRoomPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      socket.leave(data.roomCode);
      const { room, roomDeleted } = roomManager.leaveRoom(playerId);
      if (room && !roomDeleted) {
        io.to(room.code).emit(SERVER_EVENTS.PLAYER_LEFT, { playerId });
        io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
      }
      socketPlayerMap.delete(socket.id);
      playerSocketMap.delete(playerId);
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      console.log(`[Socket] Disconnected: ${socket.id} (${playerId})`);

      const room = roomManager.getRoomByPlayerId(playerId);
      if (room) {
        const player = room.getPlayer(playerId);
        if (player) {
          player.isConnected = false;
          io.to(room.code).emit(SERVER_EVENTS.PLAYER_DISCONNECTED, { playerId });
          io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });

          // Auto-skip after 30s if in game
          if (room.game && room.game.getCurrentPlayer().id === playerId) {
            player.disconnectTimer = setTimeout(() => {
              if (room.game && room.game.getCurrentPlayer().id === playerId) {
                room.game.drawCard(playerId);
                emitGameState(io, room.code);
              }
            }, 30000);
          }
        }
      }

      socketPlayerMap.delete(socket.id);
      // Don't delete playerSocketMap — allow reconnection
    });
  });
}
