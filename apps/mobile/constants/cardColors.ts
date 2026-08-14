// ============================================================
// Card Colors — Rich saturated UNO palette
// Warm 3-stop gradients for each suit with cream accents.
// ============================================================

export const CARD_COLORS = {
  RED: '#E8364B',
  YELLOW: '#F5B800',
  GREEN: '#2EBD5E',
  BLUE: '#2B8BF5',
} as const;

export const CARD_COLORS_HL = {
  RED: '#FF6B80',
  YELLOW: '#FFD54F',
  GREEN: '#5CE08A',
  BLUE: '#5EAAFF',
} as const;

/** 3-stop suit gradients: light → mid → deep */
export const COLOR_GRADIENTS: Record<string, [string, string, ...string[]]> = {
  RED: ['#FF6070', '#E8364B', '#A0182A'],
  YELLOW: ['#FFD54F', '#F5B800', '#B38600'],
  GREEN: ['#5CE08A', '#2EBD5E', '#1A7A3B'],
  BLUE: ['#5EAAFF', '#2B8BF5', '#1A5DB3'],
};

/** Deep tone per color — used for digit ink on white capsule */
export const COLOR_INKS: Record<string, string> = {
  RED: '#8B0D20',
  YELLOW: '#7A5E00',
  GREEN: '#105C28',
  BLUE: '#0E3F80',
};

export const WILD_BG = '#1A0E12';
export const CARD_BACK_BG = '#140A0E';
export const CARD_WHITE = '#FFF5E6';
export const CARD_SHADOW = 'rgba(0,0,0,0.55)';

export const COLOR_GLOWS: Record<string, string> = {
  RED: '#E8364B',
  YELLOW: '#F5B800',
  GREEN: '#2EBD5E',
  BLUE: '#2B8BF5',
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
