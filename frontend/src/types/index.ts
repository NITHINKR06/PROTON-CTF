export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
  flagFound?: boolean;
  points?: number;
}

export interface Hint {
  id: number;
  title: string;
  content: string;
  unlocked: boolean;
  unlocksAt?: number;
}

export interface ScoreboardEntry {
  rank: number;
  username: string;
  points: number;
  solvedAt: string;
  timeTaken?: number | null;
}

export interface HintState {
  hintsOpened: number[];
  firstHintOpenedAt?: number;
  secondHintOpenedAt?: number;
}

export interface ChallengeStatus {
  isStarted: boolean;
  startTime: number | null;
  completed: boolean;
  completionTime: number | null;
  score: number | null;
}