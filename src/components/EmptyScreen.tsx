import { FlapRow } from "./FlapRow";
import { HostBubble } from "./HostBubble";

export function EmptyScreen() {
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </div>
        <div className="mt-3">
          <span className="sr-only">Keine Abfahrt</span>
          <FlapRow text="Keine Abfahrt" />
        </div>
      </div>
      <HostBubble>
        Marco ist gerade noch unterwegs und sammelt neue Städte — für heute liegt leider kein
        Rätsel bereit. Schau bald wieder vorbei!
      </HostBubble>
    </div>
  );
}
