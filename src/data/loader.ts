// src/data/loader.ts
import type { City, Puzzle } from "../types";

export interface GameData {
  puzzles: Puzzle[];
  cities: City[];
}

/**
 * Lädt Rätsel und Städte zur Laufzeit aus public/data/ (statt sie ins Bundle
 * zu kompilieren). Die Tiefen-Validierung der Inhalte bleibt Sache von
 * validate.test.ts — hier wird nur die Grobform geprüft, damit ein kaputter
 * Deploy als Störung erscheint statt als weißer Bildschirm.
 */
export async function loadGameData(fetchFn: typeof fetch = fetch): Promise<GameData> {
  const base = import.meta.env.BASE_URL;
  const [pr, cr] = await Promise.all([
    fetchFn(`${base}data/puzzles.json`),
    fetchFn(`${base}data/cities.json`),
  ]);
  if (!pr.ok || !cr.ok) {
    throw new Error(`Datenabruf fehlgeschlagen (${pr.status}/${cr.status})`);
  }
  const pj = (await pr.json()) as { puzzles?: Puzzle[] };
  const cj = (await cr.json()) as City[];
  if (!Array.isArray(pj?.puzzles) || pj.puzzles.length === 0 || typeof pj.puzzles[0]?.date !== "string") {
    throw new Error("puzzles.json hat nicht die erwartete Form");
  }
  if (!Array.isArray(cj) || cj.length === 0 || typeof cj[0]?.name !== "string") {
    throw new Error("cities.json hat nicht die erwartete Form");
  }
  return { puzzles: pj.puzzles, cities: cj };
}
