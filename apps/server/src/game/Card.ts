// ============================================================
// Card — Card interfaces and deck factory
// ============================================================

import { Card, CardColor, CardType } from '../../packages/shared/src/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a single card instance
 */
export function createCard(color: CardColor, type: CardType, value?: number): Card {
  return {
    id: uuidv4(),
    color,
    type,
    value,
  };
}

/**
 * Generate a full 108-card UNO deck per official rules:
 * - 19 cards per color (one 0, two 1–9) = 76 number cards
 * - 2 Skip per color = 8
 * - 2 Reverse per color = 8
 * - 2 Draw Two per color = 8
 * - 4 Wild cards
 * - 4 Wild Draw Four cards
 * Total = 108
 */
export function createFullDeck(): Card[] {
  const deck: Card[] = [];
  const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];

  for (const color of colors) {
    // One 0 card per color
    deck.push(createCard(color, CardType.NUMBER, 0));

    // Two of each 1–9 per color
    for (let num = 1; num <= 9; num++) {
      deck.push(createCard(color, CardType.NUMBER, num));
      deck.push(createCard(color, CardType.NUMBER, num));
    }

    // Two Skip per color
    deck.push(createCard(color, CardType.SKIP));
    deck.push(createCard(color, CardType.SKIP));

    // Two Reverse per color
    deck.push(createCard(color, CardType.REVERSE));
    deck.push(createCard(color, CardType.REVERSE));

    // Two Draw Two per color
    deck.push(createCard(color, CardType.DRAW_TWO));
    deck.push(createCard(color, CardType.DRAW_TWO));
  }

  // 4 Wild cards
  for (let i = 0; i < 4; i++) {
    deck.push(createCard(CardColor.WILD, CardType.WILD));
  }

  // 4 Wild Draw Four cards
  for (let i = 0; i < 4; i++) {
    deck.push(createCard(CardColor.WILD, CardType.WILD_DRAW_FOUR));
  }

  return deck;
}

/**
 * Get the point value of a card for scoring
 */
export function getCardPoints(card: Card): number {
  switch (card.type) {
    case CardType.NUMBER:
      return card.value ?? 0;
    case CardType.SKIP:
    case CardType.REVERSE:
    case CardType.DRAW_TWO:
      return 20;
    case CardType.WILD:
    case CardType.WILD_DRAW_FOUR:
      return 50;
    default:
      return 0;
  }
}

/**
 * Get a display-friendly label for a card
 */
export function getCardLabel(card: Card): string {
  switch (card.type) {
    case CardType.NUMBER:
      return `${card.color} ${card.value}`;
    case CardType.SKIP:
      return `${card.color} SKIP`;
    case CardType.REVERSE:
      return `${card.color} REVERSE`;
    case CardType.DRAW_TWO:
      return `${card.color} +2`;
    case CardType.WILD:
      return 'WILD';
    case CardType.WILD_DRAW_FOUR:
      return 'WILD +4';
    default:
      return 'UNKNOWN';
  }
}
