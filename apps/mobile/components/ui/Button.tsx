import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { SPRING_BOUNCE } from '../../constants/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const GRADIENTS: Record<string, [string, string]> = {
  primary: [Colors.red, Colors.redDark],
  secondary: [Colors.surfaceLight, Colors.surface],
  danger: ['#ff453a', '#cc2a24'],
};

export default function Button({ title, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, SPRING_BOUNCE); }}
      onPressOut={() => { scale.value = withSpring(1, SPRING_BOUNCE); }}
      disabled={disabled}
      style={[animStyle, disabled && { opacity: 0.5 }]}
    >
      <LinearGradient
        colors={GRADIENTS[variant] || GRADIENTS.primary}
        style={[styles.button, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
});
