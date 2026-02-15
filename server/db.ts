import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: NeonPool | PgPool | null = null;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | null = null;

// Only use Neon driver for actual Neon database URLs
function isNeonUrl(): boolean {
  const databaseUrl = process.env.DATABASE_URL || '';
  return databaseUrl.includes('neon.tech');
}

// Accept self-signed certificates from providers like Aiven, Render, etc.
const sslConfig = { rejectUnauthorized: false };

if (process.env.DATABASE_URL) {
  if (isNeonUrl()) {
    console.log('[DB] Using Neon serverless driver');
    pool = new NeonPool({ connectionString: process.env.DATABASE_URL, ssl: sslConfig });
    db = drizzleNeon({ client: pool as NeonPool, schema });
  } else {
    console.log('[DB] Using standard pg driver');
    pool = new PgPool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig
    });
    db = drizzlePg(pool as PgPool, { schema });
  }
}

export { pool, db };
