// ============================================================
// CardHand — Local player's hand with arc + frosted glass
// Section 16
// ============================================================
import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card as CardType, CardColor, isCardPlayable } from '@uno/shared';
import CardComponent from './Card';
import { CARD_WIDTH, CARD_HAND_OVERLAP } from '../../constants/cardDimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardHandProps {
  cards: CardType[];
  topCard: CardType;
  currentColor: CardColor;
  isMyTurn: boolean;
  onPlayCard: (card: CardType) => void;
}

export default function CardHand({ cards, topCard, currentColor, isMyTurn, onPlayCard }: CardHandProps) {
  const n = cards.length;

  const renderCard = useCallback(({ item, index }: { item: CardType; index: number }) => {
    const playable = isMyTurn && isCardPlayable(item, topCard, currentColor);

    // Arc formation (Section 16): rotation + vertical offset
    const mid = (n - 1) / 2;
    const rotation = (index - mid) * 2.8;
    const yOffset = Math.abs(index - mid) * 3.5;

    return (
      <View style={{
        marginRight: index < n - 1 ? -CARD_HAND_OVERLAP : 0,
        transform: [
          { rotate: `${rotation}deg` },
          { translateY: yOffset },
        ],
      }}>
        <CardComponent
          card={item}
          isPlayable={playable}
          disabled={!isMyTurn}
          onPress={onPlayCard}
          size="hand"
        />
      </View>
    );
  }, [cards, topCard, currentColor, isMyTurn, onPlayCard, n]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_WIDTH - CARD_HAND_OVERLAP,
    offset: (CARD_WIDTH - CARD_HAND_OVERLAP) * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      {/* Frosted glass background */}
      <View style={styles.frostedBg} />

      {/* Left fade mask */}
      <LinearGradient
        colors={['rgba(13,13,26,1)', 'rgba(13,13,26,0)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.fadeLeft}
        pointerEvents="none"
      />

      {/* Right fade mask */}
      <LinearGradient
        colors={['rgba(13,13,26,0)', 'rgba(13,13,26,1)']}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 132,
    position: 'relative',
  },
  frostedBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fadeLeft: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, zIndex: 10,
    borderTopLeftRadius: 20,
  },
  fadeRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 24, zIndex: 10,
    borderTopRightRadius: 20,
  },
  listContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 10,
  },
});
