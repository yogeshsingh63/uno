// ============================================================
// SwapHandsCard — Wild Swap Hands (modern deck)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import ColorPie from './ColorPie';

interface SwapHandsCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function SwapHandsCard({ width, height, borderRadius = 12, declaredColor }: SwapHandsCardProps) {
  const pieSize = width * 0.5;
  const labelFontSize = height * 0.1;
  const cornerFontSize = height * 0.085;

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

      {/* Swap icon */}
      <View style={styles.swapRow}>
        <Text style={[styles.swapIcon, { fontSize: height * 0.16 }]}>⇄</Text>
      </View>

      <Text style={[styles.label, { fontSize: labelFontSize }]}>SWAP</Text>

      <Text style={[styles.corner, styles.cornerTL, { fontSize: cornerFontSize }]}>⇄</Text>
      <Text style={[styles.corner, styles.cornerBR, { fontSize: cornerFontSize }]}>⇄</Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  swapRow: {
    marginTop: 2,
    flexDirection: 'row',
  },
  swapIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1.5,
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

export default memo(SwapHandsCard);
