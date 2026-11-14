export interface City {
  name: string;
  aliases: string[];
  country: string;
  lat: number;
  lng: number;
}

export interface QuizQuestion {
  question: string;
  choices: string[]; // genau 4 (per Datentest erzwungen)
  answerIndex: number; // 0..3
  hostCorrect: string;
  hostWrong: string;
}

export interface PuzzleHost {
  intro: string;
  wrongGuess: string[]; // mind. 5
  winEarly: string; // gelöst nach Hinweis 1–2
  winMid: string; // 3–4
  winLate: string; // 5–6
  lose: string;
  reveal: string; // Auflösungs-Anekdote
}

export interface Puzzle {
  number: number;
  date: string; // YYYY-MM-DD, lokales Datum
  city: City;
  hints: string[]; // genau 6, Reihenfolge: Klima, Kulinarik, Geschichte, Zahlen, Persönlichkeit, Wahrzeichen
  quiz: QuizQuestion[]; // genau 3
  host: PuzzleHost;
}

export interface GuessRecord {
  cityName: string;
  distanceKm: number; // gerundet, 0 bei Treffer
  direction: string; // z. B. "südwestlich", "" bei Treffer
  correct: boolean;
}

export type GamePhase = "start" | "guessing" | "reveal" | "quiz" | "result";

export interface GameState {
  puzzleDate: string;
  phase: GamePhase;
  hintsRevealed: number; // 0 vor Start, 1..6 während Akt 1
  guesses: GuessRecord[];
  solvedAtHint: number | null; // 1..6 oder null (nicht/noch nicht gelöst)
  quizIndex: number; // 0..2
  quizAnswers: boolean[]; // Korrektheit der bisher beantworteten Fragen
}

export interface Stats {
  played: number;
  solved: number;
  solvedByHint: number[]; // Länge 6, Index 0 = gelöst nach Hinweis 1
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null; // Datum des letzten abgeschlossenen Rätsels
  totalPoints: number;
}
