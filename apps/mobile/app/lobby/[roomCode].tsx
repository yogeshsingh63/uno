import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, Share, Switch, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { PlayerInfo, RoomSettings } from '@uno/shared';
import ElementalBackground from '../../components/ui/ElementalBackground';
import AvatarBadge from '../../components/ui/AvatarBadge';

export default function LobbyScreen() {
  const { roomCode } = useLocalSearchParams<{ roomCode: string }>();
  const { roomState, toasts } = useGameStore();
  const { playerId } = usePlayerStore();
  const { toggleReady, startGame, addBot, leaveRoom, updateSettings, reconnectRoom } = useGameSocket();
  const [showSettings, setShowSettings] = useState(false);
  const isHost = roomState?.hostId === playerId;
  const allReady = roomState?.players?.every(p => p.isReady || p.isHost) && (roomState?.players?.length ?? 0) >= 2;

  // Auto-reconnect on web page refresh
  React.useEffect(() => {
    if (!roomState && roomCode && playerId) {
      const timer = setTimeout(() => {
        reconnectRoom(roomCode as string);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [roomState, roomCode, playerId, reconnectRoom]);

  const [copied, setCopied] = useState(false);

  // Copy the room code (clipboard on web, share sheet on native), then
  // morph the tip into a checkmark + toast for tactile confirmation.
  const handleCopyCode = async () => {
    const code = String(roomCode ?? '');
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(code);
      } else {
        await Share.share({ message: `Join my UNO game! Room code: ${code}` });
      }
      setCopied(true);
      useGameStore.getState().addToast({ message: `Room code ${code} copied!`, type: 'success' });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      useGameStore.getState().addToast({ message: `Couldn't copy the code`, type: 'warning' });
    }
  };

  const renderPlayer = ({ item, index }: { item: PlayerInfo; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(350)} style={styles.playerRow}>
      <AvatarBadge emoji={item.avatar} size={38} />
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
      <ElementalBackground variant="cosmic" />

      {/* Toasts (e.g. code copied) */}
      <View style={styles.toastArea} pointerEvents="none">
        {toasts.map((toast) => (
          <View key={toast.id} style={[styles.toast, TOAST_BG[toast.type]]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>

      {/* Room Code */}
      <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.codeCard}>
        <Text style={styles.codeLabel}>ROOM CODE</Text>
        <Pressable onPress={handleCopyCode}>
          <Text style={styles.codeValue}>{roomCode}</Text>
          {copied ? (
            <Animated.Text entering={ZoomIn.duration(180)} style={[styles.shareTip, styles.copiedTip]}>
              ✓ Copied!
            </Animated.Text>
          ) : (
            <Text style={styles.shareTip}>Tap to copy</Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Player List */}
      <Animated.View entering={FadeIn.delay(250).duration(400)} style={styles.playersSection}>
        <Text style={styles.playersLabel}>
          Players ({roomState?.players?.length || 0}/{roomState?.maxPlayers || 10})
        </Text>
        <FlatList
          data={roomState?.players || []}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          style={styles.playerList}
        />
      </Animated.View>

      {/* Settings Panel (host only) */}
      {isHost && (
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.settingsSection}>
          <Pressable onPress={() => setShowSettings(!showSettings)} style={styles.settingsToggle}>
            <Text style={styles.settingsToggleText}>⚙️ House Rules {showSettings ? '▲' : '▼'}</Text>
          </Pressable>
          {showSettings && roomState?.settings && (
            <ScrollView style={styles.settingsPanel} nestedScrollEnabled>
              {[
                { key: 'stacking' as const, label: 'Draw Two Stacking', desc: 'Stack +2 on +2' },
                { key: 'sevenO' as const, label: 'Seven-O', desc: '7=swap hands, 0=rotate' },
                { key: 'jumpIn' as const, label: 'Jump-In', desc: 'Play exact match out of turn' },
                { key: 'forcePlay' as const, label: 'Force Play', desc: 'Must play drawn card if able' },
                { key: 'alternateScoring' as const, label: 'Alternate Scoring', desc: 'Lowest score wins' },
              ].map(({ key, label, desc }) => (
                <View key={key} style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    <Text style={styles.settingDesc}>{desc}</Text>
                  </View>
                  <Switch
                    value={roomState.settings[key] as boolean}
                    onValueChange={(val) => updateSettings({ [key]: val })}
                    trackColor={{ false: Colors.surfaceLight, true: Colors.green }}
                    thumbColor={Colors.white}
                  />
                </View>
              ))}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { flex: 1 }]}>Score Target</Text>
                <View style={styles.scoreTargetRow}>
                  {[200, 300, 500, 999].map(val => (
                    <Pressable
                      key={val}
                      style={[
                        styles.scoreTargetBtn,
                        roomState.settings.scoreTarget === val && styles.scoreTargetActive,
                      ]}
                      onPress={() => updateSettings({ scoreTarget: val })}
                    >
                      <Text style={[
                        styles.scoreTargetText,
                        roomState.settings.scoreTarget === val && styles.scoreTargetTextActive,
                      ]}>
                        {val === 999 ? '∞' : val}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      )}

      {/* Actions */}
      <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.actions}>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 64,
    width: '100%', maxWidth: 500, alignSelf: 'center',
  },
  toastArea: {
    position: 'absolute', top: 38, left: 0, right: 0, alignItems: 'center', zIndex: 100,
  },
  toast: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 4 },
  toastText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  codeCard: {
    alignItems: 'center', marginBottom: 20,
    backgroundColor: 'rgba(28, 22, 30, 0.70)', borderRadius: 20, paddingVertical: 20,
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.10)',
    shadowColor: Colors.metallicGold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
  },
  codeLabel: { color: Colors.metallicGold, fontSize: 11, fontWeight: '700', letterSpacing: 4 },
  codeValue: {
    color: Colors.yellow, fontSize: 42, fontWeight: '900', letterSpacing: 10, marginTop: 4,
    textShadowColor: 'rgba(245,184,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 16,
  },
  shareTip: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 6, fontWeight: '600' },
  copiedTip: { color: Colors.green, fontWeight: '800' },
  playersSection: { flex: 1 },
  playersLabel: { color: Colors.metallicGold, fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 2 },
  playerList: { flex: 1 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(28, 22, 30, 0.60)',
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.08)',
  },
  playerAvatar: { marginRight: 12 },
  playerAvatarWrap: { marginRight: 12 },
  playerName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  readyBadge: { backgroundColor: 'rgba(46,189,94,0.15)', borderWidth: 1, borderColor: Colors.green },
  notReadyBadge: { backgroundColor: 'rgba(120,107,94,0.15)', borderWidth: 1, borderColor: 'rgba(255,220,180,0.10)' },
  statusText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  actions: { gap: 10, paddingBottom: 24 },
  readyButton: {
    backgroundColor: Colors.blue, borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    shadowColor: Colors.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  readyButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  botButton: {
    backgroundColor: 'rgba(28, 22, 30, 0.60)', borderRadius: 14, paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.10)',
  },
  botButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  startButton: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  startButtonText: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  leaveButton: {
    borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(232,54,75,0.25)', backgroundColor: 'rgba(28, 22, 30, 0.45)',
  },
  leaveButtonText: { color: Colors.error, fontSize: 14, fontWeight: '700' },
  settingsSection: { marginBottom: 10 },
  settingsToggle: {
    backgroundColor: 'rgba(28, 22, 30, 0.60)', borderRadius: 14, padding: 13, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.10)',
  },
  settingsToggleText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  settingsPanel: {
    backgroundColor: 'rgba(20, 14, 22, 0.90)', borderRadius: 14, padding: 12, marginTop: 6,
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.08)', maxHeight: 260,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,220,180,0.05)',
  },
  settingLabel: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  settingDesc: { color: Colors.textMuted, fontSize: 10, marginTop: 1 },
  scoreTargetRow: { flexDirection: 'row', gap: 6 },
  scoreTargetBtn: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  scoreTargetActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  scoreTargetText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  scoreTargetTextActive: { color: Colors.white },
});

const TOAST_BG: Record<string, any> = {
  info: { backgroundColor: 'rgba(28,22,30,0.92)' },
  success: { backgroundColor: 'rgba(46,189,94,0.92)' },
  warning: { backgroundColor: 'rgba(245,184,0,0.92)' },
  error: { backgroundColor: 'rgba(232,54,75,0.92)' },
  uno: { backgroundColor: 'rgba(245,184,0,0.95)' },
};

