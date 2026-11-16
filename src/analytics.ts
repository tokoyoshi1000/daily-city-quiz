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

/** Events, die vor dem Laden von count.js anfallen, warten hier (begrenzt auf 20). */
const queue: string[] = [];

/** Nur für Tests gedacht — Produktion konfiguriert über die Konstante oben. */
export function setAnalyticsEndpoint(url: string): void {
  endpoint = url;
  queue.length = 0;
}

export function analyticsEnabled(): boolean {
  // DNT in allen verbreiteten Schreibweisen respektieren ("1", "yes", window.doNotTrack).
  const n = globalThis.navigator as (Navigator & { msDoNotTrack?: string }) | undefined;
  const dnt = n?.doNotTrack ?? (globalThis as { doNotTrack?: string }).doNotTrack ?? n?.msDoNotTrack;
  return endpoint !== "" && dnt !== "1" && dnt !== "yes";
}

/** Lädt das GoatCounter-Script (zählt den Pageview selbst). Einmal in main.tsx aufrufen. */
export function initAnalytics(): void {
  if (!analyticsEnabled() || typeof document === "undefined") return;
  if (document.querySelector("script[data-goatcounter]")) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = endpoint;
  s.addEventListener("load", flushQueue);
  document.head.appendChild(s);
}

function goat(): GoatCounter | undefined {
  return (globalThis as { goatcounter?: GoatCounter }).goatcounter;
}

function flushQueue(): void {
  const gc = goat();
  if (!gc) return;
  for (const event of queue.splice(0)) {
    try {
      gc.count({ path: event, event: true });
    } catch {
      // Analytics ist nie ein Grund für einen Fehler im Spiel.
    }
  }
}

/**
 * Zählt ein benanntes Event. Darf das Spiel niemals stören — Fehler werden
 * geschluckt. Solange count.js noch lädt, werden Events gepuffert und beim
 * Laden (oder mit dem nächsten track-Aufruf) nachgereicht.
 */
export function track(event: string): void {
  if (!analyticsEnabled()) return;
  const gc = goat();
  if (!gc) {
    if (queue.length < 20) queue.push(event);
    return;
  }
  flushQueue();
  try {
    gc.count({ path: event, event: true });
  } catch {
    // Analytics ist nie ein Grund für einen Fehler im Spiel.
  }
}
