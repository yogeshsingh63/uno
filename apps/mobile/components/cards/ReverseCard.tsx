// ============================================================
// ReverseCard — Section 7
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getCardColorHex, getCardColorHlHex, COLOR_INITIALS } from '../../constants/cardColors';

interface ReverseCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function ReverseCard({ color, width, height, borderRadius = 10 }: ReverseCardProps) {
  const bg = getCardColorHex(color);
  const hl = getCardColorHlHex(color);
  const arrowSize = Math.min(width * 0.32, height * 0.2);
  const arrowThick = arrowSize * 0.28;
  const cornerFontSize = height * 0.13;
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
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>⇄</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>
      <View style={styles.cornerBR}>
        <Text style={[styles.cornerText, { fontSize: cornerFontSize, color: bg }]}>⇄</Text>
        <Text style={[styles.cornerInitial, { fontSize: initialFontSize, color: bg }]}>
          {COLOR_INITIALS[color]}
        </Text>
      </View>

      {/* Center reverse arrows — two curved arrows mirrored */}
      <View style={styles.reverseContainer}>
        {/* Top arrow (→ curving up) */}
        <View style={[styles.arrowRow]}>
          <View style={[styles.arrowBody, {
            width: arrowSize, height: arrowThick, backgroundColor: bg,
            borderRadius: arrowThick / 2,
          }]} />
          <View style={[styles.arrowHead, {
            borderLeftWidth: arrowSize * 0.35,
            borderTopWidth: arrowSize * 0.25,
            borderBottomWidth: arrowSize * 0.25,
            borderLeftColor: bg,
          }]} />
        </View>

        {/* Spacer */}
        <View style={{ height: arrowSize * 0.2 }} />

        {/* Bottom arrow (← curving down) */}
        <View style={[styles.arrowRow, { transform: [{ rotate: '180deg' }] }]}>
          <View style={[styles.arrowBody, {
            width: arrowSize, height: arrowThick, backgroundColor: bg,
            borderRadius: arrowThick / 2,
          }]} />
          <View style={[styles.arrowHead, {
            borderLeftWidth: arrowSize * 0.35,
            borderTopWidth: arrowSize * 0.25,
            borderBottomWidth: arrowSize * 0.25,
            borderLeftColor: bg,
          }]} />
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
  reverseContainer: {
    zIndex: 2, alignItems: 'center', justifyContent: 'center',
  },
  arrowRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  arrowBody: {},
  arrowHead: {
    width: 0, height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});

export default memo(ReverseCard);
