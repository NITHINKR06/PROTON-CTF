import bcrypt from 'bcrypt';
import { mainDb } from '../config/database.js';
import type { User, UserSession } from '../types/index.js';

const SALT_ROUNDS = 10;

export async function registerUser(username: string, email: string, password: string): Promise<UserSession> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const stmt = mainDb.prepare(`
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES (?, ?, ?, 0)
    `);

    const result = stmt.run(username, email, passwordHash);

    return {
      id: result.lastInsertRowid as number,
      username,
      email,
      isAdmin: false
    };
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username or email already exists');
    }
    throw error;
  }
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<UserSession> {
  const stmt = mainDb.prepare(`
    SELECT id, username, email, password_hash, is_admin
    FROM users
    WHERE username = ? OR email = ?
  `);

  const user = stmt.get(usernameOrEmail, usernameOrEmail) as User | undefined;

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: Boolean(user.is_admin)
  };
}

export function getUserById(id: number): UserSession | null {
  const stmt = mainDb.prepare(`
    SELECT id, username, email, is_admin
    FROM users
    WHERE id = ?
  `);

  const user = stmt.get(id) as any | undefined;
  
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: Boolean(user.is_admin)
  };
}