import { Player } from './Player';
import { RoundScore } from '../../packages/shared/src/types';

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

export function checkGameOver(scores: Record<string, number>, targetScore: number = 500): string | null {
  for (const [playerId, score] of Object.entries(scores)) {
    if (score >= targetScore) return playerId;
  }
  return null;
}
