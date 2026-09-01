import type { Express } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { recordGameSession } from "./db.js";
import { trackRoomJoin } from "./analyticsMiddleware.js";
import { trackLobbyGameStart, trackLobbyJoin, trackLobbyLeave } from "./lobbyTracker.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const THEMES = [
  "Bebidas", "Animais", "Comidas", "Filmes", "Séries", "Países", "Cidades",
  "Profissões", "Esportes", "Frutas", "Marcas", "Objetos da casa", "Celebridades",
  "Personagens", "Coisas da escola", "Músicas", "Jogos", "Super-heróis",
];

type BombaPlayer = { uid: string; name: string; connected: boolean };
type BombaAnswer = { playerId: string; playerName: string; letter: string; answer: string };
type BombaRoom = {
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "exploded" | "completed";
  players: BombaPlayer[];
  theme: string | null;
  usedLetters: string[];
  answers: BombaAnswer[];
  currentPlayerIndex: number;
  selectedLetter: string | null;
  endAt: number | null;
  duration: number;
  loserId: string | null;
  settings: {
    roundSeconds: number;
    bannedLetters: string[];
  };
  createdAt: number;
};

const bombaRooms = new Map<string, BombaRoom>();
const pendingBotTurns = new Set<string>();
const BOT_WORDS: Record<string, string> = {
  A: "Abacaxi", B: "Banana", C: "Café", D: "Doce", E: "Esfiha", F: "Feijão",
  G: "Goiaba", H: "Hambúrguer", I: "Iogurte", J: "Jaca", K: "Kiwi", L: "Laranja",
  M: "Morango", N: "Nhoque", O: "Omelete", P: "Pizza", Q: "Queijo", R: "Refrigerante",
  S: "Suco", T: "Tapioca", U: "Uva", V: "Vitamina", W: "Waffle", X: "Xarope",
  Y: "Yakissoba", Z: "Zabaione",
};

function createCode() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = randomBytes(2).toString("hex").slice(0, 3).toUpperCase();
    if (!bombaRooms.has(code)) return code;
  }
  return Math.random().toString(36).slice(2, 5).toUpperCase();
}

function randomTheme(previous?: string | null) {
  const options = THEMES.filter((theme) => theme !== previous);
  return options[Math.floor(Math.random() * options.length)];
}

function normalizeInitial(value: string) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
}

function refreshExpiredRoom(room: BombaRoom) {
  if (room.status === "playing" && room.endAt && Date.now() >= room.endAt) {
    room.status = "exploded";
    room.loserId = room.players[room.currentPlayerIndex]?.uid || null;
  }
  return room;
}

function roomResponse(room: BombaRoom) {
  refreshExpiredRoom(room);
  return { ...room, serverNow: Date.now() };
}

export function getBombaRoomStats() {
  const rooms = Array.from(bombaRooms.values()).map(refreshExpiredRoom);
  return rooms.map((room) => ({
    code: room.code,
    status: room.status,
    players: room.players,
    theme: room.theme,
    usedLetters: room.usedLetters.length,
    answerCount: room.answers.length,
    roundSeconds: room.settings.roundSeconds,
    createdAt: new Date(room.createdAt).toISOString(),
  }));
}

function scheduleBombaBotTurn(room: BombaRoom) {
  if (room.status !== "playing" || pendingBotTurns.has(room.code)) return;
  const bot = room.players[room.currentPlayerIndex];
  if (!bot?.uid.startsWith("bomba-bot-")) return;
  pendingBotTurns.add(room.code);
  setTimeout(() => {
    pendingBotTurns.delete(room.code);
    const current = bombaRooms.get(room.code);
    if (!current) return;
    refreshExpiredRoom(current);
    const currentBot = current.players[current.currentPlayerIndex];
    if (current.status !== "playing" || currentBot?.uid !== bot.uid) return;
    const available = ALPHABET.filter((letter) => !current.usedLetters.includes(letter));
    if (!available.length) {
      current.status = "completed";
      current.endAt = null;
      return;
    }
    const letter = available[Math.floor(Math.random() * available.length)];
    current.selectedLetter = letter;
    current.usedLetters.push(letter);
    current.answers.push({ playerId: bot.uid, playerName: bot.name, letter, answer: BOT_WORDS[letter] || `${letter} resposta` });
    if (current.usedLetters.length === ALPHABET.length) {
      current.status = "completed";
      current.endAt = null;
      return;
    }
    current.currentPlayerIndex = (current.currentPlayerIndex + 1) % current.players.length;
    current.selectedLetter = null;
    current.endAt = Date.now() + current.duration * 1000;
    scheduleBombaBotTurn(current);
  }, 900 + Math.floor(Math.random() * 900));
}

export function setupBombaGame(app: Express) {
  app.post("/api/bomba/rooms", (req, res) => {
    try {
      const { playerId, nickname } = z.object({
        playerId: z.string().min(1),
        nickname: z.string().trim().min(1).max(18),
      }).parse(req.body);
      const code = createCode();
      const room: BombaRoom = {
        code,
        hostId: playerId,
        status: "waiting",
        players: [{ uid: playerId, name: nickname, connected: true }],
        theme: null,
        usedLetters: [],
        answers: [],
        currentPlayerIndex: 0,
        selectedLetter: null,
        endAt: null,
        duration: 0,
        loserId: null,
        settings: { roundSeconds: 10, bannedLetters: [] },
        createdAt: Date.now(),
      };
      if (nickname.toLowerCase() === "testeadm26") {
        ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"].forEach((name, index) => {
          room.players.push({ uid: `bomba-bot-${code}-${index}`, name, connected: true });
        });
      }
      bombaRooms.set(code, room);
      trackRoomJoin(req.cookies?.['visitor_id'] || playerId, code, 'bomba', req).catch(() => {});
      trackLobbyJoin(code, playerId, nickname, true, 'bomba', null, req).catch(() => {});
      res.json(roomResponse(room));
    } catch (error) {
      res.status(400).json({ error: "Não foi possível criar a sala." });
    }
  });

  app.post("/api/bomba/rooms/:code/join", (req, res) => {
    try {
      const code = req.params.code.toUpperCase();
      const { playerId, nickname } = z.object({
        playerId: z.string().min(1),
        nickname: z.string().trim().min(1).max(18),
      }).parse(req.body);
      const room = bombaRooms.get(code);
      if (!room) return res.status(404).json({ error: "Sala não encontrada." });
      if (room.status !== "waiting") return res.status(409).json({ error: "A partida já começou." });
      const existing = room.players.find((player) => player.uid === playerId);
      if (existing) {
        existing.name = nickname;
        existing.connected = true;
      } else {
        if (room.players.length >= 10) return res.status(409).json({ error: "A sala está cheia." });
        room.players.push({ uid: playerId, name: nickname, connected: true });
        trackLobbyJoin(code, playerId, nickname, false, 'bomba', null, req).catch(() => {});
      }
      res.json(roomResponse(room));
    } catch {
      res.status(400).json({ error: "Não foi possível entrar na sala." });
    }
  });

  app.get("/api/bomba/rooms/:code", (req, res) => {
    const room = bombaRooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    res.json(roomResponse(room));
  });

  app.post("/api/bomba/rooms/:code/settings", (req, res) => {
    const room = bombaRooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({
      playerId: z.string(),
      roundSeconds: z.number().int().min(5).max(30),
      bannedLetters: z.array(z.string().length(1)).max(16),
    }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode configurar a partida." });
    if (room.status !== "waiting") return res.status(409).json({ error: "As configurações só podem ser alteradas no lobby." });
    room.settings = {
      roundSeconds: parsed.data.roundSeconds,
      bannedLetters: Array.from(new Set(parsed.data.bannedLetters.map((letter) => letter.toUpperCase()).filter((letter) => ALPHABET.includes(letter)))),
    };
    res.json(roomResponse(room));
  });

  app.post("/api/bomba/rooms/:code/start", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = bombaRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({ playerId: z.string() }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode começar." });
    if (room.players.length < 2) return res.status(409).json({ error: "A sala precisa de pelo menos 2 jogadores." });
    const duration = room.settings.roundSeconds;
    room.status = "playing";
    room.theme = randomTheme(room.theme);
    room.usedLetters = [...room.settings.bannedLetters];
    room.answers = [];
    room.currentPlayerIndex = Math.floor(Math.random() * room.players.length);
    room.selectedLetter = null;
    room.duration = duration;
    room.endAt = Date.now() + duration * 1000;
    room.loserId = null;
    res.json(roomResponse(room));
    recordGameSession('bomba', code, room.players.length).catch(() => {});
    trackLobbyGameStart(code, 'bomba', room.theme).catch(() => {});
    scheduleBombaBotTurn(room);
  });

  app.post("/api/bomba/rooms/:code/letter", (req, res) => {
    const room = bombaRooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    refreshExpiredRoom(room);
    if (room.status !== "playing") return res.status(409).json({ error: "A rodada terminou." });
    const parsed = z.object({ playerId: z.string(), letter: z.string().length(1) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Escolha uma letra válida." });
    const player = room.players[room.currentPlayerIndex];
    if (!player || player.uid !== parsed.data.playerId) return res.status(409).json({ error: "Ainda não é a sua vez." });
    const letter = parsed.data.letter.toUpperCase();
    if (room.selectedLetter) {
      if (room.selectedLetter !== letter) return res.status(409).json({ error: `Você já escolheu a letra ${room.selectedLetter}.` });
      return res.json(roomResponse(room));
    }
    if (!ALPHABET.includes(letter) || room.usedLetters.includes(letter)) return res.status(409).json({ error: "Essa letra não está disponível." });
    room.selectedLetter = letter;
    res.json(roomResponse(room));
  });

  app.post("/api/bomba/rooms/:code/answer", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = bombaRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    refreshExpiredRoom(room);
    if (room.status !== "playing") return res.status(409).json({ error: "A rodada terminou." });
    const parsed = z.object({
      playerId: z.string(),
      letter: z.string().length(1),
      answer: z.string().trim().min(1).max(60),
    }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Preencha a letra e a palavra." });
    const { playerId, answer } = parsed.data;
    const letter = parsed.data.letter.toUpperCase();
    const player = room.players[room.currentPlayerIndex];
    if (!player || player.uid !== playerId) return res.status(409).json({ error: "Ainda não é a sua vez." });
    if (!room.selectedLetter) return res.status(409).json({ error: "Escolha uma letra antes de responder." });
    if (letter !== room.selectedLetter) return res.status(409).json({ error: `Sua letra escolhida é ${room.selectedLetter}.` });
    if (!ALPHABET.includes(letter) || room.usedLetters.includes(letter)) return res.status(409).json({ error: "Essa letra não está disponível." });
    if (normalizeInitial(answer) !== letter) return res.status(400).json({ error: `A resposta precisa começar com ${letter}.` });
    room.usedLetters.push(letter);
    room.answers.push({ playerId, playerName: player.name, letter, answer: answer.trim() });
    if (room.usedLetters.length === ALPHABET.length) {
      room.status = "completed";
      room.endAt = null;
    } else {
      room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
      room.selectedLetter = null;
      room.endAt = Date.now() + room.duration * 1000;
    }
    res.json(roomResponse(room));
    scheduleBombaBotTurn(room);
  });

  app.post("/api/bomba/rooms/:code/restart", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = bombaRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({ playerId: z.string(), keepTheme: z.boolean().optional() }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode reiniciar." });
    const duration = room.settings.roundSeconds;
    if (!parsed.data.keepTheme) room.theme = randomTheme(room.theme);
    room.status = "playing";
    room.usedLetters = [...room.settings.bannedLetters];
    room.answers = [];
    room.currentPlayerIndex = Math.floor(Math.random() * room.players.length);
    room.selectedLetter = null;
    room.duration = duration;
    room.endAt = Date.now() + duration * 1000;
    room.loserId = null;
    res.json(roomResponse(room));
    recordGameSession('bomba', code, room.players.length).catch(() => {});
    scheduleBombaBotTurn(room);
  });

  app.post("/api/bomba/rooms/:code/lobby", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = bombaRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({ playerId: z.string() }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o líder pode voltar ao lobby." });
    room.status = "waiting";
    room.theme = "";
    room.usedLetters = [...room.settings.bannedLetters];
    room.answers = [];
    room.currentPlayerIndex = 0;
    room.selectedLetter = null;
    room.endAt = null;
    room.loserId = null;
    res.json(roomResponse(room));
  });

  app.post("/api/bomba/rooms/:code/leave", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = bombaRooms.get(code);
    if (!room) return res.json({ ok: true });
    const playerId = typeof req.body?.playerId === "string" ? req.body.playerId : "";
    room.players = room.players.filter((player) => player.uid !== playerId);
    if (playerId) trackLobbyLeave(code, playerId).catch(() => {});
    if (room.players.length === 0) bombaRooms.delete(code);
    else if (room.hostId === playerId) room.hostId = room.players[0].uid;
    res.json({ ok: true });
  });
}
