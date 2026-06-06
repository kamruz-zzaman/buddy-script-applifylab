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

// Rate limit middleware.
export function rateLimit(key, maxRequests = 80, windowMs = 60000) {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    rateMap.set(key, {
      count: 1,
      windowStart: now,
      windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.windowStart + windowMs,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.windowStart + windowMs,
  };
}
