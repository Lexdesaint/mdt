import { Logger } from '../controller';
import { ResponseFormatter } from '../../../type/response';

interface LogFilters {
  startDate?: string;
  endDate?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

interface SearchCriteria {
  query?: string;
  method?: string;
  statusCode?: number;
  clientIp?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class LoggerService {
  private static instance: LoggerService;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  async getLogs(filters: LogFilters): Promise<ServiceResponse> {
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
    } catch (error) {
      console.error('Error retrieving logs:', error);
      return {
        success: false,
        message: 'Failed to retrieve logs',
        data: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getLogStats(): Promise<ServiceResponse> {
    try {
      const stats = await this.logger.getStats();

      return {
        success: true,
        message: 'Log statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error retrieving log stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve log statistics',
        data: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getLogLevels(): ServiceResponse {
    try {
      const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

      return {
        success: true,
        message: 'Log levels retrieved successfully',
        data: { levels },
      };
    } catch (error) {
      console.error('Error retrieving log levels:', error);
      return {
        success: false,
        message: 'Failed to retrieve log levels',
        data: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async searchLogs(criteria: SearchCriteria): Promise<ServiceResponse> {
    try {
      let logs = await this.logger.getLogs({
        startDate: criteria.startDate,
        endDate: criteria.endDate,
        limit: (criteria.limit || 50) * 2, // Get more to filter
        offset: criteria.offset || 0,
      });

      // Apply additional filters
      if (criteria.query) {
        logs = logs.filter((log: any) =>
          log.url.toLowerCase().includes(criteria.query!.toLowerCase())
        );
      }

      if (criteria.method) {
        logs = logs.filter((log: any) => log.method === criteria.method);
      }

      if (criteria.statusCode) {
        logs = logs.filter((log: any) => log.statusCode === criteria.statusCode);
      }

      if (criteria.clientIp) {
        logs = logs.filter((log: any) => log.ipAddress === criteria.clientIp);
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
    } catch (error) {
      console.error('Error searching logs:', error);
      return {
        success: false,
        message: 'Failed to search logs',
        data: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}