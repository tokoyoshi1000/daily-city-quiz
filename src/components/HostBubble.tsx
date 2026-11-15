import type { ReactNode } from "react";

export function HostBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 text-3xl" aria-hidden>
        🧭
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
