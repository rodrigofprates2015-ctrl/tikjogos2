import type { Express } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";

const CATEGORIES = ["Nome", "Animal", "Comida", "Cidade ou país", "Filme ou série", "Profissão", "Objeto", "Marca"];
const LETTERS = "ABCDEFGHIJKLMNOPRSTUVZ".split("");

type AnswerStatus = "pending" | "skipped" | "answered" | "noAnswer";
type StopAnswer = { category: string; value: string; status: AnswerStatus };
type StopPlayer = { uid: string; name: string; connected: boolean; characterIndex: number; answers: StopAnswer[]; currentIndex: number; finished: boolean; score: number };
type StopRoom = { code: string; hostId: string; status: "waiting" | "playing" | "voting" | "results"; letter: string; players: StopPlayer[]; votes: Record<string, Record<string, boolean>>; createdAt: number };
const rooms = new Map<string, StopRoom>();

function code() { let value = ""; do value = randomBytes(2).toString("hex").slice(0, 3).toUpperCase(); while (rooms.has(value)); return value; }
function blankAnswers(): StopAnswer[] { return CATEGORIES.map(category => ({ category, value: "", status: "pending" })); }
function publicRoom(room: StopRoom) { return { ...room, serverNow: Date.now() }; }
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
    const room: StopRoom = { code: roomCode, hostId: parsed.data.playerId, status: "waiting", letter: "", players: [{ uid: parsed.data.playerId, name: parsed.data.nickname, connected: true, characterIndex: 0, answers: blankAnswers(), currentIndex: 0, finished: false, score: 0 }], votes: {}, createdAt: Date.now() };
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

  app.post("/api/stop/rooms/:code/start", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode iniciar." });
    if (room.players.length < 2) return res.status(409).json({ error: "Entre com pelo menos 2 jogadores." });
    room.status = "playing"; room.letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]; room.votes = {};
    room.players.forEach(player => { player.answers = blankAnswers(); player.currentIndex = 0; player.finished = false; player.score = 0; }); res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/answer", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || room.status !== "playing") return res.status(409).json({ error: "Rodada indisponível." });
    const parsed = z.object({ playerId: z.string(), action: z.enum(["answer", "skip", "noAnswer"]), value: z.string().max(40).optional() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: "Resposta inválida." });
    const player = room.players.find(item => item.uid === parsed.data.playerId); if (!player) return res.status(404).json({ error: "Jogador não encontrado." });
    const answer = player.answers[player.currentIndex];
    if (parsed.data.action === "answer") { const value = (parsed.data.value || "").trim(); if (!value || initial(value) !== room.letter) return res.status(400).json({ error: `A resposta deve começar com ${room.letter}.` }); answer.value = value; answer.status = "answered"; }
    if (parsed.data.action === "skip") answer.status = "skipped";
    if (parsed.data.action === "noAnswer") { if (answer.status !== "skipped") return res.status(409).json({ error: "Pule a categoria antes de marcá-la sem resposta." }); answer.status = "noAnswer"; answer.value = ""; }
    player.currentIndex = nextIndex(player.answers, player.currentIndex); player.finished = player.answers.every(item => item.status === "answered" || item.status === "noAnswer"); res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/stop", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || room.status !== "playing") return res.status(409).json({ error: "Rodada indisponível." });
    const player = room.players.find(item => item.uid === req.body?.playerId); if (!player?.finished) return res.status(409).json({ error: "Conclua ou justifique todas as categorias antes de dar STOP." });
    room.status = "voting"; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/vote", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || room.status !== "voting") return res.status(409).json({ error: "Votação indisponível." });
    const parsed = z.object({ voterId: z.string(), playerId: z.string(), categoryIndex: z.number().int().min(0).max(CATEGORIES.length - 1), valid: z.boolean() }).safeParse(req.body); if (!parsed.success || parsed.data.voterId === parsed.data.playerId) return res.status(400).json({ error: "Voto inválido." });
    const key = `${parsed.data.playerId}:${parsed.data.categoryIndex}`; room.votes[key] ||= {}; room.votes[key][parsed.data.voterId] = parsed.data.valid; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/finish", (req, res) => {
    const room = rooms.get(req.params.code.toUpperCase()); if (!room || room.status !== "voting") return res.status(409).json({ error: "Votação indisponível." });
    if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode encerrar." });
    const reviewable = room.players.flatMap(player => player.answers.map((answer, index) => ({ player, answer, index }))).filter(item => item.answer.status === "answered" || item.answer.status === "noAnswer");
    const missingVote = reviewable.some(item => room.players.some(voter => voter.uid !== item.player.uid) && Object.keys(room.votes[`${item.player.uid}:${item.index}`] || {}).length === 0);
    if (missingVote) return res.status(409).json({ error: "Ainda existem respostas sem nenhum voto da mesa." });
    room.players.forEach(player => { player.score = player.answers.reduce((total, answer, index) => { if (answer.status !== "answered") return total; const votes = Object.values(room.votes[`${player.uid}:${index}`] || {}); const valid = votes.length === 0 || votes.filter(Boolean).length >= Math.ceil(votes.length / 2); if (!valid) return total; const duplicated = room.players.some(other => other.uid !== player.uid && other.answers[index].value.trim().toLocaleLowerCase("pt-BR") === answer.value.trim().toLocaleLowerCase("pt-BR")); return total + (duplicated ? 5 : 10); }, 0); });
    room.status = "results"; res.json(publicRoom(room));
  });

  app.post("/api/stop/rooms/:code/lobby", (req, res) => { const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.status(404).json({ error: "Sala não encontrada." }); if (req.body?.playerId !== room.hostId) return res.status(403).json({ error: "Apenas o capitão pode voltar ao lobby." }); room.status = "waiting"; room.letter = ""; res.json(publicRoom(room)); });
  app.post("/api/stop/rooms/:code/leave", (req, res) => { const room = rooms.get(req.params.code.toUpperCase()); if (!room) return res.json({ ok: true }); room.players = room.players.filter(player => player.uid !== req.body?.playerId); if (!room.players.length) rooms.delete(room.code); else if (room.hostId === req.body?.playerId) room.hostId = room.players[0].uid; res.json({ ok: true }); });
}
