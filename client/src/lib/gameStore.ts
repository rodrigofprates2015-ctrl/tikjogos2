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
  | "perguntasDiferentes"
  | "palavraComunidade";

export type PlayerVote = {
  playerId: string;
  playerName: string;
  targetId: string;
  targetName: string;
};

export type PlayerAnswer = {
  playerId: string;
  playerName: string;
  answer: string;
};

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
  votingStarted?: boolean;
  votesRevealed?: boolean;
  votes?: PlayerVote[];
  answers?: PlayerAnswer[];
  answersRevealed?: boolean;
  crewQuestionRevealed?: boolean;
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
  notifications: Array<{ id: string; type: 'player-left' | 'player-joined' | 'player-reconnected' | 'host-changed' | 'disconnected' | 'player-kicked' | 'player-removed'; message: string }>;
  enteredDuringGame: boolean;
  isDisconnected: boolean;
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
  startGame: (themeCode?: string) => Promise<void>;
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
  addNotification: (notification: { type: 'player-left' | 'player-joined' | 'player-reconnected' | 'host-changed' | 'disconnected' | 'player-kicked' | 'player-removed'; message: string }) => void;
  removeNotification: (id: string) => void;
  setDisconnected: (disconnected: boolean) => void;
  kickPlayer: (targetPlayerId: string) => void;
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
  isDisconnected: false,
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
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    let visibilityHandler: (() => void) | null = null;

    // Exponential backoff for reconnection: 1.5s, 3s, 5s, 8s, 13s...
    const getReconnectDelay = (attempt: number): number => {
      const delays = [1500, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000, 30000];
      return delays[Math.min(attempt, delays.length - 1)];
    };

    const sendSyncRequest = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: 'sync_request' }));
        console.log('[Sync] Sent sync_request to server');
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Max reconnect attempts reached');
        get().setDisconnected(true);
        get().addNotification({
          type: 'disconnected',
          message: 'Conexão perdida. Recarregue a página para reconectar.'
        });
        return;
      }
      
      const currentRoom = get().room;
      if (!currentRoom) return;
      
      reconnectAttempts++;
      const delay = getReconnectDelay(reconnectAttempts - 1);
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delay}ms...`);
      
      setTimeout(() => {
        get().connectWebSocket(currentRoom.code);
      }, delay);
    };

    // Handle tab visibility changes - send sync when tab becomes visible
    visibilityHandler = () => {
      if (document.visibilityState === 'visible' && newWs.readyState === WebSocket.OPEN) {
        console.log('[Visibility] Tab became visible, sending sync_request');
        sendSyncRequest();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    // Also sync when window regains focus
    const focusHandler = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        console.log('[Focus] Window regained focus, sending sync_request');
        sendSyncRequest();
      }
    };
    window.addEventListener('focus', focusHandler);

    // Send disconnect_notice when browser/tab is being closed (hard exit detection)
    // This notifies the server IMMEDIATELY so other players see the disconnect right away
    const sendDisconnectNotice = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        try {
          newWs.send(JSON.stringify({ type: 'disconnect_notice' }));
          console.log('[Disconnect] Sent disconnect_notice via WebSocket');
        } catch (e) {
          console.error('[Disconnect] Failed to send disconnect_notice:', e);
        }
      }
    };

    // sendBeacon with proper JSON content type for reliable delivery during page unload
    const sendDisconnectBeacon = () => {
      const currentUser = get().user;
      const currentRoom = get().room;
      if (currentUser && currentRoom && navigator.sendBeacon) {
        try {
          const blob = new Blob(
            [JSON.stringify({ playerId: currentUser.uid })],
            { type: 'application/json' }
          );
          const sent = navigator.sendBeacon(
            `/api/rooms/${currentRoom.code}/disconnect-notice`,
            blob
          );
          console.log('[Disconnect] Sent beacon disconnect notice, success:', sent);
        } catch (e) {
          console.error('[Disconnect] Failed to send beacon:', e);
        }
      }
    };

    // Track if we've already sent a disconnect to avoid duplicates
    let disconnectSent = false;
    
    // Combined handler that tries both methods for maximum reliability
    const handleDisconnect = (eventName: string) => {
      if (disconnectSent) {
        console.log(`[Disconnect] ${eventName}: Already sent disconnect, skipping`);
        return;
      }
      disconnectSent = true;
      console.log(`[Disconnect] ${eventName}: Sending disconnect via both methods`);
      
      // Try WebSocket first (fast but unreliable during unload)
      sendDisconnectNotice();
      
      // Also send via sendBeacon (reliable but slightly slower)
      sendDisconnectBeacon();
    };

    // beforeunload - fires when user closes tab/browser or navigates away
    const beforeUnloadHandler = () => {
      handleDisconnect('beforeunload');
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    // pagehide - more reliable on mobile and some browsers
    const pageHideHandler = (event: PageTransitionEvent) => {
      console.log('[Disconnect] pagehide triggered, persisted:', event.persisted);
      // Only send if page is NOT being cached (persisted = false means true unload)
      if (!event.persisted) {
        handleDisconnect('pagehide');
      }
    };
    window.addEventListener('pagehide', pageHideHandler);
    
    // unload - last resort fallback
    const unloadHandler = () => {
      handleDisconnect('unload');
    };
    window.addEventListener('unload', unloadHandler);

    newWs.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
      get().setDisconnected(false);
      newWs.send(JSON.stringify({ type: 'join-room', roomCode: code, playerId: user?.uid }));
      // Request current room state on connection
      sendSyncRequest();
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Respond to server ping with pong immediately
        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
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
        if (data.type === 'player-disconnected') {
          get().addNotification({
            type: 'player-reconnected',  // Using reconnected type as a connection status indicator
            message: `${data.playerName} desconectou temporariamente`
          });
        }
        if (data.type === 'player-reconnected') {
          get().addNotification({
            type: 'player-reconnected',
            message: `${data.playerName} reconectou`
          });
        }
        if (data.type === 'host-changed') {
          get().updateRoom(get().room!);
          get().addNotification({
            type: 'host-changed',
            message: `${data.newHostName} agora é o host da sala`
          });
        }
        if (data.type === 'player-kicked') {
          get().addNotification({
            type: 'player-kicked',
            message: `${data.playerName} foi expulso da sala`
          });
        }
        if (data.type === 'player-removed') {
          get().addNotification({
            type: 'player-removed',
            message: `${data.playerName} foi removido da sala (desconectado por muito tempo)`
          });
        }
        if (data.type === 'kicked') {
          // Current player was kicked from the room
          get().addNotification({
            type: 'player-kicked',
            message: data.message || 'Você foi expulso da sala pelo host'
          });
          // Leave the room and go back to home
          set({ 
            room: null, 
            ws: null, 
            status: 'home', 
            selectedMode: null 
          });
        }
        if (data.type === 'start-speaking-order-wheel') {
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
      // Close and trigger reconnect on error
      newWs.close();
    };

    newWs.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      
      // Cleanup event listeners
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
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

  updateRoom: (room: Room) => {
    console.log('updateRoom called with room status:', room.status);
    const currentUser = get().user;
    const currentRoom = get().room;
    if (!currentUser) {
      console.log('updateRoom: No current user, returning early');
      return;
    }

    // Validate hostId - ensure it points to an existing player
    // If hostId is invalid (player not in list), use first player as host
    const hostExists = room.players.some(p => p.uid === room.hostId);
    let validatedRoom = room;
    if (!hostExists && room.players.length > 0) {
      console.log('updateRoom: hostId is invalid, correcting to first player');
      validatedRoom = { ...room, hostId: room.players[0].uid };
    }

    const currentPlayer = validatedRoom.players.find(p => p.uid === currentUser.uid);
    const isWaitingForGame = currentPlayer?.waitingForGame === true;
    console.log('updateRoom: isWaitingForGame:', isWaitingForGame);

    let newStatus: GameStatus = 'lobby';
    let enteredDuringGame = false;
    let selectedMode = get().selectedMode;
    
    // If player is waiting for game to end, keep them in lobby
    if (isWaitingForGame && validatedRoom.status === 'playing') {
      console.log('updateRoom: Player is waiting for game to end, staying in lobby');
      newStatus = 'lobby';
    }
    // Check if player just entered a room that's already playing
    else if (validatedRoom.status === 'playing' && (!currentRoom || currentRoom.code !== validatedRoom.code)) {
      enteredDuringGame = true;
      newStatus = 'lobby';
    } else if (validatedRoom.status === 'playing') {
      newStatus = 'playing';
    }
    
    // Reset selectedMode when room is reset to waiting (Nova Rodada)
    if (validatedRoom.status === 'waiting') {
      selectedMode = null;
      console.log('updateRoom: Room reset to waiting, setting status to lobby');
    }

    console.log('updateRoom: Setting new status to:', newStatus);
    set({ 
      room: validatedRoom,
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

  startGame: async (themeCode?: string) => {
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
        // Add custom theme code if provided
        if (themeCode && themeCode.trim()) {
          requestBody.themeCode = themeCode.trim().toUpperCase();
        }
      }
      
      // If Palavra Comunidade, add the theme code
      if (selectedMode === 'palavraComunidade' && themeCode && themeCode.trim()) {
        requestBody.themeCode = themeCode.trim().toUpperCase();
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
      // Send intentional leave message before closing (hard exit)
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'leave' }));
          console.log('[Leave] Sent intentional leave message');
        } catch (e) {
          console.error('[Leave] Failed to send leave message:', e);
        }
      }
      ws.close();
    }
    
    set({
      status: 'home',
      room: null,
      ws: null,
      selectedMode: null,
    });
  },

  addNotification: (notification: { type: 'player-left' | 'player-joined' | 'player-reconnected' | 'host-changed' | 'disconnected' | 'player-kicked' | 'player-removed'; message: string }) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }]
    }));
    const timeout = notification.type === 'disconnected' ? 10000 : 4000;
    setTimeout(() => {
      get().removeNotification(id);
    }, timeout);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  kickPlayer: (targetPlayerId: string) => {
    const { room, ws, user } = get();
    if (!room || !user || !ws || ws.readyState !== WebSocket.OPEN) return;
    
    // Only host can kick
    if (room.hostId !== user.uid) return;
    
    // Cannot kick yourself
    if (targetPlayerId === user.uid) return;
    
    ws.send(JSON.stringify({
      type: 'kick-player',
      roomCode: room.code,
      targetPlayerId,
      requesterId: user.uid
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
  },

  setDisconnected: (disconnected: boolean) => {
    set({ isDisconnected: disconnected });
  }
}));
