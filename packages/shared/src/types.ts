// ============================================================
// @uno/shared — Shared TypeScript types for UNO Multiplayer
// ============================================================

// ---- Card Types ----

export enum CardColor {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  WILD = 'WILD',
}

export enum CardType {
  NUMBER = 'NUMBER',
  SKIP = 'SKIP',
  REVERSE = 'REVERSE',
  DRAW_TWO = 'DRAW_TWO',
  WILD = 'WILD',
  WILD_DRAW_FOUR = 'WILD_DRAW_FOUR',
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // 0–9 for NUMBER cards
}

// ---- Player Types ----

export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isConnected: boolean;
  isHost: boolean;
}

export interface PlayerGameState {
  id: string;
  name: string;
  avatar: string;
  cardCount: number;
  isConnected: boolean;
  hasCalledUno: boolean;
  score: number;
}

export interface PlayerPrivateState {
  hand: Card[];
  canPlayDrawnCard: boolean;
  drawnCard: Card | null;
}

// ---- Room Types ----

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  ROUND_ENDED = 'ROUND_ENDED',
  GAME_ENDED = 'GAME_ENDED',
}

export interface RoomState {
  code: string;
  players: PlayerInfo[];
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  minPlayers: number;
}

// ---- Game State ----

export enum GamePhase {
  DEALING = 'DEALING',
  PLAYING = 'PLAYING',
  CHOOSING_COLOR = 'CHOOSING_COLOR',
  CHALLENGING_DRAW_FOUR = 'CHALLENGING_DRAW_FOUR',
  ROUND_OVER = 'ROUND_OVER',
  GAME_OVER = 'GAME_OVER',
}

export type PlayDirection = 1 | -1;

export interface PublicGameState {
  roomCode: string;
  players: PlayerGameState[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  topCard: Card;
  currentColor: CardColor;
  phase: GamePhase;
  drawPileCount: number;
  pendingDrawCount: number; // for Draw Two stacking
  roundNumber: number;
  scores: Record<string, number>; // playerId → cumulative score
  lastAction: GameAction | null;
  winnerIdThisRound: string | null;
  winnerIdGame: string | null;
  targetScore: number;
}

// ---- Game Actions ----

export enum GameActionType {
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DRAWN = 'CARD_DRAWN',
  UNO_CALLED = 'UNO_CALLED',
  UNO_PENALTY = 'UNO_PENALTY',
  SKIP = 'SKIP',
  REVERSE = 'REVERSE',
  DRAW_TWO = 'DRAW_TWO',
  WILD_PLAYED = 'WILD_PLAYED',
  WILD_DRAW_FOUR_PLAYED = 'WILD_DRAW_FOUR_PLAYED',
  CHALLENGE_SUCCESS = 'CHALLENGE_SUCCESS',
  CHALLENGE_FAIL = 'CHALLENGE_FAIL',
  COLOR_CHOSEN = 'COLOR_CHOSEN',
  TURN_TIMEOUT = 'TURN_TIMEOUT',
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  card?: Card;
  color?: CardColor;
  targetPlayerId?: string;
  penaltyCount?: number;
}

// ---- Scoring ----

export interface RoundScore {
  roundNumber: number;
  winnerId: string;
  playerScores: Record<string, number>; // points earned this round
}

// ---- Socket Payloads ----

export interface CreateRoomPayload {
  playerName: string;
  avatar: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  avatar: string;
}

export interface PlayCardPayload {
  roomCode: string;
  cardId: string;
  chosenColor?: CardColor; // for Wild cards
}

export interface DrawCardPayload {
  roomCode: string;
}

export interface PlayDrawnCardPayload {
  roomCode: string;
  play: boolean; // true = play the drawn card, false = keep it
}

export interface CallUnoPayload {
  roomCode: string;
}

export interface ChallengeUnoPayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface ChallengeDrawFourPayload {
  roomCode: string;
}

export interface ChooseColorPayload {
  roomCode: string;
  color: CardColor;
}

export interface StartGamePayload {
  roomCode: string;
}

export interface PlayerReadyPayload {
  roomCode: string;
}

export interface LeaveRoomPayload {
  roomCode: string;
}

export interface AddBotPayload {
  roomCode: string;
}

// ---- Server Response Payloads ----

export interface RoomCreatedPayload {
  roomCode: string;
  room: RoomState;
  playerId: string;
}

export interface RoomJoinedPayload {
  room: RoomState;
  playerId: string;
}

export interface GameStartedPayload {
  gameState: PublicGameState;
  hand: Card[];
}

export interface GameStateUpdatePayload {
  gameState: PublicGameState;
  hand: Card[];
  action: GameAction;
}

export interface CardDrawnPayload {
  card: Card;
  canPlay: boolean;
  hand: Card[];
}

export interface RoundEndedPayload {
  winnerId: string;
  winnerName: string;
  roundScore: RoundScore;
  cumulativeScores: Record<string, number>;
  gameOver: boolean;
}

export interface GameEndedPayload {
  winnerId: string;
  winnerName: string;
  finalScores: Record<string, number>;
}

export interface UnoPenaltyPayload {
  playerId: string;
  playerName: string;
  penaltyCards: number;
}

export interface ChallengeResultPayload {
  success: boolean;
  challengerId: string;
  challengedId: string;
  penaltyPlayerId: string;
  penaltyCards: number;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export function isCardPlayable(card: Card, topCard: Card, currentColor: CardColor): boolean {
  if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) return true;
  if (card.color === currentColor) return true;
  if (card.type === CardType.NUMBER && topCard.type === CardType.NUMBER && card.value === topCard.value) return true;
  if (card.type !== CardType.NUMBER && card.type === topCard.type) return true;
  return false;
}

