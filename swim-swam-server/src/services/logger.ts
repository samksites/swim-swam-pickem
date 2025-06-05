// src/logger.ts
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Rotating daily file transport
const dailyRotateTransport = new DailyRotateFile({
  filename: './src/logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

// Rotating daily file transport for error logs
const errorRotateTransport = new DailyRotateFile({
  filename: './src/logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
});

// Create the logger instance
const logger = createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'express-app' },
  transports: [
    new transports.Console({ format: format.combine(format.colorize(), logFormat) }),
    dailyRotateTransport,
    errorRotateTransport,
  ],
});

export default logger;