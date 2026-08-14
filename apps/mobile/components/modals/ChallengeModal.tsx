import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay,
  FadeIn, FadeInUp, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import WildDrawFourCard from '../cards/WildDrawFourCard';

const FONT = 'LuckiestGuy_400Regular';

interface ChallengeModalProps {
  visible: boolean;
  onAccept: () => void;
  onChallenge: () => void;
}

function DuelButton({
  delay, label, sub, colors, onPress, tint,
}: {
  delay: number; label: string; sub: string; colors: [string, string]; onPress: () => void; tint: string;
}) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 160 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value === 0 ? 0 : 1,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 70 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    setTimeout(onPress, 90);
  };

  return (
    <Animated.View style={[styles.duelBtnWrap, style]}>
      <Pressable onPress={handlePress} style={{ borderRadius: 18 }}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.duelBtn, { shadowColor: tint }]}
        >
          <Text style={styles.duelLabel}>{label}</Text>
          <Text style={styles.duelSub}>{sub}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function ChallengeModal({ visible, onAccept, onChallenge }: ChallengeModalProps) {
  const shake = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      shake.value = withDelay(250, withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      ));
    }
  }, [visible]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${shake.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={FadeInUp.delay(60).duration(350)} style={styles.content}>
          {/* WD4 card with a shake */}
          <Animated.View style={[styles.cardWrap, shakeStyle]}>
            <WildDrawFourCard width={96} height={138} borderRadius={14} />
          </Animated.View>

          <Text style={styles.title}>WILD DRAW FOUR!</Text>
          <Text style={styles.subtitle}>They played a +4. Do you trust them?</Text>

          <View style={styles.buttonsRow}>
            <View style={{ flex: 1 }}>
              <DuelButton
                delay={220}
                label="ACCEPT"
                sub="Draw 4 cards"
                colors={['#43a047', '#1b5e20']}
                tint={Colors.green}
                onPress={onAccept}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DuelButton
                delay={320}
                label="CHALLENGE!"
                sub="Bluff or draw 6"
                colors={['#e53935', '#b71c1c']}
                tint={Colors.red}
                onPress={onChallenge}
              />
            </View>
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
  cardWrap: {
    marginBottom: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6, shadowRadius: 18, elevation: 14,
  },
  title: {
    fontFamily: FONT, color: '#ff5252', fontSize: 30, letterSpacing: 2,
    textShadowColor: 'rgba(255,45,85,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 26 },
  buttonsRow: { flexDirection: 'row', gap: 14, width: '100%' },
  duelBtnWrap: { width: '100%' },
  duelBtn: {
    borderRadius: 18, paddingVertical: 18, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 8,
  },
  duelLabel: { color: Colors.white, fontFamily: FONT, fontSize: 19, letterSpacing: 1.5 },
  duelSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', marginTop: 3 },
});
