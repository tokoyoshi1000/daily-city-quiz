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

// --- ab hier: Canvas-Rendering (ans Ende von src/game/shareCard.ts) ---

export const CARD_W = 1080;
export const CARD_H = 1350;

/**
 * Lädt die beiden Webfonts explizit für Canvas-Nutzung. document.fonts.ready
 * reicht nicht: @font-face lädt erst bei Benutzung, und Canvas löst das
 * Nachladen nicht selbst aus.
 */
export async function ensureCardFonts(): Promise<void> {
  const fonts = (globalThis as { document?: Document }).document?.fonts;
  if (!fonts?.load) return;
  await Promise.all([
    fonts.load('500 120px "Oswald Variable"'),
    fonts.load('400 40px "B612 Mono"'),
  ]);
}

/** Eine Fallblatt-Zelle: dunkle Kachel, Zeichen in Amber, Teilungslinie darüber. */
export function drawFlapCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ch: string,
  fontPx: number
): void {
  ctx.fillStyle = CARD.cell;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.round(w * 0.08));
  ctx.fill();
  ctx.fillStyle = CARD.amber;
  ctx.font = displayFont(fontPx);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, x + w / 2, y + h / 2 + fontPx * 0.04);
  // Teilungslinie zuletzt — sie liegt wie beim CSS-::after ÜBER dem Zeichen.
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(x, y + h / 2 - h * 0.012, w, Math.max(2, h * 0.024));
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

/** Gedrehter Grenz-Stempel (wie auf der Bordkarte im Spiel). */
export function drawStamp(
  ctx: CanvasRenderingContext2D,
  text: string,
  color: string,
  cx: number,
  cy: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.font = monoFont(30);
  const w = ctx.measureText(text).width + 48;
  const h = 64;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

/** Zeichnet die komplette Bordkarten-Grafik auf einen 1080×1350-Kontext. */
export function drawShareCard(ctx: CanvasRenderingContext2D, layout: ShareCardLayout): void {
  const W = CARD_W;
  const H = CARD_H;

  // Dunkler Hintergrund
  ctx.fillStyle = CARD.bg;
  ctx.fillRect(0, 0, W, H);

  // Kopfzeile auf dunklem Grund
  ctx.textBaseline = "top";
  ctx.fillStyle = CARD.amber;
  ctx.font = monoFont(30);
  ctx.fillText("DAILY CITY QUIZ", 70, 72);
  ctx.fillStyle = CARD.dim;
  ctx.textAlign = "right";
  ctx.fillText(layout.headerRight, W - 70, 72);
  ctx.textAlign = "left";

  // Papier-Bordkarte mit seitlichen Kerben
  const px = 70;
  const py = 160;
  const pw = W - 140;
  const ph = 950;
  ctx.fillStyle = CARD.paper;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 28);
  ctx.fill();
  ctx.fillStyle = CARD.bg;
  for (const nx of [px, px + pw]) {
    ctx.beginPath();
    ctx.arc(nx, py + ph / 2, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bordkarten-Kopf
  ctx.fillStyle = CARD.inkSoft;
  ctx.font = monoFont(26);
  ctx.fillText("BORDKARTE", px + 56, py + 56);
  ctx.textAlign = "right";
  ctx.fillText(layout.dateLabel, px + pw - 56, py + 56);
  ctx.textAlign = "left";

  // ZIEL + ???-Fallblattzellen (Spoiler-Schutz: nie der Stadtname)
  ctx.fillText("ZIEL", px + 56, py + 150);
  const cellW = 150;
  const cellH = 210;
  const gap = 18;
  const cellsY = py + 205;
  for (let i = 0; i < 3; i++) {
    drawFlapCell(ctx, px + 56 + i * (cellW + gap), cellsY, cellW, cellH, "?", 120);
  }

  // Stempel rechts neben den Zellen
  drawStamp(ctx, layout.stampText, layout.stampColor, px + pw - 210, cellsY + 70);

  // Metro-Linie mit 6 Stationen
  const lineY = py + 560;
  const lineX0 = px + 80;
  const lineX1 = px + pw - 80;
  ctx.strokeStyle = CARD.inkSoft;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(lineX0, lineY);
  ctx.lineTo(lineX1, lineY);
  ctx.stroke();
  for (let s = 1; s <= 6; s++) {
    const sx = lineX0 + ((s - 1) / 5) * (lineX1 - lineX0);
    const isHit = layout.hitStation === s;
    const passed = layout.hitStation !== null && s < layout.hitStation;
    ctx.beginPath();
    ctx.arc(sx, lineY, isHit ? 22 : 14, 0, Math.PI * 2);
    ctx.fillStyle = isHit || passed ? CARD.amber : CARD.paper;
    ctx.fill();
    ctx.strokeStyle = isHit ? CARD.ink : CARD.inkSoft;
    ctx.lineWidth = isHit ? 6 : 4;
    ctx.stroke();
    ctx.fillStyle = CARD.inkSoft;
    ctx.font = monoFont(24);
    ctx.textAlign = "center";
    ctx.fillText(`H${s}`, sx, lineY + 44);
    ctx.textAlign = "left";
  }

  // Perforation + Punktzeile
  const perfY = py + 730;
  ctx.strokeStyle = "rgba(21, 23, 26, 0.3)";
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(px + 56, perfY);
  ctx.lineTo(px + pw - 56, perfY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = CARD.ink;
  ctx.font = monoFont(40);
  ctx.textAlign = "center";
  ctx.fillText(layout.pointsLine, W / 2, perfY + 70);

  // Fußzeile auf dunklem Grund
  ctx.fillStyle = CARD.dim;
  ctx.font = monoFont(30);
  ctx.fillText("tokoyoshi1000.github.io/daily-city-quiz", W / 2, py + ph + 90);
  ctx.textAlign = "left";
}

/** Rendert die Grafik in ein frisches Canvas und liefert ein PNG-Blob. */
export async function renderShareCard(layout: ShareCardLayout): Promise<Blob> {
  await ensureCardFonts();
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D nicht verfügbar");
  drawShareCard(ctx, layout);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG-Export fehlgeschlagen"))),
      "image/png"
    );
  });
}
