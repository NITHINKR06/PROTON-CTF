export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  is_admin: number;
}

export interface UserSession {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

// ... rest of the file remains the same

export interface Score {
  user_id: number;
  points: number;
  solved_at: string;
}

export interface HintState {
  user_id: number;
  hints_opened: string; // JSON array
  first_hint_opened_at?: string;
  second_hint_opened_at?: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
  flagFound?: boolean;
  points?: number;
}