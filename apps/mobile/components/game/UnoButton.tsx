// ============================================================
// UnoButton — Section 14
// ============================================================
import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withSpring, withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface UnoButtonProps {
  visible: boolean;
  shouldPulse?: boolean;
  onPress: () => void;
}

function UnoButton({ visible, shouldPulse, onPress }: UnoButtonProps) {
  const scale = useSharedValue(0.82);
  const glowOpacity = useSharedValue(0);
  const labelScale = useSharedValue(0);
  const labelY = useSharedValue(0);
  const labelOpacity = useSharedValue(0);

  useEffect(() => {
    if (shouldPulse && visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 450 }),
          withTiming(1.0, { duration: 450 }),
        ), -1, true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 450 }),
          withTiming(0.4, { duration: 450 }),
        ), -1, true
      );
    } else if (visible) {
      scale.value = withSpring(1.0);
      glowOpacity.value = withTiming(0.7, { duration: 300 });
    } else {
      scale.value = withTiming(0.82, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, shouldPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: visible ? 1 : 0.32,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: labelScale.value },
      { translateY: labelY.value },
    ],
    opacity: labelOpacity.value,
  }));

  const handlePress = () => {
    if (!visible) return;

    // Press feedback
    scale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withSpring(1.0, { damping: 8, stiffness: 200 }),
    );

    // "UNO!" text launches upward
    labelScale.value = 0;
    labelY.value = 0;
    labelOpacity.value = 1;
    labelScale.value = withSequence(
      withSpring(1.8, { damping: 6, stiffness: 120 }),
      withTiming(1.0, { duration: 200 }),
    );
    labelY.value = withTiming(-80, { duration: 600 });
    labelOpacity.value = withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 300 }),
    );

    onPress();
  };

  return (
    <View style={styles.wrapper}>
      {/* Floating "UNO!" text */}
      <Animated.Text style={[styles.floatingLabel, labelStyle]}>
        UNO!
      </Animated.Text>

      <AnimatedPressable
        onPress={handlePress}
        style={[styles.button, animatedStyle]}
      >
        <Animated.View style={[styles.glowView, glowStyle]}>
          <Text style={styles.buttonText}>UNO!</Text>
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 145,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E53935',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(229,57,53,0.7)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 10,
  },
  glowView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 29,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    fontStyle: 'italic',
  },
  floatingLabel: {
    position: 'absolute',
    bottom: 60,
    color: '#FFD600',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 51,
  },
});

export default memo(UnoButton);
