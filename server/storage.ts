import { type Player, type GameData, type User, type UpsertUser, users, type Theme, type InsertTheme, themes } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export type Room = {
  code: string;
  hostId: string;
  status: string;
  gameMode: string | null;
  currentCategory: string | null;
  currentWord: string | null;
  impostorId: string | null;
  gameData: GameData | null;
  players: Player[];
  createdAt: string;
};

export type InsertRoom = Omit<Room, 'createdAt'>;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(code: string): Promise<Room | undefined>;
  updateRoom(code: string, updates: Partial<InsertRoom>): Promise<Room | undefined>;
  addPlayerToRoom(code: string, player: Player): Promise<Room | undefined>;
  removePlayerFromRoom(code: string, playerId: string): Promise<Room | undefined>;
  deleteRoom(code: string): Promise<void>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  getTheme(id: string): Promise<Theme | undefined>;
  getThemeByAccessCode(accessCode: string): Promise<Theme | undefined>;
  getThemeByPaymentMetadata(titulo: string, autor: string): Promise<Theme | undefined>;
  getPublicApprovedThemes(): Promise<Theme[]>;
  updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme | undefined>;
  deleteTheme(id: string): Promise<void>;
}

export class MemoryStorage implements IStorage {
  private rooms: Map<string, Room> = new Map();
  private usersMap: Map<string, User> = new Map();
  private themesMap: Map<string, Theme> = new Map();
  private themeIdCounter: number = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existing = this.usersMap.get(userData.id!);
    const user: User = {
      id: userData.id!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.usersMap.set(user.id, user);
    return user;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      createdAt: new Date().toISOString()
    };
    this.rooms.set(room.code, room);
    return room;
  }

  async getRoom(code: string): Promise<Room | undefined> {
    return this.rooms.get(code);
  }

  async updateRoom(code: string, updates: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const updatedRoom: Room = { ...room, ...updates };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async addPlayerToRoom(code: string, player: Player): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const playerExists = room.players.some(p => p.uid === player.uid);
    if (playerExists) return room;

    const updatedRoom: Room = {
      ...room,
      players: [...room.players, player]
    };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async removePlayerFromRoom(code: string, playerId: string): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const updatedRoom: Room = {
      ...room,
      players: room.players.filter(p => p.uid !== playerId)
    };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(code: string): Promise<void> {
    this.rooms.delete(code);
  }

  cleanupOldRooms(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const entries = Array.from(this.rooms.entries());
    entries.forEach(([code, room]) => {
      if (new Date(room.createdAt).getTime() < oneHourAgo) {
        this.rooms.delete(code);
      }
    });
  }

  async createTheme(themeData: InsertTheme): Promise<Theme> {
    const id = `mem-theme-${this.themeIdCounter++}`;
    const theme: Theme = {
      id,
      titulo: themeData.titulo,
      autor: themeData.autor,
      palavras: themeData.palavras,
      isPublic: themeData.isPublic ?? true,
      accessCode: themeData.accessCode ?? null,
      paymentStatus: themeData.paymentStatus ?? "pending",
      approved: themeData.approved ?? false,
      createdAt: new Date(),
    };
    this.themesMap.set(id, theme);
    return theme;
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    return this.themesMap.get(id);
  }

  async getThemeByAccessCode(accessCode: string): Promise<Theme | undefined> {
    for (const theme of this.themesMap.values()) {
      if (theme.accessCode === accessCode) {
        return theme;
      }
    }
    return undefined;
  }

  async getThemeByPaymentMetadata(titulo: string, autor: string): Promise<Theme | undefined> {
    for (const theme of this.themesMap.values()) {
      if (theme.titulo === titulo && theme.autor === autor) {
        return theme;
      }
    }
    return undefined;
  }

  async getPublicApprovedThemes(): Promise<Theme[]> {
    const result: Theme[] = [];
    for (const theme of this.themesMap.values()) {
      if (theme.isPublic && theme.approved) {
        result.push(theme);
      }
    }
    return result;
  }

  async updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme | undefined> {
    const theme = this.themesMap.get(id);
    if (!theme) return undefined;
    const updatedTheme: Theme = { ...theme, ...updates };
    this.themesMap.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteTheme(id: string): Promise<void> {
    this.themesMap.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  private rooms: Map<string, Room> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      createdAt: new Date().toISOString()
    };
    this.rooms.set(room.code, room);
    return room;
  }

  async getRoom(code: string): Promise<Room | undefined> {
    return this.rooms.get(code);
  }

  async updateRoom(code: string, updates: Partial<InsertRoom>): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const updatedRoom: Room = { ...room, ...updates };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async addPlayerToRoom(code: string, player: Player): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const playerExists = room.players.some(p => p.uid === player.uid);
    if (playerExists) return room;

    const updatedRoom: Room = {
      ...room,
      players: [...room.players, player]
    };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async removePlayerFromRoom(code: string, playerId: string): Promise<Room | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const updatedRoom: Room = {
      ...room,
      players: room.players.filter(p => p.uid !== playerId)
    };
    this.rooms.set(code, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(code: string): Promise<void> {
    this.rooms.delete(code);
  }

  cleanupOldRooms(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const entries = Array.from(this.rooms.entries());
    entries.forEach(([code, room]) => {
      if (new Date(room.createdAt).getTime() < oneHourAgo) {
        this.rooms.delete(code);
      }
    });
  }

  async createTheme(themeData: InsertTheme): Promise<Theme> {
    if (!db) throw new Error("Database not initialized");
    const [theme] = await db.insert(themes).values(themeData).returning();
    return theme;
  }

  async getTheme(id: string): Promise<Theme | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme;
  }

  async getThemeByAccessCode(accessCode: string): Promise<Theme | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [theme] = await db.select().from(themes).where(eq(themes.accessCode, accessCode));
    return theme;
  }

  async getThemeByPaymentMetadata(titulo: string, autor: string): Promise<Theme | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [theme] = await db.select().from(themes).where(
      and(eq(themes.titulo, titulo), eq(themes.autor, autor))
    );
    return theme;
  }

  async getPublicApprovedThemes(): Promise<Theme[]> {
    if (!db) throw new Error("Database not initialized");
    const result = await db.select().from(themes).where(
      and(eq(themes.isPublic, true), eq(themes.approved, true))
    );
    return result;
  }

  async updateTheme(id: string, updates: Partial<InsertTheme>): Promise<Theme | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [theme] = await db.update(themes).set(updates).where(eq(themes.id, id)).returning();
    return theme;
  }

  async deleteTheme(id: string): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.delete(themes).where(eq(themes.id, id));
  }
}

function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    return new DatabaseStorage();
  }
  return new MemoryStorage();
}

export const storage = createStorage();

setInterval(() => {
  if ('cleanupOldRooms' in storage) {
    (storage as any).cleanupOldRooms();
  }
}, 30 * 60 * 1000);
