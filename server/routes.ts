import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage, type Room } from "./storage";
import { type Player, type GameModeType, type GameData } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import { setupAuth, isAuthenticated } from "./githubAuth";

const GAME_MODES = {
  palavraSecreta: {
    title: "Palavra Secreta",
    desc: "Uma palavra para todos. O Impostor tenta adivinhar!",
    impostorGoal: "Tente descobrir a palavra.",
    data: ["Abacaxi", "Escada", "Relógio", "Espelho", "Avião", "Chocolate", "Montanha", "Leão", "Garfo", "Almofada", "Tinta", "Janela", "Satélite", "Microscópio", "Castelo"]
  },
  palavras: {
    title: "Locais & Funções",
    desc: "Cada um recebe um Local e uma Função. O Impostor não sabe o local.",
    impostorGoal: "Descubra o local.",
    locais: ["Hospital", "Praia", "Zoológico", "Escola", "Shopping", "Prisão", "Estádio", "Cinema", "Delegacia", "Fazenda", "Restaurante", "Aeroporto", "Biblioteca", "Museu", "Parque de diversões"],
    funcoes: ["Médico", "Paciente", "Segurança", "Faxineiro", "Chef", "Vendedor", "Piloto", "Passageiro", "Professor", "Aluno", "Detetive", "Presidiário", "Biólogo", "Bombeiro", "Turista"]
  },
  duasFaccoes: {
    title: "Duas Facções",
    desc: "Dois times com palavras diferentes. O Impostor não sabe nenhuma.",
    impostorGoal: "Descubra qual palavra é a certa.",
    pares: [
      ["Café", "Chá"], ["Cachorro", "Lobo"], ["Praia", "Piscina"], ["Sorvete", "Milkshake"], ["Carro", "Moto"],
      ["Notebook", "Tablet"], ["Laranja", "Mexerica"], ["Tubarão", "Golfinho"], ["Montanha", "Colina"], ["Pizza", "Lasanha"]
    ]
  },
  categoriaItem: {
    title: "Categoria + Item",
    desc: "Todos sabem a categoria e o item. O Impostor só sabe a categoria.",
    impostorGoal: "Descubra o item específico.",
    categorias: {
      "Animais": ["Gato", "Elefante", "Coruja", "Tubarão", "Pinguim"],
      "Frutas": ["Banana", "Manga", "Uva", "Melancia", "Limão"],
      "Objetos": ["Tesoura", "Mochila", "Vela", "Guarda-chuva", "Chave inglesa"],
      "Comidas": ["Sushi", "Pastel", "Feijoada", "Hambúrguer", "Panqueca"],
      "Profissões": ["Astronauta", "Garçom", "Dentista", "Mecânico", "Barbeiro"]
    }
  },
  perguntasDiferentes: {
    title: "Perguntas Diferentes",
    desc: "Tripulantes e Impostor recebem perguntas parecidas, mas diferentes.",
    impostorGoal: "Aja naturalmente, sua pergunta é diferente!",
    perguntas: [
      { crew: "Qual seu personagem favorito de anime?", imp: "Qual personagem de anime você acha o mais apelão?" },
      { crew: "Qual anime você já recomendou para outras pessoas?", imp: "Qual anime você acha superestimado?" },
      { crew: "Qual é o melhor vilão de anime?", imp: "Qual vilão você acha mais mal escrito?" },
      { crew: "Qual anime tem a melhor trilha sonora?", imp: "Qual anime tem a pior trilha sonora?" },
      { crew: "Qual é seu jogo favorito de todos os tempos?", imp: "Qual jogo você acha o mais injusto?" },
      { crew: "Qual personagem de jogo você mais gosta?", imp: "Qual personagem de jogo você acha irritante?" },
      { crew: "Qual franquia de games mais te marcou?", imp: "Qual franquia você acha que já deveria ter acabado?" },
      { crew: "Qual foi o último jogo que você zerou?", imp: "Qual jogo você abandonou antes de terminar?" },
      { crew: "Qual seu filme favorito?", imp: "Qual filme você acha superestimado?" },
      { crew: "Qual série você maratonou recentemente?", imp: "Qual série você desistiu de assistir?" },
      { crew: "Qual ator você mais gosta?", imp: "Qual ator você acha mais overrated?" },
      { crew: "Qual é seu prato favorito?", imp: "Qual prato você acha sem graça?" },
      { crew: "Qual comida você comeria todo dia?", imp: "Qual comida você jamais comeria todo dia?" },
      { crew: "Qual doce você mais gosta?", imp: "Qual doce você acha enjoativo?" },
      { crew: "Qual lugar você mais gosta de visitar?", imp: "Qual lugar você evitaria visitar?" },
      { crew: "Qual hobby você adora?", imp: "Qual hobby você acha chato?" },
      { crew: "Qual é o melhor presente que você já ganhou?", imp: "Qual é o pior presente que você já recebeu?" },
      { crew: "Qual artista você mais escuta?", imp: "Qual artista você acha superestimado?" },
      { crew: "Qual show você adoraria ir?", imp: "Qual show você nunca iria?" }
    ]
  }
};

function generateRoomCode(): string {
  return randomBytes(2).toString('hex').toUpperCase().substring(0, 4);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Submode words for Palavra Secreta
const PALAVRA_SECRETA_SUBMODES_DATA: Record<string, string[]> = {
  classico: ['Sol', 'Carro', 'Casa', 'Cachorro', 'Computador', 'Montanha', 'Pizza', 'Escola', 'Roupa', 'Avião', 'Janela', 'Telefone', 'Bola', 'Relógio', 'Flor', 'Gelo', 'Música', 'Prédio', 'Caminhão', 'Praia'],
  clashRoyale: ['Mago', 'Príncipe', 'Mosqueteira', 'Gigante', 'Arqueiras', 'Corredor', 'P.E.K.K.A', 'Golem', 'Dragão Bebê', 'Bruxa', 'Mineiro', 'Cavaleiro', 'Barril de Goblins', 'Tronco', 'Tesla', 'Lava Hound', 'Lenhador', 'Fantasma Real', 'Mago de Gelo', 'Executor'],
  animes: ['Goku', 'Naruto', 'Luffy', 'Tanjiro', 'Mikasa', 'Saitama', 'Sasuke', 'Deku', 'Gojo', 'Ichigo', 'Sharingan', 'Bankai', 'Kamehameha', 'Rasengan', 'Titan', 'Shinigami', 'Chakra', 'Espada Nichirin', 'Akatsuki', 'Grimório'],
  marvel: ['Homem-Aranha', 'Thor', 'Hulk', 'Capitão América', 'Homem de Ferro', 'Viúva Negra', 'Pantera Negra', 'Doutor Estranho', 'Thanos', 'Loki', 'Ultron', 'Groot', 'Rocket', 'Wanda', 'Visão', 'Escudo', 'Mjölnir', 'Joia do Infinito', 'Hydra', 'Vibranium'],
  strangerThings: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers']
};

function setupGameMode(mode: GameModeType, players: Player[], impostorId: string, selectedSubmode?: string): GameData {
  switch (mode) {
    case "palavraSecreta": {
      // Use submode words if provided, otherwise use default list
      const submode = selectedSubmode || 'classico';
      const words = PALAVRA_SECRETA_SUBMODES_DATA[submode] || GAME_MODES.palavraSecreta.data;
      return { word: getRandomItem(words) };
    }
    
    case "palavras": {
      const location = getRandomItem(GAME_MODES.palavras.locais);
      const availableRoles = shuffleArray([...GAME_MODES.palavras.funcoes]);
      const roles: Record<string, string> = {};
      players.forEach((p, i) => {
        if (p.uid !== impostorId) {
          roles[p.uid] = availableRoles[i % availableRoles.length];
        }
      });
      return { location, roles };
    }
    
    case "duasFaccoes": {
      const pair = getRandomItem(GAME_MODES.duasFaccoes.pares);
      const factionA = pair[0];
      const factionB = pair[1];
      const factionMap: Record<string, string> = {};
      const innocents = players.filter(p => p.uid !== impostorId);
      const shuffled = shuffleArray(innocents);
      shuffled.forEach((p, i) => {
        factionMap[p.uid] = (i % 2 === 0) ? factionA : factionB;
      });
      return { factions: { A: factionA, B: factionB }, factionMap };
    }
    
    case "categoriaItem": {
      const categories = Object.keys(GAME_MODES.categoriaItem.categorias);
      const category = getRandomItem(categories);
      const items = GAME_MODES.categoriaItem.categorias[category as keyof typeof GAME_MODES.categoriaItem.categorias];
      const item = getRandomItem(items);
      return { category, item };
    }
    
    case "perguntasDiferentes": {
      const pair = getRandomItem(GAME_MODES.perguntasDiferentes.perguntas);
      return { question: pair.crew, impostorQuestion: pair.imp };
    }
    
    default:
      return { word: getRandomItem(GAME_MODES.palavraSecreta.data) };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve ads.txt for Google AdSense verification
  app.get("/ads.txt", (_req, res) => {
    res.type("text/plain").send("google.com, pub-4854252788330308, DIRECT, f08c47fec0942fa0");
  });

  // Serve version info
  app.get("/api/version", (_req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const versionPath = path.join(process.cwd(), 'client/public/version.json');
      const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
      res.json(versionData);
    } catch (error) {
      res.json({ version: 'v.1', versionNumber: 1 });
    }
  });

  await setupAuth(app);
  
  const wss = new WebSocketServer({ noServer: true });
  const roomConnections = new Map<string, Set<WebSocket>>();
  const playerConnections = new Map<string, { roomCode: string; playerId?: string }>();

  function broadcastToRoom(roomCode: string, data: unknown) {
    const connections = roomConnections.get(roomCode);
    if (!connections) return;

    const message = JSON.stringify(data);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/game-ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join-room' && data.roomCode && data.playerId) {
          currentRoomCode = data.roomCode as string;
          currentPlayerId = data.playerId as string;
          const roomCode = currentRoomCode;
          
          if (!roomConnections.has(roomCode)) {
            roomConnections.set(roomCode, new Set());
          }
          roomConnections.get(roomCode)!.add(ws);
          playerConnections.set(ws as any, { roomCode, playerId: currentPlayerId });
          
          const room = await storage.getRoom(roomCode);
          if (room) {
            ws.send(JSON.stringify({ type: 'room-update', room }));
          }
        }
        
        // Handle host back-to-lobby - broadcast to all players in room
        if (data.type === 'host-back-to-lobby' && data.roomCode) {
          const roomCode = data.roomCode as string;
          const updatedRoom = await storage.updateRoom(roomCode, {
            status: 'waiting',
            gameMode: null,
            impostorId: null,
            gameData: null
          });
          
          if (updatedRoom) {
            // Broadcast room update to all players
            broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
          }
        }

        // Handle trigger speaking order wheel - broadcast to all players in room
        if (data.type === 'trigger-speaking-order' && data.roomCode) {
          const roomCode = data.roomCode as string;
          const room = await storage.getRoom(roomCode);
          
          if (room && room.players) {
            // Generate random speaking order on the server so all clients get the same order
            const shuffled = [...room.players].sort(() => Math.random() - 0.5);
            const speakingOrder = shuffled.slice(0, Math.min(3, shuffled.length)).map(p => p.uid);
            
            // Broadcast to all players with the same order
            broadcastToRoom(roomCode, { 
              type: 'start-speaking-order-wheel',
              speakingOrder 
            });
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', async () => {
      if (currentRoomCode) {
        const connections = roomConnections.get(currentRoomCode);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            roomConnections.delete(currentRoomCode);
          }
        }
        playerConnections.delete(ws as any);

        const room = await storage.getRoom(currentRoomCode);
        if (!room || !currentPlayerId) return;

        // Remove player from room
        const disconnectedPlayer = room.players.find(p => p.uid === currentPlayerId);
        const updatedRoomAfterRemoval = await storage.removePlayerFromRoom(currentRoomCode, currentPlayerId);

        // Notify remaining players that someone left
        if (disconnectedPlayer && connections && connections.size > 0) {
          broadcastToRoom(currentRoomCode, {
            type: 'player-left',
            playerId: currentPlayerId,
            playerName: disconnectedPlayer.name
          });
          
          // Broadcast updated room list
          if (updatedRoomAfterRemoval) {
            broadcastToRoom(currentRoomCode, {
              type: 'room-update',
              room: updatedRoomAfterRemoval
            });
          }
        }

        // Check if disconnected player was the host
        if (room.hostId === currentPlayerId && connections && connections.size > 0 && updatedRoomAfterRemoval) {
          // Host disconnected and there are still players in the room
          // Find the first remaining player to be the new host
          let newHostId: string | null = null;
          
          for (const connection of connections) {
            const connInfo = playerConnections.get(connection as any);
            if (connInfo && connInfo.playerId && connInfo.playerId !== currentPlayerId) {
              newHostId = connInfo.playerId;
              break;
            }
          }

          // If we couldn't find by tracking connections, use the first player in room that isn't the old host
          if (!newHostId && updatedRoomAfterRemoval.players.length > 0) {
            newHostId = updatedRoomAfterRemoval.players[0].uid;
          }

          if (newHostId) {
            // Transfer host to the new player
            const finalRoom = await storage.updateRoom(currentRoomCode, {
              hostId: newHostId
            });

            if (finalRoom) {
              const newHost = finalRoom.players.find(p => p.uid === newHostId);
              // Broadcast the room update to all remaining players
              broadcastToRoom(currentRoomCode, { 
                type: 'host-changed',
                newHostId,
                newHostName: newHost?.name
              });
              
              // Broadcast final room state
              broadcastToRoom(currentRoomCode, {
                type: 'room-update',
                room: finalRoom
              });
            }
          }
        }
      }
    });
  });

  app.get("/api/game-modes", (_req, res) => {
    const modes = Object.entries(GAME_MODES).map(([id, mode]) => ({
      id,
      title: mode.title,
      desc: mode.desc,
      impostorGoal: mode.impostorGoal
    }));
    res.json(modes);
  });

  app.post("/api/rooms/create", async (req, res) => {
    try {
      const { hostId, hostName } = z.object({
        hostId: z.string(),
        hostName: z.string(),
      }).parse(req.body);

      const code = generateRoomCode();
      const player: Player = { uid: hostId, name: hostName };

      const room = await storage.createRoom({
        code,
        hostId,
        status: "waiting",
        gameMode: null,
        players: [player] as Player[],
        currentCategory: null,
        currentWord: null,
        impostorId: null,
        gameData: null,
      });

      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const { code, playerId, playerName } = z.object({
        code: z.string(),
        playerId: z.string(),
        playerName: z.string(),
      }).parse(req.body);

      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const player: Player = { uid: playerId, name: playerName };
      const updatedRoom = await storage.addPlayerToRoom(code.toUpperCase(), player);

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to join room" });
    }
  });

  app.post("/api/rooms/:code/start", async (req, res) => {
    try {
      const { code } = req.params;
      const { gameMode, selectedSubmode } = z.object({
        gameMode: z.enum(["palavraSecreta", "palavras", "duasFaccoes", "categoriaItem", "perguntasDiferentes"]),
        selectedSubmode: z.string().optional()
      }).parse(req.body);
      
      const room = await storage.getRoom(code.toUpperCase());
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const players = (room.players || []) as Player[];
      if (players.length < 3) {
        return res.status(400).json({ error: "Minimum 3 players required" });
      }

      const impostorIndex = Math.floor(Math.random() * players.length);
      const impostorId = players[impostorIndex].uid;
      
      const gameData = setupGameMode(gameMode, players, impostorId, selectedSubmode);
      
      const modeInfo = GAME_MODES[gameMode];

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        status: "playing",
        gameMode,
        currentCategory: modeInfo.title,
        currentWord: null,
        impostorId,
        gameData,
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      console.error('Start game error:', error);
      res.status(400).json({ error: "Failed to start game" });
    }
  });

  app.post("/api/rooms/:code/speaking-order", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const players = (room.players || []) as Player[];
      const shuffled = players.sort(() => Math.random() - 0.5);
      const speakingOrder = shuffled.slice(0, Math.min(3, players.length)).map(p => p.uid);
      
      res.json({ speakingOrder });
    } catch (error) {
      res.status(400).json({ error: "Failed to generate speaking order" });
    }
  });

  app.post("/api/rooms/:code/reveal-question", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const updatedGameData = {
        ...room.gameData,
        questionRevealed: true
      };

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: updatedGameData,
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to reveal question" });
    }
  });

  app.post("/api/rooms/:code/reset", async (req, res) => {
    try {
      const { code } = req.params;
      
      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        status: "waiting",
        gameMode: null,
        currentCategory: null,
        currentWord: null,
        impostorId: null,
        gameData: null,
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to reset room" });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoom(code.toUpperCase());
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "Failed to get room" });
    }
  });

  return httpServer;
}
