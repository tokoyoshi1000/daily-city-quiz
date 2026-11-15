# Daily City Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tägliches Städte-Rätsel als statische Web-App: 6 progressive Hinweise mit Distanz-Feedback (Akt 1), 3-Fragen-Bonus-Quiz mit Countdown (Akt 2), Host „Marco", Share-Text und lokale Streak-Statistik — gemäß Spec `docs/superpowers/specs/2026-11-14-daily-city-quiz-design.md`.

**Architecture:** Reine React-SPA (Vite, TypeScript, Tailwind v4), kein Backend. Sämtliche Spiellogik liegt frameworkfrei und vollständig getestet in `src/game/`; React-Komponenten in `src/components/` sind dünne Darstellungsschichten über einem `useReducer`-State. Content liegt vorgeneriert in `src/data/puzzles.json` (90 Rätsel ab 2026-11-14) und `src/data/cities.json` (~400 Städte); ein Daten-Validierungstest erzwingt alle Qualitätsregeln aus Spec §7.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9 (strict), Tailwind CSS 4 (`@tailwindcss/vite`), Vitest 3. Keine weiteren Laufzeit-Dependencies.

---

## Dateistruktur (Ziel)

```
package.json, tsconfig.json, vite.config.ts, index.html
src/
  main.tsx               # React-Bootstrap
  App.tsx                # Rätsel-Lookup, Game-Komponente (Reducer + Persistenz + Phase-Routing)
  index.css              # Tailwind-Import + Theme-Tokens (dunkles "Abendshow"-Theme)
  types.ts               # Alle geteilten Typen (City, Puzzle, GameState, Stats, …)
  game/
    normalize.ts(.test)  # Eingabe-Normalisierung, City-Matching
    geo.ts(.test)        # Haversine, Bearing, 8 Himmelsrichtungen, Distanz-Rundung
    scoring.ts(.test)    # Punkte Akt 1 + Quiz
    dates.ts(.test)      # lokales Datum, Vortag, Rätselauswahl nach Datum
    stats.ts(.test)      # Streak-/Statistik-Fortschreibung (idempotent)
    share.ts(.test)      # Share-Text
    reducer.ts(.test)    # Spielzustands-Maschine (beide Akte)
  storage/
    storage.ts(.test)    # localStorage-Zugriff, komplett in try/catch
  data/
    cities.json          # ~400 Städte (Rateliste)
    puzzles.json         # 90 Tagesrätsel ab 2026-11-14
    validate.test.ts     # Datenintegritäts-Tests (Spec §7)
  components/
    HostBubble.tsx       # Marco-Sprechblase
    StartScreen.tsx
    GuessScreen.tsx      # Hinweiskarten, Versuchs-Slots, Distanz-Feedback
    CityAutocomplete.tsx
    RevealScreen.tsx
    QuizScreen.tsx       # 10s-Countdown
    ResultScreen.tsx     # Punkte, Share, Mitternachts-Countdown
    StatsModal.tsx
    EmptyScreen.tsx      # "Vorrat leer"-Hinweis
```

Alle Pfade sind relativ zum Repo-Root `/Users/alex.koberstein/Desktop/Vibe Projects/ClaudeCode_DailyCityQuiz`.

---

### Task 1: Projekt-Grundgerüst

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: `package.json` anlegen**

```json
{
  "name": "daily-city-quiz",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "~5.9.0",
    "vite": "^7.0.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: `tsconfig.json` anlegen**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: `vite.config.ts` anlegen**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 4: `index.html` anlegen**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Daily City Quiz</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: `src/index.css`, `src/main.tsx`, `src/App.tsx` anlegen**

`src/index.css` (Theme-Tokens kommen in Task 12, vorerst minimal):

```css
@import "tailwindcss";
```

`src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`src/App.tsx` (Platzhalter, wird in Task 12 ersetzt):

```tsx
export default function App() {
  return <h1 className="p-4 text-2xl font-bold">🌍 Daily City Quiz</h1>;
}
```

- [ ] **Step 6: Installieren und bauen**

Run: `npm install && npm run build`
Expected: Installation ohne Fehler, `vite build` erzeugt `dist/` ohne Fehler.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript + Tailwind project"
```

---

### Task 2: Geteilte Typen

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: `src/types.ts` anlegen**

```ts
export interface City {
  name: string;
  aliases: string[];
  country: string;
  lat: number;
  lng: number;
}

export interface QuizQuestion {
  question: string;
  choices: string[]; // genau 4 (per Datentest erzwungen)
  answerIndex: number; // 0..3
  hostCorrect: string;
  hostWrong: string;
}

export interface PuzzleHost {
  intro: string;
  wrongGuess: string[]; // mind. 5
  winEarly: string; // gelöst nach Hinweis 1–2
  winMid: string; // 3–4
  winLate: string; // 5–6
  lose: string;
  reveal: string; // Auflösungs-Anekdote
}

export interface Puzzle {
  number: number;
  date: string; // YYYY-MM-DD, lokales Datum
  city: City;
  hints: string[]; // genau 6, Reihenfolge: Klima, Kulinarik, Geschichte, Zahlen, Persönlichkeit, Wahrzeichen
  quiz: QuizQuestion[]; // genau 3
  host: PuzzleHost;
}

export interface GuessRecord {
  cityName: string;
  country: string;
  distanceKm: number; // gerundet, 0 bei Treffer
  direction: string; // z. B. "südwestlich", "" bei Treffer
  correct: boolean;
}

export type GamePhase = "start" | "guessing" | "reveal" | "quiz" | "result";

export interface GameState {
  puzzleDate: string;
  phase: GamePhase;
  hintsRevealed: number; // 0 vor Start, 1..6 während Akt 1
  guesses: GuessRecord[];
  solvedAtHint: number | null; // 1..6 oder null (nicht/noch nicht gelöst)
  quizIndex: number; // 0..2
  quizAnswers: boolean[]; // Korrektheit der bisher beantworteten Fragen
}

export interface Stats {
  played: number;
  solved: number;
  solvedByHint: number[]; // Länge 6, Index 0 = gelöst nach Hinweis 1
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null; // Datum des letzten abgeschlossenen Rätsels
  totalPoints: number;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared domain types"
```

---

### Task 3: Eingabe-Normalisierung (`src/game/normalize.ts`)

**Files:**
- Create: `src/game/normalize.ts`
- Test: `src/game/normalize.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/normalize.test.ts`)

```ts
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
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/normalize.test.ts`
Expected: FAIL (Modul `./normalize` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/normalize.ts`)

```ts
import type { City } from "../types";

export function normalizeCityInput(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function cityMatchesInput(city: City, input: string): boolean {
  const n = normalizeCityInput(input);
  return [city.name, ...city.aliases].some((a) => normalizeCityInput(a) === n);
}

export function isSameCity(a: City, b: City): boolean {
  return a.name === b.name && a.country === b.country;
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/normalize.test.ts`
Expected: PASS (alle Tests).

- [ ] **Step 5: Commit**

```bash
git add src/game/normalize.ts src/game/normalize.test.ts
git commit -m "feat: add city input normalization and matching"
```

---

### Task 4: Geografie (`src/game/geo.ts`)

**Files:**
- Create: `src/game/geo.ts`
- Test: `src/game/geo.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/geo.test.ts`)

```ts
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
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/geo.test.ts`
Expected: FAIL (Modul `./geo` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/geo.ts`)

```ts
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
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/geo.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/geo.ts src/game/geo.test.ts
git commit -m "feat: add haversine distance, bearing and direction feedback"
```

---

### Task 5: Punktevergabe (`src/game/scoring.ts`)

**Files:**
- Create: `src/game/scoring.ts`
- Test: `src/game/scoring.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/scoring.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { actOnePoints, quizPoints, totalPoints } from "./scoring";

describe("actOnePoints", () => {
  it("Hinweis 1 → 6 Punkte, Hinweis 6 → 1 Punkt", () => {
    expect(actOnePoints(1)).toBe(6);
    expect(actOnePoints(4)).toBe(3);
    expect(actOnePoints(6)).toBe(1);
  });
  it("nicht gelöst → 0 Punkte", () => {
    expect(actOnePoints(null)).toBe(0);
  });
});

describe("quizPoints", () => {
  it("zählt richtige Antworten", () => {
    expect(quizPoints([true, false, true])).toBe(2);
    expect(quizPoints([])).toBe(0);
  });
});

describe("totalPoints", () => {
  it("summiert beide Akte (max 9)", () => {
    expect(totalPoints(1, [true, true, true])).toBe(9);
    expect(totalPoints(null, [false, true, false])).toBe(1);
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/scoring.test.ts`
Expected: FAIL (Modul `./scoring` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/scoring.ts`)

```ts
export function actOnePoints(solvedAtHint: number | null): number {
  return solvedAtHint === null ? 0 : 7 - solvedAtHint;
}

export function quizPoints(quizAnswers: boolean[]): number {
  return quizAnswers.filter(Boolean).length;
}

export function totalPoints(solvedAtHint: number | null, quizAnswers: boolean[]): number {
  return actOnePoints(solvedAtHint) + quizPoints(quizAnswers);
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/scoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/scoring.ts src/game/scoring.test.ts
git commit -m "feat: add scoring for guess act and bonus quiz"
```

---

### Task 6: Datum & Rätselauswahl (`src/game/dates.ts`)

**Files:**
- Create: `src/game/dates.ts`
- Test: `src/game/dates.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/dates.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { localDateString, previousDateString, puzzleForDate } from "./dates";
import type { Puzzle } from "../types";

function stubPuzzle(date: string): Puzzle {
  return {
    number: 1,
    date,
    city: { name: "X", aliases: [], country: "Y", lat: 0, lng: 0 },
    hints: ["a", "b", "c", "d", "e", "f"],
    quiz: [],
    host: { intro: "", wrongGuess: [], winEarly: "", winMid: "", winLate: "", lose: "", reveal: "" },
  };
}

describe("localDateString", () => {
  it("formatiert als YYYY-MM-DD mit führenden Nullen", () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateString(new Date(2026, 10, 14))).toBe("2026-11-14");
  });
});

describe("previousDateString", () => {
  it("liefert den Vortag, auch über Monats- und Jahresgrenzen", () => {
    expect(previousDateString("2026-11-14")).toBe("2026-11-13");
    expect(previousDateString("2026-03-01")).toBe("2026-02-28");
    expect(previousDateString("2026-01-01")).toBe("2025-12-31");
  });
});

describe("puzzleForDate", () => {
  it("findet das Rätsel zum Datum", () => {
    const puzzles = [stubPuzzle("2026-11-14"), stubPuzzle("2026-11-15")];
    expect(puzzleForDate(puzzles, "2026-11-15")?.date).toBe("2026-11-15");
  });
  it("liefert undefined, wenn kein Rätsel existiert", () => {
    expect(puzzleForDate([stubPuzzle("2026-11-14")], "2030-01-01")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/dates.test.ts`
Expected: FAIL (Modul `./dates` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/dates.ts`)

```ts
import type { Puzzle } from "../types";

/** Lokales Gerätedatum als YYYY-MM-DD (bewusst NICHT UTC — Spielerzeit zählt). */
export function localDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Vortag eines YYYY-MM-DD-Strings (Rechnung in UTC, damit keine DST-Effekte). */
export function previousDateString(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function puzzleForDate(puzzles: Puzzle[], date: string): Puzzle | undefined {
  return puzzles.find((p) => p.date === date);
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/dates.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/dates.ts src/game/dates.test.ts
git commit -m "feat: add local date helpers and puzzle-for-date lookup"
```

---

### Task 7: Statistik & Streak (`src/game/stats.ts`)

**Files:**
- Create: `src/game/stats.ts`
- Test: `src/game/stats.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/stats.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { applyCompletedGame, emptyStats } from "./stats";

describe("emptyStats", () => {
  it("startet bei null", () => {
    expect(emptyStats()).toEqual({
      played: 0,
      solved: 0,
      solvedByHint: [0, 0, 0, 0, 0, 0],
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedDate: null,
      totalPoints: 0,
    });
  });
});

describe("applyCompletedGame", () => {
  it("erster Spieltag startet Streak bei 1", () => {
    const s = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    expect(s.played).toBe(1);
    expect(s.solved).toBe(1);
    expect(s.solvedByHint[2]).toBe(1);
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(1);
    expect(s.totalPoints).toBe(7);
    expect(s.lastPlayedDate).toBe("2026-11-14");
  });

  it("Folgetag erhöht Streak, auch bei verlorenem Rätsel (Streak = gespielt, nicht gewonnen)", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    const day2 = applyCompletedGame(day1, { date: "2026-11-15", solvedAtHint: null, points: 2 });
    expect(day2.currentStreak).toBe(2);
    expect(day2.solved).toBe(1);
    expect(day2.solvedByHint).toEqual([0, 0, 1, 0, 0, 0]);
  });

  it("verpasster Tag setzt Streak auf 1 zurück, maxStreak bleibt", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 1, points: 9 });
    const day2 = applyCompletedGame(day1, { date: "2026-11-15", solvedAtHint: 2, points: 8 });
    const later = applyCompletedGame(day2, { date: "2026-11-18", solvedAtHint: 2, points: 8 });
    expect(later.currentStreak).toBe(1);
    expect(later.maxStreak).toBe(2);
  });

  it("ist idempotent für denselben Tag (Reload auf Result-Screen)", () => {
    const day1 = applyCompletedGame(emptyStats(), { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    const again = applyCompletedGame(day1, { date: "2026-11-14", solvedAtHint: 3, points: 7 });
    expect(again).toBe(day1); // identische Referenz → keine Doppelzählung
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/stats.test.ts`
Expected: FAIL (Modul `./stats` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/stats.ts`)

```ts
import type { Stats } from "../types";
import { previousDateString } from "./dates";

export function emptyStats(): Stats {
  return {
    played: 0,
    solved: 0,
    solvedByHint: [0, 0, 0, 0, 0, 0],
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: null,
    totalPoints: 0,
  };
}

export interface CompletedGame {
  date: string;
  solvedAtHint: number | null;
  points: number;
}

/** Schreibt ein abgeschlossenes Tagesrätsel fort. Idempotent: derselbe Tag wird nie doppelt gezählt. */
export function applyCompletedGame(stats: Stats, game: CompletedGame): Stats {
  if (stats.lastPlayedDate === game.date) return stats;
  const continuesStreak = stats.lastPlayedDate === previousDateString(game.date);
  const currentStreak = continuesStreak ? stats.currentStreak + 1 : 1;
  const solvedByHint = [...stats.solvedByHint];
  if (game.solvedAtHint !== null) solvedByHint[game.solvedAtHint - 1] += 1;
  return {
    played: stats.played + 1,
    solved: stats.solved + (game.solvedAtHint !== null ? 1 : 0),
    solvedByHint,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastPlayedDate: game.date,
    totalPoints: stats.totalPoints + game.points,
  };
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/stats.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/stats.ts src/game/stats.test.ts
git commit -m "feat: add stats and streak tracking"
```

---

### Task 8: Share-Text (`src/game/share.ts`)

**Files:**
- Create: `src/game/share.ts`
- Test: `src/game/share.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/share.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { buildShareText } from "./share";

describe("buildShareText", () => {
  it("gelöst nach Hinweis 4", () => {
    expect(buildShareText({ number: 42, solvedAtHint: 4, quizCorrect: 2, streak: 7 })).toBe(
      "🌍 Daily City Quiz #42\n🏙️ ✖️✖️✖️✅ 4/6 · 🧠 2/3 · 🔥 7"
    );
  });
  it("gelöst nach Hinweis 1", () => {
    expect(buildShareText({ number: 1, solvedAtHint: 1, quizCorrect: 3, streak: 1 })).toBe(
      "🌍 Daily City Quiz #1\n🏙️ ✅ 1/6 · 🧠 3/3 · 🔥 1"
    );
  });
  it("nicht gelöst", () => {
    expect(buildShareText({ number: 9, solvedAtHint: null, quizCorrect: 0, streak: 2 })).toBe(
      "🌍 Daily City Quiz #9\n🏙️ ✖️✖️✖️✖️✖️✖️ X/6 · 🧠 0/3 · 🔥 2"
    );
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/share.test.ts`
Expected: FAIL (Modul `./share` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/share.ts`)

```ts
export interface ShareInput {
  number: number;
  solvedAtHint: number | null;
  quizCorrect: number;
  streak: number;
}

export function buildShareText(input: ShareInput): string {
  const solved = input.solvedAtHint !== null;
  const grid = solved
    ? "✖️".repeat(input.solvedAtHint! - 1) + "✅"
    : "✖️".repeat(6);
  const act1 = solved ? `${input.solvedAtHint}/6` : "X/6";
  return `🌍 Daily City Quiz #${input.number}\n🏙️ ${grid} ${act1} · 🧠 ${input.quizCorrect}/3 · 🔥 ${input.streak}`;
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/share.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/share.ts src/game/share.test.ts
git commit -m "feat: add spoiler-free share text"
```

---

### Task 9: Spielzustands-Maschine (`src/game/reducer.ts`)

**Files:**
- Create: `src/game/reducer.ts`
- Test: `src/game/reducer.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/game/reducer.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { createGameReducer, createInitialState } from "./reducer";
import type { City, Puzzle } from "../types";

const lissabon: City = { name: "Lissabon", aliases: ["Lisbon"], country: "Portugal", lat: 38.7223, lng: -9.1393 };
const warschau: City = { name: "Warschau", aliases: ["Warsaw"], country: "Polen", lat: 52.2297, lng: 21.0122 };

const puzzle: Puzzle = {
  number: 1,
  date: "2026-11-14",
  city: lissabon,
  hints: ["h1", "h2", "h3", "h4", "h5", "h6"],
  quiz: [
    { question: "q1", choices: ["a", "b", "c", "d"], answerIndex: 0, hostCorrect: "", hostWrong: "" },
    { question: "q2", choices: ["a", "b", "c", "d"], answerIndex: 1, hostCorrect: "", hostWrong: "" },
    { question: "q3", choices: ["a", "b", "c", "d"], answerIndex: 2, hostCorrect: "", hostWrong: "" },
  ],
  host: { intro: "", wrongGuess: ["w1", "w2", "w3", "w4", "w5"], winEarly: "", winMid: "", winLate: "", lose: "", reveal: "" },
};

const reduce = createGameReducer(puzzle);

describe("Akt 1", () => {
  it("START deckt den ersten Hinweis auf", () => {
    const s = reduce(createInitialState("2026-11-14"), { type: "START" });
    expect(s.phase).toBe("guessing");
    expect(s.hintsRevealed).toBe(1);
  });

  it("falscher Versuch: Distanz-Feedback + nächster Hinweis", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: warschau });
    expect(s.phase).toBe("guessing");
    expect(s.hintsRevealed).toBe(2);
    expect(s.guesses).toHaveLength(1);
    expect(s.guesses[0].correct).toBe(false);
    expect(s.guesses[0].cityName).toBe("Warschau");
    expect(s.guesses[0].distanceKm).toBeGreaterThan(0);
    expect(s.guesses[0].direction).toBe("westlich");
  });

  it("richtiger Versuch löst und merkt sich die Hinweis-Nummer", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: warschau });
    s = reduce(s, { type: "GUESS", city: lissabon });
    expect(s.phase).toBe("reveal");
    expect(s.solvedAtHint).toBe(2);
    expect(s.guesses[1].correct).toBe(true);
  });

  it("sechster Fehlversuch beendet Akt 1 ungelöst", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    for (let i = 0; i < 6; i++) s = reduce(s, { type: "GUESS", city: warschau });
    expect(s.phase).toBe("reveal");
    expect(s.solvedAtHint).toBeNull();
    expect(s.guesses).toHaveLength(6);
  });

  it("GUESS außerhalb von Akt 1 wird ignoriert", () => {
    const start = createInitialState("2026-11-14");
    expect(reduce(start, { type: "GUESS", city: warschau })).toBe(start);
  });
});

describe("Akt 2", () => {
  function reachQuiz() {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: lissabon });
    return reduce(s, { type: "CONTINUE_TO_QUIZ" });
  }

  it("CONTINUE_TO_QUIZ wechselt in die Quiz-Phase", () => {
    expect(reachQuiz().phase).toBe("quiz");
  });

  it("ANSWER bewertet die Antwort, Timeout (null) zählt falsch", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 }); // richtig
    expect(s.quizAnswers).toEqual([true]);
    s = reduce(s, { type: "NEXT" });
    expect(s.quizIndex).toBe(1);
    s = reduce(s, { type: "ANSWER", choiceIndex: null }); // Timeout
    expect(s.quizAnswers).toEqual([true, false]);
  });

  it("doppeltes ANSWER für dieselbe Frage wird ignoriert", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 });
    const again = reduce(s, { type: "ANSWER", choiceIndex: 3 });
    expect(again).toBe(s);
  });

  it("nach der dritten Frage führt NEXT zum Ergebnis", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 });
    s = reduce(s, { type: "NEXT" });
    s = reduce(s, { type: "ANSWER", choiceIndex: 1 });
    s = reduce(s, { type: "NEXT" });
    s = reduce(s, { type: "ANSWER", choiceIndex: 3 });
    s = reduce(s, { type: "NEXT" });
    expect(s.phase).toBe("result");
    expect(s.quizAnswers).toEqual([true, true, false]);
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/game/reducer.test.ts`
Expected: FAIL (Modul `./reducer` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/game/reducer.ts`)

```ts
import type { City, GameState, Puzzle } from "../types";
import { describeMiss } from "./geo";
import { isSameCity } from "./normalize";

export type GameAction =
  | { type: "START" }
  | { type: "GUESS"; city: City }
  | { type: "CONTINUE_TO_QUIZ" }
  | { type: "ANSWER"; choiceIndex: number | null }
  | { type: "NEXT" };

export function createInitialState(puzzleDate: string): GameState {
  return {
    puzzleDate,
    phase: "start",
    hintsRevealed: 0,
    guesses: [],
    solvedAtHint: null,
    quizIndex: 0,
    quizAnswers: [],
  };
}

export function createGameReducer(puzzle: Puzzle) {
  return function reduce(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case "START": {
        if (state.phase !== "start") return state;
        return { ...state, phase: "guessing", hintsRevealed: 1 };
      }
      case "GUESS": {
        if (state.phase !== "guessing") return state;
        if (state.guesses.some((g) => g.cityName === action.city.name && g.country === action.city.country)) return state; // doppelter Tipp kostet keinen Hinweis
        if (isSameCity(action.city, puzzle.city)) {
          const guesses = [...state.guesses, { cityName: action.city.name, country: action.city.country, distanceKm: 0, direction: "", correct: true }];
          return { ...state, guesses, solvedAtHint: state.hintsRevealed, phase: "reveal" };
        }
        const miss = describeMiss(action.city, puzzle.city);
        const guesses = [...state.guesses, { cityName: action.city.name, country: action.city.country, ...miss, correct: false }];
        if (state.hintsRevealed >= 6) return { ...state, guesses, phase: "reveal" };
        return { ...state, guesses, hintsRevealed: state.hintsRevealed + 1 };
      }
      case "CONTINUE_TO_QUIZ": {
        if (state.phase !== "reveal") return state;
        return { ...state, phase: "quiz" };
      }
      case "ANSWER": {
        if (state.phase !== "quiz") return state;
        if (state.quizIndex >= puzzle.quiz.length) return state; // defekter/manipulierter Zustand
        if (state.quizAnswers.length > state.quizIndex) return state; // Frage schon beantwortet
        const correct = action.choiceIndex === puzzle.quiz[state.quizIndex].answerIndex;
        return { ...state, quizAnswers: [...state.quizAnswers, correct] };
      }
      case "NEXT": {
        if (state.phase !== "quiz") return state;
        if (state.quizAnswers.length <= state.quizIndex) return state; // noch keine Antwort
        if (state.quizAnswers.length >= puzzle.quiz.length) return { ...state, phase: "result" };
        return { ...state, quizIndex: state.quizIndex + 1 };
      }
      default:
        return state;
    }
  };
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/game/reducer.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/reducer.ts src/game/reducer.test.ts
git commit -m "feat: add game state machine for both acts"
```

**Härtung (aus Code-Review, als Folge-Commit):** `GuessRecord` trägt zusätzlich `country`; der Reducer ignoriert doppelte Tipps derselben Stadt (Name+Land), prüft `quizIndex`/`quizAnswers` gegen `puzzle.quiz.length` statt hartkodierter 3, und hat einen `default`-Zweig. `reducer.test.ts` deckt zusätzlich ab: doppelter Tipp, START im laufenden Spiel, NEXT ohne Antwort, Treffer bei Hinweis 6 (sechs verschiedene Städte für den Verlust-Test), ANSWER bei defektem `quizIndex`.

---

### Task 10: Persistenz (`src/storage/storage.ts`)

**Files:**
- Create: `src/storage/storage.ts`
- Test: `src/storage/storage.test.ts`

- [ ] **Step 1: Failing Test schreiben** (`src/storage/storage.test.ts`)

```ts
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
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/storage/storage.test.ts`
Expected: FAIL (Modul `./storage` existiert nicht).

- [ ] **Step 3: Implementieren** (`src/storage/storage.ts`)

```ts
import type { GameState, Stats } from "../types";
import { emptyStats } from "../game/stats";

const STATE_KEY = "dcq:state";
const STATS_KEY = "dcq:stats";

function readJson<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    // Privatmodus o. Ä. — Spiel läuft ohne Persistenz weiter (Spec §6)
  }
}

const PHASES = ["start", "guessing", "reveal", "quiz", "result"] as const;

/** Grobe Formprüfung, damit manipulierte/veraltete Spielstände das Spiel nicht crashen. */
function isPlausibleGameState(s: unknown): s is GameState {
  if (typeof s !== "object" || s === null) return false;
  const g = s as Record<string, unknown>;
  return (
    typeof g.puzzleDate === "string" &&
    typeof g.hintsRevealed === "number" && g.hintsRevealed >= 0 && g.hintsRevealed <= 6 &&
    typeof g.quizIndex === "number" && g.quizIndex >= 0 && g.quizIndex <= 2 &&
    Array.isArray(g.guesses) && g.guesses.length <= 6 &&
    Array.isArray(g.quizAnswers) && g.quizAnswers.length <= 3 &&
    (g.solvedAtHint === null ||
      (typeof g.solvedAtHint === "number" && g.solvedAtHint >= 1 && g.solvedAtHint <= 6)) &&
    PHASES.includes(g.phase as (typeof PHASES)[number])
  );
}

export function loadGameState(): GameState | null {
  const parsed = readJson<GameState>(STATE_KEY);
  return parsed !== null && isPlausibleGameState(parsed) ? parsed : null;
}

export function saveGameState(state: GameState): void {
  writeJson(STATE_KEY, state);
}

export function loadStats(): Stats {
  const s = readJson<Stats>(STATS_KEY);
  return s !== null &&
    typeof s.played === "number" &&
    Array.isArray(s.solvedByHint) &&
    s.solvedByHint.length === 6
    ? s
    : emptyStats();
}

export function saveStats(stats: Stats): void {
  writeJson(STATS_KEY, stats);
}

/** true, wenn localStorage tatsächlich schreibbar ist (Spec §6: Hinweis in der Statistik). */
export function storageAvailable(): boolean {
  try {
    const probe = "dcq:probe";
    globalThis.localStorage.setItem(probe, "1");
    globalThis.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Test laufen lassen — muss grün sein**

Run: `npx vitest run src/storage/storage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/storage/storage.ts src/storage/storage.test.ts
git commit -m "feat: add crash-safe localStorage persistence"
```

---

### Task 11: Daten — Städteliste, Rätsel und Validierung

Dieser Task ist content-lastig: Der Validierungstest wird zuerst geschrieben (er schlägt fehl, solange die Daten unvollständig sind), dann werden die Daten generiert, bis er grün ist. **Der ausführende Agent generiert den Content selbst** nach den Qualitätsregeln aus Spec §7 — mit echtem, verifiziertem Wissen, keine erfundenen Fakten.

**Files:**
- Create: `src/data/validate.test.ts`
- Create: `src/data/cities.json`
- Create: `src/data/puzzles.json`

- [ ] **Step 1: Validierungstest schreiben** (`src/data/validate.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import citiesJson from "./cities.json";
import puzzlesJson from "./puzzles.json";
import type { City, Puzzle } from "../types";
import { previousDateString } from "../game/dates";

const cities = citiesJson as City[];
const puzzles = (puzzlesJson as { puzzles: Puzzle[] }).puzzles;

const cityKey = (c: { name: string; country: string }) => `${c.name}|${c.country}`;

describe("cities.json", () => {
  it("enthält mindestens 300 Städte", () => {
    expect(cities.length).toBeGreaterThanOrEqual(300);
  });
  it("Name+Land sind eindeutig", () => {
    const keys = cities.map(cityKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("Koordinaten sind gültig", () => {
    for (const c of cities) {
      expect(c.lat, c.name).toBeGreaterThanOrEqual(-90);
      expect(c.lat, c.name).toBeLessThanOrEqual(90);
      expect(c.lng, c.name).toBeGreaterThanOrEqual(-180);
      expect(c.lng, c.name).toBeLessThanOrEqual(180);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.country.length).toBeGreaterThan(0);
    }
  });
});

describe("puzzles.json", () => {
  it("enthält mindestens 90 Rätsel", () => {
    expect(puzzles.length).toBeGreaterThanOrEqual(90);
  });
  it("Nummern laufen lückenlos ab 1", () => {
    puzzles.forEach((p, i) => expect(p.number, p.date).toBe(i + 1));
  });
  it("Daten starten am 2026-11-14 und sind lückenlos aufsteigend", () => {
    expect(puzzles[0].date).toBe("2026-11-14");
    for (let i = 1; i < puzzles.length; i++) {
      expect(previousDateString(puzzles[i].date), `#${puzzles[i].number}`).toBe(puzzles[i - 1].date);
    }
  });
  it("jede Zielstadt ist eindeutig und exakt in cities.json enthalten", () => {
    const byKey = new Map(cities.map((c) => [cityKey(c), c]));
    const seen = new Set<string>();
    for (const p of puzzles) {
      const key = cityKey(p.city);
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
      const listed = byKey.get(key);
      expect(listed, key).toBeDefined();
      expect(listed!.lat, key).toBe(p.city.lat);
      expect(listed!.lng, key).toBe(p.city.lng);
    }
  });
  it("keine zwei aufeinanderfolgenden Tage mit demselben Land", () => {
    for (let i = 1; i < puzzles.length; i++) {
      expect(puzzles[i].city.country, `#${puzzles[i].number}`).not.toBe(puzzles[i - 1].city.country);
    }
  });
  it("Struktur: 6 Hinweise, 3 Fragen à 4 Antworten, Host-Texte vollständig", () => {
    for (const p of puzzles) {
      const label = `#${p.number} ${p.city.name}`;
      expect(p.hints, label).toHaveLength(6);
      p.hints.forEach((h) => expect(h.trim().length, label).toBeGreaterThan(10));
      expect(p.quiz, label).toHaveLength(3);
      for (const q of p.quiz) {
        expect(q.choices, label).toHaveLength(4);
        expect(q.answerIndex, label).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, label).toBeLessThanOrEqual(3);
        expect(q.question.trim().length, label).toBeGreaterThan(5);
        expect(q.hostCorrect.trim().length, label).toBeGreaterThan(0);
        expect(q.hostWrong.trim().length, label).toBeGreaterThan(0);
      }
      expect(p.host.wrongGuess.length, label).toBeGreaterThanOrEqual(5);
      for (const line of [p.host.intro, p.host.winEarly, p.host.winMid, p.host.winLate, p.host.lose, p.host.reveal]) {
        expect(line.trim().length, label).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: Test laufen lassen — muss fehlschlagen**

Run: `npx vitest run src/data/validate.test.ts`
Expected: FAIL (JSON-Dateien existieren nicht).

- [ ] **Step 3: `src/data/cities.json` generieren (~400 Städte)**

Flaches Array im `City`-Format. Inhaltliche Vorgaben:
- Deutsche Exonyme als `name`, wo üblich (`Lissabon`, `Warschau`, `Mailand`, `Kopenhagen`); englischer/lokaler Name in `aliases` (`Lisbon`/`Lisboa`).
- Mischung: alle Großstädte des DACH-Raums, die bekannten Städte Europas, die weltbekannten Metropolen aller Kontinente, plus genug „plausible Raterei-Städte" mittlerer Bekanntheit, damit die Autocomplete-Liste den Rätselpool nicht verrät (Spec §4.3).
- Koordinaten: Stadtzentrum, 4 Dezimalstellen.

Beispiel-Anfang:

```json
[
  { "name": "Berlin", "aliases": [], "country": "Deutschland", "lat": 52.52, "lng": 13.405 },
  { "name": "Lissabon", "aliases": ["Lisbon", "Lisboa"], "country": "Portugal", "lat": 38.7223, "lng": -9.1393 },
  { "name": "Warschau", "aliases": ["Warsaw", "Warszawa"], "country": "Polen", "lat": 52.2297, "lng": 21.0122 }
]
```

- [ ] **Step 4: `src/data/puzzles.json` generieren — 90 Rätsel ab 2026-11-14, in 3 Batches à 30**

Struktur `{ "puzzles": [ … ] }`. Qualitätsregeln (Spec §7): nur verifizierte Fakten; Schwierigkeitsmix ≈ 40 % leicht / 40 % mittel / 20 % knifflig; Hinweis-Reihenfolge Klima → Kulinarik → Geschichte → Zahlen → Persönlichkeit → Wahrzeichen; Hinweis 1 nie eindeutig, Hinweis 6 fast sicher; Quizfragen über die Stadt, nicht über die Hinweise; Marco-Ton: erwachsen, warm, leicht angeberischer Weltenbummler. Jede Zielstadt wird 1:1 (Name, Aliase, Land, lat, lng) aus `cities.json` übernommen.

Vollständiges Beispiel für den Stil und die Dichte (Rätsel #1):

```json
{
  "number": 1,
  "date": "2026-11-14",
  "city": { "name": "Lissabon", "aliases": ["Lisbon", "Lisboa"], "country": "Portugal", "lat": 38.7223, "lng": -9.1393 },
  "hints": [
    "Diese Küstenstadt erstreckt sich über mehrere Hügel an einer breiten Flussmündung — die Winter sind mild, und die Sonne zeigt sich hier über 2.800 Stunden im Jahr.",
    "Ein kleines Blätterteigtörtchen mit Vanillecreme ist der süße Stolz der Stadt — das Originalrezept aus einem Kloster wird bis heute geheim gehalten.",
    "Ein verheerendes Erdbeben zerstörte die Stadt 1755 fast vollständig — der Wiederaufbau machte sie zu einem Lehrbuchbeispiel moderner Stadtplanung.",
    "Rund 550.000 Menschen leben im Stadtgebiet, gut 2,9 Millionen in der Metropolregion — und eine der Brücken über den Fluss ähnelt verblüffend der Golden Gate Bridge.",
    "Der Fado, der melancholische Gesang dieser Stadt, machte Amália Rodrigues weltberühmt — ihr Staatsbegräbnis legte 1999 das ganze Land lahm.",
    "Vom Torre de Belém aus stachen einst die Entdecker in See — heute ist der Turm das Wahrzeichen der Stadt am Tejo."
  ],
  "quiz": [
    {
      "question": "Wie heißt die berühmte historische Straßenbahnlinie, die sich durch die Altstadt quält?",
      "choices": ["Linha 1", "Elétrico 28", "Tram 7", "Carreira 15"],
      "answerIndex": 1,
      "hostCorrect": "Elétrico 28, natürlich! Ich stand da mal eine Stunde im Gedränge — jede Sekunde wert.",
      "hostWrong": "Es ist der Elétrico 28 — die gelbe Bahn, die seit den 1930ern durch die Alfama rumpelt."
    },
    {
      "question": "An welchem Fluss liegt die Stadt?",
      "choices": ["Douro", "Guadiana", "Tejo", "Mondego"],
      "answerIndex": 2,
      "hostCorrect": "Der Tejo, richtig — breiter als mancher See, wenn du mich fragst.",
      "hostWrong": "Das ist der Tejo — der längste Fluss der Iberischen Halbinsel mündet genau hier in den Atlantik."
    },
    {
      "question": "Welches Viertel überstand das Erdbeben von 1755 weitgehend und gilt als ältestes der Stadt?",
      "choices": ["Baixa", "Chiado", "Belém", "Alfama"],
      "answerIndex": 3,
      "hostCorrect": "Alfama! Enge Gassen, Wäsche über den Köpfen, Fado aus den Fenstern — genau mein Revier.",
      "hostWrong": "Die Alfama war's — das maurische Gassengewirr steht noch fast wie vor dem Beben."
    }
  ],
  "host": {
    "intro": "Ah, heute wird's hügelig! Ich habe mir in dieser Stadt einmal die Schuhsohlen durchgelaufen — und es hat sich gelohnt. Rate mit!",
    "wrongGuess": [
      "Nette Idee, aber nein — dort ist das Gebäck längst nicht so gut.",
      "Kalt, kalt … also, die Richtung stimmt vielleicht, aber die Stadt nicht.",
      "Da war ich auch schon, aber heute sind wir woanders. Nächster Hinweis!",
      "Fast charmant geraten. Fast.",
      "Nein — aber ich notiere mir dein Reiseziel für später."
    ],
    "winEarly": "Beim ersten Treffer dachte ich noch an Glück — aber das war Können. Respekt, Weltenbummler-Niveau!",
    "winMid": "Sauber kombiniert! Das Törtchen hat dich verraten, oder?",
    "winLate": "Puh, das war knapp — aber der Torre de Belém lässt eben keine Zweifel. Gerettet!",
    "lose": "Heute nicht — aber ehrlich: Diese Stadt versteckt sich gut hinter ihren Hügeln. Morgen neue Chance!",
    "reveal": "Lissabon! Wusstest du, dass die Stadt älter ist als Rom? Die Phönizier ankerten hier schon vor 3.000 Jahren — und ich jedes Jahr wieder, wegen der Pastéis."
  }
}
```

Nach jedem Batch: `npx vitest run src/data/validate.test.ts` laufen lassen. Die Mindestanzahl-Tests bleiben rot, bis alle 90 Rätsel da sind — alle Struktur-Tests müssen aber ab Batch 1 für die vorhandenen Rätsel grün sein.

- [ ] **Step 5: Validierung — muss grün sein**

Run: `npx vitest run src/data/validate.test.ts`
Expected: PASS (alle Tests, inkl. ≥90 Rätsel / ≥300 Städte).

- [ ] **Step 6: Stichproben-Faktencheck**

10 zufällige Rätsel ziehen und jede Tatsachenbehauptung (Zahlen, Jahreszahlen, Personen, Wahrzeichen) gegen eigenes Wissen prüfen; bei Unsicherheit die Behauptung durch eine sichere ersetzen. Koordinaten von 10 zufälligen Städten plausibilisieren (Hemisphäre, Land).

- [ ] **Step 7: Commit**

```bash
git add src/data/
git commit -m "feat: add city list, 90 daily puzzles and data validation tests"
```

---

### Task 12: Theme & App-Gerüst mit Phase-Routing

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Create: `src/components/HostBubble.tsx`
- Create: `src/components/EmptyScreen.tsx`

- [ ] **Step 1: Theme-Tokens in `src/index.css`** (ersetzt den bisherigen Inhalt)

```css
@import "tailwindcss";

@theme {
  --color-night: #0b1026;
  --color-night-soft: #141b3c;
  --color-card: #1d2550;
  --color-accent: #ffb703;
  --color-accent-soft: #ffd166;
  --color-correct: #2ec4b6;
  --color-wrong: #ef476f;
  --color-ink: #f4f4f8;
  --color-ink-dim: #9aa3c7;
}

body {
  background-color: var(--color-night);
  color: var(--color-ink);
}
```

- [ ] **Step 2: `src/components/HostBubble.tsx`**

```tsx
import type { ReactNode } from "react";

export function HostBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 text-3xl" aria-hidden>
        🧭
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/components/EmptyScreen.tsx`**

```tsx
import { HostBubble } from "./HostBubble";

export function EmptyScreen() {
  return (
    <div className="flex flex-col gap-6 pt-16 text-center">
      <div className="text-6xl">🌍</div>
      <h1 className="text-2xl font-bold">Daily City Quiz</h1>
      <HostBubble>
        Marco ist gerade noch unterwegs und sammelt neue Städte — für heute liegt leider kein
        Rätsel bereit. Schau bald wieder vorbei!
      </HostBubble>
    </div>
  );
}
```

- [ ] **Step 4: `src/App.tsx` ersetzen** — Rätsel-Lookup, Reducer-Wiring, Persistenz, Statistik-Fortschreibung, Phase-Routing. Die Screen-Komponenten der Tasks 13–16 werden hier bereits importiert und verwendet; bis sie existieren, schlägt der Build fehl — deshalb wird dieser Task erst NACH Abschluss der Tasks 13–16 gebaut und committet, ODER die Screens werden in der Reihenfolge 13 → 16 direkt im Anschluss erstellt. (Empfohlen für Subagenten: Tasks 12–16 als ein Arbeitspaket behandeln, committen nach Task 16.)

```tsx
import { useEffect, useMemo, useReducer, useState } from "react";
import type { ReactNode } from "react";
import type { City, GameState, Puzzle, Stats } from "./types";
import { createGameReducer, createInitialState, type GameAction } from "./game/reducer";
import { localDateString, puzzleForDate } from "./game/dates";
import { applyCompletedGame } from "./game/stats";
import { totalPoints } from "./game/scoring";
import { loadGameState, loadStats, saveGameState, saveStats } from "./storage/storage";
import { EmptyScreen } from "./components/EmptyScreen";
import { StartScreen } from "./components/StartScreen";
import { GuessScreen } from "./components/GuessScreen";
import { RevealScreen } from "./components/RevealScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StatsModal } from "./components/StatsModal";
import puzzlesJson from "./data/puzzles.json";
import citiesJson from "./data/cities.json";

const puzzles = (puzzlesJson as { puzzles: Puzzle[] }).puzzles;
const cities = citiesJson as City[];

export default function App() {
  const today = localDateString();
  const puzzle = puzzleForDate(puzzles, today);
  if (!puzzle) return <Shell><EmptyScreen /></Shell>;
  return <Game key={today} puzzle={puzzle} today={today} />;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-6">{children}</div>;
}

function Game({ puzzle, today }: { puzzle: Puzzle; today: string }) {
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

  return (
    <Shell>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold">🌍 Daily City Quiz</h1>
        <div className="flex items-center gap-3 text-sm">
          <span title="Streak">🔥 {stats.currentStreak}</span>
          <button type="button" aria-label="Statistik" onClick={() => setShowStats(true)}>
            📊
          </button>
        </div>
      </header>

      {state.phase === "start" && (
        <StartScreen puzzle={puzzle} stats={stats} onStart={() => send({ type: "START" })} />
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
          puzzle={puzzle}
          state={state}
          onAnswer={(choiceIndex) => send({ type: "ANSWER", choiceIndex })}
          onNext={() => send({ type: "NEXT" })}
        />
      )}
      {state.phase === "result" && (
        <ResultScreen puzzle={puzzle} state={state} stats={stats} onShowStats={() => setShowStats(true)} />
      )}

      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
    </Shell>
  );
}
```

- [ ] **Step 5 (nach Task 16): Build + Commit** — siehe Task 16, Step 5.

---

### Task 13: StartScreen

**Files:**
- Create: `src/components/StartScreen.tsx`

- [ ] **Step 1: `src/components/StartScreen.tsx`**

```tsx
import type { Puzzle, Stats } from "../types";
import { HostBubble } from "./HostBubble";

export function StartScreen({ puzzle, onStart }: { puzzle: Puzzle; stats?: Stats; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="text-center">
        <div className="text-6xl">🏙️</div>
        <h2 className="mt-3 text-2xl font-bold">Rätsel #{puzzle.number}</h2>
        <p className="text-sm text-ink-dim">{puzzle.date}</p>
      </div>
      <HostBubble>{puzzle.host.intro}</HostBubble>
      <button
        type="button"
        className="rounded-xl bg-accent py-3.5 text-lg font-bold text-night active:scale-95"
        onClick={onStart}
      >
        Los geht&rsquo;s!
      </button>
      <p className="text-center text-xs leading-relaxed text-ink-dim">
        6 Hinweise, nach jedem darfst du einmal raten. Je früher du die Stadt errätst, desto mehr
        Punkte — danach warten 3 Bonus-Fragen.
      </p>
    </div>
  );
}
```

- [ ] **Step 2:** Weiter mit Task 14 (Build-Check erfolgt gesammelt in Task 16).

---

### Task 14: GuessScreen + CityAutocomplete

**Files:**
- Create: `src/components/CityAutocomplete.tsx`
- Create: `src/components/GuessScreen.tsx`

- [ ] **Step 1: `src/components/CityAutocomplete.tsx`**

```tsx
import { useMemo, useState } from "react";
import type { City } from "../types";
import { normalizeCityInput } from "../game/normalize";

export function CityAutocomplete({ cities, onGuess }: { cities: City[]; onGuess: (c: City) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<City | null>(null);

  const suggestions = useMemo(() => {
    const q = normalizeCityInput(query);
    if (selected || q.length < 2) return [];
    return cities
      .filter((c) => [c.name, ...c.aliases].some((a) => normalizeCityInput(a).includes(q)))
      .slice(0, 8);
  }, [cities, query, selected]);

  function choose(c: City) {
    setSelected(c);
    setQuery(`${c.name}, ${c.country}`);
  }

  return (
    <div className="relative">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!selected && suggestions.length > 0) {
            choose(suggestions[0]);
          } else if (selected) {
            onGuess(selected);
            setSelected(null);
            setQuery("");
          }
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-xl border border-card bg-night-soft px-4 py-3 outline-none focus:border-accent"
          placeholder="Stadt eingeben …"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
        />
        <button
          type="submit"
          disabled={!selected}
          className="rounded-xl bg-accent px-5 font-bold text-night disabled:opacity-40"
        >
          Raten
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full z-10 mb-2 w-full overflow-hidden rounded-xl border border-card bg-night-soft">
          {suggestions.map((c) => (
            <li key={`${c.name}|${c.country}`}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left hover:bg-card"
                onClick={() => choose(c)}
              >
                {c.name} <span className="text-sm text-ink-dim">· {c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `src/components/GuessScreen.tsx`**

```tsx
import type { City, GameState, Puzzle } from "../types";
import { CityAutocomplete } from "./CityAutocomplete";
import { HostBubble } from "./HostBubble";

const HINT_LABELS = [
  "🌡️ Klima & Lage",
  "🍜 Kulinarik",
  "📜 Geschichte & Kurioses",
  "🔢 Zahlen & Fakten",
  "🧑‍🎤 Berühmte Persönlichkeit",
  "🗼 Wahrzeichen",
];

export function GuessScreen({
  puzzle,
  state,
  cities,
  onGuess,
}: {
  puzzle: Puzzle;
  state: GameState;
  cities: City[];
  onGuess: (c: City) => void;
}) {
  const lastGuess = state.guesses[state.guesses.length - 1];
  const hostLine =
    state.guesses.length === 0
      ? puzzle.host.intro
      : puzzle.host.wrongGuess[Math.min(state.guesses.length - 1, puzzle.host.wrongGuess.length - 1)];

  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < state.guesses.length ? "bg-wrong" : i < state.hintsRevealed ? "bg-accent" : "bg-card"
            }`}
          />
        ))}
      </div>

      <HostBubble>{hostLine}</HostBubble>

      <div className="flex flex-col gap-3">
        {puzzle.hints.slice(0, state.hintsRevealed).map((hint, i) => (
          <div key={i} className="rounded-xl bg-card p-4">
            <div className="mb-1 text-xs text-ink-dim">
              Hinweis {i + 1} · {HINT_LABELS[i]}
            </div>
            <div className="text-sm leading-relaxed">{hint}</div>
          </div>
        ))}
      </div>

      {lastGuess && !lastGuess.correct && (
        <div className="text-sm text-ink-dim">
          📍 Die gesuchte Stadt liegt ca. {lastGuess.distanceKm.toLocaleString("de-DE")} km{" "}
          {lastGuess.direction} von {lastGuess.cityName}.
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-night px-4 pb-6 pt-2">
        <CityAutocomplete cities={cities} onGuess={onGuess} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3:** Weiter mit Task 15.

---

### Task 15: RevealScreen + QuizScreen

**Files:**
- Create: `src/components/RevealScreen.tsx`
- Create: `src/components/QuizScreen.tsx`

- [ ] **Step 1: `src/components/RevealScreen.tsx`**

```tsx
import type { GameState, Puzzle } from "../types";
import { HostBubble } from "./HostBubble";

export function RevealScreen({ puzzle, state, onContinue }: { puzzle: Puzzle; state: GameState; onContinue: () => void }) {
  const solved = state.solvedAtHint !== null;
  const reactionLine = !solved
    ? puzzle.host.lose
    : state.solvedAtHint! <= 2
      ? puzzle.host.winEarly
      : state.solvedAtHint! <= 4
        ? puzzle.host.winMid
        : puzzle.host.winLate;

  return (
    <div className="flex flex-col gap-6 pt-4 text-center">
      <div className="text-6xl">{solved ? "🎉" : "🙈"}</div>
      <div>
        <p className="text-sm text-ink-dim">{solved ? "Richtig — es war" : "Die gesuchte Stadt war"}</p>
        <h2 className="mt-1 text-3xl font-extrabold text-accent">{puzzle.city.name}</h2>
        <p className="mt-1 text-sm text-ink-dim">{puzzle.city.country}</p>
      </div>
      <div className="text-left">
        <HostBubble>
          <p>{reactionLine}</p>
          <p className="mt-2">{puzzle.host.reveal}</p>
        </HostBubble>
      </div>
      <button
        type="button"
        className="rounded-xl bg-accent py-3.5 text-lg font-bold text-night active:scale-95"
        onClick={onContinue}
      >
        Weiter zum Bonus-Quiz 🧠
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `src/components/QuizScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { GameState, Puzzle } from "../types";
import { HostBubble } from "./HostBubble";

const QUESTION_MS = 10_000;

export function QuizScreen({
  puzzle,
  state,
  onAnswer,
  onNext,
}: {
  puzzle: Puzzle;
  state: GameState;
  onAnswer: (choiceIndex: number | null) => void;
  onNext: () => void;
}) {
  const question = puzzle.quiz[state.quizIndex];
  const answered = state.quizAnswers.length > state.quizIndex;
  const [remaining, setRemaining] = useState(QUESTION_MS);

  useEffect(() => {
    if (answered) return;
    const start = Date.now();
    setRemaining(QUESTION_MS);
    const id = setInterval(() => {
      const left = QUESTION_MS - (Date.now() - start);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onAnswer(null);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.quizIndex, answered]);

  const wasCorrect = answered && state.quizAnswers[state.quizIndex];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="text-xs text-ink-dim">Bonus-Frage {state.quizIndex + 1} / 3</div>
      {!answered && (
        <div className="h-2 overflow-hidden rounded-full bg-card">
          <div
            className="h-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.max(0, (remaining / QUESTION_MS) * 100)}%` }}
          />
        </div>
      )}
      <div className="rounded-xl bg-card p-4 text-lg font-semibold">{question.question}</div>
      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            className={`rounded-xl border-2 bg-night-soft px-4 py-3 text-left ${
              answered && i === question.answerIndex ? "border-correct" : "border-transparent"
            } ${answered ? "opacity-80" : "active:scale-[0.99]"}`}
            onClick={() => onAnswer(i)}
          >
            {choice}
          </button>
        ))}
      </div>
      {answered && (
        <>
          <HostBubble>{wasCorrect ? question.hostCorrect : question.hostWrong}</HostBubble>
          <button
            type="button"
            className="rounded-xl bg-accent py-3 font-bold text-night active:scale-95"
            onClick={onNext}
          >
            {state.quizIndex === 2 ? "Zum Ergebnis 🏁" : "Nächste Frage →"}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3:** Weiter mit Task 16.

---

### Task 16: ResultScreen + StatsModal, Build & Commit des UI-Pakets

**Files:**
- Create: `src/components/ResultScreen.tsx`
- Create: `src/components/StatsModal.tsx`

- [ ] **Step 1: `src/components/ResultScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { GameState, Puzzle, Stats } from "../types";
import { actOnePoints, quizPoints, totalPoints } from "../game/scoring";
import { buildShareText } from "../game/share";

function msUntilNextMidnight(now: Date): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function ResultScreen({
  puzzle,
  state,
  stats,
  onShowStats,
}: {
  puzzle: Puzzle;
  state: GameState;
  stats: Stats;
  onShowStats: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const quizCorrect = quizPoints(state.quizAnswers);
  const shareText = buildShareText({
    number: puzzle.number,
    solvedAtHint: state.solvedAtHint,
    quizCorrect,
    streak: stats.currentStreak,
  });

  async function share() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Zum Kopieren markieren:", shareText);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-4 text-center">
      <h2 className="text-2xl font-bold">
        {totalPoints(state.solvedAtHint, state.quizAnswers)} / 9 Punkte
      </h2>
      <div className="flex justify-center gap-6 text-sm text-ink-dim">
        <span>🏙️ Stadt: {actOnePoints(state.solvedAtHint)} P.</span>
        <span>🧠 Quiz: {quizCorrect} / 3</span>
        <span>🔥 Streak: {stats.currentStreak}</span>
      </div>
      <pre className="whitespace-pre-wrap rounded-xl bg-card p-4 text-left text-sm">{shareText}</pre>
      <button
        type="button"
        className="rounded-xl bg-accent py-3.5 text-lg font-bold text-night active:scale-95"
        onClick={share}
      >
        {copied ? "Kopiert! ✅" : "Ergebnis teilen 📋"}
      </button>
      <button type="button" className="text-sm text-ink-dim underline" onClick={onShowStats}>
        Meine Statistik
      </button>
      <p className="text-sm text-ink-dim">
        Nächstes Rätsel in{" "}
        <span className="font-mono text-ink">{formatCountdown(msUntilNextMidnight(new Date(now)))}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: `src/components/StatsModal.tsx`**

```tsx
import type { Stats } from "../types";
import { storageAvailable } from "../storage/storage";

export function StatsModal({ stats, onClose }: { stats: Stats; onClose: () => void }) {
  const maxBar = Math.max(1, ...stats.solvedByHint);
  const solvedPercent = stats.played === 0 ? 0 : Math.round((stats.solved / stats.played) * 100);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-night-soft p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">📊 Statistik</h3>
          <button type="button" aria-label="Schließen" onClick={onClose}>
            ✕
          </button>
        </div>
        {!storageAvailable() && (
          <p className="mb-3 text-xs text-wrong">
            ⚠️ Dein Browser speichert gerade nichts dauerhaft (Privatmodus?) — Statistik und Streak
            gehen beim Schließen verloren.
          </p>
        )}
        <div className="mb-5 grid grid-cols-4 gap-2 text-center">
          <Stat label="Gespielt" value={stats.played} />
          <Stat label="Gelöst" value={`${solvedPercent}%`} />
          <Stat label="Streak" value={stats.currentStreak} />
          <Stat label="Rekord" value={stats.maxStreak} />
        </div>
        <p className="mb-2 text-xs text-ink-dim">Gelöst nach Hinweis …</p>
        <div className="flex flex-col gap-1.5">
          {stats.solvedByHint.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-ink-dim">{i + 1}</span>
              <div className="h-4 flex-1 rounded bg-card">
                <div
                  className="flex h-full items-center justify-end rounded bg-accent pr-1.5 text-[10px] font-bold text-night"
                  style={{ width: `${Math.max(count > 0 ? 12 : 0, (count / maxBar) * 100)}%` }}
                >
                  {count > 0 ? count : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-card px-1 py-2.5">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-ink-dim">{label}</div>
    </div>
  );
}
```

- [ ] **Step 3: Alle Tests + Build**

Run: `npm test && npm run build`
Expected: Alle Vitest-Suiten PASS, `tsc` und `vite build` ohne Fehler.

- [ ] **Step 4: Smoke-Test im Dev-Server**

`.claude/launch.json` anlegen (falls nicht vorhanden):

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "daily-city-quiz", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 5173 }
  ]
}
```

Dev-Server starten und prüfen: Startscreen erscheint mit Marco-Intro des heutigen Rätsels (2026-11-14 = Lissabon-Beispiel bzw. Rätsel #1).

- [ ] **Step 5: Commit des gesamten UI-Pakets (Tasks 12–16)**

```bash
git add src/ .claude/launch.json
git commit -m "feat: add themed UI with all game screens"
```

**Härtung (aus UI-Review, als Folge-Commit):** `effectiveStreak(stats, today)` in `stats.ts` (+2 Tests) — die Streak-Anzeige fällt auf 0, sobald der letzte Spieltag weder heute noch gestern ist; Autocomplete rankt exakte Treffer vor Präfix- vor Substring-Treffern und bekommt `max-h`/Scroll + `autoComplete="off"`; Footer nutzt `env(safe-area-inset-bottom)` und der Viewport `viewport-fit=cover`; QuizScreen zählt über `puzzle.quiz.length`; StatsModal bekommt `role="dialog"`, Escape-Handler und memoisierten Storage-Check; HostBubble bricht lange Wörter um.

---

### Task 17: Manuelle End-to-End-Verifikation

**Files:** keine neuen (Fixes, falls nötig)

- [ ] **Step 1: Kompletter Spieldurchlauf im Browser (mobil, 375 px)**

Im eingebauten Browser mit mobiler Viewport-Emulation prüfen:
1. Start → „Los geht's!" → Hinweis 1 erscheint.
2. Falsche Stadt raten (z. B. „Warschau") → Distanz-/Richtungszeile erscheint, Hinweis 2 klappt auf, Marco kommentiert.
3. Autocomplete: „mun" findet München; „lisbon" findet Lissabon (Alias).
4. Richtige Stadt raten → Auflösung mit Anekdote → Bonus-Quiz.
5. Quiz: Countdown-Balken läuft; eine Frage per Timeout verstreichen lassen → zählt als falsch; richtige Antwort wird grün markiert.
6. Ergebnis: Punkte stimmen (Akt 1 + Quiz), Share-Button kopiert exakt den `buildShareText`-Text, Mitternachts-Countdown tickt.
7. Statistik-Modal: Zahlen stimmen mit dem Durchlauf überein.

- [ ] **Step 2: Reload-Verhalten**

Mitten in Akt 1 neu laden → Zustand (Hinweise, Versuche) ist wiederhergestellt. Auf dem Ergebnis-Screen neu laden → bleibt auf Ergebnis, Statistik wird NICHT doppelt gezählt (played bleibt gleich).

- [ ] **Step 3: Desktop-Check**

Viewport auf Desktop zurücksetzen → Layout zentriert (max-w-md), nichts überlappt.

- [ ] **Step 4: Gefundene Fehler fixen, Tests erneut laufen lassen**

Run: `npm test && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit (falls Fixes anfielen)**

```bash
git add -A
git commit -m "fix: polish issues found in manual E2E pass"
```

---

## Hinweise für die Ausführung

- **Reihenfolge:** Tasks 1–11 strikt sequenziell (jede Logik-Datei baut auf früheren auf). Tasks 12–16 bilden ein UI-Arbeitspaket mit einem gemeinsamen Build/Commit am Ende (Task 16), weil `App.tsx` alle Screens importiert.
- **Content-Qualität (Task 11)** ist der sensibelste Teil: keine erfundenen Fakten. Im Zweifel eine Behauptung weglassen und durch eine sichere ersetzen.
- **Kein Scope-Creep:** Keine Animation−/Sound-Extras, kein Routing, keine i18n-Vorbereitung — Spec §9 (Nicht-Ziele) gilt.
