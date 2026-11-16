import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { City, GameState, Puzzle, Stats } from "./types";
import { createGameReducer, createInitialState, type GameAction } from "./game/reducer";
import { localDateString, puzzleForDate } from "./game/dates";
import { applyCompletedGame, effectiveStreak } from "./game/stats";
import { totalPoints } from "./game/scoring";
import { loadGameState, loadStats, saveGameState, saveStats } from "./storage/storage";
import { loadGameData, type GameData } from "./data/loader";
import { track } from "./analytics";
import { EmptyScreen } from "./components/EmptyScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { StartScreen } from "./components/StartScreen";
import { GuessScreen } from "./components/GuessScreen";
import { RevealScreen } from "./components/RevealScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultScreen } from "./components/ResultScreen";
import { StatsModal } from "./components/StatsModal";
import { BoardHeader } from "./components/BoardHeader";

export default function App() {
  const [data, setData] = useState<GameData | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => {
    setFailed(false);
    loadGameData()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (failed)
    return (
      <Shell>
        <ErrorScreen onRetry={load} />
      </Shell>
    );
  if (!data)
    return (
      <Shell>
        <LoadingScreen />
      </Shell>
    );
  return <Ready data={data} />;
}

function Ready({ data }: { data: GameData }) {
  const today = localDateString();
  const puzzle = puzzleForDate(data.puzzles, today);
  if (!puzzle)
    return (
      <Shell>
        <EmptyScreen />
      </Shell>
    );
  return <Game key={today} puzzle={puzzle} cities={data.cities} today={today} />;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-dvh w-full max-w-md px-4 py-6">{children}</div>;
}

function Game({ puzzle, cities, today }: { puzzle: Puzzle; cities: City[]; today: string }) {
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

  // Analytics: nur echte Phasenübergänge zählen. Der Ref-Guard sorgt dafür,
  // dass weder StrictMode-Doppelläufe noch ein Reload mitten im Spiel tracken.
  const prevPhase = useRef(state.phase);
  useEffect(() => {
    const was = prevPhase.current;
    prevPhase.current = state.phase;
    if (was === state.phase) return;
    if (was === "start" && state.phase === "guessing") track("spiel-gestartet");
    if (was === "guessing" && state.phase === "reveal") {
      track(state.solvedAtHint === null ? "verloren" : `geloest-h${state.solvedAtHint}`);
    }
    if (was === "quiz" && state.phase === "result") track("quiz-beendet");
  }, [state.phase, state.solvedAtHint]);

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

  const revealed =
    state.phase === "reveal" || state.phase === "quiz" || state.phase === "result";

  return (
    <Shell>
      <div className="mb-4">
        <BoardHeader
          puzzle={puzzle}
          streak={effectiveStreak(stats, today)}
          revealed={revealed}
          onShowStats={() => setShowStats(true)}
        />
      </div>

      {state.phase === "start" && (
        <StartScreen puzzle={puzzle} onStart={() => send({ type: "START" })} />
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
          key={state.quizIndex}
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
