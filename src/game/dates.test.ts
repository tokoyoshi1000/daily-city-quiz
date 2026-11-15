import { describe, expect, it } from "vitest";
import { localDateString, previousDateString, puzzleForDate } from "./dates";
import type { Puzzle } from "../types";

function stubPuzzle(date: string): Puzzle {
  return {
    number: 1,
    date,
    city: { name: "X", aliases: [], country: "Y", lat: 0, lng: 0 },
    hints: ["a", "b", "c", "d", "e", "f"],
    quiz: [],
    host: { intro: "", wrongGuess: [], winEarly: "", winMid: "", winLate: "", lose: "", reveal: "" },
  };
}

describe("localDateString", () => {
  it("formatiert als YYYY-MM-DD mit führenden Nullen", () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateString(new Date(2026, 10, 14))).toBe("2026-11-14");
  });
});

describe("previousDateString", () => {
  it("liefert den Vortag, auch über Monats- und Jahresgrenzen", () => {
    expect(previousDateString("2026-11-14")).toBe("2026-11-13");
    expect(previousDateString("2026-03-01")).toBe("2026-02-28");
    expect(previousDateString("2026-01-01")).toBe("2025-12-31");
  });
});

describe("puzzleForDate", () => {
  it("findet das Rätsel zum Datum", () => {
    const puzzles = [stubPuzzle("2026-11-14"), stubPuzzle("2026-11-15")];
    expect(puzzleForDate(puzzles, "2026-11-15")?.date).toBe("2026-11-15");
  });
  it("liefert undefined, wenn kein Rätsel existiert", () => {
    expect(puzzleForDate([stubPuzzle("2026-11-14")], "2030-01-01")).toBeUndefined();
  });
});
