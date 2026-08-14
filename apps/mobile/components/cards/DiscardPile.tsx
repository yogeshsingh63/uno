// ============================================================
// DiscardPile — Layered cards + active color glow (Section 13)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, withRepeat, withTiming, useSharedValue, withSequence, withSpring,
} from 'react-native-reanimated';
import { Card as CardType, CardColor } from '@uno/shared';
import CardComponent from './Card';
import CardBack from './CardBack';
import { DISCARD_WIDTH, DISCARD_HEIGHT } from '../../constants/cardDimensions';
import { getCardColorHex } from '../../constants/cardColors';
import { Colors } from '../../constants/colors';

interface DiscardPileProps {
  topCard: CardType | null;
  currentColor: CardColor;
  previousCard?: CardType | null;
  cardWidth?: number;
  cardHeight?: number;
}

function DiscardPile({ topCard, currentColor, previousCard, cardWidth = DISCARD_WIDTH, cardHeight = DISCARD_HEIGHT }: DiscardPileProps) {
  const glowOpacity = useSharedValue(0.4);
  const pop = useSharedValue(1);
  const colorHex = getCardColorHex(currentColor);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 }),
      ), -1, true
    );
  }, [currentColor]);

  // Spring-pop the pile whenever a new card lands on top
  React.useEffect(() => {
    pop.value = 0.86;
    pop.value = withSpring(1, { damping: 13, stiffness: 240 });
  }, [topCard?.id]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  if (!topCard) {
    return (
      <View style={[styles.emptyPile, { width: cardWidth, height: cardHeight }]}>
        <Text style={styles.emptyText}>Discard</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, glowStyle, popStyle, { shadowColor: colorHex, width: cardWidth + 20, height: cardHeight + 20 }]}>
      {/* Layer 1: Previous-previous card (barely visible) */}
      <View style={[styles.layer, styles.layer1]}>
        <CardBack width={cardWidth - 6} height={cardHeight - 6} borderRadius={9} />
      </View>

      {/* Layer 2: Previous card */}
      <View style={[styles.layer, styles.layer2]}>
        {previousCard ? (
          <CardComponent card={previousCard} disabled size="discard" cardWidth={cardWidth - 2} cardHeight={cardHeight - 2} />
        ) : (
          <CardBack width={cardWidth - 4} height={cardHeight - 4} borderRadius={9} />
        )}
      </View>

      {/* Color ring */}
      <View style={[styles.colorRing, {
        width: cardWidth + 12,
        height: cardHeight + 12,
        borderRadius: 14,
        borderColor: colorHex,
      }]} />

      {/* Layer 3: Current top card */}
      <View style={styles.topCardLayer}>
        <CardComponent
          card={topCard}
          disabled
          size="discard"
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          declaredColor={
            topCard.color === 'WILD' ? currentColor : undefined
          }
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 22,
    elevation: 12,
  },
  layer: { position: 'absolute' },
  layer1: {
    opacity: 0.4,
    transform: [{ rotate: '5deg' }, { translateX: 4 }, { translateY: -4 }],
  },
  layer2: {
    opacity: 0.7,
    transform: [{ rotate: '2deg' }, { translateX: 2 }, { translateY: -2 }],
  },
  topCardLayer: {
    zIndex: 3,
  },
  colorRing: {
    position: 'absolute',
    borderWidth: 3,
    zIndex: 1,
  },
  emptyPile: {
    width: DISCARD_WIDTH,
    height: DISCARD_HEIGHT,
    borderRadius: 12,
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

export default memo(DiscardPile);
