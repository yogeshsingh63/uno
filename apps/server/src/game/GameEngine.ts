import {
  Card, CardColor, CardType, GamePhase, PlayDirection,
  PublicGameState, PlayerGameState, GameAction, GameActionType, RoundScore,
  isCardPlayable
} from '@uno/shared';
import { Player } from './Player';
import { createShuffledDeck, dealCards, drawStartingCard, reshuffleDiscardIntoDraw } from './Deck';
import { calculateRoundScore, checkGameOver } from './Scoring';

export class GameEngine {
  public players: Player[];
  public currentPlayerIndex: number;
  public direction: PlayDirection;
  public drawPile: Card[];
  public discardPile: Card[];
  public currentColor: CardColor;
  public phase: GamePhase;
  public pendingDrawCount: number;
  public roundNumber: number;
  public scores: Record<string, number>;
  public lastAction: GameAction | null;
  public winnerIdThisRound: string | null;
  public winnerIdGame: string | null;
  public targetScore: number;
  public lastWildDrawFourPlayerId: string | null;
  public drawnCardPending: Map<string, Card>;

  constructor(players: Player[], targetScore: number = 500) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.drawPile = [];
    this.discardPile = [];
    this.currentColor = CardColor.RED;
    this.phase = GamePhase.DEALING;
    this.pendingDrawCount = 0;
    this.roundNumber = 0;
    this.scores = {};
    this.lastAction = null;
    this.winnerIdThisRound = null;
    this.winnerIdGame = null;
    this.targetScore = targetScore;
    this.lastWildDrawFourPlayerId = null;
    this.drawnCardPending = new Map();

    for (const p of players) {
      if (!this.scores[p.id]) this.scores[p.id] = 0;
    }
  }

  startNewRound(): void {
    this.roundNumber++;
    this.phase = GamePhase.DEALING;
    this.direction = 1;
    this.pendingDrawCount = 0;
    this.lastAction = null;
    this.winnerIdThisRound = null;
    this.lastWildDrawFourPlayerId = null;
    this.drawnCardPending.clear();

    for (const p of this.players) p.resetForNewRound();

    const deck = createShuffledDeck();
    const playerIds = this.players.map(p => p.id);
    const { hands, drawPile } = dealCards(deck, playerIds, 7);

    for (const [playerId, cards] of hands) {
      const player = this.players.find(p => p.id === playerId);
      if (player) player.addCards(cards);
    }

    const { startCard, drawPile: remaining } = drawStartingCard(drawPile);
    this.drawPile = remaining;
    this.discardPile = [startCard];
    this.currentColor = startCard.color === CardColor.WILD ? CardColor.RED : startCard.color;
    this.currentPlayerIndex = 0;

    // Handle starting card effects
    this.handleStartingCardEffects(startCard);
    this.phase = GamePhase.PLAYING;
  }

  private handleStartingCardEffects(card: Card): void {
    switch (card.type) {
      case CardType.SKIP:
        this.advanceTurn();
        break;
      case CardType.REVERSE:
        this.direction = -1 as PlayDirection;
        if (this.players.length === 2) this.advanceTurn();
        break;
      case CardType.DRAW_TWO:
        this.pendingDrawCount = 2;
        break;
    }
  }

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.find(p => p.id === id);
  }

  getTopCard(): Card {
    return this.discardPile[this.discardPile.length - 1];
  }

  // ---- Core Game Actions ----

  playCard(playerId: string, cardId: string, chosenColor?: CardColor): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found', actions: [] };
    if (this.phase !== GamePhase.PLAYING) return { success: false, error: 'Not in playing phase', actions: [] };
    if (this.getCurrentPlayer().id !== playerId) return { success: false, error: 'Not your turn', actions: [] };

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return { success: false, error: 'Card not in hand', actions: [] };

    // If there's pending draw, only Draw Two can be stacked
    if (this.pendingDrawCount > 0 && card.type !== CardType.DRAW_TWO) {
      return { success: false, error: 'Must play Draw Two or take penalty', actions: [] };
    }

    // Validate Wild Draw Four legality
    if (card.type === CardType.WILD_DRAW_FOUR) {
      // W+4 is only legal if player has NO cards matching current color
      // However, the player CAN bluff — we allow it but track for challenges
      this.lastWildDrawFourPlayerId = playerId;
    }

    if (!isCardPlayable(card, this.getTopCard(), this.currentColor)) {
      return { success: false, error: 'Card is not playable', actions: [] };
    }

    // Play the card
    player.removeCard(cardId);
    this.discardPile.push(card);
    this.drawnCardPending.delete(playerId);

    const actions: GameAction[] = [];

    // Handle card effects
    switch (card.type) {
      case CardType.NUMBER:
        this.currentColor = card.color;
        actions.push({ type: GameActionType.CARD_PLAYED, playerId, card });
        this.advanceTurn();
        break;

      case CardType.SKIP:
        this.currentColor = card.color;
        actions.push({ type: GameActionType.SKIP, playerId, card });
        this.advanceTurn(); // advance past current
        this.advanceTurn(); // skip next player
        break;

      case CardType.REVERSE:
        this.currentColor = card.color;
        this.direction = (this.direction * -1) as PlayDirection;
        actions.push({ type: GameActionType.REVERSE, playerId, card });
        if (this.players.length === 2) {
          this.advanceTurn(); // acts as skip in 2-player
          this.advanceTurn();
        } else {
          this.advanceTurn();
        }
        break;

      case CardType.DRAW_TWO:
        this.currentColor = card.color;
        this.pendingDrawCount += 2;
        actions.push({ type: GameActionType.DRAW_TWO, playerId, card, penaltyCount: this.pendingDrawCount });
        this.advanceTurn();
        break;

      case CardType.WILD:
        if (!chosenColor || chosenColor === CardColor.WILD) {
          // Need to choose color
          this.phase = GamePhase.CHOOSING_COLOR;
          actions.push({ type: GameActionType.WILD_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.currentColor = chosenColor;
        actions.push({ type: GameActionType.WILD_PLAYED, playerId, card, color: chosenColor });
        this.advanceTurn();
        break;

      case CardType.WILD_DRAW_FOUR:
        if (!chosenColor || chosenColor === CardColor.WILD) {
          this.phase = GamePhase.CHOOSING_COLOR;
          actions.push({ type: GameActionType.WILD_DRAW_FOUR_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.currentColor = chosenColor;
        this.pendingDrawCount += 4;
        actions.push({ type: GameActionType.WILD_DRAW_FOUR_PLAYED, playerId, card, color: chosenColor });
        this.phase = GamePhase.CHALLENGING_DRAW_FOUR;
        this.advanceTurn();
        return { success: true, actions };
    }

    // Check win condition
    if (player.hand.length === 0) {
      return this.handleRoundWin(playerId, actions);
    }

    return { success: true, actions };
  }

  chooseColor(playerId: string, color: CardColor): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    if (this.phase !== GamePhase.CHOOSING_COLOR) {
      return { success: false, error: 'Not choosing color', actions: [] };
    }
    if (color === CardColor.WILD) {
      return { success: false, error: 'Must choose a real color', actions: [] };
    }

    this.currentColor = color;
    const actions: GameAction[] = [{ type: GameActionType.COLOR_CHOSEN, playerId, color }];

    const topCard = this.getTopCard();
    if (topCard.type === CardType.WILD_DRAW_FOUR) {
      this.pendingDrawCount += 4;
      this.phase = GamePhase.CHALLENGING_DRAW_FOUR;
      this.advanceTurn();
    } else {
      this.phase = GamePhase.PLAYING;
      this.advanceTurn();
    }

    const player = this.getPlayerById(playerId);
    if (player && player.hand.length === 0) {
      return this.handleRoundWin(playerId, actions);
    }

    return { success: true, actions };
  }

  drawCard(playerId: string): {
    success: boolean; error?: string; card?: Card; canPlay: boolean; actions: GameAction[];
  } {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found', canPlay: false, actions: [] };
    if (this.getCurrentPlayer().id !== playerId) return { success: false, error: 'Not your turn', canPlay: false, actions: [] };

    // Handle pending draw penalty
    if (this.pendingDrawCount > 0) {
      const cards = this.drawCards(this.pendingDrawCount);
      player.addCards(cards);
      this.pendingDrawCount = 0;
      const actions: GameAction[] = [{ type: GameActionType.CARD_DRAWN, playerId, penaltyCount: cards.length }];
      this.advanceTurn();
      return { success: true, canPlay: false, actions };
    }

    // Normal draw
    const cards = this.drawCards(1);
    if (cards.length === 0) return { success: false, error: 'No cards to draw', canPlay: false, actions: [] };

    const drawnCard = cards[0];
    player.addCards([drawnCard]);

    const canPlay = isCardPlayable(drawnCard, this.getTopCard(), this.currentColor);
    const actions: GameAction[] = [{ type: GameActionType.CARD_DRAWN, playerId }];

    if (canPlay) {
      this.drawnCardPending.set(playerId, drawnCard);
    } else {
      this.advanceTurn();
    }

    return { success: true, card: drawnCard, canPlay, actions };
  }

  playDrawnCard(playerId: string, play: boolean): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    const drawnCard = this.drawnCardPending.get(playerId);
    if (!drawnCard) return { success: false, error: 'No drawn card pending', actions: [] };

    this.drawnCardPending.delete(playerId);

    if (play) {
      return this.playCard(playerId, drawnCard.id);
    } else {
      this.advanceTurn();
      return { success: true, actions: [] };
    }
  }

  callUno(playerId: string): { success: boolean; error?: string } {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found' };
    if (player.hand.length > 2) return { success: false, error: 'Too many cards to call UNO' };
    player.hasCalledUno = true;
    return { success: true };
  }

  challengeUno(challengerId: string, targetId: string): {
    success: boolean; penalized: boolean; penaltyPlayerId?: string; error?: string;
  } {
    const target = this.getPlayerById(targetId);
    if (!target) return { success: false, penalized: false, error: 'Target not found' };
    if (target.hand.length !== 1) return { success: false, penalized: false, error: 'Target does not have 1 card' };

    if (!target.hasCalledUno) {
      // Target forgot to call UNO — penalty!
      const cards = this.drawCards(2);
      target.addCards(cards);
      return { success: true, penalized: true, penaltyPlayerId: targetId };
    }

    return { success: true, penalized: false };
  }

  challengeDrawFour(challengerId: string): {
    success: boolean; challengeWon: boolean; penaltyPlayerId: string; penaltyCount: number; error?: string;
  } {
    if (this.phase !== GamePhase.CHALLENGING_DRAW_FOUR) {
      return { success: false, challengeWon: false, penaltyPlayerId: '', penaltyCount: 0, error: 'Not in challenge phase' };
    }

    const cardPlayerId = this.lastWildDrawFourPlayerId;
    if (!cardPlayerId) {
      return { success: false, challengeWon: false, penaltyPlayerId: '', penaltyCount: 0, error: 'No W+4 player' };
    }

    const cardPlayer = this.getPlayerById(cardPlayerId);
    const challenger = this.getPlayerById(challengerId);
    if (!cardPlayer || !challenger) {
      return { success: false, challengeWon: false, penaltyPlayerId: '', penaltyCount: 0, error: 'Player not found' };
    }

    this.phase = GamePhase.PLAYING;
    this.pendingDrawCount = 0;

    // Check if the W+4 was legal (player had no matching color cards)
    // We need to check the color BEFORE the wild was played
    const previousColor = this.getPreviousColor();
    const wasLegal = !cardPlayer.hasColorMatch(previousColor);

    if (wasLegal) {
      // Challenge fails — challenger draws 6
      const cards = this.drawCards(6);
      challenger.addCards(cards);
      this.advanceTurn();
      return { success: true, challengeWon: false, penaltyPlayerId: challengerId, penaltyCount: 6 };
    } else {
      // Challenge succeeds — card player draws 4
      const cards = this.drawCards(4);
      cardPlayer.addCards(cards);
      // Challenger doesn't draw, and it's now their turn (already advanced)
      return { success: true, challengeWon: true, penaltyPlayerId: cardPlayerId, penaltyCount: 4 };
    }
  }

  acceptDrawFour(playerId: string): { success: boolean; error?: string } {
    if (this.phase !== GamePhase.CHALLENGING_DRAW_FOUR) {
      return { success: false, error: 'Not in challenge phase' };
    }

    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    const cards = this.drawCards(this.pendingDrawCount);
    player.addCards(cards);
    this.pendingDrawCount = 0;
    this.phase = GamePhase.PLAYING;
    this.advanceTurn();
    return { success: true };
  }

  // ---- Helpers ----

  private advanceTurn(): void {
    let nextIndex = this.currentPlayerIndex;
    let attempts = 0;
    do {
      nextIndex = (nextIndex + this.direction + this.players.length) % this.players.length;
      attempts++;
      if (attempts > this.players.length) break;
    } while (!this.players[nextIndex].isConnected && attempts <= this.players.length);
    this.currentPlayerIndex = nextIndex;
  }

  private drawCards(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        const result = reshuffleDiscardIntoDraw(this.discardPile, this.drawPile);
        this.drawPile = result.drawPile;
        this.discardPile = result.discardPile;
      }
      if (this.drawPile.length === 0) break;
      cards.push(this.drawPile.pop()!);
    }
    return cards;
  }

  private getPreviousColor(): CardColor {
    if (this.discardPile.length >= 2) {
      const prevCard = this.discardPile[this.discardPile.length - 2];
      return prevCard.color === CardColor.WILD ? CardColor.RED : prevCard.color;
    }
    return CardColor.RED;
  }

  private handleRoundWin(winnerId: string, actions: GameAction[]): {
    success: boolean; actions: GameAction[];
  } {
    this.winnerIdThisRound = winnerId;
    const roundScore = calculateRoundScore(winnerId, this.players);
    roundScore.roundNumber = this.roundNumber;

    for (const [pid, pts] of Object.entries(roundScore.playerScores)) {
      this.scores[pid] = (this.scores[pid] || 0) + pts;
    }

    const gameWinner = checkGameOver(this.scores, this.targetScore);
    if (gameWinner) {
      this.winnerIdGame = gameWinner;
      this.phase = GamePhase.GAME_OVER;
    } else {
      this.phase = GamePhase.ROUND_OVER;
    }

    return { success: true, actions };
  }

  getPublicState(): PublicGameState {
    return {
      roomCode: '',
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        cardCount: p.hand.length,
        isConnected: p.isConnected,
        hasCalledUno: p.hasCalledUno,
        score: this.scores[p.id] || 0,
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      topCard: this.getTopCard(),
      currentColor: this.currentColor,
      phase: this.phase,
      drawPileCount: this.drawPile.length,
      pendingDrawCount: this.pendingDrawCount,
      roundNumber: this.roundNumber,
      scores: { ...this.scores },
      lastAction: this.lastAction,
      winnerIdThisRound: this.winnerIdThisRound,
      winnerIdGame: this.winnerIdGame,
      targetScore: this.targetScore,
    };
  }
}
