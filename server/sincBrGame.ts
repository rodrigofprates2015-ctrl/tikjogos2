/**
 * Sincronia Battle Royale — continuous public rooms with auto-cycling questions.
 * Reuses normalizeAnswer / processRoundAnswers logic from rcGame.
 */
import { WebSocketServer, WebSocket } from 'ws';
import type { Express } from 'express';
import type { Server } from 'http';

// ── Types ──

interface BRPlayer {
  uid: string;
  name: string;
  score: number;
  connected: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
}

interface BRRoom {
  id: string;
  label: string;
  category: string | undefined; // undefined = all categories
  players: Map<string, BRPlayer>;
  answers: Map<string, string>; // uid -> raw answer
  currentQuestion: { id: number; text: string; category: string } | null;
  questionNumber: number;
  roundTimer: ReturnType<typeof setInterval> | null;
  roundStartedAt: number;
  // Match timer: each match lasts MATCH_DURATION seconds, then scores reset
  matchStartedAt: number;
  matchTimer: ReturnType<typeof setTimeout> | null;
}

type ResultGroup = {
  normalized: string;
  original: string[];
  players: { uid: string; name: string }[];
  points: number;
};

type RoundResult = {
  questionText: string;
  groups: ResultGroup[];
  noAnswer: { uid: string; name: string }[];
};

// ── Questions (same pool as rcGame) ──

const QUESTIONS = [
  { id: 1, text: 'Qual era o desenho favorito da infância?', category: 'classico' },
  { id: 2, text: 'Qual era o melhor desenho de terror antigo?', category: 'classico' },
  { id: 3, text: 'Qual era o desenho mais engraçado da infância?', category: 'classico' },
  { id: 4, text: 'Qual era o desenho que passava de manhã?', category: 'classico' },
  { id: 5, text: 'Qual era o melhor desenho do Cartoon Network?', category: 'classico' },
  { id: 6, text: 'Qual era o melhor desenho do Nickelodeon?', category: 'classico' },
  { id: 7, text: 'Qual era o melhor desenho da Disney?', category: 'classico' },
  { id: 8, text: 'Qual era o melhor anime antigo?', category: 'classico' },
  { id: 9, text: 'Qual era o desenho que todo mundo assistia?', category: 'classico' },
  { id: 10, text: 'Qual era o melhor herói dos desenhos?', category: 'classico' },
  { id: 11, text: 'Qual era o jogo mais famoso do PlayStation 2?', category: 'classico' },
  { id: 12, text: 'Qual era o melhor jogo de celular antigo?', category: 'classico' },
  { id: 13, text: 'Qual era o jogo que todo mundo jogava na escola?', category: 'classico' },
  { id: 14, text: 'Qual era o melhor jogo multiplayer antigo?', category: 'classico' },
  { id: 15, text: 'Qual era o jogo mais difícil?', category: 'classico' },
  { id: 16, text: 'Qual era o jogo que dava mais raiva?', category: 'classico' },
  { id: 17, text: 'Qual era o jogo mais viciante?', category: 'classico' },
  { id: 18, text: 'Qual era o melhor jogo de tiro?', category: 'classico' },
  { id: 19, text: 'Qual era o melhor jogo de corrida?', category: 'classico' },
  { id: 20, text: 'Qual era o jogo que todo mundo conhece?', category: 'classico' },
  { id: 21, text: 'Qual foi a rede social mais marcante?', category: 'classico' },
  { id: 22, text: 'Qual foi o meme mais famoso da internet?', category: 'classico' },
  { id: 23, text: 'Qual foi o melhor vídeo antigo do YouTube?', category: 'classico' },
  { id: 24, text: 'Qual foi o aplicativo mais usado antigamente?', category: 'classico' },
  { id: 25, text: 'Qual era o toque de celular mais famoso?', category: 'classico' },
  { id: 26, text: 'Qual era o melhor site da internet antiga?', category: 'classico' },
  { id: 27, text: 'Qual foi o meme mais famoso do Brasil?', category: 'classico' },
  { id: 28, text: 'Qual foi o melhor canal do YouTube?', category: 'classico' },
  { id: 29, text: 'Qual foi o primeiro celular famoso?', category: 'classico' },
  { id: 30, text: 'Qual era o jogo do Facebook mais famoso?', category: 'classico' },
  { id: 31, text: 'Qual é a comida favorita?', category: 'classico' },
  { id: 32, text: 'Qual é a melhor comida de festa?', category: 'classico' },
  { id: 33, text: 'Qual é o melhor lanche?', category: 'classico' },
  { id: 34, text: 'Qual é a melhor pizza?', category: 'classico' },
  { id: 35, text: 'Qual é o melhor chocolate?', category: 'classico' },
  { id: 36, text: 'Qual é o melhor doce brasileiro?', category: 'classico' },
  { id: 37, text: 'Qual é o melhor refrigerante?', category: 'classico' },
  { id: 38, text: 'Qual é o melhor fast food?', category: 'classico' },
  { id: 39, text: 'Qual é a melhor comida de praia?', category: 'classico' },
  { id: 40, text: 'Qual é a melhor sobremesa?', category: 'classico' },
  { id: 41, text: 'Qual é o melhor hobby?', category: 'classico' },
  { id: 42, text: 'Qual é o melhor lugar para viajar?', category: 'classico' },
  { id: 43, text: 'Qual é o melhor lugar para relaxar?', category: 'classico' },
  { id: 44, text: 'Qual é o melhor lugar para sair com amigos?', category: 'classico' },
  { id: 45, text: 'Qual é a melhor coisa para fazer no domingo?', category: 'classico' },
  { id: 46, text: 'Qual é a melhor coisa para fazer nas férias?', category: 'classico' },
  { id: 47, text: 'Qual é a melhor coisa para fazer quando chove?', category: 'classico' },
  { id: 48, text: 'Qual é a melhor atividade ao ar livre?', category: 'classico' },
  { id: 49, text: 'Qual é a melhor coisa para fazer à noite?', category: 'classico' },
  { id: 50, text: 'Qual é o melhor programa de fim de semana?', category: 'classico' },
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
];

// ── Helpers (same as rcGame) ──

function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickQuestion(category?: string, exclude?: number): { id: number; text: string; category: string } {
  const pool = category ? QUESTIONS.filter(q => q.category === category) : [...QUESTIONS];
  const filtered = exclude != null ? pool.filter(q => q.id !== exclude) : pool;
  const list = filtered.length > 0 ? filtered : pool;
  return list[Math.floor(Math.random() * list.length)];
}

// ── Fixed rooms ──

const ROUND_DURATION = 13; // seconds to answer
const RESULT_DURATION = 5; // seconds to show result
const TOTAL_CYCLE = ROUND_DURATION + RESULT_DURATION; // 18s total cycle
const MATCH_DURATION = 180; // 3 minutes per match
const MATCH_END_DISPLAY = 8; // seconds to show final results before new match
const MAX_PLAYERS = 50;
const HEARTBEAT_INTERVAL = 5000;
const PONG_TIMEOUT = 15000;

const ROOM_DEFS = [
  { id: 'GLOBAL', label: 'Global', category: undefined },
  { id: 'ANIMES', label: 'Animes', category: 'animes' },
  { id: 'JOGOS', label: 'Jogos', category: 'jogos' },
];

const brRooms = new Map<string, BRRoom>();
const brRoomConnections = new Map<string, Set<WebSocket>>();
const brPlayerWs = new Map<WebSocket, { roomId: string; uid: string; lastPong: number }>();

function initRooms() {
  for (const def of ROOM_DEFS) {
    const room: BRRoom = {
      id: def.id,
      label: def.label,
      category: def.category,
      players: new Map(),
      answers: new Map(),
      currentQuestion: null,
      questionNumber: 0,
      roundTimer: null,
      roundStartedAt: 0,
      matchStartedAt: 0,
      matchTimer: null,
    };
    brRooms.set(def.id, room);
    brRoomConnections.set(def.id, new Set());
  }
}

function broadcastToRoom(roomId: string, msg: object) {
  const conns = brRoomConnections.get(roomId);
  if (!conns) return;
  const payload = JSON.stringify(msg);
  Array.from(conns).forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.send(payload); } catch (_) { /* ignore */ }
    }
  });
}

function getLeaderboard(room: BRRoom): Array<{ uid: string; name: string; score: number; rank: number }> {
  const arr = Array.from(room.players.values())
    .filter(p => p.connected)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return arr.map((p, i) => ({ uid: p.uid, name: p.name, score: p.score, rank: i + 1 }));
}

function connectedPlayerCount(room: BRRoom): number {
  return Array.from(room.players.values()).filter(p => p.connected).length;
}

function processAnswers(room: BRRoom): RoundResult | null {
  if (!room.currentQuestion) return null;

  const groups = new Map<string, { original: string[]; players: { uid: string; name: string }[] }>();
  const noAnswer: { uid: string; name: string }[] = [];

  Array.from(room.players.entries()).forEach(([uid, player]) => {
    if (!player.connected) return;
    const raw = room.answers.get(uid);
    if (!raw || raw.trim() === '') { noAnswer.push({ uid, name: player.name }); return; }
    const norm = normalizeAnswer(raw);
    if (!norm) { noAnswer.push({ uid, name: player.name }); return; }
    if (!groups.has(norm)) groups.set(norm, { original: [], players: [] });
    const g = groups.get(norm)!;
    g.original.push(raw);
    g.players.push({ uid, name: player.name });
  });

  const resultGroups: ResultGroup[] = [];
  Array.from(groups.entries()).forEach(([norm, g]) => {
    const points = g.players.length >= 2 ? g.players.length : 0;
    if (points > 0) {
      g.players.forEach(p => {
        const player = room.players.get(p.uid);
        if (player) { player.score += points; player.questionsCorrect++; }
      });
    }
    resultGroups.push({ normalized: norm, original: g.original, players: g.players, points });
  });
  resultGroups.sort((a, b) => b.players.length - a.players.length);

  return { questionText: room.currentQuestion.text, groups: resultGroups, noAnswer };
}

// ── Game loop per room ──

function resetMatchScores(room: BRRoom) {
  room.players.forEach(player => {
    player.score = 0;
    player.questionsAnswered = 0;
    player.questionsCorrect = 0;
  });
  room.questionNumber = 0;
}

function startMatchTimer(room: BRRoom) {
  if (room.matchTimer) { clearTimeout(room.matchTimer); room.matchTimer = null; }
  room.matchStartedAt = Date.now();

  room.matchTimer = setTimeout(() => {
    // Match ended — stop the round loop, broadcast final results, then restart
    stopRoundLoop(room);

    const finalLeaderboard = getLeaderboard(room);
    broadcastToRoom(room.id, {
      type: 'br-match-end',
      leaderboard: finalLeaderboard,
      playerCount: connectedPlayerCount(room),
    });

    // After showing final results, reset scores and start a new match
    setTimeout(() => {
      resetMatchScores(room);
      if (connectedPlayerCount(room) >= 1) {
        startRoomLoop(room);
      }
    }, MATCH_END_DISPLAY * 1000);
  }, MATCH_DURATION * 1000);
}

function startRoomLoop(room: BRRoom) {
  if (room.roundTimer) return; // already running

  // Start the match timer
  startMatchTimer(room);

  function nextRound() {
    const prevId = room.currentQuestion?.id;
    room.currentQuestion = pickQuestion(room.category, prevId);
    room.questionNumber++;
    room.answers = new Map();
    room.roundStartedAt = Date.now();

    // Calculate remaining match time
    const matchElapsed = Math.floor((Date.now() - room.matchStartedAt) / 1000);
    const matchTimeLeft = Math.max(0, MATCH_DURATION - matchElapsed);

    broadcastToRoom(room.id, {
      type: 'br-question',
      question: room.currentQuestion.text,
      questionNumber: room.questionNumber,
      duration: ROUND_DURATION,
      playerCount: connectedPlayerCount(room),
      matchTimeLeft,
    });
  }

  function endRound() {
    const result = processAnswers(room);
    const lb = getLeaderboard(room);

    const matchElapsed = Math.floor((Date.now() - room.matchStartedAt) / 1000);
    const matchTimeLeft = Math.max(0, MATCH_DURATION - matchElapsed);

    broadcastToRoom(room.id, {
      type: 'br-round-result',
      result,
      leaderboard: lb,
      playerCount: connectedPlayerCount(room),
      matchTimeLeft,
    });
  }

  // Cycle: question phase -> result phase -> repeat
  let phase: 'question' | 'result' = 'question';
  nextRound();

  room.roundTimer = setInterval(() => {
    if (phase === 'question') {
      endRound();
      phase = 'result';
      // After RESULT_DURATION, start next question
      setTimeout(() => {
        if (room.roundTimer) { // still active
          nextRound();
          phase = 'question';
        }
      }, RESULT_DURATION * 1000);
    }
  }, TOTAL_CYCLE * 1000);
}

function stopRoundLoop(room: BRRoom) {
  if (room.roundTimer) { clearInterval(room.roundTimer); room.roundTimer = null; }
}

function stopRoomLoop(room: BRRoom) {
  stopRoundLoop(room);
  if (room.matchTimer) { clearTimeout(room.matchTimer); room.matchTimer = null; }
}

// ── Public stats for admin ──

export function getBRRoomStats() {
  const rooms = Array.from(brRooms.values()).map(r => ({
    id: r.id,
    label: r.label,
    playerCount: connectedPlayerCount(r),
    questionNumber: r.questionNumber,
  }));
  return { rooms, totalPlayers: rooms.reduce((s, r) => s + r.playerCount, 0) };
}

// ── Setup ──

export function setupSincBR(httpServer: Server, app: Express) {
  initRooms();

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/br-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // REST: list rooms
  app.get('/api/br/rooms', (_req, res) => {
    const list = Array.from(brRooms.values()).map(r => {
      const matchElapsed = r.matchStartedAt ? Math.floor((Date.now() - r.matchStartedAt) / 1000) : 0;
      return {
        id: r.id,
        label: r.label,
        category: r.category || 'todas',
        playerCount: connectedPlayerCount(r),
        maxPlayers: MAX_PLAYERS,
        questionNumber: r.questionNumber,
        matchTimeLeft: r.matchStartedAt ? Math.max(0, MATCH_DURATION - matchElapsed) : MATCH_DURATION,
      };
    });
    res.json(list);
  });

  // WebSocket
  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'pong') {
          const info = brPlayerWs.get(ws);
          if (info) info.lastPong = Date.now();
          return;
        }

        // Join a room
        if (data.type === 'br-join') {
          const roomId = data.roomId as string;
          const uid = data.uid as string;
          const name = (data.name as string || '').slice(0, 20);
          const room = brRooms.get(roomId);
          if (!room) return;

          // Leave previous room if any
          const prev = brPlayerWs.get(ws);
          if (prev && prev.roomId !== roomId) {
            removePlayerFromRoom(ws, prev.roomId, prev.uid);
          }

          const currentConnected = connectedPlayerCount(room);
          if (currentConnected >= MAX_PLAYERS && !room.players.has(uid)) {
            ws.send(JSON.stringify({ type: 'br-error', message: 'Sala cheia' }));
            return;
          }

          // Add or reconnect
          const existing = room.players.get(uid);
          if (existing) {
            existing.connected = true;
            existing.name = name;
          } else {
            room.players.set(uid, { uid, name, score: 0, connected: true, questionsAnswered: 0, questionsCorrect: 0 });
          }

          brRoomConnections.get(roomId)!.add(ws);
          brPlayerWs.set(ws, { roomId, uid, lastPong: Date.now() });

          // Start loop if first player
          const nowConnected = connectedPlayerCount(room);
          if (nowConnected >= 1 && !room.roundTimer) {
            startRoomLoop(room);
          }

          // Send current state
          const elapsed = room.roundStartedAt ? Math.floor((Date.now() - room.roundStartedAt) / 1000) : 0;
          const timeLeft = Math.max(0, ROUND_DURATION - elapsed);
          const matchElapsed = room.matchStartedAt ? Math.floor((Date.now() - room.matchStartedAt) / 1000) : 0;
          const matchTimeLeft = Math.max(0, MATCH_DURATION - matchElapsed);

          ws.send(JSON.stringify({
            type: 'br-joined',
            roomId: room.id,
            label: room.label,
            question: room.currentQuestion?.text || null,
            questionNumber: room.questionNumber,
            timeLeft,
            duration: ROUND_DURATION,
            matchTimeLeft,
            matchDuration: MATCH_DURATION,
            leaderboard: getLeaderboard(room),
            playerCount: nowConnected,
            myScore: existing?.score || 0,
          }));

          broadcastToRoom(roomId, {
            type: 'br-player-count',
            playerCount: nowConnected,
          });

          console.log(`[BR] ${name} joined ${roomId} (${nowConnected} players)`);
          return;
        }

        // Submit answer
        if (data.type === 'br-submit') {
          const info = brPlayerWs.get(ws);
          if (!info) return;
          const room = brRooms.get(info.roomId);
          if (!room || !room.currentQuestion) return;
          const answer = (data.answer as string || '').slice(0, 100);
          room.answers.set(info.uid, answer);
          const player = room.players.get(info.uid);
          if (player) player.questionsAnswered++;
          return;
        }

        // Leave
        if (data.type === 'br-leave') {
          const info = brPlayerWs.get(ws);
          if (info) removePlayerFromRoom(ws, info.roomId, info.uid);
          return;
        }

        // Disconnect notice (browser closing)
        if (data.type === 'disconnect_notice') {
          const info = brPlayerWs.get(ws);
          if (info) removePlayerFromRoom(ws, info.roomId, info.uid);
          return;
        }
      } catch (e) {
        console.error('[BR WS] Error:', e);
      }
    });

    ws.on('close', () => {
      const info = brPlayerWs.get(ws);
      if (info) removePlayerFromRoom(ws, info.roomId, info.uid);
    });
  });

  function removePlayerFromRoom(ws: WebSocket, roomId: string, uid: string) {
    const conns = brRoomConnections.get(roomId);
    if (conns) conns.delete(ws);
    brPlayerWs.delete(ws);

    const room = brRooms.get(roomId);
    if (!room) return;

    // Remove player entirely (score resets on leave)
    room.players.delete(uid);
    room.answers.delete(uid);

    const connected = connectedPlayerCount(room);
    broadcastToRoom(roomId, { type: 'br-player-count', playerCount: connected });

    // Stop loop if empty
    if (connected === 0) {
      stopRoomLoop(room);
      room.questionNumber = 0;
      room.currentQuestion = null;
      room.matchStartedAt = 0;
    }

    console.log(`[BR] Player ${uid} left ${roomId} (${connected} remaining)`);
  }

  // Heartbeat
  setInterval(() => {
    const now = Date.now();
    brPlayerWs.forEach((info, ws) => {
      if (now - info.lastPong > PONG_TIMEOUT) {
        removePlayerFromRoom(ws, info.roomId, info.uid);
      } else if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'ping' })); } catch (_) { /* ignore */ }
      }
    });
  }, HEARTBEAT_INTERVAL);

  // Start loops for rooms that already have players (after restart)
  Array.from(brRooms.values()).forEach(room => {
    if (connectedPlayerCount(room) > 0 && !room.roundTimer) startRoomLoop(room);
  });
}
