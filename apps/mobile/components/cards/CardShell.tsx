// ============================================================
// CardShell — Authentic Official UNO Card Chassis
// Clean white outer border, suit/black color background, and
// the iconic tilted white oval ellipse ring cutting diagonally.
// Matches the exact official UNO card visual architecture.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CARD_COLORS, WILD_BG } from '../../constants/cardColors';

interface CardShellProps {
  width: number;
  height: number;
  borderRadius?: number;
  gradient?: [string, string, ...string[]];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  declaredColor?: string | null;
  children: React.ReactNode;
}

function CardShell({
  width, height, borderRadius = 10,
  gradient, backgroundColor, borderColor = '#FFFFFF',
  borderWidth, declaredColor, children,
}: CardShellProps) {
  const base = backgroundColor || '#111116';
  const grad: [string, string, ...string[]] =
    gradient && gradient.length >= 2 ? gradient : [base, base];
  const ringCol = declaredColor ? (CARD_COLORS as any)[declaredColor] : null;

  const actualBorderWidth = borderWidth ?? Math.max(2.5, width * 0.045);
  const ovalW = width * 1.22;
  const ovalH = height * 0.62;
  const ovalRadius = ovalH / 2;
  const ovalBorderWidth = Math.max(2, width * 0.04);

  return (
    <View style={[styles.outerShadow, { width, height, borderRadius }]}>
      {/* Declared color glow ring */}
      {ringCol && (
        <View
          style={[styles.glowRing, {
            width: width + 8, height: height + 8,
            borderRadius: borderRadius + 4,
            borderColor: ringCol,
            shadowColor: ringCol,
          }]}
        />
      )}

      <LinearGradient
        colors={grad}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.face, {
          width, height, borderRadius,
          borderColor, borderWidth: actualBorderWidth,
          backgroundColor: base,
        }]}
      >
        {/* Iconic UNO Diagonal White Oval Ring Outline */}
        <View
          pointerEvents="none"
          style={[styles.diagonalOval, {
            width: ovalW,
            height: ovalH,
            borderRadius: ovalRadius,
            borderWidth: ovalBorderWidth,
          }]}
        />

        {/* Card Content (centered symbols/digits + corner marks) */}
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  face: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  diagonalOval: {
    position: 'absolute',
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-28deg' }],
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 14,
  },
});

export default memo(CardShell);
export { WILD_BG };
