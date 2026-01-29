"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileLogger {
    constructor(logsDir = 'logs', maxFileSize = 10, maxFiles = 100) {
        this.logsDir = logsDir;
        this.maxFileSize = maxFileSize * 1024 * 1024; // Convert to bytes
        this.maxFiles = maxFiles;
        this.ensureLogsDirectory();
    }
    ensureLogsDirectory() {
        if (!fs_1.default.existsSync(this.logsDir)) {
            fs_1.default.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    getCurrentLogFile() {
        const today = new Date().toISOString().split('T')[0];
        return path_1.default.join(this.logsDir, `app-${today}.log`);
    }
    rotateLogFile() {
        const currentFile = this.getCurrentLogFile();
        if (fs_1.default.existsSync(currentFile)) {
            const stats = fs_1.default.statSync(currentFile);
            if (stats.size >= this.maxFileSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedFile = path_1.default.join(this.logsDir, `app-${new Date().toISOString().split('T')[0]}-${timestamp}.log`);
                fs_1.default.renameSync(currentFile, rotatedFile);
            }
        }
        this.cleanupOldLogs();
    }
    cleanupOldLogs() {
        const files = fs_1.default.readdirSync(this.logsDir)
            .filter(file => file.endsWith('.log'))
            .map(file => ({
            name: file,
            path: path_1.default.join(this.logsDir, file),
            mtime: fs_1.default.statSync(path_1.default.join(this.logsDir, file)).mtime
        }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
        if (files.length > this.maxFiles) {
            files.slice(this.maxFiles).forEach(file => {
                fs_1.default.unlinkSync(file.path);
            });
        }
    }
    log(entry) {
        this.rotateLogFile();
        const logLine = JSON.stringify(entry) + '\n';
        const logFile = this.getCurrentLogFile();
        fs_1.default.appendFileSync(logFile, logLine);
    }
    getLogs(startDate, endDate, level, limit = 100) {
        const logs = [];
        const files = fs_1.default.readdirSync(this.logsDir)
            .filter(file => file.endsWith('.log'))
            .sort((a, b) => b.localeCompare(a)); // Most recent first
        for (const file of files) {
            const filePath = path_1.default.join(this.logsDir, file);
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    // Apply filters
                    if (startDate && entry.timestamp < startDate)
                        continue;
                    if (endDate && entry.timestamp > endDate)
                        continue;
                    if (level && entry.level !== level)
                        continue;
                    logs.push(entry);
                    if (logs.length >= limit)
                        break;
                }
                catch (error) {
                    // Skip malformed log entries
                    continue;
                }
            }
            if (logs.length >= limit)
                break;
        }
        return logs;
    }
    getLogStats() {
        const files = fs_1.default.readdirSync(this.logsDir)
            .filter(file => file.endsWith('.log'));
        const stats = {
            totalFiles: files.length,
            totalSize: 0,
            oldestLog: null,
            newestLog: null,
            levelCounts: { info: 0, warn: 0, error: 0, debug: 0 }
        };
        files.forEach(file => {
            const filePath = path_1.default.join(this.logsDir, file);
            const fileStats = fs_1.default.statSync(filePath);
            stats.totalSize += fileStats.size;
            if (!stats.oldestLog || fileStats.mtime < fs_1.default.statSync(path_1.default.join(this.logsDir, stats.oldestLog)).mtime) {
                stats.oldestLog = file;
            }
            if (!stats.newestLog || fileStats.mtime > fs_1.default.statSync(path_1.default.join(this.logsDir, stats.newestLog)).mtime) {
                stats.newestLog = file;
            }
            // Count log levels (sample from recent entries)
            try {
                const content = fs_1.default.readFileSync(filePath, 'utf8');
                const lines = content.trim().split('\n').slice(-100); // Last 100 lines
                lines.forEach(line => {
                    try {
                        const entry = JSON.parse(line);
                        if (entry.level && stats.levelCounts.hasOwnProperty(entry.level)) {
                            stats.levelCounts[entry.level]++;
                        }
                    }
                    catch (e) {
                        // Skip malformed entries
                    }
                });
            }
            catch (e) {
                // Skip problematic files
            }
        });
        return stats;
    }
}
exports.FileLogger = FileLogger;
