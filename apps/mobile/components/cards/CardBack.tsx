// ============================================================
// CardBack — Official Authentic UNO Card Back
// Classic black background with white outer frame, giant tilted
// oval with the official bold italic "UNO" wordmark.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardBackProps {
  width: number;
  height: number;
  borderRadius?: number;
}

function CardBack({ width, height, borderRadius = 10 }: CardBackProps) {
  const ovalW = width * 0.74;
  const ovalH = height * 0.48;
  const ovalRadius = ovalH / 2;
  const fontSize = Math.round(ovalH * 0.50);
  const actualBorderWidth = Math.max(2.5, width * 0.045);

  return (
    <View
      style={[styles.card, {
        width,
        height,
        borderRadius,
        borderWidth: actualBorderWidth,
      }]}
    >
      <LinearGradient
        colors={['#1F1F26', '#111116', '#09090D']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Red Center Oval Ring */}
      <View
        style={[styles.redOval, {
          width: ovalW * 1.05,
          height: ovalH * 1.05,
          borderRadius: (ovalH * 1.05) / 2,
        }]}
      />

      {/* White Tilted Center Oval with UNO Mark */}
      <View style={[styles.oval, { width: ovalW, height: ovalH, borderRadius: ovalRadius }]}>
        <Text style={[styles.unoText, { fontSize }]}>UNO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderColor: '#FFFFFF',
    backgroundColor: '#111116',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  redOval: {
    position: 'absolute',
    backgroundColor: '#D71921',
    transform: [{ rotate: '-28deg' }],
  },
  oval: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-28deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  unoText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#D71921',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 1,
    includeFontPadding: false,
  },
});

export default memo(CardBack);
