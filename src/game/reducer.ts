import type { City, GameState, Puzzle } from "../types";
import { describeMiss } from "./geo";
import { isSameCity } from "./normalize";

export type GameAction =
  | { type: "START" }
  | { type: "GUESS"; city: City }
  | { type: "CONTINUE_TO_QUIZ" }
  | { type: "ANSWER"; choiceIndex: number | null }
  | { type: "NEXT" };

export function createInitialState(puzzleDate: string): GameState {
  return {
    puzzleDate,
    phase: "start",
    hintsRevealed: 0,
    guesses: [],
    solvedAtHint: null,
    quizIndex: 0,
    quizAnswers: [],
  };
}

export function createGameReducer(puzzle: Puzzle) {
  return function reduce(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case "START": {
        if (state.phase !== "start") return state;
        return { ...state, phase: "guessing", hintsRevealed: 1 };
      }
      case "GUESS": {
        if (state.phase !== "guessing") return state;
        if (state.guesses.some((g) => g.cityName === action.city.name && g.country === action.city.country)) return state; // doppelter Tipp kostet keinen Hinweis
        if (isSameCity(action.city, puzzle.city)) {
          const guesses = [...state.guesses, { cityName: action.city.name, country: action.city.country, distanceKm: 0, direction: "", correct: true }];
          return { ...state, guesses, solvedAtHint: state.hintsRevealed, phase: "reveal" };
        }
        const miss = describeMiss(action.city, puzzle.city);
        const guesses = [...state.guesses, { cityName: action.city.name, country: action.city.country, ...miss, correct: false }];
        if (state.hintsRevealed >= 6) return { ...state, guesses, phase: "reveal" };
        return { ...state, guesses, hintsRevealed: state.hintsRevealed + 1 };
      }
      case "CONTINUE_TO_QUIZ": {
        if (state.phase !== "reveal") return state;
        return { ...state, phase: "quiz" };
      }
      case "ANSWER": {
        if (state.phase !== "quiz") return state;
        if (state.quizIndex >= puzzle.quiz.length) return state; // defekter/manipulierter Zustand
        if (state.quizAnswers.length > state.quizIndex) return state; // Frage schon beantwortet
        const correct = action.choiceIndex === puzzle.quiz[state.quizIndex].answerIndex;
        return { ...state, quizAnswers: [...state.quizAnswers, correct] };
      }
      case "NEXT": {
        if (state.phase !== "quiz") return state;
        if (state.quizAnswers.length <= state.quizIndex) return state; // noch keine Antwort
        if (state.quizAnswers.length >= puzzle.quiz.length) return { ...state, phase: "result" };
        return { ...state, quizIndex: state.quizIndex + 1 };
      }
      default:
        return state;
    }
  };
}
