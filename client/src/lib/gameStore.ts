import { create } from 'zustand';

export type Player = {
  uid: string;
  name: string;
};

export type GameStatus = 'home' | 'lobby' | 'modeSelect' | 'submodeSelect' | 'spinning' | 'playing';

export type GameModeType = 
  | "palavraSecreta"
  | "palavras" 
  | "duasFaccoes"
  | "categoriaItem"
  | "perguntasDiferentes";

export type GameData = {
  word?: string;
  location?: string;
  roles?: Record<string, string>;
  factions?: { A: string; B: string };
  factionMap?: Record<string, string>;
  category?: string;
  item?: string;
  question?: string;
  impostorQuestion?: string;
  questionRevealed?: boolean;
};

export type Room = {
  code: string;
  hostId: string;
  status: string;
  gameMode: GameModeType | null;
  currentCategory: string | null;
  currentWord: string | null;
  impostorId: string | null;
  gameData: GameData | null;
  players: Player[];
  createdAt: string;
};

export type GameMode = {
  id: string;
  title: string;
  desc: string;
  impostorGoal: string;
};

export type GameState = {
  user: Player | null;
  room: Room | null;
  status: GameStatus;
  isLoading: boolean;
  ws: WebSocket | null;
  gameModes: GameMode[];
  selectedMode: GameModeType | null;
  submodeSelect: boolean;
  notifications: Array<{ id: string; type: 'player-left' | 'host-changed'; message: string }>;
  enteredDuringGame: boolean;
  savedNickname: string | null;
  speakingOrder: string[] | null;
  showSpeakingOrderWheel: boolean;
  
  setUser: (name: string) => void;
  saveNickname: (name: string) => void;
  clearSavedNickname: () => void;
  loadSavedNickname: () => string | null;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  selectMode: (mode: GameModeType) => void;
  startGame: () => Promise<void>;
  returnToLobby: () => Promise<void>;
  leaveGame: () => void;
  goToModeSelect: () => void;
  backToLobby: () => void;
  connectWebSocket: (code: string) => void;
  updateRoom: (room: Room) => void;
  fetchGameModes: () => Promise<void>;
  revealQuestion: () => Promise<void>;
  setSpeakingOrder: (order: string[]) => void;
  setShowSpeakingOrderWheel: (show: boolean) => void;
  triggerSpeakingOrderWheel: () => void;
  addNotification: (notification: { type: 'player-left' | 'host-changed'; message: string }) => void;
  removeNotification: (id: string) => void;
};

function generateUID(): string {
  return 'user-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  room: null,
  status: 'home',
  isLoading: false,
  ws: null,
  gameModes: [],
  selectedMode: null,
  submodeSelect: false,
  notifications: [],
  enteredDuringGame: false,
  savedNickname: null,
  speakingOrder: null,
  showSpeakingOrderWheel: false,

  setUser: (name: string) => {
    const uid = generateUID();
    set({ user: { uid, name } });
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

  fetchGameModes: async () => {
    try {
      const response = await fetch('/api/game-modes');
      if (response.ok) {
        const modes = await response.json();
        set({ gameModes: modes });
      }
    } catch (error) {
      console.error('Error fetching game modes:', error);
    }
  },

  selectMode: (mode: GameModeType) => {
    set({ selectedMode: mode });
    
    // If Palavra Secreta, show submode selection first
    if (mode === 'palavraSecreta') {
      set({ status: 'submodeSelect' });
    }
    // Note: status stays at 'modeSelect' - only changes to 'playing' when game actually starts via WebSocket
  },

  goToModeSelect: () => {
    set({ status: 'modeSelect' });
    get().fetchGameModes();
  },

  backToLobby: () => {
    const { user, room, ws } = get();
    set({ status: 'lobby', selectedMode: null, submodeSelect: false });
    
    // If host, broadcast to all players
    if (room && user && room.hostId === user.uid && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ 
        type: 'host-back-to-lobby',
        roomCode: room.code
      }));
    }
  },

  connectWebSocket: (code: string) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    const user = get().user;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/game-ws`);

    newWs.onopen = () => {
      newWs.send(JSON.stringify({ type: 'join-room', roomCode: code, playerId: user?.uid }));
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'room-update' && data.room) {
          get().updateRoom(data.room);
        }
        if (data.type === 'player-left') {
          get().addNotification({
            type: 'player-left',
            message: `${data.playerName} saiu da sala`
          });
        }
        if (data.type === 'host-changed') {
          get().updateRoom(get().room!);
          get().addNotification({
            type: 'host-changed',
            message: `${data.newHostName} agora é o host da sala`
          });
        }
        if (data.type === 'start-speaking-order-wheel') {
          // Store the server-generated speaking order so all clients show the same result
          if (data.speakingOrder) {
            set({ speakingOrder: data.speakingOrder });
          }
          get().setShowSpeakingOrderWheel(true);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    set({ ws: newWs });
  },

  updateRoom: (room: Room) => {
    const currentUser = get().user;
    const currentRoom = get().room;
    if (!currentUser) return;

    let newStatus: GameStatus = 'lobby';
    let enteredDuringGame = false;
    let selectedMode = get().selectedMode;
    
    // Check if player just entered a room that's already playing
    if (room.status === 'playing' && (!currentRoom || currentRoom.code !== room.code)) {
      enteredDuringGame = true;
      newStatus = 'lobby';
    } else if (room.status === 'playing') {
      newStatus = 'playing';
    }
    
    // Reset selectedMode when room is reset to waiting (Nova Rodada)
    if (room.status === 'waiting') {
      selectedMode = null;
    }

    set({ 
      room,
      status: newStatus,
      enteredDuringGame,
      selectedMode,
    });
  },

  createRoom: async () => {
    const { user } = get();
    if (!user) return;

    set({ isLoading: true });

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.uid,
          hostName: user.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to create room');

      const room: Room = await response.json();
      
      set({ 
        room,
        status: 'lobby',
        isLoading: false 
      });

      get().connectWebSocket(room.code);

    } catch (error) {
      console.error('Error creating room:', error);
      set({ isLoading: false });
    }
  },

  joinRoom: async (code: string) => {
    const { user } = get();
    if (!user) return false;

    set({ isLoading: true });

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          playerId: user.uid,
          playerName: user.name,
        }),
      });

      if (!response.ok) {
        set({ isLoading: false });
        return false;
      }

      const room: Room = await response.json();
      
      set({ 
        room,
        status: 'lobby',
        isLoading: false 
      });

      get().connectWebSocket(room.code);
      return true;

    } catch (error) {
      console.error('Error joining room:', error);
      set({ isLoading: false });
      return false;
    }
  },

  startGame: async () => {
    const { room, selectedMode } = get();
    if (!room || !selectedMode) return;

    try {
      const requestBody: any = { gameMode: selectedMode };
      
      // If Palavra Secreta, add the selected submode
      if (selectedMode === 'palavraSecreta') {
        const submode = localStorage.getItem('selectedSubmode');
        if (submode) {
          requestBody.selectedSubmode = submode;
        }
      }

      const response = await fetch(`/api/rooms/${room.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to start game');

    } catch (error) {
      console.error('Error starting game:', error);
    }
  },

  returnToLobby: async () => {
    const { room } = get();
    if (!room) return;

    try {
      const response = await fetch(`/api/rooms/${room.code}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to reset room');
      
      set({ selectedMode: null });

    } catch (error) {
      console.error('Error resetting room:', error);
    }
  },

  leaveGame: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
    }
    
    set({
      status: 'home',
      room: null,
      ws: null,
      selectedMode: null,
    });
  },

  addNotification: (notification: { type: 'player-left' | 'host-changed'; message: string }) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }]
    }));
    setTimeout(() => {
      get().removeNotification(id);
    }, 4000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  revealQuestion: async () => {
    const { room } = get();
    if (!room) return;

    try {
      const response = await fetch(`/api/rooms/${room.code}/reveal-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to reveal question');

    } catch (error) {
      console.error('Error revealing question:', error);
    }
  },

  setSpeakingOrder: (order: string[]) => {
    set({ speakingOrder: order });
  },

  setShowSpeakingOrderWheel: (show: boolean) => {
    set({ showSpeakingOrderWheel: show });
  },

  triggerSpeakingOrderWheel: () => {
    const { room, ws, user } = get();
    if (!room || !user || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    // Only host can trigger
    if (room.hostId !== user.uid) return;
    
    // Send message to server to broadcast to all players
    ws.send(JSON.stringify({
      type: 'trigger-speaking-order',
      roomCode: room.code
    }));
  }
}));
