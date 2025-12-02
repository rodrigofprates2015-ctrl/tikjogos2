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
      { crew: "Qual show você adoraria ir?", imp: "Qual show você nunca iria?" },
      { crew: "Que personagem de anime você trocaria de vida?", imp: "Qual personagem de anime você acha o mais babaca?" },
      { crew: "Qual personagem da Disney seria seu melhor amigo?", imp: "Qual personagem da Disney você trancaria numa torre?" },
      { crew: "Qual super-herói você chamaria para te proteger de um assalto?", imp: "Qual super-herói provavelmente destruiria sua casa sem querer?" },
      { crew: "Em qual série você adoraria viver dentro do universo?", imp: "Qual série você cancelaria hoje mesmo?" },
      { crew: "Qual é a cobertura de pizza perfeita?", imp: "O que nunca deveria ser colocado em uma pizza?" },
      { crew: "Para onde você iria na sua lua de mel dos sonhos?", imp: "Para onde você mandaria seu pior inimigo?" },
      { crew: "Que celebridade você convidaria para um churrasco?", imp: "Que celebridade você acha que é insuportável na vida real?" },
      { crew: "Qual animal você acha o mais fofo do mundo?", imp: "De qual animal você morre de medo?" },
      { crew: "Qual aplicativo você não consegue viver sem?", imp: "Qual aplicativo você desinstalaria do celular de todos os seus amigos?" },
      { crew: "Se dinheiro não fosse problema, qual seria seu emprego dos sonhos?", imp: "Qual é o emprego mais estressante e mal pago do mundo?" },
      { crew: "Qual superpoder seria mais útil no seu dia a dia?", imp: "Qual superpoder é inútil e ridículo?" },
      { crew: "Que estilo musical toca na sua festa perfeita?", imp: "Que estilo musical faz seu ouvido sangrar?" },
      { crew: "Qual era sua matéria favorita na escola?", imp: "Em qual matéria você sempre tirava nota vermelha?" },
      { crew: "O que você bebe para se refrescar num dia quente?", imp: "O que tem gosto de remédio para tosse?" },
      { crew: "Que hobby você acha super interessante e culto?", imp: "Que hobby você acha pura perda de tempo?" },
      { crew: "Qual filme você veria 10 vezes seguidas?", imp: "Qual filme fez você dormir no cinema?" },
      { crew: "Qual o objeto mais valioso da sua casa?", imp: "O que você jogaria no lixo se ninguém percebesse?" },
      { crew: "Qual a melhor época do ano?", imp: "Em que época do ano você fica mais doente e mal-humorado?" },
      { crew: "Qual esporte é mais emocionante de assistir?", imp: "Qual esporte tem as regras mais confusas e chatas?" },
      { crew: "O que você adoraria ganhar de aniversário?", imp: "O que você daria de presente para alguém que você não gosta?" },
      { crew: "Qual sabor de sorvete é o clássico insuperável?", imp: "Qual sabor de sorvete tem gosto de pasta de dente?" },
      { crew: "Que figura histórica você gostaria de entrevistar?", imp: "Quem foi o maior tirano da história?" },
      { crew: "Qual o carro dos seus sonhos?", imp: "Qual meio de transporte é o mais desconfortável?" },
      { crew: "Qual peça de roupa te deixa mais confiante?", imp: "O que você jamais usaria nem se te pagassem?" },
      { crew: "Qual a melhor invenção da humanidade?", imp: "Qual invenção causou mais destruição no mundo?" },
      { crew: "Qual parte do seu corpo você mais gosta?", imp: "Se pudesse arrancar uma parte do corpo, qual seria?" },
      { crew: "Qual criatura sobrenatural você teria de estimação?", imp: "Qual monstro você acha que vive embaixo da sua cama?" },
      { crew: "Qual feitiço de Harry Potter seria mais útil no dia a dia?", imp: "Qual maldição imperdoável você usaria no trânsito?" },
      { crew: "Qual é o café da manhã dos campeões?", imp: "O que você comeria se estivesse sobrevivendo num lixão?" },
      { crew: "Qual a qualidade mais importante num amigo?", imp: "Qual o defeito que te faz bloquear alguém na hora?" },
      { crew: "Como seria seu chefe ideal?", imp: "Qual tipo de chefe deveria ser preso?" },
      { crew: "Em qual universo de livro você moraria?", imp: "Qual livro você usaria apenas para calçar uma mesa bamba?" },
      { crew: "Qual o final de videogame mais satisfatório de todos?", imp: "Qual jogo te fez quebrar o controle de tanta raiva?" },
      { crew: "Qual música tocaria na sua entrada de casamento?", imp: "Qual música tocaria no seu enterro?" },
      { crew: "Qual é o melhor cheiro do mundo?", imp: "O que tem cheiro de esgoto a céu aberto?" },
      { crew: "Qual o animal mais majestoso da natureza?", imp: "Qual inseto você mataria com fogo?" },
      { crew: "Para qual época histórica você viajaria se pudesse?", imp: "Em qual época histórica você morreria em 5 minutos?" },
      { crew: "Qual a melhor sequência de filme já feita?", imp: "Qual filme estragou completamente a sua infância?" },
      { crew: "Qual a roupa mais confortável que existe?", imp: "O que você vestiria para ser humilhado em público?" },
      { crew: "Qual hábito saudável mudou sua vida?", imp: "Qual vício horrível você esconde da sua família?" },
      { crew: "Qual aplicativo facilita a sua vida?", imp: "Qual aplicativo serve apenas para roubar seus dados?" },
      { crew: "Como você descreve o clima perfeito?", imp: "Qual desastre natural você mais teme?" },
      { crew: "Qual móvel da sua casa é o seu favorito?", imp: "O que você quebraria num ataque de fúria?" },
      { crew: "Qual o drink mais saboroso para uma festa?", imp: "O que você beberia se quisesse passar mal?" },
      { crew: "Qual cor te traz paz de espírito?", imp: "Qual cor você pintaria o quarto do seu pior inimigo?" },
      { crew: "Qual o melhor feriado do ano?", imp: "Em qual dia da semana você se sente mais miserável?" },
      { crew: "Qual seria seu meio de transporte de luxo?", imp: "Em qual veículo você nunca entraria, nem de graça?" },
      { crew: "Qual o melhor presente que já recebeu?", imp: "O que você daria de presente para alguém que odeia?" },
      { crew: "Qual sua melhor memória de infância?", imp: "Qual foi seu maior mico na escola?" },
      { crew: "Qual talento artístico você gostaria de ter?", imp: "Qual habilidade humana é completamente inútil?" },
      { crew: "Qual arma você usaria num apocalipse zumbi?", imp: "Qual objeto você usaria para desentupir um vaso sanitário?" },
      { crew: "O que você diria para um alienígena amigável?", imp: "Qual a última frase que você diria antes de ser abduzido?" },
      { crew: "O que você consertaria no passado se viajasse no tempo?", imp: "O que você faria para causar o caos na linha do tempo?" },
      { crew: "Em qual reality show você ganharia o prêmio milionário?", imp: "Em qual programa você seria o primeiro eliminado?" },
      { crew: "Qual esporte olímpico você ama assistir?", imp: "Qual esporte deveria ser banido por ser muito chato?" },
      { crew: "Qual obra de arte clássica você teria na sala?", imp: "O que parece desenho de criança mas custa milhões?" },
      { crew: "O que você compraria primeiro com 1 milhão de reais?", imp: "O que você roubaria se o crime fosse legalizado por um dia?" },
      { crew: "Com o que você sonha quando dorme bem?", imp: "O que te dá insônia e ansiedade à noite?" },
      { crew: "O que você faz num sábado perfeito?", imp: "Qual a tarefa doméstica mais insuportável de fazer?" },
      { crew: "Qual canal do YouTube traz conhecimento útil?", imp: "Quem é o youtuber mais irritante da internet?" },
      { crew: "Qual o melhor personagem protagonista dos games?", imp: "Qual vilão você deixaria destruir o mundo?" },
      { crew: "Qual a sobremesa suprema?", imp: "O que te dá dor de barriga só de olhar?" },
      { crew: "Qual vegetal é delicioso quando bem feito?", imp: "Qual comida tem textura de vômito?" },
      { crew: "Qual língua é a mais romântica para aprender?", imp: "Em qual língua você xingaria alguém no trânsito?" },
      { crew: "Qual jogo de tabuleiro une a família?", imp: "Qual jogo de tabuleiro destrói amizades?" },
      { crew: "Quem é seu crush famoso?", imp: "Qual celebridade você socaria na cara se pudesse?" },
      { crew: "Qual influencer digital você admira?", imp: "Quem vende curso falso e engana as pessoas?" },
      { crew: "Qual tendência de moda você acha estilosa?", imp: "O que as pessoas usam que parece ridículo?" },
      { crew: "Como é a casa dos seus sonhos?", imp: "Qual o lugar mais sujo que você já entrou?" },
      { crew: "Qual sentimento é o melhor do mundo?", imp: "O que você sente quando bate o dedinho na quina?" },
      { crew: "Qual o melhor conselho que já te deram?", imp: "Qual a maior mentira que os adultos contam para crianças?" },
      { crew: "Do que você tem um medo saudável e racional?", imp: "Qual fobia ridícula e irracional você tem?" },
      { crew: "O que teremos num futuro ideal e tecnológico?", imp: "O que vai causar o fim da raça humana?" },
      { crew: "Qual super-herói salvaria o dia no final?", imp: "Quem é o vilão mais estiloso dos quadrinhos?" }
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
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
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
          const room = await storage.getRoom(roomCode);
          if (!room) return;
          
          // Clear waitingForGame for ALL players when host resets
          const updatedPlayers = room.players.map(p => ({ ...p, waitingForGame: false }));
          
          const updatedRoom = await storage.updateRoom(roomCode, {
            status: 'waiting',
            gameMode: null,
            impostorId: null,
            gameData: null,
            currentCategory: null,
            currentWord: null,
            players: updatedPlayers
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
            // Include ALL active players in the speaking order, not just 3
            const activePlayers = room.players.filter(p => !p.waitingForGame);
            const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
            const speakingOrder = shuffled.map(p => p.uid);
            
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

        const disconnectedPlayer = room.players.find(p => p.uid === currentPlayerId);
        const wasHost = room.hostId === currentPlayerId;
        const hasRemainingPlayers = room.players.length > 1;

        // Remove player from room first
        let currentRoom = await storage.removePlayerFromRoom(currentRoomCode, currentPlayerId);
        if (!currentRoom) return;

        // If disconnected player was the host and there are remaining players, transfer host FIRST
        let newHostName: string | undefined;
        if (wasHost && hasRemainingPlayers && currentRoom.players.length > 0) {
          // Always use the first remaining player as the new host (most reliable method)
          const newHostId = currentRoom.players[0].uid;
          
          // Update room with new host immediately
          currentRoom = await storage.updateRoom(currentRoomCode, {
            hostId: newHostId
          }) || currentRoom;
          
          newHostName = currentRoom.players.find(p => p.uid === newHostId)?.name;
          
          // Broadcast host change notification
          if (connections && connections.size > 0) {
            broadcastToRoom(currentRoomCode, { 
              type: 'host-changed',
              newHostId,
              newHostName
            });
          }
        }

        // Now broadcast player left and room update with the FINAL room state (including new host)
        if (disconnectedPlayer && connections && connections.size > 0) {
          broadcastToRoom(currentRoomCode, {
            type: 'player-left',
            playerId: currentPlayerId,
            playerName: disconnectedPlayer.name
          });
          
          // Broadcast the final room state with correct hostId
          broadcastToRoom(currentRoomCode, {
            type: 'room-update',
            room: currentRoom
          });
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

      // If room is already playing, mark new player as waiting for game to end
      const isGameInProgress = room.status === 'playing';
      const player: Player = { 
        uid: playerId, 
        name: playerName,
        waitingForGame: isGameInProgress 
      };
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
      // Include ALL active players in speaking order
      const activePlayers = players.filter(p => !p.waitingForGame);
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
      const speakingOrder = shuffled.map(p => p.uid);
      
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

  app.post("/api/rooms/:code/submit-answer", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId, playerName, answer } = req.body;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      const existingAnswers = room.gameData.answers || [];
      const alreadyAnswered = existingAnswers.some(a => a.playerId === playerId);
      
      if (alreadyAnswered) {
        return res.status(400).json({ error: "Already submitted answer" });
      }

      const newAnswers = [...existingAnswers, { playerId, playerName, answer }];
      
      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          answers: newAnswers
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to submit answer" });
    }
  });

  app.post("/api/rooms/:code/reveal-answers", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          answersRevealed: true
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to reveal answers" });
    }
  });

  app.post("/api/rooms/:code/reveal-crew-question", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          crewQuestionRevealed: true
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to reveal crew question" });
    }
  });

  app.post("/api/rooms/:code/start-voting", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          votingStarted: true,
          votes: []
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to start voting" });
    }
  });

  app.post("/api/rooms/:code/submit-vote", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId, playerName, targetId, targetName } = req.body;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      if (!room.gameData.votingStarted) {
        return res.status(400).json({ error: "Voting has not started" });
      }

      const existingVotes = room.gameData.votes || [];
      const alreadyVoted = existingVotes.some(v => v.playerId === playerId);
      
      if (alreadyVoted) {
        return res.status(400).json({ error: "Already submitted vote" });
      }

      const newVotes = [...existingVotes, { playerId, playerName, targetId, targetName }];
      
      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          votes: newVotes
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to submit vote" });
    }
  });

  app.post("/api/rooms/:code/reveal-impostor", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (!room.gameData) {
        return res.status(400).json({ error: "No game in progress" });
      }

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        gameData: {
          ...room.gameData,
          votesRevealed: true
        }
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to reveal impostor" });
    }
  });

  app.post("/api/rooms/:code/leave-game", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId } = req.body;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const updatedPlayers = room.players.map(p => 
        p.uid === playerId 
          ? { ...p, waitingForGame: true }
          : p
      );

      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        players: updatedPlayers,
      });

      if (updatedRoom) {
        broadcastToRoom(code.toUpperCase(), { type: 'room-update', room: updatedRoom });
      }

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "Failed to leave game" });
    }
  });

  app.post("/api/rooms/:code/reset", async (req, res) => {
    try {
      const { code } = req.params;
      
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const updatedPlayers = room.players.map(p => ({ ...p, waitingForGame: false }));
      
      const updatedRoom = await storage.updateRoom(code.toUpperCase(), {
        status: "waiting",
        gameMode: null,
        currentCategory: null,
        currentWord: null,
        impostorId: null,
        gameData: null,
        players: updatedPlayers,
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
