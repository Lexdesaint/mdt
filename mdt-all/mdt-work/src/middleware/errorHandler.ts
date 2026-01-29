import { Request, Response, NextFunction } from "express";
import { ResponseFormatter } from "../type/response";
import { Logger } from "../api/logger/controller";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  Logger.getInstance().logError(err, req, res.locals.requestId);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  return ResponseFormatter.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? { stack: err.stack } : undefined
  );
};
