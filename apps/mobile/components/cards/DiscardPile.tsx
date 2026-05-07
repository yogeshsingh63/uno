import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue, withSequence } from 'react-native-reanimated';
import { Card as CardType, CardColor } from '../../../../packages/shared/src/types';
import CardComponent from './Card';
import { Colors, UNO_CARD_COLORS } from '../../constants/colors';
import { CARD_WIDTH, CARD_HEIGHT } from '../../constants/cardData';

interface DiscardPileProps {
  topCard: CardType | null;
  currentColor: CardColor;
}

export default function DiscardPile({ topCard, currentColor }: DiscardPileProps) {
  const glowOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 }),
      ),
      -1,
      true
    );
  }, []);

  const colorInfo = UNO_CARD_COLORS[currentColor] || UNO_CARD_COLORS.RED;

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, glowStyle, { shadowColor: colorInfo.primary }]}>
      {/* Color indicator ring */}
      <View style={[styles.colorRing, { borderColor: colorInfo.primary }]} />

      {topCard ? (
        <View style={styles.cardWrapper}>
          <CardComponent card={topCard} disabled faceDown={false} />
        </View>
      ) : (
        <View style={[styles.emptyPile]}>
          <Text style={styles.emptyText}>Discard</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  colorRing: {
    position: 'absolute',
    width: CARD_WIDTH + 16,
    height: CARD_HEIGHT + 16,
    borderRadius: 14,
    borderWidth: 3,
  },
  cardWrapper: {
    transform: [{ rotate: '-5deg' }],
  },
  emptyPile: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
