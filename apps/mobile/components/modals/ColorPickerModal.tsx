import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
  FadeIn, FadeInUp, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { CardColor } from '@uno/shared';
import { Colors } from '../../constants/colors';
import ColorPie from '../cards/ColorPie';

const FONT = 'LuckiestGuy_400Regular';

interface ColorPickerModalProps {
  visible: boolean;
  onSelectColor: (color: CardColor) => void;
}

const COLORS_DATA: { color: CardColor; bg: string; dark: string; label: string }[] = [
  { color: CardColor.RED, bg: '#e53935', dark: '#b71c1c', label: 'RED' },
  { color: CardColor.YELLOW, bg: '#ffd600', dark: '#f9a825', label: 'YELLOW' },
  { color: CardColor.GREEN, bg: '#43a047', dark: '#1b5e20', label: 'GREEN' },
  { color: CardColor.BLUE, bg: '#1e88e5', dark: '#0d47a1', label: 'BLUE' },
];

function ColorTile({ item, index, onSelect }: { item: typeof COLORS_DATA[number]; index: number; onSelect: () => void }) {
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(180 + index * 90, withSpring(1, { damping: 11, stiffness: 170 }));
    glow.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1100 }),
        withTiming(0.25, { duration: 1100 }),
      ), -1, true
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${(index - 1.5) * 5}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
    setTimeout(() => onSelect(), 60);
  };

  return (
    <Animated.View style={[styles.tileWrap, cardStyle]}>
      <Animated.View style={[{ shadowColor: item.bg, shadowOffset: { width: 0, height: 0 }, shadowRadius: 18, elevation: 8 }, glowStyle]}>
        <Pressable onPress={handlePress} style={{ borderRadius: 14 }}>
          <LinearGradient
            colors={[item.bg, item.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.tile}
          >
            {/* Gloss */}
            <LinearGradient
              colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.8 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            {/* Tilted capsule with the label */}
            <View style={styles.tileCapsule}>
              <Text style={[styles.tileLabel, { color: item.color === CardColor.YELLOW ? '#7a6000' : item.bg }]}>
                {item.label}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function ColorPickerModal({ visible, onSelectColor }: ColorPickerModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={FadeInUp.delay(80).duration(350)} style={styles.content}>
          {/* Wild card visual */}
          <View style={styles.wildWrap}>
            <ColorPie size={64} />
          </View>

          <Text style={styles.title}>PICK A COLOR</Text>
          <Text style={styles.subtitle}>Choose wisely…</Text>

          <View style={styles.grid}>
            {COLORS_DATA.map((item, idx) => (
              <ColorTile key={item.color} item={item} index={idx} onSelect={() => onSelectColor(item.color)} />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,5,15,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: { alignItems: 'center', maxWidth: 420, width: '100%' },
  wildWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 18,
  },
  title: {
    fontFamily: FONT, color: Colors.white, fontSize: 30, letterSpacing: 2,
    textShadowColor: 'rgba(191,90,242,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 2, marginBottom: 26 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 14, maxWidth: 340,
  },
  tileWrap: { marginHorizontal: 2 },
  tile: {
    width: 104, height: 148, borderRadius: 14,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  tileCapsule: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 6,
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 3, elevation: 3,
  },
  tileLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
});
