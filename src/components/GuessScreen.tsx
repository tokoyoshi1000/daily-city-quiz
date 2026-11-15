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
        {dupNote && (
          <p role="status" className="mb-1.5 font-mono text-[11px] text-amber">
            {dupNote}
          </p>
        )}
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
