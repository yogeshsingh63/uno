// ============================================================
// DrawPile — Card-back stack + click to draw (Section 3)
// ============================================================
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
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
  cardWidth?: number;
  cardHeight?: number;
}

export default function DrawPile({ count, isMyTurn, onDraw, cardWidth = CARD_WIDTH, cardHeight = CARD_HEIGHT }: DrawPileProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
      <View style={[styles.container, { width: cardWidth + 6, height: cardHeight + 6 }]}>
        {/* Stacked card backs for 3D depth */}
        {[2, 1, 0].map((offset) => (
          <View key={offset} style={[styles.stackedCard, {
            top: -offset * 2,
            left: offset * 1.5,
            width: cardWidth,
            height: cardHeight,
          }]}>
            <CardBack
              width={cardWidth}
              height={cardHeight}
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
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  stackedCard: {
    position: 'absolute',
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
