// ============================================================
// @uno/shared — Socket Event Constants (Section 11)
// ============================================================

export const CLIENT_EVENTS = {
  // Room management
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  PLAYER_READY: 'set_ready',
  START_GAME: 'start_game',
  NEXT_ROUND: 'next_round',
  PLAY_AGAIN: 'play_again',
  ADD_BOT: 'add_bot',
  UPDATE_SETTINGS: 'update_settings',
  RECONNECT_ROOM: 'reconnect_room',

  // Gameplay
  PLAY_CARD: 'play_card',
  DRAW_CARD: 'draw_card',
  PASS_TURN: 'pass_turn',
  PLAY_DRAWN_CARD: 'play_drawn_card',
  CHOOSE_COLOR: 'choose_color',
  SWAP_HANDS: 'swap_hands',
  JUMP_IN: 'jump_in',

  // UNO & Challenge
  DECLARE_UNO: 'declare_uno',
  CALL_CATCH: 'call_catch',
  CHALLENGE_WD4: 'challenge_wd4',
  ACCEPT_WD4: 'accept_wd4',

  // Social
  SEND_EMOJI: 'send_emoji',

  // Legacy aliases (backward compat)
  CALL_UNO: 'declare_uno',
  CHALLENGE_UNO: 'call_catch',
  CHALLENGE_DRAW_FOUR: 'challenge_wd4',
} as const;

export const SERVER_EVENTS = {
  // Room
  ROOM_CREATED: 'room_state_created',
  ROOM_JOINED: 'room_state_joined',
  ROOM_UPDATED: 'room_state',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',

  // Game lifecycle
  GAME_STARTED: 'game_started',
  GAME_STATE_UPDATE: 'public_state',
  YOUR_HAND_UPDATE: 'your_hand_update',
  TURN_ADVANCED: 'turn_advanced',

  // Card events
  CARD_PLAYED: 'card_played',
  CARD_DRAWN: 'card_drawn',
  DRAW_PILE_RESHUFFLED: 'draw_pile_reshuffled',

  // UNO
  UNO_DECLARED: 'uno_declared',
  UNO_CAUGHT: 'uno_caught',

  // Challenge
  CHALLENGE_INITIATED: 'challenge_initiated',
  CHALLENGE_RESULT: 'challenge_result',

  // Turn
  TURN_TIMEOUT_WARNING: 'turn_timeout_warning',

  // Round/Game end
  ROUND_ENDED: 'round_ended',
  GAME_ENDED: 'game_over',

  // Connection
  PLAYER_DISCONNECTED: 'player_disconnected',
  PLAYER_RECONNECTED: 'player_reconnected',
  HOST_CHANGED: 'host_changed',

  // Social
  EMOJI_REACTION: 'emoji_reaction',

  // Error
  ERROR: 'error',

  // Legacy aliases
  UNO_CALLED: 'uno_declared',
  UNO_PENALTY: 'uno_caught',
} as const;
