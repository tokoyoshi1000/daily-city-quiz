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
