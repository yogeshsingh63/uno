// ============================================================
// CardBack — Face-down card design (Section 3)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CARD_BACK_BG, CARD_COLORS } from '../../constants/cardColors';

interface CardBackProps {
  width: number;
  height: number;
  borderRadius?: number;
}

function CardBack({ width, height, borderRadius = 10 }: CardBackProps) {
  const rectW = width * 0.58;
  const rectH = height * 0.68;
  const fontSize = height * 0.26;
  const dotSize = Math.max(3, width * 0.04);
  const dotInset = Math.max(5, width * 0.1);

  return (
    <View style={[styles.card, { width, height, borderRadius, backgroundColor: CARD_BACK_BG }]}>
      {/* Outer red border */}
      <View style={[styles.outerBorder, {
        width: width - 4, height: height - 4,
        borderRadius: borderRadius - 1,
        borderColor: CARD_COLORS.RED,
      }]}>
        {/* Inner faded red border */}
        <View style={[styles.innerBorder, {
          width: width - 12, height: height - 12,
          borderRadius: borderRadius - 3,
        }]} />
      </View>

      {/* Center tilted rectangle */}
      <View style={[styles.centerRect, {
        width: rectW, height: rectH,
        borderRadius: 6,
        transform: [{ rotate: '-20deg' }],
      }]}>
        <Text style={[styles.unoText, { fontSize }]}>
          UNO
        </Text>
      </View>

      {/* Four corner dots */}
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, top: dotInset, left: dotInset }]} />
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, top: dotInset, right: dotInset }]} />
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, bottom: dotInset, left: dotInset }]} />
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2, bottom: dotInset, right: dotInset }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  outerBorder: {
    position: 'absolute',
    borderWidth: 2,
  },
  innerBorder: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.4)',
  },
  centerRect: {
    backgroundColor: CARD_COLORS.RED,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unoText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFD600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    transform: [{ rotate: '0deg' }],
  },
  dot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});

export default memo(CardBack);
