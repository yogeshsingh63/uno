// ============================================================
// WildDrawFourCard — official UNO wild-draw-four design
// Matte black face with a fan of four colored mini-cards, a
// background pie, and a +4 label; red pulsing ring while a
// challenge is pending.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import ColorPie from './ColorPie';
import { CARD_COLORS } from '../../constants/cardColors';

interface WildDrawFourCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

function WildDrawFourCard({
  width, height, borderRadius = 12, declaredColor, challengePending,
}: WildDrawFourCardProps) {
  const miniW = width * 0.24;
  const miniH = miniW * 1.42;
  const miniFontSize = miniW * 0.4;
  const labelFontSize = height * 0.1;
  const cornerFontSize = height * 0.09;
  const pieSize = width * 0.5;

  const fan = [
    { color: CARD_COLORS.RED, rot: '-18deg', tx: -miniW * 0.62, ty: 3 },
    { color: CARD_COLORS.YELLOW, rot: '-6deg', tx: -miniW * 0.2, ty: 0 },
    { color: CARD_COLORS.GREEN, rot: '6deg', tx: miniW * 0.2, ty: 0 },
    { color: CARD_COLORS.BLUE, rot: '18deg', tx: miniW * 0.62, ty: 3 },
  ];

  return (
    <CardShell
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="#1C1C1E"
      gradient={['#2C2C33', '#141417']}
      declaredColor={declaredColor}
    >
      {/* Challenge pending red glow */}
      {challengePending && (
        <View style={[styles.challengeGlow, {
          width: width + 8, height: height + 8,
          borderRadius: borderRadius + 4,
        }]} />
      )}

      {/* Background pie */}
      <ColorPie size={pieSize} opacity={0.5} />

      {/* Four-card fan */}
      <View style={styles.fanContainer}>
        {fan.map((fc, i) => (
          <View key={i} style={[styles.miniCard, {
            width: miniW, height: miniH, borderRadius: Math.max(2, miniW * 0.18),
            backgroundColor: fc.color,
            transform: [{ rotate: fc.rot }, { translateX: fc.tx }, { translateY: fc.ty }],
            zIndex: i + 1,
          }]}>
            <Text style={[styles.miniText, { fontSize: miniFontSize }]}>+4</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.label, { fontSize: labelFontSize }]}>+4</Text>

      <Text style={[styles.corner, styles.cornerTL, { fontSize: cornerFontSize }]}>+4</Text>
      <Text style={[styles.corner, styles.cornerBR, { fontSize: cornerFontSize }]}>+4</Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  challengeGlow: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#E53935',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 26,
    elevation: 15,
  },
  fanContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 2,
  },
  miniCard: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 3,
  },
  miniText: { color: '#FFFFFF', fontWeight: '900' },
  label: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 18,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  corner: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  cornerTL: { top: 5, left: 7 },
  cornerBR: { bottom: 5, right: 7, transform: [{ rotate: '180deg' }] },
});

export default memo(WildDrawFourCard);
