// ============================================================
// DrawPile — Card-back stack + click to draw (Section 3)
// ============================================================
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring,
} from 'react-native-reanimated';
import CardBack from './CardBack';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/cardDimensions';
import { Colors } from '../../constants/colors';
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
      glowOpacity.value = withTiming(0, { duration: 300 });
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
        {/* Stacked card backs for 3D depth */}
        {[2, 1, 0].map((offset) => (
          <View key={offset} style={[styles.stackedCard, {
            top: -offset * 2,
            left: offset * 1.5,
          }]}>
            <CardBack
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              borderRadius={10}
            />
          </View>
        ))}

        {/* Card count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>

        {/* Draw label when it's your turn */}
        {isMyTurn && (
          <View style={styles.drawLabel}>
            <Text style={styles.drawText}>DRAW</Text>
          </View>
        )}
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
  countBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    zIndex: 10,
  },
  countText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  drawLabel: {
    position: 'absolute',
    bottom: -24,
    backgroundColor: 'rgba(100,210,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  drawText: {
    color: Colors.neonCyan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
