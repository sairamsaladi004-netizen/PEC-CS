/**
 * In-Memory Sliding Window Rate Limiter
 * Pragati Engineering College - PEC CampusTech
 */

const hitRecords = new Map();

// Periodic sweep to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of hitRecords.entries()) {
    if (record.resetTime <= now) {
      hitRecords.delete(key);
    }
  }
}, 60 * 1000).unref();

/**
 * Creates an Express rate-limiting middleware.
 * @param {Object} options
 * @param {number} options.windowMs Window duration in milliseconds (default: 60,000 ms)
 * @param {number} options.max Maximum requests allowed in the window (default: 60)
 * @param {string} options.message Error message on rate limit exceeded
 * @param {string} options.keyPrefix Prefix for cache key isolation
 */
export function createRateLimiter({ windowMs = 60 * 1000, max = 60, message = "Too many requests. Please try again later.", keyPrefix = "global" } = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = hitRecords.get(key);
    if (!record || record.resetTime <= now) {
      record = { count: 1, resetTime: now + windowMs };
      hitRecords.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message,
        retryAfter: retryAfterSec
      });
    }

    next();
  };
}

// Preconfigured rate limiters
export const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please wait 60 seconds before retrying.",
  keyPrefix: "login"
});

export const registerLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many registration attempts from this IP. Please wait a minute.",
  keyPrefix: "register"
});

export const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many OTP verification requests. Please wait a minute.",
  keyPrefix: "otp"
});

export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "AI compute quota reached for this window. Please wait a few moments.",
  keyPrefix: "ai"
});

export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "API request threshold exceeded. Please slow down your requests.",
  keyPrefix: "api"
});
