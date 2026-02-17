import { z } from "zod";

export type User = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UpsertUser = {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export type Question = {
  id: string;
  difficulty: number;
  prompt: string;
  choices: string[];
  correctAnswerHash: string;
  tags: string[];
};

export type InsertQuestion = Omit<Question, "id">;

export type UserState = {
  userId: string;
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  lastQuestionId: string | null;
  lastAnswerAt: Date | null;
  stateVersion: number;
};

export type InsertAnswerLog = {
  userId: string;
  questionId: string;
  difficulty: number;
  answer: number;
  correct: boolean;
  scoreDelta: number;
  streakAtAnswer: number;
};

export type AnswerLog = InsertAnswerLog & {
  id: string;
  answeredAt: Date;
};

export type LeaderboardScoreEntry = {
  userId: string;
  totalScore: number;
  updatedAt: Date | null;
};

export type LeaderboardStreakEntry = {
  userId: string;
  maxStreak: number;
  updatedAt: Date | null;
};

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.number(),
  sessionId: z.string(),
  stateVersion: z.number(),
  answerIdempotencyKey: z.string(),
});

export type SubmitAnswerRequest = z.infer<typeof submitAnswerSchema>;

export type QuizNextResponse = {
  questionId: string;
  difficulty: number;
  prompt: string;
  choices: string[];
  sessionId: string;
  stateVersion: number;
  currentScore: number;
  currentStreak: number;
  tags: string[];
  currentDifficulty: number;
  maxStreak: number;
};

export type SubmitAnswerResponse = {
  correct: boolean;
  correctAnswer: number;
  newDifficulty: number;
  newStreak: number;
  scoreDelta: number;
  totalScore: number;
  stateVersion: number;
  leaderboardRankScore: number;
  leaderboardRankStreak: number;
  maxStreak: number;
  accuracy: number;
};

export type DifficultyHistogramEntry = {
  difficulty: number;
  count: number;
};

export type RecentPerformanceEntry = {
  questionId: string;
  difficulty: number;
  correct: boolean;
  scoreDelta: number;
  answeredAt: string;
};

export type UserMetrics = {
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  accuracy: number;
  difficultyHistogram: DifficultyHistogramEntry[];
  recentPerformance: RecentPerformanceEntry[];
  totalAnswered: number;
  totalCorrect: number;
};
