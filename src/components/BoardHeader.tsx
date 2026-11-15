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
