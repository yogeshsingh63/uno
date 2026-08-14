// ============================================================
// ShuffleHandsCard — Wild Shuffle Hands (modern deck)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import ColorPie from './ColorPie';

interface ShuffleHandsCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function ShuffleHandsCard({ width, height, borderRadius = 12, declaredColor }: ShuffleHandsCardProps) {
  const pieSize = width * 0.5;
  const labelFontSize = height * 0.09;
  const cornerFontSize = height * 0.08;

  return (
    <CardShell
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="#1C1C1E"
      gradient={['#2C2C33', '#141417']}
      declaredColor={declaredColor}
    >
      <ColorPie size={pieSize} />

      {/* Shuffle icon */}
      <View style={styles.iconRow}>
        <Text style={[styles.icon, { fontSize: height * 0.16 }]}>⟳</Text>
      </View>

      <Text style={[styles.label, { fontSize: labelFontSize }]}>SHUFFLE</Text>

      <Text style={[styles.corner, styles.cornerTL, { fontSize: cornerFontSize }]}>⟳</Text>
      <Text style={[styles.corner, styles.cornerBR, { fontSize: cornerFontSize }]}>⟳</Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  iconRow: { marginTop: 2, flexDirection: 'row' },
  icon: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
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

export default memo(ShuffleHandsCard);
