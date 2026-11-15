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
