import React, { memo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming,
  interpolate, Extrapolation,
} from 'react-native-reanimated';
import { Card as CardType, CardColor, CardType as CType } from '@uno/shared';
import { Colors, UNO_CARD_COLORS } from '../../constants/colors';
import { CARD_SYMBOLS, CARD_WIDTH, CARD_HEIGHT, CARD_BORDER_RADIUS } from '../../constants/cardData';
import { SPRING_BOUNCE } from '../../constants/animations';

interface CardProps {
  card: CardType;
  onPress?: (card: CardType) => void;
  disabled?: boolean;
  isPlayable?: boolean;
  faceDown?: boolean;
  small?: boolean;
  style?: any;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getCardGradient(color: CardColor): [string, string] {
  switch (color) {
    case CardColor.RED: return ['#ff4060', '#cc1a3a'];
    case CardColor.YELLOW: return ['#ffe040', '#ccaa00'];
    case CardColor.GREEN: return ['#40e070', '#1fa044'];
    case CardColor.BLUE: return ['#40a0ff', '#0066cc'];
    default: return ['#6a6a8a', '#3a3a5a'];
  }
}

function getWildGradient(): [string, string, string, string] {
  return ['#ff2d55', '#ffd60a', '#30d158', '#0a84ff'];
}

function getDisplayValue(card: CardType): string {
  if (card.type === CType.NUMBER) return String(card.value ?? 0);
  return CARD_SYMBOLS[card.type] || '?';
}

function CardComponent({ card, onPress, disabled, isPlayable, faceDown, small, style }: CardProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const w = small ? CARD_WIDTH * 0.6 : CARD_WIDTH;
  const h = small ? CARD_HEIGHT * 0.6 : CARD_HEIGHT;
  const fontSize = small ? 16 : 28;
  const smallFontSize = small ? 8 : 12;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handlePress = () => {
    if (disabled || faceDown) return;
    if (!isPlayable) {
      // Shake animation for invalid card
      translateY.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }
    scale.value = withSpring(0.95, SPRING_BOUNCE, () => {
      scale.value = withSpring(1, SPRING_BOUNCE);
    });
    onPress?.(card);
  };

  const handlePressIn = () => {
    if (!disabled && !faceDown) {
      scale.value = withSpring(0.95, SPRING_BOUNCE);
      if (isPlayable) translateY.value = withSpring(-10, SPRING_BOUNCE);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_BOUNCE);
    translateY.value = withSpring(0, SPRING_BOUNCE);
  };

  if (faceDown) {
    return (
      <Animated.View style={[{ width: w, height: h }, animatedStyle, style]}>
        <LinearGradient
          colors={['#2a2a4a', '#1a1a3e']}
          style={[styles.card, { width: w, height: h }]}
        >
          <View style={styles.cardBackInner}>
            <Text style={[styles.cardBackText, { fontSize: fontSize * 0.7 }]}>UNO</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  const isWild = card.color === CardColor.WILD;
  const displayValue = getDisplayValue(card);
  const colorInfo = UNO_CARD_COLORS[card.color];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: w, height: h }, animatedStyle, style]}
    >
      <LinearGradient
        colors={isWild ? getWildGradient() : getCardGradient(card.color)}
        start={isWild ? { x: 0, y: 0 } : { x: 0, y: 0 }}
        end={isWild ? { x: 1, y: 1 } : { x: 1, y: 1 }}
        style={[
          styles.card,
          { width: w, height: h },
          isPlayable && styles.playableGlow,
          isPlayable && { shadowColor: colorInfo?.primary || Colors.white },
        ]}
      >
        {/* Top-left value */}
        <Text style={[styles.cornerText, styles.topLeft, { fontSize: smallFontSize }]}>
          {displayValue}
        </Text>

        {/* Center value */}
        <View style={styles.centerOval}>
          <Text style={[styles.centerText, { fontSize }]}>
            {displayValue}
          </Text>
        </View>

        {/* Bottom-right value */}
        <Text style={[styles.cornerText, styles.bottomRight, { fontSize: smallFontSize }]}>
          {displayValue}
        </Text>

        {/* Glossy shine overlay */}
        <View style={styles.glossOverlay} />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playableGlow: {
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cornerText: {
    position: 'absolute',
    color: '#fff',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topLeft: { top: 4, left: 6 },
  bottomRight: { bottom: 4, right: 6, transform: [{ rotate: '180deg' }] },
  centerOval: {
    width: '70%',
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-20deg' }],
  },
  centerText: {
    color: '#fff',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    transform: [{ rotate: '20deg' }],
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: CARD_BORDER_RADIUS,
    borderTopRightRadius: CARD_BORDER_RADIUS,
  },
  cardBackInner: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,45,85,0.15)',
  },
  cardBackText: {
    color: Colors.red,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: Colors.redGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default memo(CardComponent);
