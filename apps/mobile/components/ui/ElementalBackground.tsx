// ============================================================
// ElementalBackground — Ultra-Fast Static Ambient Backdrop
// Soft dark gradient wash with ambient radial warmth.
// Zero animation/timer overhead for maximum performance.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type ElementalVariant = 'embers' | 'cosmic' | 'ocean';

interface ElementalBackgroundProps {
  variant?: ElementalVariant;
  intensity?: number;
}

const GRADIENTS: Record<ElementalVariant, readonly [string, string, ...string[]]> = {
  embers: ['#0E0B12', '#160F1A', '#0A080D'],
  cosmic: ['#080C14', '#0F1826', '#06080E'],
  ocean:  ['#061214', '#0A1E20', '#040C0D'],
};

function ElementalBackground({ variant = 'embers' }: ElementalBackgroundProps) {
  const colors = GRADIENTS[variant] || GRADIENTS.embers;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        Platform.OS === 'web' && ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 } as any),
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Warm Radial Ambient Orb 1 */}
      <View style={styles.ambientOrb1} />

      {/* Subtle Warm Radial Ambient Orb 2 */}
      <View style={styles.ambientOrb2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#0C0A0F',
  },
  ambientOrb1: {
    position: 'absolute',
    top: '-15%',
    left: '10%',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(237, 28, 36, 0.04)',
  },
  ambientOrb2: {
    position: 'absolute',
    bottom: '-15%',
    right: '5%',
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: 'rgba(255, 186, 0, 0.03)',
  },
});

export default memo(ElementalBackground);
