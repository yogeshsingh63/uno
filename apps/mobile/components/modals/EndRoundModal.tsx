import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { PlayerGameState } from '@uno/shared';

interface EndRoundModalProps {
  visible: boolean;
  winnerName: string | null;
  players: PlayerGameState[];
  scores: Record<string, number>;
  isHost: boolean;
  onNextRound: () => void;
  onLeave: () => void;
}

export default function EndRoundModal({
  visible, winnerName, players, scores, isHost, onNextRound, onLeave,
}: EndRoundModalProps) {
  if (!visible) return null;

  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
        <Animated.View entering={ZoomIn.duration(400)} style={styles.modal}>
          <Text style={styles.title}>🎉 Round Over!</Text>
          <Text style={styles.winner}>{winnerName} wins the round!</Text>

          <ScrollView style={styles.scoreTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 1 }]}>Player</Text>
              <Text style={styles.headerText}>Score</Text>
            </View>
            {sorted.map((p, i) => (
              <View key={p.id} style={[styles.tableRow, i === 0 && styles.firstRow]}>
                <Text style={styles.rank}>{i + 1}.</Text>
                <Text style={styles.playerAvatar}>{p.avatar}</Text>
                <Text style={[styles.playerName, { flex: 1 }]}>{p.name}</Text>
                <Text style={styles.scoreText}>{scores[p.id] || 0}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <Pressable onPress={onLeave} style={[styles.button, styles.leaveButton]}>
              <Text style={styles.buttonText}>Leave</Text>
            </Pressable>
            {isHost && (
              <Pressable onPress={onNextRound} style={[styles.button, styles.nextButton]}>
                <Text style={styles.buttonText}>Next Round</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24 },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  winner: { color: Colors.yellow, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  scoreTable: { maxHeight: 250, marginBottom: 16 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  headerText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  firstRow: { backgroundColor: 'rgba(255,214,10,0.1)' },
  rank: { color: Colors.textSecondary, fontSize: 12, width: 24, fontWeight: '700' },
  playerAvatar: { fontSize: 18, marginRight: 8 },
  playerName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  scoreText: { color: Colors.yellow, fontSize: 16, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  leaveButton: { backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder },
  nextButton: { backgroundColor: Colors.green },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
