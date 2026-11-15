import { useMemo, useState } from "react";
import type { City } from "../types";
import { normalizeCityInput } from "../game/normalize";

export function CityAutocomplete({ cities, onGuess }: { cities: City[]; onGuess: (c: City) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<City | null>(null);

  const suggestions = useMemo(() => {
    const q = normalizeCityInput(query);
    if (selected || q.length < 2) return [];
    const rank = (c: City): number => {
      const names = [c.name, ...c.aliases].map(normalizeCityInput);
      if (names.some((n) => n === q)) return 0;
      if (names.some((n) => n.startsWith(q))) return 1;
      return 2;
    };
    return cities
      .filter((c) => [c.name, ...c.aliases].some((a) => normalizeCityInput(a).includes(q)))
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 8);
  }, [cities, query, selected]);

  function choose(c: City) {
    setSelected(c);
    setQuery(`${c.name}, ${c.country}`);
  }

  return (
    <div className="relative">
      <form
        className="mt-1 flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!selected && suggestions.length > 0) {
            choose(suggestions[0]);
          } else if (selected) {
            onGuess(selected);
            setSelected(null);
            setQuery("");
          }
        }}
      >
        <input
          className="min-w-0 flex-1 border-0 border-b-2 border-ink/70 bg-transparent px-0.5 py-1.5 text-base text-ink placeholder:text-[#756d5a] focus:border-ink"
          aria-label="Stadt eingeben"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Stadt eingeben …"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
        />
        <button
          type="submit"
          disabled={!selected}
          className="shrink-0 rounded-md bg-ink px-5 py-2.5 font-display text-sm font-medium uppercase tracking-wider text-amber disabled:opacity-40"
        >
          Raten
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full z-10 mb-3 max-h-[min(16rem,40dvh)] w-full overflow-hidden overflow-y-auto rounded-xl border border-edge bg-paper text-ink shadow-lg">
          {suggestions.map((c) => (
            <li key={`${c.name}|${c.country}`}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left hover:bg-ink/10 focus-visible:bg-ink/10 focus-visible:-outline-offset-2"
                onClick={() => choose(c)}
              >
                {c.name}
                <span className="font-mono text-xs text-[#6b6453]">, {c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
