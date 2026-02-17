import {
  type Question, type InsertQuestion, type UserState, type InsertAnswerLog,
  type LeaderboardScoreEntry, type LeaderboardStreakEntry,
  type DifficultyHistogramEntry, type RecentPerformanceEntry,
  type User, type UpsertUser,
} from "@shared/schema";
import {
  UserModel, QuestionModel, UserStateModel, AnswerLogModel,
  LeaderboardScoreModel, LeaderboardStreakModel,
} from "./models";

function userDocToUser(doc: any): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    username: doc.username,
    passwordHash: doc.passwordHash,
    firstName: doc.firstName || null,
    lastName: doc.lastName || null,
    profileImageUrl: doc.profileImageUrl || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

function questionDocToQuestion(doc: any): Question {
  return {
    id: doc._id.toString(),
    difficulty: doc.difficulty,
    prompt: doc.prompt,
    choices: doc.choices,
    correctAnswerHash: doc.correctAnswerHash,
    tags: doc.tags,
  };
}

function stateDocToUserState(doc: any): UserState {
  return {
    userId: doc.userId,
    currentDifficulty: doc.currentDifficulty,
    streak: doc.streak,
    maxStreak: doc.maxStreak,
    totalScore: doc.totalScore,
    lastQuestionId: doc.lastQuestionId || null,
    lastAnswerAt: doc.lastAnswerAt || null,
    stateVersion: doc.stateVersion,
  };
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;

  getQuestionById(id: string): Promise<Question | undefined>;
  getQuestionsByDifficulty(difficulty: number): Promise<Question[]>;
  getRandomQuestion(difficulty: number, excludeId?: string | null): Promise<Question | undefined>;
  insertQuestions(data: InsertQuestion[]): Promise<void>;
  getQuestionCount(): Promise<number>;

  getUserState(userId: string): Promise<UserState | undefined>;
  upsertUserState(userId: string, state: Partial<UserState>): Promise<UserState>;

  insertAnswerLog(data: InsertAnswerLog): Promise<void>;
  checkAnswerExists(userId: string, questionId: string, answeredAfter: Date): Promise<boolean>;

  getUserAnswerStats(userId: string): Promise<{ totalAnswered: number; totalCorrect: number }>;
  getDifficultyHistogram(userId: string): Promise<DifficultyHistogramEntry[]>;
  getRecentPerformance(userId: string, limit: number): Promise<RecentPerformanceEntry[]>;
  getRecentAnswers(userId: string, limit: number): Promise<{ correct: boolean }[]>;

  getScoreLeaderboard(limit: number): Promise<(LeaderboardScoreEntry & { displayName: string | null; profileImage: string | null })[]>;
  getStreakLeaderboard(limit: number): Promise<(LeaderboardStreakEntry & { displayName: string | null; profileImage: string | null })[]>;
  updateLeaderboard(userId: string, totalScore: number, maxStreak: number): Promise<void>;
  getUserScoreRank(userId: string): Promise<number>;
  getUserStreakRank(userId: string): Promise<number>;

  atomicUpdateUserState(userId: string, expectedVersion: number, state: Partial<UserState>): Promise<UserState | null>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findById(id);
    return doc ? userDocToUser(doc) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ email });
    return doc ? userDocToUser(doc) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ username });
    return doc ? userDocToUser(doc) : undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const doc = await UserModel.create(userData);
    return userDocToUser(doc);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const doc = await QuestionModel.findById(id);
    return doc ? questionDocToQuestion(doc) : undefined;
  }

  async getQuestionsByDifficulty(difficulty: number): Promise<Question[]> {
    const docs = await QuestionModel.find({ difficulty });
    return docs.map(questionDocToQuestion);
  }

  async getRandomQuestion(difficulty: number, excludeId?: string | null): Promise<Question | undefined> {
    const roundedDiff = Math.max(1, Math.min(10, Math.round(difficulty)));

    let candidates = await QuestionModel.find({ difficulty: roundedDiff });

    if (candidates.length === 0) {
      const nearby = [roundedDiff - 1, roundedDiff + 1].filter(d => d >= 1 && d <= 10);
      for (const d of nearby) {
        candidates = await QuestionModel.find({ difficulty: d });
        if (candidates.length > 0) break;
      }
    }

    if (candidates.length === 0) {
      candidates = await QuestionModel.find();
    }

    let filtered = candidates;
    if (excludeId) {
      filtered = candidates.filter(q => q._id.toString() !== excludeId);
      if (filtered.length === 0) filtered = candidates;
    }

    if (filtered.length === 0) return undefined;
    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    return questionDocToQuestion(chosen);
  }

  async insertQuestions(data: InsertQuestion[]): Promise<void> {
    if (data.length === 0) return;
    await QuestionModel.insertMany(data, { ordered: false }).catch(() => {});
  }

  async getQuestionCount(): Promise<number> {
    return QuestionModel.countDocuments();
  }

  async getUserState(userId: string): Promise<UserState | undefined> {
    const doc = await UserStateModel.findOne({ userId });
    return doc ? stateDocToUserState(doc) : undefined;
  }

  async upsertUserState(userId: string, state: Partial<UserState>): Promise<UserState> {
    const existing = await UserStateModel.findOne({ userId });
    if (existing) {
      const updated = await UserStateModel.findOneAndUpdate(
        { userId },
        { $set: { ...state, stateVersion: (existing.stateVersion || 0) + 1 } },
        { new: true }
      );
      return stateDocToUserState(updated);
    }

    const doc = await UserStateModel.create({
      userId,
      currentDifficulty: 1,
      streak: 0,
      maxStreak: 0,
      totalScore: 0,
      stateVersion: 1,
      ...state,
    });
    return stateDocToUserState(doc);
  }

  async insertAnswerLog(data: InsertAnswerLog): Promise<void> {
    await AnswerLogModel.create(data);
  }

  async checkAnswerExists(userId: string, questionId: string, answeredAfter: Date): Promise<boolean> {
    const count = await AnswerLogModel.countDocuments({
      userId,
      questionId,
      answeredAt: { $gt: answeredAfter },
    });
    return count > 0;
  }

  async getUserAnswerStats(userId: string): Promise<{ totalAnswered: number; totalCorrect: number }> {
    const result = await AnswerLogModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAnswered: { $sum: 1 },
          totalCorrect: { $sum: { $cond: ["$correct", 1, 0] } },
        },
      },
    ]);
    if (result.length === 0) return { totalAnswered: 0, totalCorrect: 0 };
    return { totalAnswered: result[0].totalAnswered, totalCorrect: result[0].totalCorrect };
  }

  async getDifficultyHistogram(userId: string): Promise<DifficultyHistogramEntry[]> {
    const result = await AnswerLogModel.aggregate([
      { $match: { userId } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return result.map(r => ({ difficulty: r._id, count: r.count }));
  }

  async getRecentPerformance(userId: string, limit: number): Promise<RecentPerformanceEntry[]> {
    const docs = await AnswerLogModel.find({ userId })
      .sort({ answeredAt: -1 })
      .limit(limit);
    return docs.map(r => ({
      questionId: r.questionId,
      difficulty: r.difficulty,
      correct: r.correct,
      scoreDelta: r.scoreDelta,
      answeredAt: r.answeredAt ? r.answeredAt.toISOString() : new Date().toISOString(),
    }));
  }

  async getRecentAnswers(userId: string, limit: number): Promise<{ correct: boolean }[]> {
    const docs = await AnswerLogModel.find({ userId })
      .sort({ answeredAt: -1 })
      .limit(limit)
      .select("correct");
    return docs.map(r => ({ correct: r.correct }));
  }

  async getScoreLeaderboard(limit: number): Promise<(LeaderboardScoreEntry & { displayName: string | null; profileImage: string | null })[]> {
    const entries = await LeaderboardScoreModel.find()
      .sort({ totalScore: -1 })
      .limit(limit);

    const results = [];
    for (const entry of entries) {
      const user = await UserModel.findById(entry.userId);
      const displayName = user
        ? (user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email)
        : null;
      results.push({
        userId: entry.userId,
        totalScore: entry.totalScore,
        updatedAt: entry.updatedAt || null,
        displayName,
        profileImage: user?.profileImageUrl || null,
      });
    }
    return results;
  }

  async getStreakLeaderboard(limit: number): Promise<(LeaderboardStreakEntry & { displayName: string | null; profileImage: string | null })[]> {
    const entries = await LeaderboardStreakModel.find()
      .sort({ maxStreak: -1 })
      .limit(limit);

    const results = [];
    for (const entry of entries) {
      const user = await UserModel.findById(entry.userId);
      const displayName = user
        ? (user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email)
        : null;
      results.push({
        userId: entry.userId,
        maxStreak: entry.maxStreak,
        updatedAt: entry.updatedAt || null,
        displayName,
        profileImage: user?.profileImageUrl || null,
      });
    }
    return results;
  }

  async updateLeaderboard(userId: string, totalScore: number, maxStreak: number): Promise<void> {
    await LeaderboardScoreModel.findOneAndUpdate(
      { userId },
      { totalScore, updatedAt: new Date() },
      { upsert: true }
    );
    await LeaderboardStreakModel.findOneAndUpdate(
      { userId },
      { maxStreak, updatedAt: new Date() },
      { upsert: true }
    );
  }

  async atomicUpdateUserState(userId: string, expectedVersion: number, state: Partial<UserState>): Promise<UserState | null> {
    const updated = await UserStateModel.findOneAndUpdate(
      { userId, stateVersion: expectedVersion },
      { $set: { ...state, stateVersion: expectedVersion + 1 } },
      { new: true }
    );
    return updated ? stateDocToUserState(updated) : null;
  }

  async getUserScoreRank(userId: string): Promise<number> {
    const entry = await LeaderboardScoreModel.findOne({ userId });
    if (!entry) return 0;
    const rank = await LeaderboardScoreModel.countDocuments({ totalScore: { $gt: entry.totalScore } });
    return rank + 1;
  }

  async getUserStreakRank(userId: string): Promise<number> {
    const entry = await LeaderboardStreakModel.findOne({ userId });
    if (!entry) return 0;
    const rank = await LeaderboardStreakModel.countDocuments({ maxStreak: { $gt: entry.maxStreak } });
    return rank + 1;
  }
}

export const storage = new DatabaseStorage();
