// src/data/loader.test.ts
import { describe, expect, it, vi } from "vitest";
import { loadGameData } from "./loader";

const okResponse = (body: unknown): Response =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;
const errorResponse = (status: number): Response =>
  ({ ok: false, status, json: async () => ({}) }) as unknown as Response;

const validPuzzles = { puzzles: [{ number: 1, date: "2026-11-15" }] };
const validCities = [{ name: "Lissabon" }];

describe("loadGameData", () => {
  it("liefert Rätsel und Städte bei gültigen Antworten", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(okResponse(validPuzzles))
      .mockResolvedValueOnce(okResponse(validCities));
    const data = await loadGameData(fetchFn as unknown as typeof fetch);
    expect(data.puzzles).toHaveLength(1);
    expect(data.cities[0].name).toBe("Lissabon");
    expect(fetchFn).toHaveBeenCalledWith("/data/puzzles.json");
    expect(fetchFn).toHaveBeenCalledWith("/data/cities.json");
  });

  it("wirft bei HTTP-Fehler mit Statuscode", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(404))
      .mockResolvedValueOnce(okResponse(validCities));
    await expect(loadGameData(fetchFn as unknown as typeof fetch)).rejects.toThrow("404");
  });

  it("wirft bei unerwarteter Form", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(okResponse({ nope: true }))
      .mockResolvedValueOnce(okResponse(validCities));
    await expect(loadGameData(fetchFn as unknown as typeof fetch)).rejects.toThrow("Form");
  });
});
