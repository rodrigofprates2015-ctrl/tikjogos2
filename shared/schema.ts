import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, jsonb, varchar, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const rooms = pgTable("rooms", {
  code: text("code").primaryKey(),
  hostId: text("host_id").notNull(),
  status: text("status").notNull().default("waiting"),
  gameMode: text("game_mode"),
  currentCategory: text("current_category"),
  currentWord: text("current_word"),
  impostorId: text("impostor_id"),
  gameData: jsonb("game_data").$type<GameData>(),
  players: jsonb("players").notNull().$type<Player[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  createdAt: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type Player = {
  uid: string;
  name: string;
  waitingForGame?: boolean;
  connected?: boolean;  // Track connection status - true = connected, false = temporarily disconnected
};

export type RoomStatus = "waiting" | "playing";

export type GameModeType = 
  | "palavraSecreta"
  | "palavras" 
  | "duasFaccoes"
  | "categoriaItem"
  | "perguntasDiferentes"
  | "palavraComunidade";

export type PlayerAnswer = {
  playerId: string;
  playerName: string;
  answer: string;
};

export type PlayerVote = {
  playerId: string;
  playerName: string;
  targetId: string;
  targetName: string;
};

export type GameData = {
  word?: string;
  location?: string;
  roles?: Record<string, string>;
  factions?: { A: string; B: string };
  factionMap?: Record<string, string>;
  category?: string;
  item?: string;
  question?: string;
  impostorQuestion?: string;
  questionRevealed?: boolean;
  answers?: PlayerAnswer[];
  answersRevealed?: boolean;
  crewQuestionRevealed?: boolean;
  votes?: PlayerVote[];
  votingStarted?: boolean;
  votesRevealed?: boolean;
};

export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: varchar("titulo").notNull(),
  autor: varchar("autor").notNull(),
  palavras: jsonb("palavras").notNull().$type<string[]>(),
  isPublic: boolean("is_public").notNull().default(true),
  accessCode: varchar("access_code"),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;
