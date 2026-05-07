// ============================================================
// PlayerSlot — Opponent display (Section 13 + 12)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue,
} from 'react-native-reanimated';
import { PlayerGameState } from '@uno/shared';
import CardMini from '../cards/CardMini';
import { Colors } from '../../constants/colors';

interface PlayerSlotProps {
  player: PlayerGameState;
  isActive: boolean;
  position?: 'top' | 'topLeft' | 'topRight' | 'left' | 'right';
  totalPlayers?: number;
}

function PlayerSlot({ player, isActive, position = 'top', totalPlayers = 4 }: PlayerSlotProps) {
  const ringOpacity = useSharedValue(0);

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

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: isActive ? Colors.neonCyan : 'transparent',
    opacity: ringOpacity.value,
  }));

  // Connection dot color
  const dotColor = player.isConnected ? Colors.green : Colors.error;

  return (
    <View style={styles.container}>
      {/* Avatar with turn ring */}
      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.turnRing, ringStyle]} />
        <View style={[styles.avatar, isActive && styles.avatarActive]}>
          <Text style={styles.avatarText}>{player.avatar}</Text>
        </View>

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
    </View>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    top: -4,
    left: -4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  avatarActive: {
    borderColor: Colors.neonCyan,
  },
  avatarText: { fontSize: 18 },
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
