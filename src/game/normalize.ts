import type { City } from "../types";

export function normalizeCityInput(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function cityMatchesInput(city: City, input: string): boolean {
  const n = normalizeCityInput(input);
  return [city.name, ...city.aliases].some((a) => normalizeCityInput(a) === n);
}

export function isSameCity(a: City, b: City): boolean {
  return a.name === b.name && a.country === b.country;
}
