import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
export const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'root',
    database: process.env.PGDATABASE || 'maintenance_db',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
export async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        person_name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
        expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
        day_of_week VARCHAR(20) NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
      CREATE INDEX IF NOT EXISTS idx_expenses_person ON expenses(person_name);
    `);
        console.log('PostgreSQL database connected and schema initialized.');
    }
    finally {
        client.release();
    }
}
