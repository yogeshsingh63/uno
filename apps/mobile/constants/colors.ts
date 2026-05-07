export const Colors = {
  background: '#0d0d1a',
  surface: '#1a1a2e',
  surfaceLight: '#252540',
  surfaceBorder: '#333355',

  red: '#ff2d55',
  yellow: '#ffd60a',
  green: '#30d158',
  blue: '#0a84ff',

  redDark: '#cc1a3a',
  yellowDark: '#ccaa00',
  greenDark: '#1fa044',
  blueDark: '#0066cc',

  redGlow: 'rgba(255, 45, 85, 0.4)',
  yellowGlow: 'rgba(255, 214, 10, 0.4)',
  greenGlow: 'rgba(48, 209, 88, 0.4)',
  blueGlow: 'rgba(10, 132, 255, 0.4)',

  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#8e8ea0',
  textMuted: '#555570',

  neonPink: '#ff2d55',
  neonPurple: '#bf5af2',
  neonCyan: '#64d2ff',

  success: '#30d158',
  error: '#ff453a',
  warning: '#ffd60a',

  cardBack: '#1a1a3e',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const UNO_CARD_COLORS: Record<string, { primary: string; dark: string; glow: string }> = {
  RED: { primary: Colors.red, dark: Colors.redDark, glow: Colors.redGlow },
  YELLOW: { primary: Colors.yellow, dark: Colors.yellowDark, glow: Colors.yellowGlow },
  GREEN: { primary: Colors.green, dark: Colors.greenDark, glow: Colors.greenGlow },
  BLUE: { primary: Colors.blue, dark: Colors.blueDark, glow: Colors.blueGlow },
  WILD: { primary: '#8e8ea0', dark: '#555570', glow: 'rgba(142,142,160,0.4)' },
};
