import React, { memo } from 'react';
import OfficialUnoCardSvg from './OfficialUnoCardSvg';

interface WildDrawFourCardProps {
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

function WildDrawFourCard({
  width,
  height,
  borderRadius = 10,
  declaredColor,
  challengePending,
}: WildDrawFourCardProps) {
  return (
    <OfficialUnoCardSvg
      type="WILD_DRAW_FOUR"
      color="WILD"
      width={width}
      height={height}
      borderRadius={borderRadius}
      declaredColor={declaredColor}
      challengePending={challengePending}
    />
  );
}

export default memo(WildDrawFourCard);
