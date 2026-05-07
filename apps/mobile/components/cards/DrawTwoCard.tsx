// ============================================================
// DrawTwoCard — Section 8
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getCardColorHex, getCardColorHlHex, COLOR_INITIALS } from '../../constants/cardColors';

interface DrawTwoCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function DrawTwoCard({ color, width, height, borderRadius = 10 }: DrawTwoCardProps) {
  const bg = getCardColorHex(color);
  const hl = getCardColorHlHex(color);
  const miniW = width * 0.34;
  const miniH = miniW * 1.38;
  const miniRadius = Math.max(3, miniW * 0.15);
  const miniFontSize = miniW * 0.42;
  const cornerFontSize = height * 0.14;
  const initialFontSize = height * 0.08;

  return (
    <View style={[styles.card, { width, height, borderRadius, backgroundColor: bg }]}>
      <View style={[styles.radialHighlight, { backgroundColor: hl, opacity: 0.3 }]} />

      {/* White diagonal oval */}
      <View style={[styles.oval, {
        width: width * 1.4, height: height * 0.68,
        borderRadius: (height * 0.68) / 2,
        transform: [{ rotate: '25deg' }],
      }]} />

      {/* Corners */}
      <View style={styles.cornerTL}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>+2</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>+2</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>

      {/* Center — two mini-cards fanned */}
      <View style={styles.fanContainer}>
        {/* Rear card (left-lean) */}
        <View style={[styles.miniCard, {
          width: miniW, height: miniH, borderRadius: miniRadius,
          backgroundColor: bg, borderColor: '#FFFFFF', borderWidth: 1.5,
          transform: [{ rotate: '-12deg' }, { translateX: -miniW * 0.15 }],
          zIndex: 1,
        }]}>
          <Text style={[styles.miniText, { fontSize: miniFontSize }]}>+2</Text>
        </View>

        {/* Front card (right-lean) */}
        <View style={[styles.miniCard, {
          width: miniW, height: miniH, borderRadius: miniRadius,
          backgroundColor: bg, borderColor: '#FFFFFF', borderWidth: 1.5,
          transform: [{ rotate: '12deg' }, { translateX: miniW * 0.15 }],
          zIndex: 2, marginLeft: -miniW * 0.55,
        }]}>
          <Text style={[styles.miniText, { fontSize: miniFontSize }]}>+2</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.45)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 5,
  },
  radialHighlight: {
    position: 'absolute', width: '60%', height: '60%', borderRadius: 100,
  },
  oval: { position: 'absolute', backgroundColor: '#FFFFFF' },
  cornerTL: { position: 'absolute', top: 5, left: 6, alignItems: 'center' },
  cornerBR: {
    position: 'absolute', bottom: 5, right: 6, alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  cornerText: { fontWeight: '900' },
  cornerInitial: { fontWeight: '700', opacity: 0.7, marginTop: -2 },
  fanContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  },
  miniCard: {
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 3,
  },
  miniText: {
    color: '#FFFFFF', fontWeight: '900',
  },
});

export default memo(DrawTwoCard);
