import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Switch, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { PlayerGameState, RoomSettings } from '@uno/shared';
import { Colors } from '../../constants/colors';
import AvatarBadge from '../ui/AvatarBadge';
import { claimRewardedPerk } from '../ads/adHooks';
import { useGameStore } from '../../stores/gameStore';
import { soundService } from '../../services/soundService';

interface GameMenuModalProps {
  visible: boolean;
  onClose: () => void;
  roomCode: string;
  roundNumber: number;
  players: PlayerGameState[];
  scores: Record<string, number>;
  settings: RoomSettings | null;
  myPlayerId: string | null;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  onToggleHaptics: () => void;
  onToggleSound: () => void;
  onLeave: () => void;
}

const RULE_LABELS: { key: keyof RoomSettings; label: string }[] = [
  { key: 'stacking', label: 'Draw Two Stacking' },
  { key: 'sevenO', label: '7-0 Rule' },
  { key: 'jumpIn', label: 'Jump-In' },
  { key: 'forcePlay', label: 'Force Play' },
  { key: 'alternateScoring', label: 'Alternate Scoring' },
];

export default function GameMenuModal({
  visible, onClose, roomCode, roundNumber, players, scores,
  settings, myPlayerId, hapticsEnabled, soundEnabled, onToggleHaptics, onToggleSound, onLeave,
}: GameMenuModalProps) {
  const [showRules, setShowRules] = useState(false);

  if (!visible) return null;

  const sorted = [...players].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={SlideInDown.springify().damping(18)} style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Game Menu</Text>
              <Text style={styles.subtitle}>
                Room <Text style={styles.code}>{roomCode}</Text> · Round {roundNumber}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Scores */}
            <Text style={styles.sectionLabel}>SCORES</Text>
            {sorted.map((p) => (
              <View key={p.id} style={styles.playerRow}>
                <AvatarBadge emoji={p.avatar} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {p.name}
                    {p.id === myPlayerId ? ' (You)' : ''}
                    {p.isBot ? ' 🤖' : ''}
                  </Text>
                  <Text style={styles.playerMeta}>
                    {p.cardCount} card{p.cardCount === 1 ? '' : 's'}{p.hasCalledUno && p.cardCount === 1 ? ' · UNO!' : ''}
                  </Text>
                </View>
                <Text style={styles.playerScore}>{scores[p.id] || 0}</Text>
              </View>
            ))}

            {/* House rules */}
            <Text style={styles.sectionLabel}>HOUSE RULES</Text>
            {settings ? (
              <View style={styles.rulesWrap}>
                {RULE_LABELS.map(({ key, label }) => (
                  <View key={key} style={styles.ruleChip}>
                    <Text style={[styles.ruleDot, { backgroundColor: settings[key] ? Colors.green : Colors.surfaceBorder }]} />
                    <Text style={[styles.ruleText, !settings[key] && styles.ruleOff]}>{label}</Text>
                  </View>
                ))}
                <View style={styles.ruleChip}>
                  <Text style={[styles.ruleDot, { backgroundColor: Colors.blue }]} />
                  <Text style={styles.ruleText}>Target: {settings.scoreTarget === 999 ? '∞' : settings.scoreTarget}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.ruleOff}>—</Text>
            )}

            {/* Settings */}
            <Text style={styles.sectionLabel}>SETTINGS</Text>
            <View style={[styles.settingRow, { marginBottom: 8 }]}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Switch
                value={soundEnabled}
                onValueChange={onToggleSound}
                trackColor={{ false: Colors.surfaceLight, true: Colors.green }}
                thumbColor={Colors.white}
              />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration / Haptics</Text>
              <Switch
                value={hapticsEnabled}
                onValueChange={onToggleHaptics}
                trackColor={{ false: Colors.surfaceLight, true: Colors.green }}
                thumbColor={Colors.white}
              />
            </View>

            {/* Rewarded perk (stub — watch-a-card-back-skin) */}
            <Text style={styles.sectionLabel}>PERKS</Text>
            <Pressable
              onPress={() => {
                soundService.play('pick');
                const result = claimRewardedPerk('card-back');
                useGameStore.getState().addToast({
                  message: result === 'granted'
                    ? 'Card back unlocked! 🎨'
                    : 'Rewarded ads are coming soon — stay tuned!',
                  type: 'info',
                });
              }}
              style={styles.perkBtn}
            >
              <Text style={styles.perkEmoji}>🎨</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkTitle}>Unlock a Card Back</Text>
                <Text style={styles.perkDesc}>Watch a short ad to claim a cosmetic skin</Text>
              </View>
              <View style={styles.perkAdTag}>
                <Text style={styles.perkAdTagText}>AD</Text>
              </View>
            </Pressable>

            <Pressable onPress={() => setShowRules(!showRules)} style={styles.rulesToggle}>
              <Text style={styles.rulesToggleText}>📖 How to Play {showRules ? '▲' : '▼'}</Text>
            </Pressable>
            {showRules && (
              <Text style={styles.rulesBody}>
                • Match the top card's color, number or symbol.{'\n'}
                • Action cards: Skip, Reverse, Draw Two.{'\n'}
                • Wild cards change the color; Wild Draw Four lets opponents challenge.{'\n'}
                • Call UNO when you drop to 1 card — get caught and draw 2.{'\n'}
                • First to the score target wins the game.
              </Text>
            )}
          </ScrollView>

          {/* Leave */}
          <Pressable onPress={onLeave} style={styles.leaveBtn}>
            <Text style={styles.leaveText}>Leave Game</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: '#14142a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: Colors.white, fontSize: 20, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  code: { color: Colors.yellow, fontWeight: '800', letterSpacing: 1 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  scroll: { flexGrow: 0 },
  sectionLabel: {
    color: Colors.textMuted, fontSize: 10, fontWeight: '800',
    letterSpacing: 2, marginTop: 14, marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    padding: 10, marginBottom: 6,
  },
  playerAvatar: { marginRight: 10 },
  playerName: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  playerMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 1 },
  playerScore: {
    color: Colors.yellow, fontSize: 18, fontWeight: '900',
    backgroundColor: 'rgba(255,214,0,0.1)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4, overflow: 'hidden',
  },
  rulesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ruleChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  ruleDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  ruleText: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
  ruleOff: { color: Colors.textMuted },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12,
  },
  settingLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  perkBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,193,7,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,193,7,0.35)',
    padding: 12, marginBottom: 12,
  },
  perkEmoji: { fontSize: 22, marginRight: 10 },
  perkTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  perkDesc: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  perkAdTag: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2, marginLeft: 8,
  },
  perkAdTagText: { color: Colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  rulesToggle: {
    marginTop: 12, paddingVertical: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
  },
  rulesToggleText: { color: Colors.neonCyan, fontSize: 13, fontWeight: '800' },
  rulesBody: {
    color: Colors.textSecondary, fontSize: 12, lineHeight: 20,
    marginTop: 10, paddingHorizontal: 4,
  },
  leaveBtn: {
    marginTop: 14, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    backgroundColor: 'rgba(229,57,53,0.15)', borderWidth: 1.5, borderColor: 'rgba(229,57,53,0.6)',
  },
  leaveText: { color: Colors.error, fontSize: 15, fontWeight: '800' },
});
