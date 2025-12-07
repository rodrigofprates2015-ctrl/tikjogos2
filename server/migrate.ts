import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('[Migration] No DATABASE_URL found, skipping migrations');
    return;
  }

  console.log('[Migration] Starting database migrations...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    console.log('[Migration] sessions table ready');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire)
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migration] users table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS rooms (
        code TEXT PRIMARY KEY,
        host_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'waiting',
        game_mode TEXT,
        current_category TEXT,
        current_word TEXT,
        impostor_id TEXT,
        game_data JSONB,
        players JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[Migration] rooms table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS themes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo VARCHAR NOT NULL,
        autor VARCHAR NOT NULL,
        palavras JSONB NOT NULL,
        is_public BOOLEAN NOT NULL DEFAULT true,
        access_code VARCHAR,
        payment_status VARCHAR NOT NULL DEFAULT 'pending',
        payment_id VARCHAR,
        approved BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migration] themes table ready');

    await db.execute(sql`
      ALTER TABLE themes ADD COLUMN IF NOT EXISTS payment_id VARCHAR
    `);
    console.log('[Migration] payment_id column ensured');

    console.log('[Migration] All migrations completed successfully!');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);
