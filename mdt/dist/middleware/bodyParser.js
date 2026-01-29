"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyParsingErrorHandler = exports.urlencodedParser = exports.bodySizeLimit = void 0;
const express_1 = __importDefault(require("express"));
exports.bodySizeLimit = express_1.default.json({
    limit: '500mb',
    verify: (req, res, buf) => {
        if (buf.length > 500 * 1024 * 1024) { // 500MB in bytes
            const error = new Error('Request body too large');
            error.status = 413;
            error.type = 'entity.too.large';
            throw error;
        }
    }
});
exports.urlencodedParser = express_1.default.urlencoded({
    extended: true,
    limit: '500mb'
});
const bodyParsingErrorHandler = (err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request body too large. Maximum size is 500MB.'
        });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format in request body'
        });
    }
    if (err.status === 400 && err.body) {
        return res.status(400).json({
            success: false,
            message: 'Malformed request body'
        });
    }
    next(err);
};
exports.bodyParsingErrorHandler = bodyParsingErrorHandler;
