import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, ZoomIn, BounceIn } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { PlayerGameState } from '../../../../packages/shared/src/types';

interface FinalWinnerModalProps {
  visible: boolean;
  winnerName: string | null;
  players: PlayerGameState[];
  scores: Record<string, number>;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export default function FinalWinnerModal({
  visible, winnerName, players, scores, onPlayAgain, onLeave,
}: FinalWinnerModalProps) {
  if (!visible) return null;

  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
        <Animated.View entering={ZoomIn.duration(500)} style={styles.modal}>
          {/* Trophy */}
          <Animated.Text entering={BounceIn.delay(300)} style={styles.trophy}>🏆</Animated.Text>
          <Text style={styles.title}>Game Over!</Text>
          <Text style={styles.winner}>{winnerName} wins!</Text>
          <Text style={styles.subtitle}>Reached 500 points!</Text>

          <ScrollView style={styles.scoreTable}>
            {sorted.map((p, i) => (
              <View key={p.id} style={[styles.row, i === 0 && styles.winnerRow]}>
                <Text style={styles.medal}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </Text>
                <Text style={styles.avatar}>{p.avatar}</Text>
                <Text style={[styles.name, { flex: 1 }]}>{p.name}</Text>
                <Text style={[styles.score, i === 0 && styles.winnerScore]}>
                  {scores[p.id] || 0}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttons}>
            <Pressable onPress={onLeave} style={[styles.btn, styles.leaveBtn]}>
              <Text style={styles.btnText}>Leave</Text>
            </Pressable>
            <Pressable onPress={onPlayAgain} style={[styles.btn, styles.playBtn]}>
              <Text style={styles.btnText}>Play Again</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: Colors.surface, borderRadius: 24, padding: 24, alignItems: 'center' },
  trophy: { fontSize: 60, marginBottom: 8 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900' },
  winner: { color: Colors.yellow, fontSize: 20, fontWeight: '800', marginTop: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  scoreTable: { width: '100%', maxHeight: 240, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  winnerRow: { backgroundColor: 'rgba(255,214,10,0.1)', borderRadius: 8, paddingHorizontal: 8 },
  medal: { fontSize: 16, width: 30, textAlign: 'center' },
  avatar: { fontSize: 20, marginRight: 8 },
  name: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  score: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  winnerScore: { color: Colors.yellow },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  leaveBtn: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder },
  playBtn: { backgroundColor: Colors.neonPink },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
