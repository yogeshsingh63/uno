import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { PlayerGameState } from '@uno/shared';
import AvatarBadge from '../ui/AvatarBadge';

const FONT = 'LuckiestGuy_400Regular';

interface SwapTargetModalProps {
  visible: boolean;
  players: PlayerGameState[];   // candidates (other players)
  onSelect: (targetPlayerId: string) => void;
  onCancel: () => void;
}

export default function SwapTargetModal({ visible, players, onSelect, onCancel }: SwapTargetModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={FadeInUp.delay(80).duration(350)} style={styles.sheet}>
          <View style={styles.swapBadge}>
            <Text style={styles.swapIcon}>⇄</Text>
          </View>
          <Text style={styles.title}>SWAP HANDS</Text>
          <Text style={styles.subtitle}>Pick a player to trade your hand with</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {players.map((p, i) => (
              <Animated.View key={p.id} entering={FadeInUp.delay(120 + i * 80).duration(300)}>
                <Pressable onPress={() => onSelect(p.id)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <AvatarBadge emoji={p.avatar} size={44} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.cardCount}>{p.cardCount} cards</Text>
                  </View>
                  <View style={styles.swapBtn}>
                    <Text style={styles.swapBtnText}>⇄</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
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
  sheet: {
    backgroundColor: '#14142a',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  swapBadge: {
    alignSelf: 'center', width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(100,210,255,0.12)', borderWidth: 1.5, borderColor: Colors.neonCyan,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  swapIcon: { color: Colors.neonCyan, fontSize: 24, fontWeight: '900' },
  title: {
    fontFamily: FONT, color: Colors.white, fontSize: 26, letterSpacing: 1.5,
    textAlign: 'center', textShadowColor: 'rgba(100,210,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 2, marginBottom: 18 },
  list: { maxHeight: 320 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  rowPressed: { backgroundColor: 'rgba(100,210,255,0.1)', borderColor: Colors.neonCyan },
  name: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardCount: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  swapBtn: {
    backgroundColor: Colors.neonCyan, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  swapBtnText: { color: '#06222e', fontSize: 14, fontWeight: '900' },
  cancelButton: {
    marginTop: 10, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
});
