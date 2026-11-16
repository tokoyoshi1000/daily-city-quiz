// src/analytics.ts
/**
 * GoatCounter-Anbindung (cookielos, anonym). GOATCOUNTER_ENDPOINT leer heißt:
 * Analytics ist komplett aus — kein Script, track() ist ein No-op.
 * Nach dem Anlegen des GoatCounter-Accounts hier eintragen:
 * "https://<code>.goatcounter.com/count" — und deployen.
 */
const GOATCOUNTER_ENDPOINT = "";

type GoatCounter = { count: (opts: { path: string; event?: boolean }) => void };

let endpoint = GOATCOUNTER_ENDPOINT;

/** Nur für Tests gedacht — Produktion konfiguriert über die Konstante oben. */
export function setAnalyticsEndpoint(url: string): void {
  endpoint = url;
}

export function analyticsEnabled(): boolean {
  return endpoint !== "" && globalThis.navigator?.doNotTrack !== "1";
}

/** Lädt das GoatCounter-Script (zählt den Pageview selbst). Einmal in main.tsx aufrufen. */
export function initAnalytics(): void {
  if (!analyticsEnabled() || typeof document === "undefined") return;
  if (document.querySelector("script[data-goatcounter]")) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = endpoint;
  document.head.appendChild(s);
}

/** Zählt ein benanntes Event. Darf das Spiel niemals stören — Fehler werden geschluckt. */
export function track(event: string): void {
  if (!analyticsEnabled()) return;
  try {
    (globalThis as { goatcounter?: GoatCounter }).goatcounter?.count({ path: event, event: true });
  } catch {
    // Analytics ist nie ein Grund für einen Fehler im Spiel.
  }
}
