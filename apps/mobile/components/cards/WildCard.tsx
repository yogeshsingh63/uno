// ============================================================
// WildCard — 4-color pie on matte black (Section 9)
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WILD_BG, CARD_COLORS } from '../../constants/cardColors';

interface WildCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null; // After played: RED/YELLOW/GREEN/BLUE
}

function WildCard({ width, height, borderRadius = 10, declaredColor }: WildCardProps) {
  const pieSize = width * 0.7;
  const pieRadius = pieSize / 2;
  const labelFontSize = height * 0.1;
  const miniPieSize = width * 0.22;

  const borderCol = declaredColor
    ? (CARD_COLORS as any)[declaredColor] || '#FFFFFF'
    : '#FFFFFF';

  return (
    <View style={[styles.card, {
      width, height, borderRadius,
      backgroundColor: WILD_BG,
      borderColor: borderCol,
      borderWidth: declaredColor ? 3 : 2,
    }]}>
      {/* Declared color glow ring */}
      {declaredColor && (
        <View style={[styles.glowRing, {
          width: width + 6, height: height + 6,
          borderRadius: borderRadius + 3,
          borderColor: (CARD_COLORS as any)[declaredColor] || '#FFF',
          shadowColor: (CARD_COLORS as any)[declaredColor] || '#FFF',
        }]} />
      )}

      {/* Corner mini-pies */}
      <View style={[styles.cornerTL]}>
        <ColorPie size={miniPieSize} />
      </View>
      <View style={[styles.cornerBR]}>
        <ColorPie size={miniPieSize} />
      </View>

      {/* Center 4-color pie */}
      <ColorPie size={pieSize} />

      {/* WILD label */}
      <Text style={[styles.wildLabel, { fontSize: labelFontSize }]}>WILD</Text>
    </View>
  );
}

/** 4-color pie using 4 quadrant views */
function ColorPie({ size }: { size: number }) {
  const half = size / 2;
  return (
    <View style={[styles.pieContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Top-left: Red */}
      <View style={[styles.quadrant, {
        width: half, height: half, backgroundColor: CARD_COLORS.RED,
        top: 0, left: 0, borderTopLeftRadius: half,
      }]} />
      {/* Top-right: Blue */}
      <View style={[styles.quadrant, {
        width: half, height: half, backgroundColor: CARD_COLORS.BLUE,
        top: 0, right: 0, borderTopRightRadius: half,
      }]} />
      {/* Bottom-left: Yellow */}
      <View style={[styles.quadrant, {
        width: half, height: half, backgroundColor: CARD_COLORS.YELLOW,
        bottom: 0, left: 0, borderBottomLeftRadius: half,
      }]} />
      {/* Bottom-right: Green */}
      <View style={[styles.quadrant, {
        width: half, height: half, backgroundColor: CARD_COLORS.GREEN,
        bottom: 0, right: 0, borderBottomRightRadius: half,
      }]} />
      {/* White outline */}
      <View style={[styles.pieOutline, {
        width: size, height: size, borderRadius: size / 2,
      }]} />
      {/* Black cross dividers */}
      <View style={[styles.dividerH, { width: size, height: 1, top: half - 0.5 }]} />
      <View style={[styles.dividerV, { height: size, width: 1, left: half - 0.5 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.45)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  glowRing: {
    position: 'absolute', borderWidth: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 22,
    elevation: 12,
  },
  cornerTL: { position: 'absolute', top: 5, left: 5 },
  cornerBR: {
    position: 'absolute', bottom: 5, right: 5,
    transform: [{ rotate: '180deg' }],
  },
  wildLabel: {
    color: '#FFFFFF', fontWeight: '900', letterSpacing: 2,
    marginTop: 4, zIndex: 2,
  },
  pieContainer: {
    overflow: 'hidden', position: 'relative', zIndex: 2,
  },
  quadrant: { position: 'absolute' },
  pieOutline: {
    position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF',
  },
  dividerH: { position: 'absolute', backgroundColor: '#000000' },
  dividerV: { position: 'absolute', backgroundColor: '#000000' },
});

export default memo(WildCard);
