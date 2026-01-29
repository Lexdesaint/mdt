"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const controller_1 = require("../controller");
class LoggerService {
    constructor() {
        this.logger = controller_1.Logger.getInstance();
    }
    static getInstance() {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }
    async getLogs(filters) {
        try {
            const logs = await this.logger.getLogs({
                startDate: filters.startDate,
                endDate: filters.endDate,
                level: filters.level,
                limit: filters.limit || 100,
                offset: filters.offset || 0,
            });
            return {
                success: true,
                message: 'Logs retrieved successfully',
                data: {
                    logs,
                    count: logs.length,
                    filters: {
                        startDate: filters.startDate,
                        endDate: filters.endDate,
                        level: filters.level,
                        limit: filters.limit?.toString() || '100',
                        offset: filters.offset?.toString() || '0',
                    },
                },
            };
        }
        catch (error) {
            console.error('Error retrieving logs:', error);
            return {
                success: false,
                message: 'Failed to retrieve logs',
                data: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async getLogStats() {
        try {
            const stats = await this.logger.getStats();
            return {
                success: true,
                message: 'Log statistics retrieved successfully',
                data: stats,
            };
        }
        catch (error) {
            console.error('Error retrieving log stats:', error);
            return {
                success: false,
                message: 'Failed to retrieve log statistics',
                data: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    getLogLevels() {
        try {
            const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
            return {
                success: true,
                message: 'Log levels retrieved successfully',
                data: { levels },
            };
        }
        catch (error) {
            console.error('Error retrieving log levels:', error);
            return {
                success: false,
                message: 'Failed to retrieve log levels',
                data: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async searchLogs(criteria) {
        try {
            let logs = await this.logger.getLogs({
                startDate: criteria.startDate,
                endDate: criteria.endDate,
                limit: (criteria.limit || 50) * 2, // Get more to filter
                offset: criteria.offset || 0,
            });
            // Apply additional filters
            if (criteria.query) {
                logs = logs.filter((log) => log.url.toLowerCase().includes(criteria.query.toLowerCase()));
            }
            if (criteria.method) {
                logs = logs.filter((log) => log.method === criteria.method);
            }
            if (criteria.statusCode) {
                logs = logs.filter((log) => log.statusCode === criteria.statusCode);
            }
            if (criteria.clientIp) {
                logs = logs.filter((log) => log.ipAddress === criteria.clientIp);
            }
            // Limit results
            logs = logs.slice(0, criteria.limit || 50);
            return {
                success: true,
                message: 'Search completed successfully',
                data: {
                    logs,
                    count: logs.length,
                    searchCriteria: {
                        query: criteria.query,
                        method: criteria.method,
                        statusCode: criteria.statusCode,
                        clientIp: criteria.clientIp,
                        startDate: criteria.startDate,
                        endDate: criteria.endDate,
                    },
                },
            };
        }
        catch (error) {
            console.error('Error searching logs:', error);
            return {
                success: false,
                message: 'Failed to search logs',
                data: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.LoggerService = LoggerService;
