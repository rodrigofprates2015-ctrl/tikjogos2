import type { Express } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { recordGameSession } from "./db.js";
import { trackRoomJoin } from "./analyticsMiddleware.js";

type Player = { uid: string; name: string; connected: boolean };
type Attempt = { playerId: string; playerName: string; elapsedMs: number; differenceMs: number };
type Room = {
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "results";
  players: Player[];
  targetMs: number | null;
  startedAt: number | null;
  attempts: Attempt[];
  showTimer: boolean;
  round: number;
  createdAt: number;
};

const rooms = new Map<string, Room>();

function code() {
  for (let i = 0; i < 20; i++) {
    const value = randomBytes(2).toString("hex").slice(0, 3).toUpperCase();
    if (!rooms.has(value)) return value;
  }
  return Math.random().toString(36).slice(2, 5).toUpperCase();
}

function target(previous?: number | null) {
  let value = 0;
  do value = 100 + Math.floor(Math.random() * 9900); while (value === previous);
  return value;
}

function response(room: Room) {
  const sorted = [...room.attempts].sort((a, b) => a.differenceMs - b.differenceMs || a.elapsedMs - b.elapsedMs);
  return { ...room, attempts: sorted, serverNow: Date.now(), winnerIds: sorted.length ? sorted.filter(a => a.differenceMs === sorted[0].differenceMs).map(a => a.playerId) : [] };
}

function maybeFinish(room: Room) {
  if (room.status === "playing" && room.players.length > 0 && room.attempts.length >= room.players.length) room.status = "results";
}

function scheduleBots(room: Room) {
  room.players.filter(p => p.uid.startsWith("chrono-bot-")).forEach((bot, index) => {
    setTimeout(() => {
      const current = rooms.get(room.code);
      if (!current || current.status !== "playing" || current.attempts.some(a => a.playerId === bot.uid) || !current.targetMs) return;
      const error = Math.floor(Math.random() * 401) - 200;
      const elapsedMs = Math.max(1, current.targetMs + error);
      current.attempts.push({ playerId: bot.uid, playerName: bot.name, elapsedMs, differenceMs: Math.abs(elapsedMs - current.targetMs) });
      maybeFinish(current);
    }, 900 + index * 450 + Math.floor(Math.random() * 600));
  });
}

export function setupCronometroGame(app: Express) {
  app.post("/api/cronometro/rooms", (req, res) => {
    const parsed = z.object({ playerId: z.string().min(1), nickname: z.string().trim().min(1).max(18) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Digite um apelido válido." });
    const roomCode = code();
    const room: Room = { code: roomCode, hostId: parsed.data.playerId, status: "waiting", players: [{ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true }], targetMs: null, startedAt: null, attempts: [], showTimer: false, round: 0, createdAt: Date.now() };
    if (parsed.data.nickname.toLowerCase() === "testeadm26") ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"].forEach((name, i) => room.players.push({ uid: `chrono-bot-${roomCode}-${i}`, name, connected: true }));
    rooms.set(roomCode, room);
    trackRoomJoin(req.cookies?.["visitor_id"] || parsed.data.playerId, roomCode, "cronometro", req).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/join", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (room.status !== "waiting") return res.status(409).json({ error: "A partida já começou." });
    const parsed = z.object({ playerId: z.string().min(1), nickname: z.string().trim().min(1).max(18) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    const existing = room.players.find(p => p.uid === parsed.data.playerId);
    if (existing) existing.name = parsed.data.nickname;
    else if (room.players.length < 12) room.players.push({ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true });
    else return res.status(409).json({ error: "A sala está cheia." });
    trackRoomJoin(req.cookies?.["visitor_id"] || parsed.data.playerId, room.code, "cronometro", req).catch(() => {});
    res.json(response(room));
  });

  app.get("/api/cronometro/rooms/:code", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    res.json(response(room));
  });

  const start = (room: Room) => {
    room.status = "playing";
    room.targetMs = target(room.targetMs);
    room.startedAt = Date.now();
    room.attempts = [];
    room.round += 1;
    scheduleBots(room);
  };

  app.post("/api/cronometro/rooms/:code/start", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode iniciar." });
    start(room);
    recordGameSession("cronometro", room.code, room.players.length).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/settings", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode alterar as configurações." });
    const parsed = z.object({ showTimer: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Configuração inválida." });
    room.showTimer = parsed.data.showTimer;
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/attempt", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room || room.status !== "playing" || !room.targetMs || !room.startedAt) return res.status(409).json({ error: "A rodada não está ativa." });
    const parsed = z.object({ playerId: z.string(), elapsedMs: z.number().int().min(0).max(120000) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Tentativa inválida." });
    const player = room.players.find(p => p.uid === parsed.data.playerId);
    if (!player) return res.status(403).json({ error: "Você não está nesta sala." });
    if (room.attempts.some(a => a.playerId === player.uid)) return res.status(409).json({ error: "Você já parou o cronômetro." });
    room.attempts.push({ playerId: player.uid, playerName: player.name, elapsedMs: parsed.data.elapsedMs, differenceMs: Math.abs(parsed.data.elapsedMs - room.targetMs) });
    maybeFinish(room);
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/next", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode sugerir um novo tempo." });
    start(room);
    recordGameSession("cronometro", room.code, room.players.length).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/repeat", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode repetir o tempo." });
    if (!room.targetMs) return res.status(409).json({ error: "Ainda não há um tempo para repetir." });
    room.status = "playing";
    room.startedAt = Date.now();
    room.attempts = [];
    room.round += 1;
    scheduleBots(room);
    recordGameSession("cronometro", room.code, room.players.length).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/lobby", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode voltar ao lobby." });
    room.status = "waiting"; room.targetMs = null; room.startedAt = null; room.attempts = [];
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/kick", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode expulsar." });
    if (req.body?.targetId === room.hostId) return res.status(400).json({ error: "O líder não pode se expulsar." });
    room.players = room.players.filter(p => p.uid !== req.body?.targetId);
    room.attempts = room.attempts.filter(a => a.playerId !== req.body?.targetId);
    maybeFinish(room);
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/leave", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.json({ ok: true });
    room.players = room.players.filter(p => p.uid !== req.body?.playerId);
    room.attempts = room.attempts.filter(a => a.playerId !== req.body?.playerId);
    if (!room.players.length) rooms.delete(room.code);
    else if (room.hostId === req.body?.playerId) room.hostId = room.players[0].uid;
    else maybeFinish(room);
    res.json({ ok: true });
  });
}
