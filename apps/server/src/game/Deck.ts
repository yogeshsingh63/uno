// ============================================================
// Deck — Deck management: shuffle, deal, reshuffle
// ============================================================

import { Card, CardType } from '../../packages/shared/src/types';
import { createFullDeck } from './Card';

/**
 * Fisher-Yates shuffle algorithm — truly random, in-place
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create and shuffle a new deck
 */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createFullDeck());
}

/**
 * Deal cards to players
 * @returns { hands: Map of playerId → cards[], remaining draw pile }
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

  // Deal one card at a time to each player, round-robin style
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
 * Find the first valid starting card from the draw pile.
 * The starting card must be a number card (not action/wild).
 * If a Wild Draw Four is drawn, reshuffle and try again.
 */
export function drawStartingCard(drawPile: Card[]): { startCard: Card; drawPile: Card[] } {
  const pile = [...drawPile];

  while (pile.length > 0) {
    const card = pile.pop()!;

    // Only number cards are valid starting cards
    if (card.type === CardType.NUMBER) {
      return { startCard: card, drawPile: pile };
    }

    // If we drew a Wild Draw Four, put it back and reshuffle
    if (card.type === CardType.WILD_DRAW_FOUR) {
      pile.unshift(card); // put back in pile
      const reshuffled = shuffleDeck(pile);
      return drawStartingCard(reshuffled);
    }

    // Action cards (Skip, Reverse, Draw Two, Wild) — use their effects
    // For simplicity in starting, we accept any non-WD4 card
    return { startCard: card, drawPile: pile };
  }

  // Should never happen with a full deck
  throw new Error('No valid starting card found');
}

/**
 * Reshuffle the discard pile into the draw pile when draw pile is empty.
 * Keeps the top card of the discard pile.
 */
export function reshuffleDiscardIntoDraw(
  discardPile: Card[],
  drawPile: Card[]
): { drawPile: Card[]; discardPile: Card[] } {
  if (discardPile.length <= 1) {
    return { drawPile, discardPile };
  }

  // Keep the top card of discard
  const topCard = discardPile[discardPile.length - 1];
  const cardsToReshuffle = discardPile.slice(0, -1);

  // Shuffle those cards into a new draw pile
  const newDrawPile = [...drawPile, ...shuffleDeck(cardsToReshuffle)];

  return {
    drawPile: newDrawPile,
    discardPile: [topCard],
  };
}
