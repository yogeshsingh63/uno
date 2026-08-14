// ============================================================
// DrawTwoCard — Official Authentic UNO Draw Two (+2) Card
// Two white overlapping mini-card rectangles in the center with
// crisp black 3D drop shadow, and "+2" indices in corners.
// Exactly matches the official Mattel UNO card design.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS } from '../../constants/cardColors';

interface DrawTwoCardProps {
  color: string;   // RED, YELLOW, GREEN, BLUE
  width: number;
  height: number;
  borderRadius?: number;
}

function DrawTwoCard({ color, width, height, borderRadius = 10 }: DrawTwoCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;

  const miniW = width * 0.28;
  const miniH = miniW * 1.42;
  const miniRadius = Math.max(2, miniW * 0.16);
  const cornerFontSize = Math.round(height * 0.16);
  const cornerShadow = Math.max(1, Math.round(width * 0.025));
  const cardShadow = Math.max(2, Math.round(width * 0.038));

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      {/* Center Two Overlapping Mini Cards with Black Drop Shadows */}
      <View style={styles.centerContainer} pointerEvents="none">
        {/* Back Mini Card (Top-Right) */}
        <View
          style={[styles.miniCardShadow, {
            width: miniW,
            height: miniH,
            borderRadius: miniRadius,
            top: -miniH * 0.22 + cardShadow,
            left: miniW * 0.18 + cardShadow,
          }]}
        />
        <View
          style={[styles.miniCard, {
            width: miniW,
            height: miniH,
            borderRadius: miniRadius,
            top: -miniH * 0.22,
            left: miniW * 0.18,
          }]}
        />

        {/* Front Mini Card (Bottom-Left) */}
        <View
          style={[styles.miniCardShadow, {
            width: miniW,
            height: miniH,
            borderRadius: miniRadius,
            top: miniH * 0.18 + cardShadow,
            left: -miniW * 0.22 + cardShadow,
          }]}
        />
        <View
          style={[styles.miniCard, {
            width: miniW,
            height: miniH,
            borderRadius: miniRadius,
            top: miniH * 0.18,
            left: -miniW * 0.22,
          }]}
        />
      </View>

      {/* Top-Left Corner "+2" */}
      <View style={[styles.cornerTL, { top: Math.max(3, height * 0.035), left: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          +2
        </Text>
      </View>

      {/* Bottom-Right Corner "+2" (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(3, height * 0.035), right: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          +2
        </Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  miniCardShadow: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  cornerTL: {
    position: 'absolute',
  },
  cornerBR: {
    position: 'absolute',
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
});

export default memo(DrawTwoCard);
