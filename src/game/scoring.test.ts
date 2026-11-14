import { describe, expect, it } from "vitest";
import { actOnePoints, quizPoints, totalPoints } from "./scoring";

describe("actOnePoints", () => {
  it("Hinweis 1 → 6 Punkte, Hinweis 6 → 1 Punkt", () => {
    expect(actOnePoints(1)).toBe(6);
    expect(actOnePoints(4)).toBe(3);
    expect(actOnePoints(6)).toBe(1);
  });
  it("nicht gelöst → 0 Punkte", () => {
    expect(actOnePoints(null)).toBe(0);
  });
});

describe("quizPoints", () => {
  it("zählt richtige Antworten", () => {
    expect(quizPoints([true, false, true])).toBe(2);
    expect(quizPoints([])).toBe(0);
  });
});

describe("totalPoints", () => {
  it("summiert beide Akte (max 9)", () => {
    expect(totalPoints(1, [true, true, true])).toBe(9);
    expect(totalPoints(null, [false, true, false])).toBe(1);
  });
});
