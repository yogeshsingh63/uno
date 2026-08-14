// ============================================================
// Card — Master card component with all interactive states
// Section 11: IDLE, UNPLAYABLE, SELECTED, BEING_PLAYED
// ============================================================
import React, { memo, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
  withTiming, withRepeat, interpolate, runOnJS,
} from 'react-native-reanimated';
import { Card as CardType, CardColor, CardType as CType } from '@uno/shared';
import CardFace from './CardFace';
import CardBack from './CardBack';
import { Colors } from '../../constants/colors';
import { CARD_WIDTH, CARD_HEIGHT, CARD_BORDER_RADIUS } from '../../constants/cardDimensions';
import { SPRING_BOUNCE } from '../../constants/animations';
import { usePrefersReducedMotion } from '../../constants/motion';

interface CardProps {
  card: CardType;
  onPress?: (card: CardType) => void;
  disabled?: boolean;
  isPlayable?: boolean;
  faceDown?: boolean;
  small?: boolean;
  size?: 'hand' | 'discard' | 'mini' | 'miniSm' | 'preview';
  style?: any;
  declaredColor?: string | null;
  challengePending?: boolean;
  /** Responsive override — when provided, wins over the static size map */
  cardWidth?: number;
  cardHeight?: number;
}

const SIZES = {
  hand:    { w: 70,  h: 100 },
  discard: { w: 90,  h: 128 },
  mini:    { w: 46,  h: 65  },
  miniSm:  { w: 36,  h: 51  },
  preview: { w: 64,  h: 90  },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CardComponent({
  card, onPress, disabled, isPlayable, faceDown, small, size = 'hand',
  style, declaredColor, challengePending, cardWidth, cardHeight,
}: CardProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const reduced = usePrefersReducedMotion();

  const dim = small ? SIZES.mini : SIZES[size];
  const w = cardWidth ?? dim.w;
  const h = cardHeight ?? Math.round(w * (10 / 7));
  const br = Math.round(w * 0.143); // ~10px at 70w

  // STATE 1 — Playable float animation (single light loop per card)
  useEffect(() => {
    if (isPlayable && !faceDown && !disabled) {
      if (!reduced) {
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 950 }),
            withTiming(0, { duration: 950 }),
          ),
          -1, true
        );
      }
      glowOpacity.value = withTiming(0.45, { duration: 300 });
    } else {
      translateY.value = withTiming(0, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isPlayable, faceDown, disabled, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: (!isPlayable && !faceDown && !disabled) ? 0.52 : 1,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePress = () => {
    if (disabled || faceDown) return;

    // STATE 2 — Unplayable shake
    if (!isPlayable) {
      translateY.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }

    // STATE 3 — Selected press
    scale.value = withSpring(1.06, SPRING_BOUNCE);
    translateY.value = withSpring(-20, { damping: 12, stiffness: 140 });

    // Trigger callback
    onPress?.(card);

    // Return to normal
    setTimeout(() => {
      scale.value = withSpring(1, SPRING_BOUNCE);
      translateY.value = withSpring(0, SPRING_BOUNCE);
    }, 200);
  };

  const handlePressIn = () => {
    if (disabled || faceDown) return;
    scale.value = withSpring(0.95, SPRING_BOUNCE);
    if (isPlayable) {
      translateY.value = withSpring(-12, SPRING_BOUNCE);
    }
  };

  const handlePressOut = () => {
    if (disabled || faceDown) return;
    scale.value = withSpring(1, SPRING_BOUNCE);
    if (!isPlayable) {
      translateY.value = withSpring(0, SPRING_BOUNCE);
    }
  };

  // Face-down card
  if (faceDown) {
    return (
      <Animated.View style={[{ width: w, height: h }, animatedStyle, style]}>
        <CardBack width={w} height={h} borderRadius={br} />
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: w, height: h }, animatedStyle, style]}
    >
      <Animated.View style={[{ width: w, height: h }, glowStyle, styles.glowContainer]}>
        <CardFace
          type={card.type}
          color={card.color}
          value={card.value}
          width={w}
          height={h}
          borderRadius={br}
          declaredColor={declaredColor}
          challengePending={challengePending}
        />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    shadowColor: Colors.metallicGold,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
});

export default memo(CardComponent);
