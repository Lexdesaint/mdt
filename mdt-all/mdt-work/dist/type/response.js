"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
const zod_1 = require("zod");
const systemInfo_1 = require("../utils/systemInfo");
class ResponseFormatter {
    static getRequestId(res) {
        return res.locals.requestId || (0, zod_1.uuidv4)();
    }
    static success(res, message, data, statusCode = 200) {
        const response = {
            status: 'success',
            message,
            code: statusCode,
            body: data,
            timestamp: new Date().toISOString(),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            requestId: this.getRequestId(res)
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 500, errorDetails) {
        const response = {
            status: 'error',
            message,
            code: statusCode,
            body: errorDetails,
            timestamp: new Date().toISOString(),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            requestId: this.getRequestId(res)
        };
        return res.status(statusCode).json(response);
    }
    static warning(res, message, data, statusCode = 400) {
        const response = {
            status: 'warning',
            message,
            code: statusCode,
            body: data,
            timestamp: new Date().toISOString(),
            systemIp: (0, systemInfo_1.getSystemIp)(),
            requestId: this.getRequestId(res)
        };
        return res.status(statusCode).json(response);
    }
}
exports.ResponseFormatter = ResponseFormatter;
