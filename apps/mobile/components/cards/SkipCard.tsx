// ============================================================
// SkipCard — Official Authentic UNO Skip Card
// Bold white circle with diagonal slash in center and corners
// with crisp black 3D drop shadow. Matches official UNO design.
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import CardShell from './CardShell';
import { COLOR_GRADIENTS } from '../../constants/cardColors';

interface SkipCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

/** Vector-accurate bold UNO Skip symbol with black 3D shadow */
export function SkipIcon({ size, shadowOffset = 2 }: { size: number; shadowOffset?: number }) {
  const borderWidth = Math.max(2, Math.round(size * 0.17));
  const barHeight = borderWidth;

  return (
    <View style={[styles.iconWrap, { width: size, height: size }]}>
      {/* Black 3D Drop Shadow */}
      <View
        style={[styles.ring, {
          top: shadowOffset,
          left: shadowOffset,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: '#000000',
        }]}
      >
        <View
          style={[styles.bar, {
            width: size * 0.90,
            height: barHeight,
            backgroundColor: '#000000',
          }]}
        />
      </View>

      {/* White Front Icon */}
      <View
        style={[styles.ring, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: '#FFFFFF',
        }]}
      >
        <View
          style={[styles.bar, {
            width: size * 0.90,
            height: barHeight,
            backgroundColor: '#FFFFFF',
          }]}
        />
      </View>
    </View>
  );
}

function SkipCard({ color, width, height, borderRadius = 10 }: SkipCardProps) {
  const gradient = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.RED;

  const centerSize = Math.round(width * 0.52);
  const cornerSize = Math.round(width * 0.22);
  const centerShadow = Math.max(2, Math.round(width * 0.038));
  const cornerShadow = Math.max(1, Math.round(width * 0.022));

  return (
    <CardShell width={width} height={height} borderRadius={borderRadius} gradient={gradient}>
      {/* Center Skip Symbol with 3D Black Drop Shadow */}
      <View style={styles.centerContainer} pointerEvents="none">
        <SkipIcon size={centerSize} shadowOffset={centerShadow} />
      </View>

      {/* Top-Left Corner */}
      <View style={[styles.cornerTL, { top: Math.max(4, height * 0.035), left: Math.max(5, width * 0.06) }]} pointerEvents="none">
        <SkipIcon size={cornerSize} shadowOffset={cornerShadow} />
      </View>

      {/* Bottom-Right Corner (Inverted 180°) */}
      <View style={[styles.cornerBR, { bottom: Math.max(4, height * 0.035), right: Math.max(5, width * 0.06) }]} pointerEvents="none">
        <SkipIcon size={cornerSize} shadowOffset={cornerShadow} />
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
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bar: {
    position: 'absolute',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  cornerTL: {
    position: 'absolute',
  },
  cornerBR: {
    position: 'absolute',
    transform: [{ rotate: '180deg' }],
  },
});

export default memo(SkipCard);
