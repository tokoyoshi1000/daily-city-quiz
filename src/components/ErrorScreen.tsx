import { HostBubble } from "./HostBubble";

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-miss">Signalstörung</p>
      </div>
      <HostBubble>
        Die Anzeigetafel ist gerade nicht erreichbar — vermutlich eine Störung auf der Strecke.
        Bitte versuch es gleich noch einmal.
      </HostBubble>
      <button
        type="button"
        className="block w-full rounded-lg bg-amber py-3 font-display text-base font-medium uppercase tracking-wide text-ink active:scale-95"
        onClick={onRetry}
      >
        Erneut versuchen
      </button>
    </div>
  );
}
