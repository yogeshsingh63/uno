import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface ReverseCardProps {
  color: string;
  width: number;
  height: number;
  borderRadius?: number;
}

function ReverseCard({ color, width, height, borderRadius = 10 }: ReverseCardProps) {
  return (
    <OfficialUnoCardSvg
      type="REVERSE"
      color={color}
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
}

export default memo(ReverseCard);
