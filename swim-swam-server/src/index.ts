import express from 'express';
import morganMiddleware from './middleware/morganMiddleware';
import logger from './services/logger';

const app = express();

// Middleware to log requests
// This middleware uses Winston for logging
// It logs HTTP requests in a format that includes method, URL, status, response time, etc.
// Ensure that the logger is set up before using it
app.use(express.json());
app.use(morganMiddleware); // Morgan logs into Winston


// set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;



app.get('/', (_req, res) => {
res.send('Hello from Express + TypeScript!');
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});


