// ============================================================
// CardBack — Premium UNO card back
// Deep crimson-to-black face, cream border, tilted oval
// with bold UNO wordmark, and warm corner accents.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardBackProps {
  width: number;
  height: number;
  borderRadius?: number;
}

function CardBack({ width, height, borderRadius = 12 }: CardBackProps) {
  const ovalW = width * 0.70;
  const ovalH = height * 0.46;
  const ovalRadius = ovalH / 2;
  const fontSize = ovalH * 0.46;
  const dotSize = Math.max(3, width * 0.045);
  const dotInset = Math.max(7, width * 0.12);

  return (
    <View style={[styles.card, { width, height, borderRadius }]}>
      <LinearGradient
        colors={['#C41230', '#8B0D20', '#3A0610']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm gloss sweep */}
      <LinearGradient
        colors={['rgba(255,240,220,0.30)', 'rgba(255,240,220,0.06)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Bottom depth */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Cream tilted oval with UNO mark */}
      <View style={[styles.oval, { width: ovalW, height: ovalH, borderRadius: ovalRadius }]}>
        <Text style={[styles.unoText, { fontSize }]}>UNO</Text>
      </View>

      {/* Corner dots */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <View
          key={pos}
          style={[styles.dot, {
            width: dotSize, height: dotSize, borderRadius: dotSize / 2,
            ...(pos === 'tl' ? { top: dotInset, left: dotInset }
              : pos === 'tr' ? { top: dotInset, right: dotInset }
              : pos === 'bl' ? { bottom: dotInset, left: dotInset }
              : { bottom: dotInset, right: dotInset }),
          }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFF5E6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  oval: {
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }],
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  unoText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#8B0D20',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(255,245,230,0.7)',
  },
});

export default memo(CardBack);
