// ============================================================
// Room — Room state management with settings
// ============================================================

import { RoomState, RoomStatus, RoomSettings, DEFAULT_ROOM_SETTINGS } from '@uno/shared';
import { Player } from '../game/Player';
import { GameEngine } from '../game/GameEngine';

export class Room {
  public code: string;
  public players: Player[];
  public hostId: string;
  public status: RoomStatus;
  public maxPlayers: number;
  public minPlayers: number;
  public game: GameEngine | null;
  public settings: RoomSettings;
  public createdAt: Date;

  constructor(code: string, host: Player) {
    this.code = code;
    this.players = [host];
    this.hostId = host.id;
    this.status = RoomStatus.WAITING;
    this.maxPlayers = 10;
    this.minPlayers = 2;
    this.game = null;
    this.settings = { ...DEFAULT_ROOM_SETTINGS };
    this.createdAt = new Date();
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) return false;
    if (this.status !== RoomStatus.WAITING) return false;
    if (this.players.find(p => p.id === player.id)) return false;
    this.players.push(player);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) return false;
    this.players.splice(idx, 1);
    if (this.hostId === playerId && this.players.length > 0) {
      this.hostId = this.players[0].id;
      this.players[0].isHost = true;
    }
    return true;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.find(p => p.id === playerId);
  }

  allReady(): boolean {
    return this.players.length >= this.minPlayers && this.players.every(p => p.isReady || p.isHost);
  }

  updateSettings(partial: Partial<RoomSettings>): void {
    this.settings = { ...this.settings, ...partial };
  }

  startGame(): GameEngine {
    this.status = RoomStatus.PLAYING;
    this.game = new GameEngine(this.players, this.settings);
    this.game.startNewRound();
    return this.game;
  }

  startNextRound(): void {
    if (!this.game) return;
    this.status = RoomStatus.PLAYING;
    this.game.startNewRound();
  }

  getRoomState(): RoomState {
    return {
      code: this.code,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isReady: p.isReady,
        isConnected: p.isConnected,
        isHost: p.id === this.hostId,
        isBot: p.isBot,
      })),
      hostId: this.hostId,
      status: this.status,
      maxPlayers: this.maxPlayers,
      minPlayers: this.minPlayers,
      settings: this.settings,
    };
  }
}
