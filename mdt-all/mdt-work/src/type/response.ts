import { Response } from 'express';
import { uuidv4 } from 'zod';
import { getSystemIp } from '../utils/systemInfo';




export interface StandardResponse<T = any> {
  status: 'success' | 'error' | 'warning';
  message: string;
  code: number;
  body?: T;
  timestamp: string;
  systemIp: string;
  requestId: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  clientIp: string;
  systemIp: string;
  userAgent: string;
  requestId: string;
  requestBody?: any;
  responseBody?: any;
  errorStack?: string;
  userId?: string;
}

export class ResponseFormatter {
  private static getRequestId(res: Response): string {
    return res.locals.requestId || uuidv4();
  }

  static success<T>(
    res: Response, 
    message: string, 
    data?: T, 
    statusCode: number = 200
  ): Response<StandardResponse<T>> {
    const response: StandardResponse<T> = {
      status: 'success',
      message,
      code: statusCode,
      body: data,
      timestamp: new Date().toISOString(),
      systemIp: getSystemIp(),
      requestId: this.getRequestId(res)
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorDetails?: any
  ): Response<StandardResponse> {
    const response: StandardResponse = {
      status: 'error',
      message,
      code: statusCode,
      body: errorDetails,
      timestamp: new Date().toISOString(),
      systemIp: getSystemIp(),
      requestId: this.getRequestId(res)
    };

    return res.status(statusCode).json(response);
  }

  static warning<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 400
  ): Response<StandardResponse<T>> {
    const response: StandardResponse<T> = {
      status: 'warning',
      message,
      code: statusCode,
      body: data,
      timestamp: new Date().toISOString(),
      systemIp: getSystemIp(),
      requestId: this.getRequestId(res)
    };

    return res.status(statusCode).json(response);
  }
}
