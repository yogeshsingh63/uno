import { Room } from './Room';
import { Player } from '../game/Player';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // playerId → roomCode

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
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
    this.playerRooms.set(player.id, code);
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
      return { room, removed: true, roomDeleted: true };
    }

    return { room, removed: true, roomDeleted: false };
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

    const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const botNames = ['Robo', 'ByteBot', 'NeonAI', 'Sparky', 'Circuit', 'Pixel', 'Glitch', 'Turbo'];
    const botAvatars = ['🤖', '🦾', '⚡', '🔮', '🎮', '🕹️', '💫', '🌟'];
    const idx = room.players.length % botNames.length;
    const bot = new Player(botId, botNames[idx], botAvatars[idx], false, true);
    bot.isReady = true;

    if (room.addPlayer(bot)) {
      this.playerRooms.set(botId, code);
      return bot;
    }
    return null;
  }
}
