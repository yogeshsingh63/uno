import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { CARD_WIDTH, CARD_HEIGHT, CARD_BORDER_RADIUS } from '../../constants/cardData';
import { SPRING_BOUNCE } from '../../constants/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DrawPileProps {
  count: number;
  isMyTurn: boolean;
  onDraw: () => void;
}

export default function DrawPile({ count, isMyTurn, onDraw }: DrawPileProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isMyTurn) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.6, { duration: 800 }), withTiming(0.2, { duration: 800 })),
        -1, true
      );
    } else {
      glowOpacity.value = withTiming(0);
    }
  }, [isMyTurn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePress = () => {
    if (!isMyTurn) return;
    scale.value = withSpring(0.9, SPRING_BOUNCE, () => {
      scale.value = withSpring(1, SPRING_BOUNCE);
    });
    onDraw();
  };

  return (
    <AnimatedPressable onPress={handlePress} style={[animatedStyle]}>
      <Animated.View style={[styles.container, glowStyle]}>
        {/* Stacked card backs for depth */}
        {[2, 1, 0].map((offset) => (
          <View key={offset} style={[styles.stackedCard, { top: -offset * 2, left: offset * 1.5 }]}>
            <LinearGradient colors={['#2a2a4a', '#1a1a3e']} style={styles.cardBack}>
              {offset === 0 && (
                <View style={styles.cardBackInner}>
                  <Text style={styles.cardBackText}>UNO</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        ))}

        {/* Card count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH + 6,
    height: CARD_HEIGHT + 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  stackedCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardBack: {
    width: '100%',
    height: '100%',
    borderRadius: CARD_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardBackInner: {
    width: '75%',
    height: '75%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,45,85,0.1)',
  },
  cardBackText: {
    color: Colors.red,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
    textShadowColor: Colors.redGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  countBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  countText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
});
