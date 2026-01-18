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
import { text } from 'stream/consumers';

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


export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

/**
 * Gets a client from the connection pool
 * @returns client
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Releases a client back to the pool
 * @param client - the database client
 */
export async function closeClient(client: any) {
  client.release();
}

/**
 * Transaction helpers
 */
export async function begin(client: any) {
  await client.query('BEGIN');
}

/**
 * Executes a query within a transaction
 * @param client - the database client
 * @param sql - the SQL query string
 * @param params - optional parameters for the SQL query
 * @returns query result
 */
export async function transactionQuery(client: any, sql: string, params?: any[]) {
  try {
  const start = Date.now();
  const res = await client.query(sql, params);
  const duration = Date.now() - start;
  console.log('Executed transaction query', { sql, duration, rows: res.rowCount });
  return res;
  } catch (error) {
    console.error('Transaction query failed', { sql, error });
    throw error;
  }
}

export async function commit(client: any) {
  await client.query('COMMIT');
}

export async function rollback(client: any) {
  await client.query('ROLLBACK');
}


