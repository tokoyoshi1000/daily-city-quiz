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
  // chosen wird nicht gespeichert: Nach einem Reload ist nur die richtige
  // Antwort markiert (bewusste Einschränkung, siehe Plan Task 10).
  const [chosen, setChosen] = useState<number | null>(null);

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
  const secs = Math.max(0, Math.ceil(remaining / 1000));
  const urgent = !answered && remaining < 3000;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="rounded-xl border border-edge bg-cell p-4">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider text-dim">
          <span>
            Frage {state.quizIndex + 1} von {puzzle.quiz.length}
          </span>
          {!answered && (
            <span className={urgent ? "animate-timer-pulse text-miss" : "text-amber"}>
              0:{String(secs).padStart(2, "0")}
            </span>
          )}
        </div>
        <p className="mt-2 text-base font-bold leading-snug">{question.question}</p>
      </div>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            className={`rounded-lg border px-4 py-3 text-left text-sm leading-snug ${
              answered && i === question.answerIndex
                ? "border-hit bg-cell"
                : answered && i === chosen
                  ? "border-miss bg-cell"
                  : "border-edge bg-cell"
            } ${answered && i !== question.answerIndex && i !== chosen ? "opacity-50" : ""} ${
              answered ? "" : "active:scale-[0.99]"
            }`}
            onClick={() => {
              setChosen(i);
              onAnswer(i);
            }}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{choice}</span>
              {answered && i === question.answerIndex && (
                <span className="shrink-0 rounded-sm border border-hit px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-hit">
                  Richtig
                </span>
              )}
              {answered && i === chosen && i !== question.answerIndex && (
                <span className="shrink-0 rounded-sm border border-miss px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-miss">
                  Daneben
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {answered && (
        <>
          <HostBubble>{wasCorrect ? question.hostCorrect : question.hostWrong}</HostBubble>
          <button
            type="button"
            className="block w-full rounded-lg bg-amber py-3 font-display text-base font-medium uppercase tracking-wide text-ink active:scale-95"
            onClick={onNext}
          >
            {state.quizIndex === puzzle.quiz.length - 1 ? "Zum Ergebnis" : "Nächste Frage"}
          </button>
        </>
      )}
    </div>
  );
}
