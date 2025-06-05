// src/morganMiddleware.ts
import morgan, { StreamOptions } from 'morgan';
import logger from '../services/logger';

// Create a stream object with a 'write' function
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

// Skip logging for test environment
const skip = () => process.env.NODE_ENV === 'test';

// Build the morgan middleware
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
