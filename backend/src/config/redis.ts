import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: any) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err: any) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

// Session management
export async function setSession(userId: number, token: string, expiresIn: number = 7 * 24 * 60 * 60) {
  await redis.setex(`session:${token}`, expiresIn, JSON.stringify({ userId, createdAt: new Date() }));
}

export async function getSession(token: string) {
  const session = await redis.get(`session:${token}`);
  return session ? JSON.parse(session) : null;
}

export async function deleteSession(token: string) {
  await redis.del(`session:${token}`);
}

// Rate limiting with Redis
export async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  const current = await redis.incr(`rate:${key}`);
  
  if (current === 1) {
    await redis.expire(`rate:${key}`, window);
  }
  
  return current <= limit;
}

// Distributed lock for flag submission
export async function acquireLock(key: string, ttl: number = 5000): Promise<boolean> {
  const result = await redis.set(`lock:${key}`, '1', 'PX', ttl, 'NX');
  return result === 'OK';
}

export async function releaseLock(key: string) {
  await redis.del(`lock:${key}`);
}