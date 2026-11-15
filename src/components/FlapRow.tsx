import { useEffect, useRef, useState } from "react";

const CYCLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ";
const LOCK_MS = 90;
const CYCLE_MS = 45;

function useSpelledText(text: string): string {
  const target = text.toUpperCase();
  const [display, setDisplay] = useState(target);
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const isChange = prev.current !== null && prev.current !== target;
    prev.current = target;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!isChange || reduced) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      const locked = Math.min(target.length, Math.floor(t / LOCK_MS));
      let out = target.slice(0, locked);
      for (let i = locked; i < target.length; i++) {
        // Nur Buchstaben cyceln; Leerzeichen, Bindestriche, Klammern usw. stehen fest.
        // `i * 7` streut die Zufallszeichen, damit nicht alle Zellen synchron laufen.
        out += /[A-ZÄÖÜ]/.test(target[i])
          ? CYCLE_CHARS[Math.floor(t / CYCLE_MS + i * 7) % CYCLE_CHARS.length]
          : target[i];
      }
      setDisplay(out);
      if (locked < target.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return display;
}

/**
 * Fallblatt-Zeile. `intro` lässt die Zellen beim Einhängen zweimal flippen
 * (Startscreen-Moment); ein Textwechsel nach dem ersten Render buchstabiert
 * sich automatisch (Reveal-Moment). Zellen sind dekorativ (aria-hidden) —
 * den lesbaren Text liefert der Aufrufer.
 */
export function FlapRow({ text, intro = false }: { text: string; intro?: boolean }) {
  const display = useSpelledText(text);
  // Aus display statt text abgeleitet: toUpperCase() kann die Länge ändern (ß → SS).
  const small = display.length > 8;
  return (
    <span aria-hidden className="flex flex-wrap gap-1">
      {Array.from(display).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="w-2" />
        ) : (
          <span
            key={i}
            className={`flap relative grid place-items-center rounded bg-cell font-display font-medium text-amber ${
              small ? "h-8 w-[22px] text-base" : "h-10 w-7 text-xl"
            } ${intro ? "flap-intro" : ""}`}
            style={intro ? { animationDelay: `${0.3 + i * 0.12}s` } : undefined}
          >
            {ch}
          </span>
        )
      )}
    </span>
  );
}
