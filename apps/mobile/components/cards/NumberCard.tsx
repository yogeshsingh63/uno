// ============================================================
// NumberCard — Official Authentic UNO Number Card
// Giant white digit in the center with solid black 3D drop shadow,
// white corner indices (rotated at bottom-right), and 6/9 underline.
// Exactly matches the official Mattel UNO card design.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS } from '../../constants/cardColors';

interface NumberCardProps {
  color: string;   // RED, YELLOW, GREEN, BLUE
  value: number;   // 0–9
  width: number;
  height: number;
  borderRadius?: number;
}

function NumberCard({ color, value, width, height, borderRadius = 10 }: NumberCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;
  const digit = String(value);

  const centerFontSize = Math.round(height * 0.58);
  const cornerFontSize = Math.round(height * 0.17);
  const needsUnderline = value === 6 || value === 9;
  const shadowOffset = Math.max(2, Math.round(width * 0.045));
  const cornerShadow = Math.max(1, Math.round(width * 0.025));

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      {/* Center Giant White Digit with solid Black 3D Shadow */}
      <View style={styles.centerContainer} pointerEvents="none">
        <Text
          style={[styles.centerDigit, {
            fontSize: centerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: shadowOffset, height: shadowOffset },
            textShadowRadius: 0,
          }]}
        >
          {digit}
        </Text>

        {needsUnderline && (
          <View style={[styles.underlineWrap, { bottom: height * 0.18 }]}>
            <View style={[styles.underlineShadow, { width: width * 0.32, height: Math.max(3, height * 0.035), top: shadowOffset, left: shadowOffset }]} />
            <View style={[styles.underline, { width: width * 0.32, height: Math.max(3, height * 0.035) }]} />
          </View>
        )}
      </View>

      {/* Top-Left Corner Index */}
      <View style={[styles.cornerTL, { top: Math.max(3, height * 0.035), left: Math.max(4, width * 0.07) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          {digit}
        </Text>
      </View>

      {/* Bottom-Right Corner Index (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(3, height * 0.035), right: Math.max(4, width * 0.07) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          {digit}
        </Text>
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDigit: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
  underlineWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  underline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  underlineShadow: {
    position: 'absolute',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  cornerTL: {
    position: 'absolute',
  },
  cornerBR: {
    position: 'absolute',
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
});

export default memo(NumberCard);
