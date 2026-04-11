import { create } from 'zustand';

export type RankMasterItem = {
  id: string;
  label: string;
  trueRank: number;
};

export type RankMasterChallenge = {
  id: string;
  category: string;
  items: RankMasterItem[];
};

export type RankMasterPlayerOrder = {
  playerId: string;
  playerName: string;
  orderedIds: string[];
  penalty: number;
};

export type RankMasterPlayer = {
  uid: string;
  name: string;
  connected?: boolean;
  score: number;
};

export type RankMasterGameData = {
  phase: 'preparing' | 'ordering' | 'revealing' | 'gameover';
  challenge: RankMasterChallenge;
  shuffledItems: RankMasterItem[];
  orders: RankMasterPlayerOrder[];
  roundNumber: number;
  totalRounds: number;
  topCount: number;
  roundWinnerIds: string[];
  preparingEndsAt?: number;
};

export type RankMasterRoom = {
  code: string;
  hostId: string;
  status: 'waiting' | 'playing';
  players: RankMasterPlayer[];
  gameData: RankMasterGameData | null;
  createdAt: string;
};

export type RankMasterPhase = 'home' | 'lobby' | 'playing';

export type RankMasterState = {
  user: { uid: string; name: string } | null;
  room: RankMasterRoom | null;
  phase: RankMasterPhase;
  isLoading: boolean;
  ws: WebSocket | null;
  notifications: Array<{ id: string; message: string; type: string }>;
  myOrder: string[] | null;
  savedNickname: string | null;

  setUser: (name: string) => void;
  loadSavedNickname: () => string | null;
  saveNickname: (name: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  connectWebSocket: (code: string) => void;
  startGame: (totalRounds: number, topCount: number) => void;
  submitOrder: (orderedIds: string[]) => void;
  revealResults: () => void;
  nextRound: () => void;
  returnToLobby: () => void;
  leaveGame: () => void;
  setMyOrder: (order: string[] | null) => void;
  addNotification: (msg: { type: string; message: string }) => void;
  removeNotification: (id: string) => void;
};

function generateUID(): string {
  return 'user-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useRankMasterStore = create<RankMasterState>((set, get) => ({
  user: null,
  room: null,
  phase: 'home',
  isLoading: false,
  ws: null,
  notifications: [],
  myOrder: null,
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
      const res = await fetch('/api/rankmaster-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.uid, playerName: user.name }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const room: RankMasterRoom = await res.json();
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
      const res = await fetch(`/api/rankmaster-rooms/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.uid, playerName: user.name }),
      });
      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }
      const room: RankMasterRoom = await res.json();
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
      newWs.send(JSON.stringify({ type: 'rankmaster-join', roomCode: code, playerId: user?.uid }));
    };

    const handleBeforeUnload = () => {
      const { room: currentRoom, user: currentUser } = get();
      if (!currentRoom || !currentUser) return;
      navigator.sendBeacon(
        `/api/rankmaster-rooms/${currentRoom.code}/disconnect-notice`,
        JSON.stringify({ playerId: currentUser.uid })
      );
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'rankmaster-room-update' && data.room) {
          const room: RankMasterRoom = data.room;
          let newPhase: RankMasterPhase = 'lobby';
          if (room.status === 'playing') newPhase = 'playing';

          if (room.status === 'waiting') {
            set({ myOrder: null });
          }

          const prevRoom = get().room;
          const prevPhase = prevRoom?.gameData?.phase;
          const newGamePhase = room.gameData?.phase;
          if (prevPhase !== newGamePhase) {
            set({ myOrder: null });
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
        console.error('RankMaster WS error:', e);
      }
    };

    newWs.onerror = () => newWs.close();
    newWs.onclose = (event) => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const room = get().room;
      if (room && event.code !== 1000) attemptReconnect();
    };

    set({ ws: newWs });
  },

  startGame: (totalRounds: number, topCount: number) => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    ws.send(JSON.stringify({ type: 'rankmaster-start', roomCode: room.code, playerId: user.uid, totalRounds, topCount }));
  },

  submitOrder: (orderedIds: string[]) => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    set({ myOrder: orderedIds });
    ws.send(JSON.stringify({ type: 'rankmaster-submit-order', roomCode: room.code, playerId: user.uid, orderedIds }));
  },

  revealResults: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    ws.send(JSON.stringify({ type: 'rankmaster-reveal', roomCode: room.code, playerId: user.uid }));
  },

  nextRound: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    ws.send(JSON.stringify({ type: 'rankmaster-next-round', roomCode: room.code, playerId: user.uid }));
  },

  returnToLobby: () => {
    const { ws, room, user } = get();
    if (!ws || !room || !user) return;
    set({ myOrder: null });
    ws.send(JSON.stringify({ type: 'rankmaster-return-to-lobby', roomCode: room.code, playerId: user.uid }));
  },

  leaveGame: () => {
    const { ws, room, user } = get();
    if (ws && room && user) {
      ws.send(JSON.stringify({ type: 'rankmaster-leave', roomCode: room.code, playerId: user.uid }));
      ws.close(1000, 'leave');
    }
    set({ user: null, room: null, phase: 'home', ws: null, myOrder: null });
  },

  setMyOrder: (order) => set({ myOrder: order }),

  addNotification: (msg) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(s => ({ notifications: [...s.notifications, { id, ...msg }] }));
    setTimeout(() => get().removeNotification(id), 4000);
  },

  removeNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}));
