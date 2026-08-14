// ============================================================
// Socket Handlers — Full event routing (Section 11)
// ============================================================

import { Server, Socket } from 'socket.io';
import * as crypto from 'crypto';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@uno/shared';
import {
  CreateRoomPayload, JoinRoomPayload, PlayCardPayload, DrawCardPayload,
  PlayDrawnCardPayload, ChooseColorPayload, StartGamePayload, NextRoundPayload,
  PlayAgainPayload, SwapHandsPayload, JumpInPayload,
  PlayerReadyPayload, LeaveRoomPayload, AddBotPayload, UpdateSettingsPayload,
  SendEmojiPayload, ReconnectPayload, PassTurnPayload,
  CallUnoPayload, CallCatchPayload, ChallengeWd4Payload, AcceptWd4Payload,
  GamePhase, TurnState, RoomStatus, CardType, isCardPlayable,
} from '@uno/shared';
import { RoomManager } from '../rooms/RoomManager';
import { Player } from '../game/Player';
import { BotPlayer } from '../ai/BotPlayer';

const roomManager = new RoomManager();
const socketPlayerMap = new Map<string, string>(); // socketId → playerId
const playerSocketMap = new Map<string, string>(); // playerId → socketId

// Rate limiter: track events per socket
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 8; // events per second

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  let entry = rateLimiter.get(socketId);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + 1000 };
    rateLimiter.set(socketId, entry);
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// ---- Game State Broadcasting ----

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
  scheduleBot(io, roomCode);
}

function scheduleBot(io: Server, roomCode: string) {
  setTimeout(() => handleBotTurn(io, roomCode), 900);
}

function handleBotTurn(io: Server, roomCode: string) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;
  const game = room.game;
  if (game.phase !== GamePhase.PLAYING) return;

  // Jump-In (house rule): any bot holding the exact match can jump in out of turn
  if (game.jumpIn && game.settings.jumpIn) {
    const top = game.getTopCard();
    const jumper = room.players.find(p =>
      p.isBot && p.id !== game.getCurrentPlayer().id &&
      p.hand.some(c => c.color === top.color && c.type === top.type && c.value === top.value)
    );
    if (jumper) {
      const card = jumper.hand.find(c => c.color === top.color && c.type === top.type && c.value === top.value)!;
      const jumpResult = game.jumpInPlay(jumper.id, card.id);
      if (jumpResult.success) {
        checkRoundEnd(io, roomCode);
        emitGameState(io, roomCode);
        return;
      }
    }
  }

  const currentPlayer = game.getCurrentPlayer();
  if (!currentPlayer.isBot) return;

  // Handle swap state (Swap Hands card / 7-0 rule)
  if (game.turnState === TurnState.AWAITING_SWAP) {
    const bot = new BotPlayer(game, currentPlayer);
    game.swapHands(currentPlayer.id, bot.chooseSwapTarget());
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
    return;
  }

  // Handle challenge state
  if (game.turnState === TurnState.AWAITING_CHALLENGE && game.pendingChallenge) {
    const bot = new BotPlayer(game, currentPlayer);
    if (bot.shouldChallengeDrawFour()) {
      const result = game.challengeDrawFour(currentPlayer.id);
      if (result.success) {
        io.to(roomCode).emit(SERVER_EVENTS.CHALLENGE_RESULT, {
          success: result.challengeWon,
          challengerId: currentPlayer.id,
          challengedId: game.pendingChallenge?.challengedPlayerId || '',
          penaltyPlayerId: result.penaltyPlayerId,
          penaltyCards: result.penaltyCount,
        });
      }
    } else {
      game.acceptDrawFour(currentPlayer.id);
    }
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
    return;
  }

  // Handle color choice
  if (game.turnState === TurnState.AWAITING_COLOR) {
    const bot = new BotPlayer(game, currentPlayer);
    const color = bot.chooseColor();
    game.chooseColor(currentPlayer.id, color);
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
    return;
  }

  // Bot is holding a drawn, playable card — play it (or pass)
  if (game.turnState === TurnState.DREW_CARD) {
    const drawn = game.drawnCardPending.get(currentPlayer.id);
    if (drawn) {
      const bot = new BotPlayer(game, currentPlayer);
      game.playDrawnCard(currentPlayer.id, true);
      if ((game.turnState as TurnState) === TurnState.AWAITING_COLOR) {
        game.chooseColor(currentPlayer.id, bot.chooseColor());
      }
    } else {
      game.passTurn(currentPlayer.id);
    }
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
    return;
  }

  if (game.turnState !== TurnState.AWAITING_PLAY) return;

  // If the bot owes penalty cards (Draw Two), it must draw (or stack a D2)
  if (game.pendingDrawCount > 0) {
    const stacking = game.settings.stacking;
    const d2 = stacking
      ? currentPlayer.hand.find(c => c.type === CardType.DRAW_TWO &&
          isCardPlayable(c, game.getTopCard(), game.activeColor))
      : undefined;
    if (d2) {
      game.playCard(currentPlayer.id, d2.id);
    } else {
      game.drawCard(currentPlayer.id);
    }
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
    return;
  }

  const bot = new BotPlayer(game, currentPlayer);
  const action = bot.decideAction();

  if (action.type === 'play') {
    const isWild = action.card?.type === 'WILD' || action.card?.type === 'WILD_DRAW_FOUR' ||
      action.card?.type === 'SWAP_HANDS' || action.card?.type === 'SHUFFLE_HANDS';
    const chosenColor = isWild ? bot.chooseColor() : undefined;

    // Call UNO if down to 1 card after playing
    if (currentPlayer.hand.length === 2) {
      game.declareUno(currentPlayer.id);
      io.to(roomCode).emit(SERVER_EVENTS.UNO_DECLARED, { playerId: currentPlayer.id });
    }

    const result = game.playCard(currentPlayer.id, action.cardId!, chosenColor);
    if (!result.success) {
      // Bot made an invalid move — draw instead so the game can never stall
      console.warn(`[Bot] ${currentPlayer.name} invalid play (${result.error}) — drawing`);
      game.drawCard(currentPlayer.id);
    } else {
      // playCard() mutates turnState — re-read it to check if color choice is needed
      const currentTurnState = game.turnState as string;
      if (currentTurnState === TurnState.AWAITING_COLOR) {
        const color = bot.chooseColor();
        game.chooseColor(currentPlayer.id, color);
      }
      // Swap state can be entered directly or after color choice
      if ((game.turnState as TurnState) === TurnState.AWAITING_SWAP) {
        game.swapHands(currentPlayer.id, bot.chooseSwapTarget());
      }
    }
    checkRoundEnd(io, roomCode);
    emitGameState(io, roomCode);
  } else {
    const result = game.drawCard(currentPlayer.id);
    if (result.success && result.canPlay && result.card) {
      setTimeout(() => {
        if (!game) return;
        game.playDrawnCard(currentPlayer.id, true);
        // Drawn wilds still need a color
        if ((game.turnState as TurnState) === TurnState.AWAITING_COLOR) {
          game.chooseColor(currentPlayer.id, bot.chooseColor());
        }
        checkRoundEnd(io, roomCode);
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
      roundScore: {
        roundNumber: room.game.roundNumber,
        winnerId: room.game.winnerIdThisRound,
        playerScores: room.game.scores,
      },
      cumulativeScores: room.game.scores,
      gameOver: false,
    });
    room.status = RoomStatus.ROUND_ENDED;
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

function emitGameStarted(io: Server, roomCode: string) {
  const room = roomManager.getRoom(roomCode);
  if (!room || !room.game) return;

  const publicState = room.game.getPublicState();
  publicState.roomCode = roomCode;

  for (const p of room.players) {
    const sid = playerSocketMap.get(p.id);
    if (sid && !p.isBot) {
      io.to(sid).emit(SERVER_EVENTS.GAME_STARTED, {
        gameState: publicState,
        hand: p.hand,
      });
    }
  }

  scheduleBot(io, roomCode);
}

// ============================================================
// REGISTER ALL HANDLERS
// ============================================================

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Wrap each handler with rate limiting
    function withRateLimit(handler: (...args: any[]) => void) {
      return (...args: any[]) => {
        if (!checkRateLimit(socket.id)) {
          socket.emit(SERVER_EVENTS.ERROR, { message: 'Rate limited', code: 'RATE_LIMIT' });
          return;
        }
        handler(...args);
      };
    }

    // ---- Create Room ----
    socket.on(CLIENT_EVENTS.CREATE_ROOM, withRateLimit((data: CreateRoomPayload) => {
      const playerId = `player-${crypto.randomBytes(4).toString('hex')}`;
      const player = new Player(playerId, data.playerName, data.avatar, true);
      player.socketId = socket.id;

      socketPlayerMap.set(socket.id, playerId);
      playerSocketMap.set(playerId, socket.id);

      const room = roomManager.createRoom(player);
      socket.join(room.code);

      socket.emit(SERVER_EVENTS.ROOM_CREATED, {
        roomCode: room.code,
        room: room.getRoomState(),
        playerId,
      });
    }));

    // ---- Join Room ----
    socket.on(CLIENT_EVENTS.JOIN_ROOM, withRateLimit((data: JoinRoomPayload) => {
      const playerId = `player-${crypto.randomBytes(4).toString('hex')}`;
      const player = new Player(playerId, data.playerName, data.avatar);
      player.socketId = socket.id;

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
      socket.to(room.code).emit(SERVER_EVENTS.PLAYER_JOINED, {
        player: { id: playerId, name: data.playerName, avatar: data.avatar },
      });
    }));

    // ---- Reconnect ----
    socket.on(CLIENT_EVENTS.RECONNECT_ROOM, withRateLimit((data: ReconnectPayload) => {
      const { room, player } = roomManager.reconnectPlayer(data.roomCode, data.playerId, socket.id);
      if (!room || !player) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Reconnection failed' });
        return;
      }

      // Revoke the player's previous socket so a stale connection (e.g. an old
      // tab that kept its socket.io session alive) can no longer act as them.
      const prevSocketId = playerSocketMap.get(data.playerId);
      if (prevSocketId && prevSocketId !== socket.id) {
        socketPlayerMap.delete(prevSocketId);
        const prev = io.sockets.sockets.get(prevSocketId);
        prev?.leave(room.code);
      }

      socketPlayerMap.set(socket.id, data.playerId);
      playerSocketMap.set(data.playerId, socket.id);
      socket.join(room.code);

      // Send full state on reconnect
      if (room.game) {
        const publicState = room.game.getPublicState();
        publicState.roomCode = room.code;
        socket.emit(SERVER_EVENTS.GAME_STATE_UPDATE, {
          gameState: publicState,
          hand: player.hand,
          action: room.game.lastAction,
        });
      } else {
        socket.emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
      }

      io.to(room.code).emit(SERVER_EVENTS.PLAYER_RECONNECTED, { playerId: data.playerId });
    }));

    // ---- Player Ready ----
    socket.on(CLIENT_EVENTS.PLAYER_READY, withRateLimit((data: PlayerReadyPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      player.isReady = !player.isReady;
      io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
    }));

    // ---- Update Settings (host only) ----
    socket.on(CLIENT_EVENTS.UPDATE_SETTINGS, withRateLimit((data: UpdateSettingsPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only host can change settings' });
        return;
      }

      room.updateSettings(data.settings);
      io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
    }));

    // ---- Start Game ----
    socket.on(CLIENT_EVENTS.START_GAME, withRateLimit((data: StartGamePayload) => {
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

      room.startGame();
      emitGameStarted(io, room.code);
    }));

    // ---- Next Round (host only) ----
    socket.on(CLIENT_EVENTS.NEXT_ROUND, withRateLimit((data: NextRoundPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;
      if (room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can start the next round' });
        return;
      }
      if (room.game.phase !== GamePhase.ROUND_OVER) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'No finished round to continue' });
        return;
      }

      room.startNextRound();
      emitGameStarted(io, room.code);
    }));

    // ---- Play Again (host only, after game over) ----
    socket.on(CLIENT_EVENTS.PLAY_AGAIN, withRateLimit((data: PlayAgainPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;
      if (room.hostId !== playerId) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the host can start a new game' });
        return;
      }
      if (room.game.phase !== GamePhase.GAME_OVER) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Game is not over' });
        return;
      }

      room.game.resetForNewGame();
      room.status = RoomStatus.PLAYING;
      emitGameStarted(io, room.code);
    }));

    // ---- Swap Hands (Swap Hands card / 7-0 rule) ----
    socket.on(CLIENT_EVENTS.SWAP_HANDS, withRateLimit((data: SwapHandsPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.swapHands(playerId, data.targetPlayerId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot swap hands' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    }));

    // ---- Jump-In (play exact match out of turn) ----
    socket.on(CLIENT_EVENTS.JUMP_IN, withRateLimit((data: JumpInPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.jumpInPlay(playerId, data.cardId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot jump in' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    }));

    // ---- Play Card ----
    socket.on(CLIENT_EVENTS.PLAY_CARD, withRateLimit((data: PlayCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.playCard(playerId, data.cardId, data.declaredColor);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid move' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    }));

    // ---- Draw Card ----
    socket.on(CLIENT_EVENTS.DRAW_CARD, withRateLimit((data: DrawCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.drawCard(playerId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot draw' });
        return;
      }

      // Send drawn card info only to the drawing player
      socket.emit(SERVER_EVENTS.CARD_DRAWN, {
        card: result.card,
        canPlay: result.canPlay,
        hand: room.game.getPlayerById(playerId)?.hand || [],
      });

      // Broadcast card count change to all
      emitGameState(io, data.roomCode);
    }));

    // ---- Play Drawn Card ----
    socket.on(CLIENT_EVENTS.PLAY_DRAWN_CARD, withRateLimit((data: PlayDrawnCardPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.playDrawnCard(playerId, data.play);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Invalid' });
        return;
      }

      checkRoundEnd(io, data.roomCode);
      emitGameState(io, data.roomCode);
    }));

    // ---- Pass Turn (after drawing) ----
    socket.on(CLIENT_EVENTS.PASS_TURN, withRateLimit((data: PassTurnPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.passTurn(playerId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot pass' });
        return;
      }

      emitGameState(io, data.roomCode);
    }));

    // ---- Choose Color ----
    socket.on(CLIENT_EVENTS.CHOOSE_COLOR, withRateLimit((data: ChooseColorPayload) => {
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
    }));

    // ---- Declare UNO ----
    socket.on(CLIENT_EVENTS.DECLARE_UNO, withRateLimit((data: CallUnoPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.declareUno(playerId);
      if (result.success) {
        io.to(room.code).emit(SERVER_EVENTS.UNO_DECLARED, { playerId });
      }
    }));

    // ---- Call Catch (catch someone who didn't say UNO) ----
    socket.on(CLIENT_EVENTS.CALL_CATCH, withRateLimit((data: CallCatchPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.callCatch(playerId, data.targetPlayerId);
      if (result.success && result.penalized) {
        io.to(room.code).emit(SERVER_EVENTS.UNO_CAUGHT, {
          targetPlayerId: result.penaltyPlayerId,
          caughtById: playerId,
        });
        emitGameState(io, data.roomCode);
      }
    }));

    // ---- Challenge WD4 ----
    socket.on(CLIENT_EVENTS.CHALLENGE_WD4, withRateLimit((data: ChallengeWd4Payload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.challengeDrawFour(playerId);
      if (result.success) {
        io.to(room.code).emit(SERVER_EVENTS.CHALLENGE_RESULT, {
          success: result.challengeWon,
          challengerId: playerId,
          challengedId: room.game.pendingChallenge?.challengedPlayerId || '',
          penaltyPlayerId: result.penaltyPlayerId,
          penaltyCards: result.penaltyCount,
        });
        checkRoundEnd(io, data.roomCode);
        emitGameState(io, data.roomCode);
      }
    }));

    // ---- Accept WD4 (decline to challenge) ----
    socket.on(CLIENT_EVENTS.ACCEPT_WD4, withRateLimit((data: AcceptWd4Payload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || !room.game) return;

      const result = room.game.acceptDrawFour(playerId);
      if (!result.success) {
        socket.emit(SERVER_EVENTS.ERROR, { message: result.error || 'Cannot accept' });
        return;
      }

      emitGameState(io, data.roomCode);
    }));

    // ---- Send Emoji ----
    socket.on(CLIENT_EVENTS.SEND_EMOJI, withRateLimit((data: SendEmojiPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room) return;

      io.to(room.code).emit(SERVER_EVENTS.EMOJI_REACTION, {
        playerId,
        emoji: data.emoji,
      });
    }));

    // ---- Add Bot ----
    socket.on(CLIENT_EVENTS.ADD_BOT, withRateLimit((data: AddBotPayload) => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      const room = roomManager.getRoom(data.roomCode);
      if (!room || room.hostId !== playerId) return;

      const bot = roomManager.addBotToRoom(data.roomCode);
      if (bot) {
        io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
      }
    }));

    // ---- Leave Room ----
    socket.on(CLIENT_EVENTS.LEAVE_ROOM, withRateLimit((data: LeaveRoomPayload) => {
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
    }));

    // ---- Disconnect (Section 16) ----
    socket.on('disconnect', () => {
      const playerId = socketPlayerMap.get(socket.id);
      if (!playerId) return;

      console.log(`[Socket] Disconnected: ${socket.id} (${playerId})`);

      const { room, wasPlaying } = roomManager.disconnectPlayer(playerId, (room, pid) => {
        // Timeout callback — host decides what to do
        const player = room.getPlayer(pid);
        if (!player) return;
        // Auto-remove after grace period
        const { roomDeleted } = roomManager.leaveRoom(pid);
        if (!roomDeleted) {
          io.to(room.code).emit(SERVER_EVENTS.PLAYER_LEFT, { playerId: pid });
          io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
        }
      });

      if (room) {
        io.to(room.code).emit(SERVER_EVENTS.PLAYER_DISCONNECTED, {
          playerId,
          autoSkipIn: 45,
        });
        io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });

        // If host disconnected, promote next host
        if (room.hostId === playerId) {
          const newHost = roomManager.promoteNextHost(room, playerId);
          if (newHost) {
            io.to(room.code).emit(SERVER_EVENTS.HOST_CHANGED, { newHostId: newHost.id });
            io.to(room.code).emit(SERVER_EVENTS.ROOM_UPDATED, { room: room.getRoomState() });
          }
        }

        // If it was their turn in the game, auto-skip after 3s
        if (wasPlaying && room.game && room.game.getCurrentPlayer().id === playerId) {
          setTimeout(() => {
            if (room.game && room.game.getCurrentPlayer().id === playerId) {
              room.game.drawCard(playerId);
              emitGameState(io, room.code);
            }
          }, 3000);
        }
      }

      socketPlayerMap.delete(socket.id);
      // Keep playerSocketMap for reconnection
    });
  });
}
