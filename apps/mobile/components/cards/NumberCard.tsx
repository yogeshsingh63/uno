// ============================================================
// NumberCard — Real UNO number card layout
// Large centered number on a white oval (tilted), with corner
// indices in white at top-left and bottom-right (inverted).
// Matches official UNO card design proportions.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS, COLOR_INKS } from '../../constants/cardColors';

interface NumberCardProps {
  color: string;   // RED, YELLOW, GREEN, BLUE
  value: number;   // 0–9
  width: number;
  height: number;
  borderRadius?: number;
}

function NumberCard({ color, value, width, height, borderRadius = 12 }: NumberCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;
  const ink = COLOR_INKS[color] || COLOR_INKS.RED;
  const digit = String(value);

  // Real UNO: large centered oval with the number inside
  const ovalW = width * 0.72;
  const ovalH = height * 0.52;
  const ovalRadius = ovalH / 2;
  const centerFontSize = height * 0.42;
  const cornerFontSize = height * 0.14;
  const needsUnderline = value === 6 || value === 9;

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      {/* Center white oval with the digit — tilted like real UNO */}
      <View
        style={[styles.oval, {
          width: ovalW,
          height: ovalH,
          borderRadius: ovalRadius,
        }]}
      >
        <Text style={[styles.digit, { fontSize: centerFontSize, color: ink }]}>{digit}</Text>
        {needsUnderline && (
          <View style={[styles.underline, { backgroundColor: ink }]} />
        )}
      </View>

      {/* Top-left corner */}
      <View style={styles.cornerTL}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize }]}>{digit}</Text>
      </View>
      {/* Bottom-right corner (rotated 180°) */}
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize }]}>{digit}</Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  oval: {
    position: 'absolute',
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-22deg' }],
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  digit: {
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  underline: {
    position: 'absolute',
    bottom: '20%',
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  cornerTL: { position: 'absolute', top: 4, left: 6 },
  cornerBR: {
    position: 'absolute', bottom: 4, right: 6,
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    color: '#FFF5E6',
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(NumberCard);
