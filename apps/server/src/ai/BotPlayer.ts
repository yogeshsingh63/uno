import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';
import { CardColor, CardType, Card, TurnState } from '@uno/shared';

export class BotPlayer {
  private game: GameEngine;
  private player: Player;

  constructor(game: GameEngine, player: Player) {
    this.game = game;
    this.player = player;
  }

  decideAction(): { type: 'play' | 'draw'; cardId?: string; card?: Card } {
    const playable = this.player.getPlayableCards(this.game.getTopCard(), this.game.activeColor);
    if (playable.length === 0) return { type: 'draw' };

    // Priority: action cards > color match > wild
    const actionCards = playable.filter(c =>
      c.type === CardType.SKIP || c.type === CardType.REVERSE || c.type === CardType.DRAW_TWO
    );
    const colorMatch = playable.filter(c =>
      c.color === this.game.activeColor && c.type === CardType.NUMBER
    );
    const wilds = playable.filter(c =>
      c.type === CardType.WILD || c.type === CardType.WILD_DRAW_FOUR
    );
    const numberMatch = playable.filter(c => c.type === CardType.NUMBER);

    let chosen: Card;
    if (actionCards.length > 0) chosen = actionCards[0];
    else if (colorMatch.length > 0) chosen = colorMatch[0];
    else if (numberMatch.length > 0) chosen = numberMatch[0];
    else if (wilds.length > 0) chosen = wilds[0];
    else chosen = playable[0];

    return { type: 'play', cardId: chosen.id, card: chosen };
  }

  chooseColor(): CardColor {
    return this.player.getMostFrequentColor();
  }

  shouldChallengeDrawFour(): boolean {
    return Math.random() > 0.6; // 40% chance to challenge
  }
}
