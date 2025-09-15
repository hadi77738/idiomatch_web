// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ljveqfmifeqquebjvwau',
  password: 'sugihmanik1',
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Executed query', { 
      text: text.length > 100 ? text.substring(0, 100) + '...' : text, 
      duration, 
      rows: res.rowCount 
    });
    
    return {
      rows: res.rows,
      rowCount: res.rowCount || 0 // Handle null case
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return await pool.connect();
}

export default pool;