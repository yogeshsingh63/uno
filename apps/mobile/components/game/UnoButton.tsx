import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface UnoButtonProps {
  visible: boolean;
  shouldPulse: boolean;
  onPress: () => void;
}

export default function UnoButton({ visible, shouldPulse, onPress }: UnoButtonProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    if (shouldPulse) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(0.9, { duration: 200 }),
          withTiming(1.1, { duration: 200 }),
          withTiming(1, { duration: 200 }),
        ),
        -1
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(-3, { duration: 100 }),
          withTiming(3, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        ),
        -1
      );
    } else {
      scale.value = withSpring(1);
      rotate.value = withSpring(0);
    }
  }, [shouldPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <AnimatedPressable onPress={onPress} style={[styles.button, animatedStyle]}>
      <Text style={styles.text}>UNO!</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
