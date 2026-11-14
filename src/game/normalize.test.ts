import { describe, expect, it } from "vitest";
import { cityMatchesInput, isSameCity, normalizeCityInput } from "./normalize";
import type { City } from "../types";

const muenchen: City = { name: "München", aliases: ["Munich"], country: "Deutschland", lat: 48.1374, lng: 11.5755 };

describe("normalizeCityInput", () => {
  it("lowercases and trims", () => {
    expect(normalizeCityInput("  Berlin ")).toBe("berlin");
  });
  it("folds umlauts and accents", () => {
    expect(normalizeCityInput("München")).toBe("munchen");
    expect(normalizeCityInput("São Paulo")).toBe("sao paulo");
  });
  it("maps ß to ss", () => {
    expect(normalizeCityInput("Gießen")).toBe("giessen");
  });
});

describe("cityMatchesInput", () => {
  it("matches name ignoring case/diacritics", () => {
    expect(cityMatchesInput(muenchen, "münchen")).toBe(true);
    expect(cityMatchesInput(muenchen, "MUNCHEN")).toBe(true);
  });
  it("matches aliases", () => {
    expect(cityMatchesInput(muenchen, "munich")).toBe(true);
  });
  it("rejects other cities", () => {
    expect(cityMatchesInput(muenchen, "Berlin")).toBe(false);
  });
});

describe("isSameCity", () => {
  it("compares by name and country", () => {
    expect(isSameCity(muenchen, { ...muenchen })).toBe(true);
    expect(isSameCity(muenchen, { ...muenchen, name: "Berlin" })).toBe(false);
  });
});
