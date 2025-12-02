import { create } from 'zustand';

export type Player = {
  uid: string;
  name: string;
  waitingForGame?: boolean;
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
  leaveCurrentGame: () => Promise<void>;
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
        console.log('WebSocket message received:', data.type);
        if (data.type === 'room-update' && data.room) {
          console.log('WebSocket room-update, room status:', data.room.status);
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
    console.log('updateRoom called with room status:', room.status);
    const currentUser = get().user;
    const currentRoom = get().room;
    if (!currentUser) {
      console.log('updateRoom: No current user, returning early');
      return;
    }

    const currentPlayer = room.players.find(p => p.uid === currentUser.uid);
    const isWaitingForGame = currentPlayer?.waitingForGame === true;
    console.log('updateRoom: isWaitingForGame:', isWaitingForGame);

    let newStatus: GameStatus = 'lobby';
    let enteredDuringGame = false;
    let selectedMode = get().selectedMode;
    
    // If player is waiting for game to end, keep them in lobby
    if (isWaitingForGame && room.status === 'playing') {
      console.log('updateRoom: Player is waiting for game to end, staying in lobby');
      newStatus = 'lobby';
    }
    // Check if player just entered a room that's already playing
    else if (room.status === 'playing' && (!currentRoom || currentRoom.code !== room.code)) {
      enteredDuringGame = true;
      newStatus = 'lobby';
    } else if (room.status === 'playing') {
      newStatus = 'playing';
    }
    
    // Reset selectedMode when room is reset to waiting (Nova Rodada)
    if (room.status === 'waiting') {
      selectedMode = null;
      console.log('updateRoom: Room reset to waiting, setting status to lobby');
    }

    console.log('updateRoom: Setting new status to:', newStatus);
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
    const { room, user } = get();
    console.log('returnToLobby called, room:', room?.code, 'user:', user?.uid);
    if (!room || !user) {
      console.log('returnToLobby: No room or user found, returning early');
      return;
    }

    const isHost = room.hostId === user.uid;
    console.log('returnToLobby: isHost:', isHost);

    if (isHost) {
      try {
        console.log('returnToLobby: Host - Making POST request to reset room', room.code);
        const response = await fetch(`/api/rooms/${room.code}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('returnToLobby: Response status', response.status);
        if (!response.ok) throw new Error('Failed to reset room');
        
        const updatedRoom = await response.json();
        console.log('returnToLobby: Got updated room, status:', updatedRoom?.status);
        
        set({ 
          selectedMode: null,
          status: 'lobby',
          room: updatedRoom
        });
        console.log('returnToLobby: Successfully reset room and status to lobby');

      } catch (error) {
        console.error('Error resetting room:', error);
      }
    } else {
      await get().leaveCurrentGame();
    }
  },

  leaveCurrentGame: async () => {
    const { room, user } = get();
    console.log('leaveCurrentGame called, room:', room?.code, 'user:', user?.uid);
    if (!room || !user) {
      console.log('leaveCurrentGame: No room or user found, returning early');
      return;
    }

    try {
      console.log('leaveCurrentGame: Making POST request to leave game', room.code);
      const response = await fetch(`/api/rooms/${room.code}/leave-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.uid }),
      });

      console.log('leaveCurrentGame: Response status', response.status);
      if (!response.ok) throw new Error('Failed to leave game');
      
      const updatedRoom = await response.json();
      console.log('leaveCurrentGame: Got updated room', updatedRoom);
      
      set({ 
        selectedMode: null,
        status: 'lobby',
        room: updatedRoom
      });
      console.log('leaveCurrentGame: Successfully left game and returned to lobby');

    } catch (error) {
      console.error('Error leaving game:', error);
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
