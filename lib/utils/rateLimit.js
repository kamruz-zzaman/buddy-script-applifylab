/**
 * Simple in-memory rate limiter using sliding window.
 * For production, use Redis-based rate limiting.
 */

const rateMap = new Map();

// Clean up old entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap.entries()) {
      if (now - entry.windowStart > entry.windowMs) {
        rateMap.delete(key);
      }
    }
  }, 60000);
}

/**
 * Rate limit middleware.
 * @param {string} key - Unique identifier (e.g., IP address)
 * @param {number} maxRequests - Max requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function rateLimit(key, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    rateMap.set(key, {
      count: 1,
      windowStart: now,
      windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.windowStart + windowMs };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.windowStart + windowMs };
}
