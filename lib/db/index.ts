import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// biome-ignore lint: Forbidden non-null assertion.
export const client = postgres(process.env.POSTGRES_URL!, {
  ssl: {
    rejectUnauthorized: false
  },
  connect_timeout: 10
});

export const db = drizzle(client);
