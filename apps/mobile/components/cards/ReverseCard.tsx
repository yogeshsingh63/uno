// ============================================================
// ReverseCard — official UNO reverse design
// ============================================================
import React, { memo } from 'react';
import SymbolCard from './SymbolCard';

interface ReverseCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function ReverseCard({ color, width, height, borderRadius }: ReverseCardProps) {
  return (
    <SymbolCard
      color={color}
      symbol="⇄"
      width={width}
      height={height}
      borderRadius={borderRadius}
      symbolFontScale={0.5}
    />
  );
}

export default memo(ReverseCard);
