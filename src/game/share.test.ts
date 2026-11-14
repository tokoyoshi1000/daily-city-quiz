import { describe, expect, it } from "vitest";
import { buildShareText } from "./share";

describe("buildShareText", () => {
  it("gelöst nach Hinweis 4", () => {
    expect(buildShareText({ number: 42, solvedAtHint: 4, quizCorrect: 2, streak: 7 })).toBe(
      "🌍 Daily City Quiz #42\n🏙️ ✖️✖️✖️✅ 4/6 · 🧠 2/3 · 🔥 7"
    );
  });
  it("gelöst nach Hinweis 1", () => {
    expect(buildShareText({ number: 1, solvedAtHint: 1, quizCorrect: 3, streak: 1 })).toBe(
      "🌍 Daily City Quiz #1\n🏙️ ✅ 1/6 · 🧠 3/3 · 🔥 1"
    );
  });
  it("nicht gelöst", () => {
    expect(buildShareText({ number: 9, solvedAtHint: null, quizCorrect: 0, streak: 2 })).toBe(
      "🌍 Daily City Quiz #9\n🏙️ ✖️✖️✖️✖️✖️✖️ X/6 · 🧠 0/3 · 🔥 2"
    );
  });
});
