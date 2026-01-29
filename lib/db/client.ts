/**
 * Database Client - Postgres Connection
 *
 * This module provides the SQL client for interacting with the Postgres database.
 * Uses pg library for direct connections (required for Prisma Postgres).
 */

import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

/**
 * SQL template tag function that mimics @vercel/postgres API
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: any[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    // Build the query with parameterized values
    let query = strings[0];
    const params: any[] = [];

    for (let i = 0; i < values.length; i++) {
      params.push(values[i]);
      query += `$${params.length}${strings[i + 1]}`;
    }

    const result = await client.query(query, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } finally {
    client.release();
  }
}

// Add query method for dynamic queries
sql.query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
    };
  } finally {
    client.release();
  }
};

/**
 * Helper function to test database connection
 * Useful for health checks and debugging
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW()`;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
