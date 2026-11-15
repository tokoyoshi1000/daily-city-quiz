import { useMemo, useState } from "react";
import type { City } from "../types";
import { normalizeCityInput } from "../game/normalize";

export function CityAutocomplete({ cities, onGuess }: { cities: City[]; onGuess: (c: City) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<City | null>(null);

  const suggestions = useMemo(() => {
    const q = normalizeCityInput(query);
    if (selected || q.length < 2) return [];
    return cities
      .filter((c) => [c.name, ...c.aliases].some((a) => normalizeCityInput(a).includes(q)))
      .slice(0, 8);
  }, [cities, query, selected]);

  function choose(c: City) {
    setSelected(c);
    setQuery(`${c.name}, ${c.country}`);
  }

  return (
    <div className="relative">
      <form
        className="flex gap-2"
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
          className="min-w-0 flex-1 rounded-xl border border-card bg-night-soft px-4 py-3 outline-none focus:border-accent"
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
          className="rounded-xl bg-accent px-5 font-bold text-night disabled:opacity-40"
        >
          Raten
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full z-10 mb-2 w-full overflow-hidden rounded-xl border border-card bg-night-soft">
          {suggestions.map((c) => (
            <li key={`${c.name}|${c.country}`}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left hover:bg-card"
                onClick={() => choose(c)}
              >
                {c.name} <span className="text-sm text-ink-dim">· {c.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
