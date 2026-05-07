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
  RED: { primary: '#E53935', dark: '#C62828', glow: 'rgba(229,57,53,0.4)' },
  YELLOW: { primary: '#FFD600', dark: '#F9A825', glow: 'rgba(255,214,0,0.4)' },
  GREEN: { primary: '#43A047', dark: '#2E7D32', glow: 'rgba(67,160,71,0.4)' },
  BLUE: { primary: '#1E88E5', dark: '#1565C0', glow: 'rgba(30,136,229,0.4)' },
  WILD: { primary: '#1C1C1E', dark: '#111113', glow: 'rgba(142,142,160,0.4)' },
};
