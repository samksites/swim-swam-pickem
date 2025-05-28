// Database Service
// This service handles database connections and queries using pg (node-postgres)
// It uses a connection pool for efficient database access

// Import necessary modules
// make sure to install pg package using npm or yarn
import { Pool } from 'pg';
// Import configuration
import config from '../config/config.json';

// import dotenv to load environment variables
import 'dotenv/config';

// database configuration
const db = config.database;

// Create a new pool instance
// using the database configuration from config.json
const pool = new Pool({
  user: db.username,
  password: process.env.DB_PASSWORD,
  host: db.host,
  port: db.port,
  database: db.database,
  ssl: db.options?.ssl || false,
});

/**
 * Executes a query against the database
 * @param query SQL query string 
 * @param params SQL query parameters
 * @returns database query result
 * @throws Error if the query fails
 */
export async function query(query: string, params?: any[]) {
  try {
    const res = await pool.query(query, params);
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}
