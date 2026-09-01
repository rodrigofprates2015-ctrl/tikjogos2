import type { Express } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";

const CATEGORIES = ["Nome", "Animal", "Comida", "Cidade ou país", "Filme ou série", "Profissão", "Objeto", "Marca"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BOT_ANSWERS: Record<string, string[]> = {
  A: ["Ana", "Arara", "Arroz", "Argentina", "Avatar", "Arquiteto", "Agulha", "Adidas"],
  B: ["Bruno", "Baleia", "Bolo", "Brasil", "Barbie", "Bombeiro", "Bola", "Brastemp"],
  C: ["Carla", "Cachorro", "Coxinha", "Canadá", "Carros", "Cozinheiro", "Cadeira", "Coca-Cola"],
  M: ["Maria", "Macaco", "Macarrão", "México", "Matrix", "Médico", "Mesa", "Motorola"],
  P: ["Paulo", "Pinguim", "Pizza", "Portugal", "Pantera Negra", "Professor", "Panela", "Pepsi"],
  R: ["Rafael", "Rinoceronte", "Risoto", "Recife", "Ratatouille", "Radialista", "Relógio", "Renault"],
  S: ["Sofia", "Sapo", "Sushi", "Salvador", "Shrek", "Soldador", "Sapato", "Samsung"],
  T: ["Tiago", "Tigre", "Tapioca", "Tailândia", "Titanic", "Taxista", "Tesoura", "Toyota"],
};

type AnswerStatus = "pending" | "skipped" | "answered" | "noAnswer";
type StopAnswer = { category: string; value: string; status: AnswerStatus };
type StopPlayer = { uid: string; name: string; connected: boolean; characterIndex: number; answers: StopAnswer[]; currentIndex: number; finished: boolean; score: number };
type StopRoom = { code: string; hostId: string; status: "waiting" | "rolling" | "playing" | "voting" | "results"; letter: string; players: StopPlayer[]; votes: Record<string, Record<string, boolean>>; prevalidation: Record<string, boolean>; voteCategoryIndex: number; voteEndsAt: number | null; votingComplete: boolean; settings: { durationSeconds: number; excludedLetters: string[] }; revealAt: number | null; endAt: number | null; stopBy: string | null; stopAt: number | null; createdAt: number };
const rooms = new Map<string, StopRoom>();

function code() { let value = ""; do value = randomBytes(2).toString("hex").slice(0, 3).toUpperCase(); while (rooms.has(value)); return value; }
function blankAnswers(): StopAnswer[] { return CATEGORIES.map(category => ({ category, value: "", status: "pending" })); }
function isBot(player: StopPlayer) { return player.uid.startsWith("stop-bot-"); }
function looksValid(value: string, letter: string) {
  const clean = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z -]/g, "");
  if (clean.length < 3 || clean.charAt(0).toUpperCase() !== letter) return false;
  if (/(.)\1\1/i.test(clean) || !/[aeiouy]/i.test(clean)) return false;
  const lettersOnly = clean.replace(/[^a-z]/gi, "");
  return !/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(lettersOnly);
}
function prevalidate(room: StopRoom) {
  room.prevalidation = {};
  room.players.forEach(player => player.answers.forEach((answer, index) => {
    room.prevalidation[`${player.uid}:${index}`] = answer.status === "answered" && looksValid(answer.value, room.letter);
  }));
}
function addBotVotes(room: StopRoom) {
  const reviewable = room.players.flatMap(owner => owner.answers.map((answer, index) => ({ owner, answer, index }))).filter(item => item.answer.status === "answered" || item.answer.status === "noAnswer");
  reviewable.forEach(({ owner, index }) => room.players.filter(voter => isBot(voter) && voter.uid !== owner.uid).forEach(voter => { const key = `${owner.uid}:${index}`; room.votes[key] ||= {}; room.votes[key][voter.uid] = room.prevalidation[key]; }));
}
function beginVoting(room: StopRoom, stoppedBy?: string) { room.status = "voting"; room.endAt = null; room.stopBy = stoppedBy || null; room.stopAt = Date.now(); room.voteCategoryIndex = 0; room.voteEndsAt = Date.now() + 20_000; room.votingComplete = false; prevalidate(room); addBotVotes(room); }
function refreshRoom(room: StopRoom) {
  const now = Date.now();
  if (room.status === "rolling" && room.revealAt && now >= room.revealAt) room.status = "playing";
  if (room.status === "playing" && room.endAt && now >= room.endAt) beginVoting(room);
  if (room.status === "voting" && room.voteEndsAt && now >= room.voteEndsAt) {
    if (room.voteCategoryIndex < CATEGORIES.length - 1) { room.voteCategoryIndex += 1; room.voteEndsAt = now + 20_000; }
    else { room.votingComplete = true; room.voteEndsAt = null; }
  }
  return room;
}
function publicRoom(room: StopRoom) { refreshRoom(room); return { ...room, serverNow: Date.now() }; }
function initial(value: string) { return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase(); }
function nextIndex(answers: StopAnswer[], current: number) {
  for (let offset = 1; offset <= answers.length; offset++) {
    const index = (current + offset) % answers.length;
    if (answers[index].status === "pending") return index;
  }
  for (let offset = 1; offset <= answers.length; offset++) {
    const index = (current + offset) % answers.length;
    if (answers[index].status === "skipped") return index;
  }
  return current;
}

export function setupStopGame(app: Express) {
  app.post("/api/stop/rooms", (req, res) => {
    const parsed = z.object({ playerId: z.string().min(1), nickname: z.string().trim().min(1).max(18) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Digite um apelido válido." });
    const roomCode = code();
    const room: StopRoom = { code: roomCode, hostId: parsed.data.playerId, status: "waiting", letter: "", players: [{ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true, characterIndex: 0, answers: blankAnswers(), currentIndex: 0, finished: false, score: 0 }], votes: {}, prevalidation: {}, voteCategoryIndex: 0, voteEndsAt: null, votingComplete: false, settings: { durationSeconds: 180, excludedLetters: [] }, revealAt: null, endAt: null, stopBy: null, stopAt: null, createdAt: Date.now() };
    if (parsed.data.nickname.toLocaleLowerCase("pt-BR") === "testeadm26") {
      ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"].forEach((name, index) => room.players.push({ uid: `stop-bot-${roomCode}-${index}`, name, connected: true, characterIndex: index + 1, answers: blankAnswers(), currentIndex: 0, finished: false, score: 0 }));
    }
    rooms.set(roomCode, room); res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/join", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase());
    if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (room.status !== "waiting") return res.status(409).json({ error: "A partida já começou." });
    const parsed = z.object({ playerId: z.string(), nickname: z.string().trim().min(1).max(18) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    let player = room.players.find(item => item.uid === parsed.data.playerId);
    if (!player) { if (room.players.length >= 10) return res.status(409).json({ error: "Sala cheia." }); player = { uid: parsed.data.playerId, name: parsed.data.nickname, connected: true, characterIndex: room.players.length % 10, answers: blankAnswers(), currentIndex: 0, finished: false, score: 0 }; room.players.push(player); }
    res.json(publicRoom(room));
  });

  app.get("/api/stop/rooms/:code", (req, res) => { const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." }); res.json(publicRoom(room)); });

  app.post("/api/stop/rooms/:code/character", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({ playerId: z.string(), characterIndex: z.number().int().min(0).max(9) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Personagem inválido." });
    if (room.players.some(player => player.uid !== parsed.data.playerId && player.characterIndex === parsed.data.characterIndex)) return res.status(409).json({ error: "Personagem ocupado." });
    const player = room.players.find(item => item.uid === parsed.data.playerId); if (player) player.characterIndex = parsed.data.characterIndex; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/settings", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    const parsed = z.object({ playerId: z.string(), durationSeconds: z.number().int().min(120).max(600), excludedLetters: z.array(z.string().length(1)).max(25) }).safeParse(req.body);
    if (!parsed.success || parsed.data.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode configurar." });
    if (room.status !== "waiting") return res.status(409).json({ error: "Configure antes de iniciar." });
    room.settings = { durationSeconds: parsed.data.durationSeconds, excludedLetters: Array.from(new Set(parsed.data.excludedLetters.map(letter => letter.toUpperCase()).filter(letter => LETTERS.includes(letter)))) };
    res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/start", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode iniciar." });
    if (room.players.length < 2) return res.status(409).json({ error: "Entre com pelo menos 2 jogadores." });
    const availableLetters = LETTERS.filter(letter => !room.settings.excludedLetters.includes(letter)); if (!availableLetters.length) return res.status(409).json({ error: "Deixe pelo menos uma letra disponível." });
    room.status = "rolling"; room.letter = availableLetters[Math.floor(Math.random() * availableLetters.length)]; room.votes = {}; room.prevalidation = {}; room.voteCategoryIndex = 0; room.voteEndsAt = null; room.votingComplete = false; room.revealAt = Date.now() + 4200; room.endAt = room.revealAt + room.settings.durationSeconds * 1000; room.stopBy = null; room.stopAt = null;
    room.players.forEach(player => { player.answers = blankAnswers(); player.currentIndex = 0; player.finished = false; player.score = 0; if (isBot(player)) { const bank = BOT_ANSWERS[room.letter]; player.answers = CATEGORIES.map((category,index) => ({ category, value: bank?.[index] || `${room.letter}${["na", "nimal", "omida", "idade", "ilme", "rofissional", "bjeto", "arca"][index]}`, status: "answered" as const })); player.finished = true; } }); res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/answer", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || refreshRoom(room).status !== "playing") return res.status(409).json({ error: "Rodada indisponível." });
    const parsed = z.object({ playerId: z.string(), action: z.enum(["answer", "skip", "noAnswer"]), value: z.string().max(40).optional() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Resposta inválida." });
    const player = room.players.find(item => item.uid === parsed.data.playerId); if (!player) return res.status(404).json({ error: "Jogador não encontrado." });
    const answer = player.answers[player.currentIndex];
    if (parsed.data.action === "answer") { const value = (parsed.data.value || "").trim(); if (!value || initial(value) !== room.letter) return res.status(400).json({ error: `A resposta deve começar com ${room.letter}.` }); answer.value = value; answer.status = "answered"; }
    if (parsed.data.action === "skip") answer.status = "skipped";
    if (parsed.data.action === "noAnswer") { if (answer.status !== "skipped") return res.status(409).json({ error: "Pule a categoria antes de marcá-la sem resposta." }); answer.status = "noAnswer"; answer.value = ""; }
    player.currentIndex = nextIndex(player.answers, player.currentIndex); player.finished = player.answers.every(item => item.status === "answered" || item.status === "noAnswer"); res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/stop", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || refreshRoom(room).status !== "playing") return res.status(409).json({ error: "Rodada indisponível." });
    const player = room.players.find(item => item.uid === req.body?.playerId); if (!player?.finished) return res.status(409).json({ error: "Conclua ou justifique todas as categorias antes de dar STOP." });
    beginVoting(room, player.name);
    res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/vote", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || refreshRoom(room).status !== "voting" || room.votingComplete) return res.status(409).json({ error: "Votação indisponível." });
    const parsed = z.object({ voterId: z.string(), playerId: z.string(), categoryIndex: z.number().int().min(0).max(CATEGORIES.length - 1), valid: z.boolean() }).safeParse(req.body); if (!parsed.success || parsed.data.categoryIndex !== room.voteCategoryIndex) return res.status(400).json({ error: "Voto inválido." });
    const key = `${parsed.data.playerId}:${parsed.data.categoryIndex}`; room.votes[key] ||= {}; room.votes[key][parsed.data.voterId] = parsed.data.valid; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/finish", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || refreshRoom(room).status !== "voting" || !room.votingComplete) return res.status(409).json({ error: "Conclua todas as categorias antes de ver o resultado." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode encerrar." });
    room.players.forEach(player => { player.score = player.answers.reduce((total, answer, index) => { if (answer.status !== "answered") return total; const key = `${player.uid}:${index}`; const votes = Object.values(room.votes[key] || {}); const valid = votes.length ? votes.filter(Boolean).length >= Math.ceil(votes.length / 2) : room.prevalidation[key]; if (!valid) return total; const duplicated = room.players.some(other => other.uid !== player.uid && other.answers[index].value.trim().toLocaleLowerCase("pt-BR") === answer.value.trim().toLocaleLowerCase("pt-BR")); return total + (duplicated ? 5 : 10); }, 0); });
    room.status = "results"; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/lobby", (req, res) => { const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." }); if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode voltar ao lobby." }); room.status = "waiting"; room.letter = ""; room.revealAt = null; room.endAt = null; room.stopBy = null; room.stopAt = null; room.voteEndsAt = null; room.votingComplete = false; res.json(publicRoom(room)); });
  app.post("/api/stop/rooms/:code/leave", (req, res) => { const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.json({ ok: true }); room.players = room.players.filter(player => player.uid !== req.body?.playerId); if (!room.players.length) rooms.delete(room.code); else if (room.hostId === req.body?.playerId) room.hostId = room.players[0].uid; res.json({ ok: true }); });
}
