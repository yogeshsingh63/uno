// ============================================================
// GameEngine — Full UNO rule engine with explicit FSM
// Sections 2–9
// ============================================================

import {
  Card, CardColor, CardType, GamePhase, PlayDirection, TurnState,
  PublicGameState, GameAction, GameActionType, RoundScore,
  ChallengeData, RoomSettings, DEFAULT_ROOM_SETTINGS, isCardPlayable,
  JumpInInfo,
} from '@uno/shared';
import { Player } from './Player';
import { createShuffledDeck, dealCards, drawStartingCard, reshuffleDiscardIntoDraw, shuffleDeck, FirstCardResult } from './Deck';
import { calculateRoundScore, checkGameOver } from './Scoring';

// Timer durations (ms)
const TURN_TIMEOUT = 30_000;
const DRAW_TIMEOUT = 15_000;
const COLOR_TIMEOUT = 15_000;
const CHALLENGE_TIMEOUT = 10_000;
const JUMP_IN_WINDOW_MS = 3_000;

export interface TurnTimer {
  timerId: NodeJS.Timeout;
  timeoutAt: number;
}

export class GameEngine {
  public players: Player[];
  public currentPlayerIndex: number;
  public direction: PlayDirection;
  public drawPile: Card[];
  public discardPile: Card[];
  public activeColor: CardColor;    // Tracked separately from topCard.color
  public phase: GamePhase;
  public turnState: TurnState;
  public pendingDrawCount: number;  // For Draw Two stacking
  public roundNumber: number;
  public scores: Record<string, number>;
  public lastAction: GameAction | null;
  public winnerIdThisRound: string | null;
  public winnerIdGame: string | null;
  public targetScore: number;
  public settings: RoomSettings;

  // Challenge system (Section 6)
  public pendingChallenge: ChallengeData | null;
  public drawnCardPending: Map<string, Card>; // playerId → drawn card

  // UNO catch tracking
  public unoWindowOpen: Map<string, number>; // playerId → timestamp opened

  // Jump-In window (house rule)
  public jumpIn: JumpInInfo | null;
  private jumpInTimer: NodeJS.Timeout | null;

  // Turn timer
  public turnTimer: TurnTimer | null;
  public onTurnTimeout: (() => void) | null;

  constructor(players: Player[], settings: RoomSettings = DEFAULT_ROOM_SETTINGS) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.direction = 1;
    this.drawPile = [];
    this.discardPile = [];
    this.activeColor = CardColor.RED;
    this.phase = GamePhase.DEALING;
    this.turnState = TurnState.AWAITING_PLAY;
    this.pendingDrawCount = 0;
    this.roundNumber = 0;
    this.scores = {};
    this.lastAction = null;
    this.winnerIdThisRound = null;
    this.winnerIdGame = null;
    this.targetScore = settings.scoreTarget;
    this.settings = settings;
    this.pendingChallenge = null;
    this.drawnCardPending = new Map();
    this.unoWindowOpen = new Map();
    this.jumpIn = null;
    this.jumpInTimer = null;
    this.turnTimer = null;
    this.onTurnTimeout = null;

    for (const p of players) {
      if (!this.scores[p.id]) this.scores[p.id] = 0;
    }
  }

  // ============================================================
  // ROUND SETUP (Section 2)
  // ============================================================

  startNewRound(): FirstCardResult {
    this.roundNumber++;
    this.phase = GamePhase.DEALING;
    this.direction = 1;
    this.turnState = TurnState.AWAITING_PLAY;
    this.pendingDrawCount = 0;
    this.lastAction = null;
    this.winnerIdThisRound = null;
    this.pendingChallenge = null;
    this.drawnCardPending.clear();
    this.unoWindowOpen.clear();
    this.closeJumpInWindow();
    this.clearTurnTimer();

    for (const p of this.players) p.resetForNewRound();

    // Build and shuffle deck
    const deck = createShuffledDeck();
    const playerIds = this.players.map(p => p.id);
    const { hands, drawPile } = dealCards(deck, playerIds, 7);

    for (const [playerId, cards] of hands) {
      const player = this.players.find(p => p.id === playerId);
      if (player) player.addCards(cards);
    }

    // Draw starting card with full first-card rules
    const firstCardResult = drawStartingCard(drawPile);
    this.drawPile = firstCardResult.drawPile;
    this.discardPile = [firstCardResult.startCard];

    // Set active color from starting card
    if (firstCardResult.startCard.color === CardColor.WILD) {
      this.activeColor = CardColor.RED; // Default for wild starting card
    } else {
      this.activeColor = firstCardResult.startCard.color;
    }

    this.currentPlayerIndex = 0;

    // Apply first-card effects (Section 2)
    this.applyFirstCardEffect(firstCardResult);

    this.phase = GamePhase.PLAYING;
    return firstCardResult;
  }

  private applyFirstCardEffect(result: FirstCardResult): void {
    switch (result.effect) {
      case 'skip':
        // First player's turn is skipped
        this.advanceTurn();
        break;

      case 'reverse':
        // Direction becomes CCW
        this.direction = -1 as PlayDirection;
        // In 2-player: dealer goes first (Reverse acts as Skip on first player)
        if (this.players.length === 2) {
          this.advanceTurn();
        }
        break;

      case 'draw_two':
        // First player draws 2 AND loses turn
        this.pendingDrawCount = 2;
        break;

      case 'wild_choose_color':
        // First player must choose color — transition to AWAITING_COLOR
        this.turnState = TurnState.AWAITING_COLOR;
        break;

      case 'none':
      default:
        break;
    }
  }

  // ============================================================
  // ACCESSORS
  // ============================================================

  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex] || this.players[0];
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.find(p => p.id === id);
  }

  getTopCard(): Card {
    return this.discardPile[this.discardPile.length - 1];
  }

  // ============================================================
  // CORE GAME ACTIONS (Sections 3–5)
  // ============================================================

  playCard(playerId: string, cardId: string, declaredColor?: CardColor): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found', actions: [] };
    if (this.phase !== GamePhase.PLAYING) return { success: false, error: 'Not in playing phase', actions: [] };
    if (this.getCurrentPlayer().id !== playerId) return { success: false, error: 'Not your turn', actions: [] };
    if (this.turnState !== TurnState.AWAITING_PLAY && this.turnState !== TurnState.DREW_CARD) {
      return { success: false, error: 'Invalid turn state for playing', actions: [] };
    }

    // If in DREW_CARD state, can only play the drawn card
    if (this.turnState === TurnState.DREW_CARD) {
      const drawnCard = this.drawnCardPending.get(playerId);
      if (!drawnCard || drawnCard.id !== cardId) {
        return { success: false, error: 'Can only play the drawn card', actions: [] };
      }
    }

    // A new action closes any open UNO catch windows (rule: catch is only
    // possible until the next player plays or draws).
    this.closeUnoWindows();
    this.closeJumpInWindow();

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return { success: false, error: 'Card not in hand', actions: [] };

    // If pending draw and stacking is enabled, only D2 can be stacked
    if (this.pendingDrawCount > 0) {
      if (this.settings.stacking && card.type === CardType.DRAW_TWO) {
        // Allow stacking — continue
      } else if (card.type !== CardType.DRAW_TWO || !this.settings.stacking) {
        return { success: false, error: 'Must draw penalty cards or stack Draw Two', actions: [] };
      }
    }

    // WD4 legality check: snapshot hand for challenge (Section 4)
    if (card.type === CardType.WILD_DRAW_FOUR) {
      const wasLegal = !player.hasColorMatch(this.activeColor);
      // We still allow playing it (bluffing is allowed) but track for challenge
      this.pendingChallenge = {
        challengedPlayerId: playerId,
        targetPlayerId: '', // Will be set after advancing turn
        wasLegal,
        declaredColor: declaredColor || CardColor.RED,
        timeoutAt: 0, // Will be set after advancing turn
      };
    }

    // Validate playability
    if (!isCardPlayable(card, this.getTopCard(), this.activeColor)) {
      return { success: false, error: 'Card is not playable', actions: [] };
    }

    // ---- Play the card ----
    player.removeCard(cardId);
    this.discardPile.push(card);
    this.drawnCardPending.delete(playerId);
    this.clearTurnTimer();

    // UNO window: if player now has 1 card, open the catch window
    if (player.hand.length === 1 && !player.hasCalledUno) {
      player.unoCallOpenAt = Date.now();
      this.unoWindowOpen.set(playerId, Date.now());
    }

    const actions: GameAction[] = [];

    // ---- Apply card effects (Section 5) ----
    switch (card.type) {
      case CardType.NUMBER:
        this.activeColor = card.color;
        actions.push({ type: GameActionType.CARD_PLAYED, playerId, card });

        // 7-0 house rule: 7 = swap hands, 0 = rotate all hands
        if (this.settings.sevenO && card.value === 7) {
          if (player.hand.length === 0) return this.handleRoundWin(playerId, actions);
          this.turnState = TurnState.AWAITING_SWAP;
          return { success: true, actions };
        }
        if (this.settings.sevenO && card.value === 0) {
          this.rotateHands();
          actions.push({ type: GameActionType.HANDS_ROTATED, playerId });
        }
        this.advanceTurn();
        break;

      case CardType.SKIP:
        this.activeColor = card.color;
        actions.push({ type: GameActionType.SKIP, playerId, card });
        if (this.players.length === 2) {
          // 2-player: current player goes again (Section 7)
          // Don't advance — same player's turn
        } else {
          this.advanceTurn(); // Past current
          this.advanceTurn(); // Skip next
        }
        break;

      case CardType.REVERSE:
        this.activeColor = card.color;
        this.direction = (this.direction * -1) as PlayDirection;
        actions.push({ type: GameActionType.REVERSE, playerId, card });
        if (this.players.length === 2) {
          // 2-player: acts as Skip (Section 7) — current player goes again
        } else {
          this.advanceTurn();
        }
        break;

      case CardType.DRAW_TWO:
        this.activeColor = card.color;
        this.pendingDrawCount += 2;
        actions.push({ type: GameActionType.DRAW_TWO, playerId, card, penaltyCount: this.pendingDrawCount });
        this.advanceTurn();
        break;

      case CardType.WILD:
        if (!declaredColor || declaredColor === CardColor.WILD) {
          this.turnState = TurnState.AWAITING_COLOR;
          actions.push({ type: GameActionType.WILD_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.activeColor = declaredColor;
        actions.push({ type: GameActionType.WILD_PLAYED, playerId, card, color: declaredColor });
        this.advanceTurn();
        break;

      case CardType.WILD_DRAW_FOUR:
        if (!declaredColor || declaredColor === CardColor.WILD) {
          this.turnState = TurnState.AWAITING_COLOR;
          actions.push({ type: GameActionType.WILD_DRAW_FOUR_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.activeColor = declaredColor;
        this.pendingDrawCount += 4;

        // Winning with WD4: no challenge — round ends, penalty is tallied
        if (player.hand.length === 0) {
          this.advanceTurn();
          return this.handleRoundWin(playerId, actions);
        }

        this.pendingChallenge!.declaredColor = declaredColor;

        // Advance to next player and set up challenge
        this.advanceTurn();
        this.pendingChallenge!.targetPlayerId = this.getCurrentPlayer().id;
        this.pendingChallenge!.timeoutAt = Date.now() + CHALLENGE_TIMEOUT;
        this.turnState = TurnState.AWAITING_CHALLENGE;

        actions.push({ type: GameActionType.WILD_DRAW_FOUR_PLAYED, playerId, card, color: declaredColor });
        return { success: true, actions };

      case CardType.SWAP_HANDS:
        if (!declaredColor || declaredColor === CardColor.WILD) {
          this.turnState = TurnState.AWAITING_COLOR;
          actions.push({ type: GameActionType.SWAP_HANDS_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.activeColor = declaredColor;
        actions.push({ type: GameActionType.SWAP_HANDS_PLAYED, playerId, card, color: declaredColor });
        // Playing it as your last card ends the round — no swap needed
        if (player.hand.length === 0) return this.handleRoundWin(playerId, actions);
        this.turnState = TurnState.AWAITING_SWAP;
        return { success: true, actions };

      case CardType.SHUFFLE_HANDS:
        if (!declaredColor || declaredColor === CardColor.WILD) {
          this.turnState = TurnState.AWAITING_COLOR;
          actions.push({ type: GameActionType.SHUFFLE_HANDS_PLAYED, playerId, card });
          return { success: true, actions };
        }
        this.activeColor = declaredColor;
        // Playing it as your last card ends the round — no shuffle needed
        if (player.hand.length === 0) return this.handleRoundWin(playerId, actions);
        this.shuffleHands();
        actions.push({ type: GameActionType.SHUFFLE_HANDS_PLAYED, playerId, card, color: declaredColor });
        this.advanceTurn();
        this.turnState = TurnState.AWAITING_PLAY;
        return { success: true, actions };
    }

    // Open a Jump-In window (house rule) for exact-matchable non-wild cards
    this.openJumpInWindow(playerId, card);

    // Check win condition
    if (player.hand.length === 0) {
      return this.handleRoundWin(playerId, actions);
    }

    this.turnState = TurnState.AWAITING_PLAY;
    return { success: true, actions };
  }

  chooseColor(playerId: string, color: CardColor): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    if (this.turnState !== TurnState.AWAITING_COLOR) {
      return { success: false, error: 'Not choosing color', actions: [] };
    }
    if (color === CardColor.WILD) {
      return { success: false, error: 'Must choose a real color', actions: [] };
    }

    this.activeColor = color;
    this.closeJumpInWindow();
    const actions: GameAction[] = [{ type: GameActionType.COLOR_CHOSEN, playerId, color }];

    const topCard = this.getTopCard();
    const player = this.getPlayerById(playerId);

    if (topCard.type === CardType.WILD_DRAW_FOUR) {
      this.pendingDrawCount += 4;

      // Set up challenge state
      this.advanceTurn();
      if (this.pendingChallenge) {
        this.pendingChallenge.declaredColor = color;
        this.pendingChallenge.targetPlayerId = this.getCurrentPlayer().id;
        this.pendingChallenge.timeoutAt = Date.now() + CHALLENGE_TIMEOUT;
      }
      this.turnState = TurnState.AWAITING_CHALLENGE;
    } else if (topCard.type === CardType.SWAP_HANDS) {
      // Playing it as your last card ends the round — no swap needed
      if (player && player.hand.length === 0) {
        this.advanceTurn();
        this.turnState = TurnState.AWAITING_PLAY;
      } else {
        this.turnState = TurnState.AWAITING_SWAP;
        return { success: true, actions };
      }
    } else if (topCard.type === CardType.SHUFFLE_HANDS) {
      // Playing it as your last card ends the round — no shuffle needed
      if (player && player.hand.length === 0) {
        this.advanceTurn();
        this.turnState = TurnState.AWAITING_PLAY;
      } else {
        this.shuffleHands();
        actions.push({ type: GameActionType.SHUFFLE_HANDS_PLAYED, playerId, color });
        this.advanceTurn();
        this.turnState = TurnState.AWAITING_PLAY;
      }
    } else {
      this.advanceTurn();
      this.turnState = TurnState.AWAITING_PLAY;
    }

    // Check if the color-choosing player won (empty hand after wild)
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
    if (this.turnState !== TurnState.AWAITING_PLAY) {
      return { success: false, error: 'Must play or pass the drawn card first', canPlay: false, actions: [] };
    }

    this.clearTurnTimer();
    this.closeUnoWindows();
    this.closeJumpInWindow();

    // Handle pending draw penalty (Draw Two stack or forced draw)
    if (this.pendingDrawCount > 0) {
      const cards = this.drawCards(this.pendingDrawCount);
      player.addCards(cards);
      const penaltyCount = cards.length;
      this.pendingDrawCount = 0;
      const actions: GameAction[] = [{ type: GameActionType.CARDS_DRAWN_PENALTY, playerId, penaltyCount }];
      this.advanceTurn();
      this.turnState = TurnState.AWAITING_PLAY;
      return { success: true, canPlay: false, actions };
    }

    // Normal single draw
    const cards = this.drawCards(1);
    if (cards.length === 0) {
      // Draw pile exhausted and can't reshuffle
      this.advanceTurn();
      this.turnState = TurnState.AWAITING_PLAY;
      return { success: true, canPlay: false, actions: [{ type: GameActionType.CARD_DRAWN, playerId }] };
    }

    const drawnCard = cards[0];
    player.addCards([drawnCard]);

    const canPlay = isCardPlayable(drawnCard, this.getTopCard(), this.activeColor);
    const actions: GameAction[] = [{ type: GameActionType.CARD_DRAWN, playerId }];

    if (canPlay) {
      if (this.settings.forcePlay) {
        // Force Play: must play it immediately — auto-play
        this.drawnCardPending.set(playerId, drawnCard);
        this.turnState = TurnState.DREW_CARD;
        // The handler layer will auto-play for the player
      } else {
        this.drawnCardPending.set(playerId, drawnCard);
        this.turnState = TurnState.DREW_CARD;
      }
    } else {
      // Can't play, turn ends
      this.advanceTurn();
      this.turnState = TurnState.AWAITING_PLAY;
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
      this.turnState = TurnState.AWAITING_PLAY; // Allow playCard to process
      return this.playCard(playerId, drawnCard.id);
    } else {
      this.closeUnoWindows();
      this.closeJumpInWindow();
      this.advanceTurn();
      this.turnState = TurnState.AWAITING_PLAY;
      return { success: true, actions: [{ type: GameActionType.TURN_PASSED, playerId }] };
    }
  }

  passTurn(playerId: string): { success: boolean; error?: string } {
    if (this.getCurrentPlayer().id !== playerId) return { success: false, error: 'Not your turn' };
    if (this.turnState !== TurnState.DREW_CARD) return { success: false, error: 'Can only pass after drawing' };

    this.closeUnoWindows();
    this.closeJumpInWindow();
    this.drawnCardPending.delete(playerId);
    this.clearTurnTimer();
    this.advanceTurn();
    this.turnState = TurnState.AWAITING_PLAY;
    return { success: true };
  }

  // ============================================================
  // UNO SYSTEM (Section 6)
  // ============================================================

  declareUno(playerId: string): { success: boolean; error?: string } {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found' };
    if (player.hand.length > 2) return { success: false, error: 'Too many cards to declare UNO' };

    player.hasCalledUno = true;
    player.unoCallOpenAt = null;
    this.unoWindowOpen.delete(playerId);
    return { success: true };
  }

  /**
   * UNO Catch: any OTHER player can catch someone who forgot to declare UNO.
   * Window opens when player drops to 1 card, closes when next player acts.
   */
  callCatch(catcherId: string, targetId: string): {
    success: boolean; penalized: boolean; penaltyPlayerId?: string; error?: string;
  } {
    const target = this.getPlayerById(targetId);
    if (!target) return { success: false, penalized: false, error: 'Target not found' };
    if (target.hand.length !== 1) return { success: false, penalized: false, error: 'Target does not have 1 card' };

    if (target.hasCalledUno) {
      // Already declared — safe
      return { success: true, penalized: false };
    }

    // Check if UNO window is still open
    const windowOpen = this.unoWindowOpen.get(targetId);
    if (!windowOpen) return { success: false, penalized: false, error: 'UNO window closed' };


    // Caught! Draw 2 penalty
    const cards = this.drawCards(2);
    target.addCards(cards);
    this.unoWindowOpen.delete(targetId);
    target.unoCallOpenAt = null;

    return { success: true, penalized: true, penaltyPlayerId: targetId };
  }

  // Close UNO windows when next player acts
  private closeUnoWindows(): void {
    this.unoWindowOpen.clear();
  }

  // ============================================================
  // CHALLENGE SYSTEM (Section 6)
  // ============================================================

  challengeDrawFour(challengerId: string): {
    success: boolean; challengeWon: boolean; penaltyPlayerId: string;
    penaltyCount: number; error?: string;
  } {
    if (this.turnState !== TurnState.AWAITING_CHALLENGE || !this.pendingChallenge) {
      return { success: false, challengeWon: false, penaltyPlayerId: '', penaltyCount: 0, error: 'Not in challenge phase' };
    }

    const { challengedPlayerId, wasLegal } = this.pendingChallenge;
    const cardPlayer = this.getPlayerById(challengedPlayerId);
    const challenger = this.getPlayerById(challengerId);

    if (!cardPlayer || !challenger) {
      return { success: false, challengeWon: false, penaltyPlayerId: '', penaltyCount: 0, error: 'Player not found' };
    }

    this.pendingDrawCount = 0;
    this.clearTurnTimer();
    this.closeJumpInWindow();

    if (wasLegal) {
      // Challenge FAILS — challenger draws 6 (4 + 2 penalty)
      const cards = this.drawCards(6);
      challenger.addCards(cards);
      this.pendingChallenge = null;
      this.turnState = TurnState.AWAITING_PLAY;
      this.advanceTurn(); // Skip challenger's turn
      return { success: true, challengeWon: false, penaltyPlayerId: challengerId, penaltyCount: 6 };
    } else {
      // Challenge SUCCEEDS — WD4 player draws 4
      const cards = this.drawCards(4);
      cardPlayer.addCards(cards);
      this.pendingChallenge = null;
      this.turnState = TurnState.AWAITING_PLAY;
      // Challenger takes their normal turn (current player)
      return { success: true, challengeWon: true, penaltyPlayerId: challengedPlayerId, penaltyCount: 4 };
    }
  }

  acceptDrawFour(playerId: string): { success: boolean; error?: string } {
    if (this.turnState !== TurnState.AWAITING_CHALLENGE || !this.pendingChallenge) {
      return { success: false, error: 'Not in challenge phase' };
    }

    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found' };

    // Accepts: draw 4, lose turn
    const cards = this.drawCards(this.pendingDrawCount);
    player.addCards(cards);
    this.pendingDrawCount = 0;
    this.pendingChallenge = null;
    this.turnState = TurnState.AWAITING_PLAY;
    this.clearTurnTimer();
    this.closeJumpInWindow();
    this.advanceTurn();
    return { success: true };
  }

  // ============================================================
  // MODERN WILDS & HOUSE RULES (7-0, Jump-In)
  // ============================================================

  /** Swap the current player's hand with another player (Swap Hands card / 7-0 rule). */
  swapHands(playerId: string, targetPlayerId: string): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    if (this.turnState !== TurnState.AWAITING_SWAP) {
      return { success: false, error: 'Not waiting for a hand swap', actions: [] };
    }
    if (this.getCurrentPlayer().id !== playerId) return { success: false, error: 'Not your turn', actions: [] };
    const player = this.getPlayerById(playerId);
    const target = this.getPlayerById(targetPlayerId);
    if (!player || !target) return { success: false, error: 'Player not found', actions: [] };
    if (player.id === target.id) return { success: false, error: 'Cannot swap with yourself', actions: [] };

    const temp = player.hand;
    player.hand = target.hand;
    target.hand = temp;

    // Reset UNO state for both players after the swap
    player.hasCalledUno = false;
    player.unoCallOpenAt = null;
    target.hasCalledUno = false;
    target.unoCallOpenAt = null;
    this.unoWindowOpen.delete(player.id);
    this.unoWindowOpen.delete(target.id);
    this.openUnoWindowsFor([player, target]);

    this.turnState = TurnState.AWAITING_PLAY;
    this.closeJumpInWindow();
    this.advanceTurn();
    return { success: true, actions: [{ type: GameActionType.HAND_SWAPPED, playerId, targetPlayerId }] };
  }

  /** 7-0 rule: every player passes their hand to the next player in play direction. */
  private rotateHands(): void {
    const hands = this.players.map(p => p.hand);
    this.players.forEach((p, i) => {
      const from = (i - this.direction + this.players.length) % this.players.length;
      p.hand = hands[from];
      p.hasCalledUno = false;
      p.unoCallOpenAt = null;
    });
    this.unoWindowOpen.clear();
    this.openUnoWindowsFor(this.players);
  }

  /** Shuffle Hands card: collect every hand, shuffle, redeal evenly starting from the next player. */
  private shuffleHands(): void {
    const all: Card[] = [];
    for (const p of this.players) {
      all.push(...p.hand);
      p.hand = [];
      p.hasCalledUno = false;
      p.unoCallOpenAt = null;
    }
    this.unoWindowOpen.clear();

    const shuffled = shuffleDeck(all);
    const n = this.players.length;
    if (n === 0) return;
    const start = (this.currentPlayerIndex + this.direction + n) % n;
    for (let i = 0; i < shuffled.length; i++) {
      this.players[(start + i) % n].hand.push(shuffled[i]);
    }
    this.openUnoWindowsFor(this.players);
  }

  private openUnoWindowsFor(players: Player[]): void {
    for (const p of players) {
      if (p.hand.length === 1 && !p.hasCalledUno) {
        p.unoCallOpenAt = Date.now();
        this.unoWindowOpen.set(p.id, Date.now());
      }
    }
  }

  // ============================================================
  // JUMP-IN (house rule)
  // ============================================================

  private openJumpInWindow(playerId: string, card: Card): void {
    if (!this.settings.jumpIn) return;
    if (this.pendingDrawCount > 0) return;
    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR ||
        card.type === CardType.SWAP_HANDS || card.type === CardType.SHUFFLE_HANDS) return;

    const signature = `${card.color}:${card.type}:${card.value ?? ''}`;
    this.closeJumpInWindow();
    this.jumpIn = { signature, playedBy: playerId, openedAt: Date.now(), expiresAt: Date.now() + JUMP_IN_WINDOW_MS };
    this.jumpInTimer = setTimeout(() => {
      this.jumpIn = null;
      this.jumpInTimer = null;
    }, JUMP_IN_WINDOW_MS);
  }

  private closeJumpInWindow(): void {
    if (this.jumpInTimer) {
      clearTimeout(this.jumpInTimer);
      this.jumpInTimer = null;
    }
    this.jumpIn = null;
  }

  /** Play an exact-match card out of turn (Jump-In house rule). */
  jumpInPlay(playerId: string, cardId: string): {
    success: boolean; error?: string; actions: GameAction[];
  } {
    if (!this.jumpIn || Date.now() > this.jumpIn.expiresAt) {
      this.closeJumpInWindow();
      return { success: false, error: 'Jump-In window closed', actions: [] };
    }
    if (this.phase !== GamePhase.PLAYING) return { success: false, error: 'Not in playing phase', actions: [] };
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, error: 'Player not found', actions: [] };
    if (player.id === this.jumpIn.playedBy) return { success: false, error: 'You cannot jump on your own card', actions: [] };

    const card = player.hand.find(c => c.id === cardId);
    if (!card) return { success: false, error: 'Card not in hand', actions: [] };

    const top = this.getTopCard();
    const signature = `${card.color}:${card.type}:${card.value ?? ''}`;
    if (signature !== this.jumpIn.signature) {
      return { success: false, error: 'Card must match the top card exactly', actions: [] };
    }

    this.closeUnoWindows();
    this.closeJumpInWindow();

    player.removeCard(cardId);
    this.discardPile.push(card);
    this.drawnCardPending.delete(playerId);
    this.clearTurnTimer();

    this.currentPlayerIndex = this.players.findIndex(p => p.id === playerId);
    this.activeColor = card.color;

    const actions: GameAction[] = [{ type: GameActionType.JUMP_IN_PLAYED, playerId, card }];

    // Apply the same effects as a normal play (non-wild cards only)
    switch (card.type) {
      case CardType.SKIP:
        if (this.players.length === 2) {
          // 2-player: current player goes again
        } else {
          this.advanceTurn();
          this.advanceTurn();
        }
        break;
      case CardType.REVERSE:
        this.direction = (this.direction * -1) as PlayDirection;
        if (this.players.length > 2) this.advanceTurn();
        break;
      case CardType.DRAW_TWO:
        this.pendingDrawCount += 2;
        actions.push({ type: GameActionType.DRAW_TWO, playerId, card, penaltyCount: this.pendingDrawCount });
        this.advanceTurn();
        break;
      default:
        this.advanceTurn();
        break;
    }

    // UNO window for the jumper
    if (player.hand.length === 1 && !player.hasCalledUno) {
      player.unoCallOpenAt = Date.now();
      this.unoWindowOpen.set(playerId, Date.now());
    }

    this.turnState = TurnState.AWAITING_PLAY;
    if (player.hand.length === 0) {
      return this.handleRoundWin(playerId, actions);
    }
    return { success: true, actions };
  }

  /** Reset scores and start a brand-new game (Play Again). */
  resetForNewGame(): FirstCardResult {
    for (const p of this.players) this.scores[p.id] = 0;
    this.winnerIdGame = null;
    this.winnerIdThisRound = null;
    return this.startNewRound();
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private advanceTurn(): void {
    if (this.players.length === 0) return;
    let nextIndex = this.currentPlayerIndex;
    let attempts = 0;
    do {
      nextIndex = (nextIndex + this.direction + this.players.length) % this.players.length;
      attempts++;
      if (attempts > this.players.length) break;
    } while (!this.players[nextIndex].isConnected && attempts <= this.players.length);
    this.currentPlayerIndex = nextIndex;
  }

  drawCards(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        const result = reshuffleDiscardIntoDraw(this.discardPile, this.drawPile);
        this.drawPile = result.drawPile;
        this.discardPile = result.discardPile;
        if (result.reshuffled) {
          this.lastAction = { type: GameActionType.DRAW_PILE_RESHUFFLED, playerId: '' };
        }
      }
      if (this.drawPile.length === 0) break;
      cards.push(this.drawPile.pop()!);
    }
    return cards;
  }

  private clearTurnTimer(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer.timerId);
      this.turnTimer = null;
    }
  }

  private handleRoundWin(winnerId: string, actions: GameAction[]): {
    success: boolean; actions: GameAction[];
  } {
    this.winnerIdThisRound = winnerId;
    this.clearTurnTimer();

    // Pre-score step (Section 9): if winning card was D2 or WD4,
    // the affected player draws first (those cards counted in score).
    // The turn has already advanced past the winner, so the affected
    // player is the current player.
    if (this.pendingDrawCount > 0) {
      const affectedPlayer = this.getCurrentPlayer();
      if (affectedPlayer && affectedPlayer.id !== winnerId) {
        const penaltyCards = this.drawCards(this.pendingDrawCount);
        affectedPlayer.addCards(penaltyCards);
        this.pendingDrawCount = 0;
      }
    }

    const roundScore = calculateRoundScore(winnerId, this.players);
    roundScore.roundNumber = this.roundNumber;

    for (const [pid, pts] of Object.entries(roundScore.playerScores)) {
      this.scores[pid] = (this.scores[pid] || 0) + pts;
    }

    const gameWinner = checkGameOver(this.scores, this.targetScore, this.settings.alternateScoring);
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
        isBot: p.isBot,
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      direction: this.direction,
      topCard: this.getTopCard(),
      activeColor: this.activeColor,
      phase: this.phase,
      turnState: this.turnState,
      drawPileCount: this.drawPile.length,
      pendingDrawCount: this.pendingDrawCount,
      roundNumber: this.roundNumber,
      scores: { ...this.scores },
      lastAction: this.lastAction,
      winnerIdThisRound: this.winnerIdThisRound,
      winnerIdGame: this.winnerIdGame,
      targetScore: this.targetScore,
      turnTimeoutAt: this.turnTimer?.timeoutAt ?? null,
      pendingChallenge: this.pendingChallenge ? {
        targetPlayerId: this.pendingChallenge.targetPlayerId,
        timeoutAt: this.pendingChallenge.timeoutAt,
      } : null,
      jumpIn: this.jumpIn && Date.now() <= this.jumpIn.expiresAt ? this.jumpIn : null,
      swapOptions: this.turnState === TurnState.AWAITING_SWAP
        ? this.players
            .filter(p => p.id !== this.getCurrentPlayer().id && (p.isConnected || p.isBot))
            .map(p => p.id)
        : null,
      settings: this.settings,
    };
  }
}
