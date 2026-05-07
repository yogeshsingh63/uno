// ============================================================
// Player — Server-side player state management
// ============================================================

import { Card, CardColor, CardType, isCardPlayable } from '@uno/shared';

export class Player {
  public id: string;
  public name: string;
  public avatar: string;
  public hand: Card[];
  public score: number;
  public isConnected: boolean;
  public isReady: boolean;
  public isHost: boolean;
  public hasCalledUno: boolean;
  public isBot: boolean;
  public disconnectTimer: NodeJS.Timeout | null;

  constructor(
    id: string,
    name: string,
    avatar: string,
    isHost: boolean = false,
    isBot: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.hand = [];
    this.score = 0;
    this.isConnected = true;
    this.isReady = false;
    this.isHost = isHost;
    this.hasCalledUno = false;
    this.isBot = isBot;
    this.disconnectTimer = null;
  }

  /**
   * Add cards to the player's hand
   */
  addCards(cards: Card[]): void {
    this.hand.push(...cards);
    // If player now has more than 1 card, reset UNO call
    if (this.hand.length > 1) {
      this.hasCalledUno = false;
    }
  }

  /**
   * Remove a card from the player's hand by ID
   */
  removeCard(cardId: string): Card | null {
    const index = this.hand.findIndex(c => c.id === cardId);
    if (index === -1) return null;
    return this.hand.splice(index, 1)[0];
  }

  /**
   * Check if the player has a card by ID
   */
  hasCard(cardId: string): boolean {
    return this.hand.some(c => c.id === cardId);
  }

  /**
   * Get all playable cards given the top discard and current color
   */
  getPlayableCards(topCard: Card, currentColor: CardColor): Card[] {
    return this.hand.filter(card => isCardPlayable(card, topCard, currentColor));
  }

  /**
   * Check if the player has any playable cards
   */
  hasPlayableCard(topCard: Card, currentColor: CardColor): boolean {
    return this.hand.some(card => isCardPlayable(card, topCard, currentColor));
  }

  /**
   * Check if the player has any cards matching the current color
   * (used for Wild Draw Four legality check)
   */
  hasColorMatch(color: CardColor): boolean {
    return this.hand.some(
      card => card.color === color && card.type !== CardType.WILD && card.type !== CardType.WILD_DRAW_FOUR
    );
  }

  /**
   * Calculate the total point value of cards remaining in hand
   */
  getHandPoints(): number {
    return this.hand.reduce((sum, card) => {
      switch (card.type) {
        case CardType.NUMBER:
          return sum + (card.value ?? 0);
        case CardType.SKIP:
        case CardType.REVERSE:
        case CardType.DRAW_TWO:
          return sum + 20;
        case CardType.WILD:
        case CardType.WILD_DRAW_FOUR:
          return sum + 50;
        default:
          return sum;
      }
    }, 0);
  }

  /**
   * Reset for a new round
   */
  resetForNewRound(): void {
    this.hand = [];
    this.hasCalledUno = false;
    this.isReady = false;
  }
}


