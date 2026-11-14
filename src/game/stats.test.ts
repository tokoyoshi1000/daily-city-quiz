import { describe, expect, it } from "vitest";
import { applyCompletedGame, emptyStats } from "./stats";

describe("emptyStats", () => {
  it("startet bei null", () => {
    expect(emptyStats()).toEqual({
      played: 0,
      solved: 0,
      solvedByHint: [0, 0, 0, 0, 0, 0],
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      totalPoints: 0,
    });
  });
});

describe("applyCompletedGame", () => {
  it("erster Spieltag startet Streak bei 1", () => {
    const s = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    expect(s.played).toBe(1);
    expect(s.solved).toBe(1);
    expect(s.solvedByHint[2]).toBe(1);
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(1);
    expect(s.totalPoints).toBe(7);
    expect(s.lastPlayedDate).toBe("2026-11-14");
  });

  it("Folgetag erhöht Streak, auch bei verlorenem Rätsel (Streak = gespielt, nicht gewonnen)", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    const day2 = applyCompletedGame(day1, { date: "2026-11-15", solvedAtHint: null, points: 2 });
    expect(day2.currentStreak).toBe(2);
    expect(day2.solved).toBe(1);
    expect(day2.solvedByHint).toEqual([0, 0, 1, 0, 0, 0]);
  });

  it("verpasster Tag setzt Streak auf 1 zurück, maxStreak bleibt", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 1, points: 9 });
    const day2 = applyCompletedGame(day1, { date: "2026-11-15", solvedAtHint: 2, points: 8 });
    const later = applyCompletedGame(day2, { date: "2026-11-18", solvedAtHint: 2, points: 8 });
    expect(later.currentStreak).toBe(1);
    expect(later.maxStreak).toBe(2);
  });

  it("ist idempotent für denselben Tag (Reload auf Result-Screen)", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    const again = applyCompletedGame(day1, { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    expect(again).toBe(day1); // identische Referenz → keine Doppelzählung
  });
});
