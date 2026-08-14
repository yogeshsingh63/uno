// ============================================================
// FlyingCard — a card that arcs between two points (deck→hand,
// hand→discard). Transform/opacity only (no layout thrash).
// One-shot tween, renders above everything, then clears.
// ============================================================
import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withSpring, Easing, runOnJS,
} from 'react-native-reanimated';
import { Card as CardType } from '@uno/shared';
import CardFace from '../cards/CardFace';
import CardBack from '../cards/CardBack';

interface FlyingCardProps {
  card: CardType;
  seq: number;
  cardWidth: number;
  cardHeight: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  onDone: () => void;
  /** Final rotation so the card matches the discard scatter angle */
  landRotate?: number;
  /** Start face-down and 3D-flip face-up mid-flight (deck → hand) */
  flip?: boolean;
  /** Total flight duration in ms */
  duration?: number;
}

function FlyingCard({
  card, seq, cardWidth, cardHeight, from, to, onDone,
  landRotate = 0, flip = false, duration = 520,
}: FlyingCardProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    progress.value = 0;
    opacity.value = 1;
    // Arc feel: grow slightly then shrink as it travels
    scale.value = withSequence(
      withTiming(1.06, { duration: Math.floor(duration * 0.3), easing: Easing.out(Easing.quad) }),
      withTiming(0.96, { duration: Math.floor(duration * 0.7), easing: Easing.inOut(Easing.quad) })
    );
    // Rotation drifts to the landing angle
    rotate.value = withTiming(landRotate, { duration, easing: Easing.inOut(Easing.quad) });
    // 3D flip halfway (draws come out of the deck face-down)
    if (flip) {
      rotateY.value = withTiming(180, {
        duration: Math.floor(duration * 0.62),
        easing: Easing.inOut(Easing.cubic),
      });
    }
    progress.value = withTiming(1, {
      duration,
      easing: Easing.in(Easing.cubic),
    }, (finished) => {
      if (finished) {
        // Landing squash-bounce
        scaleY.value = withSequence(
          withTiming(0.86, { duration: 70 }),
          withSpring(1, { damping: 10, stiffness: 260 }),
        );
        opacity.value = withDelay(90, withTiming(0, { duration: 120 }, () => {
          runOnJS(onDone)();
        }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const style = useAnimatedStyle(() => {
    const x = from.x + (to.x - from.x) * progress.value;
    const y = from.y + (to.y - from.y) * progress.value;
    // Gentle arc: lift above the straight line mid-flight
    const arc = Math.sin(progress.value * Math.PI) * -34;
    const faceUp = progress.value >= 0.5 || !flip;
    return {
      transform: [
        { translateX: x },
        { translateY: y + arc },
        { rotate: `${rotate.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scaleX: scale.value },
        { scaleY: scale.value * scaleY.value },
      ],
      opacity: opacity.value,
    };
  });

  const showFace = !flip || progress.value >= 0.5;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { width: cardWidth, height: cardHeight, marginLeft: -cardWidth / 2, marginTop: -cardHeight / 2 }, style]}
    >
      {showFace ? (
        <CardFace
          type={card.type}
          color={card.color}
          value={card.value}
          width={cardWidth}
          height={cardHeight}
          borderRadius={Math.round(cardWidth * 0.14)}
        />
      ) : (
        <CardBack width={cardWidth} height={cardHeight} borderRadius={Math.round(cardWidth * 0.14)} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 20,
  },
});

export default memo(FlyingCard);
