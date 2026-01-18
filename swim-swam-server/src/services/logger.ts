// src/logger.ts
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Get log level from environment or default to 'info'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Custom log format with colors and better structure
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const { timestamp, level, message, service, stack, ...meta } = info;
    let log = `${timestamp} [${service}] ${level.toUpperCase()}: ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Console format with colors for development
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf((info) => {
    const { timestamp, level, message, service, ...meta } = info;
    let log = `${timestamp} [${service}] ${level}: ${message}`;
    
    // Add metadata for debug level
    if (info.level === 'debug' && Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Debug file transport (includes all levels)
const debugRotateTransport = new DailyRotateFile({
  filename: './src/logs/debug-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '50m',
  maxFiles: '7d',
  level: 'debug',
});

// Info file transport (excludes debug)
const infoRotateTransport = new DailyRotateFile({
  filename: './src/logs/info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

// Error file transport (errors only)
const errorRotateTransport = new DailyRotateFile({
  filename: './src/logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
});

// Warn file transport (warnings and above)
const warnRotateTransport = new DailyRotateFile({
  filename: './src/logs/warn-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d',
  level: 'warn',
});

// Create the logger instance with multiple levels
const logger = createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'swim-swam-server' },
  transports: [
    // Console transport (for development)
    new transports.Console({ 
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),
    
    // File transports
    debugRotateTransport,
    infoRotateTransport,
    warnRotateTransport,
    errorRotateTransport,
  ],
});

// Create convenience methods for different log levels
export const logLevels = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  verbose: (message: string, meta?: any) => logger.verbose(message, meta),
};

// Add startup log
logger.info(`Logger initialized with level: ${LOG_LEVEL}`);

export default logger;