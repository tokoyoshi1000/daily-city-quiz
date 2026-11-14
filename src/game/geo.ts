import type { City } from "../types";

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function roundDistanceKm(km: number): number {
  if (km < 100) return Math.max(10, Math.round(km / 10) * 10);
  return Math.round(km / 100) * 100;
}

export function initialBearingDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const phi1 = toRad(aLat);
  const phi2 = toRad(bLat);
  const dLng = toRad(bLng - aLng);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const DIRECTIONS = [
  "nördlich",
  "nordöstlich",
  "östlich",
  "südöstlich",
  "südlich",
  "südwestlich",
  "westlich",
  "nordwestlich",
] as const;

export function direction8(bearingDeg: number): string {
  const normalized = ((bearingDeg % 360) + 360) % 360;
  return DIRECTIONS[Math.round(normalized / 45) % 8];
}

/** Distanz + Richtung von der geratenen Stadt zur gesuchten Stadt. */
export function describeMiss(guess: City, target: City): { distanceKm: number; direction: string } {
  return {
    distanceKm: roundDistanceKm(haversineKm(guess.lat, guess.lng, target.lat, target.lng)),
    direction: direction8(initialBearingDeg(guess.lat, guess.lng, target.lat, target.lng)),
  };
}
