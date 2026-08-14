// ============================================================
// PlayerSlot — Opponent display with turn ring + special-card
// effect moments (skip X-flash, +2/+4 hit, UNO caught).
// Clean, elegant player capsule with proper UNO branding.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, withSequence, withTiming,
  useSharedValue, withDelay,
} from 'react-native-reanimated';
import { PlayerGameState } from '@uno/shared';
import AvatarBadge from '../ui/AvatarBadge';
import { Colors } from '../../constants/colors';
import { createSkipAnimation } from '../../utils/cardAnimations';

interface PlayerSlotProps {
  player: PlayerGameState;
  isActive: boolean;
  position?: 'top' | 'topLeft' | 'topRight' | 'left' | 'right';
  totalPlayers?: number;
  effect?: { kind: 'skip' | 'hit' | 'caught' } | null;
}

function PlayerSlot({ player, isActive, position = 'top', effect }: PlayerSlotProps) {
  const xMarkScale = useSharedValue(0);
  const xMarkOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const hitRingOpacity = useSharedValue(0);
  const dimOpacity = useSharedValue(1);

  // Special-card moments
  React.useEffect(() => {
    if (!effect) {
      xMarkScale.value = withTiming(0, { duration: 150 });
      xMarkOpacity.value = withTiming(0, { duration: 150 });
      hitRingOpacity.value = withTiming(0, { duration: 200 });
      dimOpacity.value = withTiming(1, { duration: 250 });
      shakeX.value = withTiming(0, { duration: 80 });
      return;
    }

    if (effect.kind === 'skip') {
      dimOpacity.value = withSequence(
        withTiming(0.45, { duration: 120 }),
        withDelay(700, withTiming(1, { duration: 250 })),
      );
      createSkipAnimation(xMarkScale, xMarkOpacity);
      shakeX.value = withSequence(
        withTiming(-4, { duration: 45 }),
        withTiming(4, { duration: 45 }),
        withTiming(-3, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    } else if (effect.kind === 'hit') {
      hitRingOpacity.value = withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(420, withTiming(0, { duration: 260 })),
      );
      shakeX.value = withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      dimOpacity.value = withSequence(
        withTiming(0.7, { duration: 90 }),
        withDelay(500, withTiming(1, { duration: 200 })),
      );
    } else if (effect.kind === 'caught') {
      createSkipAnimation(xMarkScale, xMarkOpacity);
      hitRingOpacity.value = withSequence(
        withTiming(1, { duration: 80 }),
        withDelay(500, withTiming(0, { duration: 250 })),
      );
      shakeX.value = withSequence(
        withTiming(-5, { duration: 45 }),
        withTiming(5, { duration: 45 }),
        withTiming(-4, { duration: 45 }),
        withTiming(4, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [effect?.kind]);

  const hitRingStyle = useAnimatedStyle(() => ({
    opacity: hitRingOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: dimOpacity.value,
    transform: [{ translateX: shakeX.value }],
  }));

  const xMarkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: xMarkScale.value },
      { rotate: '45deg' },
    ],
    opacity: xMarkOpacity.value,
  }));

  const dotColor = player.isConnected ? Colors.green : Colors.error;
  const isUno = player.cardCount === 1;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Player Card Pod */}
      <View style={[styles.pod, isActive && styles.podActive]}>
        {/* Avatar with turn ring */}
        <View style={styles.avatarContainer}>
          {isActive && <View style={[styles.turnRing, styles.turnRingActive]} />}
          <Animated.View style={[styles.hitRing, hitRingStyle]} />
          <AvatarBadge emoji={player.avatar} size={36} />

          {/* Skip / caught X mark */}
          <Animated.View style={[styles.xMark, xMarkStyle]} pointerEvents="none">
            <Text style={styles.xMarkText}>✕</Text>
          </Animated.View>

          {/* Connection dot */}
          <View style={[styles.connectionDot, { backgroundColor: dotColor }]} />
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
            {player.name}
          </Text>

          {/* Card count pill */}
          <View style={[styles.cardBadge, isUno && styles.unoBadge]}>
            <Text style={[styles.cardBadgeText, isUno && styles.unoBadgeText]}>
              {isUno ? 'UNO! 1' : `${player.cardCount} CARDS`}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 22, 30, 0.85)',
    borderRadius: 22,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 220, 180, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  podActive: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(38, 28, 38, 0.95)',
    shadowColor: Colors.yellow,
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 6,
  },
  turnRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    top: -4,
    left: -4,
  },
  turnRingActive: {
    borderColor: Colors.yellow,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  hitRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    top: -6,
    left: -6,
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  xMark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    zIndex: 5,
  },
  xMarkText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  connectionDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  infoCol: {
    justifyContent: 'center',
    maxWidth: 90,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameActive: {
    color: Colors.yellow,
    fontWeight: '800',
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 220, 180, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    alignSelf: 'flex-start',
  },
  cardBadgeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  unoBadge: {
    backgroundColor: Colors.red,
  },
  unoBadgeText: {
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default memo(PlayerSlot);
