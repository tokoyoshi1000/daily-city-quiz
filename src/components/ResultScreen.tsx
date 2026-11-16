import { useEffect, useState } from "react";
import type { GameState, Puzzle, Stats } from "../types";
import { actOnePoints, quizPoints, totalPoints } from "../game/scoring";
import { formatBoardDate, formatPuzzleNumber } from "../game/format";
import { buildShareText } from "../game/share";
import { effectiveStreak } from "../game/stats";
import { InstallHint } from "./InstallHint";

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
        <p className="pr-24 font-display text-3xl font-medium uppercase leading-tight tracking-wide">
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
          className={`stamp-in absolute right-3 top-5 rotate-[-8deg] rounded border-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${
            solved ? "border-[#1f7a45] text-[#1f7a45]" : "border-[#c0392b] text-[#c0392b]"
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
      <InstallHint />
    </div>
  );
}
