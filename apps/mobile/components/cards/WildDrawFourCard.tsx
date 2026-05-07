// ============================================================
// WildDrawFourCard — Four-card fan + pie (Section 10)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WILD_BG, CARD_COLORS } from '../../constants/cardColors';

interface WildDrawFourCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

function WildDrawFourCard({
  width, height, borderRadius = 10, declaredColor, challengePending,
}: WildDrawFourCardProps) {
  const miniW = width * 0.26;
  const miniH = miniW * 1.4;
  const miniRadius = Math.max(2, miniW * 0.15);
  const miniFontSize = miniW * 0.42;
  const cornerFontSize = height * 0.14;
  const labelFontSize = height * 0.1;

  // Background pie size (behind fan)
  const pieSize = width * 0.42;
  const pieHalf = pieSize / 2;

  const borderCol = declaredColor
    ? (CARD_COLORS as any)[declaredColor] || '#FFFFFF'
    : '#FFFFFF';

  const fanCards = [
    { color: CARD_COLORS.RED,    rot: '-20deg', tx: -miniW * 0.65, ty: 3 },
    { color: CARD_COLORS.YELLOW, rot: '-7deg',  tx: -miniW * 0.2,  ty: 0 },
    { color: CARD_COLORS.GREEN,  rot: '7deg',   tx: miniW * 0.2,   ty: 0 },
    { color: CARD_COLORS.BLUE,   rot: '20deg',  tx: miniW * 0.65,  ty: 3 },
  ];

  return (
    <View style={[styles.card, {
      width, height, borderRadius,
      backgroundColor: WILD_BG,
      borderColor: borderCol, borderWidth: declaredColor ? 3 : 2,
    }]}>
      {/* Challenge pending red glow */}
      {challengePending && (
        <View style={[styles.challengeGlow, {
          width: width + 8, height: height + 8,
          borderRadius: borderRadius + 4,
        }]} />
      )}

      {/* Declared color glow */}
      {declaredColor && !challengePending && (
        <View style={[styles.glowRing, {
          width: width + 6, height: height + 6,
          borderRadius: borderRadius + 3,
          borderColor: (CARD_COLORS as any)[declaredColor],
          shadowColor: (CARD_COLORS as any)[declaredColor],
        }]} />
      )}

      {/* Corner labels */}
      <Text style={[styles.cornerTL, { fontSize: cornerFontSize }]}>+4</Text>
      <Text style={[styles.cornerBR, { fontSize: cornerFontSize }]}>+4</Text>

      {/* Background pie (opacity 0.6) */}
      <View style={[styles.bgPie, { width: pieSize, height: pieSize, borderRadius: pieHalf, opacity: 0.5 }]}>
        <View style={[styles.q, { width: pieHalf, height: pieHalf, backgroundColor: CARD_COLORS.RED, top: 0, left: 0, borderTopLeftRadius: pieHalf }]} />
        <View style={[styles.q, { width: pieHalf, height: pieHalf, backgroundColor: CARD_COLORS.BLUE, top: 0, right: 0, borderTopRightRadius: pieHalf }]} />
        <View style={[styles.q, { width: pieHalf, height: pieHalf, backgroundColor: CARD_COLORS.YELLOW, bottom: 0, left: 0, borderBottomLeftRadius: pieHalf }]} />
        <View style={[styles.q, { width: pieHalf, height: pieHalf, backgroundColor: CARD_COLORS.GREEN, bottom: 0, right: 0, borderBottomRightRadius: pieHalf }]} />
      </View>

      {/* Four-card fan */}
      <View style={styles.fanContainer}>
        {fanCards.map((fc, i) => (
          <View key={i} style={[styles.miniCard, {
            width: miniW, height: miniH, borderRadius: miniRadius,
            backgroundColor: fc.color,
            transform: [{ rotate: fc.rot }, { translateX: fc.tx }, { translateY: fc.ty }],
            zIndex: i + 1,
          }]}>
            <Text style={[styles.miniText, { fontSize: miniFontSize }]}>+4</Text>
          </View>
        ))}
      </View>

      {/* +4 label */}
      <Text style={[styles.label, { fontSize: labelFontSize }]}>+4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.45)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  challengeGlow: {
    position: 'absolute',
    borderWidth: 3, borderColor: '#E53935',
    shadowColor: '#E53935', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 28, elevation: 15,
  },
  glowRing: {
    position: 'absolute', borderWidth: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 22,
    elevation: 12,
  },
  cornerTL: {
    position: 'absolute', top: 5, left: 5,
    color: '#FFFFFF', fontWeight: '900',
  },
  cornerBR: {
    position: 'absolute', bottom: 5, right: 5,
    color: '#FFFFFF', fontWeight: '900',
    transform: [{ rotate: '180deg' }],
  },
  bgPie: {
    position: 'absolute', overflow: 'hidden',
  },
  q: { position: 'absolute' },
  fanContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    zIndex: 2, marginBottom: 2,
  },
  miniCard: {
    position: 'absolute',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 3, elevation: 3,
  },
  miniText: {
    color: '#FFFFFF', fontWeight: '900',
  },
  label: {
    color: '#FFFFFF', fontWeight: '900', letterSpacing: 1,
    marginTop: 20, zIndex: 3,
  },
});

export default memo(WildDrawFourCard);
