"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const response_1 = require("../type/response");
const controller_1 = require("../api/logger/controller");
const globalErrorHandler = (err, req, res, next) => {
    // Log the error
    controller_1.Logger.getInstance().logError(err, req, res.locals.requestId);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || "Internal server error";
    return response_1.ResponseFormatter.error(res, message, statusCode, process.env.NODE_ENV === "development" ? { stack: err.stack } : undefined);
};
exports.globalErrorHandler = globalErrorHandler;
