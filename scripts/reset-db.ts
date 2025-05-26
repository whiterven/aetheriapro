import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config();

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  max: 1
});

async function reset() {
  console.log('Resetting database...');
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;
  console.log('Database reset complete');
  process.exit(0);
}

reset().catch((err) => {
  console.error('Failed to reset database:', err);
  process.exit(1);
});
