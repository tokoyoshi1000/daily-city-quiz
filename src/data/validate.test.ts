import { describe, expect, it } from "vitest";
import citiesJson from "./cities.json";
import puzzlesJson from "./puzzles.json";
import type { City, Puzzle } from "../types";
import { previousDateString } from "../game/dates";

const cities = citiesJson as City[];
const puzzles = (puzzlesJson as { puzzles: Puzzle[] }).puzzles;

const cityKey = (c: { name: string; country: string }) => `${c.name}|${c.country}`;

describe("cities.json", () => {
  it("enthält mindestens 300 Städte", () => {
    expect(cities.length).toBeGreaterThanOrEqual(300);
  });
  it("Name+Land sind eindeutig", () => {
    const keys = cities.map(cityKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("Koordinaten sind gültig", () => {
    for (const c of cities) {
      expect(c.lat, c.name).toBeGreaterThanOrEqual(-90);
      expect(c.lat, c.name).toBeLessThanOrEqual(90);
      expect(c.lng, c.name).toBeGreaterThanOrEqual(-180);
      expect(c.lng, c.name).toBeLessThanOrEqual(180);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.country.length).toBeGreaterThan(0);
    }
  });
});

describe("puzzles.json", () => {
  it("enthält mindestens 90 Rätsel", () => {
    expect(puzzles.length).toBeGreaterThanOrEqual(90);
  });
  it("Nummern laufen lückenlos ab 1", () => {
    puzzles.forEach((p, i) => expect(p.number, p.date).toBe(i + 1));
  });
  it("Daten starten am 2026-11-14 und sind lückenlos aufsteigend", () => {
    expect(puzzles[0].date).toBe("2026-11-14");
    for (let i = 1; i < puzzles.length; i++) {
      expect(previousDateString(puzzles[i].date), `#${puzzles[i].number}`).toBe(puzzles[i - 1].date);
    }
  });
  it("jede Zielstadt ist eindeutig und exakt in cities.json enthalten", () => {
    const byKey = new Map(cities.map((c) => [cityKey(c), c]));
    const seen = new Set<string>();
    for (const p of puzzles) {
      const key = cityKey(p.city);
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
      const listed = byKey.get(key);
      expect(listed, key).toBeDefined();
      expect(listed!.lat, key).toBe(p.city.lat);
      expect(listed!.lng, key).toBe(p.city.lng);
    }
  });
  it("keine zwei aufeinanderfolgenden Tage mit demselben Land", () => {
    for (let i = 1; i < puzzles.length; i++) {
      expect(puzzles[i].city.country, `#${puzzles[i].number}`).not.toBe(puzzles[i - 1].city.country);
    }
  });
  it("Struktur: 6 Hinweise, 3 Fragen à 4 Antworten, Host-Texte vollständig", () => {
    for (const p of puzzles) {
      const label = `#${p.number} ${p.city.name}`;
      expect(p.hints, label).toHaveLength(6);
      p.hints.forEach((h) => expect(h.trim().length, label).toBeGreaterThan(10));
      expect(p.quiz, label).toHaveLength(3);
      for (const q of p.quiz) {
        expect(q.choices, label).toHaveLength(4);
        expect(q.answerIndex, label).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, label).toBeLessThanOrEqual(3);
        expect(q.question.trim().length, label).toBeGreaterThan(5);
        expect(q.hostCorrect.trim().length, label).toBeGreaterThan(0);
        expect(q.hostWrong.trim().length, label).toBeGreaterThan(0);
      }
      expect(p.host.wrongGuess.length, label).toBeGreaterThanOrEqual(5);
      for (const line of [p.host.intro, p.host.winEarly, p.host.winMid, p.host.winLate, p.host.lose, p.host.reveal]) {
        expect(line.trim().length, label).toBeGreaterThan(0);
      }
    }
  });
});
