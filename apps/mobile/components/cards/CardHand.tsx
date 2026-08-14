// ============================================================
// CardHand — Local player's hand with arc + frosted glass
// Deal-in stagger on mount, FLIP-style settle on removal.
// ============================================================
import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Card as CardType, CardColor, isCardPlayable } from '@uno/shared';
import CardComponent from './Card';
import { useResponsive } from '../../hooks/useResponsive';
import { usePrefersReducedMotion } from '../../constants/motion';
import { CARD_HAND_OVERLAP } from '../../constants/cardDimensions';

interface CardHandProps {
  cards: CardType[];
  topCard: CardType;
  currentColor: CardColor;
  isMyTurn: boolean;
  onPlayCard: (card: CardType) => void;
}

export default function CardHand({ cards, topCard, currentColor, isMyTurn, onPlayCard }: CardHandProps) {
  const { cardW, cardH } = useResponsive();
  const reduced = usePrefersReducedMotion();
  const n = cards.length;
  const overlap = Math.min(CARD_HAND_OVERLAP, cardW * 0.34);

  const renderCard = useCallback(({ item, index }: { item: CardType; index: number }) => {
    const playable = isMyTurn && isCardPlayable(item, topCard, currentColor);

    // Arc formation: rotation + vertical offset
    const mid = (n - 1) / 2;
    const rotation = (index - mid) * 2.8;
    const yOffset = Math.abs(index - mid) * 3.5;

    const entering = reduced
      ? FadeIn.duration(140)
      : FadeInDown.duration(250).delay(Math.min(index, 8) * 45).springify().damping(16);

    return (
      <Animated.View
        entering={entering}
        layout={LinearTransition.duration(220)}
        style={{
          marginRight: index < n - 1 ? -overlap : 0,
          transform: [
            { rotate: `${rotation}deg` },
            { translateY: yOffset },
          ],
        }}
      >
        <CardComponent
          card={item}
          isPlayable={playable}
          disabled={!isMyTurn}
          onPress={onPlayCard}
          size="hand"
          cardWidth={cardW}
          cardHeight={cardH}
        />
      </Animated.View>
    );
  }, [cards, topCard, currentColor, isMyTurn, onPlayCard, n, cardW, cardH, overlap, reduced]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: cardW - overlap,
    offset: (cardW - overlap) * index,
    index,
  }), [cardW, overlap]);

  return (
    <View style={[styles.container, { height: cardH + 38 }]}>
      {/* Frosted glass background */}
      <View style={styles.frostedBg} />

      {/* Left fade mask */}
      <LinearGradient
        colors={['rgba(12,10,15,0.9)', 'rgba(12,10,15,0)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.fadeLeft}
        pointerEvents="none"
      />

      {/* Right fade mask */}
      <LinearGradient
        colors={['rgba(12,10,15,0)', 'rgba(12,10,15,0.9)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.fadeRight}
        pointerEvents="none"
      />

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        decelerationRate="fast"
        extraData={[isMyTurn, topCard, currentColor]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  frostedBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 14, 22, 0.80)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 220, 180, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  fadeLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, zIndex: 10,
    borderTopLeftRadius: 22,
  },
  fadeRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 24, zIndex: 10,
    borderTopRightRadius: 22,
  },
  listContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 4,
  },
});
