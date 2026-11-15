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
