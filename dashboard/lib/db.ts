import 'server-only';
import { Pool, QueryResultRow } from 'pg';

// Server-only database connection for AMI Dashboard
// This file must never be imported in client components

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
});

/**
 * Execute a parameterized SQL query
 * @param sql - SQL query string with $1, $2, etc. placeholders
 * @param params - Array of parameter values
 * @returns Array of typed rows
 */
export async function query<T extends QueryResultRow>(
    sql: string,
    params?: unknown[]
): Promise<T[]> {
    const { rows } = await pool.query<T>(sql, params);
    return rows;
}

/**
 * Execute a query and return the first row or null
 */
export async function queryOne<T extends QueryResultRow>(
    sql: string,
    params?: unknown[]
): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
}

/**
 * Get the current timestamp from the database (useful for freshness checks)
 */
export async function getDbTime(): Promise<Date> {
    const result = await queryOne<{ now: Date }>('SELECT NOW() as now');
    return result?.now ?? new Date();
}
