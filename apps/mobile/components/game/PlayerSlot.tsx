// ============================================================
// PlayerSlot — Opponent display with turn ring + special-card
// effect moments (skip X-flash, +2/+4 hit, UNO caught).
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, withRepeat, withSequence, withTiming,
  useSharedValue, withDelay,
} from 'react-native-reanimated';
import { PlayerGameState } from '@uno/shared';
import CardMini from '../cards/CardMini';
import AvatarBadge from '../ui/AvatarBadge';
import { Colors } from '../../constants/colors';
import { createSkipAnimation } from '../../utils/cardAnimations';

interface PlayerSlotProps {
  player: PlayerGameState;
  isActive: boolean;
  position?: 'top' | 'topLeft' | 'topRight' | 'left' | 'right';
  totalPlayers?: number;
  /** Transient special-card effect targeting this player */
  effect?: { kind: 'skip' | 'hit' | 'caught' } | null;
}

function PlayerSlot({ player, isActive, position = 'top', totalPlayers = 4, effect }: PlayerSlotProps) {
  const ringOpacity = useSharedValue(0);
  const xMarkScale = useSharedValue(0);
  const xMarkOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const hitRingOpacity = useSharedValue(0);
  const dimOpacity = useSharedValue(1);

  // Turn ring pulse
  React.useEffect(() => {
    if (isActive) {
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.4, { duration: 600 }),
        ), -1, true
      );
    } else {
      ringOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isActive]);

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
      // Grey out + red X pop
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
      // Red flash ring + shake
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
      // Red X + shake (gotcha!)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect?.kind]);

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: isActive ? Colors.neonCyan : 'transparent',
    opacity: ringOpacity.value,
  }));

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

  // Connection dot color
  const dotColor = player.isConnected ? Colors.green : Colors.error;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Avatar with turn ring */}
      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.turnRing, ringStyle]} />
        <Animated.View style={[styles.hitRing, hitRingStyle]} />
        <AvatarBadge
          emoji={player.avatar}
          size={36}
        />

        {/* Skip / caught X mark */}
        <Animated.View style={[styles.xMark, xMarkStyle]} pointerEvents="none">
          <Text style={styles.xMarkText}>✕</Text>
        </Animated.View>

        {/* Connection dot */}
        <View style={[styles.connectionDot, { backgroundColor: dotColor }]} />

        {/* UNO badge */}
        {player.cardCount === 1 && (
          <View style={styles.unoBadge}>
            <Text style={styles.unoBadgeText}>1</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
        {player.name}
      </Text>

      {/* Card count */}
      <View style={styles.cardCountBadge}>
        <Text style={styles.cardCountText}>{player.cardCount}♠</Text>
      </View>

      {/* Mini cards */}
      <View style={styles.miniCardsContainer}>
        <CardMini
          count={player.cardCount}
          playerCount={totalPlayers}
          isUno={player.cardCount === 1}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 60,
    maxWidth: 120,
  },
  avatarContainer: {
    position: 'relative',
  },
  turnRing: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    top: -5,
    left: -5,
  },
  hitRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    top: -7,
    left: -7,
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  xMark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 5,
  },
  xMarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  connectionDot: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  unoBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  unoBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  name: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    maxWidth: 80,
  },
  nameActive: {
    color: Colors.neonCyan,
    fontWeight: '800',
  },
  cardCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  cardCountText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  miniCardsContainer: {
    marginTop: 4,
    height: 70,
    overflow: 'hidden',
  },
});

export default memo(PlayerSlot);
