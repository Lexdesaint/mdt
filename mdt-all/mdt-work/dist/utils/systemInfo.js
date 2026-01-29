"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = exports.getSystemIp = void 0;
const os_1 = require("os");
const getSystemIp = () => {
    const interfaces = (0, os_1.networkInterfaces)();
    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (iface) {
            for (const alias of iface) {
                if (alias.family === 'IPv4' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
    return '127.0.0.1';
};
exports.getSystemIp = getSystemIp;
const getClientIp = (req) => {
    return req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        '127.0.0.1';
};
exports.getClientIp = getClientIp;
