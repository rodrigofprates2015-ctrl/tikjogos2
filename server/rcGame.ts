/**
 * Server-side logic for "Respostas em Comum" game.
 * Manages rooms, WebSocket connections, answer normalization, and scoring.
 */
import { WebSocketServer, WebSocket } from 'ws';
import type { Express } from 'express';
import type { Server } from 'http';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// ── Types ──────────────────────────────────────────────────────────────

interface RCPlayer {
  uid: string;
  name: string;
  score: number;
  connected: boolean;
}

interface RCRoom {
  code: string;
  hostId: string;
  players: RCPlayer[];
  // Game state
  phase: 'waiting' | 'playing';
  config: { mode: string; rounds: number; timePerRound: number; category?: string };
  currentRound: number;
  questions: { id: number; text: string; category: string }[];
  answers: Map<string, string>; // playerId -> answer
  scores: Record<string, number>; // playerId -> total score
  roundTimer: ReturnType<typeof setTimeout> | null;
}

// ── In-memory storage ──────────────────────────────────────────────────

const rcRooms = new Map<string, RCRoom>();
const rcRoomConnections = new Map<string, Set<WebSocket>>();
const rcPlayerConnections = new Map<WebSocket, { roomCode: string; playerId: string }>();

// Track total rooms created (persists in memory for the lifetime of the server)
let rcTotalRoomsCreated = 0;

/** Get Sincronia room stats for the admin dashboard */
export function getRCRoomStats() {
  const allRooms = Array.from(rcRooms.values());
  const activeRooms = allRooms.filter(r => r.players.some(p => p.connected));
  const playingRooms = allRooms.filter(r => r.phase === 'playing');
  const waitingRooms = allRooms.filter(r => r.phase === 'waiting');
  const totalPlayers = allRooms.reduce((sum, r) => sum + r.players.filter(p => p.connected).length, 0);

  return {
    totalRoomsCreated: rcTotalRoomsCreated,
    activeRooms: activeRooms.length,
    playingRooms: playingRooms.length,
    waitingRooms: waitingRooms.length,
    totalConnectedPlayers: totalPlayers,
    rooms: allRooms.map(r => ({
      code: r.code,
      hostId: r.hostId,
      phase: r.phase,
      playerCount: r.players.length,
      connectedPlayers: r.players.filter(p => p.connected).length,
      category: r.config.category || 'todas',
      currentRound: r.currentRound,
      totalRounds: r.config.rounds,
    })),
  };
}

// ── Questions (duplicated server-side to avoid client import issues) ──

const RC_QUESTIONS = [
  // Brasil
  { id: 1, text: 'Onde todo brasileiro já foi?', category: 'brasil' },
  { id: 2, text: 'Uma comida que todo brasileiro já comeu?', category: 'brasil' },
  { id: 3, text: 'Um programa de TV que todo mundo já assistiu?', category: 'brasil' },
  { id: 4, text: 'Um time de futebol famoso no Brasil?', category: 'brasil' },
  { id: 5, text: 'Um cantor brasileiro muito conhecido?', category: 'brasil' },
  { id: 6, text: 'Um feriado brasileiro importante?', category: 'brasil' },
  { id: 7, text: 'Um meme brasileiro famoso?', category: 'brasil' },
  { id: 8, text: 'Uma marca brasileira famosa?', category: 'brasil' },
  { id: 9, text: 'Um lugar turístico do Brasil?', category: 'brasil' },
  { id: 10, text: 'Uma novela famosa?', category: 'brasil' },
  // Escola
  { id: 11, text: 'Algo que tem em toda escola?', category: 'escola' },
  { id: 12, text: 'Uma matéria escolar difícil?', category: 'escola' },
  { id: 13, text: 'Uma desculpa para não fazer lição?', category: 'escola' },
  { id: 14, text: 'Algo que os alunos fazem escondido?', category: 'escola' },
  { id: 15, text: 'Um motivo para levar advertência?', category: 'escola' },
  { id: 16, text: 'Um material escolar essencial?', category: 'escola' },
  { id: 17, text: 'Algo que sempre acontece na sala de aula?', category: 'escola' },
  { id: 18, text: 'Uma profissão que começa com faculdade?', category: 'escola' },
  { id: 19, text: 'Algo que tem na mochila?', category: 'escola' },
  { id: 20, text: 'Uma palavra que todo professor fala?', category: 'escola' },
  // Comida
  { id: 21, text: 'Algo que você coloca no pão?', category: 'comida' },
  { id: 22, text: 'Uma comida que engorda?', category: 'comida' },
  { id: 23, text: 'Algo que vai na pizza?', category: 'comida' },
  { id: 24, text: 'Um sabor de sorvete popular?', category: 'comida' },
  { id: 25, text: 'Uma comida que tem em festa?', category: 'comida' },
  { id: 26, text: 'Algo que você come no café da manhã?', category: 'comida' },
  { id: 27, text: 'Um refrigerante famoso?', category: 'comida' },
  { id: 28, text: 'Uma comida de domingo?', category: 'comida' },
  { id: 29, text: 'Algo que tem no churrasco?', category: 'comida' },
  { id: 30, text: 'Um doce popular?', category: 'comida' },
  // Geral
  { id: 31, text: 'Algo que todo mundo usa todos os dias?', category: 'geral' },
  { id: 32, text: 'Um aplicativo famoso?', category: 'geral' },
  { id: 33, text: 'Algo que você leva para a praia?', category: 'geral' },
  { id: 34, text: 'Um motivo para acordar cedo?', category: 'geral' },
  { id: 35, text: 'Algo que você faz antes de dormir?', category: 'geral' },
  { id: 36, text: 'Um medo comum?', category: 'geral' },
  { id: 37, text: 'Algo que sempre acaba rápido?', category: 'geral' },
  { id: 38, text: 'Uma desculpa para chegar atrasado?', category: 'geral' },
  { id: 39, text: 'Algo que quebra fácil?', category: 'geral' },
  { id: 40, text: 'Uma coisa que todo mundo já perdeu?', category: 'geral' },
  // Engraçadas
  { id: 41, text: 'Algo que você faz quando está entediado?', category: 'engracadas' },
  { id: 42, text: 'Um motivo para brigar?', category: 'engracadas' },
  { id: 43, text: 'Algo que você fala quando está bravo?', category: 'engracadas' },
  { id: 44, text: 'Uma coisa que todo mundo já mentiu?', category: 'engracadas' },
  { id: 45, text: 'Algo que faz barulho?', category: 'engracadas' },
  { id: 46, text: 'Um superpoder que todo mundo queria ter?', category: 'engracadas' },
  { id: 47, text: 'Algo que você nunca emprestaria?', category: 'engracadas' },
  { id: 48, text: 'Uma coisa que sempre some na sua casa?', category: 'engracadas' },
  { id: 49, text: 'Algo que vicia?', category: 'engracadas' },
  { id: 50, text: 'Uma coisa que todo mundo já pesquisou no Google?', category: 'engracadas' },
  // Animes
  { id: 51, text: 'Qual seria seu Pokémon inicial?', category: 'animes' },
  { id: 52, text: 'Qual personagem você NÃO gostaria de ter como inimigo?', category: 'animes' },
  { id: 53, text: 'Qual personagem você chamaria pra resolver um problema seu?', category: 'animes' },
  { id: 54, text: 'Em qual universo de anime você sobreviveria mais tempo?', category: 'animes' },
  { id: 55, text: 'Qual personagem seria o pior professor?', category: 'animes' },
  { id: 56, text: 'Qual personagem daria o melhor conselho amoroso?', category: 'animes' },
  { id: 57, text: 'Qual personagem você escolheria como guarda-costas?', category: 'animes' },
  { id: 58, text: 'Qual personagem você levaria pra uma festa?', category: 'animes' },
  { id: 59, text: 'Qual personagem seria o mais cancelado na internet?', category: 'animes' },
  { id: 60, text: 'Qual personagem você teria medo de encontrar à noite?', category: 'animes' },
  { id: 61, text: 'Qual personagem seria o pior motorista?', category: 'animes' },
  { id: 62, text: 'Qual personagem seria ótimo como presidente?', category: 'animes' },
  { id: 63, text: 'Qual poder você usaria pra trapacear na escola?', category: 'animes' },
  { id: 64, text: 'Qual personagem gastaria todo o salário no primeiro dia?', category: 'animes' },
  { id: 65, text: 'Qual personagem seria influencer?', category: 'animes' },
  { id: 66, text: 'Qual personagem seria o mais fofoqueiro?', category: 'animes' },
  { id: 67, text: 'Qual personagem provavelmente chegaria atrasado?', category: 'animes' },
  { id: 68, text: 'Qual personagem seria o mais competitivo?', category: 'animes' },
  { id: 69, text: 'Qual personagem ganharia um reality show?', category: 'animes' },
  { id: 70, text: 'Qual personagem seria o pior colega de quarto?', category: 'animes' },
  { id: 71, text: 'Qual personagem você escolheria pra montar um time no apocalipse?', category: 'animes' },
  { id: 72, text: 'Qual personagem seria o mais dramático?', category: 'animes' },
  { id: 73, text: 'Qual personagem você pediria ajuda numa prova?', category: 'animes' },
  { id: 74, text: 'Qual personagem teria o pior gosto musical?', category: 'animes' },
  { id: 75, text: 'Qual personagem seria o mais vingativo?', category: 'animes' },
  { id: 76, text: 'Qual personagem seria expulso da escola?', category: 'animes' },
  { id: 77, text: 'Qual personagem você escolheria pra trocar de vida por um dia?', category: 'animes' },
  { id: 78, text: 'Qual personagem seria o mais irresponsável?', category: 'animes' },
  { id: 79, text: 'Qual personagem sobreviveria numa ilha deserta?', category: 'animes' },
  { id: 80, text: 'Qual personagem você NÃO confiaria seu segredo?', category: 'animes' },
  // Jogos
  { id: 81, text: 'Qual jogo você apagaria da memória para jogar pela primeira vez de novo?', category: 'jogos' },
  { id: 82, text: 'Qual personagem de jogo seria o pior chefe?', category: 'jogos' },
  { id: 83, text: 'Qual jogo mais destrói amizades?', category: 'jogos' },
  { id: 84, text: 'Qual jogo você jogaria preso numa ilha deserta?', category: 'jogos' },
  { id: 85, text: 'Qual personagem você NÃO queria enfrentar na vida real?', category: 'jogos' },
  { id: 86, text: 'Qual jogo você já passou mais raiva jogando?', category: 'jogos' },
  { id: 87, text: 'Qual jogo você já mentiu dizendo que era bom?', category: 'jogos' },
  { id: 88, text: 'Qual jogo é mais difícil do que parece?', category: 'jogos' },
  { id: 89, text: 'Qual personagem seria o pior motorista?', category: 'jogos' },
  { id: 90, text: 'Qual jogo você abandonou na metade?', category: 'jogos' },
  { id: 91, text: 'Qual jogo você mais fingiu que estava estudando enquanto jogava?', category: 'jogos' },
  { id: 92, text: 'Qual personagem seria o mais apelão no 1x1?', category: 'jogos' },
  { id: 93, text: 'Qual jogo você jogaria com seus pais?', category: 'jogos' },
  { id: 94, text: 'Qual jogo teria o pior lugar para morar?', category: 'jogos' },
  { id: 95, text: 'Qual personagem gastaria tudo em skin?', category: 'jogos' },
  { id: 96, text: 'Qual jogo mais vicia?', category: 'jogos' },
  { id: 97, text: 'Qual personagem seria expulso da escola?', category: 'jogos' },
  { id: 98, text: 'Qual jogo você escolheria para um campeonato valendo 1 milhão?', category: 'jogos' },
  { id: 99, text: 'Qual personagem seria o mais competitivo?', category: 'jogos' },
  { id: 100, text: 'Qual jogo tem a comunidade mais tóxica?', category: 'jogos' },
  { id: 101, text: 'Qual personagem você escolheria para sobreviver num apocalipse?', category: 'jogos' },
  { id: 102, text: 'Qual jogo tem a trilha sonora mais marcante?', category: 'jogos' },
  { id: 103, text: 'Qual personagem seria o pior colega de equipe?', category: 'jogos' },
  { id: 104, text: 'Qual jogo você mais zerou?', category: 'jogos' },
  { id: 105, text: 'Qual personagem seria influencer gamer?', category: 'jogos' },
  { id: 106, text: 'Qual jogo você já começou mais de 3 vezes e nunca terminou?', category: 'jogos' },
  { id: 107, text: 'Qual personagem seria o mais trapaceiro?', category: 'jogos' },
  { id: 108, text: 'Qual jogo você defenderia mesmo sabendo que tem defeitos?', category: 'jogos' },
  { id: 109, text: 'Qual personagem seria o mais medroso?', category: 'jogos' },
  { id: 110, text: 'Qual jogo você jogaria pelo resto da vida se só pudesse escolher um?', category: 'jogos' },
  // Marvel
  { id: 111, text: 'Qual herói você chamaria para te ajudar numa mudança de casa?', category: 'marvel' },
  { id: 112, text: 'Qual personagem seria o pior chefe?', category: 'marvel' },
  { id: 113, text: 'Qual herói provavelmente chegaria atrasado?', category: 'marvel' },
  { id: 114, text: 'Qual personagem gastaria todo o salário em um dia?', category: 'marvel' },
  { id: 115, text: 'Qual herói você escolheria para te defender numa discussão?', category: 'marvel' },
  { id: 116, text: 'Qual vilão seria o pior colega de quarto?', category: 'marvel' },
  { id: 117, text: 'Qual herói seria o mais cancelado nas redes sociais?', category: 'marvel' },
  { id: 118, text: 'Qual personagem seria o melhor amigo conselheiro?', category: 'marvel' },
  { id: 119, text: 'Qual herói você levaria para uma festa?', category: 'marvel' },
  { id: 120, text: 'Qual personagem você NÃO confiaria seu segredo?', category: 'marvel' },
  { id: 121, text: 'Qual herói seria o melhor professor?', category: 'marvel' },
  { id: 122, text: 'Qual vilão provavelmente abriria um podcast?', category: 'marvel' },
  { id: 123, text: 'Qual personagem seria o mais dramático?', category: 'marvel' },
  { id: 124, text: 'Qual herói seria o pior motorista?', category: 'marvel' },
  { id: 125, text: 'Qual personagem seria expulso da escola?', category: 'marvel' },
  { id: 126, text: 'Qual herói seria o melhor presidente?', category: 'marvel' },
  { id: 127, text: 'Qual vilão você chamaria para resolver um problema difícil?', category: 'marvel' },
  { id: 128, text: 'Qual herói sobreviveria melhor num reality show?', category: 'marvel' },
  { id: 129, text: 'Qual personagem seria o mais competitivo?', category: 'marvel' },
  { id: 130, text: 'Qual herói você escolheria para sobreviver num apocalipse?', category: 'marvel' },
  { id: 131, text: 'Qual personagem teria o pior gosto musical?', category: 'marvel' },
  { id: 132, text: 'Qual herói seria o mais irresponsável?', category: 'marvel' },
  { id: 133, text: 'Qual vilão provavelmente viraria influencer?', category: 'marvel' },
  { id: 134, text: 'Qual herói seria o mais vingativo?', category: 'marvel' },
  { id: 135, text: 'Qual personagem seria o mais fofoqueiro?', category: 'marvel' },
  { id: 136, text: 'Qual herói você escolheria para montar um time de futebol?', category: 'marvel' },
  { id: 137, text: 'Qual vilão teria mais chance de virar herói?', category: 'marvel' },
  { id: 138, text: 'Qual herói teria mais dificuldade em ter uma vida normal?', category: 'marvel' },
  { id: 139, text: 'Qual personagem seria o pior em guardar segredo?', category: 'marvel' },
  { id: 140, text: 'Qual herói você escolheria para trocar de vida por um dia?', category: 'marvel' },
  // Desenho Animado
  { id: 141, text: 'Personagem mais medroso dos desenhos', category: 'desenho_animado' },
  { id: 142, text: 'Personagem mais bonito dos desenhos', category: 'desenho_animado' },
  { id: 143, text: 'Personagem mais irritante dos desenhos', category: 'desenho_animado' },
  { id: 144, text: 'Personagem mais inteligente dos desenhos', category: 'desenho_animado' },
  { id: 145, text: 'Personagem mais preguiçoso dos desenhos', category: 'desenho_animado' },
  { id: 146, text: 'Personagem mais engraçado dos desenhos', category: 'desenho_animado' },
  { id: 147, text: 'Personagem mais forte dos desenhos', category: 'desenho_animado' },
  { id: 148, text: 'Personagem mais fofo dos desenhos', category: 'desenho_animado' },
  { id: 149, text: 'Personagem mais chato dos desenhos', category: 'desenho_animado' },
  { id: 150, text: 'Personagem mais dramático dos desenhos', category: 'desenho_animado' },
  { id: 151, text: 'Personagem mais corajoso dos desenhos', category: 'desenho_animado' },
  { id: 152, text: 'Personagem mais mentiroso dos desenhos', category: 'desenho_animado' },
  { id: 153, text: 'Personagem mais atrapalhado dos desenhos', category: 'desenho_animado' },
  { id: 154, text: 'Personagem mais vingativo dos desenhos', category: 'desenho_animado' },
  { id: 155, text: 'Personagem mais competitivo dos desenhos', category: 'desenho_animado' },
  { id: 156, text: 'Personagem mais estiloso dos desenhos', category: 'desenho_animado' },
  { id: 157, text: 'Personagem mais mimado dos desenhos', category: 'desenho_animado' },
  { id: 158, text: 'Personagem mais azarado dos desenhos', category: 'desenho_animado' },
  { id: 159, text: 'Personagem mais esperto dos desenhos', category: 'desenho_animado' },
  { id: 160, text: 'Personagem mais teimoso dos desenhos', category: 'desenho_animado' },
  { id: 161, text: 'Personagem mais manipulador dos desenhos', category: 'desenho_animado' },
  { id: 162, text: 'Personagem mais impulsivo dos desenhos', category: 'desenho_animado' },
  { id: 163, text: 'Personagem mais leal dos desenhos', category: 'desenho_animado' },
  { id: 164, text: 'Personagem mais bagunceiro dos desenhos', category: 'desenho_animado' },
  { id: 165, text: 'Personagem mais medonho dos desenhos', category: 'desenho_animado' },
  { id: 166, text: 'Personagem mais icônico dos desenhos', category: 'desenho_animado' },
  { id: 167, text: 'Personagem que mais passa vergonha nos desenhos', category: 'desenho_animado' },
  { id: 168, text: 'Personagem mais heróico dos desenhos', category: 'desenho_animado' },
  { id: 169, text: 'Personagem mais invejoso dos desenhos', category: 'desenho_animado' },
  { id: 170, text: 'Personagem mais dramático em relacionamento nos desenhos', category: 'desenho_animado' },
];

// ── Helpers ────────────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(3);
  for (let i = 0; i < 3; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/** Normalize an answer for comparison: lowercase, remove accents, punctuation, extra spaces */
function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')    // remove punctuation
    .replace(/\s+/g, ' ')           // collapse spaces
    .trim();
}

function pickQuestions(count: number, category?: string) {
  const pool = category
    ? RC_QUESTIONS.filter(q => q.category === category)
    : [...RC_QUESTIONS];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function broadcastToRCRoom(roomCode: string, message: object) {
  const connections = rcRoomConnections.get(roomCode);
  if (!connections) return;
  const payload = JSON.stringify(message);
  Array.from(connections).forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

function sendRoomUpdate(room: RCRoom) {
  broadcastToRCRoom(room.code, {
    type: 'rc-room-update',
    code: room.code,
    hostId: room.hostId,
    players: room.players,
  });
}

/** Process answers for the current round and compute scores */
function processRoundAnswers(room: RCRoom) {
  const question = room.questions[room.currentRound - 1];
  if (!question) return;

  // Group answers by normalized form
  const groups = new Map<string, { original: string[]; players: { uid: string; name: string }[] }>();
  const noAnswer: { uid: string; name: string }[] = [];

  for (const player of room.players) {
    if (!player.connected) continue;
    const raw = room.answers.get(player.uid);
    if (!raw || raw.trim() === '') {
      noAnswer.push({ uid: player.uid, name: player.name });
      continue;
    }
    const norm = normalizeAnswer(raw);
    if (!norm) {
      noAnswer.push({ uid: player.uid, name: player.name });
      continue;
    }
    if (!groups.has(norm)) {
      groups.set(norm, { original: [], players: [] });
    }
    const g = groups.get(norm)!;
    g.original.push(raw);
    g.players.push({ uid: player.uid, name: player.name });
  }

  // Compute points: 2+ players = +1 each, solo = 0
  const resultGroups: Array<{ normalized: string; original: string[]; players: { uid: string; name: string }[]; points: number }> = [];
  Array.from(groups.entries()).forEach(([norm, g]) => {
    const points = g.players.length >= 2 ? 1 : 0;
    if (points > 0) {
      g.players.forEach(p => {
        room.scores[p.uid] = (room.scores[p.uid] || 0) + points;
      });
    }
    resultGroups.push({
      normalized: norm,
      original: g.original,
      players: g.players,
      points,
    });
  });

  // Sort: most players first
  resultGroups.sort((a, b) => b.players.length - a.players.length);

  return {
    questionText: question.text,
    groups: resultGroups,
    noAnswer,
  };
}

// ── Setup ──────────────────────────────────────────────────────────────

export function setupRCGame(httpServer: Server, app: Express) {
  const wss = new WebSocketServer({ noServer: true });

  // HTTP upgrade for /rc-ws
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/rc-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // ── REST API ───────────────────────────────────────────────────────

  app.post('/api/rc/rooms/create', (req, res) => {
    try {
      const { hostId, hostName } = z.object({
        hostId: z.string(),
        hostName: z.string(),
      }).parse(req.body);

      const code = generateRoomCode();
      const room: RCRoom = {
        code,
        hostId,
        players: [{ uid: hostId, name: hostName, score: 0, connected: true }],
        phase: 'waiting',
        config: { mode: 'classico', rounds: 10, timePerRound: 30 },
        currentRound: 0,
        questions: [],
        answers: new Map(),
        scores: {},
        roundTimer: null,
      };
      rcRooms.set(code, room);
      rcTotalRoomsCreated++;
      console.log(`[RC] Room created: ${code} by ${hostName}`);
      res.json({ code, hostId, players: room.players });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create room' });
    }
  });

  app.post('/api/rc/rooms/join', (req, res) => {
    try {
      const { code, playerId, playerName } = z.object({
        code: z.string(),
        playerId: z.string(),
        playerName: z.string(),
      }).parse(req.body);

      const roomCode = code.toUpperCase();
      const room = rcRooms.get(roomCode);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.players.length >= 10) return res.status(400).json({ error: 'Room is full' });

      // Check if player already exists (reconnecting)
      const existing = room.players.find(p => p.uid === playerId);
      if (existing) {
        existing.connected = true;
        existing.name = playerName;
      } else {
        if (room.phase === 'playing') {
          return res.status(400).json({ error: 'Game in progress' });
        }
        room.players.push({ uid: playerId, name: playerName, score: 0, connected: true });
        // Notify existing players
        broadcastToRCRoom(roomCode, {
          type: 'rc-player-joined',
          playerName,
        });
      }

      sendRoomUpdate(room);
      console.log(`[RC] ${playerName} joined room ${roomCode}`);
      res.json({ code: room.code, hostId: room.hostId, players: room.players });
    } catch (error) {
      res.status(400).json({ error: 'Failed to join room' });
    }
  });

  // ── Heartbeat & disconnect configuration (mirrors Impostor game) ──

  const HEARTBEAT_INTERVAL = 5000;       // 5s — ping clients
  const PONG_TIMEOUT = 15000;            // 15s — mark as disconnected
  const HARD_EXIT_GRACE = 15000;         // 15s — remove player after disconnect
  const EMPTY_ROOM_CLEANUP_DELAY = 10000; // 10s — delete empty rooms

  const hardExitTimers = new Map<string, NodeJS.Timeout>();
  const emptyRoomTimers = new Map<string, NodeJS.Timeout>();

  // Extend player connection info with lastPong
  const rcPlayerInfo = new Map<WebSocket, { roomCode: string; playerId: string; lastPong: number }>();

  // ── Helper: mark player disconnected (keep in room) ──
  function markPlayerDisconnected(ws: WebSocket, roomCode: string, playerId: string) {
    console.log(`[RC] Marking ${playerId} as disconnected in ${roomCode}`);
    const connections = rcRoomConnections.get(roomCode);
    if (connections) connections.delete(ws);
    rcPlayerConnections.delete(ws);
    rcPlayerInfo.delete(ws);

    const room = rcRooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.uid === playerId);
    if (player) player.connected = false;

    broadcastToRCRoom(roomCode, { type: 'rc-player-disconnected', playerId, playerName: player?.name });
    sendRoomUpdate(room);
  }

  // ── Helper: mark player connected (on reconnect) ──
  function markPlayerConnected(roomCode: string, playerId: string) {
    cancelHardExitRemoval(roomCode, playerId);
    cancelEmptyRoomDeletion(roomCode);

    const room = rcRooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.uid === playerId);
    if (player) player.connected = true;

    broadcastToRCRoom(roomCode, { type: 'rc-player-reconnected', playerId, playerName: player?.name });
    sendRoomUpdate(room);
    return room;
  }

  // ── Helper: remove player (hard exit) with host transfer ──
  function handlePlayerHardExit(roomCode: string, playerId: string, reason: string = 'hard_exit') {
    const timerKey = `${roomCode}:${playerId}`;
    const existing = hardExitTimers.get(timerKey);
    if (existing) { clearTimeout(existing); hardExitTimers.delete(timerKey); }

    console.log(`[RC Hard Exit] Removing ${playerId} from ${roomCode} (${reason})`);
    const room = rcRooms.get(roomCode);
    if (!room) return;

    const playerToRemove = room.players.find(p => p.uid === playerId);
    if (!playerToRemove) return;

    const wasHost = room.hostId === playerId;
    room.players = room.players.filter(p => p.uid !== playerId);

    // Host transfer
    if (wasHost && room.players.length > 0) {
      const connected = room.players.filter(p => p.connected);
      const newHost = connected.length > 0 ? connected[0] : room.players[0];
      room.hostId = newHost.uid;
      broadcastToRCRoom(roomCode, { type: 'rc-host-changed', newHostName: newHost.name });
      console.log(`[RC] Host transferred to ${newHost.name}`);
    }

    broadcastToRCRoom(roomCode, { type: 'rc-player-left', playerName: playerToRemove.name });

    if (room.players.length === 0) {
      if (room.roundTimer) clearTimeout(room.roundTimer);
      rcRooms.delete(roomCode);
      rcRoomConnections.delete(roomCode);
      console.log(`[RC] Empty room ${roomCode} deleted`);
    } else {
      sendRoomUpdate(room);
    }
  }

  function scheduleHardExitRemoval(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    const existing = hardExitTimers.get(timerKey);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      hardExitTimers.delete(timerKey);
      handlePlayerHardExit(roomCode, playerId, 'grace_expired');
    }, HARD_EXIT_GRACE);
    hardExitTimers.set(timerKey, timer);
  }

  function cancelHardExitRemoval(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    const existing = hardExitTimers.get(timerKey);
    if (existing) { clearTimeout(existing); hardExitTimers.delete(timerKey); }
  }

  function scheduleEmptyRoomDeletion(roomCode: string) {
    const existing = emptyRoomTimers.get(roomCode);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      emptyRoomTimers.delete(roomCode);
      const room = rcRooms.get(roomCode);
      if (room && room.players.length === 0) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        rcRooms.delete(roomCode);
        rcRoomConnections.delete(roomCode);
        console.log(`[RC] Cleaned up empty room ${roomCode}`);
      }
    }, EMPTY_ROOM_CLEANUP_DELAY);
    emptyRoomTimers.set(roomCode, timer);
  }

  function cancelEmptyRoomDeletion(roomCode: string) {
    const existing = emptyRoomTimers.get(roomCode);
    if (existing) { clearTimeout(existing); emptyRoomTimers.delete(roomCode); }
  }

  // ── Disconnect beacon endpoint (reliable on browser close) ──
  app.post('/api/rc/rooms/:code/disconnect-notice', (req, res) => {
    try {
      const { playerId } = z.object({ playerId: z.string() }).parse(req.body);
      const roomCode = req.params.code.toUpperCase();
      const room = rcRooms.get(roomCode);
      if (!room) return res.status(404).json({ error: 'Room not found' });

      // Find and close any existing WS for this player
      rcPlayerInfo.forEach((info, ws) => {
        if (info.playerId === playerId && info.roomCode === roomCode) {
          markPlayerDisconnected(ws, roomCode, playerId);
        }
      });

      // Also check rcPlayerConnections (fallback)
      rcPlayerConnections.forEach((info, ws) => {
        if (info.playerId === playerId && info.roomCode === roomCode) {
          markPlayerDisconnected(ws, roomCode, playerId);
        }
      });

      // Ensure player is marked disconnected even if no WS found
      const player = room.players.find(p => p.uid === playerId);
      if (player && player.connected) {
        player.connected = false;
        broadcastToRCRoom(roomCode, { type: 'rc-player-disconnected', playerId, playerName: player.name });
        sendRoomUpdate(room);
      }

      scheduleHardExitRemoval(roomCode, playerId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to process disconnect notice' });
    }
  });

  // ── WebSocket ──────────────────────────────────────────────────────

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Pong response — update lastPong
        if (data.type === 'pong') {
          const info = rcPlayerInfo.get(ws);
          if (info) info.lastPong = Date.now();
          return;
        }

        // Intentional leave — remove player immediately
        if (data.type === 'rc-leave') {
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (info) {
            handlePlayerHardExit(info.roomCode, info.playerId, 'leave_intentional');
            const connections = rcRoomConnections.get(info.roomCode);
            if (connections) connections.delete(ws);
            rcPlayerConnections.delete(ws);
            rcPlayerInfo.delete(ws);
          }
          return;
        }

        // Disconnect notice (browser closing)
        if (data.type === 'disconnect_notice') {
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (info) {
            markPlayerDisconnected(ws, info.roomCode, info.playerId);
            scheduleHardExitRemoval(info.roomCode, info.playerId);
          }
          return;
        }

        // Sync request — send current game state
        if (data.type === 'sync_request') {
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info) return;
          if (rcPlayerInfo.has(ws)) rcPlayerInfo.get(ws)!.lastPong = Date.now();

          const room = rcRooms.get(info.roomCode);
          if (!room) return;

          // Send room update
          ws.send(JSON.stringify({
            type: 'rc-room-update',
            code: room.code,
            hostId: room.hostId,
            players: room.players,
          }));

          // If game is in progress, send current game state
          if (room.phase === 'playing' && room.currentRound > 0) {
            const question = room.questions[room.currentRound - 1];
            if (question) {
              ws.send(JSON.stringify({
                type: 'rc-sync-state',
                phase: room.phase,
                round: room.currentRound,
                totalRounds: room.config.rounds,
                question: question.text,
                timePerRound: room.config.timePerRound,
                scores: room.scores,
                answeredCount: room.answers.size,
                hasSubmitted: room.answers.has(info.playerId),
              }));
            }
          }
          return;
        }

        // Join room
        if (data.type === 'rc-join' && data.roomCode && data.playerId) {
          const roomCode = data.roomCode as string;
          const playerId = data.playerId as string;

          if (!rcRoomConnections.has(roomCode)) {
            rcRoomConnections.set(roomCode, new Set());
          }
          rcRoomConnections.get(roomCode)!.add(ws);
          rcPlayerConnections.set(ws, { roomCode, playerId });
          rcPlayerInfo.set(ws, { roomCode, playerId, lastPong: Date.now() });

          const room = rcRooms.get(roomCode);
          if (room) {
            const existing = room.players.find(p => p.uid === playerId);
            if (existing) {
              // Reconnecting — restore connection
              console.log(`[RC Reconnect] ${playerId} reconnecting to ${roomCode}`);
              markPlayerConnected(roomCode, playerId);
            } else {
              // New player (shouldn't happen via WS alone, but handle gracefully)
              console.log(`[RC Join] ${playerId} joined ${roomCode} via WS`);
            }

            // Send current room state
            ws.send(JSON.stringify({
              type: 'rc-room-update',
              code: room.code,
              hostId: room.hostId,
              players: room.players,
            }));

            // If game in progress, send game state
            if (room.phase === 'playing' && room.currentRound > 0) {
              const question = room.questions[room.currentRound - 1];
              if (question) {
                ws.send(JSON.stringify({
                  type: 'rc-sync-state',
                  phase: room.phase,
                  round: room.currentRound,
                  totalRounds: room.config.rounds,
                  question: question.text,
                  timePerRound: room.config.timePerRound,
                  scores: room.scores,
                  answeredCount: room.answers.size,
                  hasSubmitted: room.answers.has(playerId),
                }));
              }
            }
          }
        }

        // Start game (host only)
        if (data.type === 'rc-start-game' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;

          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          const config = data.config || room.config;
          room.config = config;
          room.phase = 'playing';
          room.currentRound = 1;
          room.scores = {};
          room.players.forEach(p => { p.score = 0; room.scores[p.uid] = 0; });
          room.questions = pickQuestions(config.rounds, config.category);
          room.answers = new Map();

          const question = room.questions[0];
          broadcastToRCRoom(room.code, {
            type: 'rc-game-start',
            round: 1,
            totalRounds: config.rounds,
            question: question.text,
            timePerRound: config.timePerRound,
          });

          room.roundTimer = setTimeout(() => {
            finishRound(room);
          }, (config.timePerRound + 2) * 1000);
        }

        // Submit answer
        if (data.type === 'rc-submit-answer' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room || room.phase !== 'playing') return;

          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info) return;

          room.answers.set(info.playerId, data.answer || '');

          broadcastToRCRoom(room.code, {
            type: 'rc-answer-count',
            count: room.answers.size,
          });

          const connectedCount = room.players.filter(p => p.connected).length;
          if (room.answers.size >= connectedCount) {
            if (room.roundTimer) clearTimeout(room.roundTimer);
            setTimeout(() => finishRound(room), 500);
          }
        }

        // Next round (host only)
        if (data.type === 'rc-next-round' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          room.currentRound++;
          room.answers = new Map();

          if (room.currentRound > room.questions.length) {
            broadcastToRCRoom(room.code, { type: 'rc-game-over', scores: room.scores });
            room.phase = 'waiting';
            return;
          }

          const question = room.questions[room.currentRound - 1];
          broadcastToRCRoom(room.code, {
            type: 'rc-next-round',
            round: room.currentRound,
            question: question.text,
            timePerRound: room.config.timePerRound,
          });

          room.roundTimer = setTimeout(() => {
            finishRound(room);
          }, (room.config.timePerRound + 2) * 1000);
        }

        // Back to lobby (host only)
        if (data.type === 'rc-back-to-lobby' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          if (room.roundTimer) clearTimeout(room.roundTimer);
          room.phase = 'waiting';
          room.currentRound = 0;
          room.answers = new Map();
          room.scores = {};
          room.players.forEach(p => { p.score = 0; });

          broadcastToRCRoom(room.code, { type: 'rc-back-to-lobby' });
          sendRoomUpdate(room);
        }

        // Kick player (host only)
        if (data.type === 'rc-kick-player' && data.roomCode && data.targetPlayerId) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;
          const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          const targetId = data.targetPlayerId;
          const target = room.players.find(p => p.uid === targetId);
          if (!target) return;

          room.players = room.players.filter(p => p.uid !== targetId);

          const connections = rcRoomConnections.get(room.code);
          if (connections) {
            Array.from(connections).forEach(c => {
              const cInfo = rcPlayerInfo.get(c) || rcPlayerConnections.get(c);
              if (cInfo?.playerId === targetId) {
                c.send(JSON.stringify({ type: 'rc-kicked' }));
                connections.delete(c);
                rcPlayerConnections.delete(c);
                rcPlayerInfo.delete(c);
              }
            });
          }

          sendRoomUpdate(room);
        }
      } catch (e) {
        console.error('[RC WS] Error:', e);
      }
    });

    ws.on('close', () => {
      const info = rcPlayerInfo.get(ws) || rcPlayerConnections.get(ws);
      if (!info) return;

      console.log(`[RC Close] WS closed for ${info.playerId} in ${info.roomCode}`);
      markPlayerDisconnected(ws, info.roomCode, info.playerId);
      scheduleHardExitRemoval(info.roomCode, info.playerId);
    });
  });

  function finishRound(room: RCRoom) {
    if (room.roundTimer) { clearTimeout(room.roundTimer); room.roundTimer = null; }

    const result = processRoundAnswers(room);
    if (!result) return;

    room.players.forEach(p => { p.score = room.scores[p.uid] || 0; });

    broadcastToRCRoom(room.code, {
      type: 'rc-round-result',
      result,
      scores: room.scores,
    });
  }

  // ── Heartbeat: ping clients, detect unresponsive players ──
  setInterval(() => {
    const now = Date.now();

    rcPlayerInfo.forEach(async (info, ws) => {
      if (!info.playerId || !info.roomCode) return;

      const timeSinceLastPong = now - info.lastPong;

      if (timeSinceLastPong > PONG_TIMEOUT) {
        console.log(`[RC Heartbeat] ${info.playerId} unresponsive (${timeSinceLastPong}ms) — marking disconnected`);
        markPlayerDisconnected(ws, info.roomCode, info.playerId);
        scheduleHardExitRemoval(info.roomCode, info.playerId);
      } else if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          // ignore
        }
      }
    });
  }, HEARTBEAT_INTERVAL);
}
