// ============================================================
// NumberCard — Digits 0–9 (Section 5)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getCardColorHex, getCardColorHlHex, COLOR_INITIALS } from '../../constants/cardColors';

interface NumberCardProps {
  color: string;   // RED, YELLOW, GREEN, BLUE
  value: number;   // 0–9
  width: number;
  height: number;
  borderRadius?: number;
}

function NumberCard({ color, value, width, height, borderRadius = 10 }: NumberCardProps) {
  const bg = getCardColorHex(color);
  const hl = getCardColorHlHex(color);
  const digit = String(value);
  const initial = COLOR_INITIALS[color] || '';
  const centerFontSize = height * 0.42;
  const cornerFontSize = height * 0.14;
  const initialFontSize = height * 0.08;
  const needsUnderline = value === 6 || value === 9;

  return (
    <View style={[styles.card, { width, height, borderRadius, backgroundColor: bg }]}>
      {/* Radial highlight effect */}
      <View style={[styles.radialHighlight, { backgroundColor: hl, opacity: 0.3 }]} />

      {/* White diagonal oval */}
      <View style={[styles.oval, {
        width: width * 1.4,
        height: height * 0.68,
        borderRadius: (height * 0.68) / 2,
        transform: [{ rotate: '25deg' }],
      }]} />

      {/* Top-left corner */}
      <View style={styles.cornerTL}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>{digit}</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>{initial}</Text>
      </View>

      {/* Bottom-right corner (180° rotated) */}
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>{digit}</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>{initial}</Text>
      </View>

      {/* Center digit */}
      <Text style={[styles.centerText, {
        fontSize: centerFontSize,
        color: bg,
        textShadowColor: '#FFFFFF',
      }]}>
        {digit}
      </Text>

      {/* 6/9 disambiguation dot */}
      {needsUnderline && (
        <View style={[styles.disambiguationDot, { top: height * 0.62, backgroundColor: '#FFFFFF' }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  radialHighlight: {
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: 100,
  },
  oval: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  cornerTL: {
    position: 'absolute',
    top: 5,
    left: 6,
    alignItems: 'center',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 5,
    right: 6,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    fontWeight: '900',
    lineHeight: undefined,
  },
  cornerInitial: {
    fontWeight: '700',
    opacity: 0.7,
    marginTop: -2,
  },
  centerText: {
    fontWeight: '900',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 2,
  },
  disambiguationDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    zIndex: 3,
  },
});

export default memo(NumberCard);
