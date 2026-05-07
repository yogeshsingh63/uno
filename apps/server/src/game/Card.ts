// ============================================================
// Card — Card factory and deck builder (Section 1)
// ============================================================

import { Card, CardColor, CardType, getCardPointValue } from '@uno/shared';
import * as crypto from 'crypto';

let cardCounter = 0;

/** Generate a unique card ID using crypto */
function generateCardId(): string {
  return `card-${Date.now().toString(36)}-${(cardCounter++).toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
}

/** Create a single card instance with pointValue */
export function createCard(color: CardColor, type: CardType, value?: number): Card {
  return {
    id: generateCardId(),
    color,
    type,
    value,
    pointValue: getCardPointValue(type, value),
  };
}

/**
 * Generate a full 108-card UNO deck per official rules (Section 1):
 * NUMBER (76): 4 colors × (1 zero + 2 each 1–9) = 76
 * ACTION (24): 4 colors × (2 Skip + 2 Reverse + 2 Draw Two) = 24
 * WILD (8):   4× Wild + 4× Wild Draw Four = 8
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

    // Two of each action card per color
    deck.push(createCard(color, CardType.SKIP));
    deck.push(createCard(color, CardType.SKIP));
    deck.push(createCard(color, CardType.REVERSE));
    deck.push(createCard(color, CardType.REVERSE));
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

/** Get the point value of a card for scoring */
export function getCardPoints(card: Card): number {
  return card.pointValue;
}
