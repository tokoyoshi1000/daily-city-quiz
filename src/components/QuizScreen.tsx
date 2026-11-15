import { useEffect, useState } from "react";
import type { GameState, Puzzle } from "../types";
import { HostBubble } from "./HostBubble";

const QUESTION_MS = 10_000;

export function QuizScreen({
  puzzle,
  state,
  onAnswer,
  onNext,
}: {
  puzzle: Puzzle;
  state: GameState;
  onAnswer: (choiceIndex: number | null) => void;
  onNext: () => void;
}) {
  const question = puzzle.quiz[state.quizIndex];
  const answered = state.quizAnswers.length > state.quizIndex;
  const [remaining, setRemaining] = useState(QUESTION_MS);

  useEffect(() => {
    if (answered) return;
    const start = Date.now();
    setRemaining(QUESTION_MS);
    const id = setInterval(() => {
      const left = QUESTION_MS - (Date.now() - start);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onAnswer(null);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.quizIndex, answered]);

  const wasCorrect = answered && state.quizAnswers[state.quizIndex];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="text-xs text-ink-dim">Bonus-Frage {state.quizIndex + 1} / 3</div>
      {!answered && (
        <div className="h-2 overflow-hidden rounded-full bg-card">
          <div
            className="h-full bg-accent transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.max(0, (remaining / QUESTION_MS) * 100)}%` }}
          />
        </div>
      )}
      <div className="rounded-xl bg-card p-4 text-lg font-semibold">{question.question}</div>
      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            className={`rounded-xl border-2 bg-night-soft px-4 py-3 text-left ${
              answered && i === question.answerIndex ? "border-correct" : "border-transparent"
            } ${answered ? "opacity-80" : "active:scale-[0.99]"}`}
            onClick={() => onAnswer(i)}
          >
            {choice}
          </button>
        ))}
      </div>
      {answered && (
        <>
          <HostBubble>{wasCorrect ? question.hostCorrect : question.hostWrong}</HostBubble>
          <button
            type="button"
            className="rounded-xl bg-accent py-3 font-bold text-night active:scale-95"
            onClick={onNext}
          >
            {state.quizIndex === 2 ? "Zum Ergebnis 🏁" : "Nächste Frage →"}
          </button>
        </>
      )}
    </div>
  );
}
