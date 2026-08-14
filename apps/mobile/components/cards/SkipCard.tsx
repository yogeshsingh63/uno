// ============================================================
// SkipCard — official UNO skip design
// ============================================================
import React, { memo } from 'react';
import SymbolCard from './SymbolCard';

interface SkipCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function SkipCard({ color, width, height, borderRadius }: SkipCardProps) {
  return (
    <SymbolCard
      color={color}
      symbol="⊘"
      width={width}
      height={height}
      borderRadius={borderRadius}
      symbolFontScale={0.5}
    />
  );
}

export default memo(SkipCard);
