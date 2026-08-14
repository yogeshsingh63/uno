import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, Easing,
} from 'react-native-reanimated';
import { PlayDirection } from '@uno/shared';
import { Colors } from '../../constants/colors';

interface DirectionArrowProps {
  direction: PlayDirection;
  style?: any;
}

export default function DirectionArrow({ direction, style }: DirectionArrowProps) {
  const rotation = useSharedValue(0);
  const lastDir = React.useRef<PlayDirection>(direction);

  React.useEffect(() => {
    if (lastDir.current !== direction) {
      // Full 360 swoosh in the new direction, then settle on the glyph flip
      const spin = direction === 1 ? -360 : 360;
      rotation.value = withSequence(
        withTiming(rotation.value + spin, {
          duration: 440,
          easing: Easing.inOut(Easing.cubic),
        }),
        withSpring(direction === 1 ? 0 : 180, { damping: 16, stiffness: 200 }),
      );
      lastDir.current = direction;
    }
  }, [direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Text style={styles.arrow}>↻</Text>
      <Text style={styles.label}>{direction === 1 ? 'CW' : 'CCW'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 15,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: Colors.metallicGold,
    textShadowColor: 'rgba(245,184,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
});
