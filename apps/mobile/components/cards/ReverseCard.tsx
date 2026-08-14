// ============================================================
// ReverseCard — Official Authentic UNO Reverse Card
// Two interlocking curved arrows in the center with black 3D shadow,
// and corner reverse symbols. Exactly matches official UNO cards.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS } from '../../constants/cardColors';

interface ReverseCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function ReverseCard({ color, width, height, borderRadius = 10 }: ReverseCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;

  const centerFontSize = Math.round(height * 0.44);
  const cornerFontSize = Math.round(height * 0.16);
  const shadowOffset = Math.max(2, Math.round(width * 0.04));
  const cornerShadow = Math.max(1, Math.round(width * 0.025));

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      {/* Center Interlocking Reverse Arrows with 3D Black Drop Shadow */}
      <View style={styles.centerContainer} pointerEvents="none">
        <Text
          style={[styles.centerSymbol, {
            fontSize: centerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: shadowOffset, height: shadowOffset },
            textShadowRadius: 0,
          }]}
        >
          ⇄
        </Text>
      </View>

      {/* Top-Left Corner */}
      <View style={[styles.cornerTL, { top: Math.max(3, height * 0.035), left: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          ⇄
        </Text>
      </View>

      {/* Bottom-Right Corner (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(3, height * 0.035), right: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          ⇄
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
  centerSymbol: {
    color: '#FFFFFF',
    fontWeight: '900',
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
});

export default memo(ReverseCard);
