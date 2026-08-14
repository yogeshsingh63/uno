// ============================================================
// ColorPie — the four-color circle on wild cards
// ============================================================
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CARD_COLORS } from '../../constants/cardColors';

function ColorPie({ size, opacity = 1 }: { size: number; opacity?: number }) {
  const half = size / 2;
  return (
    <View style={[styles.pie, { width: size, height: size, borderRadius: half, opacity }]}>
      <View style={[styles.q, { width: half, height: half, backgroundColor: CARD_COLORS.RED, top: 0, left: 0, borderTopLeftRadius: half }]} />
      <View style={[styles.q, { width: half, height: half, backgroundColor: CARD_COLORS.BLUE, top: 0, right: 0, borderTopRightRadius: half }]} />
      <View style={[styles.q, { width: half, height: half, backgroundColor: CARD_COLORS.YELLOW, bottom: 0, left: 0, borderBottomLeftRadius: half }]} />
      <View style={[styles.q, { width: half, height: half, backgroundColor: CARD_COLORS.GREEN, bottom: 0, right: 0, borderBottomRightRadius: half }]} />
      {/* White outline */}
      <View style={[styles.outline, { width: size, height: size, borderRadius: half }]} />
      {/* Black cross dividers */}
      <View style={[styles.dividerH, { width: size, height: 1.5, top: half - 0.75 }]} />
      <View style={[styles.dividerV, { height: size, width: 1.5, left: half - 0.75 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pie: {
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  q: { position: 'absolute' },
  outline: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  dividerH: { position: 'absolute', backgroundColor: '#1C1C1E' },
  dividerV: { position: 'absolute', backgroundColor: '#1C1C1E' },
});

export default memo(ColorPie);
