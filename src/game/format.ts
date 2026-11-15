const WEEKDAYS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
const MONTHS = ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"];

/** Tafel-Code für ein YYYY-MM-DD-Datum, z. B. "SO 15. NOV" (Rechnung in UTC-Mittag, DST-sicher). */
export function formatBoardDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

/** Rätselnummer als Tafel-Code, z. B. "001". */
export function formatPuzzleNumber(n: number): string {
  return String(n).padStart(3, "0");
}
