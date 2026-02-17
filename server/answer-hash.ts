import crypto from "crypto";

const HASH_SECRET = "brainbolt-answer-salt";

export function hashAnswer(answerIndex: number): string {
  return crypto.createHash("sha256").update(`${HASH_SECRET}:${answerIndex}`).digest("hex");
}

export function verifyAnswer(answerIndex: number, hash: string): boolean {
  return hashAnswer(answerIndex) === hash;
}

export function findCorrectAnswer(hash: string): number {
  for (let i = 0; i < 4; i++) {
    if (hashAnswer(i) === hash) return i;
  }
  return -1;
}
