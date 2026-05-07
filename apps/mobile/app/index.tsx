import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, withDelay,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';

export default function SplashScreenPage() {
  const router = useRouter();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const glowRadius = useSharedValue(0);

  useEffect(() => {
    // Logo scale + fade in
    scale.value = withDelay(300, withTiming(1.1, { duration: 800 }));
    opacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    // Glow pulse
    glowRadius.value = withDelay(1000, withRepeat(
      withSequence(
        withTiming(20, { duration: 800 }),
        withTiming(8, { duration: 800 }),
      ),
      3
    ));

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    textShadowRadius: glowRadius.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, logoStyle]}>UNO</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: opacity.value }]}>
        MULTIPLAYER
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.red,
    letterSpacing: 8,
    textShadowColor: Colors.redGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 8,
    marginTop: 8,
  },
});
