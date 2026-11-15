/**
 * Haltestellen-Fortschritt: `filled` Stationen sind erreicht (amber),
 * die zuletzt erreichte pulsiert als aktuelle Station.
 */
export function MetroLine({ total, filled }: { total: number; filled: number }) {
  const pct = total > 1 ? ((Math.max(1, filled) - 1) / (total - 1)) * 100 : 0;
  return (
    <div className="px-1">
      <div className="relative h-4" aria-hidden="true">
        <div className="absolute inset-x-2 top-[7px] h-0.5 bg-edge" />
        <div className="absolute inset-x-2 top-[7px]">
          <div className="h-0.5 bg-amber" style={{ width: `${pct}%` }} />
        </div>
        <div className="absolute inset-0 flex items-start justify-between">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 ${
                i < filled ? "border-amber bg-amber" : "border-[#5f6671] bg-bg"
              } ${i === filled - 1 ? "station-now" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between font-mono text-[10px] text-dim" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="w-4 text-center">
            {i + 1}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-dim">
        Haltestelle {filled} von {total}
      </p>
    </div>
  );
}
