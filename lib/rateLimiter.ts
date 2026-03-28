import { getRedis } from './redis';

type RateCheckResult = {
  allowed: boolean;
  reason?: 'ok' | 'minute_limit' | 'hour_limit' | 'weekly_limit' | 'cooldown';
  retryAfterSeconds?: number;
  remaining?: {
    minute?: number;
    hour?: number;
    week?: number;
  };
  weekResetInSeconds?: number;
};

const MINUTE_WINDOW = 60; // seconds
const HOUR_WINDOW = 60 * 60; // seconds
const WEEK_WINDOW = 7 * 24 * 60 * 60; // seconds

// Defaults (can be tuned)
const MINUTE_LIMIT = 3;
const HOUR_LIMIT = 5;
const WEEK_LIMIT = 20;
const COOLDOWN_SECONDS = 15 * 60; // 15 minutes when hour limit exceeded

function emailKey(email: string, bucket: 'minute' | 'hour' | 'week' | 'cooldown') {
  const safe = encodeURIComponent(email.toLowerCase());
  return `rl:email:${safe}:${bucket}`;
}

export async function checkAndConsume(email: string): Promise<RateCheckResult> {
  const redis = getRedis();
  const now = Math.floor(Date.now() / 1000);

  const cooldownKey = emailKey(email, 'cooldown');
  const cooldownUntil = await redis.get(cooldownKey);
  if (cooldownUntil) {
    const until = parseInt(cooldownUntil, 10);
    if (until > now) {
      return {
        allowed: false,
        reason: 'cooldown',
        retryAfterSeconds: until - now,
      };
    } else {
      // expired, remove
      await redis.del(cooldownKey);
    }
  }

  // Use a pipeline for atomic-ish operations
  const minuteKey = emailKey(email, 'minute');
  const hourKey = emailKey(email, 'hour');
  const weekKey = emailKey(email, 'week');

  const pipe = redis.multi();
  pipe.incr(minuteKey);
  pipe.expire(minuteKey, MINUTE_WINDOW);
  pipe.incr(hourKey);
  pipe.expire(hourKey, HOUR_WINDOW);
  pipe.incr(weekKey);
  pipe.expire(weekKey, WEEK_WINDOW);
  const [rMinuteRaw, , rHourRaw, , rWeekRaw] = await pipe.exec() as Array<any>;

  const rMinute = parseInt(rMinuteRaw[1], 10);
  const rHour = parseInt(rHourRaw[1], 10);
  const rWeek = parseInt(rWeekRaw[1], 10);

  // Check minute limit
  if (rMinute > MINUTE_LIMIT) {
    return {
      allowed: false,
      reason: 'minute_limit',
      retryAfterSeconds: MINUTE_WINDOW, // best-effort
      remaining: { minute: 0, hour: Math.max(0, HOUR_LIMIT - rHour), week: Math.max(0, WEEK_LIMIT - rWeek) },
    };
  }

  // Check hour limit
  if (rHour > HOUR_LIMIT) {
    // set cooldown key
    const until = now + COOLDOWN_SECONDS;
    await redis.set(emailKey(email, 'cooldown'), String(until), 'EX', COOLDOWN_SECONDS);
    return {
      allowed: false,
      reason: 'hour_limit',
      retryAfterSeconds: COOLDOWN_SECONDS,
      remaining: { minute: Math.max(0, MINUTE_LIMIT - rMinute), hour: 0, week: Math.max(0, WEEK_LIMIT - rWeek) },
    };
  }

  // Check weekly limit
  if (rWeek > WEEK_LIMIT) {
    // calculate reset seconds by fetching ttl
    const ttl = await redis.ttl(weekKey);
    return {
      allowed: false,
      reason: 'weekly_limit',
      retryAfterSeconds: ttl > 0 ? ttl : WEEK_WINDOW,
      remaining: { minute: Math.max(0, MINUTE_LIMIT - rMinute), hour: Math.max(0, HOUR_LIMIT - rHour), week: 0 },
      weekResetInSeconds: ttl > 0 ? ttl : WEEK_WINDOW,
    };
  }

  // OK
  const minuteRemaining = Math.max(0, MINUTE_LIMIT - rMinute);
  const hourRemaining = Math.max(0, HOUR_LIMIT - rHour);
  const weekRemaining = Math.max(0, WEEK_LIMIT - rWeek);
  const weekTtl = await redis.ttl(weekKey);

  return {
    allowed: true,
    reason: 'ok',
    remaining: { minute: minuteRemaining, hour: hourRemaining, week: weekRemaining },
    weekResetInSeconds: weekTtl > 0 ? weekTtl : WEEK_WINDOW,
  };
}
