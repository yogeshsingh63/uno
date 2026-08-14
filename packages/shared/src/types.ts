// ============================================================
// @uno/shared — Shared TypeScript types for UNO Multiplayer
// Full Spec — Sections 1–11
// ============================================================

// ---- Card Types (Section 1) ----

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
  SWAP_HANDS = 'SWAP_HANDS',
  SHUFFLE_HANDS = 'SHUFFLE_HANDS',
}

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number;       // 0–9 for NUMBER cards
  pointValue: number;   // scoring: 0-9 for numbers, 20 for action, 50 for wild
}

// ---- Player Types ----

export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isConnected: boolean;
  isHost: boolean;
  isBot: boolean;
}

export interface PlayerGameState {
  id: string;
  name: string;
  avatar: string;
  cardCount: number;
  isConnected: boolean;
  hasCalledUno: boolean;
  score: number;
  isBot: boolean;
}

// ---- Room Types ----

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  ROUND_ENDED = 'ROUND_ENDED',
  GAME_ENDED = 'GAME_ENDED',
}

export interface RoomSettings {
  stacking: boolean;          // Draw Two stacking
  sevenO: boolean;            // 7 = swap hands, 0 = rotate all
  jumpIn: boolean;            // Play exact same card out of turn
  forcePlay: boolean;         // Must play drawn card if playable
  alternateScoring: boolean;  // Lowest score wins
  scoreTarget: number;        // 200 | 300 | 500 | 999
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  stacking: false,
  sevenO: false,
  jumpIn: false,
  forcePlay: false,
  alternateScoring: false,
  scoreTarget: 500,
};

export interface RoomState {
  code: string;
  players: PlayerInfo[];
  hostId: string;
  status: RoomStatus;
  maxPlayers: number;
  minPlayers: number;
  settings: RoomSettings;
}

// ---- Game State (Section 3 FSM) ----

export enum TurnState {
  AWAITING_PLAY = 'AWAITING_PLAY',
  DREW_CARD = 'DREW_CARD',
  AWAITING_COLOR = 'AWAITING_COLOR',
  AWAITING_CHALLENGE = 'AWAITING_CHALLENGE',
  AWAITING_SWAP = 'AWAITING_SWAP',
}

export enum GamePhase {
  LOBBY = 'LOBBY',
  DEALING = 'DEALING',
  PLAYING = 'PLAYING',
  ROUND_OVER = 'ROUND_OVER',
  GAME_OVER = 'GAME_OVER',
}

export type PlayDirection = 1 | -1; // 1 = CW, -1 = CCW

export interface ChallengeData {
  challengedPlayerId: string;   // who played the WD4
  targetPlayerId: string;       // who must draw / can challenge
  wasLegal: boolean;            // snapshot: was WD4 legal at play time
  declaredColor: CardColor;     // color chosen
  timeoutAt: number;            // unix ms
}

export interface JumpInInfo {
  signature: string;       // `${color}:${type}:${value}` exact-match signature
  playedBy: string;        // player who opened the window
  openedAt: number;        // unix ms
  expiresAt: number;       // unix ms
}

export interface PublicGameState {
  roomCode: string;
  players: PlayerGameState[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  topCard: Card;
  activeColor: CardColor;
  phase: GamePhase;
  turnState: TurnState;
  drawPileCount: number;
  pendingDrawCount: number;
  roundNumber: number;
  scores: Record<string, number>;
  lastAction: GameAction | null;
  winnerIdThisRound: string | null;
  winnerIdGame: string | null;
  targetScore: number;
  turnTimeoutAt: number | null;        // unix ms for turn timer
  pendingChallenge: {
    targetPlayerId: string;
    timeoutAt: number;
  } | null;
  jumpIn: JumpInInfo | null;           // open jump-in window (house rule)
  swapOptions: string[] | null;        // candidate player ids for AWAITING_SWAP
  settings: RoomSettings;
}

// ---- Game Actions ----

export enum GameActionType {
  CARD_PLAYED = 'CARD_PLAYED',
  CARD_DRAWN = 'CARD_DRAWN',
  CARDS_DRAWN_PENALTY = 'CARDS_DRAWN_PENALTY',
  UNO_DECLARED = 'UNO_DECLARED',
  UNO_CAUGHT = 'UNO_CAUGHT',
  SKIP = 'SKIP',
  REVERSE = 'REVERSE',
  DRAW_TWO = 'DRAW_TWO',
  WILD_PLAYED = 'WILD_PLAYED',
  WILD_DRAW_FOUR_PLAYED = 'WILD_DRAW_FOUR_PLAYED',
  CHALLENGE_SUCCESS = 'CHALLENGE_SUCCESS',
  CHALLENGE_FAIL = 'CHALLENGE_FAIL',
  COLOR_CHOSEN = 'COLOR_CHOSEN',
  TURN_TIMEOUT = 'TURN_TIMEOUT',
  TURN_PASSED = 'TURN_PASSED',
  DRAW_PILE_RESHUFFLED = 'DRAW_PILE_RESHUFFLED',
  HAND_SWAPPED = 'HAND_SWAPPED',
  HANDS_ROTATED = 'HANDS_ROTATED',
  SWAP_HANDS_PLAYED = 'SWAP_HANDS_PLAYED',
  SHUFFLE_HANDS_PLAYED = 'SHUFFLE_HANDS_PLAYED',
  JUMP_IN_PLAYED = 'JUMP_IN_PLAYED',
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
  playerScores: Record<string, number>;
}

// ---- Socket Payloads: Client → Server (Section 11) ----

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
  declaredColor?: CardColor;
}

export interface DrawCardPayload {
  roomCode: string;
}

export interface PassTurnPayload {
  roomCode: string;
}

export interface PlayDrawnCardPayload {
  roomCode: string;
  play: boolean;
}

export interface CallUnoPayload {
  roomCode: string;
}

export interface CallCatchPayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface ChallengeWd4Payload {
  roomCode: string;
}

export interface AcceptWd4Payload {
  roomCode: string;
}

export interface SwapHandsPayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface JumpInPayload {
  roomCode: string;
  cardId: string;
  declaredColor?: CardColor;
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

export interface NextRoundPayload {
  roomCode: string;
}

export interface PlayAgainPayload {
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

export interface UpdateSettingsPayload {
  roomCode: string;
  settings: Partial<RoomSettings>;
}

export interface SendEmojiPayload {
  roomCode: string;
  emoji: string;
}

export interface ReconnectPayload {
  roomCode: string;
  playerId: string;
}

// ---- Socket Payloads: Server → Client ----

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
  action: GameAction | null;
}

export interface CardDrawnPayload {
  card: Card;
  canPlay: boolean;
  hand: Card[];
}

export interface TurnAdvancedPayload {
  currentPlayerIndex: number;
  turnState: TurnState;
  timeoutAt: number;
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

export interface UnoDeclaredPayload {
  playerId: string;
}

export interface UnoCaughtPayload {
  targetPlayerId: string;
  caughtById: string;
}

export interface ChallengeInitiatedPayload {
  challengerId: string;
  challengedId: string;
  timeoutAt: number;
}

export interface ChallengeResultPayload {
  success: boolean;
  challengerId: string;
  challengedId: string;
  penaltyPlayerId: string;
  penaltyCards: number;
}

export interface PlayerDisconnectedPayload {
  playerId: string;
  autoSkipIn: number;
}

export interface PlayerReconnectedPayload {
  playerId: string;
}

export interface HostChangedPayload {
  newHostId: string;
}

export interface EmojiReactionPayload {
  playerId: string;
  emoji: string;
}

export interface TurnTimeoutWarningPayload {
  playerId: string;
  secondsLeft: number;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// ---- Utility Functions ----

export function isCardPlayable(card: Card, topCard: Card, activeColor: CardColor): boolean {
  // Wild cards are always playable
  if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR ||
      card.type === CardType.SWAP_HANDS || card.type === CardType.SHUFFLE_HANDS) return true;
  // Match by color (using activeColor, not topCard.color)
  if (card.color === activeColor) return true;
  // Match by number value
  if (card.type === CardType.NUMBER && topCard.type === CardType.NUMBER && card.value === topCard.value) return true;
  // Match by action type (Skip on Skip, Reverse on Reverse, Draw Two on Draw Two)
  if (card.type !== CardType.NUMBER && card.type === topCard.type) return true;
  return false;
}

export function getCardPointValue(type: CardType, value?: number): number {
  switch (type) {
    case CardType.NUMBER: return value ?? 0;
    case CardType.SKIP:
    case CardType.REVERSE:
    case CardType.DRAW_TWO: return 20;
    case CardType.WILD:
    case CardType.WILD_DRAW_FOUR: return 50;
    case CardType.SWAP_HANDS:
    case CardType.SHUFFLE_HANDS: return 40;
    default: return 0;
  }
}
