"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLogs = exports.getLogLevels = exports.getLogStats = exports.getLogs = exports.Logger = void 0;
const uuid_1 = require("uuid");
const databaseAuditLogger_1 = require("./service/databaseAuditLogger");
const systemInfo_1 = require("../../utils/systemInfo");
const response_1 = require("../../type/response");
const loggerService_1 = require("./service/loggerService");
class Logger {
    constructor() {
        // Middleware to add request ID and start time
        this.requestMiddleware = (req, res, next) => {
            const requestId = (0, uuid_1.v4)();
            res.locals.requestId = requestId;
            res.locals.startTime = Date.now();
            next();
        };
        // Middleware to log response
        this.responseMiddleware = (req, res, next) => {
            const originalSend = res.send;
            res.send = function (body) {
                res.locals.responseBody = body;
                return originalSend.call(this, body);
            };
            res.on("finish", () => {
                Logger.getInstance().logResponse(req, res);
            });
            next();
        };
        this.auditLogger = databaseAuditLogger_1.DatabaseAuditLogger.getInstance();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    async logResponse(req, res) {
        const responseTime = Date.now() - (res.locals.startTime || Date.now());
        const level = res.statusCode >= 400
            ? databaseAuditLogger_1.LogLevel.ERROR
            : res.statusCode >= 300
                ? databaseAuditLogger_1.LogLevel.WARN
                : databaseAuditLogger_1.LogLevel.INFO;
        const entry = {
            requestId: res.locals.requestId,
            userId: req.user?.user_id || undefined,
            method: req.method,
            url: req.originalUrl,
            route: req.route?.path || undefined,
            statusCode: res.statusCode,
            responseTime,
            ipAddress: (0, systemInfo_1.getClientIp)(req),
            userAgent: req.get("User-Agent") || undefined,
            requestBody: req.body,
            responseBody: res.locals.responseBody,
            level,
        };
        await this.auditLogger.log(entry);
    }
    async logError(error, req, requestId) {
        const entry = {
            requestId,
            userId: req.user?.user_id || undefined,
            method: req.method,
            url: req.originalUrl,
            route: req.route?.path || undefined,
            statusCode: 500,
            responseTime: Date.now() - (req.res?.locals?.startTime || Date.now()),
            ipAddress: (0, systemInfo_1.getClientIp)(req),
            userAgent: req.get("User-Agent") || undefined,
            requestBody: req.body,
            errorMessage: error.message + (error.stack ? "\n" + error.stack : ""),
            level: databaseAuditLogger_1.LogLevel.ERROR,
        };
        await this.auditLogger.log(entry);
    }
    async getLogs(options = {}) {
        const { startDate, endDate, level, limit, offset } = options;
        return await this.auditLogger.getAuditLogs({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            level: level,
            limit,
            offset,
        });
    }
    async getStats() {
        return await this.auditLogger.getAuditStats();
    }
}
exports.Logger = Logger;
// Route handlers
const getLogs = async (req, res, next) => {
    try {
        const { startDate, endDate, level, limit = '100', offset = '0', } = req.query;
        const result = await loggerService_1.LoggerService.getInstance().getLogs({
            startDate: startDate,
            endDate: endDate,
            level: level,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.message, 500, result.data);
        }
        return response_1.ResponseFormatter.success(res, result.message, result.data);
    }
    catch (error) {
        console.error('Get logs controller error:', error);
        return response_1.ResponseFormatter.error(res, 'Failed to retrieve logs', 500, error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.getLogs = getLogs;
const getLogStats = async (req, res, next) => {
    try {
        const result = await loggerService_1.LoggerService.getInstance().getLogStats();
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.message, 500, result.data);
        }
        return response_1.ResponseFormatter.success(res, result.message, result.data);
    }
    catch (error) {
        console.error('Get log stats controller error:', error);
        return response_1.ResponseFormatter.error(res, 'Failed to retrieve log statistics', 500, error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.getLogStats = getLogStats;
const getLogLevels = (req, res, next) => {
    try {
        const result = loggerService_1.LoggerService.getInstance().getLogLevels();
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.message, 500, result.data);
        }
        return response_1.ResponseFormatter.success(res, result.message, result.data);
    }
    catch (error) {
        console.error('Get log levels controller error:', error);
        return response_1.ResponseFormatter.error(res, 'Failed to retrieve log levels', 500, error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.getLogLevels = getLogLevels;
const searchLogs = async (req, res, next) => {
    try {
        const { query, method, statusCode, clientIp, startDate, endDate, limit = '50', offset = '0', } = req.query;
        const result = await loggerService_1.LoggerService.getInstance().searchLogs({
            query: query,
            method: method,
            statusCode: statusCode ? parseInt(statusCode) : undefined,
            clientIp: clientIp,
            startDate: startDate,
            endDate: endDate,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.message, 500, result.data);
        }
        return response_1.ResponseFormatter.success(res, result.message, result.data);
    }
    catch (error) {
        console.error('Search logs controller error:', error);
        return response_1.ResponseFormatter.error(res, 'Failed to search logs', 500, error instanceof Error ? error.message : 'Unknown error');
    }
};
exports.searchLogs = searchLogs;
