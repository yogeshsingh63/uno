// ============================================================
// @uno/shared — Socket.io Event Constants
// ============================================================

// Client → Server events
export const CLIENT_EVENTS = {
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  PLAYER_READY: 'player-ready',
  START_GAME: 'start-game',
  PLAY_CARD: 'play-card',
  DRAW_CARD: 'draw-card',
  PLAY_DRAWN_CARD: 'play-drawn-card',
  CALL_UNO: 'call-uno',
  CHALLENGE_UNO: 'challenge-uno',
  CHALLENGE_DRAW_FOUR: 'challenge-draw-four',
  CHOOSE_COLOR: 'choose-color',
  ADD_BOT: 'add-bot',
} as const;

// Server → Client events
export const SERVER_EVENTS = {
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_UPDATED: 'room-updated',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  GAME_STATE_UPDATE: 'game-state-update',
  CARD_DRAWN: 'card-drawn',
  ROUND_ENDED: 'round-ended',
  GAME_ENDED: 'game-ended',
  UNO_CALLED: 'uno-called',
  UNO_PENALTY: 'uno-penalty',
  CHALLENGE_RESULT: 'challenge-result',
  PLAYER_DISCONNECTED: 'player-disconnected',
  PLAYER_RECONNECTED: 'player-reconnected',
  ERROR: 'error',
  TURN_TIMEOUT: 'turn-timeout',
} as const;

export type ClientEvent = typeof CLIENT_EVENTS[keyof typeof CLIENT_EVENTS];
export type ServerEvent = typeof SERVER_EVENTS[keyof typeof SERVER_EVENTS];
