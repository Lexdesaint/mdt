"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.createRateLimiter = void 0;
class RateLimiter {
    constructor(windowMs = 15 * 60 * 1000, maxRequests = 100) {
        this.rateLimitMap = new Map();
        this.middleware = (req, res, next) => {
            const clientId = req.ip || '';
            const now = Date.now();
            if (!this.rateLimitMap.has(clientId)) {
                this.rateLimitMap.set(clientId, { count: 1, resetTime: now + this.windowMs });
                return next();
            }
            const clientData = this.rateLimitMap.get(clientId);
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
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }
}
const createRateLimiter = (windowMs, maxRequests) => {
    return new RateLimiter(windowMs, maxRequests);
};
exports.createRateLimiter = createRateLimiter;
// Default rate limiter
exports.rateLimiter = (0, exports.createRateLimiter)();
