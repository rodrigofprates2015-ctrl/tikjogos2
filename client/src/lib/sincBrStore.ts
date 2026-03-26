/**
 * Zustand store for Sincronia Battle Royale.
 * Two phases: 'selection' (pick a room) and 'playing' (game loop).
 */
import { create } from 'zustand';

export type BRPhase = 'selection' | 'playing';

export type BRRoomInfo = {
  id: string;
  label: string;
  category: string;
  playerCount: number;
  maxPlayers: number;
  questionNumber: number;
};

export type BRLeaderboardEntry = {
  uid: string;
  name: string;
  score: number;
  rank: number;
};

export type BRAnswerGroup = {
  normalized: string;
  original: string[];
  players: { uid: string; name: string }[];
  points: number;
};

export type BRRoundResult = {
  questionText: string;
  groups: BRAnswerGroup[];
  noAnswer: { uid: string; name: string }[];
};

export type SincBRState = {
  // User
  uid: string;
  name: string;

  // Phase
  phase: BRPhase;

  // Room list
  rooms: BRRoomInfo[];

  // Current room
  currentRoomId: string | null;
  currentRoomLabel: string | null;

  // Game state
  question: string | null;
  questionNumber: number;
  timeLeft: number;
  duration: number;
  myAnswer: string;
  hasSubmitted: boolean;
  playerCount: number;
  myScore: number;

  // Match timer (3-minute match)
  matchTimeLeft: number;
  matchDuration: number;
  showingMatchEnd: boolean;
  matchEndLeaderboard: BRLeaderboardEntry[];

  // Leaderboard
  leaderboard: BRLeaderboardEntry[];

  // Round result (shown briefly after each round)
  roundResult: BRRoundResult | null;
  showingResult: boolean;

  // Points gained last round (for toast)
  lastPointsGained: number;

  // WebSocket
  ws: WebSocket | null;
  isConnecting: boolean;

  // Actions
  setName: (name: string) => void;
  fetchRooms: () => Promise<void>;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  submitAnswer: () => void;
  setMyAnswer: (answer: string) => void;
};

function generateUID(): string {
  return 'br-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

let countdownInterval: ReturnType<typeof setInterval> | null = null;
let matchCountdownInterval: ReturnType<typeof setInterval> | null = null;

function clearCountdown() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

function clearMatchCountdown() {
  if (matchCountdownInterval) { clearInterval(matchCountdownInterval); matchCountdownInterval = null; }
}

function startMatchCountdown(set: (partial: Partial<SincBRState> | ((s: SincBRState) => Partial<SincBRState>)) => void, get: () => SincBRState, seconds: number) {
  clearMatchCountdown();
  set({ matchTimeLeft: seconds });
  matchCountdownInterval = setInterval(() => {
    const { matchTimeLeft } = get();
    if (matchTimeLeft <= 1) {
      clearMatchCountdown();
      set({ matchTimeLeft: 0 });
      return;
    }
    set({ matchTimeLeft: matchTimeLeft - 1 });
  }, 1000);
}

function startCountdown(set: (partial: Partial<SincBRState> | ((s: SincBRState) => Partial<SincBRState>)) => void, get: () => SincBRState, seconds: number) {
  clearCountdown();
  set({ timeLeft: seconds });
  countdownInterval = setInterval(() => {
    const { timeLeft, hasSubmitted, showingResult } = get();
    if (showingResult) { clearCountdown(); return; }
    if (timeLeft <= 1) {
      clearCountdown();
      set({ timeLeft: 0 });
      if (!hasSubmitted) get().submitAnswer();
      return;
    }
    set({ timeLeft: timeLeft - 1 });
  }, 1000);
}

export const useSincBRStore = create<SincBRState>((set, get) => ({
  uid: '',
  name: '',
  phase: 'selection',
  rooms: [],
  currentRoomId: null,
  currentRoomLabel: null,
  question: null,
  questionNumber: 0,
  timeLeft: 30,
  duration: 30,
  myAnswer: '',
  hasSubmitted: false,
  playerCount: 0,
  myScore: 0,
  matchTimeLeft: 180,
  matchDuration: 180,
  showingMatchEnd: false,
  matchEndLeaderboard: [],
  leaderboard: [],
  roundResult: null,
  showingResult: false,
  lastPointsGained: 0,
  ws: null,
  isConnecting: false,

  setName: (name: string) => {
    const uid = generateUID();
    set({ uid, name });
    localStorage.setItem('tikjogos_saved_nickname', name);
  },

  fetchRooms: async () => {
    try {
      const res = await fetch('/api/br/rooms');
      if (res.ok) {
        const data = await res.json();
        set({ rooms: data });
      }
    } catch (e) {
      console.error('[BR] Failed to fetch rooms', e);
    }
  },

  joinRoom: (roomId: string) => {
    const { uid, name, ws: oldWs } = get();
    if (!uid || !name) return;
    if (oldWs) { try { oldWs.close(); } catch (_) {} }

    set({ isConnecting: true });

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectDelays = [1500, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000, 30000];

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/br-ws`);

    const sendSyncRequest = () => {
      const ws = get().ws;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'br-join', roomId, uid, name }));
      }
    };

    // Re-sync state when tab becomes visible again
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') sendSyncRequest();
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    const focusHandler = () => sendSyncRequest();
    window.addEventListener('focus', focusHandler);

    // Disconnect beacon on browser close
    const sendBeacon = () => {
      const { uid: u, currentRoomId } = get();
      if (u && currentRoomId && navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify({ uid: u })], { type: 'application/json' });
          navigator.sendBeacon(`/api/br/rooms/${currentRoomId}/disconnect`, blob);
        } catch (_) {}
      }
    };

    const beforeUnload = () => {
      const ws = get().ws;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'disconnect_notice' })); } catch (_) {}
      }
      sendBeacon();
    };
    window.addEventListener('beforeunload', beforeUnload);

    newWs.onopen = () => {
      reconnectAttempts = 0;
      newWs.send(JSON.stringify({ type: 'br-join', roomId, uid, name }));
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'br-joined') {
          set({
            phase: 'playing',
            currentRoomId: data.roomId,
            currentRoomLabel: data.label,
            question: data.question,
            questionNumber: data.questionNumber,
            duration: data.duration,
            leaderboard: data.leaderboard || [],
            playerCount: data.playerCount,
            myScore: data.myScore || 0,
            isConnecting: false,
            myAnswer: '',
            hasSubmitted: false,
            roundResult: null,
            showingResult: false,
            showingMatchEnd: false,
            matchDuration: data.matchDuration || 180,
          });
          if (data.timeLeft > 0 && data.question) {
            startCountdown(set, get, data.timeLeft);
          }
          if (data.matchTimeLeft != null) {
            startMatchCountdown(set, get, data.matchTimeLeft);
          }
        }

        if (data.type === 'br-question') {
          set({
            question: data.question,
            questionNumber: data.questionNumber,
            duration: data.duration,
            playerCount: data.playerCount,
            myAnswer: '',
            hasSubmitted: false,
            roundResult: null,
            showingResult: false,
            showingMatchEnd: false,
          });
          startCountdown(set, get, data.duration);
          if (data.matchTimeLeft != null) {
            startMatchCountdown(set, get, data.matchTimeLeft);
          }
        }

        if (data.type === 'br-round-result') {
          clearCountdown();
          const result = data.result as BRRoundResult | null;
          const lb = data.leaderboard as BRLeaderboardEntry[];

          // Calculate points gained this round
          let gained = 0;
          if (result) {
            const { uid: myUid } = get();
            for (const g of result.groups) {
              if (g.players.some(p => p.uid === myUid) && g.points > 0) {
                gained = g.points;
                break;
              }
            }
          }

          const myEntry = lb.find(e => e.uid === get().uid);
          set({
            roundResult: result,
            showingResult: true,
            leaderboard: lb,
            playerCount: data.playerCount,
            lastPointsGained: gained,
            myScore: myEntry?.score || get().myScore,
          });
          if (data.matchTimeLeft != null) {
            startMatchCountdown(set, get, data.matchTimeLeft);
          }
        }

        if (data.type === 'br-match-end') {
          clearCountdown();
          clearMatchCountdown();
          const lb = data.leaderboard as BRLeaderboardEntry[];
          set({
            showingMatchEnd: true,
            showingResult: false,
            roundResult: null,
            matchEndLeaderboard: lb,
            matchTimeLeft: 0,
            question: null,
          });
        }

        if (data.type === 'br-player-count') {
          set({ playerCount: data.playerCount });
        }

        if (data.type === 'br-error') {
          console.error('[BR] Server error:', data.message);
          set({ isConnecting: false });
        }
      } catch (e) {
        console.error('[BR WS] Parse error:', e);
      }
    };

    newWs.onerror = () => { newWs.close(); };

    newWs.onclose = (event) => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('beforeunload', beforeUnload);
      clearCountdown();
      clearMatchCountdown();

      // Attempt reconnect with backoff if we were playing and it wasn't intentional
      if (get().phase === 'playing' && event.code !== 1000) {
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectDelays[Math.min(reconnectAttempts, reconnectDelays.length - 1)];
          reconnectAttempts++;
          console.log(`[BR] Reconnecting (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms...`);
          setTimeout(() => get().joinRoom(roomId), delay);
        } else {
          set({
            phase: 'selection',
            currentRoomId: null,
            currentRoomLabel: null,
            ws: null,
            question: null,
            roundResult: null,
            showingResult: false,
            showingMatchEnd: false,
            matchEndLeaderboard: [],
            myScore: 0,
            leaderboard: [],
            isConnecting: false,
          });
        }
      } else if (get().phase === 'playing') {
        set({
          phase: 'selection',
          currentRoomId: null,
          currentRoomLabel: null,
          ws: null,
          question: null,
          roundResult: null,
          showingResult: false,
          showingMatchEnd: false,
          matchEndLeaderboard: [],
          myScore: 0,
          leaderboard: [],
          isConnecting: false,
        });
      }
    };

    set({ ws: newWs });
  },

  leaveRoom: () => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'br-leave' }));
      ws.close();
    }
    clearCountdown();
    clearMatchCountdown();
    set({
      phase: 'selection',
      currentRoomId: null,
      currentRoomLabel: null,
      ws: null,
      question: null,
      roundResult: null,
      showingResult: false,
      showingMatchEnd: false,
      matchEndLeaderboard: [],
      myScore: 0,
      leaderboard: [],
      myAnswer: '',
      hasSubmitted: false,
    });
  },

  submitAnswer: () => {
    const { ws, hasSubmitted, myAnswer } = get();
    if (hasSubmitted) return;
    set({ hasSubmitted: true });
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'br-submit', answer: myAnswer }));
    }
  },

  setMyAnswer: (answer: string) => set({ myAnswer: answer }),
}));
