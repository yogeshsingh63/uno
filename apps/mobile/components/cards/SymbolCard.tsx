// ============================================================
// SymbolCard — action cards (Skip / Reverse / Draw Two)
// Same premium anatomy as number cards: gradient face, white
// tilted capsule with the symbol in the card's ink color, and
// white corner indices.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS, COLOR_INKS } from '../../constants/cardColors';

interface SymbolCardProps {
  color: string;         // RED, YELLOW, GREEN, BLUE
  symbol: string;        // center + corner glyph, e.g. "+2"
  width: number;
  height: number;
  borderRadius?: number;
  symbolFontScale?: number;
}

function SymbolCard({ color, symbol, width, height, borderRadius = 12, symbolFontScale = 0.46 }: SymbolCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;
  const ink = COLOR_INKS[color] || COLOR_INKS.RED;
  const centerFontSize = height * symbolFontScale;
  const cornerFontSize = height * 0.16;
  const pillWidth = width * 1.22;
  const pillHeight = height * 0.6;
  const pillRadius = pillHeight / 2;

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      <View
        style={[styles.pill, {
          width: pillWidth,
          height: pillHeight,
          borderRadius: pillRadius,
          transform: [{ rotate: '-24deg' }],
        }]}
      >
        <Text style={[styles.symbol, { fontSize: centerFontSize, color: ink }]}>{symbol}</Text>
      </View>

      <View style={styles.cornerTL}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize }]}>{symbol}</Text>
      </View>
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize }]}>{symbol}</Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  symbol: {
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 1,
  },
  cornerTL: { position: 'absolute', top: 5, left: 8 },
  cornerBR: {
    position: 'absolute', bottom: 5, right: 8,
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(SymbolCard);
