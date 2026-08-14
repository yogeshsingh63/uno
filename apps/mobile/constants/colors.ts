// ============================================================
// Colors — Warm Luxury Lounge palette
// Deep warm blacks, cream/ivory card tones, vivid suit colors,
// and amber/gold accent lighting throughout.
// ============================================================

export const Colors = {
  // Backgrounds — warm charcoal-black with a hint of burgundy
  background: '#0c0a0f',
  surface: 'rgba(28, 22, 30, 0.85)',
  surfaceLight: 'rgba(42, 32, 48, 0.80)',
  surfaceBorder: 'rgba(255, 220, 180, 0.12)',
  surfaceBorderGlow: 'rgba(255, 180, 80, 0.30)',

  // Card suit colors — vivid and saturated
  red: '#E8364B',
  yellow: '#F5B800',
  green: '#2EBD5E',
  blue: '#2B8BF5',

  redDark: '#A0182A',
  yellowDark: '#B38600',
  greenDark: '#1A7A3B',
  blueDark: '#1A5DB3',

  redGlow: 'rgba(232, 54, 75, 0.6)',
  yellowGlow: 'rgba(245, 184, 0, 0.6)',
  greenGlow: 'rgba(46, 189, 94, 0.6)',
  blueGlow: 'rgba(43, 139, 245, 0.6)',

  // Text
  white: '#FEFCFA',
  textPrimary: '#F5F0EB',
  textSecondary: '#B8A89A',
  textMuted: '#7A6B5E',

  // Accents
  neonPink: '#E8364B',
  neonPurple: '#A855F7',
  neonCyan: '#4EC8E8',
  neonGold: '#F5B800',
  metallicGold: '#D4A843',
  cream: '#FFF5E6',
  ivory: '#FAF0DC',

  success: '#2EBD5E',
  error: '#E8364B',
  warning: '#F5B800',

  cardBack: '#1A0E12',
  overlay: 'rgba(8, 6, 10, 0.88)',
};

export const UNO_CARD_COLORS: Record<string, { primary: string; dark: string; glow: string }> = {
  RED: { primary: Colors.red, dark: Colors.redDark, glow: Colors.redGlow },
  YELLOW: { primary: Colors.yellow, dark: Colors.yellowDark, glow: Colors.yellowGlow },
  GREEN: { primary: Colors.green, dark: Colors.greenDark, glow: Colors.greenGlow },
  BLUE: { primary: Colors.blue, dark: Colors.blueDark, glow: Colors.blueGlow },
};
