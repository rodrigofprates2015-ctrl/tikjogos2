/**
 * Zustand store for "Respostas em Comum" game.
 * Reuses the same room/lobby WebSocket infrastructure as the Impostor game.
 */
import { create } from 'zustand';

export type RCPlayer = {
  uid: string;
  name: string;
  score: number;
  connected?: boolean;
};

export type RCAnswerGroup = {
  normalized: string;
  original: string[];
  players: { uid: string; name: string }[];
  points: number; // 0 if solo, 1 if 2+
};

export type RCRoundResult = {
  questionText: string;
  groups: RCAnswerGroup[];
  noAnswer: { uid: string; name: string }[];
};

export type RCGamePhase =
  | 'home'
  | 'themeSelect'  // Host picks a theme after creating room
  | 'lobby'
  | 'answering'    // Players are typing answers
  | 'roundResult'  // Showing round results
  | 'finalScore';  // Game over

export type RCGameMode = 'classico' | 'rapido' | 'tematico';

export type RCGameConfig = {
  mode: RCGameMode;
  rounds: number;
  timePerRound: number;
  category?: string; // for tematico mode
};

export type RCRoom = {
  code: string;
  hostId: string;
  players: RCPlayer[];
};

export type RCGameState = {
  // Connection
  user: RCPlayer | null;
  room: RCRoom | null;
  ws: WebSocket | null;
  phase: RCGamePhase;
  isLoading: boolean;
  isDisconnected: boolean;
  savedNickname: string | null;

  // Game state
  config: RCGameConfig;
  currentRound: number;
  totalRounds: number;
  currentQuestion: string;
  timeLeft: number;
  myAnswer: string;
  hasSubmitted: boolean;
  roundResult: RCRoundResult | null;
  scores: Record<string, number>; // uid -> total score
  answeredCount: number; // how many players answered this round

  // Notifications
  notifications: Array<{ id: string; type: string; message: string }>;

  // Actions
  setUser: (name: string) => void;
  saveNickname: (name: string) => void;
  clearSavedNickname: () => void;
  loadSavedNickname: () => string | null;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  leaveGame: () => void;
  connectWebSocket: (code: string) => void;
  selectTheme: (category?: string) => void;
  goBackToThemeSelect: () => void;
  startGame: (config?: Partial<RCGameConfig>) => void;
  submitAnswer: (answer: string) => void;
  nextRound: () => void;
  returnToLobby: () => void;
  setMyAnswer: (answer: string) => void;
  addNotification: (n: { type: string; message: string }) => void;
  removeNotification: (id: string) => void;
  kickPlayer: (targetId: string) => void;
};

function generateUID(): string {
  return 'rc-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useRCGameStore = create<RCGameState>((set, get) => ({
  user: null,
  room: null,
  ws: null,
  phase: 'home',
  isLoading: false,
  isDisconnected: false,
  savedNickname: null,

  config: { mode: 'classico', rounds: 10, timePerRound: 30 },
  currentRound: 0,
  totalRounds: 10,
  currentQuestion: '',
  timeLeft: 30,
  myAnswer: '',
  hasSubmitted: false,
  roundResult: null,
  scores: {},
  answeredCount: 0,
  notifications: [],

  setUser: (name: string) => {
    const uid = generateUID();
    set({ user: { uid, name, score: 0 } });
  },

  saveNickname: (name: string) => {
    if (name.trim()) {
      localStorage.setItem('tikjogos_saved_nickname', name);
      set({ savedNickname: name });
    }
  },

  clearSavedNickname: () => {
    localStorage.removeItem('tikjogos_saved_nickname');
    set({ savedNickname: null });
  },

  loadSavedNickname: () => {
    const saved = localStorage.getItem('tikjogos_saved_nickname');
    if (saved) {
      set({ savedNickname: saved });
      return saved;
    }
    return null;
  },

  createRoom: async () => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true });

    try {
      const response = await fetch('/api/rc/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.uid, hostName: user.name }),
      });
      if (!response.ok) throw new Error('Failed to create room');
      const data = await response.json();
      set({
        room: { code: data.code, hostId: data.hostId, players: data.players },
        phase: 'lobby',
        isLoading: false,
        scores: {},
      });
      get().connectWebSocket(data.code);
    } catch (error) {
      console.error('[RC CreateRoom]', error);
      set({ isLoading: false });
    }
  },

  joinRoom: async (code: string) => {
    const { user } = get();
    if (!user) return false;
    set({ isLoading: true });

    try {
      const response = await fetch('/api/rc/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), playerId: user.uid, playerName: user.name }),
      });
      if (!response.ok) { set({ isLoading: false }); return false; }
      const data = await response.json();
      set({
        room: { code: data.code, hostId: data.hostId, players: data.players },
        phase: 'lobby',
        isLoading: false,
        scores: {},
      });
      get().connectWebSocket(data.code);
      return true;
    } catch (error) {
      console.error('[RC JoinRoom]', error);
      set({ isLoading: false });
      return false;
    }
  },

  selectTheme: (category?: string) => {
    set({
      config: { ...get().config, category },
      phase: 'lobby',
    });
  },

  goBackToThemeSelect: () => {
    set({ phase: 'themeSelect' });
  },

  leaveGame: () => {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'rc-leave' }));
      ws.close();
    }
    set({
      room: null, ws: null, phase: 'home', currentRound: 0,
      scores: {}, roundResult: null, myAnswer: '', hasSubmitted: false,
    });
  },

  connectWebSocket: (code: string) => {
    const oldWs = get().ws;
    if (oldWs && oldWs.readyState === WebSocket.OPEN) oldWs.close();

    const user = get().user;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/rc-ws`);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    let visibilityHandler: (() => void) | null = null;

    const getReconnectDelay = (attempt: number): number => {
      const delays = [1500, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000, 30000];
      return delays[Math.min(attempt, delays.length - 1)];
    };

    const sendSyncRequest = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: 'sync_request' }));
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        set({ isDisconnected: true });
        get().addNotification({ type: 'disconnected', message: 'Conexão perdida. Recarregue a página.' });
        return;
      }
      const currentRoom = get().room;
      if (!currentRoom) return;

      reconnectAttempts++;
      const delay = getReconnectDelay(reconnectAttempts - 1);
      console.log(`[RC] Reconnecting (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms...`);
      setTimeout(() => { get().connectWebSocket(currentRoom.code); }, delay);
    };

    // Visibility change — sync state when tab becomes visible
    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && newWs.readyState === WebSocket.OPEN) {
        sendSyncRequest();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    const focusHandler = () => {
      if (newWs.readyState === WebSocket.OPEN) sendSyncRequest();
    };
    window.addEventListener('focus', focusHandler);

    // Hard exit detection (browser/tab close)
    const sendDisconnectNotice = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        try { newWs.send(JSON.stringify({ type: 'disconnect_notice' })); } catch (e) { /* ignore */ }
      }
    };

    const sendDisconnectBeacon = () => {
      const currentUser = get().user;
      const currentRoom = get().room;
      if (currentUser && currentRoom && navigator.sendBeacon) {
        try {
          const blob = new Blob(
            [JSON.stringify({ playerId: currentUser.uid })],
            { type: 'application/json' }
          );
          navigator.sendBeacon(`/api/rc/rooms/${currentRoom.code}/disconnect-notice`, blob);
        } catch (e) { /* ignore */ }
      }
    };

    let disconnectSent = false;
    const handleDisconnect = (eventName: string) => {
      if (disconnectSent) return;
      disconnectSent = true;
      console.log(`[RC Disconnect] ${eventName}`);
      sendDisconnectNotice();
      sendDisconnectBeacon();
    };

    const beforeUnloadHandler = () => { handleDisconnect('beforeunload'); };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    const pageHideHandler = (event: PageTransitionEvent) => {
      if (!event.persisted) handleDisconnect('pagehide');
    };
    window.addEventListener('pagehide', pageHideHandler);

    const unloadHandler = () => { handleDisconnect('unload'); };
    window.addEventListener('unload', unloadHandler);

    newWs.onopen = () => {
      reconnectAttempts = 0;
      set({ isDisconnected: false });
      newWs.send(JSON.stringify({ type: 'rc-join', roomCode: code, playerId: user?.uid }));
      sendSyncRequest();
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Respond to server ping
        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'rc-room-update') {
          set({ room: { code: data.code, hostId: data.hostId, players: data.players } });
        }

        // Sync state — restore game state after reconnect
        if (data.type === 'rc-sync-state') {
          if (data.phase === 'playing') {
            const currentPhase = get().phase;
            // If we're in lobby or home, restore to answering
            if (currentPhase === 'lobby' || currentPhase === 'home' || currentPhase === 'themeSelect') {
              set({
                phase: 'answering',
                currentRound: data.round,
                totalRounds: data.totalRounds,
                currentQuestion: data.question,
                timeLeft: data.timePerRound,
                scores: data.scores || {},
                answeredCount: data.answeredCount || 0,
                hasSubmitted: data.hasSubmitted || false,
                myAnswer: '',
                roundResult: null,
              });
              if (!data.hasSubmitted) {
                startCountdown(set, get, data.timePerRound);
              }
            }
          }
        }

        if (data.type === 'rc-game-start') {
          set({
            phase: 'answering',
            currentRound: data.round,
            totalRounds: data.totalRounds,
            currentQuestion: data.question,
            timeLeft: data.timePerRound,
            myAnswer: '',
            hasSubmitted: false,
            roundResult: null,
            answeredCount: 0,
          });
          startCountdown(set, get, data.timePerRound);
        }

        if (data.type === 'rc-answer-count') {
          set({ answeredCount: data.count });
        }

        if (data.type === 'rc-round-result') {
          set({
            phase: 'roundResult',
            roundResult: data.result,
            scores: data.scores,
            room: get().room ? {
              ...get().room!,
              players: get().room!.players.map(p => ({
                ...p,
                score: data.scores[p.uid] || 0,
              })),
            } : get().room,
          });
        }

        if (data.type === 'rc-next-round') {
          set({
            phase: 'answering',
            currentRound: data.round,
            currentQuestion: data.question,
            timeLeft: data.timePerRound,
            myAnswer: '',
            hasSubmitted: false,
            roundResult: null,
            answeredCount: 0,
          });
          startCountdown(set, get, data.timePerRound);
        }

        if (data.type === 'rc-game-over') {
          set({ phase: 'finalScore', scores: data.scores });
        }

        if (data.type === 'rc-back-to-lobby') {
          set({
            phase: 'lobby',
            currentRound: 0,
            scores: {},
            roundResult: null,
            myAnswer: '',
            hasSubmitted: false,
          });
        }

        if (data.type === 'rc-player-left') {
          get().addNotification({ type: 'player-left', message: `${data.playerName} saiu da sala` });
        }

        if (data.type === 'rc-player-joined') {
          get().addNotification({ type: 'player-joined', message: `${data.playerName} entrou na sala` });
        }

        if (data.type === 'rc-player-disconnected') {
          get().addNotification({ type: 'disconnected', message: `${data.playerName} desconectou temporariamente` });
        }

        if (data.type === 'rc-player-reconnected') {
          get().addNotification({ type: 'reconnected', message: `${data.playerName} reconectou` });
        }

        if (data.type === 'rc-host-changed') {
          get().addNotification({ type: 'host-changed', message: `${data.newHostName} é o novo host` });
        }

        if (data.type === 'rc-kicked') {
          get().addNotification({ type: 'kicked', message: 'Você foi expulso da sala' });
          set({ room: null, ws: null, phase: 'home' });
        }
      } catch (e) {
        console.error('[RC WS] Parse error:', e);
      }
    };

    newWs.onerror = () => {
      newWs.close();
    };

    newWs.onclose = (event) => {
      // Cleanup event listeners
      if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('focus', focusHandler);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('pagehide', pageHideHandler);
      window.removeEventListener('unload', unloadHandler);

      const currentRoom = get().room;
      if (currentRoom && event.code !== 1000) {
        attemptReconnect();
      }
    };

    set({ ws: newWs });
  },

  startGame: (config?: Partial<RCGameConfig>) => {
    const { ws, room } = get();
    if (!ws || !room) return;
    const finalConfig = { ...get().config, ...config };
    set({ config: finalConfig });
    ws.send(JSON.stringify({
      type: 'rc-start-game',
      roomCode: room.code,
      config: finalConfig,
    }));
  },

  submitAnswer: (answer: string) => {
    const { ws, room, hasSubmitted } = get();
    if (!ws || !room || hasSubmitted) return;
    set({ hasSubmitted: true, myAnswer: answer });
    ws.send(JSON.stringify({
      type: 'rc-submit-answer',
      roomCode: room.code,
      answer,
    }));
  },

  nextRound: () => {
    const { ws, room } = get();
    if (!ws || !room) return;
    ws.send(JSON.stringify({ type: 'rc-next-round', roomCode: room.code }));
  },

  returnToLobby: () => {
    const { ws, room } = get();
    if (!ws || !room) return;
    ws.send(JSON.stringify({ type: 'rc-back-to-lobby', roomCode: room.code }));
  },

  setMyAnswer: (answer: string) => set({ myAnswer: answer }),

  addNotification: (n) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    set(s => ({ notifications: [...s.notifications, { ...n, id }] }));
    setTimeout(() => get().removeNotification(id), 4000);
  },

  removeNotification: (id) => {
    set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
  },

  kickPlayer: (targetId: string) => {
    const { ws, room } = get();
    if (!ws || !room) return;
    ws.send(JSON.stringify({ type: 'rc-kick-player', roomCode: room.code, targetPlayerId: targetId }));
  },
}));

// Timer helper
let countdownInterval: ReturnType<typeof setInterval> | null = null;

function startCountdown(
  set: (partial: Partial<RCGameState> | ((s: RCGameState) => Partial<RCGameState>)) => void,
  get: () => RCGameState,
  seconds: number
) {
  if (countdownInterval) clearInterval(countdownInterval);
  set({ timeLeft: seconds });

  countdownInterval = setInterval(() => {
    const { timeLeft, hasSubmitted, phase } = get();
    if (phase !== 'answering') {
      if (countdownInterval) clearInterval(countdownInterval);
      return;
    }
    if (timeLeft <= 1) {
      if (countdownInterval) clearInterval(countdownInterval);
      set({ timeLeft: 0 });
      // Auto-submit if not already submitted
      if (!hasSubmitted) {
        get().submitAnswer(get().myAnswer);
      }
      return;
    }
    set({ timeLeft: timeLeft - 1 });
  }, 1000);
}
