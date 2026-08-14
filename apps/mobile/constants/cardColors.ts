// ============================================================
// Card Colors — Official Authentic UNO Palette
// Saturated Red, Yellow, Green, Blue and Deep Black for Wilds.
// ============================================================

export const CARD_COLORS = {
  RED: '#D71921',
  YELLOW: '#F9B200',
  GREEN: '#279B37',
  BLUE: '#0066D6',
} as const;

export const CARD_COLORS_HL = {
  RED: '#FF4D55',
  YELLOW: '#FFCA28',
  GREEN: '#4CD964',
  BLUE: '#3399FF',
} as const;

/** Solid / clean gradient for each suit */
export const COLOR_GRADIENTS: Record<string, [string, string, ...string[]]> = {
  RED: ['#E82028', '#D71921', '#B8141B'],
  YELLOW: ['#FFC000', '#F9B200', '#D69400'],
  GREEN: ['#30AB42', '#279B37', '#1D7D2A'],
  BLUE: ['#1A7AE6', '#0066D6', '#004FB3'],
};

export const WILD_BG = '#111116';
export const CARD_BACK_BG = '#111116';
export const CARD_WHITE = '#FFFFFF';
export const CARD_SHADOW = 'rgba(0,0,0,0.55)';

export const COLOR_GLOWS: Record<string, string> = {
  RED: '#D71921',
  YELLOW: '#F9B200',
  GREEN: '#279B37',
  BLUE: '#0066D6',
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
  SWAP_HANDS: '⇄',
  SHUFFLE_HANDS: '⟳',
};
