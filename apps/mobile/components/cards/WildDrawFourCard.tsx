// ============================================================
// WildDrawFourCard — Official Authentic UNO Wild Draw Four (+4) Card
// Matte black face with diagonal white oval ring, 4 overlapping
// colored cards (Green, Blue, Red, Yellow) in center with black
// drop shadows, and "+4" corner indices. Matches official UNO.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CardShell from './CardShell';
import { CARD_COLORS } from '../../constants/cardColors';

interface WildDrawFourCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

function WildDrawFourCard({
  width, height, borderRadius = 10, declaredColor, challengePending,
}: WildDrawFourCardProps) {
  const miniW = width * 0.23;
  const miniH = miniW * 1.44;
  const miniRadius = Math.max(2, miniW * 0.16);
  const cornerFontSize = Math.round(height * 0.16);
  const cornerShadow = Math.max(1, Math.round(width * 0.025));
  const cardShadow = Math.max(2, Math.round(width * 0.038));

  // 4 Cards staggered cascade: Green (bottom-left) -> Blue -> Red -> Yellow (top-right)
  const cards = [
    { color: CARD_COLORS.GREEN,  top: miniH * 0.22,  left: -miniW * 0.65, z: 1 },
    { color: CARD_COLORS.BLUE,   top: -miniH * 0.18, left: -miniW * 0.24, z: 2 },
    { color: CARD_COLORS.YELLOW, top: -miniH * 0.38, left: miniW * 0.46,  z: 3 },
    { color: CARD_COLORS.RED,    top: 0,             left: miniW * 0.10,  z: 4 },
  ];

  return (
    <CardShell
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="#111116"
      gradient={['#1F1F26', '#111116', '#09090D']}
      declaredColor={declaredColor}
    >
      {/* Challenge pending red glow ring */}
      {challengePending && (
        <View style={[styles.challengeGlow, {
          width: width + 8, height: height + 8,
          borderRadius: borderRadius + 4,
        }]} />
      )}

      {/* Center 4 Overlapping Colored Cards with Solid Black Drop Shadows */}
      <View style={styles.centerContainer} pointerEvents="none">
        {cards.map((c, i) => (
          <React.Fragment key={i}>
            {/* Shadow under each mini card */}
            <View
              style={[styles.miniCardShadow, {
                width: miniW,
                height: miniH,
                borderRadius: miniRadius,
                top: c.top + cardShadow,
                left: c.left + cardShadow,
                zIndex: c.z,
              }]}
            />
            {/* Colored mini card */}
            <View
              style={[styles.miniCard, {
                width: miniW,
                height: miniH,
                borderRadius: miniRadius,
                backgroundColor: c.color,
                top: c.top,
                left: c.left,
                zIndex: c.z + 1,
              }]}
            />
          </React.Fragment>
        ))}
      </View>

      {/* Top-Left Corner "+4" */}
      <View style={[styles.cornerTL, { top: Math.max(3, height * 0.035), left: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          +4
        </Text>
      </View>

      {/* Bottom-Right Corner "+4" (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(3, height * 0.035), right: Math.max(4, width * 0.06) }]} pointerEvents="none">
        <Text
          style={[styles.cornerText, {
            fontSize: cornerFontSize,
            textShadowColor: '#000000',
            textShadowOffset: { width: cornerShadow, height: cornerShadow },
            textShadowRadius: 0,
          }]}
        >
          +4
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
  miniCard: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  miniCardShadow: {
    position: 'absolute',
    backgroundColor: '#000000',
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
  challengeGlow: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#E53935',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    elevation: 14,
  },
});

export default memo(WildDrawFourCard);
