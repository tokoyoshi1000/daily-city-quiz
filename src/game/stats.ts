import type { Stats } from "../types";
import { previousDateString } from "./dates";

export function emptyStats(): Stats {
  return {
    played: 0,
    solved: 0,
    solvedByHint: [0, 0, 0, 0, 0, 0],
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    totalPoints: 0,
  };
}

export interface CompletedGame {
  date: string;
  solvedAtHint: number | null;
  points: number;
}

/** Schreibt ein abgeschlossenes Tagesrätsel fort. Idempotent: derselbe Tag wird nie doppelt gezählt. */
export function applyCompletedGame(stats: Stats, game: CompletedGame): Stats {
  if (stats.lastPlayedDate === game.date) return stats;
  const continuesStreak = stats.lastPlayedDate === previousDateString(game.date);
  const currentStreak = continuesStreak ? stats.currentStreak + 1 : 1;
  const solvedByHint = [...stats.solvedByHint];
  if (game.solvedAtHint !== null) solvedByHint[game.solvedAtHint - 1] += 1;
  return {
    played: stats.played + 1,
    solved: stats.solved + (game.solvedAtHint !== null ? 1 : 0),
    solvedByHint,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastPlayedDate: game.date,
    totalPoints: stats.totalPoints + game.points,
  };
}
