// ============================================================
// Card Colors — Official UNO palette per Section 2
// ============================================================

export const CARD_COLORS = {
  RED: '#E53935',
  YELLOW: '#FFD600',
  GREEN: '#43A047',
  BLUE: '#1E88E5',
} as const;

export const CARD_COLORS_HL = {
  RED: '#EF5350',
  YELLOW: '#FFEE58',
  GREEN: '#66BB6A',
  BLUE: '#42A5F5',
} as const;

export const WILD_BG = '#1C1C1E';
export const CARD_BACK_BG = '#1a1a2e';
export const CARD_WHITE = '#FFFFFF';
export const CARD_SHADOW = 'rgba(0,0,0,0.45)';

export const COLOR_GLOWS: Record<string, string> = {
  RED: '#E53935',
  YELLOW: '#FFD600',
  GREEN: '#43A047',
  BLUE: '#1E88E5',
};

export const COLOR_INITIALS: Record<string, string> = {
  RED: 'R',
  YELLOW: 'Y',
  GREEN: 'G',
  BLUE: 'B',
};

/** Map CardColor enum value to hex */
export function getCardColorHex(color: string): string {
  return (CARD_COLORS as any)[color] || '#8e8ea0';
}

/** Map CardColor to highlight hex */
export function getCardColorHlHex(color: string): string {
  return (CARD_COLORS_HL as any)[color] || '#aaa';
}

export const CARD_SYMBOLS: Record<string, string> = {
  SKIP: '⊘',
  REVERSE: '⇄',
  DRAW_TWO: '+2',
  WILD: '★',
  WILD_DRAW_FOUR: '+4',
};

export const AVATAR_OPTIONS = [
  '😎', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🐲', '👻', '🤖', '🎃', '⭐',
];
