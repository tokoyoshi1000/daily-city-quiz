import { useState } from "react";
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
          <div key={i} className="animate-card-in rounded-xl bg-card p-4">
            <div className="mb-1 text-xs text-ink-dim">
              Hinweis {i + 1} · {HINT_LABELS[i]}
            </div>
            <div className="text-sm leading-relaxed">{hint}</div>
          </div>
        ))}
      </div>

      {misses.length > 0 && (
        <div className="flex flex-col gap-1.5 text-sm text-ink-dim">
          {misses.map((g, i) => (
            <div key={i}>
              📍 {g.cityName} · Ziel ca. {g.distanceKm.toLocaleString("de-DE")} km {g.direction}
            </div>
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-night px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
        {dupNote && <p className="mb-2 text-xs text-accent-soft">{dupNote}</p>}
        <CityAutocomplete cities={cities} onGuess={handleGuess} />
      </div>
    </div>
  );
}
