import { HostBubble } from "./HostBubble";

export function EmptyScreen() {
  return (
    <div className="flex flex-col gap-6 pt-16 text-center">
      <div className="text-6xl">🌍</div>
      <h1 className="text-2xl font-bold">Daily City Quiz</h1>
      <HostBubble>
        Marco ist gerade noch unterwegs und sammelt neue Städte — für heute liegt leider kein
        Rätsel bereit. Schau bald wieder vorbei!
      </HostBubble>
    </div>
  );
}
