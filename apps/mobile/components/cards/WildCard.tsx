// ============================================================
// WildCard — official UNO wild design
// Matte black gradient face, big four-color pie, WILD label and
// corner indices; declared-color glow ring once played.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import ColorPie from './ColorPie';

interface WildCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function WildCard({ width, height, borderRadius = 12, declaredColor }: WildCardProps) {
  const pieSize = width * 0.52;
  const labelFontSize = height * 0.11;
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

      <Text style={[styles.label, { fontSize: labelFontSize }]}>WILD</Text>

      <Text style={[styles.corner, styles.cornerTL, { fontSize: cornerFontSize }]}>WILD</Text>
      <Text style={[styles.corner, styles.cornerBR, { fontSize: cornerFontSize }]}>WILD</Text>
    </CardShell>
  );
}

const styles = StyleSheet.create({
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

export default memo(WildCard);
