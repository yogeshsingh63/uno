// ============================================================
// WildCard — Official Authentic UNO Wild Card
// Matte black face with diagonal white oval ring, giant 4-color
// oval in the center, and mini 4-color ovals in the corners.
// Exactly matches the official Mattel UNO Wild card design.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import CardShell from './CardShell';
import { CARD_COLORS } from '../../constants/cardColors';

interface WildCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

/** 4-Color Oval Ellipse with Red, Blue, Yellow, Green Quadrants */
export function FourColorOval({ width, height, borderWidth = 2 }: { width: number; height: number; borderWidth?: number }) {
  const ovalRadius = height / 2;

  return (
    <View
      style={[styles.fourColorOval, {
        width,
        height,
        borderRadius: ovalRadius,
        borderWidth,
      }]}
    >
      {/* Top Row: Red (Left) | Blue (Right) */}
      <View style={styles.quadRow}>
        <View style={[styles.quad, { backgroundColor: CARD_COLORS.RED }]} />
        <View style={[styles.quad, { backgroundColor: CARD_COLORS.BLUE }]} />
      </View>

      {/* Bottom Row: Yellow (Left) | Green (Right) */}
      <View style={styles.quadRow}>
        <View style={[styles.quad, { backgroundColor: CARD_COLORS.YELLOW }]} />
        <View style={[styles.quad, { backgroundColor: CARD_COLORS.GREEN }]} />
      </View>
    </View>
  );
}

function WildCard({ width, height, borderRadius = 10, declaredColor }: WildCardProps) {
  const centerW = width * 0.72;
  const centerH = height * 0.52;
  const cornerW = width * 0.22;
  const cornerH = height * 0.16;

  return (
    <CardShell
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor="#111116"
      gradient={['#1F1F26', '#111116', '#09090D']}
      declaredColor={declaredColor}
    >
      {/* Center Giant 4-Color Oval (Tilted -28deg) */}
      <View style={styles.centerContainer} pointerEvents="none">
        <FourColorOval width={centerW} height={centerH} borderWidth={Math.max(2, width * 0.035)} />
      </View>

      {/* Top-Left Corner Mini 4-Color Oval */}
      <View style={[styles.cornerTL, { top: Math.max(4, height * 0.035), left: Math.max(5, width * 0.06) }]} pointerEvents="none">
        <FourColorOval width={cornerW} height={cornerH} borderWidth={1.5} />
      </View>

      {/* Bottom-Right Corner Mini 4-Color Oval (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(4, height * 0.035), right: Math.max(5, width * 0.06) }]} pointerEvents="none">
        <FourColorOval width={cornerW} height={cornerH} borderWidth={1.5} />
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
  fourColorOval: {
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    transform: [{ rotate: '-28deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  quadRow: {
    flex: 1,
    flexDirection: 'row',
  },
  quad: {
    flex: 1,
  },
  cornerTL: {
    position: 'absolute',
  },
  cornerBR: {
    position: 'absolute',
    transform: [{ rotate: '180deg' }],
  },
});

export default memo(WildCard);
