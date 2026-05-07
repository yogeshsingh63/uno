// ============================================================
// DiscardPile — Layered cards + active color glow (Section 13)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, withRepeat, withTiming, useSharedValue, withSequence,
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
}

function DiscardPile({ topCard, currentColor, previousCard }: DiscardPileProps) {
  const glowOpacity = useSharedValue(0.4);
  const colorHex = getCardColorHex(currentColor);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 }),
      ), -1, true
    );
  }, [currentColor]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  if (!topCard) {
    return (
      <View style={styles.emptyPile}>
        <Text style={styles.emptyText}>Discard</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, glowStyle, { shadowColor: colorHex }]}>
      {/* Layer 1: Previous-previous card (barely visible) */}
      <View style={[styles.layer, styles.layer1]}>
        <CardBack width={DISCARD_WIDTH - 6} height={DISCARD_HEIGHT - 6} borderRadius={9} />
      </View>

      {/* Layer 2: Previous card */}
      <View style={[styles.layer, styles.layer2]}>
        {previousCard ? (
          <CardComponent card={previousCard} disabled size="discard" />
        ) : (
          <CardBack width={DISCARD_WIDTH - 4} height={DISCARD_HEIGHT - 4} borderRadius={9} />
        )}
      </View>

      {/* Color ring */}
      <View style={[styles.colorRing, {
        width: DISCARD_WIDTH + 12,
        height: DISCARD_HEIGHT + 12,
        borderRadius: 14,
        borderColor: colorHex,
      }]} />

      {/* Layer 3: Current top card */}
      <View style={styles.topCardLayer}>
        <CardComponent
          card={topCard}
          disabled
          size="discard"
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
    width: DISCARD_WIDTH + 20,
    height: DISCARD_HEIGHT + 20,
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
