import { create } from 'zustand';

export type DesafioPlayer = {
  uid: string;
  name: string;
  connected?: boolean;
  vidas?: number;
  ordem?: number;
};

export type DesafioLastAction = {
  type: 'desafio' | 'inserir';
  desafianteId?: string;
  desafiadoId?: string;
  resultado?: boolean;
  letra?: string;
  playerName?: string;
};

export type DesafioGameData = {
  currentWord?: string;
  vidasMap?: Record<string, number>;
  turnIndex?: number;
  wordStatus?: 'aguardando' | 'jogando' | 'defendendo' | 'fim_de_jogo';
  lastAction?: DesafioLastAction;
  vencedorId?: string;
  vencedorName?: string;
};

export type DesafioRoom = {
  code: string;
  hostId: string;
  status: string;
  gameMode: string | null;
  gameData: DesafioGameData | null;
  players: DesafioPlayer[];
  createdAt: string;
};

export type DesafioStatus = 'home' | 'lobby' | 'playing' | 'defendendo';

export type DesafioNotification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
};

export type DesafioState = {
  user: DesafioPlayer | null;
  room: DesafioRoom | null;
  status: DesafioStatus;
  isLoading: boolean;
  ws: WebSocket | null;
  isDisconnected: boolean;
  savedNickname: string | null;
  notifications: DesafioNotification[];
  defenseInput: string;

  // Actions
  setUser: (name: string) => void;
  saveNickname: (name: string) => void;
  loadSavedNickname: () => string | null;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  startGame: () => Promise<void>;
  returnToLobby: () => Promise<void>;
  leaveGame: () => void;
  connectWebSocket: (code: string) => void;
  updateRoom: (room: DesafioRoom) => void;
  addNotification: (n: Omit<DesafioNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setDisconnected: (v: boolean) => void;
  setDefenseInput: (v: string) => void;

  // Game actions (send via WebSocket)
  inserirLetra: (letra: string) => void;
  desafiar: () => void;
  defender: (palavra: string) => void;
};

function generateUID(): string {
  return 'dp-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useDesafioStore = create<DesafioState>((set, get) => ({
  user: null,
  room: null,
  status: 'home',
  isLoading: false,
  ws: null,
  isDisconnected: false,
  savedNickname: null,
  notifications: [],
  defenseInput: '',

  setUser: (name: string) => {
    const uid = generateUID();
    set({ user: { uid, name } });
  },

  saveNickname: (name: string) => {
    if (name.trim()) {
      localStorage.setItem('desafio_saved_nickname', name);
      set({ savedNickname: name });
    }
  },

  loadSavedNickname: () => {
    const saved = localStorage.getItem('desafio_saved_nickname');
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
      const res = await fetch('/api/desafio/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.uid, hostName: user.name }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const room: DesafioRoom = await res.json();
      set({ room, status: 'lobby', isLoading: false });
      get().connectWebSocket(room.code);
    } catch (e) {
      console.error('[Desafio] createRoom error:', e);
      set({ isLoading: false });
    }
  },

  joinRoom: async (code: string) => {
    const { user } = get();
    if (!user) return false;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/desafio/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), playerId: user.uid, playerName: user.name }),
      });
      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }
      const room: DesafioRoom = await res.json();
      set({ room, status: 'lobby', isLoading: false });
      get().connectWebSocket(room.code);
      return true;
    } catch (e) {
      console.error('[Desafio] joinRoom error:', e);
      set({ isLoading: false });
      return false;
    }
  },

  startGame: async () => {
    const { room } = get();
    if (!room) return;
    try {
      const res = await fetch(`/api/desafio/rooms/${room.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start game');
    } catch (e) {
      console.error('[Desafio] startGame error:', e);
    }
  },

  returnToLobby: async () => {
    const { room, user } = get();
    if (!room || !user) return;
    if (room.hostId !== user.uid) {
      set({ status: 'lobby' });
      return;
    }
    try {
      const res = await fetch(`/api/desafio/rooms/${room.code}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to reset');
      const updated: DesafioRoom = await res.json();
      set({ room: updated, status: 'lobby' });
    } catch (e) {
      console.error('[Desafio] returnToLobby error:', e);
    }
  },

  leaveGame: () => {
    const { ws, room, user } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'desafio-leave',
          roomCode: room?.code,
          playerId: user?.uid,
        }));
      } catch {}
      ws.close();
    }
    set({ status: 'home', room: null, ws: null });
  },

  connectWebSocket: (code: string) => {
    const existing = get().ws;
    if (existing && existing.readyState === WebSocket.OPEN) existing.close();

    const user = get().user;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/game-ws`);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const delays = [1500, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000, 30000];

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        get().setDisconnected(true);
        return;
      }
      const currentRoom = get().room;
      if (!currentRoom) return;
      reconnectAttempts++;
      setTimeout(() => get().connectWebSocket(currentRoom.code), delays[reconnectAttempts - 1]);
    };

    // Disconnect beacon on page unload
    let disconnectSent = false;
    const sendBeacon = () => {
      if (disconnectSent) return;
      disconnectSent = true;
      const u = get().user;
      const r = get().room;
      if (u && r && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ playerId: u.uid })], { type: 'application/json' });
        navigator.sendBeacon(`/api/desafio/rooms/${r.code}/disconnect-notice`, blob);
      }
    };
    window.addEventListener('beforeunload', sendBeacon);
    window.addEventListener('pagehide', sendBeacon);

    newWs.onopen = () => {
      reconnectAttempts = 0;
      get().setDisconnected(false);
      newWs.send(JSON.stringify({ type: 'join-room', roomCode: code, playerId: user?.uid }));
      newWs.send(JSON.stringify({ type: 'sync_request' }));
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        if (data.type === 'room-update' && data.room) {
          // Only handle rooms for this game mode
          if (data.room.gameMode === 'desafioPalavra') {
            get().updateRoom(data.room);
          }
        }
        if (data.type === 'player-disconnected') {
          get().addNotification({ type: 'warning', message: `${data.playerName} desconectou temporariamente` });
        }
        if (data.type === 'player-reconnected') {
          get().addNotification({ type: 'success', message: `${data.playerName} reconectou` });
        }
        if (data.type === 'player-removed') {
          get().addNotification({ type: 'info', message: `${data.playerName} saiu da sala` });
        }
        if (data.type === 'host-changed') {
          get().addNotification({ type: 'info', message: `${data.newHostName} agora é o host` });
        }
        if (data.type === 'kicked') {
          get().addNotification({ type: 'error', message: 'Você foi expulso da sala' });
          set({ status: 'home', room: null, ws: null });
        }
      } catch {}
    };

    newWs.onerror = () => newWs.close();

    newWs.onclose = (event) => {
      window.removeEventListener('beforeunload', sendBeacon);
      window.removeEventListener('pagehide', sendBeacon);
      const currentRoom = get().room;
      if (currentRoom && event.code !== 1000) attemptReconnect();
    };

    set({ ws: newWs });
  },

  updateRoom: (room: DesafioRoom) => {
    const { user } = get();
    if (!user) return;

    let newStatus: DesafioStatus = 'lobby';
    const gd = room.gameData;

    if (room.status === 'playing') {
      if (gd?.wordStatus === 'defendendo') {
        newStatus = 'defendendo';
      } else {
        newStatus = 'playing';
      }
    } else if (room.status === 'waiting') {
      newStatus = 'lobby';
    }

    // If game just ended (fim_de_jogo), show result briefly then go to lobby
    if (gd?.wordStatus === 'fim_de_jogo') {
      newStatus = 'playing'; // GameScreen handles the end state display
    }

    set({ room, status: newStatus });
  },

  addNotification: (n) => {
    const id = Date.now().toString() + Math.random();
    set(state => ({ notifications: [...state.notifications, { id, ...n }] }));
    setTimeout(() => get().removeNotification(id), 4000);
  },

  removeNotification: (id) => {
    set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
  },

  setDisconnected: (v) => set({ isDisconnected: v }),

  setDefenseInput: (v) => set({ defenseInput: v }),

  inserirLetra: (letra: string) => {
    const { ws, room, user } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN || !room || !user) return;
    ws.send(JSON.stringify({
      type: 'desafio-inserir-letra',
      roomCode: room.code,
      playerId: user.uid,
      letra,
    }));
  },

  desafiar: () => {
    const { ws, room, user } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN || !room || !user) return;
    ws.send(JSON.stringify({
      type: 'desafio-desafiar',
      roomCode: room.code,
      desafianteId: user.uid,
    }));
  },

  defender: (palavra: string) => {
    const { ws, room, user } = get();
    if (!ws || ws.readyState !== WebSocket.OPEN || !room || !user) return;
    ws.send(JSON.stringify({
      type: 'desafio-defender',
      roomCode: room.code,
      playerId: user.uid,
      palavra,
    }));
    set({ defenseInput: '' });
  },

}));
