import type { Puzzle, Stats } from "../types";
import { HostBubble } from "./HostBubble";

export function StartScreen({ puzzle, onStart }: { puzzle: Puzzle; stats?: Stats; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="text-center">
        <div className="text-6xl">🏙️</div>
        <h2 className="mt-3 text-2xl font-bold">Rätsel #{puzzle.number}</h2>
        <p className="text-sm text-ink-dim">{puzzle.date.split("-").reverse().join(".")}</p>
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
