// ============================================================
// Scoring — Round + Game scoring (Section 9)
// ============================================================

import { Player } from './Player';
import { RoundScore } from '@uno/shared';

/**
 * Calculate round scores: winner gets points for all other players' remaining hands.
 */
export function calculateRoundScore(winnerId: string, players: Player[]): RoundScore {
  const playerScores: Record<string, number> = {};
  let totalPoints = 0;

  for (const player of players) {
    if (player.id === winnerId) continue;
    const handPoints = player.getHandPoints();
    totalPoints += handPoints;
    playerScores[player.id] = 0;
  }

  playerScores[winnerId] = totalPoints;

  return { roundNumber: 0, winnerId, playerScores };
}

/**
 * Check if the game is over. Supports both standard and alternate scoring.
 * - Standard: first player to reach target wins
 * - Alternate: when any player hits target, player with LOWEST score wins
 */
export function checkGameOver(
  scores: Record<string, number>,
  targetScore: number = 500,
  alternateScoring: boolean = false
): string | null {
  if (alternateScoring) {
    // Check if any player reached the target
    const anyReached = Object.values(scores).some(s => s >= targetScore);
    if (!anyReached) return null;
    // Player with LOWEST score wins
    let lowestScore = Infinity;
    let winnerId = '';
    for (const [playerId, score] of Object.entries(scores)) {
      if (score < lowestScore) {
        lowestScore = score;
        winnerId = playerId;
      }
    }
    return winnerId;
  }

  // Standard: first to reach target wins
  for (const [playerId, score] of Object.entries(scores)) {
    if (score >= targetScore) return playerId;
  }
  return null;
}
