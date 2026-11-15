export interface ShareInput {
  number: number;
  solvedAtHint: number | null;
  quizCorrect: number;
  streak: number;
}

export function buildShareText(input: ShareInput): string {
  const solved = input.solvedAtHint !== null;
  const grid = solved
    ? "✖️".repeat(input.solvedAtHint! - 1) + "✅"
    : "✖️".repeat(6);
  const act1 = solved ? `${input.solvedAtHint}/6` : "X/6";
  return `🌍 Daily City Quiz #${input.number}\n🏙️ ${grid} ${act1} · 🧠 ${input.quizCorrect}/3 · 🔥 ${input.streak}`;
}
