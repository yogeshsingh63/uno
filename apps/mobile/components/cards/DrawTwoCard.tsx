import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface DrawTwoCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function DrawTwoCard({ color, width, height, borderRadius = 10 }: DrawTwoCardProps) {
  return (
    <OfficialUnoCardSvg
      type="DRAW_TWO"
      color={color}
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
}

export default memo(DrawTwoCard);
