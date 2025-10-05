// Mock Redis for testing without Redis server
const mockRedis = {
  setex: async (key: string, ttl: number, value: string) => 'OK',
  get: async (key: string) => null,
  del: async (key: string) => 1,
  incr: async (key: string) => 1,
  expire: async (key: string, ttl: number) => 1,
  set: async (...args: any[]) => 'OK',
  on: (event: string, callback: Function) => {},
};

export const redis = mockRedis;

// Session management
export async function setSession(userId: number, token: string, expiresIn: number = 7 * 24 * 60 * 60) {
  // Mock implementation
  return Promise.resolve();
}

export async function getSession(token: string) {
  // Mock implementation - return null for testing
  return null;
}

export async function deleteSession(token: string) {
  // Mock implementation
  return Promise.resolve();
}

// Rate limiting with Redis
export async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  // Mock implementation - always allow for testing
  return true;
}

// Distributed lock for flag submission
export async function acquireLock(key: string, ttl: number = 5000): Promise<boolean> {
  // Mock implementation - always succeed
  return true;
}

export async function releaseLock(key: string) {
  // Mock implementation
  return Promise.resolve();
}
