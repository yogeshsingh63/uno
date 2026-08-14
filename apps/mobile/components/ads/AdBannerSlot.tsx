// ============================================================
// AdBannerSlot — placeholder bottom banner.
// Clearly labeled "AD" and visually separated from game chrome so
// it can never be confused with game UI (avoids accidental taps).
// Collapsible; wires into adHooks.maybeShowInterstitial later.
// ============================================================
import React, { memo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { BANNER_SLOT_ID } from './adHooks';

interface AdBannerSlotProps {
  visible?: boolean;
  /** Compact variant for in-game (true) vs page footer (false) */
  compact?: boolean;
}

function AdBannerSlot({ visible = true, compact = true }: AdBannerSlotProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(320)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.wrap, compact && styles.wrapCompact]}
    >
      <LinearGradient
        colors={['rgba(26,26,46,0.9)', 'rgba(20,20,38,0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.inner}
      >
        <View style={styles.adTag}>
          <Text style={styles.adTagText}>AD</Text>
        </View>
        <Text style={styles.placeholder} numberOfLines={1}>
          {compact ? 'Advertisement slot — reserved' : 'Ad space'}
        </Text>
        <Pressable
          onPress={() => setDismissed(true)}
          style={styles.closeBtn}
          hitSlop={8}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </LinearGradient>
      {/* hidden id hook for the future ad config */}
      <Text style={styles.hiddenId}>{BANNER_SLOT_ID}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  wrapCompact: {
    paddingHorizontal: 10,
    paddingBottom: 2,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    height: 34,
  },
  adTag: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 8,
  },
  adTagText: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  placeholder: {
    flex: 1,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  closeText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  hiddenId: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
});

export default memo(AdBannerSlot);
