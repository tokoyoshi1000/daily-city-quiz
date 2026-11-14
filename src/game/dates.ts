import type { Puzzle } from "../types";

/** Lokales Gerätedatum als YYYY-MM-DD (bewusst NICHT UTC — Spielerzeit zählt). */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Vortag eines YYYY-MM-DD-Strings (Rechnung in UTC, damit keine DST-Effekte). */
export function previousDateString(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function puzzleForDate(puzzles: Puzzle[], date: string): Puzzle | undefined {
  return puzzles.find((p) => p.date === date);
}
