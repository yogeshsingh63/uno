// ============================================================
// ConfettiBurst — lightweight one-shot celebration.
// ~34 particles, transform+opacity only, auto-cleans, respects
// reduced-motion (falls back to a soft crossfade).
// ============================================================
import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { usePrefersReducedMotion } from '../../constants/motion';

const COLORS = ['#E53935', '#FFD600', '#43A047', '#1E88E5', '#FF8A00', '#FFFFFF', '#FF3D81'];

interface ConfettiBurstProps {
  /** Re-mounts (new key) to replay */
  burstKey?: string | number;
  count?: number;
}

function ConfettiBurst({ burstKey = 0, count = 34 }: ConfettiBurstProps) {
  const reduced = usePrefersReducedMotion();
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,          // % across the container
      delay: Math.random() * 220,
      size: 5 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      fall: 260 + Math.random() * 220, // px to fall
      spin: (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 260),
    })), [burstKey]);

  // Reduced motion: skip the burst entirely (the modal crossfade is enough)
  if (reduced) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {particles.map((p) => (
        <Particle key={`${burstKey}-${p.id}`} p={p} />
      ))}
    </View>
  );
}

function Particle({ p }: { p: { id: number; x: number; delay: number; size: number; color: string; fall: number; spin: number } }) {
  const y = useSharedValue(-16);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(p.delay, withTiming(1, { duration: 60 }));
    y.value = withDelay(p.delay, withTiming(p.fall, {
      duration: 900 + p.delay,
      easing: Easing.in(Easing.quad),
    }));
    rotate.value = withDelay(p.delay, withTiming(p.spin, {
      duration: 900 + p.delay,
      easing: Easing.linear,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: y.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${p.x}%`,
          width: p.size,
          height: p.size * 1.6,
          borderRadius: p.size * 0.35,
          backgroundColor: p.color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 50,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});

export default memo(ConfettiBurst);
