import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface ShuffleHandsCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function ShuffleHandsCard({ width, height, borderRadius = 10, declaredColor }: ShuffleHandsCardProps) {
  return (
    <OfficialUnoCardSvg
      type="SHUFFLE_HANDS"
      color="WILD"
      width={width}
      height={height}
      borderRadius={borderRadius}
      declaredColor={declaredColor}
    />
  );
}

export default memo(ShuffleHandsCard);
