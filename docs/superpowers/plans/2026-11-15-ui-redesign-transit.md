# UI-Redesign „Transit“ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das komplette UI von Daily City Quiz auf die Art Direction „Transit“ (Abflugtafel + Metro) umbauen — reine Präsentationsschicht, alle 62 bestehenden Tests bleiben grün.

**Architecture:** Jede Screen-Komponente wird als Ganzes ersetzt (Props-Interfaces bleiben identisch, außer: `StartScreen` verliert sein ungenutztes `stats?`-Prop). Drei neue Bausteine kommen dazu: `BoardHeader` (Tafel mit Fallblatt-Zellen, ersetzt den App-Header), `FlapRow` (Fallblatt-Zeile mit Buchstabier-Animation), `MetroLine` (Haltestellen-Fortschritt). Design-Tokens via Tailwind-4-`@theme`, Schriften selbst gehostet via `@fontsource`. Spiellogik, Reducer, Storage, Datenformat und Share-Text bleiben unangetastet.

**Tech Stack:** React 19, Vite 7, TypeScript strict, Tailwind CSS 4 (`@theme`-Tokens), Vitest 3, `@fontsource` (Oswald Variable, B612, B612 Mono).

**Spec:** `docs/superpowers/specs/2026-11-15-ui-redesign-transit-design.md` — **visuelle Referenz:** `docs/superpowers/mockups/2026-11-15-ui-richtungen/transit.html`

**Branch:** `feature/ui-transit` (wird vom Orchestrator vor Task 1 von `main` abgezweigt).

**Wichtige Konventionen (gelten für alle Tasks):**
- Versalien IMMER per CSS `uppercase`, nie im Markup-Text (Ausnahme: die kurzen Datums-/Nummern-Codes aus `format.ts` wie `SA 15. NOV`, die sind bewusst Daten).
- Während der Umbauphase existieren alte („night/card/accent“) und neue Tokens parallel; Task 13 räumt die alten weg. Zwischenstände sehen gemischt aus — das ist okay, es zählt: Tests grün, Typecheck grün.
- Jeder Task endet mit `npm test` (62+ Tests grün), `npm run build` (Typecheck) und einem Commit.

---

### Task 1: Fonts, Design-Tokens, Basis-CSS

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/main.tsx`
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Fontsource-Pakete installieren**

```bash
npm install @fontsource-variable/oswald @fontsource/b612 @fontsource/b612-mono
```

- [ ] **Step 2: Fonts in `src/main.tsx` importieren** (vor `./index.css`):

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/oswald";
import "@fontsource/b612/400.css";
import "@fontsource/b612/400-italic.css";
import "@fontsource/b612/700.css";
import "@fontsource/b612-mono/400.css";
import "@fontsource/b612-mono/700.css";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: `src/index.css` komplett ersetzen** (alte Tokens bleiben vorerst drin, Task 13 entfernt sie):

```css
@import "tailwindcss";

@theme {
  /* Transit-Tokens */
  --color-bg: #131519;
  --color-board: #0f1113;
  --color-cell: #1a1d21;
  --color-edge: #24282e;
  --color-amber: #ffc83d;
  --color-bright: #e8e9eb;
  --color-dim: #9aa0a8;
  --color-miss: #ff7a6b;
  --color-hit: #4fbf78;
  --color-paper: #f7f3e8;
  --color-ink: #15171a;
  --font-display: "Oswald Variable", Oswald, sans-serif;
  --font-sans: "B612", system-ui, sans-serif;
  --font-mono: "B612 Mono", ui-monospace, monospace;

  /* Alt-Tokens — werden in Task 13 entfernt */
  --color-night: #0b1026;
  --color-night-soft: #141b3c;
  --color-card: #1d2550;
  --color-accent: #ffb703;
  --color-accent-soft: #ffd166;
  --color-correct: #2ec4b6;
  --color-wrong: #ef476f;
  --color-ink-dim: #9aa3c7;
}

body {
  background-color: var(--color-bg);
  color: var(--color-bright);
  font-family: var(--font-sans);
}

:focus-visible {
  outline: 2px solid var(--color-amber);
  outline-offset: 2px;
}

/* Fallblatt-Zellen */
.flap::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1.5px;
  background: rgb(0 0 0 / 0.55);
}
@keyframes flap-intro {
  0% { transform: rotateX(0); }
  50% { transform: rotateX(-86deg); }
  100% { transform: rotateX(0); }
}
.flap-intro {
  transform-origin: center 55%;
  animation: flap-intro 0.7s ease 2;
  animation-fill-mode: both;
}

/* Zeilen-Einfahrt (neuer Hinweis) */
@keyframes row-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-row-in { animation: row-in 0.3s ease-out; }

/* Alt — wird in Task 13 entfernt */
@keyframes card-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-card-in { animation: card-in 0.35s ease-out; }

/* Aktuelle Metro-Station */
@keyframes station-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgb(255 200 61 / 0.12); }
  50% { box-shadow: 0 0 0 6px rgb(255 200 61 / 0.26); }
}
.station-now {
  /* Statischer Ring als Basis, damit die aktuelle Station auch bei reduced-motion erkennbar bleibt */
  box-shadow: 0 0 0 4px rgb(255 200 61 / 0.18);
  animation: station-pulse 2.4s ease-in-out infinite;
}

/* Quiz-Timer unter 3 s */
@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.animate-timer-pulse { animation: timer-pulse 0.7s ease-in-out infinite; }

/* Stempel auf der Bordkarte */
@keyframes stamp-in {
  from { transform: rotate(-8deg) scale(1.7); opacity: 0; }
  to { transform: rotate(-8deg) scale(1); opacity: 1; }
}
.stamp-in { animation: stamp-in 0.35s cubic-bezier(0.2, 1.4, 0.4, 1) 0.25s both; }

/* Ticket-Kerben */
.ticket::before,
.ticket::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-bg);
  transform: translateY(-50%);
}
.ticket::before { left: -8px; }
.ticket::after { right: -8px; }

@media (prefers-reduced-motion: reduce) {
  .flap-intro,
  .animate-row-in,
  .animate-card-in,
  .station-now,
  .animate-timer-pulse,
  .stamp-in {
    animation: none;
  }
}
```

- [ ] **Step 4: `index.html` theme-color anpassen** — die Zeile `<meta name="theme-color" content="#0b1026" />` ersetzen durch:

```html
    <meta name="theme-color" content="#131519" />
```

- [ ] **Step 5: Prüfen**

Run: `npm test` — Expected: alle Tests PASS (62).
Run: `npm run build` — Expected: Erfolg ohne Typfehler.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.tsx src/index.css index.html
git commit -m "feat(ui): Transit-Tokens, Fontsource-Schriften und Basis-Animationen"
```

---

### Task 2: `format.ts` — Tafel-Datum und Rätselnummer (TDD)

**Files:**
- Create: `src/game/format.ts`
- Test: `src/game/format.test.ts`

- [ ] **Step 1: Failing Test schreiben** — `src/game/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatBoardDate, formatPuzzleNumber } from "./format";

describe("formatBoardDate", () => {
  it("formatiert ein Datum als Tafel-Code", () => {
    expect(formatBoardDate("2026-11-15")).toBe("SA 15. NOV");
  });
  it("funktioniert am Jahresanfang", () => {
    expect(formatBoardDate("2027-01-01")).toBe("FR 1. JAN");
  });
  it("nutzt deutsche Monatskürzel mit Umlaut", () => {
    expect(formatBoardDate("2027-03-07")).toBe("SO 7. MÄR");
  });
});

describe("formatPuzzleNumber", () => {
  it("füllt auf drei Stellen auf", () => {
    expect(formatPuzzleNumber(1)).toBe("001");
    expect(formatPuzzleNumber(42)).toBe("042");
  });
  it("lässt vierstellige Nummern unverändert", () => {
    expect(formatPuzzleNumber(1234)).toBe("1234");
  });
});
```

- [ ] **Step 2: Test laufen lassen, Scheitern verifizieren**

Run: `npm test` — Expected: FAIL (`format.ts` existiert nicht).

- [ ] **Step 3: Implementieren** — `src/game/format.ts`:

```ts
const WEEKDAYS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
const MONTHS = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

/** Tafel-Code für ein YYYY-MM-DD-Datum, z. B. "SA 15. NOV" (Rechnung in UTC-Mittag, DST-sicher). */
export function formatBoardDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

/** Rätselnummer als Tafel-Code, z. B. "001". */
export function formatPuzzleNumber(n: number): string {
  return String(n).padStart(3, "0");
}
```

- [ ] **Step 4: Tests grün verifizieren**

Run: `npm test` — Expected: PASS (62 + 5 neue).

- [ ] **Step 5: Commit**

```bash
git add src/game/format.ts src/game/format.test.ts
git commit -m "feat(ui): Tafel-Formatierung für Datum und Rätselnummer"
```

---

### Task 3: `FlapRow` — Fallblatt-Zeile mit Buchstabier-Animation

**Files:**
- Create: `src/components/FlapRow.tsx`

Verhalten (aus der Spec):
- Beim **ersten Render** steht der Text sofort (wichtig für Reload mitten im Spiel).
- Ändert sich der Text **nach** dem ersten Render (Live-Übergang `???` → Stadtname), buchstabiert die Anzeige den neuen Text von links nach rechts (~90 ms pro Zeichen, dahinter rotieren Zufallszeichen).
- Bei `prefers-reduced-motion: reduce` steht der neue Text sofort.
- Die Zellen sind `aria-hidden` — den lesbaren Text liefert der Aufrufer (sr-only).
- Ab 9 Zeichen schaltet die Zeile auf kleine Zellen (lange Städtenamen wie „Rio de Janeiro“).

- [ ] **Step 1: Komponente schreiben** — `src/components/FlapRow.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";

const CYCLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";
const LOCK_MS = 90;
const CYCLE_MS = 45;

function useSpelledText(text: string): string {
  const target = text.toUpperCase();
  const [display, setDisplay] = useState(target);
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const isChange = prev.current !== null && prev.current !== target;
    prev.current = target;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isChange || reduced) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      const locked = Math.min(target.length, Math.floor(t / LOCK_MS));
      let out = target.slice(0, locked);
      for (let i = locked; i < target.length; i++) {
        out +=
          target[i] === " "
            ? " "
            : CYCLE_CHARS[Math.floor(t / CYCLE_MS + i * 7) % CYCLE_CHARS.length];
      }
      setDisplay(out);
      if (locked < target.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}

/**
 * Fallblatt-Zeile. `intro` lässt die Zellen beim Einhängen zweimal flippen
 * (Startscreen-Moment); ein Textwechsel nach dem ersten Render buchstabiert
 * sich automatisch (Reveal-Moment). Zellen sind dekorativ (aria-hidden) —
 * den lesbaren Text liefert der Aufrufer.
 */
export function FlapRow({ text, intro = false }: { text: string; intro?: boolean }) {
  const display = useSpelledText(text);
  const small = text.length > 8;
  return (
    <span aria-hidden className="flex flex-wrap gap-1">
      {Array.from(display).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-2" />
        ) : (
          <span
            key={i}
            className={`flap relative grid place-items-center rounded bg-cell font-display font-medium text-amber ${
              small ? "h-8 w-[22px] text-base" : "h-11 w-8 text-2xl"
            } ${intro ? "flap-intro" : ""}`}
            style={intro ? { animationDelay: `${0.3 + i * 0.12}s` } : undefined}
          >
            {ch}
          </span>
        )
      )}
    </span>
  );
}
```

- [ ] **Step 2: Prüfen**

Run: `npm test` — Expected: PASS.
Run: `npm run build` — Expected: Erfolg (Typecheck deckt die neue Datei ab).

- [ ] **Step 3: Commit**

```bash
git add src/components/FlapRow.tsx
git commit -m "feat(ui): FlapRow mit Buchstabier-Animation und reduced-motion-Pfad"
```

---

### Task 4: `BoardHeader` + Einbau in `App.tsx`

**Files:**
- Create: `src/components/BoardHeader.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Komponente schreiben** — `src/components/BoardHeader.tsx`:

```tsx
import type { Puzzle } from "../types";
import { formatBoardDate, formatPuzzleNumber } from "../game/format";
import { FlapRow } from "./FlapRow";

export function BoardHeader({
  puzzle,
  streak,
  revealed,
  onShowStats,
}: {
  puzzle: Puzzle;
  streak: number;
  revealed: boolean;
  onShowStats: () => void;
}) {
  return (
    <header className="rounded-xl border border-edge bg-board p-4">
      <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
        <span>Daily City Quiz</span>
        <span>{formatBoardDate(puzzle.date)}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-dim">Ziel</span>
        <span className="sr-only">{revealed ? puzzle.city.name : "noch unbekannt"}</span>
        <FlapRow text={revealed ? puzzle.city.name : "???"} intro={!revealed} />
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs uppercase text-bright/80">
        <span>Rätsel {formatPuzzleNumber(puzzle.number)}</span>
        <span className="flex items-center gap-4">
          <span>Serie {streak}</span>
          <button
            type="button"
            className="tracking-wider text-dim underline-offset-2 hover:underline"
            onClick={onShowStats}
          >
            Statistik
          </button>
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: In `App.tsx` einbauen.** Import ergänzen und den bisherigen `<header>…</header>`-Block in `Game` ersetzen. Neuer `Game`-Rumpf (nur das JSX ab `return` ändert sich plus der neue Import und die `revealed`-Konstante; Hooks und Logik bleiben unverändert):

```tsx
import { BoardHeader } from "./components/BoardHeader";
```

Vor dem `return` in `Game` ergänzen:

```tsx
  const revealed =
    state.phase === "reveal" || state.phase === "quiz" || state.phase === "result";
```

Das `return` von `Game` ersetzen durch:

```tsx
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

      {showStats && <StatsModal stats={stats} streak={effectiveStreak(stats, today)} onClose={() => setShowStats(false)} />}
    </Shell>
  );
```

(Hinweis: `stats={stats}` bei `StartScreen` bleibt hier noch — Task 6 entfernt Prop und Übergabe zusammen.)

- [ ] **Step 3: Prüfen**

Run: `npm test` — Expected: PASS.
Run: `npm run build` — Expected: Erfolg.

- [ ] **Step 4: Commit**

```bash
git add src/components/BoardHeader.tsx src/App.tsx
git commit -m "feat(ui): BoardHeader mit Fallblatt-Ziel ersetzt App-Header"
```

---

### Task 5: `HostBubble` wird Durchsage-Panel

**Files:**
- Modify: `src/components/HostBubble.tsx`

Export-Name und `children`-API bleiben (6 Aufrufer). Neues optionales Prop `sig` (Signatur, `null` blendet sie aus).

- [ ] **Step 1: Datei komplett ersetzen:**

```tsx
import type { ReactNode } from "react";

export function HostBubble({
  children,
  sig = "Marco, Reiseleitung",
}: {
  children: ReactNode;
  sig?: string | null;
}) {
  return (
    <div className="rounded-xl border border-edge bg-cell p-4">
      <span className="inline-block rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
        Durchsage
      </span>
      <div className="mt-2 min-w-0 break-words text-[15px] leading-relaxed">{children}</div>
      {sig && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-dim">{sig}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 3: Commit**

```bash
git add src/components/HostBubble.tsx
git commit -m "feat(ui): HostBubble als Durchsage-Panel im Tafel-Look"
```

---

### Task 6: `StartScreen`

**Files:**
- Modify: `src/components/StartScreen.tsx`
- Modify: `src/App.tsx` (nur die `StartScreen`-Zeile)

- [ ] **Step 1: `StartScreen.tsx` komplett ersetzen** (das ungenutzte `stats?`-Prop fällt weg; Rätselnummer/Datum zeigt jetzt der BoardHeader):

```tsx
import type { Puzzle } from "../types";
import { HostBubble } from "./HostBubble";

export function StartScreen({ puzzle, onStart }: { puzzle: Puzzle; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-5 pt-4">
      <HostBubble>{puzzle.host.intro}</HostBubble>
      <button
        type="button"
        className="block w-full rounded-lg bg-amber py-3.5 font-display text-lg font-medium uppercase tracking-wide text-ink active:scale-95"
        onClick={onStart}
      >
        Los geht&rsquo;s!
      </button>
      <p className="text-center font-mono text-[11px] uppercase leading-loose tracking-wider text-dim">
        6 Hinweise, nach jedem darfst du einmal raten.
        <br />
        Je früher du triffst, desto mehr Punkte.
        <br />
        Danach: 3 Bonus-Fragen.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: In `App.tsx`** die Zeile

```tsx
        <StartScreen puzzle={puzzle} stats={stats} onStart={() => send({ type: "START" })} />
```

ersetzen durch:

```tsx
        <StartScreen puzzle={puzzle} onStart={() => send({ type: "START" })} />
```

- [ ] **Step 3: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 4: Commit**

```bash
git add src/components/StartScreen.tsx src/App.tsx
git commit -m "feat(ui): StartScreen im Transit-Look, ungenutztes stats-Prop entfernt"
```

---

### Task 7: `MetroLine` + `GuessScreen`

**Files:**
- Create: `src/components/MetroLine.tsx`
- Modify: `src/components/GuessScreen.tsx`

- [ ] **Step 1: `MetroLine.tsx` schreiben:**

```tsx
/**
 * Haltestellen-Fortschritt: `filled` Stationen sind erreicht (amber),
 * die zuletzt erreichte pulsiert als aktuelle Station.
 */
export function MetroLine({ total, filled }: { total: number; filled: number }) {
  const pct = total > 1 ? ((Math.max(1, filled) - 1) / (total - 1)) * 100 : 0;
  return (
    <div className="px-1">
      <div className="relative h-4">
        <div className="absolute inset-x-2 top-1.5 h-0.5 bg-edge" />
        <div className="absolute inset-x-2 top-1.5">
          <div className="h-0.5 bg-amber" style={{ width: `${pct}%` }} />
        </div>
        <div className="absolute inset-0 flex items-start justify-between">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 ${
                i < filled ? "border-amber bg-amber" : "border-[#4a505a] bg-bg"
              } ${i === filled - 1 ? "station-now" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between font-mono text-[10px] text-dim">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="w-4 text-center">
            {i + 1}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
        Haltestelle {filled} von {total}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: `GuessScreen.tsx` komplett ersetzen** (Logik — dupNote, hostLine, misses — bleibt identisch; nur Darstellung ändert sich):

```tsx
import { useState } from "react";
import type { City, GameState, Puzzle } from "../types";
import { CityAutocomplete } from "./CityAutocomplete";
import { MetroLine } from "./MetroLine";

const HINT_LABELS = [
  "Klima & Lage",
  "Kulinarik",
  "Geschichte & Kurioses",
  "Zahlen & Fakten",
  "Berühmte Persönlichkeit",
  "Wahrzeichen",
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
  const [dupNote, setDupNote] = useState<string | null>(null);
  const misses = state.guesses.filter((g) => !g.correct);

  function handleGuess(c: City) {
    if (state.guesses.some((g) => g.cityName === c.name && g.country === c.country)) {
      setDupNote(`${c.name} hast du schon geraten — probier eine andere Stadt!`);
      return;
    }
    setDupNote(null);
    onGuess(c);
  }

  const hostLine =
    state.guesses.length === 0
      ? puzzle.host.intro
      : puzzle.host.wrongGuess[Math.min(state.guesses.length - 1, puzzle.host.wrongGuess.length - 1)];

  return (
    <div className="flex flex-col gap-4 pb-44">
      <MetroLine total={puzzle.hints.length} filled={state.hintsRevealed} />

      <div className="flex flex-col gap-2">
        {puzzle.hints.slice(0, state.hintsRevealed).map((hint, i) => (
          <div key={i} className="animate-row-in flex gap-3 rounded-lg border border-edge bg-cell p-3">
            <span className="h-fit shrink-0 rounded bg-board px-1.5 py-1 font-mono text-xs text-amber">
              H{i + 1}
            </span>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-dim">
                {HINT_LABELS[i]}
              </div>
              <p className="mt-1 text-sm leading-relaxed">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {misses.length > 0 && (
        <div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 pb-1 font-mono text-[10px] uppercase tracking-wider text-dim">
            <span>Tipp</span>
            <span>Richtung</span>
            <span className="text-right">Status</span>
          </div>
          {misses.map((g, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-t border-edge px-1 py-2"
            >
              <span className="truncate font-display text-base font-medium uppercase tracking-wide">
                {g.cityName}
              </span>
              <span className="font-mono text-xs uppercase text-amber">
                {g.distanceKm.toLocaleString("de-DE")} km {g.direction}
              </span>
              <span className="justify-self-end rounded-sm border border-miss px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-miss">
                daneben
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="px-1 text-sm italic leading-relaxed text-dim">„{hostLine}“ — Marco</p>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-bg px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
        {dupNote && <p className="mb-1.5 font-mono text-[11px] text-amber">{dupNote}</p>}
        <div className="ticket relative rounded-xl bg-paper px-5 py-4 text-ink">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b6453]">
            Dein Tipp
          </p>
          <CityAutocomplete cities={cities} onGuess={handleGuess} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 4: Commit**

```bash
git add src/components/MetroLine.tsx src/components/GuessScreen.tsx
git commit -m "feat(ui): GuessScreen mit Metro-Linie, Tafel-Tabelle und Ticket-Leiste"
```

---

### Task 8: `CityAutocomplete` im Ticket-Look

**Files:**
- Modify: `src/components/CityAutocomplete.tsx`

Logik (Ranking, choose, Submit-Verhalten) bleibt **unverändert** — nur Klassen und die Länder-Darstellung (`, Portugal` statt `· Portugal`) ändern sich.

- [ ] **Step 1: Datei komplett ersetzen:**

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
    const rank = (c: City): number => {
      const names = [c.name, ...c.aliases].map(normalizeCityInput);
      if (names.some((n) => n === q)) return 0;
      if (names.some((n) => n.startsWith(q))) return 1;
      return 2;
    };
    return cities
      .filter((c) => [c.name, ...c.aliases].some((a) => normalizeCityInput(a).includes(q)))
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 8);
  }, [cities, query, selected]);

  function choose(c: City) {
    setSelected(c);
    setQuery(`${c.name}, ${c.country}`);
  }

  return (
    <div className="relative">
      <form
        className="mt-1 flex items-end gap-3"
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
          className="min-w-0 flex-1 border-0 border-b-2 border-ink/70 bg-transparent px-0.5 py-1.5 text-base text-ink outline-none placeholder:text-[#a39a85] focus:border-ink"
          aria-label="Stadt eingeben"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
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
          className="shrink-0 rounded-md bg-ink px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wider text-amber disabled:opacity-40"
        >
          Raten
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full z-10 mb-3 max-h-64 w-full overflow-hidden overflow-y-auto rounded-xl border border-edge bg-paper text-ink shadow-lg">
          {suggestions.map((c) => (
            <li key={`${c.name}|${c.country}`}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left hover:bg-ink/10"
                onClick={() => choose(c)}
              >
                {c.name}
                <span className="font-mono text-xs text-[#6b6453]">, {c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 3: Commit**

```bash
git add src/components/CityAutocomplete.tsx
git commit -m "feat(ui): Autocomplete im Ticket-Look mit Papier-Vorschlagsliste"
```

---

### Task 9: `RevealScreen`

**Files:**
- Modify: `src/components/RevealScreen.tsx`

Der Stadtname wird jetzt vom BoardHeader buchstabiert (passiert automatisch durch den Phasenwechsel, Task 4). Der Screen selbst zeigt Status-Chip + Punkte, Land, Durchsage, CTA.

- [ ] **Step 1: Datei komplett ersetzen:**

```tsx
import type { GameState, Puzzle } from "../types";
import { actOnePoints } from "../game/scoring";
import { HostBubble } from "./HostBubble";

export function RevealScreen({
  puzzle,
  state,
  onContinue,
}: {
  puzzle: Puzzle;
  state: GameState;
  onContinue: () => void;
}) {
  const solved = state.solvedAtHint !== null;
  const reactionLine = !solved
    ? puzzle.host.lose
    : state.solvedAtHint! <= 2
      ? puzzle.host.winEarly
      : state.solvedAtHint! <= 4
        ? puzzle.host.winMid
        : puzzle.host.winLate;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center justify-between rounded-lg border border-edge bg-cell px-4 py-3">
        {solved ? (
          <>
            <span className="rounded-sm border border-hit px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-hit">
              Angekommen
            </span>
            <span className="font-mono text-sm text-amber">
              +{actOnePoints(state.solvedAtHint)} Punkte
            </span>
          </>
        ) : (
          <>
            <span className="rounded-sm border border-miss px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-miss">
              Verpasst
            </span>
            <span className="font-mono text-sm text-dim">0 Punkte</span>
          </>
        )}
      </div>
      <p className="px-1 text-sm text-dim">
        {puzzle.city.name}, {puzzle.city.country}
      </p>
      <HostBubble>
        <p>{reactionLine}</p>
        <p className="mt-2">{puzzle.host.reveal}</p>
      </HostBubble>
      <button
        type="button"
        className="block w-full rounded-lg bg-amber py-3.5 font-display text-lg font-medium uppercase tracking-wide text-ink active:scale-95"
        onClick={onContinue}
      >
        Zur Bonusrunde
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 3: Commit**

```bash
git add src/components/RevealScreen.tsx
git commit -m "feat(ui): RevealScreen mit Status-Chip, Header buchstabiert das Ziel"
```

---

### Task 10: `QuizScreen` — Tafel-Zeilen, mono-Countdown, M3-Fix

**Files:**
- Modify: `src/components/QuizScreen.tsx`

Änderungen gegenüber heute: numerischer mono-Countdown statt Balken (rot + Puls unter 3 s), Antworten als Tafel-Zeilen mit Chips, und **neu:** die gewählte falsche Antwort wird markiert (lokaler `chosen`-State; nach einem Reload ist `chosen` weg — dann wird wie bisher nur die richtige markiert, dokumentierte Einschränkung). Timer-Logik (`QUESTION_MS`, Interval, `onAnswer(null)` bei Ablauf) bleibt identisch.

- [ ] **Step 1: Datei komplett ersetzen:**

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
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    setChosen(null);
  }, [state.quizIndex]);

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
  const secs = Math.max(0, Math.ceil(remaining / 1000));
  const urgent = !answered && remaining < 3000;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="rounded-xl border border-edge bg-cell p-4">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-dim">
          <span>
            Frage {state.quizIndex + 1} von {puzzle.quiz.length}
          </span>
          {!answered && (
            <span className={urgent ? "animate-timer-pulse text-miss" : "text-amber"}>
              0:{String(secs).padStart(2, "0")}
            </span>
          )}
        </div>
        <p className="mt-2 text-base font-bold leading-snug">{question.question}</p>
      </div>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            className={`rounded-lg border px-4 py-3 text-left text-sm leading-snug ${
              answered && i === question.answerIndex
                ? "border-hit bg-cell"
                : answered && i === chosen
                  ? "border-miss bg-cell"
                  : "border-edge bg-cell"
            } ${answered && i !== question.answerIndex && i !== chosen ? "opacity-50" : ""} ${
              answered ? "" : "active:scale-[0.99]"
            }`}
            onClick={() => {
              setChosen(i);
              onAnswer(i);
            }}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{choice}</span>
              {answered && i === question.answerIndex && (
                <span className="shrink-0 rounded-sm border border-hit px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-hit">
                  Richtig
                </span>
              )}
              {answered && i === chosen && i !== question.answerIndex && (
                <span className="shrink-0 rounded-sm border border-miss px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-miss">
                  Daneben
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {answered && (
        <>
          <HostBubble>{wasCorrect ? question.hostCorrect : question.hostWrong}</HostBubble>
          <button
            type="button"
            className="block w-full rounded-lg bg-amber py-3 font-display text-base font-medium uppercase tracking-wide text-ink active:scale-95"
            onClick={onNext}
          >
            {state.quizIndex === puzzle.quiz.length - 1 ? "Zum Ergebnis" : "Nächste Frage"}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 3: Commit**

```bash
git add src/components/QuizScreen.tsx
git commit -m "feat(ui): QuizScreen mit mono-Countdown und Markierung der falschen Wahl (M3)"
```

---

### Task 11: `ResultScreen` — Bordkarte mit Stempel

**Files:**
- Modify: `src/components/ResultScreen.tsx`

Countdown-, Share- und Clipboard-Logik bleiben **identisch** (inklusive des dokumentierten Mitternachts-Minors M5). Neu ist nur die Darstellung: Bordkarte, Stempel, Tafel-Countdown.

- [ ] **Step 1: Datei komplett ersetzen:**

```tsx
import { useEffect, useState } from "react";
import type { GameState, Puzzle, Stats } from "../types";
import { actOnePoints, quizPoints, totalPoints } from "../game/scoring";
import { formatBoardDate, formatPuzzleNumber } from "../game/format";
import { buildShareText } from "../game/share";
import { effectiveStreak } from "../game/stats";

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

  const solved = state.solvedAtHint !== null;
  const quizCorrect = quizPoints(state.quizAnswers);
  const streak = effectiveStreak(stats, state.puzzleDate);
  const shareText = buildShareText({
    number: puzzle.number,
    solvedAtHint: state.solvedAtHint,
    quizCorrect,
    streak: streak,
  });

  async function share() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        window.prompt("Zum Kopieren markieren:", shareText);
      } catch {
        // Umgebung ohne Zwischenablage und prompt(): Der Share-Text steht sichtbar im Screen.
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="ticket relative rounded-xl bg-paper px-5 py-4 text-ink">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6453]">
          <span>Bordkarte</span>
          <span>Rätsel {formatPuzzleNumber(puzzle.number)}</span>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b6453]">Ziel</p>
        <p className="font-display text-3xl font-medium uppercase leading-tight tracking-wide">
          {puzzle.city.name}
        </p>
        <p className="font-mono text-xs text-[#6b6453]">{puzzle.city.country}</p>
        <div className="mt-3 border-t border-dashed border-ink/30 pt-3">
          <div className="flex justify-between font-mono text-xs uppercase">
            <span>{formatBoardDate(puzzle.date)}</span>
            <span>Punkte {totalPoints(state.solvedAtHint, state.quizAnswers)}/9</span>
            <span>Serie {streak}</span>
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-xs uppercase text-[#6b6453]">
            <span>Stadt {actOnePoints(state.solvedAtHint)} P.</span>
            <span>Bonus {quizCorrect}/3</span>
          </div>
        </div>
        <div
          className={`stamp-in absolute right-3 top-8 rotate-[-8deg] rounded border-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
            solved ? "border-hit text-hit" : "border-miss text-miss"
          }`}
        >
          {solved ? "Angekommen" : "Verpasst"}
        </div>
      </div>

      <pre className="whitespace-pre-wrap rounded-lg border border-edge bg-cell p-3 text-left font-mono text-xs leading-relaxed">
        {shareText}
      </pre>

      <button
        type="button"
        className="block w-full rounded-lg bg-amber py-3.5 font-display text-lg font-medium uppercase tracking-wide text-ink active:scale-95"
        onClick={share}
      >
        {copied ? "Kopiert!" : "Teilen"}
      </button>
      <button
        type="button"
        className="mx-auto font-mono text-xs uppercase tracking-wider text-dim underline underline-offset-2"
        onClick={onShowStats}
      >
        Meine Statistik
      </button>
      <p className="text-center font-mono text-xs uppercase tracking-wider text-dim">
        Nächste Abfahrt in{" "}
        <span className="text-bright">{formatCountdown(msUntilNextMidnight(new Date(now)))}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultScreen.tsx
git commit -m "feat(ui): ResultScreen als Bordkarte mit Stempel-Animation"
```

---

### Task 12: `StatsModal` + `EmptyScreen`

**Files:**
- Modify: `src/components/StatsModal.tsx`
- Modify: `src/components/EmptyScreen.tsx`

- [ ] **Step 1: `StatsModal.tsx` komplett ersetzen** (Dialog-Semantik, Escape, Balken-Guard `count > 0` bleiben identisch):

```tsx
import { useEffect, useMemo } from "react";
import type { Stats } from "../types";
import { storageAvailable } from "../storage/storage";

export function StatsModal({ stats, streak, onClose }: { stats: Stats; streak: number; onClose: () => void }) {
  const persistenceMissing = useMemo(() => !storageAvailable(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const maxBar = Math.max(1, ...stats.solvedByHint);
  const solvedPercent = stats.played === 0 ? 0 : Math.round((stats.solved / stats.played) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Statistik"
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-edge bg-board p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium uppercase tracking-wide">Statistik</h3>
          <button type="button" aria-label="Schließen" className="text-dim" onClick={onClose}>
            ✕
          </button>
        </div>
        {persistenceMissing && (
          <p className="mb-3 text-xs leading-relaxed text-miss">
            Dein Browser speichert gerade nichts dauerhaft (Privatmodus?) — Statistik und Streak
            gehen beim Schließen verloren.
          </p>
        )}
        <div className="mb-5 grid grid-cols-4 gap-2 text-center">
          <Stat label="Gespielt" value={stats.played} />
          <Stat label="Gelöst" value={`${solvedPercent}%`} />
          <Stat label="Serie" value={streak} />
          <Stat label="Rekord" value={stats.maxStreak} />
        </div>
        <p className="-mt-3 mb-4 text-center font-mono text-[11px] text-dim">
          Ø {stats.played === 0 ? "–" : (stats.totalPoints / stats.played).toFixed(1).replace(".", ",")}{" "}
          Punkte pro Rätsel
        </p>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">
          Gelöst nach Hinweis …
        </p>
        <div className="flex flex-col gap-1.5">
          {stats.solvedByHint.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 font-mono text-dim">{i + 1}</span>
              <div className="h-4 flex-1 rounded-sm bg-cell">
                {count > 0 && (
                  <div
                    className="flex h-full items-center justify-end rounded-sm bg-amber pr-1.5 font-mono text-[10px] font-bold text-ink"
                    style={{ width: `${Math.max(12, (count / maxBar) * 100)}%` }}
                  >
                    {count}
                  </div>
                )}
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
    <div className="rounded-lg bg-cell px-1 py-2.5">
      <div className="font-mono text-xl font-bold">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div>
    </div>
  );
}
```

(Bewusste Wortänderung: „Streak“ → „Serie“, konsistent mit dem BoardHeader.)

- [ ] **Step 2: `EmptyScreen.tsx` komplett ersetzen:**

```tsx
import { FlapRow } from "./FlapRow";
import { HostBubble } from "./HostBubble";

export function EmptyScreen() {
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </div>
        <div className="mt-3">
          <span className="sr-only">Keine Abfahrt</span>
          <FlapRow text="Keine Abfahrt" />
        </div>
      </div>
      <HostBubble>
        Marco ist gerade noch unterwegs und sammelt neue Städte — für heute liegt leider kein
        Rätsel bereit. Schau bald wieder vorbei!
      </HostBubble>
    </div>
  );
}
```

- [ ] **Step 3: Prüfen** — Run: `npm test` und `npm run build` — Expected: PASS/Erfolg.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatsModal.tsx src/components/EmptyScreen.tsx
git commit -m "feat(ui): StatsModal und EmptyScreen im Tafel-Look"
```

---

### Task 13: Alt-Tokens entfernen + Gesamtverifikation

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Verwaiste Alt-Klassen suchen**

Run: `grep -rnE "night|night-soft|bg-card|text-card|border-card|accent|text-wrong|bg-wrong|border-correct|ink-dim|animate-card-in" src/ --include="*.tsx"`
Expected: **keine Treffer** (alle Komponenten sind umgestellt). Gibt es Treffer, ist eine Komponente vergessen worden — erst die Komponente fixen (gemäß den Tasks oben), dann hier weitermachen.

- [ ] **Step 2: In `src/index.css` entfernen:**
- den Block „Alt-Tokens — werden in Task 13 entfernt“ (die 8 `--color-night…--color-ink-dim`-Zeilen samt Kommentar),
- den Block „Alt — wird in Task 13 entfernt“ (`@keyframes card-in` + `.animate-card-in`),
- `.animate-card-in` aus der `prefers-reduced-motion`-Liste.

- [ ] **Step 3: Gesamtprüfung**

Run: `npm test` — Expected: PASS (67 Tests).
Run: `npm run build` — Expected: Erfolg.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "chore(ui): alte Design-Tokens entfernt"
```

---

## Abschluss (macht der Orchestrator, kein Subagent)

1. Finale Code-Review des gesamten Branches (Review-Subagent).
2. Browser-E2E im Pane: kompletter Playthrough (lösen + nicht lösen via Seed), Reload-Idempotenz, mobile 375 px + Desktop, `prefers-reduced-motion`-Emulation (Reveal zeigt Namen sofort), M3-Markierung sichtbar.
3. `superpowers:finishing-a-development-branch` — User entscheidet über Merge/Go-Live.
