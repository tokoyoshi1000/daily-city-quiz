export function actOnePoints(solvedAtHint: number | null): number {
  return solvedAtHint === null ? 0 : 7 - solvedAtHint;
}

export function quizPoints(quizAnswers: boolean[]): number {
  return quizAnswers.filter(Boolean).length;
}

export function totalPoints(solvedAtHint: number | null, quizAnswers: boolean[]): number {
  return actOnePoints(solvedAtHint) + quizPoints(quizAnswers);
}
