import axios from 'axios';
import type { AuthResponse, QueryResult, Hint, ScoreboardEntry, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
};

export const login = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post('/auth/login', { usernameOrEmail, password });
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch {
    return null;
  }
};

// Challenge
export const executeQuery = async (query: string): Promise<QueryResult> => {
  const { data } = await api.post('/challenge/query', { query });
  return data;
};

export const startChallenge = async () => {
  const { data } = await api.post('/challenge/start');
  return data;
};

export const submitFlag = async (flag: string) => {
  const { data } = await api.post('/challenge/submit-flag', { flag });
  return data;
};

export const getChallengeStatus = async () => {
  const { data } = await api.get('/challenge/status');
  return data;
};

// Hints
export const getHints = async (): Promise<Hint[]> => {
  const { data } = await api.get('/challenge/hints');
  return data.hints;
};

export const unlockHint = async (hintId: number): Promise<Hint[]> => {
  const { data } = await api.post('/challenge/hints/unlock', { hintId });
  return data.hints;
};

// Scoreboard
export const getScoreboard = async (): Promise<ScoreboardEntry[]> => {
  const { data } = await api.get('/scoreboard');
  return data.scoreboard;
};

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.users;
};

export const getAdminUserDetails = async (userId: number) => {
  const { data } = await api.get(`/admin/users/${userId}`);
  return data;
};

export const getAdminQueries = async (page: number = 1, limit: number = 100, flagFound?: boolean) => {
  let url = `/admin/queries?page=${page}&limit=${limit}`;
  if (flagFound !== undefined) {
    url += `&flagFound=${flagFound}`;
  }
  const { data } = await api.get(url);
  return data.logs;
};

export const getAdminSettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data.settings;
};

export const updateAdminSetting = async (key: string, value: string) => {
  const { data } = await api.post(`/admin/settings/${key}`, { value });
  return data;
};

// Admin Flag Management
export const getAdminFlag = async () => {
  const { data } = await api.get('/admin/flag');
  return data;
};

export const updateAdminFlag = async (flag: string) => {
  const { data } = await api.put('/admin/flag', { flag });
  return data;
};

export default api;
