import type { Stats } from "../types";
import { storageAvailable } from "../storage/storage";

export function StatsModal({ stats, onClose }: { stats: Stats; onClose: () => void }) {
  const maxBar = Math.max(1, ...stats.solvedByHint);
  const solvedPercent = stats.played === 0 ? 0 : Math.round((stats.solved / stats.played) * 100);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-night-soft p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">📊 Statistik</h3>
          <button type="button" aria-label="Schließen" onClick={onClose}>
            ✕
          </button>
        </div>
        {!storageAvailable() && (
          <p className="mb-3 text-xs text-wrong">
            ⚠️ Dein Browser speichert gerade nichts dauerhaft (Privatmodus?) — Statistik und Streak
            gehen beim Schließen verloren.
          </p>
        )}
        <div className="mb-5 grid grid-cols-4 gap-2 text-center">
          <Stat label="Gespielt" value={stats.played} />
          <Stat label="Gelöst" value={`${solvedPercent}%`} />
          <Stat label="Streak" value={stats.currentStreak} />
          <Stat label="Rekord" value={stats.maxStreak} />
        </div>
        <p className="mb-2 text-xs text-ink-dim">Gelöst nach Hinweis …</p>
        <div className="flex flex-col gap-1.5">
          {stats.solvedByHint.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-ink-dim">{i + 1}</span>
              <div className="h-4 flex-1 rounded bg-card">
                <div
                  className="flex h-full items-center justify-end rounded bg-accent pr-1.5 text-[10px] font-bold text-night"
                  style={{ width: `${Math.max(count > 0 ? 12 : 0, (count / maxBar) * 100)}%` }}
                >
                  {count > 0 ? count : ""}
                </div>
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
    <div className="rounded-xl bg-card px-1 py-2.5">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-ink-dim">{label}</div>
    </div>
  );
}
