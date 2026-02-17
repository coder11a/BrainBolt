import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  profileImageUrl: { type: String, default: null },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>("User", userSchema);

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  difficulty: number;
  prompt: string;
  choices: string[];
  correctAnswerHash: string;
  tags: string[];
}

const questionSchema = new Schema<IQuestion>({
  difficulty: { type: Number, required: true, index: true },
  prompt: { type: String, required: true },
  choices: { type: [String], required: true },
  correctAnswerHash: { type: String, required: true },
  tags: { type: [String], required: true },
});

export const QuestionModel = mongoose.model<IQuestion>("Question", questionSchema);

export interface IUserState extends Document {
  userId: string;
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  lastQuestionId: string | null;
  lastAnswerAt: Date | null;
  stateVersion: number;
}

const userStateSchema = new Schema<IUserState>({
  userId: { type: String, required: true, unique: true, index: true },
  currentDifficulty: { type: Number, required: true, default: 1 },
  streak: { type: Number, required: true, default: 0 },
  maxStreak: { type: Number, required: true, default: 0 },
  totalScore: { type: Number, required: true, default: 0 },
  lastQuestionId: { type: String, default: null },
  lastAnswerAt: { type: Date, default: null },
  stateVersion: { type: Number, required: true, default: 0 },
});

export const UserStateModel = mongoose.model<IUserState>("UserState", userStateSchema);

export interface IAnswerLog extends Document {
  userId: string;
  questionId: string;
  difficulty: number;
  answer: number;
  correct: boolean;
  scoreDelta: number;
  streakAtAnswer: number;
  answeredAt: Date;
}

const answerLogSchema = new Schema<IAnswerLog>({
  userId: { type: String, required: true, index: true },
  questionId: { type: String, required: true },
  difficulty: { type: Number, required: true },
  answer: { type: Number, required: true },
  correct: { type: Boolean, required: true },
  scoreDelta: { type: Number, required: true },
  streakAtAnswer: { type: Number, required: true },
  answeredAt: { type: Date, default: Date.now },
});

export const AnswerLogModel = mongoose.model<IAnswerLog>("AnswerLog", answerLogSchema);

export interface ILeaderboardScore extends Document {
  userId: string;
  totalScore: number;
  updatedAt: Date;
}

const leaderboardScoreSchema = new Schema<ILeaderboardScore>({
  userId: { type: String, required: true, unique: true },
  totalScore: { type: Number, required: true, default: 0, index: true },
  updatedAt: { type: Date, default: Date.now },
});

export const LeaderboardScoreModel = mongoose.model<ILeaderboardScore>("LeaderboardScore", leaderboardScoreSchema);

export interface ILeaderboardStreak extends Document {
  userId: string;
  maxStreak: number;
  updatedAt: Date;
}

const leaderboardStreakSchema = new Schema<ILeaderboardStreak>({
  userId: { type: String, required: true, unique: true },
  maxStreak: { type: Number, required: true, default: 0, index: true },
  updatedAt: { type: Date, default: Date.now },
});

export const LeaderboardStreakModel = mongoose.model<ILeaderboardStreak>("LeaderboardStreak", leaderboardStreakSchema);
