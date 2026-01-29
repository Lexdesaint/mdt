import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FileLogger } from '../service/systemLoger';
import { LogEntry } from '../../../type/response';
import { getClientIp, getSystemIp } from '../../../utils/systemInfo';

export class Logger {
  private fileLogger: FileLogger;
  private static instance: Logger;

  constructor() {
    this.fileLogger = new FileLogger();
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
    
    // Log request
    this.logRequest(req, requestId);
    
    next();
  };

  // Middleware to log response
  responseMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body: any) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', () => {
      Logger.getInstance().logResponse(req, res);
    });

    next();
  };

  private logRequest(req: Request, requestId: string): void {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'info',
      method: req.method,
      url: req.originalUrl,
      statusCode: 0, // Will be updated in response
      responseTime: 0, // Will be calculated in response
      clientIp: getClientIp(req),
      systemIp: getSystemIp(),
      userAgent: req.get('User-Agent') || '',
      requestId,
      requestBody: this.sanitizeBody(req.body),
      userId: (req as any).user?.id || undefined
    };

    this.fileLogger.log(entry);
  }

  private logResponse(req: Request, res: Response): void {
    const responseTime = Date.now() - (res.locals.startTime || Date.now());
    const level = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';

    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      clientIp: getClientIp(req),
      systemIp: getSystemIp(),
      userAgent: req.get('User-Agent') || '',
      requestId: res.locals.requestId,
      requestBody: this.sanitizeBody(req.body),
      responseBody: this.sanitizeBody(res.locals.responseBody),
      userId: (req as any).user?.id || undefined
    };

    this.fileLogger.log(entry);
  }

  logError(error: Error, req: Request, requestId: string): void {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level: 'error',
      method: req.method,
      url: req.originalUrl,
      statusCode: 500,
      responseTime: Date.now() - (req.res?.locals?.startTime || Date.now()),
      clientIp: getClientIp(req),
      systemIp: getSystemIp(),
      userAgent: req.get('User-Agent') || '',
      requestId,
      requestBody: this.sanitizeBody(req.body),
      errorStack: error.stack,
      userId: (req as any).user?.id || undefined
    };

    this.fileLogger.log(entry);
  }

  getLogs(startDate?: string, endDate?: string, level?: string, limit?: number): LogEntry[] {
    return this.fileLogger.getLogs(startDate, endDate, level, limit);
  }

  getStats(): any {
    return this.fileLogger.getLogStats();
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;
    
    const sanitized = JSON.parse(JSON.stringify(body));
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const result: any = {};
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(obj[key]);
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }
}