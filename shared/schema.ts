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

export type GameConfig = {
  impostorCount: number;
  enableHints: boolean;
  firstPlayerHintOnly: boolean;
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
  gameConfig?: GameConfig;
  impostorIds?: string[];
  hint?: string;
};

export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: varchar("titulo").notNull(),
  autor: varchar("autor").notNull(),
  palavras: jsonb("palavras").notNull().$type<string[]>(),
  isPublic: boolean("is_public").notNull().default(true),
  accessCode: varchar("access_code"),
  paymentStatus: varchar("payment_status").notNull().default("pending"),
  paymentId: varchar("payment_id"),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  author: text("author").notNull().default("Equipe TikJogos"),
  category: text("category").notNull(),
  imageUrl: text("imageUrl"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themes.$inferSelect;

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    visitorId: varchar("visitor_id", { length: 36 }).notNull(),
    eventType: varchar("event_type", { length: 30 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    pagePath: varchar("page_path", { length: 500 }),
    referrer: varchar("referrer", { length: 500 }),
    deviceType: varchar("device_type", { length: 20 }),
    browser: varchar("browser", { length: 50 }),
    country: varchar("country", { length: 100 }),
    city: varchar("city", { length: 100 }),
    sessionDuration: varchar("session_duration", { length: 20 }),
    roomCode: varchar("room_code", { length: 20 }),
    gameMode: varchar("game_mode", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_analytics_visitor_id").on(table.visitorId),
    index("idx_analytics_event_type").on(table.eventType),
    index("idx_analytics_created_at").on(table.createdAt),
  ]
);

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
