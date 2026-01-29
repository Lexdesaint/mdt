import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  DatabaseAuditLogger,
  LogLevel,
  AuditLogEntry,
} from "./service/databaseAuditLogger";
import { getClientIp, getSystemIp } from "../../utils/systemInfo";
import { ResponseFormatter } from "../../type/response";
import { LoggerService } from "./service/loggerService";

export class Logger {
  private auditLogger: DatabaseAuditLogger;
  private static instance: Logger;

  constructor() {
    this.auditLogger = DatabaseAuditLogger.getInstance();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Middleware to add request ID and start time
  requestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    res.locals.requestId = requestId;
    res.locals.startTime = Date.now();

    next();
  };

  // Middleware to log response
  responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };

    res.on("finish", () => {
      Logger.getInstance().logResponse(req, res);
    });

    next();
  };

  private async logResponse(req: Request, res: Response): Promise<void> {
    const responseTime = Date.now() - (res.locals.startTime || Date.now());
    const level =
      res.statusCode >= 400
        ? LogLevel.ERROR
        : res.statusCode >= 300
        ? LogLevel.WARN
        : LogLevel.INFO;

    const entry: AuditLogEntry = {
      requestId: res.locals.requestId,
      userId: (req as any).user?.user_id || undefined,
      method: req.method,
      url: req.originalUrl,
      route: req.route?.path || undefined,
      statusCode: res.statusCode,
      responseTime,
      ipAddress: getClientIp(req),
      userAgent: req.get("User-Agent") || undefined,
      requestBody: req.body,
      responseBody: res.locals.responseBody,
      level,
    };

    await this.auditLogger.log(entry);
  }

  async logError(error: Error, req: Request, requestId: string): Promise<void> {
    const entry: AuditLogEntry = {
      requestId,
      userId: (req as any).user?.user_id || undefined,
      method: req.method,
      url: req.originalUrl,
      route: req.route?.path || undefined,
      statusCode: 500,
      responseTime: Date.now() - (req.res?.locals?.startTime || Date.now()),
      ipAddress: getClientIp(req),
      userAgent: req.get("User-Agent") || undefined,
      requestBody: req.body,
      errorMessage: error.message + (error.stack ? "\n" + error.stack : ""),
      level: LogLevel.ERROR,
    };

    await this.auditLogger.log(entry);
  }

  async getLogs(
    options: {
      startDate?: string;
      endDate?: string;
      level?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const { startDate, endDate, level, limit, offset } = options;

    return await this.auditLogger.getAuditLogs({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      level: level as LogLevel,
      limit,
      offset,
    });
  }

  async getStats(): Promise<any> {
    return await this.auditLogger.getAuditStats();
  }
}

// Route handlers
export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      startDate,
      endDate,
      level,
      limit = '100',
      offset = '0',
    } = req.query;

    const result = await LoggerService.getInstance().getLogs({
      startDate: startDate as string,
      endDate: endDate as string,
      level: level as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    if (!result.success) {
      return ResponseFormatter.error(res, result.message, 500, result.data);
    }

    return ResponseFormatter.success(res, result.message, result.data);
  } catch (error) {
    console.error('Get logs controller error:', error);
    return ResponseFormatter.error(
      res,
      'Failed to retrieve logs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const getLogStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await LoggerService.getInstance().getLogStats();

    if (!result.success) {
      return ResponseFormatter.error(res, result.message, 500, result.data);
    }

    return ResponseFormatter.success(res, result.message, result.data);
  } catch (error) {
    console.error('Get log stats controller error:', error);
    return ResponseFormatter.error(
      res,
      'Failed to retrieve log statistics',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const getLogLevels = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = LoggerService.getInstance().getLogLevels();

    if (!result.success) {
      return ResponseFormatter.error(res, result.message, 500, result.data);
    }

    return ResponseFormatter.success(res, result.message, result.data);
  } catch (error) {
    console.error('Get log levels controller error:', error);
    return ResponseFormatter.error(
      res,
      'Failed to retrieve log levels',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const searchLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      method,
      statusCode,
      clientIp,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
    } = req.query;

    const result = await LoggerService.getInstance().searchLogs({
      query: query as string,
      method: method as string,
      statusCode: statusCode ? parseInt(statusCode as string) : undefined,
      clientIp: clientIp as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    if (!result.success) {
      return ResponseFormatter.error(res, result.message, 500, result.data);
    }

    return ResponseFormatter.success(res, result.message, result.data);
  } catch (error) {
    console.error('Search logs controller error:', error);
    return ResponseFormatter.error(
      res,
      'Failed to search logs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};
