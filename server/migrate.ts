import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from "@shared/schema";

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('[Migration] No DATABASE_URL found, skipping migrations');
    return;
  }

  console.log('[Migration] Starting database migrations...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(pool, { schema });

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

    // Add new analytics columns for device/geo/session tracking
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS device_type VARCHAR(20)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS browser VARCHAR(50)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country VARCHAR(100)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city VARCHAR(100)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_duration VARCHAR(20)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS room_code VARCHAR(20)
    `);
    await db.execute(sql`
      ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS game_mode VARCHAR(50)
    `);
    // Widen event_type column to support new event types
    await db.execute(sql`
      ALTER TABLE analytics_events ALTER COLUMN event_type TYPE VARCHAR(30)
    `);
    console.log('[Migration] analytics_events new columns ensured');

    console.log('[Migration] All migrations completed successfully!');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch(console.error);
