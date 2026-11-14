import { describe, expect, it } from "vitest";
import { describeMiss, direction8, haversineKm, initialBearingDeg, roundDistanceKm } from "./geo";
import type { City } from "../types";

const berlin: City = { name: "Berlin", aliases: [], country: "Deutschland", lat: 52.52, lng: 13.405 };
const paris: City = { name: "Paris", aliases: [], country: "Frankreich", lat: 48.8566, lng: 2.3522 };
const warschau: City = { name: "Warschau", aliases: ["Warsaw"], country: "Polen", lat: 52.2297, lng: 21.0122 };

describe("haversineKm", () => {
  it("Berlin–Paris ist ca. 878 km", () => {
    const d = haversineKm(berlin.lat, berlin.lng, paris.lat, paris.lng);
    expect(d).toBeGreaterThan(850);
    expect(d).toBeLessThan(910);
  });
  it("identische Punkte ergeben 0", () => {
    expect(haversineKm(52, 13, 52, 13)).toBe(0);
  });
});

describe("roundDistanceKm", () => {
  it("rundet unter 100 km auf 10er, mindestens 10", () => {
    expect(roundDistanceKm(3)).toBe(10);
    expect(roundDistanceKm(87)).toBe(90);
  });
  it("rundet ab 100 km auf 100er", () => {
    expect(roundDistanceKm(877.5)).toBe(900);
    expect(roundDistanceKm(517)).toBe(500);
  });
});

describe("direction8", () => {
  it("mappt Bearings auf 8 deutsche Richtungen", () => {
    expect(direction8(0)).toBe("nördlich");
    expect(direction8(90)).toBe("östlich");
    expect(direction8(180)).toBe("südlich");
    expect(direction8(270)).toBe("westlich");
    expect(direction8(45)).toBe("nordöstlich");
    expect(direction8(350)).toBe("nördlich"); // Rundung über 337,5°
  });
});

describe("initialBearingDeg + describeMiss", () => {
  it("Berlin → Warschau ist östlich", () => {
    const b = initialBearingDeg(berlin.lat, berlin.lng, warschau.lat, warschau.lng);
    expect(direction8(b)).toBe("östlich");
  });
  it("Berlin → Paris: ca. 900 km südwestlich", () => {
    expect(describeMiss(berlin, paris)).toEqual({ distanceKm: 900, direction: "südwestlich" });
  });
});
