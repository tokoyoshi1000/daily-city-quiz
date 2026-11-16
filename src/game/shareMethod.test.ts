// src/game/shareMethod.test.ts
import { describe, expect, it } from "vitest";
import { isAbortError, pickShareMethod } from "./shareMethod";

const file = new File([new Uint8Array([1, 2, 3])], "probe.png", { type: "image/png" });

describe("pickShareMethod", () => {
  it("bild, wenn share und canShare mit Dateien da sind", () => {
    expect(pickShareMethod({ share: async () => {}, canShare: () => true }, file)).toBe("bild");
  });
  it("text, wenn share da ist, aber canShare fehlt", () => {
    expect(pickShareMethod({ share: async () => {} }, file)).toBe("text");
  });
  it("text, wenn canShare Dateien ablehnt", () => {
    expect(pickShareMethod({ share: async () => {}, canShare: () => false }, file)).toBe("text");
  });
  it("clipboard, wenn es kein share gibt", () => {
    expect(pickShareMethod({}, file)).toBe("clipboard");
  });
});

describe("isAbortError", () => {
  it("erkennt den Nutzer-Abbruch des Teilen-Dialogs", () => {
    expect(isAbortError(new DOMException("abgebrochen", "AbortError"))).toBe(true);
  });
  it("andere Fehler sind kein Abbruch", () => {
    expect(isAbortError(new Error("kaputt"))).toBe(false);
  });
});
