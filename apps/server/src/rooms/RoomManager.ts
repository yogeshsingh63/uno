// ============================================================
// RoomManager — Room lifecycle, crypto codes, reconnection
// ============================================================

import * as crypto from 'crypto';
import { Room } from './Room';
import { Player } from '../game/Player';

const GRACE_PERIOD_MS = 45_000;       // 45s reconnect window
const ROOM_DESTROY_TIMEOUT = 15 * 60_000; // 15 minutes after all disconnect

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId → roomCode
  private roomDestroyTimers: Map<string, NodeJS.Timeout> = new Map();

  /** Generate room code using crypto.randomBytes (Section 11) */
  generateRoomCode(): string {
    let code: string;
    do {
      code = crypto.randomBytes(3).toString('hex').toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(player: Player): Room {
    const code = this.generateRoomCode();
    player.isHost = true;
    const room = new Room(code, player);
    this.rooms.set(code, room);
    this.playerRooms.set(player.id, code);
    return room;
  }

  joinRoom(code: string, player: Player): Room | null {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) return null;
    if (!room.addPlayer(player)) return null;
    this.playerRooms.set(player.id, code.toUpperCase());
    return room;
  }

  leaveRoom(playerId: string): { room: Room | null; removed: boolean; roomDeleted: boolean } {
    const code = this.playerRooms.get(playerId);
    if (!code) return { room: null, removed: false, roomDeleted: false };

    const room = this.rooms.get(code);
    if (!room) return { room: null, removed: false, roomDeleted: false };

    room.removePlayer(playerId);
    this.playerRooms.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      this.clearDestroyTimer(code);
      return { room, removed: true, roomDeleted: true };
    }

    return { room, removed: true, roomDeleted: false };
  }

  /** Mark player as disconnected with grace period timer */
  disconnectPlayer(playerId: string, onTimeout: (room: Room, playerId: string) => void): {
    room: Room | null; wasPlaying: boolean;
  } {
    const code = this.playerRooms.get(playerId);
    if (!code) return { room: null, wasPlaying: false };

    const room = this.rooms.get(code);
    if (!room) return { room: null, wasPlaying: false };

    const player = room.getPlayer(playerId);
    if (!player) return { room: null, wasPlaying: false };

    player.isConnected = false;

    // Start 45s grace timer
    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
    player.disconnectTimer = setTimeout(() => {
      onTimeout(room, playerId);
    }, GRACE_PERIOD_MS);

    // If all players disconnected, start room destroy timer
    if (room.players.every(p => !p.isConnected)) {
      this.startDestroyTimer(code);
    }

    return { room, wasPlaying: room.game !== null };
  }

  /** Reconnect player within grace period */
  reconnectPlayer(roomCode: string, playerId: string, newSocketId: string): {
    room: Room | null; player: Player | null;
  } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { room: null, player: null };

    const player = room.getPlayer(playerId);
    if (!player) return { room: null, player: null };

    player.isConnected = true;
    player.socketId = newSocketId;

    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }

    // Cancel room destroy timer if someone reconnected
    this.clearDestroyTimer(roomCode.toUpperCase());

    return { room, player };
  }

  /** Promote next player as host (Section 16) */
  promoteNextHost(room: Room, disconnectedHostId: string): Player | null {
    const connectedPlayers = room.players.filter(p => p.isConnected && p.id !== disconnectedHostId);
    if (connectedPlayers.length === 0) return null;

    const newHost = connectedPlayers[0];
    room.hostId = newHost.id;
    newHost.isHost = true;
    return newHost;
  }

  private startDestroyTimer(code: string): void {
    this.clearDestroyTimer(code);
    const timer = setTimeout(() => {
      this.rooms.delete(code);
      this.roomDestroyTimers.delete(code);
    }, ROOM_DESTROY_TIMEOUT);
    this.roomDestroyTimers.set(code, timer);
  }

  private clearDestroyTimer(code: string): void {
    const timer = this.roomDestroyTimers.get(code);
    if (timer) {
      clearTimeout(timer);
      this.roomDestroyTimers.delete(code);
    }
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    const code = this.playerRooms.get(playerId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  getPlayerRoomCode(playerId: string): string | undefined {
    return this.playerRooms.get(playerId);
  }

  addBotToRoom(code: string): Player | null {
    const room = this.getRoom(code);
    if (!room || room.players.length >= room.maxPlayers) return null;

    const botId = `bot-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const botNames = ['Robo', 'ByteBot', 'NeonAI', 'Sparky', 'Circuit', 'Pixel', 'Glitch', 'Turbo'];
    const botAvatars = ['🤖', '🦾', '⚡', '🔮', '🎮', '🕹️', '💫', '🌟'];
    const idx = room.players.length % botNames.length;
    const bot = new Player(botId, botNames[idx], botAvatars[idx], false, true);
    bot.isReady = true;

    if (room.addPlayer(bot)) {
      this.playerRooms.set(botId, code.toUpperCase());
      return bot;
    }
    return null;
  }
}
