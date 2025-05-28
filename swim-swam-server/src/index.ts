import express from 'express';
import { query } from './services/dbService';

const app = express();
const PORT = 3000;

async function startServer() {
  // Await the query
  const result = await query('select * from swimswam_user;', []);
  console.log(result);

  app.get('/', (_req, res) => {
    res.send('Hello from Express + TypeScript!');
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();