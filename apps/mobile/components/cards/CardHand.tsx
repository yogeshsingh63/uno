import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Dimensions } from 'react-native';
import { Card as CardType, CardColor } from '../../../../packages/shared/src/types';
import { isCardPlayable } from '../../../../apps/server/src/game/Player';
import CardComponent from './Card';
import { CARD_WIDTH, CARD_HAND_OVERLAP } from '../../constants/cardData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardHandProps {
  cards: CardType[];
  topCard: CardType;
  currentColor: CardColor;
  isMyTurn: boolean;
  onPlayCard: (card: CardType) => void;
}

export default function CardHand({ cards, topCard, currentColor, isMyTurn, onPlayCard }: CardHandProps) {
  const itemWidth = Math.min(CARD_WIDTH, (SCREEN_WIDTH - 40) / Math.max(cards.length, 1));

  const renderCard = useCallback(({ item, index }: { item: CardType; index: number }) => {
    const playable = isMyTurn && isCardPlayable(item, topCard, currentColor);
    return (
      <View style={{ marginRight: index < cards.length - 1 ? -CARD_HAND_OVERLAP : 0 }}>
        <CardComponent
          card={item}
          isPlayable={playable}
          disabled={!isMyTurn}
          onPress={onPlayCard}
        />
      </View>
    );
  }, [cards, topCard, currentColor, isMyTurn, onPlayCard]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_WIDTH - CARD_HAND_OVERLAP,
    offset: (CARD_WIDTH - CARD_HAND_OVERLAP) * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    paddingHorizontal: 10,
  },
  listContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});
