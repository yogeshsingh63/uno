// ============================================================
// CardFace — Dispatcher: renders the correct card face
// ============================================================
import React, { memo } from 'react';
import { CardType as CType, CardColor } from '@uno/shared';
import NumberCard from './NumberCard';
import SkipCard from './SkipCard';
import ReverseCard from './ReverseCard';
import DrawTwoCard from './DrawTwoCard';
import WildCard from './WildCard';
import WildDrawFourCard from './WildDrawFourCard';

interface CardFaceProps {
  type: string;        // CardType enum value
  color: string;       // CardColor enum value
  value?: number;
  width: number;
  height: number;
  borderRadius?: number;
  declaredColor?: string | null;
  challengePending?: boolean;
}

function CardFace({
  type, color, value, width, height, borderRadius = 10,
  declaredColor, challengePending,
}: CardFaceProps) {
  switch (type) {
    case CType.NUMBER:
      return (
        <NumberCard
          color={color}
          value={value ?? 0}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      );

    case CType.SKIP:
      return (
        <SkipCard
          color={color}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      );

    case CType.REVERSE:
      return (
        <ReverseCard
          color={color}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      );

    case CType.DRAW_TWO:
      return (
        <DrawTwoCard
          color={color}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      );

    case CType.WILD:
      return (
        <WildCard
          width={width}
          height={height}
          borderRadius={borderRadius}
          declaredColor={declaredColor}
        />
      );

    case CType.WILD_DRAW_FOUR:
      return (
        <WildDrawFourCard
          width={width}
          height={height}
          borderRadius={borderRadius}
          declaredColor={declaredColor}
          challengePending={challengePending}
        />
      );

    default:
      return (
        <NumberCard
          color={color}
          value={0}
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      );
  }
}

export default memo(CardFace);
