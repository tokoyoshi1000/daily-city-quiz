import type { ReactNode } from "react";

export function HostBubble({
  children,
  sig = "Marco, Reiseleitung",
}: {
  children: ReactNode;
  sig?: string | null;
}) {
  return (
    <div className="rounded-xl border border-edge bg-cell p-4">
      <span className="inline-block rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink">
        Durchsage
      </span>
      <div className="mt-2 min-w-0 break-words text-[15px] leading-relaxed">{children}</div>
      {sig && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-dim">{sig}</p>
      )}
    </div>
  );
}
