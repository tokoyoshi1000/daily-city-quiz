import { describe, expect, it } from "vitest";
import { createGameReducer, createInitialState } from "./reducer";
import type { City, Puzzle } from "../types";

const lissabon: City = { name: "Lissabon", aliases: ["Lisbon"], country: "Portugal", lat: 38.7223, lng: -9.1393 };
const warschau: City = { name: "Warschau", aliases: ["Warsaw"], country: "Polen", lat: 52.2297, lng: 21.0122 };
const wrongCities: City[] = [
  warschau,
  { name: "Berlin", aliases: [], country: "Deutschland", lat: 52.52, lng: 13.405 },
  { name: "Madrid", aliases: [], country: "Spanien", lat: 40.4168, lng: -3.7038 },
  { name: "Rom", aliases: ["Rome", "Roma"], country: "Italien", lat: 41.9028, lng: 12.4964 },
  { name: "Wien", aliases: ["Vienna"], country: "Österreich", lat: 48.2082, lng: 16.3738 },
  { name: "Prag", aliases: ["Prague", "Praha"], country: "Tschechien", lat: 50.0755, lng: 14.4378 },
];

const puzzle: Puzzle = {
  number: 1,
  date: "2026-11-14",
  city: lissabon,
  hints: ["h1", "h2", "h3", "h4", "h5", "h6"],
  quiz: [
    { question: "q1", choices: ["a", "b", "c", "d"], answerIndex: 0, hostCorrect: "", hostWrong: "" },
    { question: "q2", choices: ["a", "b", "c", "d"], answerIndex: 1, hostCorrect: "", hostWrong: "" },
    { question: "q3", choices: ["a", "b", "c", "d"], answerIndex: 2, hostCorrect: "", hostWrong: "" },
  ],
  host: { intro: "", wrongGuess: ["w1", "w2", "w3", "w4", "w5"], winEarly: "", winMid: "", winLate: "", lose: "", reveal: "" },
};

const reduce = createGameReducer(puzzle);

describe("Akt 1", () => {
  it("START deckt den ersten Hinweis auf", () => {
    const s = reduce(createInitialState("2026-11-14"), { type: "START" });
    expect(s.phase).toBe("guessing");
    expect(s.hintsRevealed).toBe(1);
  });

  it("falscher Versuch: Distanz-Feedback + nächster Hinweis", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: warschau });
    expect(s.phase).toBe("guessing");
    expect(s.hintsRevealed).toBe(2);
    expect(s.guesses).toHaveLength(1);
    expect(s.guesses[0].correct).toBe(false);
    expect(s.guesses[0].cityName).toBe("Warschau");
    expect(s.guesses[0].distanceKm).toBeGreaterThan(0);
    expect(s.guesses[0].direction).toBe("westlich");
  });

  it("richtiger Versuch löst und merkt sich die Hinweis-Nummer", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: warschau });
    s = reduce(s, { type: "GUESS", city: lissabon });
    expect(s.phase).toBe("reveal");
    expect(s.solvedAtHint).toBe(2);
    expect(s.guesses[1].correct).toBe(true);
  });

  it("sechster Fehlversuch beendet Akt 1 ungelöst", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    for (const c of wrongCities) s = reduce(s, { type: "GUESS", city: c });
    expect(s.phase).toBe("reveal");
    expect(s.solvedAtHint).toBeNull();
    expect(s.guesses).toHaveLength(6);
  });

  it("GUESS außerhalb von Akt 1 wird ignoriert", () => {
    const start = createInitialState("2026-11-14");
    expect(reduce(start, { type: "GUESS", city: warschau })).toBe(start);
  });

  it("doppelter Tipp derselben Stadt wird ignoriert", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: warschau });
    expect(reduce(s, { type: "GUESS", city: warschau })).toBe(s);
  });

  it("START im laufenden Spiel wird ignoriert", () => {
    const s = reduce(createInitialState("2026-11-14"), { type: "START" });
    expect(reduce(s, { type: "START" })).toBe(s);
  });

  it("Treffer beim sechsten Hinweis ergibt solvedAtHint 6", () => {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    for (const c of wrongCities.slice(0, 5)) s = reduce(s, { type: "GUESS", city: c });
    s = reduce(s, { type: "GUESS", city: lissabon });
    expect(s.phase).toBe("reveal");
    expect(s.solvedAtHint).toBe(6);
  });
});

describe("Akt 2", () => {
  function reachQuiz() {
    let s = reduce(createInitialState("2026-11-14"), { type: "START" });
    s = reduce(s, { type: "GUESS", city: lissabon });
    return reduce(s, { type: "CONTINUE_TO_QUIZ" });
  }

  it("CONTINUE_TO_QUIZ wechselt in die Quiz-Phase", () => {
    expect(reachQuiz().phase).toBe("quiz");
  });

  it("ANSWER bewertet die Antwort, Timeout (null) zählt falsch", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 }); // richtig
    expect(s.quizAnswers).toEqual([true]);
    s = reduce(s, { type: "NEXT" });
    expect(s.quizIndex).toBe(1);
    s = reduce(s, { type: "ANSWER", choiceIndex: null }); // Timeout
    expect(s.quizAnswers).toEqual([true, false]);
  });

  it("doppeltes ANSWER für dieselbe Frage wird ignoriert", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 });
    const again = reduce(s, { type: "ANSWER", choiceIndex: 3 });
    expect(again).toBe(s);
  });

  it("nach der dritten Frage führt NEXT zum Ergebnis", () => {
    let s = reachQuiz();
    s = reduce(s, { type: "ANSWER", choiceIndex: 0 });
    s = reduce(s, { type: "NEXT" });
    s = reduce(s, { type: "ANSWER", choiceIndex: 1 });
    s = reduce(s, { type: "NEXT" });
    s = reduce(s, { type: "ANSWER", choiceIndex: 3 });
    s = reduce(s, { type: "NEXT" });
    expect(s.phase).toBe("result");
    expect(s.quizAnswers).toEqual([true, true, false]);
  });

  it("NEXT ohne Antwort wird ignoriert", () => {
    const s = reachQuiz();
    expect(reduce(s, { type: "NEXT" })).toBe(s);
  });

  it("ANSWER bei quizIndex außerhalb des Quiz wird ignoriert", () => {
    const s = { ...reachQuiz(), quizIndex: 3, quizAnswers: [true, true, true] };
    expect(reduce(s, { type: "ANSWER", choiceIndex: 0 })).toBe(s);
  });
});
