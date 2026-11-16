// src/dev/assetStudio.ts
// Dev-Werkzeug: erzeugt OG-Bild, Icons und Share-Card-Vorschauen.
// Die Fonts müssen hier explizit importiert werden — die Seite nutzt nicht main.tsx.
import "@fontsource-variable/oswald";
import "@fontsource/b612-mono";
import {
  buildShareCardLayout,
  CARD,
  CARD_H,
  CARD_W,
  displayFont,
  drawFlapCell,
  drawShareCard,
  ensureCardFonts,
  monoFont,
} from "../game/shareCard";

function ctx2d(id: string, w: number, h: number, cssWidth?: string): CanvasRenderingContext2D {
  const c = document.getElementById(id) as HTMLCanvasElement;
  c.width = w;
  c.height = h;
  if (cssWidth) c.style.width = cssWidth;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error(`kein 2D-Kontext für #${id}`);
  return ctx;
}

function wireDownload(canvasId: string, linkId: string, filename: string): void {
  const c = document.getElementById(canvasId) as HTMLCanvasElement;
  const a = document.getElementById(linkId) as HTMLAnchorElement;
  a.href = c.toDataURL("image/png");
  a.download = filename;
}

function drawOg(): void {
  const W = 1200;
  const H = 630;
  const ctx = ctx2d("og", W, H, "600px");
  ctx.fillStyle = CARD.bg;
  ctx.fillRect(0, 0, W, H);

  // Board-Panel
  const px = 80;
  const py = 100;
  const pw = W - 160;
  const ph = H - 200;
  ctx.fillStyle = CARD.board;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 24);
  ctx.fill();
  ctx.strokeStyle = CARD.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fallblatt-Zellen "DAILY CITY QUIZ"
  const text = "DAILY CITY QUIZ";
  const cw = 56;
  const chh = 80;
  const gap = 10;
  const space = 26;
  let total = 0;
  for (const ch of text) total += ch === " " ? space : cw + gap;
  total -= gap;
  let x = (W - total) / 2;
  const y = py + 90;
  ctx.textBaseline = "top";
  for (const ch of text) {
    if (ch === " ") {
      x += space;
      continue;
    }
    drawFlapCell(ctx, x, y, cw, chh, ch, 44);
    x += cw + gap;
  }

  // Unterzeile
  ctx.fillStyle = CARD.dim;
  ctx.font = monoFont(26);
  ctx.textAlign = "center";
  ctx.fillText("ERRATE DIE STADT DES TAGES · 6 HINWEISE · JEDEN TAG NEU", W / 2, y + chh + 70);
  ctx.textAlign = "left";
}

/** Icon: Fallblatt-Zelle mit amberfarbenem „D". contentScale < 1 für maskable (Safe-Zone). */
function drawIcon(id: string, size: number, contentScale = 1): void {
  const ctx = ctx2d(id, size, size);
  ctx.fillStyle = CARD.cell;
  ctx.fillRect(0, 0, size, size);
  const s = size * contentScale;
  const off = (size - s) / 2;
  ctx.fillStyle = CARD.amber;
  ctx.font = displayFont(Math.round(s * 0.62));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("D", size / 2, size / 2 + s * 0.03);
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(off, size / 2 - Math.max(1, s * 0.012), s, Math.max(2, s * 0.024));
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

async function main(): Promise<void> {
  await ensureCardFonts();
  drawOg();
  drawIcon("icon-32", 32);
  drawIcon("icon-180", 180);
  drawIcon("icon-192", 192);
  drawIcon("icon-512", 512);
  drawIcon("icon-mask", 512, 0.78);

  const win = buildShareCardLayout({
    number: 2,
    date: "2026-11-16",
    solvedAtHint: 3,
    quizAnswers: [true, true, false],
  });
  const lose = buildShareCardLayout({
    number: 2,
    date: "2026-11-16",
    solvedAtHint: null,
    quizAnswers: [true, false, false],
  });
  drawShareCard(ctx2d("card-win", CARD_W, CARD_H, "360px"), win);
  drawShareCard(ctx2d("card-lose", CARD_W, CARD_H, "360px"), lose);

  wireDownload("og", "og-dl", "og.png");
  wireDownload("icon-32", "icon-32-dl", "favicon.png");
  wireDownload("icon-180", "icon-180-dl", "apple-touch-icon.png");
  wireDownload("icon-192", "icon-192-dl", "icon-192.png");
  wireDownload("icon-512", "icon-512-dl", "icon-512.png");
  wireDownload("icon-mask", "icon-mask-dl", "icon-maskable-512.png");
}

main().catch((e) => console.error("Asset-Studio:", e));
