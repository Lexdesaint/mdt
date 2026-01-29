"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const uuid_1 = require("uuid");
const systemLoger_1 = require("../service/systemLoger");
const systemInfo_1 = require("../../../utils/systemInfo");
class Logger {
    constructor() {
        // Middleware to add request ID and start time
        this.requestMiddleware = (req, res, next) => {
            const requestId = (0, uuid_1.v4)();
            res.locals.requestId = requestId;
            res.locals.startTime = Date.now();
            // Log request
            this.logRequest(req, requestId);
            next();
        };
        // Middleware to log response
        this.responseMiddleware = (req, res, next) => {
            const originalSend = res.send;
            res.send = function (body) {
                res.locals.responseBody = body;
                return originalSend.call(this, body);
            };
            res.on('finish', () => {
                Logger.getInstance().logResponse(req, res);
            });
            next();
        };
        this.fileLogger = new systemLoger_1.FileLogger();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    logRequest(req, requestId) {
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            level: 'info',
            method: req.method,
            url: req.originalUrl,
            statusCode: 0, // Will be updated in response
            responseTime: 0, // Will be calculated in response
            clientIp: (0, systemInfo_1.getClientIp)(req),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            userAgent: req.get('User-Agent') || '',
            requestId,
            requestBody: this.sanitizeBody(req.body),
            userId: req.user?.id || undefined
        };
        this.fileLogger.log(entry);
    }
    logResponse(req, res) {
        const responseTime = Date.now() - (res.locals.startTime || Date.now());
        const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            level,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime,
            clientIp: (0, systemInfo_1.getClientIp)(req),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            userAgent: req.get('User-Agent') || '',
            requestId: res.locals.requestId,
            requestBody: this.sanitizeBody(req.body),
            responseBody: this.sanitizeBody(res.locals.responseBody),
            userId: req.user?.id || undefined
        };
        this.fileLogger.log(entry);
    }
    logError(error, req, requestId) {
        const entry = {
            id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            level: 'error',
            method: req.method,
            url: req.originalUrl,
            statusCode: 500,
            responseTime: Date.now() - (req.res?.locals?.startTime || Date.now()),
            clientIp: (0, systemInfo_1.getClientIp)(req),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            userAgent: req.get('User-Agent') || '',
            requestId,
            requestBody: this.sanitizeBody(req.body),
            errorStack: error.stack,
            userId: req.user?.id || undefined
        };
        this.fileLogger.log(entry);
    }
    getLogs(startDate, endDate, level, limit) {
        return this.fileLogger.getLogs(startDate, endDate, level, limit);
    }
    getStats() {
        return this.fileLogger.getLogStats();
    }
    sanitizeBody(body) {
        if (!body)
            return undefined;
        const sanitized = JSON.parse(JSON.stringify(body));
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null)
                return obj;
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            const result = {};
            for (const key in obj) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    result[key] = '[REDACTED]';
                }
                else {
                    result[key] = sanitizeObject(obj[key]);
                }
            }
            return result;
        };
        return sanitizeObject(sanitized);
    }
}
exports.Logger = Logger;
