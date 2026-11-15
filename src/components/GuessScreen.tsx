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

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-night px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2">
        <CityAutocomplete cities={cities} onGuess={onGuess} />
      </div>
    </div>
  );
}
