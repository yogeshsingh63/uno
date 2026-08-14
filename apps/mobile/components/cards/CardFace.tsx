// ============================================================
// CardFace — Dispatcher: renders the pixel-perfect vector UNO card
// ============================================================
import React, { memo } from 'react';
import { CardType as CType } from '@uno/shared';
import OfficialUnoCardSvg, { UnoCardType } from './OfficialUnoCardSvg';

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

function getUnoType(type: string, value?: number): UnoCardType {
  if (type === CType.NUMBER) {
    return String(value ?? 0) as UnoCardType;
  }
  return type as UnoCardType;
}

function CardFace({
  type, color, value, width, height, borderRadius = 10,
  declaredColor, challengePending,
}: CardFaceProps) {
  const unoType = getUnoType(type, value);

  return (
    <OfficialUnoCardSvg
      type={unoType}
      color={color}
      width={width}
      height={height}
      borderRadius={borderRadius}
      declaredColor={declaredColor}
      challengePending={challengePending}
    />
  );
}

export default memo(CardFace);
