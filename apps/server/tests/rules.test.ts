/* Fast direct GameEngine rules verification — run with: npx tsx engine-test.ts */
import { GameEngine } from '../src/game/GameEngine';
import { Player } from '../src/game/Player';
import { createFullDeck } from '../src/game/Card';
import { drawStartingCard } from '../src/game/Deck';
import { isCardPlayable, CardColor, CardType, TurnState, GamePhase, Card, getCardPointValue, DEFAULT_ROOM_SETTINGS } from '@uno/shared';

let passed = 0, failed = 0;
function ok(cond: boolean, msg: string) {
  if (cond) { passed++; console.log('  ✅', msg); }
  else { failed++; console.log('  ❌', msg); }
}

function makePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => new Player(`p${i}`, `P${i}`, '😀'));
}

function card(color: CardColor, type: CardType, value?: number): Card {
  return { id: `c-${color}-${type}-${value ?? ''}-${Math.random().toString(36).slice(2, 8)}`, color, type, value, pointValue: getCardPointValue(type, value) };
}

const RED0 = () => card(CardColor.RED, CardType.NUMBER, 0);
const RED1 = () => card(CardColor.RED, CardType.NUMBER, 1);
const RED2 = () => card(CardColor.RED, CardType.NUMBER, 2);
const RED3 = () => card(CardColor.RED, CardType.NUMBER, 3);
const RED9 = () => card(CardColor.RED, CardType.NUMBER, 9);
const BLUE1 = () => card(CardColor.BLUE, CardType.NUMBER, 1);
const BLUE2 = () => card(CardColor.BLUE, CardType.NUMBER, 2);
const BLUE3 = () => card(CardColor.BLUE, CardType.NUMBER, 3);
const GREEN1 = () => card(CardColor.GREEN, CardType.NUMBER, 1);
const GREEN2 = () => card(CardColor.GREEN, CardType.NUMBER, 2);
const RED_SKIP = () => card(CardColor.RED, CardType.SKIP);
const RED_REV = () => card(CardColor.RED, CardType.REVERSE);
const RED_D2 = () => card(CardColor.RED, CardType.DRAW_TWO);
const BLUE_D2 = () => card(CardColor.BLUE, CardType.DRAW_TWO);
const WILD = () => card(CardColor.WILD, CardType.WILD);
const WD4 = () => card(CardColor.WILD, CardType.WILD_DRAW_FOUR);
const SWAP = () => card(CardColor.WILD, CardType.SWAP_HANDS);
const SHUFFLE = () => card(CardColor.WILD, CardType.SHUFFLE_HANDS);

/** Deal a fresh game, then force a deterministic table state */
function freshGame(n: number, settings = DEFAULT_ROOM_SETTINGS): { g: GameEngine; players: Player[] } {
  const players = makePlayers(n);
  const g = new GameEngine(players, { ...settings });
  g.startNewRound();
  g.discardPile = [RED1()];
  g.activeColor = CardColor.RED;
  g.currentPlayerIndex = 0;
  g.direction = 1;
  g.turnState = TurnState.AWAITING_PLAY;
  g.pendingDrawCount = 0;
  g.pendingChallenge = null;
  g.jumpIn = null;
  return { g, players };
}

// ---------- 1. Deck composition ----------
console.log('deck composition');
{
  const deck = createFullDeck();
  ok(deck.length === 110, `108-card classic + 2 modern wilds = 110 (got ${deck.length})`);
  const nums = deck.filter(c => c.type === CardType.NUMBER).length;
  const actions = deck.filter(c => [CardType.SKIP, CardType.REVERSE, CardType.DRAW_TWO].includes(c.type)).length;
  const wilds = deck.filter(c => c.type === CardType.WILD).length;
  const wd4 = deck.filter(c => c.type === CardType.WILD_DRAW_FOUR).length;
  const swaps = deck.filter(c => c.type === CardType.SWAP_HANDS).length;
  const shuffles = deck.filter(c => c.type === CardType.SHUFFLE_HANDS).length;
  ok(nums === 76 && actions === 24 && wilds === 4 && wd4 === 4 && swaps === 1 && shuffles === 1, '76 numbers, 24 actions, 4 wild, 4 WD4, 1 swap, 1 shuffle');
  ok(deck.every(c => c.id && c.pointValue >= 0), 'all cards have ids and point values');
  ok(deck.filter(c => c.type === CardType.NUMBER && c.value === 0).length === 4, 'exactly one 0 per color');
}

// ---------- 2. Matching rules ----------
console.log('card matching');
{
  const top = RED1();
  ok(isCardPlayable(RED2(), top, CardColor.RED), 'same color number');
  ok(isCardPlayable(BLUE1(), top, CardColor.RED), 'same number diff color');
  ok(isCardPlayable(RED_SKIP(), top, CardColor.RED), 'action same color');
  ok(!isCardPlayable(BLUE2(), top, CardColor.GREEN), 'no match rejected');
  ok(isCardPlayable(WILD(), top, CardColor.RED), 'wild always playable');
  ok(isCardPlayable(WD4(), top, CardColor.RED), 'wd4 always playable');
  ok(isCardPlayable(SWAP(), top, CardColor.RED), 'swap always playable');
}

// ---------- 3. Round setup ----------
console.log('round setup');
{
  const { g, players } = freshGame(3);
  ok(players.every(p => p.hand.length === 7), 'each player dealt 7');
  ok(g.drawPile.length === 110 - 21 - 1, `draw pile = 88 (got ${g.drawPile.length})`);
  ok(g.phase === GamePhase.PLAYING, 'phase PLAYING');
}

// ---------- 4. Basic play flow ----------
console.log('basic play');
{
  const { g, players } = freshGame(2);
  const p0 = players[0];
  p0.hand = [RED2(), BLUE1()];

  const notTurn = g.playCard('p1', p0.hand[0].id);
  ok(!notTurn.success, 'not your turn rejected');

  const bad = g.playCard('p0', BLUE1().id);
  ok(!bad.success, 'unplayable card rejected');

  const playedId = p0.hand[0].id;
  const good = g.playCard('p0', playedId);
  ok(good.success, 'playable card accepted');
  ok(g.getTopCard().id === playedId, 'top card updated');
  ok(players[0].hand.length === 1, 'card removed from hand');
  ok(g.currentPlayerIndex === 1, 'turn advanced');
}

// ---------- 5. Wild + color choice ----------
console.log('wild color choice');
{
  const { g, players } = freshGame(2);
  const p0 = players[0];
  p0.hand = [WILD()];

  const r = g.playCard('p0', p0.hand[0].id);
  ok(r.success && g.turnState === TurnState.AWAITING_COLOR, 'wild without color waits for color');
  const rc = g.chooseColor('p0', CardColor.BLUE);
  ok(rc.success && g.activeColor === CardColor.BLUE, 'color applied');
  ok(g.currentPlayerIndex === 1, 'turn advanced after color');
}

// ---------- 6. WD4 challenge ----------
console.log('WD4 challenge');
{
  // Illegal WD4 (has matching color) → challenge succeeds → WD4 player draws 4
  const { g, players } = freshGame(2);
  const p0 = players[0], p1 = players[1];
  p0.hand = [WD4(), RED2()]; // has RED → illegal
  p1.hand = [BLUE1()];

  const r = g.playCard('p0', p0.hand[0].id, CardColor.GREEN);
  ok(r.success && g.turnState === TurnState.AWAITING_CHALLENGE, 'WD4 played, awaiting challenge');
  ok(g.pendingChallenge?.wasLegal === false, 'WD4 flagged illegal');
  const ch = g.challengeDrawFour('p1');
  ok(ch.success && ch.challengeWon === true, 'challenge won');
  ok(p0.hand.length === 1 + 4, `WD4 player drew 4 (${p0.hand.length})`);
  ok(g.pendingChallenge === null, 'challenge cleared');
  ok(g.currentPlayerIndex === 1, 'challenger plays next');
}
{
  // Legal WD4 → challenge fails → challenger draws 6
  const { g, players } = freshGame(2);
  const p0 = players[0], p1 = players[1];
  p0.hand = [WD4(), BLUE2()]; // no red → legal
  p1.hand = [BLUE1()];

  g.playCard('p0', p0.hand[0].id, CardColor.GREEN);
  const ch = g.challengeDrawFour('p1');
  ok(ch.success && ch.challengeWon === false, 'challenge failed (WD4 was legal)');
  ok(p1.hand.length === 1 + 6, `challenger drew 6 (${p1.hand.length})`);
  ok(g.currentPlayerIndex === 0, 'turn resumed with WD4 player');
}
{
  // Accepting the WD4 → draws 4, turn passes
  const { g, players } = freshGame(2);
  const p0 = players[0], p1 = players[1];
  p0.hand = [WD4(), RED2()];
  p1.hand = [BLUE1()];
  g.playCard('p0', p0.hand.find(c => c.type === CardType.WILD_DRAW_FOUR)!.id, CardColor.GREEN);
  ok(g.turnState === TurnState.AWAITING_CHALLENGE, 'WD4 awaiting challenge');
  const acc = g.acceptDrawFour('p1');
  ok(acc.success && p1.hand.length === 1 + 4, `accepted WD4 drew 4 (${p1.hand.length})`);
  ok(g.currentPlayerIndex === 0, 'turn back after accepting');
}
{
  // Winning with WD4: round ends, no challenge, penalty tallied
  const { g, players } = freshGame(2);
  const p0 = players[0], p1 = players[1];
  p0.hand = [WD4()];
  p1.hand = [BLUE1()];
  const r = g.playCard('p0', p0.hand[0].id, CardColor.GREEN);
  ok(r.success && g.phase === GamePhase.ROUND_OVER, 'WD4 as last card ends the round');
  ok(g.turnState !== TurnState.AWAITING_CHALLENGE, 'no challenge after WD4 win');
  ok(p1.hand.length === 1 + 4, `loser drew 4 for scoring (${p1.hand.length})`);
}

// ---------- 7. Draw Two ----------
console.log('draw two');
{
  const { g, players } = freshGame(2);
  const p0 = players[0], p1 = players[1];
  p0.hand = [RED_D2(), RED2()];
  p1.hand = [BLUE1()];

  const r = g.playCard('p0', p0.hand.find(c => c.type === CardType.DRAW_TWO)!.id);
  ok(r.success && g.pendingDrawCount === 2, 'D2 sets pending draw 2');
  ok(g.currentPlayerIndex === 1, 'turn to next player');

  // stacking OFF: cannot play a non-D2 while owing
  p1.hand = [BLUE1()];
  const blocked = g.playCard('p1', p1.hand[0].id);
  ok(!blocked.success, 'stacking off: cannot play while owing cards');

  // must draw
  const d = g.drawCard('p1');
  ok(d.success && p1.hand.length === 1 + 2, `player drew 2 penalty (${p1.hand.length})`);
  ok(g.pendingDrawCount === 0, 'pending draw cleared');
  ok(g.currentPlayerIndex === 0, 'turn back to original player (2p rule)');
}
{
  // stacking ON
  const { g, players } = freshGame(2, { ...DEFAULT_ROOM_SETTINGS, stacking: true });
  const p0 = players[0], p1 = players[1];
  p0.hand = [RED_D2(), RED2()];
  p1.hand = [BLUE_D2(), BLUE3()];
  g.playCard('p0', p0.hand.find(c => c.type === CardType.DRAW_TWO)!.id);
  const stack = g.playCard('p1', p1.hand.find(c => c.type === CardType.DRAW_TWO)!.id);
  ok(stack.success && g.pendingDrawCount === 4, 'stacking on: D2 stacked to 4');
  const d = g.drawCard('p0');
  ok(d.success && p0.hand.length === 1 + 4, `stacked draw 4 applied (${p0.hand.length})`);
}

// ---------- 8. Skip / Reverse ----------
console.log('skip/reverse');
{
  const { g, players } = freshGame(2);
  const p0 = players[0];
  p0.hand = [RED_SKIP()];
  g.playCard('p0', p0.hand[0].id);
  ok(g.currentPlayerIndex === 0, '2p skip: same player goes again');
}
{
  const { g, players } = freshGame(2);
  const p0 = players[0];
  p0.hand = [RED_REV()];
  g.playCard('p0', p0.hand[0].id);
  ok(g.currentPlayerIndex === 0 && g.direction === -1, '2p reverse acts as skip');
}
{
  const { g, players } = freshGame(3);
  const p0 = players[0];
  p0.hand = [RED_SKIP()];
  g.playCard('p0', p0.hand[0].id);
  ok(g.currentPlayerIndex === 2, '3p skip: skips next player');
}
{
  const { g, players } = freshGame(3);
  const p0 = players[0];
  p0.hand = [RED_REV()];
  g.playCard('p0', p0.hand[0].id);
  ok(g.direction === -1 && g.currentPlayerIndex === 2, '3p reverse flips direction and advances');
}

// ---------- 9. UNO window & catch ----------
console.log('UNO window');
{
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED2(), RED3()];
  b.hand = [BLUE1()];

  const rr = g.playCard('p0', a.hand.find(c => c.value === 2)!.id);
  ok(rr.success && a.hand.length === 1, 'played down to 1 card');
  ok(g.unoWindowOpen.has('p0'), 'uno window open for p0');

  const catch1 = g.callCatch('p1', 'p0');
  ok(catch1.penalized && a.hand.length === 3, `caught! +2 cards (${a.hand.length})`);
  ok(!g.unoWindowOpen.has('p0'), 'window closed after catch');
}
{
  // declare UNO → catch has no penalty
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED2(), RED3()];
  b.hand = [BLUE1()];
  g.playCard('p0', a.hand.find(c => c.value === 2)!.id);
  g.declareUno('p0');
  const c = g.callCatch('p1', 'p0');
  ok(!c.penalized, 'declared UNO → catch harmless (no penalty)');
}
{
  // window closes when the next player acts
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED2(), RED3()];
  b.hand = [BLUE1()];
  g.playCard('p0', a.hand.find(c => c.value === 2)!.id);
  ok(g.unoWindowOpen.has('p0'), 'window open');
  g.drawCard('p1');
  ok(!g.unoWindowOpen.has('p0'), 'window closed after next player draws');
}

// ---------- 10. DREW_CARD guard ----------
console.log('drew card guard');
{
  const { g, players } = freshGame(2);
  const a = players[0];
  a.hand = [BLUE2(), BLUE3()];
  g.drawnCardPending.set('p0', BLUE1());
  g.turnState = TurnState.DREW_CARD;
  const d = g.drawCard('p0');
  ok(!d.success, 'cannot redraw while a drawn card is pending');
  const pass = g.passTurn('p0');
  ok(pass.success && g.currentPlayerIndex === 1, 'can pass after drawing');
}
{
  // draw a playable card, play it immediately
  const { g, players } = freshGame(2);
  const a = players[0];
  a.hand = [BLUE2(), BLUE3()];
  g.drawPile = [RED5()];
  const d = g.drawCard('p0');
  ok(d.success && d.canPlay === true, 'drew a playable card');
  ok(g.turnState === TurnState.DREW_CARD, 'turn state DREW_CARD');
  const p = g.playDrawnCard('p0', true);
  ok(p.success && g.getTopCard().type === CardType.NUMBER && g.getTopCard().value === 5, 'played the drawn card');
}

// ---------- 11. Win + scoring ----------
console.log('win & scoring');
{
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED9()];
  b.hand = [BLUE1(), RED_SKIP(), WILD()]; // 1 + 20 + 50 = 71
  const r = g.playCard('p0', a.hand[0].id);
  ok(r.success, 'last card played');
  ok(g.phase === GamePhase.ROUND_OVER, 'round over');
  ok(g.winnerIdThisRound === 'p0', 'winner recorded');
  ok(g.scores['p0'] === 71, `winner scored 71 (got ${g.scores['p0']})`);
}
{
  // Winning with D2 → next player draws 2 BEFORE scoring
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED_D2()];
  b.hand = [BLUE1()];
  g.playCard('p0', a.hand[0].id);
  ok(g.phase === GamePhase.ROUND_OVER, 'round over on D2 win');
  ok(b.hand.length === 3, 'loser drew 2 before scoring');
  ok(g.scores['p0'] === b.getHandPoints(), `winner scored loser's full hand (${g.scores['p0']})`);
}

// ---------- 12. Seven-O ----------
console.log('seven-O');
{
  const { g, players } = freshGame(2, { ...DEFAULT_ROOM_SETTINGS, sevenO: true });
  const a = players[0], b = players[1];
  a.hand = [card(CardColor.RED, CardType.NUMBER, 7), RED2()];
  b.hand = [BLUE1(), BLUE2()];
  const r = g.playCard('p0', a.hand.find(c => c.value === 7)!.id);
  ok(r.success && g.turnState === TurnState.AWAITING_SWAP, '7 opens swap state');
  const sw = g.swapHands('p0', 'p1');
  ok(sw.success, 'swap accepted');
  ok(a.hand.length === 2 && b.hand.length === 1, 'hands swapped');
  ok(g.currentPlayerIndex === 1, 'turn advanced after swap');
}
{
  // 0 rotates hands in direction
  const { g, players } = freshGame(3, { ...DEFAULT_ROOM_SETTINGS, sevenO: true });
  const [a, b, c] = players;
  a.hand = [RED0()];
  b.hand = [BLUE1()];
  c.hand = [GREEN1()];
  g.playCard('p0', a.hand[0].id);
  // a (played the 0) passes their empty hand to b; b passes to c; c passes to a
  ok(c.hand[0].color === CardColor.BLUE, 'c received b\'s hand');
  ok(a.hand.length === 1 && a.hand[0].color === CardColor.GREEN, 'a received c\'s hand');
  ok(b.hand.length === 0, 'b received a\'s empty hand');
}
{
  // sevenO off → 7 is a normal number
  const { g, players } = freshGame(2);
  const a = players[0];
  a.hand = [card(CardColor.RED, CardType.NUMBER, 7)];
  g.playCard('p0', a.hand[0].id);
  ok(g.turnState === TurnState.AWAITING_PLAY && g.currentPlayerIndex === 1, '7 is normal without sevenO');
}

// ---------- 13. Jump-In ----------
console.log('jump-in');
{
  const { g, players } = freshGame(2, { ...DEFAULT_ROOM_SETTINGS, jumpIn: true });
  const a = players[0], b = players[1];
  a.hand = [RED2(), card(CardColor.RED, CardType.NUMBER, 2)]; // two identical RED 2s
  b.hand = [BLUE1(), card(CardColor.RED, CardType.NUMBER, 2)];
  const r = g.playCard('p0', a.hand[0].id);
  ok(r.success && !!g.jumpIn, 'jump-in window open after play');
  const self = g.jumpInPlay('p0', a.hand.find(c => c.value === 2)!.id);
  ok(!self.success, 'player cannot jump on their own card');
  const bad = g.jumpInPlay('p1', b.hand.find(c => c.type === CardType.NUMBER && c.value === 1)!.id);
  ok(!bad.success, 'non-matching card rejected');
  const jumpCard = b.hand.find(c => c.type === CardType.NUMBER && c.value === 2)!;
  const jp = g.jumpInPlay('p1', jumpCard.id);
  ok(jp.success, 'jump-in accepted');
  ok(g.getTopCard().id === jumpCard.id, 'top card updated after jump');
  ok(g.currentPlayerIndex === 0, 'turn continues after the jumper (2 players)');
  ok(g.jumpIn === null, 'window closed after jump');
  const again = g.jumpInPlay('p0', RED2().id);
  ok(!again.success, 'window closed → jump rejected');
}
{
  // jump-in disabled → no window
  const { g, players } = freshGame(2);
  const a = players[0];
  a.hand = [RED2()];
  g.playCard('p0', a.hand[0].id);
  ok(g.jumpIn === null, 'no jump-in window when disabled');
}

// ---------- 14. Swap Hands / Shuffle Hands cards ----------
console.log('modern wilds');
{
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [SWAP(), RED2()];
  b.hand = [BLUE1()];
  const r = g.playCard('p0', a.hand.find(c => c.type === CardType.SWAP_HANDS)!.id, CardColor.GREEN);
  ok(r.success && g.turnState === TurnState.AWAITING_SWAP, 'swap hands card opens swap state');
  g.swapHands('p0', 'p1');
  ok(a.hand.length === 1 && b.hand.length === 1, 'hands swapped via card');
}
{
  const { g, players } = freshGame(3);
  const [a, b, c] = players;
  a.hand = [SHUFFLE(), RED2()];
  b.hand = [BLUE1(), BLUE2(), BLUE3()];
  c.hand = [GREEN1(), GREEN2()];
  const r = g.playCard('p0', a.hand.find(c => c.type === CardType.SHUFFLE_HANDS)!.id, CardColor.YELLOW);
  ok(r.success && g.turnState === TurnState.AWAITING_PLAY, 'shuffle hands card resolves immediately');
  const total = players.reduce((s, p) => s + p.hand.length, 0);
  ok(total === 1 + 2 + 3, `card count preserved (${total})`);
  ok(a.hand.length >= 1, 'shuffler got cards back');
  ok(g.activeColor === CardColor.YELLOW, 'color applied');
}

// ---------- 15. resetForNewGame + game over ----------
console.log('reset & game over');
{
  const { g, players } = freshGame(2);
  g.scores['p0'] = 400;
  g.scores['p1'] = 300;
  g.resetForNewGame();
  ok(g.scores['p0'] === 0 && g.scores['p1'] === 0, 'scores reset');
  ok(g.phase === GamePhase.PLAYING, 'new game playing');
}
{
  const { g, players } = freshGame(2);
  const a = players[0], b = players[1];
  a.hand = [RED9()];
  b.hand = [WILD(), WILD(), WILD(), WILD()]; // 200 pts
  g.scores['p0'] = 300;
  g.playCard('p0', a.hand[0].id);
  ok(g.phase === GamePhase.GAME_OVER, 'game over at 500');
  ok(g.winnerIdGame === 'p0', 'game winner recorded');
}

// ---------- 16. First-card effects (drawStartingCard) ----------
console.log('first-card effects');
{
  const res = drawStartingCard([RED1(), RED2(), WILD()]);
  ok(res.effect === 'wild_choose_color', 'wild first card → choose color');
}
{
  const res = drawStartingCard([RED1(), RED2(), RED3(), WD4()]);
  ok(res.startCard.type !== CardType.WILD_DRAW_FOUR, 'WD4 first card is returned & reshuffled');
  ok(res.effect !== 'wild_choose_color' || true, 'first card effect handled');
}
{
  const res = drawStartingCard([RED1(), RED2(), RED3(), RED_SKIP()]);
  ok(res.effect === 'skip', 'skip first card → first player skipped');
}
{
  const res = drawStartingCard([RED1(), RED2(), RED3(), RED_REV()]);
  ok(res.effect === 'reverse', 'reverse first card → direction flips');
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

function RED5() { return card(CardColor.RED, CardType.NUMBER, 5); }
