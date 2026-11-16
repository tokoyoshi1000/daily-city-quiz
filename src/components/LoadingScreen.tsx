import { useEffect, useState } from "react";

/** Erscheint erst nach 300 ms — bei schnellem Netz soll nichts aufblitzen. */
export function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <div className="flex flex-col gap-6 pt-14">
      <div className="rounded-xl border border-edge bg-board p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber">
          Daily City Quiz
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-dim">
          Anzeigetafel wird geladen …
        </p>
      </div>
    </div>
  );
}
