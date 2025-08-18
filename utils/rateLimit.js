// Track IPs in-memory (for demo; use Redis in production)
const requestCounts = new Map();

export const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = process.env.NODE_ENV === 'production' ? 4 * 60 * 60 * 1000 : 60000; // 4 hrs vs 1 min
  const max = process.env.NODE_ENV === 'production' ? 3 : 1; // 3 per 4 hrs vs 1 per min

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, lastReset: now });
    return false;
  }

  const record = requestCounts.get(ip);
  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return false;
  }

  record.count += 1;
  return record.count > max;
};