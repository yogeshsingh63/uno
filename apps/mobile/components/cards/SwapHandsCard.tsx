import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface SwapHandsCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
}

function SwapHandsCard({ width, height, borderRadius = 10, declaredColor }: SwapHandsCardProps) {
  return (
    <OfficialUnoCardSvg
      type="SWAP_HANDS"
      color="WILD"
      width={width}
      height={height}
      borderRadius={borderRadius}
      declaredColor={declaredColor}
    />
  );
}

export default memo(SwapHandsCard);
