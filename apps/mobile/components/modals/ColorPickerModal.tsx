import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, FadeIn, SlideInDown } from 'react-native-reanimated';
import { CardColor } from '@uno/shared';
import { Colors } from '../../constants/colors';
import { SPRING_MODAL } from '../../constants/animations';

interface ColorPickerModalProps {
  visible: boolean;
  onSelectColor: (color: CardColor) => void;
}

const COLORS_DATA = [
  { color: CardColor.RED, bg: Colors.red, label: 'Red' },
  { color: CardColor.YELLOW, bg: Colors.yellow, label: 'Yellow' },
  { color: CardColor.GREEN, bg: Colors.green, label: 'Green' },
  { color: CardColor.BLUE, bg: Colors.blue, label: 'Blue' },
];

export default function ColorPickerModal({ visible, onSelectColor }: ColorPickerModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.sheet}>
          <Text style={styles.title}>Choose a Color</Text>
          <View style={styles.colorsRow}>
            {COLORS_DATA.map((item, idx) => (
              <Pressable
                key={item.color}
                onPress={() => onSelectColor(item.color)}
                style={[styles.colorButton, { backgroundColor: item.bg }]}
              >
                <Text style={styles.colorLabel}>{item.label}</Text>
              </Pressable>
            ))}
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  colorButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  colorLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
