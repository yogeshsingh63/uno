// ============================================================
// Deck — Shuffle, deal, first-card rules (Section 1–2)
// ============================================================

import { Card, CardType, CardColor } from '@uno/shared';
import { createFullDeck } from './Card';
import * as crypto from 'crypto';

/**
 * Fisher-Yates shuffle with crypto.randomBytes() seed (Section 1)
 * Never uses Math.random()
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate a cryptographically secure random index
    const randomBytes = crypto.randomBytes(4);
    const j = randomBytes.readUInt32BE(0) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Create and shuffle a new 108-card deck */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createFullDeck());
}

/**
 * Deal cards one at a time, clockwise (Section 2)
 */
export function dealCards(
  deck: Card[],
  playerIds: string[],
  cardsPerPlayer: number = 7
): { hands: Map<string, Card[]>; drawPile: Card[] } {
  const drawPile = [...deck];
  const hands = new Map<string, Card[]>();

  for (const playerId of playerIds) {
    hands.set(playerId, []);
  }

  // Deal one card at a time to each player, round-robin
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const playerId of playerIds) {
      const card = drawPile.pop();
      if (card) {
        hands.get(playerId)!.push(card);
      }
    }
  }

  return { hands, drawPile };
}

/**
 * Flip the first card for the discard pile (Section 2 — First Card Rules)
 * 
 * Returns the starting card and any effects that must be applied:
 * 1. Wild Draw Four → return to deck, reshuffle, flip again (loop)
 * 2. Wild → valid, first player chooses color
 * 3. Draw Two → first player draws 2 AND loses turn
 * 4. Skip → first player's turn is skipped
 * 5. Reverse → direction flips; in 2-player, dealer goes first
 * 6. Number → normal play
 */
export interface FirstCardResult {
  startCard: Card;
  drawPile: Card[];
  effect: 'none' | 'wild_choose_color' | 'draw_two' | 'skip' | 'reverse';
}

export function drawStartingCard(drawPile: Card[]): FirstCardResult {
  let pile = [...drawPile];

  while (pile.length > 0) {
    const card = pile.pop()!;

    switch (card.type) {
      case CardType.WILD_DRAW_FOUR:
        // Rule 1: Return to deck, reshuffle, try again
        pile.unshift(card);
        pile = shuffleDeck(pile);
        continue;

      case CardType.WILD:
        // Rule 2: Valid — first player must choose color
        return { startCard: card, drawPile: pile, effect: 'wild_choose_color' };

      case CardType.DRAW_TWO:
        // Rule 3: First player draws 2 and loses turn
        return { startCard: card, drawPile: pile, effect: 'draw_two' };

      case CardType.SKIP:
        // Rule 4: First player's turn is skipped
        return { startCard: card, drawPile: pile, effect: 'skip' };

      case CardType.REVERSE:
        // Rule 5: Direction becomes CCW
        return { startCard: card, drawPile: pile, effect: 'reverse' };

      case CardType.NUMBER:
        // Rule 6: Normal play
        return { startCard: card, drawPile: pile, effect: 'none' };

      default:
        return { startCard: card, drawPile: pile, effect: 'none' };
    }
  }

  throw new Error('No valid starting card found — deck is empty');
}

/**
 * Reshuffle discard pile into draw pile when draw pile is empty (Section 5)
 * Keeps the top card of discard pile.
 */
export function reshuffleDiscardIntoDraw(
  discardPile: Card[],
  drawPile: Card[]
): { drawPile: Card[]; discardPile: Card[]; reshuffled: boolean } {
  if (discardPile.length <= 1) {
    // Only the top card exists — cannot reshuffle
    return { drawPile, discardPile, reshuffled: false };
  }

  const topCard = discardPile[discardPile.length - 1];
  const cardsToReshuffle = discardPile.slice(0, -1);
  const newDrawPile = [...drawPile, ...shuffleDeck(cardsToReshuffle)];

  return {
    drawPile: newDrawPile,
    discardPile: [topCard],
    reshuffled: true,
  };
}
