import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Head from 'expo-router/head';
import { Colors } from '../constants/colors';
import { AVATARS } from '../constants/avatars';
import { usePlayerStore } from '../stores/playerStore';
import { useGameSocket } from '../hooks/useGameSocket';
import AvatarBadge from '../components/ui/AvatarBadge';

const FONT = 'LuckiestGuy_400Regular';

const SITE_DESCRIPTION =
  'Play UNO online for free! Real-time multiplayer rooms for up to 10 players, official 112-card deck, Wild Draw 4 challenges, 7-0 swaps, and custom house rules.';

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
    <View style={styles.container}>
      <Head>
        <title>Join a Room — UNO Online</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="robots" content="index, follow" />
      </Head>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>UNO</Text>
          <Text style={styles.tagline}>REAL-TIME MULTIPLAYER</Text>
        </View>

        {/* Name Input */}
        <View style={styles.card}>
          <Text style={styles.label}>YOUR NAME</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name..."
              placeholderTextColor={Colors.textMuted}
              value={playerName}
              onChangeText={setPlayerName}
              maxLength={15}
            />
          </View>
        </View>

        {/* Avatar Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>CHOOSE AVATAR</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => {
              const selected = avatar === a.emoji;
              return (
                <Pressable key={a.emoji} onPress={() => setAvatar(a.emoji)} style={styles.avatarOption}>
                  <View style={[styles.avatarBadgeWrap, selected && styles.avatarSelected]}>
                    <AvatarBadge emoji={a.emoji} size={42} />
                  </View>
                  <Text style={[styles.avatarName, selected && styles.avatarNameActive]} numberOfLines={1}>
                    {a.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable onPress={handleCreateRoom} style={({ pressed }) => pressed && styles.pressed}>
            <LinearGradient
              colors={['#E8364B', '#A0182A']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>CREATE ROOM</Text>
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    padding: 24, paddingTop: 76, paddingBottom: 50,
    width: '100%', maxWidth: 480, alignSelf: 'center',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    fontFamily: FONT, fontSize: 76, lineHeight: 80, color: Colors.red, letterSpacing: 3,
    textShadowColor: 'rgba(232,54,75,0.35)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 22,
  },
  tagline: {
    fontSize: 11, fontWeight: '700', color: Colors.metallicGold, letterSpacing: 5,
    marginTop: 6, textTransform: 'uppercase',
  },

  card: {
    backgroundColor: 'rgba(28, 22, 30, 0.70)', borderRadius: 20,
    padding: 20, marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.08)',
  },
  label: { color: Colors.metallicGold, fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(12, 8, 14, 0.5)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.08)',
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.7 },
  input: {
    flex: 1, paddingVertical: 13, fontSize: 15, fontWeight: '600',
    color: Colors.textPrimary, backgroundColor: 'transparent',
  },

  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  avatarOption: { alignItems: 'center', width: '16.5%' },
  avatarBadgeWrap: {
    borderRadius: 999, padding: 3,
    borderWidth: 2, borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: Colors.metallicGold,
    shadowColor: Colors.metallicGold, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 6,
  },
  avatarName: { color: Colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 4, maxWidth: 54, textAlign: 'center' },
  avatarNameActive: { color: Colors.metallicGold },

  actions: { marginTop: 8, gap: 12 },
  pressed: { transform: [{ scale: 0.97 }] },
  primaryButton: {
    borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  primaryButtonText: { color: Colors.white, fontFamily: FONT, fontSize: 20, letterSpacing: 1.5 },
  secondaryButton: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255, 220, 180, 0.12)', backgroundColor: 'rgba(28, 22, 30, 0.55)',
  },
  secondaryButtonText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  joinSection: { flexDirection: 'row', gap: 10, marginTop: 4 },
  codeInput: {
    flex: 1, textAlign: 'center', letterSpacing: 5, fontSize: 18, fontWeight: '800',
    backgroundColor: 'rgba(12, 8, 14, 0.5)', borderRadius: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: 'rgba(255, 220, 180, 0.10)',
  },
  joinButton: {
    backgroundColor: Colors.blue, borderRadius: 14, paddingHorizontal: 24, justifyContent: 'center',
    shadowColor: Colors.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  joinButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
