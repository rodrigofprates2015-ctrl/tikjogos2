import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: NeonPool | PgPool | null = null;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> | null = null;

function isNeonEnvironment(): boolean {
  const databaseUrl = process.env.DATABASE_URL || '';
  const isReplit = !!process.env.REPLIT_DEV_DOMAIN || !!process.env.REPL_ID;
  const isNeonUrl = databaseUrl.includes('neon.tech');
  return isReplit || isNeonUrl;
}

if (process.env.DATABASE_URL) {
  if (isNeonEnvironment()) {
    console.log('[DB] Using Neon serverless driver (Replit environment)');
    pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
    db = drizzleNeon({ client: pool as NeonPool, schema });
  } else {
    console.log('[DB] Using standard pg driver (Railway/production environment)');
    pool = new PgPool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    db = drizzlePg(pool as PgPool, { schema });
  }
}

export { pool, db };
