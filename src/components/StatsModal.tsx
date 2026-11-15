import { useEffect, useMemo } from "react";
import type { Stats } from "../types";
import { storageAvailable } from "../storage/storage";

export function StatsModal({ stats, streak, onClose }: { stats: Stats; streak: number; onClose: () => void }) {
  const persistenceMissing = useMemo(() => !storageAvailable(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const maxBar = Math.max(1, ...stats.solvedByHint);
  const solvedPercent = stats.played === 0 ? 0 : Math.round((stats.solved / stats.played) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Statistik"
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-edge bg-board p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium uppercase tracking-wide">Statistik</h3>
          <button type="button" aria-label="Schließen" className="text-dim" onClick={onClose}>
            ✕
          </button>
        </div>
        {persistenceMissing && (
          <p className="mb-3 text-xs leading-relaxed text-miss">
            Dein Browser speichert gerade nichts dauerhaft (Privatmodus?) — Statistik und Streak
            gehen beim Schließen verloren.
          </p>
        )}
        <div className="mb-5 grid grid-cols-4 gap-2 text-center">
          <Stat label="Gespielt" value={stats.played} />
          <Stat label="Gelöst" value={`${solvedPercent}%`} />
          <Stat label="Serie" value={streak} />
          <Stat label="Rekord" value={stats.maxStreak} />
        </div>
        <p className="-mt-3 mb-4 text-center font-mono text-[11px] text-dim">
          Ø {stats.played === 0 ? "–" : (stats.totalPoints / stats.played).toFixed(1).replace(".", ",")}{" "}
          Punkte pro Rätsel
        </p>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-dim">
          Gelöst nach Hinweis …
        </p>
        <div className="flex flex-col gap-1.5">
          {stats.solvedByHint.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 font-mono text-dim">{i + 1}</span>
              <div className="h-4 flex-1 rounded-sm bg-cell">
                {count > 0 && (
                  <div
                    className="flex h-full items-center justify-end rounded-sm bg-amber pr-1.5 font-mono text-[10px] font-bold text-ink"
                    style={{ width: `${Math.max(12, (count / maxBar) * 100)}%` }}
                  >
                    {count}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-cell px-1 py-2.5">
      <div className="font-mono text-xl font-bold">{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div>
    </div>
  );
}
