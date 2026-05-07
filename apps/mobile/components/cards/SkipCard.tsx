// ============================================================
// SkipCard — Section 6
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getCardColorHex, getCardColorHlHex, COLOR_INITIALS } from '../../constants/cardColors';

interface SkipCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function SkipCard({ color, width, height, borderRadius = 10 }: SkipCardProps) {
  const bg = getCardColorHex(color);
  const hl = getCardColorHlHex(color);
  const symbolSize = Math.min(width * 0.55, height * 0.4);
  const strokeWidth = symbolSize * 0.11;
  const cornerFontSize = height * 0.13;
  const initialFontSize = height * 0.08;

  return (
    <View style={[styles.card, { width, height, borderRadius, backgroundColor: bg }]}>
      <View style={[styles.radialHighlight, { backgroundColor: hl, opacity: 0.3 }]} />

      {/* White diagonal oval */}
      <View style={[styles.oval, {
        width: width * 1.4, height: height * 0.68,
        borderRadius: (height * 0.68) / 2,
        transform: [{ rotate: '25deg' }],
      }]} />

      {/* Top-left corner */}
      <View style={styles.cornerTL}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>⊘</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>

      {/* Bottom-right corner */}
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>⊘</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>

      {/* Center skip symbol — circle with diagonal slash */}
      <View style={[styles.skipSymbol, {
        width: symbolSize, height: symbolSize, borderRadius: symbolSize / 2,
        borderWidth: strokeWidth, borderColor: bg,
      }]}>
        {/* Diagonal slash */}
        <View style={[styles.slash, {
          width: symbolSize * 1.05,
          height: strokeWidth,
          backgroundColor: bg,
          transform: [{ rotate: '-45deg' }],
        }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.45)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  radialHighlight: {
    position: 'absolute', width: '60%', height: '60%', borderRadius: 100,
  },
  oval: {
    position: 'absolute', backgroundColor: '#FFFFFF',
  },
  cornerTL: {
    position: 'absolute', top: 5, left: 6, alignItems: 'center',
  },
  cornerBR: {
    position: 'absolute', bottom: 5, right: 6, alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  cornerText: { fontWeight: '900' },
  cornerInitial: { fontWeight: '700', opacity: 0.7, marginTop: -2 },
  skipSymbol: {
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent',
    zIndex: 2,
  },
  slash: {
    position: 'absolute',
  },
});

export default memo(SkipCard);
