import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { submitAnswerSchema } from "@shared/schema";
import { calculateNewDifficulty, calculateScoreDelta, computeMomentum } from "./adaptive";
import { seedDatabase } from "./seed";
import { verifyAnswer, findCorrectAnswer } from "./answer-hash";
import { cache } from "./cache";
import crypto from "crypto";

const STREAK_DECAY_THRESHOLD_MS = 30 * 60 * 1000;
const STREAK_DECAY_AMOUNT = 1;

export function applyStreakDecay(state: any): { decayed: boolean; newStreak: number } {
  if (!state.lastAnswerAt || state.streak === 0) {
    return { decayed: false, newStreak: state.streak };
  }
  const lastAnswer = new Date(state.lastAnswerAt).getTime();
  const elapsed = Date.now() - lastAnswer;
  if (elapsed > STREAK_DECAY_THRESHOLD_MS) {
    const intervals = Math.floor(elapsed / STREAK_DECAY_THRESHOLD_MS);
    const decayedStreak = Math.max(0, state.streak - intervals * STREAK_DECAY_AMOUNT);
    return { decayed: decayedStreak !== state.streak, newStreak: decayedStreak };
  }
  return { decayed: false, newStreak: state.streak };
}

async function ensureStreakDecayApplied(userId: string): Promise<any> {
  let state = cache.userState.get(userId);
  if (!state) {
    state = await storage.getUserState(userId);
    if (state) cache.userState.set(userId, state);
  }
  if (!state) return null;

  const { decayed, newStreak } = applyStreakDecay(state);
  if (decayed) {
    state = await storage.upsertUserState(userId, { streak: newStreak });
    cache.userState.set(userId, state);
    cache.metrics.invalidate(userId);
  }
  return state;
}

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const answerLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many answer submissions, please slow down." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/quiz/answer", answerLimiter);
  app.use("/api/", apiLimiter);

  setupAuth(app);

  await seedDatabase();

  app.get("/api/quiz/next", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;

      let state = await ensureStreakDecayApplied(userId);

      if (!state) {
        state = await storage.upsertUserState(userId, {
          currentDifficulty: 1,
          streak: 0,
          maxStreak: 0,
          totalScore: 0,
        });
        cache.userState.set(userId, state);
      }

      const sessionId = `${userId}-${state.stateVersion}`;

      const roundedDiff = Math.max(1, Math.min(10, Math.round(state.currentDifficulty)));
      let poolQuestions = cache.questionPool.get(roundedDiff);
      if (!poolQuestions) {
        poolQuestions = await storage.getQuestionsByDifficulty(roundedDiff);
        if (poolQuestions.length > 0) {
          cache.questionPool.set(roundedDiff, poolQuestions);
        }
      }

      let question;
      if (poolQuestions && poolQuestions.length > 0) {
        let filtered = poolQuestions;
        if (state.lastQuestionId) {
          filtered = poolQuestions.filter((q: any) => q.id !== state.lastQuestionId);
          if (filtered.length === 0) filtered = poolQuestions;
        }
        question = filtered[Math.floor(Math.random() * filtered.length)];
      }

      if (!question) {
        question = await storage.getRandomQuestion(
          state.currentDifficulty,
          state.lastQuestionId
        );
      }

      if (!question) {
        return res.status(404).json({ message: "No questions available" });
      }

      res.json({
        questionId: question.id,
        difficulty: question.difficulty,
        prompt: question.prompt,
        choices: question.choices,
        sessionId,
        stateVersion: state.stateVersion,
        currentScore: state.totalScore,
        currentStreak: state.streak,
        tags: question.tags,
        currentDifficulty: state.currentDifficulty,
        maxStreak: state.maxStreak,
      });
    } catch (error) {
      console.error("Error getting next question:", error);
      res.status(500).json({ message: "Failed to get next question" });
    }
  });

  app.post("/api/quiz/answer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const parsed = submitAnswerSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { questionId, answer, sessionId, stateVersion, answerIdempotencyKey } = parsed.data;

      const idempotencyResult = cache.idempotency.get(`idem:${userId}:${answerIdempotencyKey}`);
      if (idempotencyResult) {
        return res.json(idempotencyResult);
      }

      let state = await ensureStreakDecayApplied(userId);
      if (!state) {
        state = await storage.getUserState(userId);
      }
      if (!state) {
        return res.status(400).json({ message: "No active quiz session" });
      }

      const expectedSessionId = `${userId}-${state.stateVersion}`;
      if (expectedSessionId !== sessionId) {
        return res.status(409).json({ message: "Session mismatch" });
      }

      if (state.stateVersion !== stateVersion) {
        return res.status(409).json({ message: "Stale state version" });
      }

      const question = await storage.getQuestionById(questionId);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const correct = verifyAnswer(answer, question.correctAnswerHash);
      const correctAnswerIndex = findCorrectAnswer(question.correctAnswerHash);

      const newStreak = correct ? state.streak + 1 : 0;
      const newMaxStreak = Math.max(state.maxStreak, newStreak);

      const scoreDelta = calculateScoreDelta(correct, question.difficulty, correct ? newStreak : state.streak);
      const newTotalScore = Math.max(0, state.totalScore + scoreDelta);

      const recentAnswers = await storage.getRecentAnswers(userId, 10);
      recentAnswers.unshift({ correct });
      const momentum = computeMomentum(recentAnswers);

      const { newDifficulty } = calculateNewDifficulty(
        state.currentDifficulty,
        correct,
        newStreak,
        momentum
      );

      await storage.insertAnswerLog({
        userId,
        questionId,
        difficulty: question.difficulty,
        answer,
        correct,
        scoreDelta,
        streakAtAnswer: newStreak,
      });

      const updatedState = await storage.atomicUpdateUserState(userId, stateVersion, {
        currentDifficulty: newDifficulty,
        streak: newStreak,
        maxStreak: newMaxStreak,
        totalScore: newTotalScore,
        lastQuestionId: questionId,
        lastAnswerAt: new Date(),
      });

      if (!updatedState) {
        return res.status(409).json({ message: "Concurrent state modification detected, please retry" });
      }

      cache.userState.set(userId, updatedState);
      cache.metrics.invalidate(userId);

      await storage.updateLeaderboard(userId, newTotalScore, newMaxStreak);
      cache.leaderboard.invalidate();

      const [leaderboardRankScore, leaderboardRankStreak, answerStats] = await Promise.all([
        storage.getUserScoreRank(userId),
        storage.getUserStreakRank(userId),
        storage.getUserAnswerStats(userId),
      ]);

      const accuracy = answerStats.totalAnswered > 0 ? answerStats.totalCorrect / answerStats.totalAnswered : 0;

      const response = {
        correct,
        correctAnswer: correctAnswerIndex,
        newDifficulty,
        newStreak,
        scoreDelta,
        totalScore: newTotalScore,
        stateVersion: updatedState.stateVersion,
        leaderboardRankScore,
        leaderboardRankStreak,
        maxStreak: newMaxStreak,
        accuracy,
      };

      cache.idempotency.set(`idem:${userId}:${answerIdempotencyKey}`, response);

      res.json(response);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.get("/api/quiz/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;

      const cachedMetrics = cache.metrics.get(userId);
      if (cachedMetrics) {
        return res.json(cachedMetrics);
      }

      const state = await storage.getUserState(userId);

      if (!state) {
        const emptyMetrics = {
          currentDifficulty: 1,
          streak: 0,
          maxStreak: 0,
          totalScore: 0,
          accuracy: 0,
          difficultyHistogram: [],
          recentPerformance: [],
          totalAnswered: 0,
          totalCorrect: 0,
        };
        return res.json(emptyMetrics);
      }

      const [answerStats, difficultyHistogram, recentPerformance] = await Promise.all([
        storage.getUserAnswerStats(userId),
        storage.getDifficultyHistogram(userId),
        storage.getRecentPerformance(userId, 20),
      ]);

      const metrics = {
        currentDifficulty: state.currentDifficulty,
        streak: state.streak,
        maxStreak: state.maxStreak,
        totalScore: state.totalScore,
        accuracy: answerStats.totalAnswered > 0 ? answerStats.totalCorrect / answerStats.totalAnswered : 0,
        difficultyHistogram,
        recentPerformance,
        totalAnswered: answerStats.totalAnswered,
        totalCorrect: answerStats.totalCorrect,
      };

      cache.metrics.set(userId, metrics);
      res.json(metrics);
    } catch (error) {
      console.error("Error getting metrics:", error);
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  app.get("/api/leaderboard/score", isAuthenticated, async (req: any, res) => {
    try {
      const cachedBoard = cache.leaderboard.get("score", 20);
      if (cachedBoard) {
        return res.json(cachedBoard);
      }

      const board = await storage.getScoreLeaderboard(20);
      cache.leaderboard.set("score", 20, board);
      res.json(board);
    } catch (error) {
      console.error("Error getting score leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  app.get("/api/leaderboard/streak", isAuthenticated, async (req: any, res) => {
    try {
      const cachedBoard = cache.leaderboard.get("streak", 20);
      if (cachedBoard) {
        return res.json(cachedBoard);
      }

      const board = await storage.getStreakLeaderboard(20);
      cache.leaderboard.set("streak", 20, board);
      res.json(board);
    } catch (error) {
      console.error("Error getting streak leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  return httpServer;
}
