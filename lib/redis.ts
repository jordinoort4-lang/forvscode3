import Redis from 'ioredis';

let redisClient: Redis.Redis | null = null;

export function getRedis(): Redis.Redis {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL not set');
  redisClient = new Redis(url);
  // Optional: attach error handlers
  redisClient.on('error', (err) => {
    console.error('Redis error', err);
  });
  return redisClient;
}
