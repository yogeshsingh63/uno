// ============================================================
// Player — Server-side player state management
// ============================================================

import { Card, CardColor, CardType, isCardPlayable } from '@uno/shared';

export class Player {
  public id: string;
  public socketId: string;
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
  public unoCallOpenAt: number | null;  // timestamp when UNO window opened

  constructor(
    id: string,
    name: string,
    avatar: string,
    isHost: boolean = false,
    isBot: boolean = false
  ) {
    this.id = id;
    this.socketId = '';
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
    this.unoCallOpenAt = null;
  }

  addCards(cards: Card[]): void {
    this.hand.push(...cards);
    if (this.hand.length > 1) {
      this.hasCalledUno = false;
      this.unoCallOpenAt = null;
    }
  }

  removeCard(cardId: string): Card | null {
    const index = this.hand.findIndex(c => c.id === cardId);
    if (index === -1) return null;
    return this.hand.splice(index, 1)[0];
  }

  hasCard(cardId: string): boolean {
    return this.hand.some(c => c.id === cardId);
  }

  getPlayableCards(topCard: Card, activeColor: CardColor): Card[] {
    return this.hand.filter(card => isCardPlayable(card, topCard, activeColor));
  }

  hasPlayableCard(topCard: Card, activeColor: CardColor): boolean {
    return this.hand.some(card => isCardPlayable(card, topCard, activeColor));
  }

  /**
   * Check if player has any non-wild cards matching the given color.
   * Used for Wild Draw Four legality check (Section 4).
   */
  hasColorMatch(color: CardColor): boolean {
    return this.hand.some(
      card => card.color === color && card.type !== CardType.WILD && card.type !== CardType.WILD_DRAW_FOUR
    );
  }

  /** Get total point value of remaining hand (for scoring) */
  getHandPoints(): number {
    return this.hand.reduce((sum, card) => sum + card.pointValue, 0);
  }

  /** Get the most frequent color in hand (for auto-pick on timeout) */
  getMostFrequentColor(): CardColor {
    const counts: Record<string, number> = {
      [CardColor.RED]: 0,
      [CardColor.YELLOW]: 0,
      [CardColor.GREEN]: 0,
      [CardColor.BLUE]: 0,
    };
    for (const card of this.hand) {
      if (card.color !== CardColor.WILD && counts[card.color] !== undefined) {
        counts[card.color]++;
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return (sorted[0]?.[0] as CardColor) || CardColor.RED;
  }

  /** Reset for new round */
  resetForNewRound(): void {
    this.hand = [];
    this.hasCalledUno = false;
    this.unoCallOpenAt = null;
    this.isReady = false;
  }
}
