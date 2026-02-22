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

// ── Questions (duplicated server-side to avoid client import issues) ──

const RC_QUESTIONS = [
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
];

// ── Helpers ────────────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(5);
  for (let i = 0; i < 5; i++) {
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
      }

      sendRoomUpdate(room);
      console.log(`[RC] ${playerName} joined room ${roomCode}`);
      res.json({ code: room.code, hostId: room.hostId, players: room.players });
    } catch (error) {
      res.status(400).json({ error: 'Failed to join room' });
    }
  });

  // ── WebSocket ──────────────────────────────────────────────────────

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'pong') return;

        // Join room
        if (data.type === 'rc-join' && data.roomCode && data.playerId) {
          const roomCode = data.roomCode as string;
          const playerId = data.playerId as string;

          if (!rcRoomConnections.has(roomCode)) {
            rcRoomConnections.set(roomCode, new Set());
          }
          rcRoomConnections.get(roomCode)!.add(ws);
          rcPlayerConnections.set(ws, { roomCode, playerId });

          const room = rcRooms.get(roomCode);
          if (room) {
            const player = room.players.find(p => p.uid === playerId);
            if (player) player.connected = true;
            sendRoomUpdate(room);
          }
        }

        // Start game (host only)
        if (data.type === 'rc-start-game' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;

          const info = rcPlayerConnections.get(ws);
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

          // Auto-process after time expires
          room.roundTimer = setTimeout(() => {
            finishRound(room);
          }, (config.timePerRound + 2) * 1000); // +2s grace
        }

        // Submit answer
        if (data.type === 'rc-submit-answer' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room || room.phase !== 'playing') return;

          const info = rcPlayerConnections.get(ws);
          if (!info) return;

          room.answers.set(info.playerId, data.answer || '');

          // Broadcast answer count
          broadcastToRCRoom(room.code, {
            type: 'rc-answer-count',
            count: room.answers.size,
          });

          // If all connected players answered, finish round early
          const connectedCount = room.players.filter(p => p.connected).length;
          if (room.answers.size >= connectedCount) {
            if (room.roundTimer) clearTimeout(room.roundTimer);
            // Small delay so last player sees their answer registered
            setTimeout(() => finishRound(room), 500);
          }
        }

        // Next round (host only)
        if (data.type === 'rc-next-round' && data.roomCode) {
          const room = rcRooms.get(data.roomCode);
          if (!room) return;
          const info = rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          room.currentRound++;
          room.answers = new Map();

          if (room.currentRound > room.questions.length) {
            // Game over
            broadcastToRCRoom(room.code, {
              type: 'rc-game-over',
              scores: room.scores,
            });
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
          const info = rcPlayerConnections.get(ws);
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
          const info = rcPlayerConnections.get(ws);
          if (!info || info.playerId !== room.hostId) return;

          const targetId = data.targetPlayerId;
          const target = room.players.find(p => p.uid === targetId);
          if (!target) return;

          room.players = room.players.filter(p => p.uid !== targetId);

          // Notify the kicked player
          const connections = rcRoomConnections.get(room.code);
          if (connections) {
            Array.from(connections).forEach(c => {
              const cInfo = rcPlayerConnections.get(c);
              if (cInfo?.playerId === targetId) {
                c.send(JSON.stringify({ type: 'rc-kicked' }));
                connections.delete(c);
                rcPlayerConnections.delete(c);
              }
            });
          }

          sendRoomUpdate(room);
        }

        // Leave
        if (data.type === 'rc-leave') {
          handleDisconnect(ws, true);
        }
      } catch (e) {
        console.error('[RC WS] Error:', e);
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws, false);
    });
  });

  function handleDisconnect(ws: WebSocket, intentional: boolean) {
    const info = rcPlayerConnections.get(ws);
    if (!info) return;

    const room = rcRooms.get(info.roomCode);
    if (room) {
      if (intentional) {
        // Remove player
        const player = room.players.find(p => p.uid === info.playerId);
        room.players = room.players.filter(p => p.uid !== info.playerId);

        if (player) {
          broadcastToRCRoom(room.code, {
            type: 'rc-player-left',
            playerName: player.name,
          });
        }

        // Transfer host if needed
        if (room.hostId === info.playerId && room.players.length > 0) {
          room.hostId = room.players[0].uid;
        }

        // Delete empty rooms
        if (room.players.length === 0) {
          if (room.roundTimer) clearTimeout(room.roundTimer);
          rcRooms.delete(room.code);
          rcRoomConnections.delete(room.code);
        } else {
          sendRoomUpdate(room);
        }
      } else {
        // Mark disconnected
        const player = room.players.find(p => p.uid === info.playerId);
        if (player) player.connected = false;
        sendRoomUpdate(room);
      }
    }

    const connections = rcRoomConnections.get(info.roomCode);
    if (connections) {
      connections.delete(ws);
    }
    rcPlayerConnections.delete(ws);
  }

  function finishRound(room: RCRoom) {
    if (room.roundTimer) { clearTimeout(room.roundTimer); room.roundTimer = null; }

    const result = processRoundAnswers(room);
    if (!result) return;

    // Update player scores in room
    room.players.forEach(p => { p.score = room.scores[p.uid] || 0; });

    broadcastToRCRoom(room.code, {
      type: 'rc-round-result',
      result,
      scores: room.scores,
    });

    // If this was the last round, also send game-over after a delay
    if (room.currentRound >= room.questions.length) {
      // Host will trigger game-over via next-round, or we auto-send after result display
    }
  }

  // Ping interval
  setInterval(() => {
    Array.from(rcRoomConnections.entries()).forEach(([_roomCode, connections]) => {
      Array.from(connections).forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      });
    });
  }, 30000);
}
