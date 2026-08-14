import React, { memo } from 'react';
import OfficialUnoCardSvg, { UnoCardType } from './OfficialUnoCardSvg';

interface NumberCardProps {
  color: string;
  value: number;
  width: number;
  height: number;
  borderRadius?: number;
}

function NumberCard({ color, value, width, height, borderRadius = 10 }: NumberCardProps) {
  return (
    <OfficialUnoCardSvg
      type={String(value) as UnoCardType}
      color={color}
      width={width}
      height={height}
      borderRadius={borderRadius}
    />
  );
}

export default memo(NumberCard);
