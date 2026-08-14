import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface WildCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function WildCard({ width, height, borderRadius = 10, declaredColor }: WildCardProps) {
  return (
    <OfficialUnoCardSvg
      type="WILD"
      color="WILD"
      width={width}
      height={height}
      borderRadius={borderRadius}
      declaredColor={declaredColor}
    />
  );
}

export default memo(WildCard);
