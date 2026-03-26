import { pool } from './db';
import { Pool } from 'pg';

// Records a player joining a lobby. Called on room create and room join.
export async function trackLobbyJoin(
  roomCode: string,
  playerId: string,
  playerName: string,
  isHost: boolean,
  gameMode?: string | null,
  themeName?: string | null,
): Promise<void> {
  if (!pool) return;
  try {
    await (pool as Pool).query(
      `INSERT INTO lobby_sessions (room_code, player_id, player_name, game_mode, theme_name, joined_at, is_host)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
      [roomCode, playerId, playerName, gameMode ?? null, themeName ?? null, isHost],
    );
  } catch (err) {
    console.error('[LobbyTracker] trackLobbyJoin failed:', err);
  }
}

// Records a player leaving a lobby and computes session duration.
export async function trackLobbyLeave(
  roomCode: string,
  playerId: string,
): Promise<void> {
  if (!pool) return;
  try {
    await (pool as Pool).query(
      `UPDATE lobby_sessions
       SET left_at = NOW(),
           duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at))::INTEGER
       WHERE room_code = $1
         AND player_id = $2
         AND left_at IS NULL`,
      [roomCode, playerId],
    );
  } catch (err) {
    console.error('[LobbyTracker] trackLobbyLeave failed:', err);
  }
}

// Updates game_mode and theme_name for all open sessions in a room (called when game starts).
export async function trackLobbyGameStart(
  roomCode: string,
  gameMode: string,
  themeName?: string | null,
): Promise<void> {
  if (!pool) return;
  try {
    await (pool as Pool).query(
      `UPDATE lobby_sessions
       SET game_mode = $2, theme_name = COALESCE($3, theme_name)
       WHERE room_code = $1 AND left_at IS NULL`,
      [roomCode, gameMode, themeName ?? null],
    );
  } catch (err) {
    console.error('[LobbyTracker] trackLobbyGameStart failed:', err);
  }
}
