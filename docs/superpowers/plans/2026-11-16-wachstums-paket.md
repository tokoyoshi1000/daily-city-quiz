# Wachstums-Paket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Daily City Quiz bekommt eine komplette Wachstums-Schicht: OG-Vorschaubild + echte Icons, nativen Teilen-Dialog mit Bordkarten-Bild (ohne Spoiler), Laufzeit-Datenlader + PWA (installierbar, offlinefähig, Tagesrätsel immer frisch), Install-Hinweis und anonyme GoatCounter-Analytics.

**Architecture:** Spiellogik (Reducer, Scoring, Share-Text, Storage-Keys `dcq:state`/`dcq:stats`) bleibt unangetastet. Neue, kleine Module: `src/analytics.ts` (No-op ohne Endpoint), `src/game/shareMethod.ts` (Methodenwahl), `src/game/shareCard.ts` (Layout pur + Canvas-Rendering), `src/data/loader.ts` (fetch aus `public/data/`), `src/game/install.ts` + `src/game/installPrompt.ts` (Install-Logik). `App.tsx` bekommt einen Ladezustand vor dem Spiel. PWA über `vite-plugin-pwa` (generateSW): Shell precached, `data/*.json` NetworkFirst.

**Tech Stack:** React 19, Vite 7, TypeScript strict, Tailwind CSS 4 (`@theme`-Tokens in `src/index.css`), Vitest 3 (Node-Environment — alle neuen Unit-Tests kommen ohne DOM aus), vite-plugin-pwa, Canvas 2D.

**Branch:** `feature/growth` (existiert bereits, Spec ist dort committet). Direkt in diesem Checkout arbeiten, pro Task committen. Spec: `docs/superpowers/specs/2026-11-15-wachstums-paket-design.md`.

**Wichtige Konventionen:**
- Versalien im DOM nur per CSS `uppercase` — aber Canvas kennt kein CSS: Strings für Canvas-Zeichnung sind ECHT versal ("BORDKARTE", "RÄTSEL 001").
- Design-Tokens: bg `#131519`, board `#0f1113`, cell `#1a1d21`, edge `#24282e`, amber `#ffc83d`, bright `#e8e9eb`, dim `#9aa0a8`, paper `#f7f3e8`, ink `#15171a`; auf Papier: inkSoft `#6b6453`, Stempel hit `#1f7a45` / miss `#c0392b`.
- Commits auf Deutsch, Conventional-Prefix, und jede Commit-Message endet mit `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- `npm test` führt alle Vitest-Suiten aus (aktuell 67 Tests, alle grün — das muss so bleiben).

**Batch-Hinweise für den Orchestrator:** Batch A = Tasks 1–4 (unabhängige Grundmodule), Batch B = Tasks 5–8 (App-Integration), Batch C = Tasks 9–11 (Canvas & Teilen), Batch D = Tasks 12–13 (PWA & Meta). Tasks 14–15 macht der Orchestrator selbst (Browser-Pane nötig). Implementierer: sonnet; Reviews wie gehabt zweistufig; Abschluss-Review: opus.

---

### Task 1: Analytics-Wrapper

**Files:**
- Create: `src/analytics.ts`
- Test: `src/analytics.test.ts`

- [ ] **Step 1: Failing Test schreiben**

```ts
// src/analytics.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsEnabled, setAnalyticsEndpoint, track } from "./analytics";

type GoatGlobal = { goatcounter?: { count: (opts: { path: string; event?: boolean }) => void } };

afterEach(() => {
  setAnalyticsEndpoint("");
  delete (globalThis as GoatGlobal).goatcounter;
  vi.unstubAllGlobals();
});

describe("analytics", () => {
  it("ist ohne Endpoint aus und track ruft nichts auf", () => {
    const count = vi.fn();
    (globalThis as GoatGlobal).goatcounter = { count };
    expect(analyticsEnabled()).toBe(false);
    track("spiel-gestartet");
    expect(count).not.toHaveBeenCalled();
  });

  it("ist mit Endpoint an", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    expect(analyticsEnabled()).toBe(true);
  });

  it("respektiert Do-Not-Track", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    expect(analyticsEnabled()).toBe(false);
  });

  it("reicht Events an goatcounter durch", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    const count = vi.fn();
    (globalThis as GoatGlobal).goatcounter = { count };
    track("geteilt-bild");
    expect(count).toHaveBeenCalledWith({ path: "geteilt-bild", event: true });
  });

  it("schluckt Fehler des goatcounter-Objekts", () => {
    setAnalyticsEndpoint("https://beispiel.goatcounter.com/count");
    (globalThis as GoatGlobal).goatcounter = {
      count: () => {
        throw new Error("kaputt");
      },
    };
    expect(() => track("verloren")).not.toThrow();
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/analytics.test.ts`
Expected: FAIL — "Failed to resolve import ./analytics"

- [ ] **Step 3: Implementierung**

```ts
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
```

- [ ] **Step 4: Tests laufen lassen — müssen grün sein**

Run: `npx vitest run src/analytics.test.ts`
Expected: PASS, 5 Tests. Danach `npm test` — alle Suiten grün.

- [ ] **Step 5: Commit**

```bash
git add src/analytics.ts src/analytics.test.ts
git commit -m "feat(analytics): GoatCounter-Wrapper — aus ohne Endpoint, DNT respektiert"
```

---

### Task 2: Share-Methodenwahl

**Files:**
- Create: `src/game/shareMethod.ts`
- Test: `src/game/shareMethod.test.ts`

- [ ] **Step 1: Failing Test schreiben**

```ts
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
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/shareMethod.test.ts`
Expected: FAIL — "Failed to resolve import ./shareMethod"

- [ ] **Step 3: Implementierung**

```ts
// src/game/shareMethod.ts
export type ShareMethod = "bild" | "text" | "clipboard";

/** Der relevante Ausschnitt aus Navigator — so bleiben die Tests ohne DOM möglich. */
export interface ShareCapabilities {
  share?: (data: { files?: File[]; text?: string }) => Promise<void>;
  canShare?: (data: { files: File[] }) => boolean;
}

/**
 * Entscheidet die beste verfügbare Teilen-Methode. `probeFile` ist eine
 * Mini-PNG-Datei nur für die Fähigkeits-Abfrage (canShare prüft den Typ,
 * nicht den Inhalt) — das echte Bild wird erst gerendert, wenn es gebraucht wird.
 */
export function pickShareMethod(nav: ShareCapabilities, probeFile: File): ShareMethod {
  if (typeof nav.share !== "function") return "clipboard";
  if (typeof nav.canShare === "function" && nav.canShare({ files: [probeFile] })) return "bild";
  return "text";
}

/** PNG-Magic-Bytes für die canShare-Probe. */
export const PNG_PROBE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** true, wenn der Nutzer den nativen Teilen-Dialog selbst geschlossen hat. */
export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}
```

- [ ] **Step 4: Tests laufen lassen — müssen grün sein**

Run: `npx vitest run src/game/shareMethod.test.ts`
Expected: PASS, 6 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/game/shareMethod.ts src/game/shareMethod.test.ts
git commit -m "feat(share): Methodenwahl Bild/Text/Clipboard als pure, getestete Funktion"
```

---

### Task 3: Share-Card-Layout (pur, ohne Canvas)

**Files:**
- Create: `src/game/shareCard.ts` (in diesem Task nur Konstanten, Fonts, Layout — das Canvas-Rendering kommt in Task 9 in DIESELBE Datei)
- Test: `src/game/shareCard.test.ts`

Kontext: `formatBoardDate("2026-11-16")` liefert `"MO 16. NOV"`, `formatPuzzleNumber(2)` liefert `"002"` (beide aus `src/game/format.ts`). `totalPoints(solvedAtHint, quizAnswers)` und `quizPoints(quizAnswers)` kommen aus `src/game/scoring.ts`; Treffer bei Hinweis 3 gibt 4 Stadtpunkte, jede richtige Quizantwort 1 Punkt.

- [ ] **Step 1: Failing Test schreiben**

```ts
// src/game/shareCard.test.ts
import { describe, expect, it } from "vitest";
import { buildShareCardLayout } from "./shareCard";

describe("buildShareCardLayout", () => {
  it("Treffer bei Hinweis 3 mit 2 Quiz-Punkten", () => {
    const l = buildShareCardLayout({
      number: 2,
      date: "2026-11-16",
      solvedAtHint: 3,
      quizAnswers: [true, true, false],
    });
    expect(l.headerRight).toBe("RÄTSEL 002");
    expect(l.dateLabel).toBe("MO 16. NOV");
    expect(l.solved).toBe(true);
    expect(l.stampText).toBe("ANGEKOMMEN");
    expect(l.stampColor).toBe("#1f7a45");
    expect(l.hitStation).toBe(3);
    expect(l.pointsLine).toBe("6 PUNKTE · QUIZ 2/3");
  });

  it("Niederlage ohne Punkte", () => {
    const l = buildShareCardLayout({
      number: 10,
      date: "2026-11-24",
      solvedAtHint: null,
      quizAnswers: [false, false, false],
    });
    expect(l.solved).toBe(false);
    expect(l.stampText).toBe("VERPASST");
    expect(l.stampColor).toBe("#c0392b");
    expect(l.hitStation).toBeNull();
    expect(l.pointsLine).toBe("0 PUNKTE · QUIZ 0/3");
  });

  it("Singular bei genau 1 Punkt", () => {
    const l = buildShareCardLayout({
      number: 5,
      date: "2026-11-19",
      solvedAtHint: null,
      quizAnswers: [true, false, false],
    });
    expect(l.pointsLine).toBe("1 PUNKT · QUIZ 1/3");
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/shareCard.test.ts`
Expected: FAIL — "Failed to resolve import ./shareCard"

- [ ] **Step 3: Implementierung**

```ts
// src/game/shareCard.ts
import { formatBoardDate, formatPuzzleNumber } from "./format";
import { quizPoints, totalPoints } from "./scoring";

/**
 * Farb-Konstanten für Canvas-Zeichnung (Canvas kennt keine CSS-Variablen).
 * Quelle: @theme-Tokens in src/index.css plus Papier-Sonderfarben aus ResultScreen.
 */
export const CARD = {
  bg: "#131519",
  board: "#0f1113",
  cell: "#1a1d21",
  edge: "#24282e",
  amber: "#ffc83d",
  bright: "#e8e9eb",
  dim: "#9aa0a8",
  paper: "#f7f3e8",
  ink: "#15171a",
  inkSoft: "#6b6453",
  hit: "#1f7a45",
  miss: "#c0392b",
} as const;

export function monoFont(px: number): string {
  return `${px}px "B612 Mono", ui-monospace, monospace`;
}

export function displayFont(px: number, weight = 500): string {
  return `${weight} ${px}px "Oswald Variable", Oswald, sans-serif`;
}

export interface ShareCardInput {
  number: number;
  date: string; // YYYY-MM-DD
  solvedAtHint: number | null; // 1..6 oder null
  quizAnswers: boolean[];
}

/**
 * Alles Textliche/Entscheidbare der Bordkarten-Grafik — pur und testbar.
 * WICHTIG (Spoiler-Schutz): Der Stadtname taucht hier bewusst NICHT auf;
 * die Grafik zeigt stattdessen ???-Fallblattzellen.
 */
export interface ShareCardLayout {
  headerRight: string; // "RÄTSEL 002"
  dateLabel: string; // "MO 16. NOV"
  solved: boolean;
  stampText: "ANGEKOMMEN" | "VERPASST";
  stampColor: string;
  hitStation: number | null; // 1..6
  pointsLine: string; // "6 PUNKTE · QUIZ 2/3"
}

export function buildShareCardLayout(input: ShareCardInput): ShareCardLayout {
  const solved = input.solvedAtHint !== null;
  const points = totalPoints(input.solvedAtHint, input.quizAnswers);
  const quiz = quizPoints(input.quizAnswers);
  return {
    headerRight: `RÄTSEL ${formatPuzzleNumber(input.number)}`,
    dateLabel: formatBoardDate(input.date),
    solved,
    stampText: solved ? "ANGEKOMMEN" : "VERPASST",
    stampColor: solved ? CARD.hit : CARD.miss,
    hitStation: input.solvedAtHint,
    pointsLine: `${points} ${points === 1 ? "PUNKT" : "PUNKTE"} · QUIZ ${quiz}/3`,
  };
}
```

- [ ] **Step 4: Tests laufen lassen — müssen grün sein**

Run: `npx vitest run src/game/shareCard.test.ts`
Expected: PASS, 3 Tests.

- [ ] **Step 5: Commit**

```bash
git add src/game/shareCard.ts src/game/shareCard.test.ts
git commit -m "feat(share): Layout der Bordkarten-Grafik — ohne Stadtnamen (Spoiler-Schutz)"
```

---

### Task 4: Laufzeit-Datenlader

**Files:**
- Create: `public/data/puzzles.json`, `public/data/cities.json` (KOPIEN — die Originale in `src/data/` bleiben vorerst liegen, sie werden erst in Task 6 mit dem App-Umbau gelöscht, damit zwischendurch nichts bricht)
- Create: `src/data/loader.ts`
- Test: `src/data/loader.test.ts`

- [ ] **Step 1: JSONs nach public kopieren**

```bash
mkdir -p public/data
cp src/data/puzzles.json public/data/puzzles.json
cp src/data/cities.json public/data/cities.json
```

- [ ] **Step 2: Failing Test schreiben**

Hinweis: In Vitest ist `import.meta.env.BASE_URL` immer `"/"`, deshalb erwarten die Tests `/data/…`-Pfade.

```ts
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
```

- [ ] **Step 3: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/data/loader.test.ts`
Expected: FAIL — "Failed to resolve import ./loader"

- [ ] **Step 4: Implementierung**

```ts
// src/data/loader.ts
import type { City, Puzzle } from "../types";

export interface GameData {
  puzzles: Puzzle[];
  cities: City[];
}

/**
 * Lädt Rätsel und Städte zur Laufzeit aus public/data/ (statt sie ins Bundle
 * zu kompilieren). Die Tiefen-Validierung der Inhalte bleibt Sache von
 * validate.test.ts — hier wird nur die Grobform geprüft, damit ein kaputter
 * Deploy als Störung erscheint statt als weißer Bildschirm.
 */
export async function loadGameData(fetchFn: typeof fetch = fetch): Promise<GameData> {
  const base = import.meta.env.BASE_URL;
  const [pr, cr] = await Promise.all([
    fetchFn(`${base}data/puzzles.json`),
    fetchFn(`${base}data/cities.json`),
  ]);
  if (!pr.ok || !cr.ok) {
    throw new Error(`Datenabruf fehlgeschlagen (${pr.status}/${cr.status})`);
  }
  const pj = (await pr.json()) as { puzzles?: Puzzle[] };
  const cj = (await cr.json()) as City[];
  if (!Array.isArray(pj?.puzzles) || pj.puzzles.length === 0 || typeof pj.puzzles[0]?.date !== "string") {
    throw new Error("puzzles.json hat nicht die erwartete Form");
  }
  if (!Array.isArray(cj) || cj.length === 0 || typeof cj[0]?.name !== "string") {
    throw new Error("cities.json hat nicht die erwartete Form");
  }
  return { puzzles: pj.puzzles, cities: cj };
}
```

- [ ] **Step 5: Tests laufen lassen — müssen grün sein**

Run: `npx vitest run src/data/loader.test.ts`
Expected: PASS, 3 Tests. Danach `npm test` — alle Suiten grün.

- [ ] **Step 6: Commit**

```bash
git add public/data/puzzles.json public/data/cities.json src/data/loader.ts src/data/loader.test.ts
git commit -m "feat(data): Laufzeit-Datenlader aus public/data (Vorbereitung Bundle-Split)"
```

---

### Task 5: Lade- und Störungsanzeige

**Files:**
- Create: `src/components/LoadingScreen.tsx`
- Create: `src/components/ErrorScreen.tsx`

Keine Unit-Tests (reine Darstellungs-Komponenten, Projekt testet Komponenten per E2E). `HostBubble` existiert bereits (`src/components/HostBubble.tsx`, Props: `children`, optional `sig`).

- [ ] **Step 1: LoadingScreen implementieren**

```tsx
// src/components/LoadingScreen.tsx
import { useEffect, useState } from "react";

/** Erscheint erst nach 300 ms — bei schnellem Netz soll nichts aufblitzen. */
export function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-dim">
          Anzeigetafel wird geladen …
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ErrorScreen implementieren**

```tsx
// src/components/ErrorScreen.tsx
import { HostBubble } from "./HostBubble";

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-miss">Signalstörung</p>
      </div>
      <HostBubble>
        Die Anzeigetafel ist gerade nicht erreichbar — vermutlich eine Störung auf der Strecke.
        Bitte versuch es gleich noch einmal.
      </HostBubble>
      <button
        type="button"
        className="block w-full rounded-lg bg-amber py-3 font-display text-base font-medium uppercase tracking-wide text-ink active:scale-95"
        onClick={onRetry}
      >
        Erneut versuchen
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoadingScreen.tsx src/components/ErrorScreen.tsx
git commit -m "feat(ui): Lade- und Störungsanzeige im Transit-Stil"
```

---

### Task 6: App-Umbau — Ladezustand, Daten aus dem Loader, Tracking

**Files:**
- Modify: `src/App.tsx` (komplett ersetzen, Code unten)
- Modify: `src/data/validate.test.ts:2-3` (Importpfade)
- Delete: `src/data/puzzles.json`, `src/data/cities.json`

- [ ] **Step 1: App.tsx komplett ersetzen**

Änderungen gegenüber vorher: JSON-Importe raus, `App` lädt per `loadGameData` (Zustände laden/Störung/bereit), `Ready` übernimmt die bisherige Puzzle-Auswahl, `Game` bekommt `cities` als Prop und bekommt einen Tracking-Effekt für Phasenübergänge (Ref-Guard macht ihn StrictMode- und Reload-sicher: getrackt wird nur ein echter Übergang, nie der Zustand nach einem Reload).

```tsx
// src/App.tsx
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { City, GameState, Puzzle, Stats } from "./types";
import { createGameReducer, createInitialState, type GameAction } from "./game/reducer";
import { localDateString, puzzleForDate } from "./game/dates";
import { applyCompletedGame, effectiveStreak } from "./game/stats";
import { totalPoints } from "./game/scoring";
import { loadGameState, loadStats, saveGameState, saveStats } from "./storage/storage";
import { loadGameData, type GameData } from "./data/loader";
import { track } from "./analytics";
import { EmptyScreen } from "./components/EmptyScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { StartScreen } from "./components/StartScreen";
import { GuessScreen } from "./components/GuessScreen";
import { RevealScreen } from "./components/RevealScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StatsModal } from "./components/StatsModal";
import { BoardHeader } from "./components/BoardHeader";

export default function App() {
  const [data, setData] = useState<GameData | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => {
    setFailed(false);
    loadGameData()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (failed)
    return (
      <Shell>
        <ErrorScreen onRetry={load} />
      </Shell>
    );
  if (!data)
    return (
      <Shell>
        <LoadingScreen />
      </Shell>
    );
  return <Ready data={data} />;
}

function Ready({ data }: { data: GameData }) {
  const today = localDateString();
  const puzzle = puzzleForDate(data.puzzles, today);
  if (!puzzle)
    return (
      <Shell>
        <EmptyScreen />
      </Shell>
    );
  return <Game key={today} puzzle={puzzle} cities={data.cities} today={today} />;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-6">{children}</div>;
}

function Game({ puzzle, cities, today }: { puzzle: Puzzle; cities: City[]; today: string }) {
  const reducer = useMemo(() => createGameReducer(puzzle), [puzzle]);
  const [state, dispatch] = useReducer(reducer, undefined, (): GameState => {
    const saved = loadGameState();
    return saved && saved.puzzleDate === today ? saved : createInitialState(today);
  });
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  // Analytics: nur echte Phasenübergänge zählen. Der Ref-Guard sorgt dafür,
  // dass weder StrictMode-Doppelläufe noch ein Reload mitten im Spiel tracken.
  const prevPhase = useRef(state.phase);
  useEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = state.phase;
    if (was === state.phase) return;
    if (was === "start" && state.phase === "guessing") track("spiel-gestartet");
    if (was === "guessing" && state.phase === "reveal") {
      track(state.solvedAtHint === null ? "verloren" : `geloest-h${state.solvedAtHint}`);
    }
    if (was === "quiz" && state.phase === "result") track("quiz-beendet");
  }, [state.phase, state.solvedAtHint]);

  useEffect(() => {
    if (state.phase !== "result") return;
    setStats((prev) => {
      const next = applyCompletedGame(prev, {
        date: state.puzzleDate,
        solvedAtHint: state.solvedAtHint,
        points: totalPoints(state.solvedAtHint, state.quizAnswers),
      });
      if (next !== prev) saveStats(next);
      return next;
    });
  }, [state.phase, state.puzzleDate, state.solvedAtHint, state.quizAnswers]);

  const send = (action: GameAction) => dispatch(action);

  const revealed =
    state.phase === "reveal" || state.phase === "quiz" || state.phase === "result";

  return (
    <Shell>
      <div className="mb-4">
        <BoardHeader
          puzzle={puzzle}
          streak={effectiveStreak(stats, today)}
          revealed={revealed}
          onShowStats={() => setShowStats(true)}
        />
      </div>

      {state.phase === "start" && (
        <StartScreen puzzle={puzzle} onStart={() => send({ type: "START" })} />
      )}
      {state.phase === "guessing" && (
        <GuessScreen
          puzzle={puzzle}
          state={state}
          cities={cities}
          onGuess={(city) => send({ type: "GUESS", city })}
        />
      )}
      {state.phase === "reveal" && (
        <RevealScreen puzzle={puzzle} state={state} onContinue={() => send({ type: "CONTINUE_TO_QUIZ" })} />
      )}
      {state.phase === "quiz" && (
        <QuizScreen
          key={state.quizIndex}
          puzzle={puzzle}
          state={state}
          onAnswer={(choiceIndex) => send({ type: "ANSWER", choiceIndex })}
          onNext={() => send({ type: "NEXT" })}
        />
      )}
      {state.phase === "result" && (
        <ResultScreen puzzle={puzzle} state={state} stats={stats} onShowStats={() => setShowStats(true)} />
      )}

      {showStats && <StatsModal stats={stats} streak={effectiveStreak(stats, today)} onClose={() => setShowStats(false)} />}
    </Shell>
  );
}
```

- [ ] **Step 2: validate.test.ts auf die public-Pfade umstellen**

In `src/data/validate.test.ts` nur die beiden Importzeilen ändern:

```ts
import citiesJson from "../../public/data/cities.json";
import puzzlesJson from "../../public/data/puzzles.json";
```

- [ ] **Step 3: Alte JSONs löschen**

```bash
git rm src/data/puzzles.json src/data/cities.json
```

- [ ] **Step 4: Tests und Typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: alle Suiten grün (validate.test.ts prüft jetzt die public-Dateien), keine TS-Fehler.

- [ ] **Step 5: Dev-Smoke**

Run: `npm run build`
Expected: Build grün; in der Ausgabe ist das Haupt-JS-Bundle jetzt deutlich kleiner als vorher (~550 kB → grob 150–200 kB), `dist/data/puzzles.json` existiert.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(app): Daten zur Laufzeit laden — Ladezustand, Störungsscreen, Tracking-Übergänge"
```

---

### Task 7: Install-Infrastruktur

**Files:**
- Modify: `src/storage/storage.ts` (zwei Funktionen ergänzen, ans Dateiende)
- Create: `src/game/install.ts`
- Create: `src/game/installPrompt.ts`
- Test: `src/game/install.test.ts`

- [ ] **Step 1: Failing Test schreiben**

```ts
// src/game/install.test.ts
import { describe, expect, it } from "vitest";
import { installMode } from "./install";

const base = { standalone: false, dismissed: false, hasPrompt: false, isIOS: false };

describe("installMode", () => {
  it("none, wenn bereits als App installiert (standalone)", () => {
    expect(installMode({ ...base, standalone: true, hasPrompt: true })).toBe("none");
  });
  it("none, wenn der Hinweis abgewiesen wurde", () => {
    expect(installMode({ ...base, dismissed: true, hasPrompt: true })).toBe("none");
  });
  it("prompt, wenn der Browser einen Install-Prompt hergibt", () => {
    expect(installMode({ ...base, hasPrompt: true })).toBe("prompt");
  });
  it("ios, wenn iOS ohne Prompt", () => {
    expect(installMode({ ...base, isIOS: true })).toBe("ios");
  });
  it("none auf Desktop ohne Prompt", () => {
    expect(installMode(base)).toBe("none");
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/install.test.ts`
Expected: FAIL — "Failed to resolve import ./install"

- [ ] **Step 3: install.ts implementieren**

```ts
// src/game/install.ts
export type InstallMode = "prompt" | "ios" | "none";

/** Entscheidet, ob und wie die Install-Zeile erscheint — pur und testbar. */
export function installMode(opts: {
  standalone: boolean;
  dismissed: boolean;
  hasPrompt: boolean;
  isIOS: boolean;
}): InstallMode {
  if (opts.standalone || opts.dismissed) return "none";
  if (opts.hasPrompt) return "prompt";
  if (opts.isIOS) return "ios";
  return "none";
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/install.test.ts`
Expected: PASS, 5 Tests.

- [ ] **Step 5: Storage-Funktionen ergänzen**

Ans Ende von `src/storage/storage.ts` anfügen (Stil der Datei: defensive try/catch um localStorage):

```ts
const INSTALL_HINT_KEY = "dcq:installHint";

/** true, wenn der Install-Hinweis dauerhaft erledigt ist (abgewiesen oder installiert). */
export function loadInstallHintDone(): boolean {
  try {
    return globalThis.localStorage?.getItem(INSTALL_HINT_KEY) === "done";
  } catch {
    return false;
  }
}

export function saveInstallHintDone(): void {
  try {
    globalThis.localStorage?.setItem(INSTALL_HINT_KEY, "done");
  } catch {
    // Ohne localStorage erscheint der Hinweis eben erneut — unkritisch.
  }
}
```

- [ ] **Step 6: installPrompt.ts implementieren**

```ts
// src/game/installPrompt.ts
import { track } from "../analytics";
import { saveInstallHintDone } from "../storage/storage";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

/** Einmal beim App-Start aufrufen (main.tsx) — fängt den Install-Prompt des Browsers ab. */
export function captureInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    saveInstallHintDone();
    track("installiert");
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}
```

- [ ] **Step 7: Alle Tests und Typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: grün.

- [ ] **Step 8: Commit**

```bash
git add src/game/install.ts src/game/install.test.ts src/game/installPrompt.ts src/storage/storage.ts
git commit -m "feat(install): Install-Logik, Prompt-Capture und dcq:installHint-Key"
```

---

### Task 8: InstallHint-Komponente

**Files:**
- Create: `src/components/InstallHint.tsx`
- Modify: `src/components/ResultScreen.tsx` (Import + Einbindung ganz unten)

- [ ] **Step 1: InstallHint implementieren**

```tsx
// src/components/InstallHint.tsx
import { useState } from "react";
import { installMode } from "../game/install";
import { getInstallPrompt } from "../game/installPrompt";
import { loadInstallHintDone, saveInstallHintDone } from "../storage/storage";

function isStandalone(): boolean {
  return (
    (window.matchMedia?.("(display-mode: standalone)").matches ?? false) ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Dezente Install-Zeile auf dem Ergebnis-Screen — abweisbar, nie ein Popup. */
export function InstallHint() {
  const [hidden, setHidden] = useState(false);
  const prompt = getInstallPrompt();
  const mode = installMode({
    standalone: isStandalone(),
    dismissed: hidden || loadInstallHintDone(),
    hasPrompt: prompt !== null,
    isIOS: isIOS(),
  });
  if (mode === "none") return null;

  const dismiss = () => {
    saveInstallHintDone();
    setHidden(true);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-cell px-3 py-2.5">
      <p className="font-mono text-xs uppercase tracking-wider text-dim">
        {mode === "prompt" ? "Als App aufs Handy?" : "Als App: Teilen-Menü → „Zum Home-Bildschirm“"}
      </p>
      {mode === "prompt" && (
        <button
          type="button"
          className="shrink-0 rounded border border-amber px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-amber"
          onClick={async () => {
            const p = getInstallPrompt();
            if (p) {
              try {
                await p.prompt();
                await p.userChoice;
              } catch {
                // Browser hat den Prompt verweigert — egal, nicht nerven.
              }
            }
            dismiss();
          }}
        >
          Installieren
        </button>
      )}
      <button
        type="button"
        aria-label="Hinweis ausblenden"
        className="shrink-0 px-1 font-mono text-sm text-dim"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
```

- [ ] **Step 2: In ResultScreen einbinden**

In `src/components/ResultScreen.tsx`: oben importieren

```tsx
import { InstallHint } from "./InstallHint";
```

und ganz am Ende des JSX (direkt nach dem `<p>` mit „Nächste Abfahrt in …", noch innerhalb des äußeren `<div className="flex flex-col gap-4 pt-2">`):

```tsx
      <InstallHint />
```

- [ ] **Step 3: Tests und Typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: grün.

- [ ] **Step 4: Commit**

```bash
git add src/components/InstallHint.tsx src/components/ResultScreen.tsx
git commit -m "feat(install): Install-Zeile auf dem Ergebnis-Screen (Android-Prompt, iOS-Hinweis)"
```

---

### Task 9: Canvas-Rendering der Share-Card

**Files:**
- Modify: `src/game/shareCard.ts` (Zeichencode ANS ENDE der Datei aus Task 3 anfügen; Importe oben ergänzen: KEINE nötig — alles da)

Kein Unit-Test (Canvas gibt es im Node-Environment nicht); die Sichtprüfung passiert in Task 11/14 über das Asset-Studio. `ctx.roundRect` ist in allen Zielbrowsern verfügbar (Chrome 99+, Safari 16+, Firefox 112+).

- [ ] **Step 1: Zeichencode anfügen**

```ts
// --- ab hier: Canvas-Rendering (ans Ende von src/game/shareCard.ts) ---

export const CARD_W = 1080;
export const CARD_H = 1350;

/**
 * Lädt die beiden Webfonts explizit für Canvas-Nutzung. document.fonts.ready
 * reicht nicht: @font-face lädt erst bei Benutzung, und Canvas löst das
 * Nachladen nicht selbst aus.
 */
export async function ensureCardFonts(): Promise<void> {
  const fonts = (globalThis as { document?: Document }).document?.fonts;
  if (!fonts?.load) return;
  await Promise.all([
    fonts.load('500 120px "Oswald Variable"'),
    fonts.load('400 40px "B612 Mono"'),
  ]);
}

/** Eine Fallblatt-Zelle: dunkle Kachel, Zeichen in Amber, Teilungslinie darüber. */
export function drawFlapCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ch: string,
  fontPx: number
): void {
  ctx.fillStyle = CARD.cell;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.round(w * 0.08));
  ctx.fill();
  ctx.fillStyle = CARD.amber;
  ctx.font = displayFont(fontPx);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, x + w / 2, y + h / 2 + fontPx * 0.04);
  // Teilungslinie zuletzt — sie liegt wie beim CSS-::after ÜBER dem Zeichen.
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(x, y + h / 2 - h * 0.012, w, Math.max(2, h * 0.024));
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

/** Gedrehter Grenz-Stempel (wie auf der Bordkarte im Spiel). */
export function drawStamp(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  cx: number,
  cy: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.font = monoFont(30);
  const w = ctx.measureText(text).width + 48;
  const h = 64;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

/** Zeichnet die komplette Bordkarten-Grafik auf einen 1080×1350-Kontext. */
export function drawShareCard(ctx: CanvasRenderingContext2D, layout: ShareCardLayout): void {
  const W = CARD_W;
  const H = CARD_H;

  // Dunkler Hintergrund
  ctx.fillStyle = CARD.bg;
  ctx.fillRect(0, 0, W, H);

  // Kopfzeile auf dunklem Grund
  ctx.textBaseline = "top";
  ctx.fillStyle = CARD.amber;
  ctx.font = monoFont(30);
  ctx.fillText("DAILY CITY QUIZ", 70, 72);
  ctx.fillStyle = CARD.dim;
  ctx.textAlign = "right";
  ctx.fillText(layout.headerRight, W - 70, 72);
  ctx.textAlign = "left";

  // Papier-Bordkarte mit seitlichen Kerben
  const px = 70;
  const py = 160;
  const pw = W - 140;
  const ph = 950;
  ctx.fillStyle = CARD.paper;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 28);
  ctx.fill();
  ctx.fillStyle = CARD.bg;
  for (const nx of [px, px + pw]) {
    ctx.beginPath();
    ctx.arc(nx, py + ph / 2, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bordkarten-Kopf
  ctx.fillStyle = CARD.inkSoft;
  ctx.font = monoFont(26);
  ctx.fillText("BORDKARTE", px + 56, py + 56);
  ctx.textAlign = "right";
  ctx.fillText(layout.dateLabel, px + pw - 56, py + 56);
  ctx.textAlign = "left";

  // ZIEL + ???-Fallblattzellen (Spoiler-Schutz: nie der Stadtname)
  ctx.fillText("ZIEL", px + 56, py + 150);
  const cellW = 150;
  const cellH = 210;
  const gap = 18;
  const cellsY = py + 205;
  for (let i = 0; i < 3; i++) {
    drawFlapCell(ctx, px + 56 + i * (cellW + gap), cellsY, cellW, cellH, "?", 120);
  }

  // Stempel rechts neben den Zellen
  drawStamp(ctx, layout.stampText, layout.stampColor, px + pw - 210, cellsY + 70);

  // Metro-Linie mit 6 Stationen
  const lineY = py + 560;
  const lineX0 = px + 80;
  const lineX1 = px + pw - 80;
  ctx.strokeStyle = CARD.inkSoft;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(lineX0, lineY);
  ctx.lineTo(lineX1, lineY);
  ctx.stroke();
  for (let s = 1; s <= 6; s++) {
    const sx = lineX0 + ((s - 1) / 5) * (lineX1 - lineX0);
    const isHit = layout.hitStation === s;
    const passed = layout.hitStation !== null && s < layout.hitStation;
    ctx.beginPath();
    ctx.arc(sx, lineY, isHit ? 22 : 14, 0, Math.PI * 2);
    ctx.fillStyle = isHit || passed ? CARD.amber : CARD.paper;
    ctx.fill();
    ctx.strokeStyle = isHit ? CARD.ink : CARD.inkSoft;
    ctx.lineWidth = isHit ? 6 : 4;
    ctx.stroke();
    ctx.fillStyle = CARD.inkSoft;
    ctx.font = monoFont(24);
    ctx.textAlign = "center";
    ctx.fillText(`H${s}`, sx, lineY + 44);
    ctx.textAlign = "left";
  }

  // Perforation + Punktzeile
  const perfY = py + 730;
  ctx.strokeStyle = "rgba(21, 23, 26, 0.3)";
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(px + 56, perfY);
  ctx.lineTo(px + pw - 56, perfY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = CARD.ink;
  ctx.font = monoFont(40);
  ctx.textAlign = "center";
  ctx.fillText(layout.pointsLine, W / 2, perfY + 70);

  // Fußzeile auf dunklem Grund
  ctx.fillStyle = CARD.dim;
  ctx.font = monoFont(30);
  ctx.fillText("tokoyoshi1000.github.io/daily-city-quiz", W / 2, py + ph + 90);
  ctx.textAlign = "left";
}

/** Rendert die Grafik in ein frisches Canvas und liefert ein PNG-Blob. */
export async function renderShareCard(layout: ShareCardLayout): Promise<Blob> {
  await ensureCardFonts();
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
  drawShareCard(ctx, layout);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG-Export fehlgeschlagen"))),
      "image/png"
    );
  });
}
```

- [ ] **Step 2: Tests und Typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: grün (die Layout-Tests aus Task 3 laufen unverändert).

- [ ] **Step 3: Commit**

```bash
git add src/game/shareCard.ts
git commit -m "feat(share): Canvas-Rendering der Bordkarten-Grafik (1080×1350, PNG-Blob)"
```

---

### Task 10: Teilen-Kette im ResultScreen

**Files:**
- Modify: `src/components/ResultScreen.tsx`

- [ ] **Step 1: Importe und share() ersetzen**

Oben in der Datei die Importe ergänzen (zusätzlich zu den bestehenden; `InstallHint` ist seit Task 8 schon da):

```tsx
import { buildShareCardLayout, renderShareCard } from "../game/shareCard";
import { isAbortError, pickShareMethod, PNG_PROBE } from "../game/shareMethod";
import { formatPuzzleNumber } from "../game/format"; // bereits importiert — nur prüfen
import { track } from "../analytics";
```

Dann die bisherige Funktion `share()` (Clipboard + prompt-Fallback) KOMPLETT durch diese Fassung ersetzen — der State `copied` und alles andere bleibt:

```tsx
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("geteilt-clipboard");
    } catch {
      try {
        window.prompt("Zum Kopieren markieren:", shareText);
      } catch {
        // Umgebung ohne Zwischenablage und prompt(): Der Share-Text steht sichtbar im Screen.
      }
    }
  }

  async function share() {
    const probeFile = new File([PNG_PROBE], "probe.png", { type: "image/png" });
    const method = pickShareMethod(navigator, probeFile);

    if (method === "bild") {
      try {
        const layout = buildShareCardLayout({
          number: puzzle.number,
          date: puzzle.date,
          solvedAtHint: state.solvedAtHint,
          quizAnswers: state.quizAnswers,
        });
        const blob = await renderShareCard(layout);
        const file = new File([blob], `daily-city-quiz-${formatPuzzleNumber(puzzle.number)}.png`, {
          type: "image/png",
        });
        await navigator.share({ files: [file], text: shareText });
        track("geteilt-bild");
        return;
      } catch (e) {
        if (isAbortError(e)) return; // Nutzer hat den Dialog geschlossen — kein Fallback, kein Tracking
      }
    }

    if (method === "bild" || method === "text") {
      try {
        await navigator.share!({ text: shareText });
        track("geteilt-text");
        return;
      } catch (e) {
        if (isAbortError(e)) return;
      }
    }

    await copyToClipboard();
  }
```

- [ ] **Step 2: Tests und Typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: grün.

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultScreen.tsx
git commit -m "feat(share): nativer Teilen-Dialog mit Bordkarten-Bild, Text- und Clipboard-Fallback"
```

---

### Task 11: Asset-Studio (Dev-Seite)

**Files:**
- Create: `asset-studio.html` (Projekt-Root — der Vite-Dev-Server liefert sie unter `/asset-studio.html` aus; `vite build` bündelt nur `index.html`, die Seite landet also NIE im Deploy)
- Create: `src/dev/assetStudio.ts`

- [ ] **Step 1: HTML-Seite anlegen**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>Asset-Studio (nur Dev)</title>
    <style>
      body { background: #131519; color: #e8e9eb; font-family: system-ui, sans-serif; padding: 24px; }
      section { margin-bottom: 40px; }
      canvas { display: block; border: 1px solid #24282e; margin: 8px 0; }
      a { color: #ffc83d; }
      .row { display: flex; gap: 24px; align-items: flex-end; flex-wrap: wrap; }
    </style>
  </head>
  <body>
    <h1>Asset-Studio</h1>
    <p>Nur über den Dev-Server erreichbar — wird nicht gebaut und nicht deployt.</p>
    <section>
      <h2>OG-Bild 1200×630</h2>
      <canvas id="og"></canvas>
      <a id="og-dl">og.png herunterladen</a>
    </section>
    <section>
      <h2>Icons</h2>
      <div class="row">
        <div><canvas id="icon-32"></canvas><a id="icon-32-dl">favicon.png</a></div>
        <div><canvas id="icon-180"></canvas><a id="icon-180-dl">apple-touch-icon.png</a></div>
        <div><canvas id="icon-192"></canvas><a id="icon-192-dl">icon-192.png</a></div>
        <div><canvas id="icon-512"></canvas><a id="icon-512-dl">icon-512.png</a></div>
        <div><canvas id="icon-mask"></canvas><a id="icon-mask-dl">icon-maskable-512.png</a></div>
      </div>
    </section>
    <section>
      <h2>Share-Card (Sieg / Niederlage)</h2>
      <div class="row">
        <canvas id="card-win"></canvas>
        <canvas id="card-lose"></canvas>
      </div>
    </section>
    <script type="module" src="/src/dev/assetStudio.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Zeichen-Script anlegen**

```ts
// src/dev/assetStudio.ts
// Dev-Werkzeug: erzeugt OG-Bild, Icons und Share-Card-Vorschauen.
// Die Fonts müssen hier explizit importiert werden — die Seite nutzt nicht main.tsx.
import "@fontsource-variable/oswald";
import "@fontsource/b612-mono";
import {
  buildShareCardLayout,
  CARD,
  CARD_H,
  CARD_W,
  displayFont,
  drawFlapCell,
  drawShareCard,
  ensureCardFonts,
  monoFont,
} from "../game/shareCard";

function ctx2d(id: string, w: number, h: number, cssWidth?: string): CanvasRenderingContext2D {
  const c = document.getElementById(id) as HTMLCanvasElement;
  c.width = w;
  c.height = h;
  if (cssWidth) c.style.width = cssWidth;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error(`kein 2D-Kontext für #${id}`);
  return ctx;
}

function wireDownload(canvasId: string, linkId: string, filename: string): void {
  const c = document.getElementById(canvasId) as HTMLCanvasElement;
  const a = document.getElementById(linkId) as HTMLAnchorElement;
  a.href = c.toDataURL("image/png");
  a.download = filename;
}

function drawOg(): void {
  const W = 1200;
  const H = 630;
  const ctx = ctx2d("og", W, H, "600px");
  ctx.fillStyle = CARD.bg;
  ctx.fillRect(0, 0, W, H);

  // Board-Panel
  const px = 80;
  const py = 100;
  const pw = W - 160;
  const ph = H - 200;
  ctx.fillStyle = CARD.board;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 24);
  ctx.fill();
  ctx.strokeStyle = CARD.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fallblatt-Zellen "DAILY CITY QUIZ"
  const text = "DAILY CITY QUIZ";
  const cw = 56;
  const chh = 80;
  const gap = 10;
  const space = 26;
  let total = 0;
  for (const ch of text) total += ch === " " ? space : cw + gap;
  total -= gap;
  let x = (W - total) / 2;
  const y = py + 90;
  ctx.textBaseline = "top";
  for (const ch of text) {
    if (ch === " ") {
      x += space;
      continue;
    }
    drawFlapCell(ctx, x, y, cw, chh, ch, 44);
    x += cw + gap;
  }

  // Unterzeile
  ctx.fillStyle = CARD.dim;
  ctx.font = monoFont(26);
  ctx.textAlign = "center";
  ctx.fillText("ERRATE DIE STADT DES TAGES · 6 HINWEISE · JEDEN TAG NEU", W / 2, y + chh + 70);
  ctx.textAlign = "left";
}

/** Icon: Fallblatt-Zelle mit amberfarbenem „D". contentScale < 1 für maskable (Safe-Zone). */
function drawIcon(id: string, size: number, contentScale = 1): void {
  const ctx = ctx2d(id, size, size);
  ctx.fillStyle = CARD.cell;
  ctx.fillRect(0, 0, size, size);
  const s = size * contentScale;
  const off = (size - s) / 2;
  ctx.fillStyle = CARD.amber;
  ctx.font = displayFont(Math.round(s * 0.62));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("D", size / 2, size / 2 + s * 0.03);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(off, size / 2 - Math.max(1, s * 0.012), s, Math.max(2, s * 0.024));
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

async function main(): Promise<void> {
  await ensureCardFonts();
  drawOg();
  drawIcon("icon-32", 32);
  drawIcon("icon-180", 180);
  drawIcon("icon-192", 192);
  drawIcon("icon-512", 512);
  drawIcon("icon-mask", 512, 0.78);

  const win = buildShareCardLayout({
    number: 2,
    date: "2026-11-16",
    solvedAtHint: 3,
    quizAnswers: [true, true, false],
  });
  const lose = buildShareCardLayout({
    number: 2,
    date: "2026-11-16",
    solvedAtHint: null,
    quizAnswers: [true, false, false],
  });
  drawShareCard(ctx2d("card-win", CARD_W, CARD_H, "360px"), win);
  drawShareCard(ctx2d("card-lose", CARD_W, CARD_H, "360px"), lose);

  wireDownload("og", "og-dl", "og.png");
  wireDownload("icon-32", "icon-32-dl", "favicon.png");
  wireDownload("icon-180", "icon-180-dl", "apple-touch-icon.png");
  wireDownload("icon-192", "icon-192-dl", "icon-192.png");
  wireDownload("icon-512", "icon-512-dl", "icon-512.png");
  wireDownload("icon-mask", "icon-mask-dl", "icon-maskable-512.png");
}

void main();
```

- [ ] **Step 3: Typecheck und Build-Isolation prüfen**

Run: `npx tsc --noEmit && npm run build && ls dist/asset-studio.html 2>&1 || echo "OK: nicht im Build"`
Expected: Typecheck grün, Build grün, letzte Zeile „OK: nicht im Build".

- [ ] **Step 4: Commit**

```bash
git add asset-studio.html src/dev/assetStudio.ts
git commit -m "feat(dev): Asset-Studio — erzeugt OG-Bild, Icons und Share-Card-Vorschau"
```

---

### Task 12: PWA — Plugin, Manifest, Service-Worker-Registrierung

**Files:**
- Modify: `package.json` (devDependency)
- Modify: `vite.config.ts` (komplett ersetzen, Code unten)
- Modify: `src/main.tsx` (komplett ersetzen, Code unten)
- Modify: `tsconfig.json` (types-Eintrag)

- [ ] **Step 1: Plugin installieren**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: vite.config.ts ersetzen**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Daily City Quiz",
        short_name: "City Quiz",
        description:
          "Errate jeden Tag eine Stadt — 6 Hinweise, Distanz-Feedback und ein Bonus-Quiz.",
        lang: "de",
        start_url: ".",
        scope: ".",
        display: "standalone",
        background_color: "#131519",
        theme_color: "#131519",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App-Shell precachen; og.png nur fürs Teilen (offline unnötig).
        // data/*.json ist bewusst NICHT im Precache: ein Daily-Game darf nie
        // ein altes Tagesrätsel aus dem Cache festhalten → NetworkFirst unten.
        globPatterns: ["**/*.{js,css,html,woff2,woff,png}"],
        globIgnores: ["og.png"],
        runtimeCaching: [
          {
            urlPattern: /\/data\/.+\.json$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "dcq-data",
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
});
```

- [ ] **Step 3: main.tsx ersetzen**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@fontsource-variable/oswald";
import "@fontsource/b612/400.css";
import "@fontsource/b612/400-italic.css";
import "@fontsource/b612/700.css";
import "@fontsource/b612-mono/400.css";
import "@fontsource/b612-mono/700.css";
import App from "./App";
import "./index.css";
import { initAnalytics } from "./analytics";
import { captureInstallPrompt } from "./game/installPrompt";

registerSW();
captureInstallPrompt();
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: tsconfig.json — types erweitern**

Die Zeile `"types": ["vite/client"]` ändern zu:

```json
    "types": ["vite/client", "vite-plugin-pwa/client"]
```

- [ ] **Step 5: Tests, Typecheck, Build**

Run: `npm test && npm run build && ls dist/sw.js dist/manifest.webmanifest`
Expected: Tests grün, Build grün, `sw.js` und `manifest.webmanifest` existieren in `dist/`. (Die Icon-Dateien existieren noch nicht — das ist für den Build okay, sie kommen in Task 14.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/main.tsx tsconfig.json
git commit -m "feat(pwa): installierbare App-Shell mit autoUpdate, Daten NetworkFirst"
```

---

### Task 13: Meta-Tags und Icon-Links in index.html

**Files:**
- Modify: `index.html` (nur den `<head>`, Code unten — `<body>` bleibt)

- [ ] **Step 1: Head ersetzen**

Der komplette neue `<head>` (ersetzt den bestehenden; Änderungen: `og:image`-Block, Twitter-Card, echte Icon-Links statt Emoji-SVG):

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Daily City Quiz</title>
    <meta
      name="description"
      content="Errate jeden Tag eine Stadt irgendwo auf der Welt — 6 Hinweise, Distanz-Feedback und ein Bonus-Quiz mit Marco, deinem Weltenbummler-Host."
    />
    <meta name="theme-color" content="#131519" />
    <meta property="og:title" content="Daily City Quiz" />
    <meta
      property="og:description"
      content="Errate die Stadt des Tages! 6 Hinweise, Distanz-Feedback, Bonus-Quiz — jeden Tag ein neues Rätsel."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://tokoyoshi1000.github.io/daily-city-quiz/" />
    <meta property="og:image" content="https://tokoyoshi1000.github.io/daily-city-quiz/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="favicon.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  </head>
```

Hinweis: Die Icon-`href`s sind bewusst relativ (ohne führenden `/`), damit sie sowohl im Dev-Server (`/`) als auch auf Pages (`/daily-city-quiz/`) auflösen.

- [ ] **Step 2: Typecheck/Build**

Run: `npm run build`
Expected: grün.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(meta): OG-Vorschaubild, Twitter-Card und echte Icon-Links"
```

---

### Task 14 [ORCHESTRATOR — nicht an Subagent geben]: Assets erzeugen und einchecken

Braucht das Browser-Pane. Ablauf:

- [ ] Dev-Server starten (`.claude/launch.json`, Name `daily-city-quiz`), `http://localhost:5173/asset-studio.html` öffnen.
- [ ] Sichtprüfung: OG-Bild, 5 Icons, beide Share-Card-Varianten (Sieg: Station H3 markiert, Stempel grün ANGEKOMMEN gedreht, keine Doppel-Rotation; Niederlage: Stempel rot VERPASST, keine Station gefüllt; Teilungslinie ÜBER dem ?; Fonts Oswald/B612 Mono sichtbar — nicht Times/Arial!). Bei Layout-Problemen (Überlappung, Abschnitt) Koordinaten in `shareCard.ts`/`assetStudio.ts` nachziehen, committen, neu prüfen.
- [ ] Export per `javascript_tool`: je Canvas `document.getElementById("og").toDataURL("image/png")` auslesen, Base64 per Bash in `public/og.png`, `public/favicon.png`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` dekodieren (`base64 -d`). Dateigrößen plausibel (> 1 kB, og < 200 kB).
- [ ] Verifizieren: `file public/*.png` → alle „PNG image data" mit korrekten Maßen.
- [ ] Commit: `feat(assets): OG-Bild und Icon-Set aus dem Asset-Studio`

### Task 15 [ORCHESTRATOR]: E2E, Build-Check, finale Review

- [ ] `npm test` — alle Suiten grün (67 alte + 22 neue = 89 erwartet).
- [ ] `npm run build -- --base=/daily-city-quiz/` — grün; `dist/` enthält `sw.js`, `manifest.webmanifest`, `data/*.json`, `og.png`, Icons; Haupt-Bundle deutlich unter 250 kB.
- [ ] E2E im Browser-Pane (localStorage vorher leeren): Komplett-Durchlauf (Start → Raten → Reveal → Quiz → Ergebnis), Reload-Idempotenz, InstallHint sichtbar/abweisbar auf dem Ergebnis-Screen, Teilen-Klick (im Desktop-Pane greift die Clipboard-Stufe — „Kopiert!"), Lade-/Störungszustand (Dev-Server kurz stoppen bzw. Offline simulieren → Störungs-Screen mit Retry), Mobile 375 px.
- [ ] `vite preview` mit Build: SW registriert sich, Manifest wird geladen (DevTools-check per JS: `navigator.serviceWorker.getRegistrations()`).
- [ ] Finale Whole-Branch-Review (opus): Spec-Abgleich, geschützte Pfade (Reducer/Scoring/Share-Text/Storage-Keys unverändert), SW-Cache-Strategie, A11y der neuen Screens.
- [ ] Danach: finishing-a-development-branch (Merge erst nach User-Freigabe — Push auf main deployt live!).
