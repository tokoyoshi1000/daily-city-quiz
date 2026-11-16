// src/game/shareCard.test.ts
import { describe, expect, it } from "vitest";
import { buildShareCardLayout } from "./shareCard";

describe("buildShareCardLayout", () => {
  it("Treffer bei Hinweis 3 mit 2 Quiz-Punkten", () => {
    const l = buildShareCardLayout({
      number: 2,
      date: "2026-11-16",
      solvedAtHint: 3,
      quizAnswers: [true, true, false],
    });
    expect(l.headerRight).toBe("RÄTSEL 002");
    expect(l.dateLabel).toBe("MO 16. NOV");
    expect(l.solved).toBe(true);
    expect(l.stampText).toBe("ANGEKOMMEN");
    expect(l.stampColor).toBe("#1f7a45");
    expect(l.hitStation).toBe(3);
    expect(l.pointsLine).toBe("6 PUNKTE · QUIZ 2/3");
  });

  it("Niederlage ohne Punkte", () => {
    const l = buildShareCardLayout({
      number: 10,
      date: "2026-11-24",
      solvedAtHint: null,
      quizAnswers: [false, false, false],
    });
    expect(l.solved).toBe(false);
    expect(l.stampText).toBe("VERPASST");
    expect(l.stampColor).toBe("#c0392b");
    expect(l.hitStation).toBeNull();
    expect(l.pointsLine).toBe("0 PUNKTE · QUIZ 0/3");
  });

  it("Singular bei genau 1 Punkt", () => {
    const l = buildShareCardLayout({
      number: 5,
      date: "2026-11-19",
      solvedAtHint: null,
      quizAnswers: [true, false, false],
    });
    expect(l.pointsLine).toBe("1 PUNKT · QUIZ 1/3");
  });
});
