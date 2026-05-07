import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { PlayDirection } from '@uno/shared';
import { Colors } from '../../constants/colors';

interface DirectionArrowProps {
  direction: PlayDirection;
}

export default function DirectionArrow({ direction }: DirectionArrowProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withSpring(direction === 1 ? 0 : 180);
  }, [direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
    fontSize: 28,
    color: Colors.textSecondary,
    textShadowColor: Colors.neonPurple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
});
