import { Pool } from 'pg';
import format from 'pg-format';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'global_crm',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000
});

/**
 * Execute a query with parameters
 */
export async function query(sql: string, params?: any[]): Promise<any> {
  try {
    const result = await pool.query(sql, params);
    
    // For UPDATE, INSERT, DELETE operations, return the result object
    // which includes rowCount property
    if (sql.trim().toUpperCase().startsWith('UPDATE') || 
        sql.trim().toUpperCase().startsWith('INSERT') || 
        sql.trim().toUpperCase().startsWith('DELETE')) {
      return result;
    }
    
    // For SELECT operations, return just the rows
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Format a query using pg-format
 */
export function formatQuery(sql: string, ...values: any[]): string {
  return format(sql, ...values);
}

/**
 * Test the database connection
 */
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please check your database configuration in .env file');
    // Don't exit the process, allow the application to handle the error
  }
}

export default {
  pool,
  query,
  formatQuery,
  testConnection
};
