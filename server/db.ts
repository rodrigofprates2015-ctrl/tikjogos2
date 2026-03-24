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

export type GameType = 'impostor' | 'desenho' | 'sincronia' | 'desafio';

export async function recordGameSession(gameType: GameType, roomCode: string, playerCount: number): Promise<void> {
  if (!pool) {
    console.warn('[GameSessions] No DB pool available, skipping record');
    return;
  }
  try {
    await (pool as PgPool).query(
      `INSERT INTO game_sessions (id, game_type, room_code, player_count, played_at)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW())`,
      [gameType, roomCode, playerCount]
    );
    console.log(`[GameSessions] ✓ Recorded: ${gameType} | room ${roomCode} | ${playerCount} players`);
  } catch (err) {
    console.error('[GameSessions] Failed to record session:', err);
  }
}

export type DailyCount = { date: string; count: number };

export async function getGameSessionStats(gameType: GameType, days = 30): Promise<DailyCount[]> {
  if (!pool) return [];
  try {
    const res = await (pool as PgPool).query<{ date: string; count: string }>(`
      SELECT
        to_char(date_trunc('day', played_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS count
      FROM game_sessions
      WHERE game_type = $1
        AND played_at >= NOW() - INTERVAL '${days} days'
      GROUP BY 1
      ORDER BY 1
    `, [gameType]);
    const rows = res.rows;

    const result: DailyCount[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = rows.find(r => r.date === dateStr);
      result.push({ date: dateStr, count: found ? Number(found.count) : 0 });
    }
    return result;
  } catch (err) {
    console.error('[GameSessions] Failed to get stats:', err);
    return [];
  }
}
