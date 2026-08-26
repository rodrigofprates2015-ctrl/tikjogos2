import type { Express } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { recordGameSession } from "./db.js";
import { trackRoomJoin } from "./analyticsMiddleware.js";
import { trackLobbyGameStart, trackLobbyJoin, trackLobbyLeave } from "./lobbyTracker.js";

type GameMode = "classic" | "challenge";
type Player = { uid: string; name: string; connected: boolean; eliminated: boolean };
type Attempt = { playerId: string; playerName: string; elapsedMs: number; differenceMs: number };
type ChallengeAttempt = { playerId: string; playerName: string; elapsedMs: number; accumulatedAfterMs: number };
type ChallengeResolution = { challengerId: string; challengerName: string; challengedId: string; challengedName: string; loserId: string; loserName: string; wasOver: boolean; accumulatedMs: number; targetMs: number };
type Room = {
  code: string; hostId: string; status: "waiting" | "playing" | "results"; gameMode: GameMode;
  players: Player[]; targetMs: number | null; startedAt: number | null; attempts: Attempt[];
  showTimer: boolean; round: number; createdAt: number;
  challengePhase: "suggesting" | "turn" | "finished" | null; accumulatedMs: number;
  currentPlayerId: string | null; suggesterId: string | null; lastChallengeAttempt: ChallengeAttempt | null;
  lastResolution: ChallengeResolution | null; winnerId: string | null; timerActivePlayerId: string | null;
};

const rooms = new Map<string, Room>();

function code() {
  for (let i = 0; i < 20; i++) {
    const value = randomBytes(2).toString("hex").slice(0, 3).toUpperCase();
    if (!rooms.has(value)) return value;
  }
  return Math.random().toString(36).slice(2, 5).toUpperCase();
}

function randomTarget(previous?: number | null) {
  let value = 0;
  do value = 100 + Math.floor(Math.random() * 9900); while (value === previous);
  return value;
}

const activePlayers = (room: Room) => room.players.filter(player => !player.eliminated);

function nextActiveAfter(room: Room, playerId: string) {
  if (!room.players.length) return null;
  const found = room.players.findIndex(player => player.uid === playerId);
  const startIndex = found >= 0 ? found : 0;
  for (let offset = 1; offset <= room.players.length; offset++) {
    const candidate = room.players[(startIndex + offset) % room.players.length];
    if (!candidate.eliminated) return candidate;
  }
  return null;
}

function response(room: Room) {
  const sorted = room.gameMode === "classic" ? [...room.attempts].sort((a, b) => a.differenceMs - b.differenceMs || a.elapsedMs - b.elapsedMs) : room.attempts;
  return { ...room, attempts: sorted, serverNow: Date.now(), winnerIds: room.gameMode === "classic" && sorted.length ? sorted.filter(a => a.differenceMs === sorted[0].differenceMs).map(a => a.playerId) : room.winnerId ? [room.winnerId] : [] };
}

function maybeFinishClassic(room: Room) {
  if (room.gameMode === "classic" && room.status === "playing" && room.players.length > 0 && room.attempts.length >= room.players.length) room.status = "results";
}

function scheduleClassicBots(room: Room) {
  room.players.filter(p => p.uid.startsWith("chrono-bot-")).forEach((bot, index) => {
    setTimeout(() => {
      const current = rooms.get(room.code);
      if (!current || current.gameMode !== "classic" || current.status !== "playing" || current.attempts.some(a => a.playerId === bot.uid) || !current.targetMs) return;
      const elapsedMs = Math.max(1, current.targetMs + Math.floor(Math.random() * 401) - 200);
      current.attempts.push({ playerId: bot.uid, playerName: bot.name, elapsedMs, differenceMs: Math.abs(elapsedMs - current.targetMs) });
      maybeFinishClassic(current);
    }, 900 + index * 450 + Math.floor(Math.random() * 600));
  });
}

function resetChallengeRound(room: Room, suggesterId: string) {
  room.status = "playing"; room.challengePhase = "suggesting"; room.targetMs = null; room.accumulatedMs = 0;
  room.currentPlayerId = null; room.suggesterId = suggesterId; room.lastChallengeAttempt = null; room.timerActivePlayerId = null; room.round += 1;
}

function resolveChallenge(room: Room, challengerId: string) {
  const challenger = room.players.find(player => player.uid === challengerId && !player.eliminated);
  const challenged = room.lastChallengeAttempt && room.players.find(player => player.uid === room.lastChallengeAttempt?.playerId && !player.eliminated);
  if (!challenger || !challenged || !room.targetMs) throw new Error("Não existe um jogador anterior para desafiar.");
  const wasOver = room.accumulatedMs > room.targetMs;
  const loser = wasOver ? challenged : challenger;
  loser.eliminated = true;
  room.lastResolution = { challengerId: challenger.uid, challengerName: challenger.name, challengedId: challenged.uid, challengedName: challenged.name, loserId: loser.uid, loserName: loser.name, wasOver, accumulatedMs: room.accumulatedMs, targetMs: room.targetMs };
  const survivors = activePlayers(room);
  if (survivors.length <= 1) {
    room.status = "results"; room.challengePhase = "finished"; room.winnerId = survivors[0]?.uid ?? null; room.currentPlayerId = null; room.suggesterId = null;
    return;
  }
  const nextSuggester = nextActiveAfter(room, loser.uid) ?? survivors[0];
  resetChallengeRound(room, nextSuggester.uid);
  scheduleChallengeBot(room);
}

function scheduleChallengeBot(room: Room) {
  const expectedPhase = room.challengePhase;
  const expectedPlayerId = expectedPhase === "suggesting" ? room.suggesterId : room.currentPlayerId;
  if (!expectedPlayerId?.startsWith("chrono-bot-")) return;
  setTimeout(() => {
    const current = rooms.get(room.code);
    if (!current || current.gameMode !== "challenge" || current.status !== "playing" || current.challengePhase !== expectedPhase) return;
    const actorId = expectedPhase === "suggesting" ? current.suggesterId : current.currentPlayerId;
    if (actorId !== expectedPlayerId) return;
    if (expectedPhase === "suggesting") {
      current.targetMs = 3000 + Math.floor(Math.random() * 4001); current.challengePhase = "turn"; current.currentPlayerId = expectedPlayerId; current.suggesterId = null;
      scheduleChallengeBot(current); return;
    }
    if (current.lastChallengeAttempt && current.targetMs && current.accumulatedMs > current.targetMs) { resolveChallenge(current, expectedPlayerId); return; }
    const bot = current.players.find(player => player.uid === expectedPlayerId);
    if (!bot || !current.targetMs) return;
    const remaining = Math.max(100, current.targetMs - current.accumulatedMs);
    const elapsedMs = Math.max(120, Math.min(1600, Math.round(remaining * (0.22 + Math.random() * 0.32))));
    current.accumulatedMs += elapsedMs;
    current.lastChallengeAttempt = { playerId: bot.uid, playerName: bot.name, elapsedMs, accumulatedAfterMs: current.accumulatedMs };
    current.currentPlayerId = nextActiveAfter(current, bot.uid)?.uid ?? null;
    scheduleChallengeBot(current);
  }, 850 + Math.floor(Math.random() * 650));
}

export function setupCronometroGame(app: Express) {
  app.post("/api/cronometro/rooms", (req, res) => {
    const parsed = z.object({ playerId: z.string().min(1), nickname: z.string().trim().min(1).max(18), gameMode: z.enum(["classic", "challenge"]).default("classic") }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Digite um apelido válido." });
    const roomCode = code();
    const room: Room = { code: roomCode, hostId: parsed.data.playerId, status: "waiting", gameMode: parsed.data.gameMode, players: [{ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true, eliminated: false }], targetMs: null, startedAt: null, attempts: [], showTimer: false, round: 0, createdAt: Date.now(), challengePhase: null, accumulatedMs: 0, currentPlayerId: null, suggesterId: null, lastChallengeAttempt: null, lastResolution: null, winnerId: null, timerActivePlayerId: null };
    if (parsed.data.nickname.toLowerCase() === "testeadm26") ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"].forEach((name, i) => room.players.push({ uid: `chrono-bot-${roomCode}-${i}`, name, connected: true, eliminated: false }));
    rooms.set(roomCode, room);
    const trackedMode = parsed.data.gameMode === "challenge" ? "cronometroDesafio" : "cronometroClassico";
    trackLobbyJoin(roomCode, parsed.data.playerId, parsed.data.nickname, true, trackedMode, null, req).catch(() => {});
    trackRoomJoin(req.cookies?.["visitor_id"] || parsed.data.playerId, roomCode, trackedMode, req).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/join", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (room.status !== "waiting") return res.status(409).json({ error: "A partida já começou." });
    const parsed = z.object({ playerId: z.string().min(1), nickname: z.string().trim().min(1).max(18) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    const existing = room.players.find(p => p.uid === parsed.data.playerId);
    if (existing) { existing.name = parsed.data.nickname; existing.connected = true; }
    else if (room.players.length < 12) room.players.push({ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true, eliminated: false });
    else return res.status(409).json({ error: "A sala está cheia." });
    const trackedMode = room.gameMode === "challenge" ? "cronometroDesafio" : "cronometroClassico";
    if (!existing) trackLobbyJoin(room.code, parsed.data.playerId, parsed.data.nickname, false, trackedMode, null, req).catch(() => {});
    trackRoomJoin(req.cookies?.["visitor_id"] || parsed.data.playerId, room.code, trackedMode, req).catch(() => {});
    res.json(response(room));
  });

  app.get("/api/cronometro/rooms/:code", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    res.json(response(room));
  });

  const startClassic = (room: Room) => {
    room.status = "playing"; room.targetMs = randomTarget(room.targetMs); room.startedAt = Date.now(); room.attempts = []; room.round += 1;
    room.players.forEach(player => { player.eliminated = false; }); room.challengePhase = null; room.winnerId = null; scheduleClassicBots(room);
  };
  const startChallenge = (room: Room) => {
    room.players.forEach(player => { player.eliminated = false; }); room.attempts = []; room.round = 0; room.lastResolution = null; room.winnerId = null;
    resetChallengeRound(room, room.players[0].uid); scheduleChallengeBot(room);
  };

  app.post("/api/cronometro/rooms/:code/start", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode iniciar." });
    if (room.gameMode === "challenge" && room.players.length < 2) return res.status(409).json({ error: "O modo Desafio precisa de pelo menos 2 jogadores." });
    room.gameMode === "classic" ? startClassic(room) : startChallenge(room);
    const trackedMode = room.gameMode === "challenge" ? "cronometroDesafio" : "cronometroClassico";
    trackLobbyGameStart(room.code, trackedMode, null).catch(() => {});
    recordGameSession("cronometro", room.code, room.players.length).catch(() => {});
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/settings", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode alterar as configurações." });
    if (room.status !== "waiting") return res.status(409).json({ error: "As configurações só podem ser alteradas no lobby." });
    const parsed = z.object({ showTimer: z.boolean().optional(), gameMode: z.enum(["classic", "challenge"]).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Configuração inválida." });
    if (parsed.data.showTimer !== undefined) room.showTimer = parsed.data.showTimer;
    if (parsed.data.gameMode !== undefined) {
      room.gameMode = parsed.data.gameMode;
      const trackedMode = room.gameMode === "challenge" ? "cronometroDesafio" : "cronometroClassico";
      trackLobbyGameStart(room.code, trackedMode, null).catch(() => {});
    }
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/suggest", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room || room.gameMode !== "challenge" || room.status !== "playing" || room.challengePhase !== "suggesting") return res.status(409).json({ error: "Não é hora de sugerir um tempo." });
    const parsed = z.object({ playerId: z.string(), targetMs: z.number().int().min(500).max(120000) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Escolha um tempo entre 0,50 e 120 segundos." });
    if (parsed.data.playerId !== room.suggesterId) return res.status(403).json({ error: "Apenas o jogador da vez pode sugerir o tempo." });
    room.targetMs = parsed.data.targetMs; room.challengePhase = "turn"; room.currentPlayerId = parsed.data.playerId; room.suggesterId = null;
    scheduleChallengeBot(room); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/challenge", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room || room.gameMode !== "challenge" || room.status !== "playing" || room.challengePhase !== "turn") return res.status(409).json({ error: "Não é possível desafiar agora." });
    if (req.body?.playerId !== room.currentPlayerId) return res.status(403).json({ error: "Apenas o próximo jogador pode desafiar." });
    if (!room.lastChallengeAttempt) return res.status(409).json({ error: "Ainda não existe uma jogada para desafiar." });
    try { resolveChallenge(room, req.body.playerId); } catch (error: any) { return res.status(409).json({ error: error.message }); }
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/timer-state", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room || room.gameMode !== "challenge" || room.status !== "playing" || room.challengePhase !== "turn") return res.status(409).json({ error: "O cronômetro não está disponível agora." });
    const parsed = z.object({ playerId: z.string(), running: z.boolean() }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.currentPlayerId) return res.status(403).json({ error: "Apenas o jogador da vez pode usar o cronômetro." });
    room.timerActivePlayerId = parsed.data.running ? parsed.data.playerId : null;
    res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/attempt", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room || room.status !== "playing" || !room.targetMs) return res.status(409).json({ error: "A rodada não está ativa." });
    const parsed = z.object({ playerId: z.string(), elapsedMs: z.number().int().min(0).max(120000) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Tentativa inválida." });
    const player = room.players.find(p => p.uid === parsed.data.playerId && !p.eliminated);
    if (!player) return res.status(403).json({ error: "Você não está ativo nesta sala." });
    if (room.gameMode === "challenge") {
      if (room.challengePhase !== "turn" || room.currentPlayerId !== player.uid) return res.status(403).json({ error: "Não é a sua vez." });
      room.timerActivePlayerId = null;
      room.accumulatedMs += parsed.data.elapsedMs;
      room.lastChallengeAttempt = { playerId: player.uid, playerName: player.name, elapsedMs: parsed.data.elapsedMs, accumulatedAfterMs: room.accumulatedMs };
      room.currentPlayerId = nextActiveAfter(room, player.uid)?.uid ?? null;
      scheduleChallengeBot(room); return res.json(response(room));
    }
    if (room.attempts.some(a => a.playerId === player.uid)) return res.status(409).json({ error: "Você já parou o cronômetro." });
    room.attempts.push({ playerId: player.uid, playerName: player.name, elapsedMs: parsed.data.elapsedMs, differenceMs: Math.abs(parsed.data.elapsedMs - room.targetMs) });
    maybeFinishClassic(room); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/next", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode sugerir um novo tempo." });
    if (room.gameMode !== "classic") return res.status(409).json({ error: "Essa ação pertence ao modo Clássico." });
    startClassic(room); recordGameSession("cronometro", room.code, room.players.length).catch(() => {}); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/repeat", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode repetir o tempo." });
    if (room.gameMode !== "classic" || !room.targetMs) return res.status(409).json({ error: "Ainda não há um tempo para repetir." });
    room.status = "playing"; room.startedAt = Date.now(); room.attempts = []; room.round += 1; scheduleClassicBots(room);
    recordGameSession("cronometro", room.code, room.players.length).catch(() => {}); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/lobby", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode voltar ao lobby." });
    room.status = "waiting"; room.targetMs = null; room.startedAt = null; room.attempts = []; room.challengePhase = null; room.accumulatedMs = 0; room.currentPlayerId = null; room.suggesterId = null; room.lastChallengeAttempt = null; room.lastResolution = null; room.winnerId = null; room.timerActivePlayerId = null;
    room.players.forEach(player => { player.eliminated = false; }); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/kick", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode expulsar." });
    if (req.body?.targetId === room.hostId) return res.status(400).json({ error: "O líder não pode se expulsar." });
    room.players = room.players.filter(p => p.uid !== req.body?.targetId); room.attempts = room.attempts.filter(a => a.playerId !== req.body?.targetId); maybeFinishClassic(room); res.json(response(room));
  });

  app.post("/api/cronometro/rooms/:code/leave", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.json({ ok: true });
    const leavingId = typeof req.body?.playerId === "string" ? req.body.playerId : "";
    room.players = room.players.filter(p => p.uid !== leavingId); room.attempts = room.attempts.filter(a => a.playerId !== leavingId);
    if (leavingId) trackLobbyLeave(room.code, leavingId).catch(() => {});
    if (!room.players.length) rooms.delete(room.code); else if (room.hostId === req.body?.playerId) room.hostId = room.players[0].uid; else maybeFinishClassic(room);
    res.json({ ok: true });
  });
}
