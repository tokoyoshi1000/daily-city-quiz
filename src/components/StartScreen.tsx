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
