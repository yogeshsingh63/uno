import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import { PlayerGameState } from '@uno/shared';
import { Colors } from '../../constants/colors';

interface PlayerSlotProps {
  player: PlayerGameState;
  isActive: boolean;
  position: 'top' | 'left' | 'right' | 'topLeft' | 'topRight';
}

function PlayerSlot({ player, isActive, position }: PlayerSlotProps) {
  const glowScale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      glowScale.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1, true
      );
    } else {
      glowScale.value = withTiming(1);
    }
  }, [isActive]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={[styles.container, !player.isConnected && styles.disconnected]}>
      <Animated.View style={[styles.avatarContainer, isActive && styles.activeRing, glowStyle]}>
        <Text style={styles.avatar}>{player.avatar}</Text>
      </Animated.View>

      <Text style={styles.name} numberOfLines={1}>{player.name}</Text>

      <View style={styles.cardCountBadge}>
        <Text style={styles.cardCount}>{player.cardCount}</Text>
      </View>

      {player.hasCalledUno && player.cardCount === 1 && (
        <View style={styles.unoBadge}>
          <Text style={styles.unoText}>UNO!</Text>
        </View>
      )}

      {!player.isConnected && (
        <View style={styles.disconnectedBadge}>
          <Text style={styles.disconnectedText}>⚡</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 6,
    minWidth: 60,
  },
  disconnected: {
    opacity: 0.4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceBorder,
  },
  activeRing: {
    borderColor: Colors.neonPink,
    shadowColor: Colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    fontSize: 22,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    maxWidth: 60,
    textAlign: 'center',
  },
  cardCountBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cardCount: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  unoBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: Colors.red,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  unoText: {
    color: Colors.white,
    fontSize: 7,
    fontWeight: '900',
  },
  disconnectedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  disconnectedText: {
    fontSize: 12,
  },
});

export default memo(PlayerSlot);
