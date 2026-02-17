const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;
const MAX_STREAK_MULTIPLIER = 3;
const HYSTERESIS_BAND = 0.3;
const MIN_STREAK_TO_INCREASE = 2;

export function calculateStreakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.1, MAX_STREAK_MULTIPLIER);
}

export function calculateScoreDelta(
  correct: boolean,
  difficulty: number,
  streak: number
): number {
  if (!correct) return -10;

  const difficultyWeight = difficulty;
  const streakMultiplier = calculateStreakMultiplier(streak);
  return difficultyWeight * 10 * streakMultiplier;
}

export function computeMomentum(recentAnswers: { correct: boolean }[]): number {
  if (recentAnswers.length === 0) return 0;

  const DECAY = 0.7;
  const CORRECT_BOOST = 0.3;
  const WRONG_PENALTY = -0.5;

  let momentum = 0;
  const reversed = [...recentAnswers].reverse();
  for (const answer of reversed) {
    momentum = momentum * DECAY + (answer.correct ? CORRECT_BOOST : WRONG_PENALTY);
  }
  return Math.max(-1, Math.min(1, momentum));
}

export function calculateNewDifficulty(
  currentDifficulty: number,
  correct: boolean,
  streak: number,
  momentum: number
): { newDifficulty: number } {
  let newDifficulty = currentDifficulty;

  if (correct && streak >= MIN_STREAK_TO_INCREASE && momentum > HYSTERESIS_BAND) {
    const step = 0.5 + (momentum - HYSTERESIS_BAND) * 0.5;
    newDifficulty = currentDifficulty + step;
  } else if (!correct && momentum < -HYSTERESIS_BAND) {
    const step = 0.5 + (Math.abs(momentum) - HYSTERESIS_BAND) * 0.5;
    newDifficulty = currentDifficulty - step;
  }

  newDifficulty = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, newDifficulty));

  return { newDifficulty };
}
