// ============================================================
// CardMini — Opponent face-down mini-card (Section 12)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import CardBack from './CardBack';
import { MINI_WIDTH, MINI_HEIGHT } from '../../constants/cardDimensions';

interface CardMiniProps {
  count: number;
  playerCount?: number; // total players in game
  isUno?: boolean;      // player has exactly 1 card
}

function CardMini({ count, playerCount = 4, isUno = false }: CardMiniProps) {
  const isSmall = (playerCount || 0) >= 7;
  const w = isSmall ? 36 : MINI_WIDTH;
  const h = isSmall ? 51 : MINI_HEIGHT;
  const maxVisible = isSmall ? 8 : 12;
  const offset = isSmall ? 9 : 12;
  const visibleCount = Math.min(count, maxVisible);
  const overflow = count > maxVisible ? count - maxVisible + 1 : 0;

  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isUno) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 600 }),
          withTiming(0.2, { duration: 600 }),
        ), -1, true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isUno]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { height: h + 10 }]}>
      {Array.from({ length: visibleCount }).map((_, i) => {
        const rotation = (i % 2 === 0 ? 3 : -3);
        const isLast = i === visibleCount - 1;
        return (
          <Animated.View
            key={i}
            style={[
              styles.cardSlot,
              {
                left: i * offset,
                transform: [{ rotate: `${rotation}deg` }],
                zIndex: i,
              },
              isLast && isUno && glowStyle,
              isLast && isUno && styles.unoGlow,
            ]}
          >
            <CardBack width={w} height={h} borderRadius={Math.round(w * 0.143)} />
            {/* Overflow badge on last card */}
            {isLast && overflow > 0 && (
              <View style={styles.overflowBadge}>
                <Text style={styles.overflowText}>+{overflow}</Text>
              </View>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
  },
  cardSlot: {
    position: 'absolute',
  },
  unoGlow: {
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  overflowBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  overflowText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});

export default memo(CardMini);
