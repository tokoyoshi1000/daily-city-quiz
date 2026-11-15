import { useEffect, useMemo, useReducer, useState } from "react";
import type { ReactNode } from "react";
import type { City, GameState, Puzzle, Stats } from "./types";
import { createGameReducer, createInitialState, type GameAction } from "./game/reducer";
import { localDateString, puzzleForDate } from "./game/dates";
import { applyCompletedGame, effectiveStreak } from "./game/stats";
import { totalPoints } from "./game/scoring";
import { loadGameState, loadStats, saveGameState, saveStats } from "./storage/storage";
import { EmptyScreen } from "./components/EmptyScreen";
import { StartScreen } from "./components/StartScreen";
import { GuessScreen } from "./components/GuessScreen";
import { RevealScreen } from "./components/RevealScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StatsModal } from "./components/StatsModal";
import puzzlesJson from "./data/puzzles.json";
import citiesJson from "./data/cities.json";

const puzzles = (puzzlesJson as { puzzles: Puzzle[] }).puzzles;
const cities = citiesJson as City[];

export default function App() {
  const today = localDateString();
  const puzzle = puzzleForDate(puzzles, today);
  if (!puzzle) return <Shell><EmptyScreen /></Shell>;
  return <Game key={today} puzzle={puzzle} today={today} />;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-6">{children}</div>;
}

function Game({ puzzle, today }: { puzzle: Puzzle; today: string }) {
  const reducer = useMemo(() => createGameReducer(puzzle), [puzzle]);
  const [state, dispatch] = useReducer(reducer, undefined, (): GameState => {
    const saved = loadGameState();
    return saved && saved.puzzleDate === today ? saved : createInitialState(today);
  });
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (state.phase !== "result") return;
    setStats((prev) => {
      const next = applyCompletedGame(prev, {
        date: state.puzzleDate,
        solvedAtHint: state.solvedAtHint,
        points: totalPoints(state.solvedAtHint, state.quizAnswers),
      });
      if (next !== prev) saveStats(next);
      return next;
    });
  }, [state.phase, state.puzzleDate, state.solvedAtHint, state.quizAnswers]);

  const send = (action: GameAction) => dispatch(action);

  return (
    <Shell>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold">🌍 Daily City Quiz</h1>
        <div className="flex items-center gap-3 text-sm">
          <span title="Streak">🔥 {effectiveStreak(stats, today)}</span>
          <button type="button" aria-label="Statistik" onClick={() => setShowStats(true)}>
            📊
          </button>
        </div>
      </header>

      {state.phase === "start" && (
        <StartScreen puzzle={puzzle} stats={stats} onStart={() => send({ type: "START" })} />
      )}
      {state.phase === "guessing" && (
        <GuessScreen
          puzzle={puzzle}
          state={state}
          cities={cities}
          onGuess={(city) => send({ type: "GUESS", city })}
        />
      )}
      {state.phase === "reveal" && (
        <RevealScreen puzzle={puzzle} state={state} onContinue={() => send({ type: "CONTINUE_TO_QUIZ" })} />
      )}
      {state.phase === "quiz" && (
        <QuizScreen
          puzzle={puzzle}
          state={state}
          onAnswer={(choiceIndex) => send({ type: "ANSWER", choiceIndex })}
          onNext={() => send({ type: "NEXT" })}
        />
      )}
      {state.phase === "result" && (
        <ResultScreen puzzle={puzzle} state={state} stats={stats} onShowStats={() => setShowStats(true)} />
      )}

      {showStats && <StatsModal stats={stats} streak={effectiveStreak(stats, today)} onClose={() => setShowStats(false)} />}
    </Shell>
  );
}
