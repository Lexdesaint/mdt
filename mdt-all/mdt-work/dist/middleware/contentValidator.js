"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedSqlInjectionDetector = exports.contentTypeValidation = void 0;
const contentTypeValidation = (req, res, next) => {
    // Skip content-type check for GET, DELETE, HEAD, OPTIONS requests
    if (['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    const contentType = req.get('Content-Type');
    if (!contentType) {
        return res.status(400).json({
            success: false,
            message: 'Content-Type header is required'
        });
    }
    // Allow application/json, application/x-www-form-urlencoded, and multipart/form-data
    if (!contentType.includes('application/json') &&
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('multipart/form-data')) {
        return res.status(400).json({
            success: false,
            message: 'Content-Type must be application/json, application/x-www-form-urlencoded, or multipart/form-data'
        });
    }
    next();
};
exports.contentTypeValidation = contentTypeValidation;
const enhancedSqlInjectionDetector = (req, res, next) => {
    const sqlPatterns = [
        // Basic SQL keywords
        /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|TRUNCATE)\b/i,
        // SQL injection patterns
        /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
        /\bOR\b\s+['"]\w*['"]?\s*=\s*['"]\w*['"]?/i,
        // Comment patterns
        /(--|\#|\/\*|\*\/)/,
        // Union based injections
        /\bUNION\b.*\bSELECT\b/i,
        // Boolean based injections
        /\b(true|false)\b.*\b(AND|OR)\b.*\b(true|false)\b/i,
        // Time based injections
        /\b(SLEEP|DELAY|WAITFOR)\b/i,
        // Function calls that could be dangerous
        /\b(EXEC|EXECUTE|SP_|XP_)\b/i,
        // Hex values that might be used in injections
        /0x[0-9a-f]+/i,
    ];
    // Fields that are whitelisted from SQL injection detection
    // These fields commonly contain user agent strings or device information
    const whitelistedFields = [
        'deviceName',
        'device_name',
        'deviceInfo',
        'device_info',
        'userAgent',
        'user_agent',
        'devices_name'
    ];
    const checkForSqlInjection = (value) => {
        return sqlPatterns.some(pattern => pattern.test(value));
    };
    const checkObject = (obj, path = '') => {
        const vulnerabilities = [];
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    const currentPath = path ? `${path}.${key}` : key;
                    // Skip SQL injection check for whitelisted fields
                    const isWhitelisted = whitelistedFields.some(field => key.toLowerCase() === field.toLowerCase() ||
                        currentPath.toLowerCase().includes(field.toLowerCase()));
                    if (typeof value === 'string' && !isWhitelisted && checkForSqlInjection(value)) {
                        vulnerabilities.push(`Potential SQL injection detected in ${currentPath}: ${value.substring(0, 50)}...`);
                    }
                    else if (typeof value === 'object' && value !== null) {
                        // Recursively handle arrays and objects
                        if (Array.isArray(value)) {
                            value.forEach((item, index) => {
                                vulnerabilities.push(...checkObject(item, `${currentPath}[${index}]`));
                            });
                        }
                        else {
                            vulnerabilities.push(...checkObject(value, currentPath));
                        }
                    }
                }
            }
        }
        return vulnerabilities;
    };
    const bodyVulns = req.body ? checkObject(req.body, 'body') : [];
    const queryVulns = checkObject(req.query, 'query');
    const paramsVulns = checkObject(req.params, 'params');
    const allVulns = [...bodyVulns, ...queryVulns, ...paramsVulns];
    if (allVulns.length > 0) {
        console.warn('SQL Injection attempt detected:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            method: req.method,
            vulnerabilities: allVulns
        });
        return res.status(400).json({
            success: false,
            message: 'Security validation failed',
            errors: allVulns
        });
    }
    next();
};
exports.enhancedSqlInjectionDetector = enhancedSqlInjectionDetector;
