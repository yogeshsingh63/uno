import React from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { PlayerInfo } from '../../../../packages/shared/src/types';

export default function LobbyScreen() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const { roomState } = useGameStore();
  const { playerId } = usePlayerStore();
  const { toggleReady, startGame, addBot, leaveRoom } = useGameSocket();

  const isHost = roomState?.hostId === playerId;
  const allReady = roomState?.players?.every(p => p.isReady || p.isHost) && (roomState?.players?.length ?? 0) >= 2;

  const handleShare = async () => {
    await Share.share({ message: `Join my UNO game! Room code: ${roomCode}` });
  };

  const renderPlayer = ({ item, index }: { item: PlayerInfo; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.playerRow}>
      <Text style={styles.playerAvatar}>{item.avatar}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.playerName}>
          {item.name} {item.isHost ? '👑' : ''} {!item.isConnected ? '⚡' : ''}
        </Text>
      </View>
      <View style={[styles.statusBadge, item.isReady || item.isHost ? styles.readyBadge : styles.notReadyBadge]}>
        <Text style={styles.statusText}>{item.isHost ? 'Host' : item.isReady ? 'Ready' : 'Waiting'}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Room Code */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.codeSection}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <Pressable onPress={handleShare}>
          <Text style={styles.codeValue}>{roomCode}</Text>
          <Text style={styles.shareTip}>Tap to share</Text>
        </Pressable>
      </Animated.View>

      {/* Player List */}
      <Text style={styles.playersLabel}>
        Players ({roomState?.players?.length || 0}/{roomState?.maxPlayers || 10})
      </Text>
      <FlatList
        data={roomState?.players || []}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        style={styles.playerList}
      />

      {/* Actions */}
      <View style={styles.actions}>
        {!isHost && (
          <Pressable onPress={toggleReady} style={styles.readyButton}>
            <Text style={styles.readyButtonText}>
              {roomState?.players?.find(p => p.id === playerId)?.isReady ? '✓ Ready' : 'Ready Up'}
            </Text>
          </Pressable>
        )}

        {isHost && (
          <>
            <Pressable onPress={addBot} style={styles.botButton}>
              <Text style={styles.botButtonText}>+ Add Bot</Text>
            </Pressable>
            <Pressable onPress={startGame} disabled={!allReady}>
              <LinearGradient
                colors={allReady ? [Colors.green, Colors.greenDark] : [Colors.surfaceLight, Colors.surface]}
                style={styles.startButton}
              >
                <Text style={[styles.startButtonText, !allReady && { color: Colors.textMuted }]}>
                  Start Game
                </Text>
              </LinearGradient>
            </Pressable>
          </>
        )}

        <Pressable onPress={leaveRoom} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 60 },
  codeSection: { alignItems: 'center', marginBottom: 30 },
  codeLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  codeValue: {
    color: Colors.yellow, fontSize: 40, fontWeight: '900', letterSpacing: 8, marginTop: 4,
    textShadowColor: Colors.yellowGlow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15,
  },
  shareTip: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  playersLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, letterSpacing: 1 },
  playerList: { flex: 1 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  playerAvatar: { fontSize: 28, marginRight: 12 },
  playerName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  readyBadge: { backgroundColor: 'rgba(48,209,88,0.2)' },
  notReadyBadge: { backgroundColor: 'rgba(142,142,160,0.2)' },
  statusText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  actions: { gap: 10, paddingBottom: 20 },
  readyButton: {
    backgroundColor: Colors.blue, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  readyButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  botButton: {
    backgroundColor: Colors.surfaceLight, borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  botButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  startButton: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  startButtonText: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  leaveButton: {
    borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  leaveButtonText: { color: Colors.error, fontSize: 14, fontWeight: '700' },
});
