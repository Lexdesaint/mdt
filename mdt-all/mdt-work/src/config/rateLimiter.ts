import { Request, Response, NextFunction } from "express";

interface RateLimitData {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private rateLimitMap = new Map<string, RateLimitData>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || '';
    const now = Date.now();

    if (!this.rateLimitMap.has(clientId)) {
      this.rateLimitMap.set(clientId, { count: 1, resetTime: now + this.windowMs });
      return next();
    }

    const clientData = this.rateLimitMap.get(clientId)!;
    
    if (now > clientData.resetTime) {
      this.rateLimitMap.set(clientId, { count: 1, resetTime: now + this.windowMs });
      return next();
    }

    if (clientData.count >= this.maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
  };
}

export const createRateLimiter = (windowMs?: number, maxRequests?: number) => {
  return new RateLimiter(windowMs, maxRequests);
};

// Default rate limiter
export const rateLimiter = createRateLimiter();