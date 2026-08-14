// ============================================================
// DrawTwoCard — official UNO draw-two design
// ============================================================
import React, { memo } from 'react';
import SymbolCard from './SymbolCard';

interface DrawTwoCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function DrawTwoCard({ color, width, height, borderRadius }: DrawTwoCardProps) {
  return (
    <SymbolCard
      color={color}
      symbol="+2"
      width={width}
      height={height}
      borderRadius={borderRadius}
      symbolFontScale={0.4}
    />
  );
}

export default memo(DrawTwoCard);
