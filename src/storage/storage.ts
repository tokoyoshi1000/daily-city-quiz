import type { GameState, Stats } from "../types";
import { emptyStats } from "../game/stats";

const STATE_KEY = "dcq:state";
const STATS_KEY = "dcq:stats";

function readJson<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Privatmodus o. Ä. — Spiel läuft ohne Persistenz weiter (Spec §6)
  }
}

const PHASES = ["start", "guessing", "reveal", "quiz", "result"] as const;

/** Grobe Formprüfung, damit manipulierte/veraltete Spielstände das Spiel nicht crashen. */
function isPlausibleGameState(s: unknown): s is GameState {
  if (typeof s !== "object" || s === null) return false;
  const g = s as Record<string, unknown>;
  return (
    typeof g.puzzleDate === "string" &&
    typeof g.hintsRevealed === "number" && g.hintsRevealed >= 0 && g.hintsRevealed <= 6 &&
    typeof g.quizIndex === "number" && g.quizIndex >= 0 && g.quizIndex <= 2 &&
    Array.isArray(g.guesses) && g.guesses.length <= 6 &&
    Array.isArray(g.quizAnswers) && g.quizAnswers.length <= 3 &&
    (g.solvedAtHint === null ||
      (typeof g.solvedAtHint === "number" && g.solvedAtHint >= 1 && g.solvedAtHint <= 6)) &&
    PHASES.includes(g.phase as (typeof PHASES)[number])
  );
}

export function loadGameState(): GameState | null {
  const parsed = readJson<GameState>(STATE_KEY);
  return parsed !== null && isPlausibleGameState(parsed) ? parsed : null;
}

export function saveGameState(state: GameState): void {
  writeJson(STATE_KEY, state);
}

export function loadStats(): Stats {
  return readJson<Stats>(STATS_KEY) ?? emptyStats();
}

export function saveStats(stats: Stats): void {
  writeJson(STATS_KEY, stats);
}

/** true, wenn localStorage tatsächlich schreibbar ist (Spec §6: Hinweis in der Statistik). */
export function storageAvailable(): boolean {
  try {
    const probe = "dcq:probe";
    globalThis.localStorage.setItem(probe, "1");
    globalThis.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
