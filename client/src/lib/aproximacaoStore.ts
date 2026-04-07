import { create } from 'zustand';

export type AproximacaoPlayer = {
  uid: string;
  name: string;
  connected?: boolean;
  hearts: number;
  eliminated?: boolean;
};

export type AproximacaoGuess = {
  playerId: string;
  playerName: string;
  value: number;
};

export type AproximacaoQuestion = {
  text: string;
  answer: number;
  unit: string;
};

export type AproximacaoGameData = {
  phase: 'guessing' | 'revealing' | 'gameover';
  question: AproximacaoQuestion;
  guesses: AproximacaoGuess[];
  roundNumber: number;
  winnerId?: string;
  winnerName?: string;
  lastRoundClosest?: string;
  lastRoundFarthest?: string;
  lastRoundResult?: { closestId: string; farthestId: string; allGuesses: AproximacaoGuess[] };
};

export type AproximacaoRoom = {
  code: string;
  hostId: string;
  status: 'waiting' | 'playing';
  players: AproximacaoPlayer[];
  gameData: AproximacaoGameData | null;
  createdAt: string;
};

export type AproximacaoPhase = 'home' | 'lobby' | 'playing';

export type AproximacaoState = {
  user: { uid: string; name: string } | null;
  room: AproximacaoRoom | null;
  phase: AproximacaoPhase;
  isLoading: boolean;
  ws: WebSocket | null;
  notifications: Array<{ id: string; message: string; type: string }>;
  myGuess: number | null;
  savedNickname: string | null;

  setUser: (name: string) => void;
  loadSavedNickname: () => string | null;
  saveNickname: (name: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  connectWebSocket: (code: string) => void;
  startGame: () => void;
  submitGuess: (value: number) => void;
  revealResults: () => void;
  nextRound: () => void;
  returnToLobby: () => void;
  leaveGame: () => void;
  setMyGuess: (v: number | null) => void;
  addNotification: (msg: { type: string; message: string }) => void;
  removeNotification: (id: string) => void;
};

function generateUID(): string {
  return 'user-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useAproximacaoStore = create<AproximacaoState>((set, get) => ({
  user: null,
  room: null,
  phase: 'home',
  isLoading: false,
  ws: null,
  notifications: [],
  myGuess: null,
  savedNickname: null,

  setUser: (name: string) => {
    const uid = generateUID();
    set({ user: { uid, name } });
  },

  loadSavedNickname: () => {
    const saved = localStorage.getItem('tikjogos_saved_nickname');
    if (saved) {
      set({ savedNickname: saved });
      return saved;
    }
    return null;
  },

  saveNickname: (name: string) => {
    if (name.trim()) {
      localStorage.setItem('tikjogos_saved_nickname', name);
      set({ savedNickname: name });
    }
  },

  createRoom: async () => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/aproximacao-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.uid, playerName: user.name }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const room: AproximacaoRoom = await res.json();
      set({ room, phase: 'lobby', isLoading: false });
      get().connectWebSocket(room.code);
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  joinRoom: async (code: string) => {
    const { user } = get();
    if (!user) return false;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/aproximacao-rooms/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.uid, playerName: user.name }),
      });
      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }
      const room: AproximacaoRoom = await res.json();
      set({ room, phase: 'lobby', isLoading: false });
      get().connectWebSocket(room.code);
      return true;
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
      return false;
    }
  },

  connectWebSocket: (code: string) => {
    const { ws: existingWs } = get();
    if (existingWs && existingWs.readyState === WebSocket.OPEN) existingWs.close();

    const user = get().user;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/game-ws`);

    let reconnectAttempts = 0;
    const maxReconnects = 10;

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnects) return;
      const room = get().room;
      if (!room) return;
      reconnectAttempts++;
      setTimeout(() => get().connectWebSocket(room.code), Math.min(1500 * reconnectAttempts, 30000));
    };

    newWs.onopen = () => {
      reconnectAttempts = 0;
      newWs.send(JSON.stringify({ type: 'join-room', roomCode: code, playerId: user?.uid }));
      newWs.send(JSON.stringify({ type: 'aproximacao-join', roomCode: code, playerId: user?.uid }));
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'aproximacao-room-update' && data.room) {
          const room: AproximacaoRoom = data.room;
          const currentUser = get().user;
          let newPhase: AproximacaoPhase = 'lobby';

          if (room.status === 'playing') newPhase = 'playing';

          // If game just reset to waiting, clear local guess
          if (room.status === 'waiting') {
            set({ myGuess: null });
          }

          set({ room, phase: newPhase });
        }

        if (data.type === 'host-changed') {
          get().addNotification({ type: 'host-changed', message: `${data.newHostName} agora é o host` });
        }

        if (data.type === 'player-left' || data.type === 'player-removed') {
          get().addNotification({ type: 'player-left', message: `${data.playerName} saiu da sala` });
        }
      } catch (e) {
        console.error('WS message error:', e);
      }
    };

    newWs.onerror = () => newWs.close();
    newWs.onclose = (event) => {
      const room = get().room;
      if (room && event.code !== 1000) attemptReconnect();
    };

    set({ ws: newWs });
  },

  startGame: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    ws.send(JSON.stringify({ type: 'aproximacao-start', roomCode: room.code, playerId: user.uid }));
  },

  submitGuess: (value: number) => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    set({ myGuess: value });
    ws.send(JSON.stringify({ type: 'aproximacao-submit-guess', roomCode: room.code, playerId: user.uid, value }));
  },

  revealResults: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    ws.send(JSON.stringify({ type: 'aproximacao-reveal', roomCode: room.code, playerId: user.uid }));
  },

  nextRound: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    set({ myGuess: null });
    ws.send(JSON.stringify({ type: 'aproximacao-next-round', roomCode: room.code, playerId: user.uid }));
  },

  returnToLobby: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    set({ myGuess: null });
    ws.send(JSON.stringify({ type: 'aproximacao-return-to-lobby', roomCode: room.code, playerId: user.uid }));
  },

  leaveGame: () => {
    const { ws, room, user } = get();
    if (ws && room && user) {
      ws.send(JSON.stringify({ type: 'aproximacao-disconnect', roomCode: room.code, playerId: user.uid }));
      ws.close();
    }
    set({ user: null, room: null, phase: 'home', ws: null, myGuess: null });
  },

  setMyGuess: (v) => set({ myGuess: v }),

  addNotification: (msg) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(s => ({ notifications: [...s.notifications, { id, ...msg }] }));
    setTimeout(() => get().removeNotification(id), 4000);
  },

  removeNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}));
