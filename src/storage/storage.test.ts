import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGameState, loadStats, saveGameState, saveStats, storageAvailable } from "./storage";
import { createInitialState } from "../game/reducer";
import { emptyStats } from "../game/stats";

function fakeLocalStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  } as Storage;
}

afterEach(() => vi.unstubAllGlobals());

describe("game state roundtrip", () => {
  it("speichert und lädt den Spielstand", () => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    const state = { ...createInitialState("2026-11-14"), hintsRevealed: 3 };
    saveGameState(state);
    expect(loadGameState()).toEqual(state);
  });

  it("liefert null bei leerem oder kaputtem Storage-Inhalt", () => {
    const ls = fakeLocalStorage();
    vi.stubGlobal("localStorage", ls);
    expect(loadGameState()).toBeNull();
    ls.setItem("dcq:state", "{kaputt");
    expect(loadGameState()).toBeNull();
  });

  it("verwirft gespeicherte Zustände mit falscher Form oder unplausiblen Werten", () => {
    const ls = fakeLocalStorage();
    vi.stubGlobal("localStorage", ls);
    ls.setItem("dcq:state", JSON.stringify({ foo: 1 }));
    expect(loadGameState()).toBeNull();
    ls.setItem("dcq:state", JSON.stringify({ ...createInitialState("2026-11-14"), quizIndex: 3 }));
    expect(loadGameState()).toBeNull();
  });
});

describe("stats roundtrip", () => {
  it("speichert und lädt Statistik, Default ist emptyStats", () => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    expect(loadStats()).toEqual(emptyStats());
    const stats = { ...emptyStats(), played: 5, currentStreak: 3 };
    saveStats(stats);
    expect(loadStats()).toEqual(stats);
  });

  it("verwirft Statistik mit falscher Form", () => {
    const ls = fakeLocalStorage();
    vi.stubGlobal("localStorage", ls);
    ls.setItem("dcq:stats", JSON.stringify({ played: 1 }));
    expect(loadStats()).toEqual(emptyStats());
  });
});

describe("ohne funktionierenden Storage", () => {
  it("wirft nie, sondern liefert Defaults", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage);
    expect(() => saveStats(emptyStats())).not.toThrow();
    expect(loadStats()).toEqual(emptyStats());
    expect(loadGameState()).toBeNull();
    expect(storageAvailable()).toBe(false);
  });

  it("storageAvailable ist true bei funktionierendem Storage", () => {
    vi.stubGlobal("localStorage", fakeLocalStorage());
    expect(storageAvailable()).toBe(true);
  });
});
