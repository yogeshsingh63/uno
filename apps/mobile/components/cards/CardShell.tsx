// ============================================================
// CardShell — Premium physical card chassis
// Cream-ivory border with rounded corners, subtle inner
// shadow, gentle specular highlight, and soft drop shadow.
// Clean, warm, physical feel — like a real premium card.
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
  width, height, borderRadius = 12,
  gradient, backgroundColor, borderColor = '#FFF5E6',
  borderWidth = 3, declaredColor, children,
}: CardShellProps) {
  const base = backgroundColor || '#1A0E12';
  const grad: [string, string, ...string[]] =
    gradient && gradient.length >= 2 ? gradient : [base, base];
  const ringCol = declaredColor ? (CARD_COLORS as any)[declaredColor] : null;

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
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.face, {
          width, height, borderRadius,
          borderColor, borderWidth, backgroundColor: base,
        }]}
      >
        {/* Subtle top specular highlight — warm, not harsh */}
        <LinearGradient
          colors={['rgba(255,255,240,0.35)', 'rgba(255,255,240,0.08)', 'rgba(255,255,240,0)']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Bottom vignette for depth */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)']}
          start={{ x: 0.5, y: 0.55 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  face: {
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 14,
  },
});

export default memo(CardShell);
export { WILD_BG };
