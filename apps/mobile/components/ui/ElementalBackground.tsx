// ============================================================
// ElementalBackground — Warm Ambient Lounge backdrop
// Soft warm-toned gradient wash with gentle floating light motes
// and a subtle radial warmth glow. Minimal, elegant, and warm.
// NO cold neon. Feels like a premium card lounge at night.
// ============================================================
import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withDelay, Easing, useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW, height: SH } = Dimensions.get('window');

export type ElementalVariant = 'embers' | 'cosmic' | 'ocean';

/* ---- Soft warm light mote ---- */
interface MoteConfig {
  id: number;
  size: number;
  startX: number;
  startY: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
  maxOpacity: number;
}

function Mote({ config }: { config: MoteConfig }) {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) return;
    progress.value = withDelay(
      config.delay,
      withRepeat(withTiming(1, { duration: config.duration, easing: Easing.linear }), -1, false)
    );
  }, []);

  const style = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: config.maxOpacity * 0.5, transform: [{ translateX: config.startX }, { translateY: SH * 0.4 }] };
    }
    const p = progress.value;
    const y = config.startY - p * (SH * 0.7);
    const x = config.startX + Math.sin(p * Math.PI * 2) * config.driftX;
    const opacity = Math.sin(p * Math.PI) * config.maxOpacity;
    return { opacity, transform: [{ translateX: x }, { translateY: y }] };
  });

  return (
    <Animated.View
      style={[styles.mote, {
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: config.color,
      }, style]}
    />
  );
}

/* ---- Warm radial glow ---- */
function WarmGlow({ color, size, left, top, opacity, delay }: {
  color: string; size: number; left: number; top: number; opacity: number; delay: number;
}) {
  const pulse = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withDelay(delay,
      withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: reduceMotion ? opacity : opacity * (0.7 + pulse.value * 0.3),
    transform: [{ scale: reduceMotion ? 1 : 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.glow, {
        width: size, height: size, borderRadius: size / 2,
        left, top, backgroundColor: color,
        shadowColor: color,
      }, style]}
    />
  );
}

/* ---- Main component ---- */
function ElementalBackground({ variant = 'embers', lite = false }: { variant?: ElementalVariant; lite?: boolean }) {
  const motes = useMemo<MoteConfig[]>(() => {
    const colors = ['#F5B800', '#E8364B', '#D4A843', '#FFF5E6', '#A855F7'];
    const count = lite ? 10 : 18;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      startX: Math.random() * SW,
      startY: SH + Math.random() * 80,
      color: colors[i % colors.length],
      duration: 12000 + Math.random() * 8000,
      delay: Math.random() * 8000,
      driftX: 15 + Math.random() * 25,
      maxOpacity: 0.15 + Math.random() * 0.25,
    }));
  }, [lite]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      {/* Base gradient — deep warm charcoal */}
      <LinearGradient
        colors={['#100810', '#0c0a0f', '#0e0a0c', '#0a080c']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm ambient glows — subtle large blurred circles */}
      <WarmGlow color="#3A1520" size={600} left={-200} top={-150} opacity={0.4} delay={0} />
      <WarmGlow color="#1A1028" size={500} left={Math.round(SW * 0.5)} top={Math.round(SH * 0.4)} opacity={0.3} delay={2000} />
      <WarmGlow color="#1C1008" size={450} left={Math.round(SW * 0.3)} top={Math.round(SH * 0.7)} opacity={0.25} delay={4000} />

      {/* Floating warm motes */}
      {motes.map((m) => <Mote key={m.id} config={m} />)}

      {/* Subtle warm top-down wash */}
      <LinearGradient
        colors={['rgba(60,30,15,0.08)', 'rgba(0,0,0,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Edge vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(6,4,8,0.5)']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { pointerEvents: 'none' },
  mote: { position: 'absolute' },
  glow: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 120,
    elevation: 0,
  },
});

export default memo(ElementalBackground);
