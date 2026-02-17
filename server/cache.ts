import NodeCache from "node-cache";

const CACHE_TTL = {
  USER_STATE: 30,
  QUESTION_POOL: 300,
  LEADERBOARD: 15,
  METRICS: 60,
};

const userStateCache = new NodeCache({ stdTTL: CACHE_TTL.USER_STATE, checkperiod: 10 });
const questionPoolCache = new NodeCache({ stdTTL: CACHE_TTL.QUESTION_POOL, checkperiod: 60 });
const leaderboardCache = new NodeCache({ stdTTL: CACHE_TTL.LEADERBOARD, checkperiod: 5 });
const metricsCache = new NodeCache({ stdTTL: CACHE_TTL.METRICS, checkperiod: 20 });

export const cache = {
  userState: {
    get(userId: string) {
      return userStateCache.get(`us:${userId}`) as any | undefined;
    },
    set(userId: string, state: any) {
      userStateCache.set(`us:${userId}`, state);
    },
    invalidate(userId: string) {
      userStateCache.del(`us:${userId}`);
    },
  },

  questionPool: {
    get(difficulty: number) {
      return questionPoolCache.get(`qp:${difficulty}`) as any[] | undefined;
    },
    set(difficulty: number, questions: any[]) {
      questionPoolCache.set(`qp:${difficulty}`, questions);
    },
    invalidateAll() {
      questionPoolCache.flushAll();
    },
  },

  leaderboard: {
    get(type: "score" | "streak", limit: number) {
      return leaderboardCache.get(`lb:${type}:${limit}`) as any[] | undefined;
    },
    set(type: "score" | "streak", limit: number, data: any[]) {
      leaderboardCache.set(`lb:${type}:${limit}`, data);
    },
    invalidate() {
      leaderboardCache.flushAll();
    },
  },

  metrics: {
    get(userId: string) {
      return metricsCache.get(`met:${userId}`) as any | undefined;
    },
    set(userId: string, data: any) {
      metricsCache.set(`met:${userId}`, data);
    },
    invalidate(userId: string) {
      metricsCache.del(`met:${userId}`);
    },
  },

  idempotency: new NodeCache({ stdTTL: 300, checkperiod: 60 }),

  stats() {
    return {
      userState: userStateCache.getStats(),
      questionPool: questionPoolCache.getStats(),
      leaderboard: leaderboardCache.getStats(),
      metrics: metricsCache.getStats(),
    };
  },
};
