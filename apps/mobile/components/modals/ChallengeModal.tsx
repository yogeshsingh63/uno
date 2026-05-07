import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface ChallengeModalProps {
  visible: boolean;
  onAccept: () => void;
  onChallenge: () => void;
}

export default function ChallengeModal({ visible, onAccept, onChallenge }: ChallengeModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.sheet}>
          <Text style={styles.title}>Wild Draw Four!</Text>
          <Text style={styles.subtitle}>
            You think they're bluffing? Challenge them!
          </Text>
          <Text style={styles.info}>
            🎯 Challenge wins → They draw 4{'\n'}
            ❌ Challenge fails → You draw 6
          </Text>

          <View style={styles.buttonsRow}>
            <Pressable onPress={onAccept} style={[styles.button, styles.acceptButton]}>
              <Text style={styles.buttonText}>Accept (+4)</Text>
            </Pressable>
            <Pressable onPress={onChallenge} style={[styles.button, styles.challengeButton]}>
              <Text style={styles.buttonText}>Challenge!</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: Colors.red,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  info: {
    color: Colors.textPrimary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  challengeButton: {
    backgroundColor: Colors.red,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
