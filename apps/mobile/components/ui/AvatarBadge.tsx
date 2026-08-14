import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarGradient } from '../../constants/avatars';

interface AvatarBadgeProps {
  emoji: string;
  size?: number;
  /** Border ring color when active (e.g. current turn) */
  ringColor?: string | null;
  style?: any;
}

function AvatarBadge({ emoji, size = 40, ringColor, style }: AvatarBadgeProps) {
  const gradient = getAvatarGradient(emoji);
  const ringSize = size + 6;

  return (
    <View style={[styles.wrap, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }, style]}>
      {ringColor ? (
        <View style={[styles.ring, { borderColor: ringColor }]} />
      ) : null}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.52 }]}>{emoji}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2.5,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  emoji: {},
});

export default memo(AvatarBadge);
