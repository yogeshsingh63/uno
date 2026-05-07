import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { AVATAR_OPTIONS } from '../constants/cardData';
import { usePlayerStore } from '../stores/playerStore';
import { useGameSocket } from '../hooks/useGameSocket';

export default function HomeScreen() {
  const { playerName, avatar, setPlayerName, setAvatar } = usePlayerStore();
  const { createRoom, joinRoom } = useGameSocket();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      Alert.alert('Enter Name', 'Please enter your player name');
      return;
    }
    createRoom(playerName.trim(), avatar);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      Alert.alert('Enter Name', 'Please enter your player name');
      return;
    }
    if (roomCodeInput.length !== 6) {
      Alert.alert('Invalid Code', 'Room code must be 6 characters');
      return;
    }
    joinRoom(roomCodeInput.toUpperCase(), playerName.trim(), avatar);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
        <Text style={styles.logo}>UNO</Text>
        <Text style={styles.tagline}>MULTIPLAYER</Text>
      </Animated.View>

      {/* Name Input */}
      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.section}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name..."
          placeholderTextColor={Colors.textMuted}
          value={playerName}
          onChangeText={setPlayerName}
          maxLength={15}
        />
      </Animated.View>

      {/* Avatar Selection */}
      <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.section}>
        <Text style={styles.label}>Choose Avatar</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((a) => (
            <Pressable
              key={a}
              onPress={() => setAvatar(a)}
              style={[styles.avatarOption, avatar === a && styles.avatarSelected]}
            >
              <Text style={styles.avatarEmoji}>{a}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.section}>
        <Pressable onPress={handleCreateRoom}>
          <LinearGradient
            colors={[Colors.red, Colors.redDark]}
            style={styles.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.primaryButtonText}>Create Room</Text>
          </LinearGradient>
        </Pressable>

        {!showJoin ? (
          <Pressable onPress={() => setShowJoin(true)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Join Room</Text>
          </Pressable>
        ) : (
          <View style={styles.joinSection}>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="ROOM CODE"
              placeholderTextColor={Colors.textMuted}
              value={roomCodeInput}
              onChangeText={(t) => setRoomCodeInput(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
            />
            <Pressable onPress={handleJoinRoom} style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: {
    fontSize: 56, fontWeight: '900', color: Colors.red, letterSpacing: 6,
    textShadowColor: Colors.redGlow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
  },
  tagline: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 6, marginTop: 4 },
  section: { marginBottom: 24 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, fontSize: 16,
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOption: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surfaceBorder,
  },
  avatarSelected: { borderColor: Colors.neonPink, backgroundColor: 'rgba(255,45,85,0.15)' },
  avatarEmoji: { fontSize: 24 },
  primaryButton: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  primaryButtonText: { color: Colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  secondaryButton: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12,
    borderWidth: 2, borderColor: Colors.surfaceBorder, backgroundColor: Colors.surface,
  },
  secondaryButtonText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  joinSection: { flexDirection: 'row', gap: 10, marginTop: 12 },
  codeInput: { flex: 1, textAlign: 'center', letterSpacing: 4, fontSize: 18, fontWeight: '800' },
  joinButton: {
    backgroundColor: Colors.blue, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center',
  },
  joinButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
