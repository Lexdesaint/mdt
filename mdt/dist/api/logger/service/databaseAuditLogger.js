"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseAuditLogger = exports.LogLevel = void 0;
const prisma_1 = require("../../../config/database/prisma");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class DatabaseAuditLogger {
    static getInstance() {
        if (!DatabaseAuditLogger.instance) {
            DatabaseAuditLogger.instance = new DatabaseAuditLogger();
        }
        return DatabaseAuditLogger.instance;
    }
    async log(entry) {
        try {
            // Sanitize sensitive data from request/response bodies
            const sanitizedRequestBody = this.sanitizeBody(entry.requestBody);
            const sanitizedResponseBody = this.sanitizeBody(entry.responseBody);
            await prisma_1.prisma.systemAuditLog.create({
                data: {
                    request_id: entry.requestId,
                    user_id: entry.userId,
                    method: entry.method,
                    url: entry.url,
                    route: entry.route,
                    status_code: entry.statusCode,
                    response_time: entry.responseTime,
                    ip_address: entry.ipAddress,
                    user_agent: entry.userAgent,
                    request_body: sanitizedRequestBody,
                    response_body: sanitizedResponseBody,
                    error_message: entry.errorMessage,
                    level: entry.level,
                },
            });
        }
        catch (error) {
            // Fallback to console logging if database logging fails
            console.error('Failed to log to database:', error);
            console.log('Original log entry:', JSON.stringify(entry, null, 2));
        }
    }
    async getAuditLogs(options = {}) {
        const { startDate, endDate, userId, level, method, statusCode, limit = 100, offset = 0, } = options;
        const where = {};
        if (startDate || endDate) {
            where.created_at = {};
            if (startDate)
                where.created_at.gte = startDate;
            if (endDate)
                where.created_at.lte = endDate;
        }
        if (userId)
            where.user_id = userId;
        if (level)
            where.level = level;
        if (method)
            where.method = method;
        if (statusCode)
            where.status_code = statusCode;
        return await prisma_1.prisma.systemAuditLog.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    async getAuditStats() {
        const [totalLogs, errorLogs, warningLogs, recentLogs, topRoutes, statusCodeStats,] = await Promise.all([
            // Total logs count
            prisma_1.prisma.systemAuditLog.count(),
            // Error logs count (last 24 hours)
            prisma_1.prisma.systemAuditLog.count({
                where: {
                    level: LogLevel.ERROR,
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Warning logs count (last 24 hours)
            prisma_1.prisma.systemAuditLog.count({
                where: {
                    level: LogLevel.WARN,
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            // Recent logs (last hour)
            prisma_1.prisma.systemAuditLog.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 60 * 60 * 1000),
                    },
                },
            }),
            // Top 10 most accessed routes
            prisma_1.prisma.systemAuditLog.groupBy({
                by: ['route'],
                _count: {
                    route: true,
                },
                orderBy: {
                    _count: {
                        route: 'desc',
                    },
                },
                take: 10,
                where: {
                    route: {
                        not: null,
                    },
                },
            }),
            // Status code distribution
            prisma_1.prisma.systemAuditLog.groupBy({
                by: ['status_code'],
                _count: {
                    status_code: true,
                },
                orderBy: {
                    _count: {
                        status_code: 'desc',
                    },
                },
            }),
        ]);
        return {
            totalLogs,
            errorLogs,
            warningLogs,
            recentLogs,
            topRoutes: topRoutes.map((route) => ({
                route: route.route,
                count: route._count.route,
            })),
            statusCodeStats: statusCodeStats.map((stat) => ({
                statusCode: stat.status_code,
                count: stat._count.status_code,
            })),
        };
    }
    sanitizeBody(body) {
        if (!body)
            return null;
        // Convert to string if it's not already
        let bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        try {
            const parsed = typeof body === 'string' ? JSON.parse(body) : body;
            // Remove sensitive fields
            const sensitiveFields = [
                'password',
                'pin',
                'token',
                'secret',
                'key',
                'authorization',
                'cookie',
                'session',
                'otp',
                'otp_code',
                'verification_code',
                'credit_card',
                'card_number',
                'cvv',
                'ssn',
                'social_security',
            ];
            const sanitized = this.deepSanitize(parsed, sensitiveFields);
            // Limit size to prevent database bloat
            const sanitizedStr = JSON.stringify(sanitized);
            if (sanitizedStr.length > 10000) {
                return {
                    _truncated: true,
                    _originalSize: sanitizedStr.length,
                    data: sanitizedStr.substring(0, 10000) + '...',
                };
            }
            return sanitized;
        }
        catch (error) {
            // If parsing fails, return truncated string
            return bodyStr.length > 1000
                ? bodyStr.substring(0, 1000) + '...'
                : bodyStr;
        }
    }
    deepSanitize(obj, sensitiveFields) {
        if (obj === null || obj === undefined)
            return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepSanitize(item, sensitiveFields));
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                const lowerKey = key.toLowerCase();
                if (sensitiveFields.some(field => lowerKey.includes(field))) {
                    sanitized[key] = '[REDACTED]';
                }
                else {
                    sanitized[key] = this.deepSanitize(value, sensitiveFields);
                }
            }
            return sanitized;
        }
        return obj;
    }
}
exports.DatabaseAuditLogger = DatabaseAuditLogger;
