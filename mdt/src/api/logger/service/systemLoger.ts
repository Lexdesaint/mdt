import fs from 'fs';
import path from 'path';
import { LogEntry } from '../../../type/response';

export class FileLogger {
  private logsDir: string;
  private maxFileSize: number; // in MB
  private maxFiles: number;

  constructor(
    logsDir: string = 'logs',
    maxFileSize: number = 10,
    maxFiles: number = 100
  ) {
    this.logsDir = logsDir;
    this.maxFileSize = maxFileSize * 1024 * 1024; // Convert to bytes
    this.maxFiles = maxFiles;
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getCurrentLogFile(): string {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `app-${today}.log`);
  }

  private rotateLogFile(): void {
    const currentFile = this.getCurrentLogFile();
    
    if (fs.existsSync(currentFile)) {
      const stats = fs.statSync(currentFile);
      if (stats.size >= this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = path.join(
          this.logsDir, 
          `app-${new Date().toISOString().split('T')[0]}-${timestamp}.log`
        );
        fs.renameSync(currentFile, rotatedFile);
      }
    }

    this.cleanupOldLogs();
  }

  private cleanupOldLogs(): void {
    const files = fs.readdirSync(this.logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(this.logsDir, file),
        mtime: fs.statSync(path.join(this.logsDir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length > this.maxFiles) {
      files.slice(this.maxFiles).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }

  log(entry: LogEntry): void {
    this.rotateLogFile();
    const logLine = JSON.stringify(entry) + '\n';
    const logFile = this.getCurrentLogFile();
    fs.appendFileSync(logFile, logLine);
  }

  getLogs(
    startDate?: string, 
    endDate?: string, 
    level?: string, 
    limit: number = 100
  ): LogEntry[] {
    const logs: LogEntry[] = [];
    const files = fs.readdirSync(this.logsDir)
      .filter(file => file.endsWith('.log'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first

    for (const file of files) {
      const filePath = path.join(this.logsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);

      for (const line of lines) {
        try {
          const entry: LogEntry = JSON.parse(line);
          
          // Apply filters
          if (startDate && entry.timestamp < startDate) continue;
          if (endDate && entry.timestamp > endDate) continue;
          if (level && entry.level !== level) continue;

          logs.push(entry);
          
          if (logs.length >= limit) break;
        } catch (error) {
          // Skip malformed log entries
          continue;
        }
      }
      
      if (logs.length >= limit) break;
    }

    return logs;
  }

  getLogStats(): any {
    const files = fs.readdirSync(this.logsDir)
      .filter(file => file.endsWith('.log'));

    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      oldestLog: null as string | null,
      newestLog: null as string | null,
      levelCounts: { info: 0, warn: 0, error: 0, debug: 0 }
    };

    files.forEach(file => {
      const filePath = path.join(this.logsDir, file);
      const fileStats = fs.statSync(filePath);
      stats.totalSize += fileStats.size;

      if (!stats.oldestLog || fileStats.mtime < fs.statSync(path.join(this.logsDir, stats.oldestLog)).mtime) {
        stats.oldestLog = file;
      }
      
      if (!stats.newestLog || fileStats.mtime > fs.statSync(path.join(this.logsDir, stats.newestLog)).mtime) {
        stats.newestLog = file;
      }

      // Count log levels (sample from recent entries)
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').slice(-100); // Last 100 lines
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            if (entry.level && stats.levelCounts.hasOwnProperty(entry.level)) {
              stats.levelCounts[entry.level as keyof typeof stats.levelCounts]++;
            }
          } catch (e) {
            // Skip malformed entries
          }
        });
      } catch (e) {
        // Skip problematic files
      }
    });

    return stats;
  }
}