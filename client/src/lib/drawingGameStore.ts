import { create } from 'zustand';

export type DrawingPlayer = {
  uid: string;
  name: string;
  connected?: boolean;
};

export type DrawingStroke = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
};

export type DrawingPlayerVote = {
  playerId: string;
  playerName: string;
  targetId: string;
  targetName: string;
};

export type DrawingGamePhase =
  | 'home'
  | 'lobby'
  | 'themeSelect'   // host picks a theme
  | 'sorting'       // roulette animation: impostor reveal + drawing order
  | 'playing'       // drawing phase
  | 'roundEnd'      // all players drew — host decides: another round or discussion
  | 'discussion'    // after drawing, before voting
  | 'voting'
  | 'result';

export type DrawingGameData = {
  word?: string;
  impostorIds?: string[];
  drawingOrder?: string[];       // uid order for drawing turns
  currentDrawerIndex?: number;
  currentDrawerId?: string;
  turnTimeLimit?: number;        // seconds per turn
  canvasSnapshot?: string;       // base64 of canvas state between turns
  votes?: DrawingPlayerVote[];
  votingStarted?: boolean;
  votesRevealed?: boolean;
};

export type DrawingRoom = {
  code: string;
  hostId: string;
  status: string;
  gameData: DrawingGameData | null;
  players: DrawingPlayer[];
  createdAt: string;
};

export type DrawingGameState = {
  user: DrawingPlayer | null;
  room: DrawingRoom | null;
  phase: DrawingGamePhase;
  isLoading: boolean;
  ws: WebSocket | null;
  notifications: Array<{ id: string; type: string; message: string }>;
  isDisconnected: boolean;

  // Drawing state (local)
  strokes: DrawingStroke[];           // all accumulated strokes
  currentTurnStrokes: DrawingStroke[]; // strokes from current drawer only (for spectators)

  setUser: (name: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<boolean>;
  connectWebSocket: (code: string) => void;
  updateRoom: (room: DrawingRoom) => void;
  goToThemeSelect: () => void;
  startGame: (config?: { turnTimeLimit?: number; theme?: string }) => Promise<void>;
  startDrawing: () => Promise<void>;
  completeTurn: () => Promise<void>;
  requestNewRound: () => Promise<void>;
  goToDiscussion: () => Promise<void>;
  submitVote: (targetId: string) => Promise<void>;
  revealVotes: () => Promise<void>;
  returnToLobby: () => Promise<void>;
  leaveGame: () => void;
  addStroke: (stroke: DrawingStroke) => void;
  sendStroke: (stroke: DrawingStroke) => void;
  undoStroke: () => void;
  sendUndo: () => void;
  clearStrokes: () => void;
  addNotification: (notification: { type: string; message: string }) => void;
  removeNotification: (id: string) => void;
  setDisconnected: (disconnected: boolean) => void;
};

function generateUID(): string {
  return 'draw-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export const useDrawingGameStore = create<DrawingGameState>((set, get) => ({
  user: null,
  room: null,
  phase: 'home',
  isLoading: false,
  ws: null,
  notifications: [],
  isDisconnected: false,
  strokes: [],
  currentTurnStrokes: [],

  setUser: (name: string) => {
    const uid = generateUID();
    set({ user: { uid, name } });
  },

  createRoom: async () => {
    const { user } = get();
    if (!user) return;
    set({ isLoading: true });

    try {
      const response = await fetch('/api/drawing-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: user.uid, playerName: user.name }),
      });

      if (!response.ok) throw new Error('Failed to create room');
      const room = await response.json();
      set({ room, phase: 'lobby' });
      get().connectWebSocket(room.code);
    } catch (error) {
      console.error('Error creating drawing room:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  joinRoom: async (code: string) => {
    const { user } = get();
    if (!user) return false;
    set({ isLoading: true });

    try {
      const response = await fetch(`/api/drawing-rooms/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: user.uid, playerName: user.name }),
      });

      if (!response.ok) return false;
      const room = await response.json();
      set({ room, phase: 'lobby' });
      get().connectWebSocket(room.code);
      return true;
    } catch (error) {
      console.error('Error joining drawing room:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  connectWebSocket: (code: string) => {
    const existingWs = get().ws;
    if (existingWs && existingWs.readyState === WebSocket.OPEN) {
      existingWs.close();
    }

    const user = get().user;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newWs = new WebSocket(`${protocol}//${window.location.host}/drawing-ws`);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;

    const getReconnectDelay = (attempt: number): number => {
      const delays = [1500, 3000, 5000, 8000, 13000, 21000, 30000];
      return delays[Math.min(attempt, delays.length - 1)];
    };

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        get().setDisconnected(true);
        get().addNotification({ type: 'disconnected', message: 'Conexão perdida. Recarregue a página.' });
        return;
      }
      const currentRoom = get().room;
      if (!currentRoom) return;
      reconnectAttempts++;
      const delay = getReconnectDelay(reconnectAttempts - 1);
      setTimeout(() => get().connectWebSocket(currentRoom.code), delay);
    };

    newWs.onopen = () => {
      reconnectAttempts = 0;
      get().setDisconnected(false);
      newWs.send(JSON.stringify({ type: 'join-drawing-room', roomCode: code, playerId: user?.uid }));
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
          newWs.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (data.type === 'drawing-room-update' && data.room) {
          get().updateRoom(data.room);
        }

        if (data.type === 'draw-stroke' && data.stroke) {
          // Received a stroke from another player — add to display
          set((state) => ({
            strokes: [...state.strokes, data.stroke],
            currentTurnStrokes: [...state.currentTurnStrokes, data.stroke],
          }));
        }

        if (data.type === 'draw-undo') {
          // Another player undid their last stroke
          set((state) => ({
            strokes: state.strokes.slice(0, -1),
            currentTurnStrokes: state.currentTurnStrokes.slice(0, -1),
          }));
        }

        if (data.type === 'drawing-turn-start') {
          // New turn started — clear current turn strokes, load snapshot if any
          set({ currentTurnStrokes: [] });
          if (data.canvasSnapshot) {
            // Snapshot will be handled by the canvas component
          }
        }

        if (data.type === 'drawing-round-end') {
          set({ phase: 'roundEnd' });
        }

        if (data.type === 'drawing-phase-end') {
          set({ phase: 'discussion' });
        }

        if (data.type === 'player-joined') {
          get().addNotification({ type: 'player-joined', message: `${data.playerName} entrou na sala` });
        }

        if (data.type === 'player-left') {
          get().addNotification({ type: 'player-left', message: `${data.playerName} saiu da sala` });
        }

        if (data.type === 'kicked') {
          get().addNotification({ type: 'kicked', message: 'Você foi expulso da sala' });
          set({ room: null, ws: null, phase: 'home' });
        }

      } catch (error) {
        console.error('Drawing WS message error:', error);
      }
    };

    newWs.onerror = () => newWs.close();

    newWs.onclose = (event) => {
      const currentRoom = get().room;
      if (currentRoom && event.code !== 1000) {
        attemptReconnect();
      }
    };

    // Disconnect notice on page unload
    const beforeUnloadHandler = () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: 'disconnect_notice' }));
      }
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);

    set({ ws: newWs });
  },

  updateRoom: (room: DrawingRoom) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const prevPhase = get().phase;

    // Determine phase from room status
    let phase: DrawingGamePhase = prevPhase;
    if (room.status === 'waiting') phase = 'lobby';
    else if (room.status === 'sorting') phase = 'sorting';
    else if (room.status === 'drawing') phase = 'playing';
    else if (room.status === 'roundEnd') phase = 'roundEnd';
    else if (room.status === 'discussion') phase = 'discussion';
    else if (room.status === 'voting') phase = 'voting';
    else if (room.status === 'result') phase = 'result';

    // Clear canvas when returning to lobby (new game) so all clients start fresh
    if (room.status === 'waiting' && prevPhase !== 'lobby') {
      set({ room, phase, strokes: [], currentTurnStrokes: [] });
    } else {
      set({ room, phase });
    }
  },

  goToThemeSelect: () => {
    set({ phase: 'themeSelect' });
  },

  startGame: async (config) => {
    const { room } = get();
    if (!room) return;

    try {
      const response = await fetch(`/api/drawing-rooms/${room.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnTimeLimit: config?.turnTimeLimit || 30,
          theme: config?.theme || 'classico',
        }),
      });
      if (!response.ok) throw new Error('Failed to start drawing game');
    } catch (error) {
      console.error('Error starting drawing game:', error);
    }
  },

  startDrawing: async () => {
    const { room } = get();
    if (!room) return;
    try {
      await fetch(`/api/drawing-rooms/${room.code}/start-drawing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error starting drawing phase:', error);
    }
  },

  completeTurn: async () => {
    const { room, user, ws } = get();
    if (!room || !user || !ws || ws.readyState !== WebSocket.OPEN) return;

    // Send canvas snapshot as base64 for the next player
    ws.send(JSON.stringify({
      type: 'drawing-turn-complete',
      roomCode: room.code,
      playerId: user.uid,
    }));
  },

  requestNewRound: async () => {
    const { room } = get();
    if (!room) return;
    try {
      await fetch(`/api/drawing-rooms/${room.code}/new-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error requesting new round:', error);
    }
  },

  goToDiscussion: async () => {
    const { room } = get();
    if (!room) return;
    try {
      await fetch(`/api/drawing-rooms/${room.code}/go-to-discussion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error going to discussion:', error);
    }
  },

  submitVote: async (targetId: string) => {
    const { room, user } = get();
    if (!room || !user) return;

    const targetPlayer = room.players.find(p => p.uid === targetId);
    if (!targetPlayer) return;

    try {
      await fetch(`/api/drawing-rooms/${room.code}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.uid,
          playerName: user.name,
          targetId,
          targetName: targetPlayer.name,
        }),
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  },

  revealVotes: async () => {
    const { room } = get();
    if (!room) return;

    try {
      await fetch(`/api/drawing-rooms/${room.code}/reveal-votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  },

  returnToLobby: async () => {
    const { room } = get();
    if (!room) return;

    try {
      await fetch(`/api/drawing-rooms/${room.code}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      set({ strokes: [], currentTurnStrokes: [] });
    } catch (error) {
      console.error('Error returning to lobby:', error);
    }
  },

  leaveGame: () => {
    const ws = get().ws;
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave' }));
      }
      ws.close();
    }
    set({ phase: 'home', room: null, ws: null, strokes: [], currentTurnStrokes: [] });
  },

  addStroke: (stroke: DrawingStroke) => {
    set((state) => ({
      strokes: [...state.strokes, stroke],
      currentTurnStrokes: [...state.currentTurnStrokes, stroke],
    }));
  },

  sendStroke: (stroke: DrawingStroke) => {
    const { room, ws } = get();
    if (!room || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'draw-stroke',
      roomCode: room.code,
      stroke,
    }));
  },

  undoStroke: () => {
    set((state) => ({
      strokes: state.strokes.slice(0, -1),
      currentTurnStrokes: state.currentTurnStrokes.slice(0, -1),
    }));
  },

  sendUndo: () => {
    const { room, ws } = get();
    if (!room || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'draw-undo',
      roomCode: room.code,
    }));
  },

  clearStrokes: () => {
    set({ strokes: [], currentTurnStrokes: [] });
  },

  addNotification: (notification) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }],
    }));
    setTimeout(() => get().removeNotification(id), 4000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  setDisconnected: (disconnected: boolean) => {
    set({ isDisconnected: disconnected });
  },
}));
