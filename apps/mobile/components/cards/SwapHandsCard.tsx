// ============================================================
// SwapHandsCard — Wild Swap Hands (modern deck)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { FourColorOval } from './WildCard';

interface SwapHandsCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function SwapHandsCard({ width, height, borderRadius = 10, declaredColor }: SwapHandsCardProps) {
  const centerW = width * 0.72;
  const centerH = height * 0.52;
  const cornerFontSize = Math.round(height * 0.16);
  const cornerShadow = Math.max(1, Math.round(width * 0.025));

  return (
    <CardShell
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="#111116"
      gradient={['#1F1F26', '#111116', '#09090D']}
      declaredColor={declaredColor}
    >
      {/* Center 4-Color Oval with Swap Icon on top */}
      <View style={styles.centerContainer} pointerEvents="none">
        <FourColorOval width={centerW} height={centerH} borderWidth={Math.max(2, width * 0.035)} />
        <View style={styles.centerIconWrap}>
          <Text style={[styles.centerIcon, { fontSize: Math.round(height * 0.32) }]}>⇄</Text>
        </View>
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
  centerIconWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
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

export default memo(SwapHandsCard);
