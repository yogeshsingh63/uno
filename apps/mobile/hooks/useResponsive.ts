import { useWindowDimensions, Platform } from 'react-native';

/**
 * Central responsive sizing for the whole app.
 * Scales cards, piles and layout against the actual window so the
 * game looks right on phones, tablets, desktop web and in landscape.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= 768;
  const isSmall = width < 375;

  // Constrained content width so web/tablet never stretches silly-wide
  const contentW = Math.min(width, 620);

  // Hand card width: ~13.5% of the screen, clamped to a comfortable range
  const cardW = Math.max(48, Math.min(80, width * 0.135));
  const cardH = Math.round(cardW * (10 / 7));

  // Center pile cards: bigger than hand cards, but still proportional
  const pileW = Math.max(64, Math.min(104, contentW * 0.17));
  const pileH = Math.round(pileW * (10 / 7));

  return {
    width, height,
    isLandscape, isWeb, isTablet, isSmall,
    contentW, cardW, cardH, pileW, pileH,
  };
}
