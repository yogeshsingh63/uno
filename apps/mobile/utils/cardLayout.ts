// ============================================================
// Card Layout Utilities — Arc rotation, fan positions (Section 16)
// ============================================================

/**
 * Calculate arc formation transforms for a hand of N cards.
 * Card at index i gets rotation and vertical offset to form a natural fan.
 */
export function getArcTransform(index: number, total: number) {
  const mid = (total - 1) / 2;
  const rotation = (index - mid) * 2.8; // degrees
  const yOffset = Math.abs(index - mid) * 3.5; // px — cards at edges rise
  return { rotation, yOffset };
}

/**
 * Calculate fan positions for opponent mini-cards.
 * Returns offset and alternating rotation for each visible card.
 */
export function getMiniCardFan(
  index: number,
  total: number,
  maxVisible: number = 12,
  offset: number = 12,
) {
  const visible = Math.min(total, maxVisible);
  const rotation = index % 2 === 0 ? 3 : -3; // alternating tilt
  const x = index * offset;
  const overflow = total > maxVisible ? total - maxVisible + 1 : 0;
  const isLast = index === visible - 1;

  return { x, rotation, isLast, overflow, visible };
}

/**
 * Calculate fan transform for Draw Two / Wild Draw Four card fans.
 * Returns rotation and translation for each mini-card in the fan.
 */
export function getFanCardTransform(
  index: number,
  total: number,
  cardWidth: number,
) {
  // For 2 cards (Draw Two)
  if (total === 2) {
    const rotations = [-12, 12];
    const offsets = [-cardWidth * 0.15, cardWidth * 0.15];
    return {
      rotation: rotations[index],
      translateX: offsets[index],
      translateY: 0,
    };
  }

  // For 4 cards (Wild Draw Four)
  const rotations = [-20, -7, 7, 20];
  const xOffsets = [-cardWidth * 0.65, -cardWidth * 0.2, cardWidth * 0.2, cardWidth * 0.65];
  const yOffsets = [3, 0, 0, 3];

  return {
    rotation: rotations[index] || 0,
    translateX: xOffsets[index] || 0,
    translateY: yOffsets[index] || 0,
  };
}

/**
 * Calculate the deal position for a card during dealing animation.
 * Cards deal one-by-one, clockwise.
 */
export function getDealDelay(
  playerIndex: number,
  cardIndex: number,
  totalPlayers: number,
  cardsPerPlayer: number = 7,
  staggerMs: number = 55,
) {
  const dealIndex = cardIndex * totalPlayers + playerIndex;
  return dealIndex * staggerMs;
}
