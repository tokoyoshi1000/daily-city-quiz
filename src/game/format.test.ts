import { describe, expect, it } from "vitest";
import { formatBoardDate, formatPuzzleNumber } from "./format";

describe("formatBoardDate", () => {
  it("formatiert ein Datum als Tafel-Code", () => {
    expect(formatBoardDate("2026-11-15")).toBe("SO 15. NOV");
  });
  it("funktioniert am Jahresanfang", () => {
    expect(formatBoardDate("2027-01-01")).toBe("FR 1. JAN");
  });
  it("nutzt deutsche Monatskürzel mit Umlaut", () => {
    expect(formatBoardDate("2027-03-07")).toBe("SO 7. MÄR");
  });
});

describe("formatPuzzleNumber", () => {
  it("füllt auf drei Stellen auf", () => {
    expect(formatPuzzleNumber(1)).toBe("001");
    expect(formatPuzzleNumber(42)).toBe("042");
  });
  it("lässt vierstellige Nummern unverändert", () => {
    expect(formatPuzzleNumber(1234)).toBe("1234");
  });
});
