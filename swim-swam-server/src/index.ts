import express from 'express';
import morganMiddleware from './middleware/morganMiddleware';
import logger from './services/logger';
import competitionRoutes from './routes/competition.routes';

const app = express();

// Middleware to log requests
// This middleware uses Winston for logging
// It logs HTTP requests in a format that includes method, URL, status, response time, etc.
// Ensure that the logger is set up before using it
app.use(express.json());
app.use(morganMiddleware); // Morgan logs into Winston

// Mount routes
console.log('Mounting competition routes at /api/competitions');
app.use('/api/competitions', competitionRoutes);

// Add a test route to verify routing works
app.get('/test', (_req, res) => {
  res.json({ message: 'Test route works!' });
});

// set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  console.log('Root route hit');
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


