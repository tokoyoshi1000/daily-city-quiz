// src/game/shareCard.ts
import { formatBoardDate, formatPuzzleNumber } from "./format";
import { quizPoints, totalPoints } from "./scoring";

/**
 * Farb-Konstanten für Canvas-Zeichnung (Canvas kennt keine CSS-Variablen).
 * Quelle: @theme-Tokens in src/index.css plus Papier-Sonderfarben aus ResultScreen.
 */
export const CARD = {
  bg: "#131519",
  board: "#0f1113",
  cell: "#1a1d21",
  edge: "#24282e",
  amber: "#ffc83d",
  bright: "#e8e9eb",
  dim: "#9aa0a8",
  paper: "#f7f3e8",
  ink: "#15171a",
  inkSoft: "#6b6453",
  hit: "#1f7a45",
  miss: "#c0392b",
} as const;

export function monoFont(px: number): string {
  return `${px}px "B612 Mono", ui-monospace, monospace`;
}

export function displayFont(px: number, weight = 500): string {
  return `${weight} ${px}px "Oswald Variable", Oswald, sans-serif`;
}

export interface ShareCardInput {
  number: number;
  date: string; // YYYY-MM-DD
  solvedAtHint: number | null; // 1..6 oder null
  quizAnswers: boolean[];
}

/**
 * Alles Textliche/Entscheidbare der Bordkarten-Grafik — pur und testbar.
 * WICHTIG (Spoiler-Schutz): Der Stadtname taucht hier bewusst NICHT auf;
 * die Grafik zeigt stattdessen ???-Fallblattzellen.
 */
export interface ShareCardLayout {
  headerRight: string; // "RÄTSEL 002"
  dateLabel: string; // "MO 16. NOV"
  solved: boolean;
  stampText: "ANGEKOMMEN" | "VERPASST";
  stampColor: string;
  hitStation: number | null; // 1..6
  pointsLine: string; // "6 PUNKTE · QUIZ 2/3"
}

export function buildShareCardLayout(input: ShareCardInput): ShareCardLayout {
  const solved = input.solvedAtHint !== null;
  const points = totalPoints(input.solvedAtHint, input.quizAnswers);
  const quiz = quizPoints(input.quizAnswers);
  return {
    headerRight: `RÄTSEL ${formatPuzzleNumber(input.number)}`,
    dateLabel: formatBoardDate(input.date),
    solved,
    stampText: solved ? "ANGEKOMMEN" : "VERPASST",
    stampColor: solved ? CARD.hit : CARD.miss,
    hitStation: input.solvedAtHint,
    pointsLine: `${points} ${points === 1 ? "PUNKT" : "PUNKTE"} · QUIZ ${quiz}/3`,
  };
}
