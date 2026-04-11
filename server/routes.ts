import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage, type Room } from "./storage";
import { type Player, type GameModeType, type GameData } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import { setupAuth, isAuthenticated } from "./githubAuth";
import { createPayment, createDonationPayment, getPaymentStatus, type ThemeData, type DonationData } from "./paymentController";
import { randomBytes as cryptoRandomBytes } from "crypto";
import { createAnalyticsRouter } from "./analyticsRoutes";
import { recordGameSession, getGameSessionStats } from "./db";
import { trackLobbyJoin, trackLobbyLeave, trackLobbyGameStart } from "./lobbyTracker";
import { trackRoomJoin } from "./analyticsMiddleware";
import agoraToken from 'agora-token';
const { RtcTokenBuilder, RtcRole } = agoraToken;

// Note: All pending themes are now stored directly in PostgreSQL database
// This ensures persistence across server restarts and works in all deployment environments

// ── Room creation counters (in-memory, reset on server restart) ──
let impostorTotalRoomsCreated = 0;
let drawingTotalRoomsCreated = 0;

// ── Drawing game types & state at module scope (so stats can be exported) ──
type DrawingPlayer = { uid: string; name: string; connected?: boolean };
type DrawingPlayerVote = { playerId: string; playerName: string; targetId: string; targetName: string };
type DrawingGameData = {
  word?: string;
  impostorIds?: string[];
  drawingOrder?: string[];
  currentDrawerIndex?: number;
  currentDrawerId?: string;
  turnTimeLimit?: number;
  canvasSnapshot?: string;
  votes?: DrawingPlayerVote[];
  votingStarted?: boolean;
  votesRevealed?: boolean;
};
type DrawingRoom = {
  code: string;
  hostId: string;
  status: string;
  gameData: DrawingGameData | null;
  players: DrawingPlayer[];
  createdAt: string;
};
const drawingRooms = new Map<string, DrawingRoom>();

/** Real-time stats for Impostor game rooms (in-memory) */
export async function getImpostorRoomStats() {
  const allRoomsRaw = await storage.getAllRooms();
  const allRooms = allRoomsRaw.filter(r => r.gameMode !== 'desafioPalavra');
  const activeRooms = allRooms.filter(r => r.players.some(p => p.connected));
  const playingRooms = allRooms.filter(r => r.status === 'playing');
  const totalConnectedPlayers = allRooms.reduce((sum, r) => sum + r.players.filter(p => p.connected).length, 0);
  return {
    totalRoomsCreated: impostorTotalRoomsCreated,
    activeRooms: activeRooms.length,
    playingRooms: playingRooms.length,
    totalConnectedPlayers,
    rooms: activeRooms.map(r => ({
      code: r.code,
      phase: r.status,
      gameMode: r.gameMode || 'N/A',
      playerCount: r.players.length,
      connectedPlayers: r.players.filter(p => p.connected).length,
    })),
  };
}

/** Real-time stats for Drawing game rooms (in-memory) */
export function getDrawingRoomStats() {
  const allRooms = Array.from(drawingRooms.values());
  const activeRooms = allRooms.filter(r => r.players.some(p => p.connected));
  const playingRooms = allRooms.filter(r => r.status !== 'waiting');
  const totalConnectedPlayers = allRooms.reduce((sum, r) => sum + r.players.filter(p => p.connected !== false).length, 0);
  return {
    totalRoomsCreated: drawingTotalRoomsCreated,
    activeRooms: activeRooms.length,
    playingRooms: playingRooms.length,
    totalConnectedPlayers,
    rooms: activeRooms.map(r => ({
      code: r.code,
      phase: r.status,
      playerCount: r.players.length,
      connectedPlayers: r.players.filter(p => p.connected !== false).length,
    })),
  };
}

// Server-side admin token store with expiration (24h)
const ADMIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const adminTokens = new Map<string, number>(); // token -> expiry timestamp

function storeAdminToken(token: string): void {
  adminTokens.set(token, Date.now() + ADMIN_TOKEN_TTL_MS);
}

function isValidAdminToken(token: string): boolean {
  const expiry = adminTokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    adminTokens.delete(token);
    return false;
  }
  return true;
}

function revokeAdminToken(token: string): void {
  adminTokens.delete(token);
}

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
      { crew: "Qual franquia de games mais te marcou?", imp: "Qual franquia de jogos você acha que já deveria ter acabado?" },
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
  },
  palavraComunidade: {
    title: "Palavra - criados por vocês",
    desc: "Temas criados pela comunidade! Escolha um tema personalizado.",
    impostorGoal: "Tente descobrir a palavra.",
    data: []
  }
};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(3);
  let code = '';
  for (let i = 0; i < 3; i++) code += chars[bytes[i] % chars.length];
  return code;
}



// Seeded random number generator (Mulberry32) - produces consistent results for same seed
function createSeededRNG(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Convert string to numeric seed for RNG
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Shuffle array using seeded RNG - same seed = same order, different seed = different order
function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rng = createSeededRNG(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Pool system: stores shuffled items per room/mode to avoid repetition
interface ItemPool<T> {
  items: T[];
  lastRefillTime: number;
}

const wordPools: Map<string, ItemPool<string>> = new Map();
const questionPools: Map<string, ItemPool<{ crew: string; imp: string }>> = new Map();
const pairPools: Map<string, ItemPool<string[]>> = new Map();
const comboPools: Map<string, ItemPool<{ category: string; item: string }>> = new Map();

// Get unique item from pool - never repeats until all items used
function getFromPool<T>(
  poolKey: string,
  sourceItems: T[],
  pools: Map<string, ItemPool<T>>,
  roomCode: string
): T {
  const now = Date.now();
  let pool = pools.get(poolKey);
  
  // Create new pool or refill if empty
  if (!pool || pool.items.length === 0) {
    // Use timestamp + room code + pool key as seed for unique shuffle each time
    const seed = stringToSeed(`${roomCode}-${poolKey}-${now}-${Math.random()}`);
    const shuffled = seededShuffle(sourceItems, seed);
    pool = {
      items: shuffled,
      lastRefillTime: now
    };
    pools.set(poolKey, pool);
    console.log(`[Pool] Created/refilled pool "${poolKey}" with ${shuffled.length} items (seed: ${seed})`);
  }
  
  // Pop item from pool (guaranteed unique until pool empty)
  const item = pool.items.pop()!;
  console.log(`[Pool] Drew item from "${poolKey}", ${pool.items.length} remaining`);
  return item;
}

// Get word from pool for Palavra Secreta modes
function getPooledWord(submode: string, roomCode: string): string {
  const poolKey = `palavra-${submode}-${roomCode}`;
  const words = PALAVRA_SECRETA_SUBMODES_DATA[submode] || GAME_MODES.palavraSecreta.data;
  return getFromPool(poolKey, words, wordPools, roomCode);
}

// Get question from pool for Perguntas Diferentes
function getPooledQuestion(roomCode: string): { crew: string; imp: string } {
  const poolKey = `perguntas-${roomCode}`;
  return getFromPool(poolKey, GAME_MODES.perguntasDiferentes.perguntas, questionPools, roomCode);
}

// Legacy functions (kept for compatibility with other modes)
function getRandomItem<T>(arr: T[]): T {
  const seed = Date.now() + Math.random() * 1000000;
  const rng = createSeededRNG(seed);
  return arr[Math.floor(rng() * arr.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const seed = Date.now() + Math.random() * 1000000;
  return seededShuffle(array, seed);
}

// Clean up old pools periodically (optional - prevents memory leak for abandoned rooms)
function cleanupOldPools() {
  const maxAge = 1000 * 60 * 60 * 2; // 2 hours
  const now = Date.now();
  
  Array.from(wordPools.entries()).forEach(([key, pool]) => {
    if (now - pool.lastRefillTime > maxAge) {
      wordPools.delete(key);
    }
  });
  Array.from(questionPools.entries()).forEach(([key, pool]) => {
    if (now - pool.lastRefillTime > maxAge) {
      questionPools.delete(key);
    }
  });
}

// Run cleanup every 30 minutes
setInterval(cleanupOldPools, 1000 * 60 * 30);

// Submode words for Palavra Secreta
const PALAVRA_SECRETA_SUBMODES_DATA: Record<string, string[]> = {
  classico: [
    // Objetos domésticos e cotidiano
    'Cadeira', 'Mesa', 'Sofá', 'Cama', 'Guarda-roupa', 'Estante', 'Abajur', 'Tapete', 'Cortina', 'Espelho',
    'Poltrona', 'Escrivaninha', 'Colchão', 'Berço', 'Rede', 'Banco', 'Prateleira', 'Ventilador',
    'Ar-condicionado', 'Lareira', 'Geladeira', 'Fogão', 'Micro-ondas', 'Liquidificador', 'Garfo',
    'Colher', 'Faca', 'Prato', 'Copo', 'Xícara', 'Panela', 'Frigideira', 'Tábua de carne', 'Ralo',
    'Peneira', 'Abridor de latas', 'Saca-rolhas', 'Palito de dente', 'Guardanapo', 'Toalha de mesa',
    'Detergente', 'Esponja', 'Lixeira', 'Vassoura', 'Rodo', 'Pá', 'Balde', 'Pregador', 'Varal', 'Ferro de passar',
    'Escova de dentes', 'Pasta de dente', 'Pente', 'Shampoo', 'Sabonete', 'Toalha', 'Desodorante',
    'Perfume', 'Cortador de unha', 'Pinça', 'Maquiagem', 'Batom', 'Espelho de bolso', 'Protetor solar',
    'Óculos', 'Relógio', 'Anel', 'Colar', 'Brinco', 'Pulseira', 'Carteira', 'Bolsa', 'Mochila', 'Mala',
    'Chave', 'Guarda-chuva', 'Isqueiro', 'Fósforo',
    'Caneta', 'Lápis', 'Borracha', 'Apontador', 'Caderno', 'Livro', 'Agenda', 'Tesoura', 'Cola', 'Régua',
    'Grampeador', 'Clips', 'Post-it', 'Calculadora', 'Envelope', 'Papel', 'Pasta', 'Estojo', 'Quadro branco',
    'Giz', 'Canetão', 'Compasso', 'Dicionário',
    // Lugares
    'Escola', 'Hospital', 'Banco', 'Correio', 'Farmácia', 'Padaria', 'Supermercado', 'Shopping', 'Cinema',
    'Teatro', 'Museu', 'Biblioteca', 'Restaurante', 'Lanchonete', 'Bar', 'Academia', 'Parque', 'Praça',
    'Igreja', 'Cemitério', 'Delegacia', 'Corpo de Bombeiros', 'Hotel', 'Motel', 'Aeroporto', 'Rodoviária',
    'Estação de trem', 'Metrô', 'Ponto de ônibus', 'Estádio', 'Zoológico', 'Circo', 'Parque de diversões',
    'Prefeitura', 'Faculdade',
    'Praia', 'Montanha', 'Floresta', 'Deserto', 'Cachoeira', 'Rio', 'Lago', 'Mar', 'Oceano', 'Ilha', 'Caverna',
    'Vulcão', 'Geleira', 'Pântano', 'Campo', 'Fazenda', 'Sítio', 'Horta', 'Jardim', 'Quintal', 'Céu', 'Lua', 'Marte', 'Espaço',
    'Quarto', 'Sala', 'Cozinha', 'Banheiro', 'Varanda', 'Garagem', 'Sótão', 'Porão', 'Corredor', 'Elevador',
    'Escada', 'Piscina', 'Sauna', 'Quadra', 'Vestiário',
    // Comidas e bebidas
    'Maçã', 'Banana', 'Laranja', 'Uva', 'Morango', 'Abacaxi', 'Melancia', 'Melão', 'Limão', 'Manga', 'Pera',
    'Pêssego', 'Abacate', 'Coco', 'Cereja', 'Kiwi', 'Maracujá', 'Goiaba', 'Mamão', 'Caju', 'Açaí',
    'Alface', 'Tomate', 'Cenoura', 'Batata', 'Cebola', 'Alho', 'Brócolis', 'Couve-flor', 'Espinafre', 'Pepino',
    'Pimentão', 'Abóbora', 'Berinjela', 'Milho', 'Feijão', 'Arroz', 'Macarrão',
    'Pizza', 'Hambúrguer', 'Cachorro-quente', 'Batata frita', 'Lasanha', 'Churrasco', 'Sushi', 'Sashimi',
    'Temaki', 'Coxinha', 'Pastel', 'Esfiha', 'Kibe', 'Pão de queijo', 'Sanduíche', 'Sopa', 'Salada', 'Omelete',
    'Ovo frito', 'Bife', 'Frango assado', 'Peixe',
    'Chocolate', 'Sorvete', 'Bolo', 'Torta', 'Pudim', 'Brigadeiro', 'Beijinho', 'Paçoca', 'Chiclete', 'Bala',
    'Pirulito', 'Gelatina', 'Mousse', 'Panqueca', 'Waffle', 'Mel', 'Açúcar',
    'Água', 'Suco', 'Refrigerante', 'Café', 'Chá', 'Leite', 'Cerveja', 'Vinho', 'Vodka', 'Whisky', 'Champanhe',
    'Água de coco', 'Limonada', 'Milkshake',
    // Animais
    'Cachorro', 'Gato', 'Hamster', 'Coelho', 'Papagaio', 'Canário', 'Peixinho', 'Cavalo', 'Vaca', 'Boi',
    'Porco', 'Galinha', 'Galo', 'Pato', 'Ovelha', 'Cabra', 'Burro',
    'Leão', 'Tigre', 'Onça', 'Elefante', 'Girafa', 'Zebra', 'Hipopótamo', 'Rinoceronte', 'Macaco', 'Gorila',
    'Urso', 'Panda', 'Lobo', 'Raposa', 'Canguru', 'Camelo', 'Veado', 'Javali',
    'Tubarão', 'Baleia', 'Golfinho', 'Foca', 'Pinguim', 'Polvo', 'Lula', 'Caranguejo', 'Lagosta', 'Camarão',
    'Tartaruga', 'Jacaré', 'Crocodilo', 'Sapo',
    'Águia', 'Falcão', 'Coruja', 'Pombo', 'Gaivota', 'Avestruz', 'Pavão', 'Flamingo', 'Tucano',
    'Borboleta', 'Abelha', 'Formiga', 'Mosca', 'Mosquito', 'Aranha', 'Escorpião', 'Barata', 'Besouro', 'Minhoca', 'Cobra',
    // Profissões
    'Médico', 'Enfermeiro', 'Dentista', 'Veterinário', 'Psicólogo', 'Professor', 'Advogado', 'Juiz',
    'Policial', 'Bombeiro', 'Detetive', 'Soldado', 'Piloto', 'Aeromoça', 'Astronauta', 'Motorista',
    'Taxista', 'Caminhoneiro', 'Mecânico', 'Eletricista', 'Encanador', 'Pedreiro', 'Arquiteto', 'Engenheiro',
    'Pintor', 'Carpinteiro', 'Jardineiro', 'Cozinheiro', 'Chef', 'Garçom', 'Padeiro', 'Açougueiro',
    'Agricultor', 'Pescador', 'Ator', 'Cantor', 'Músico', 'Dançarino', 'Escritor', 'Jornalista',
    'Fotógrafo', 'Programador', 'Cientista', 'Político', 'Padre', 'Pastor', 'Mágico', 'Palhaço', 'Atleta',
    // Hobbies, esportes e lazer
    'Futebol', 'Vôlei', 'Basquete', 'Tênis', 'Natação', 'Corrida', 'Ciclismo', 'Skate', 'Patins', 'Surfe',
    'Judô', 'Karatê', 'Boxe', 'Golfe', 'Beisebol', 'Futebol Americano', 'Ginástica', 'Dança', 'Ioga', 'Musculação',
    'Xadrez', 'Dama', 'Baralho', 'Dominó', 'Videogame', 'Quebra-cabeça', 'Palavras cruzadas', 'Sinuca',
    'Boliche', 'Dardo', 'Pipa', 'Esconde-esconde', 'Pega-pega',
    'Acampar', 'Pescar', 'Ler', 'Pintar', 'Desenhar', 'Tocar violão', 'Tocar piano', 'Tocar bateria',
    'Cantar', 'Cozinhar', 'Viajar', 'Tirar fotos', 'Assistir filmes', 'Ouvir música',
    // Vestuário e acessórios
    'Camiseta', 'Camisa', 'Blusa', 'Jaqueta', 'Casaco', 'Moletom', 'Suéter', 'Colete', 'Calça', 'Short',
    'Bermuda', 'Saia', 'Vestido', 'Terno', 'Gravata', 'Smoking', 'Pijama', 'Roupão', 'Biquíni', 'Maiô',
    'Sunga', 'Calcinha', 'Cueca', 'Meia', 'Sapato', 'Tênis', 'Bota', 'Sandália', 'Chinelo', 'Salto alto',
    'Chuteira', 'Boné', 'Chapéu', 'Touca', 'Capacete', 'Luva', 'Cachecol', 'Cinto',
    // Transporte e tecnologia
    'Carro', 'Moto', 'Caminhão', 'Ônibus', 'Bicicleta', 'Skate', 'Patinete', 'Trem', 'Metrô', 'Avião',
    'Helicóptero', 'Barco', 'Navio', 'Iate', 'Submarino', 'Foguete', 'Balão', 'Dirigível', 'Táxi', 'Uber',
    'Trator', 'Ambulância', 'Viatura', 'Carro de bombeiro',
    'Celular', 'Smartphone', 'Tablet', 'Computador', 'Notebook', 'Teclado', 'Mouse', 'Monitor', 'Impressora',
    'Câmera', 'Fone de ouvido', 'Microfone', 'Caixa de som', 'Televisão', 'Controle remoto',
    'Videogame', 'Robô', 'Drone', 'Satélite', 'Internet', 'Wi-Fi', 'Bateria', 'Carregador', 'Cabo USB', 'Pen drive',
    // Fenômenos e natureza
    'Chuva', 'Sol', 'Vento', 'Neve', 'Tempestade', 'Raio', 'Trovão', 'Arco-íris', 'Furacão', 'Tornado',
    'Terremoto', 'Tsunami', 'Eclipse', 'Amanhecer', 'Pôr do sol', 'Noite', 'Dia', 'Calor', 'Frio',
    'Fogo', 'Fumaça', 'Água', 'Gelo', 'Vapor', 'Areia', 'Terra', 'Pedra', 'Ouro', 'Prata', 'Diamante',
    // Cultura pop e fantasia
    'Fantasma', 'Vampiro', 'Lobisomem', 'Zumbi', 'Bruxa', 'Fada', 'Sereia', 'Dragão', 'Unicórnio',
    'Alienígena', 'Robô', 'Super-herói', 'Vilão', 'Múmia', 'Gigante', 'Anão', 'Elfo', 'Mago',
    'Terror', 'Comédia', 'Romance', 'Ação', 'Ficção Científica', 'Faroeste', 'Musical',
    'Desenho animado', 'Anime', 'Mangá', 'Gibi'
  ],
  natal: [
    'Papai Noel', 'Jesus Cristo', 'Anjo', 'Menino Jesus', 'Reis Magos', 'Elfo', 'Rena', 'Família',
    'Árvore de Natal', 'Presentes', 'Luzes', 'Pisca-pisca', 'Estrela', 'Sino', 'Vela', 'Guirlanda',
    'Bola de Natal', 'Presépio', 'Meia', 'Trenó', 'Chaminé', 'Boneco de neve', 'Floco de neve',
    'Bota', 'Gorro', 'Festão', 'Ceia', 'Peru', 'Panetone', 'Rabanada', 'Uva-passa', 'Nozes',
    'Castanha', 'Vinho quente', 'Canções natalinas', 'Cartão de Natal', 'Tradição', 'Véspera',
    'Amor', 'Paz', 'Esperança', 'Alegria', 'União', 'Magia', 'Perdão', 'Generosidade', 'Harmonia',
    'Fraternidade', 'Reflexão', 'Gratidão', 'Renovação'
  ],
  estrategia: ['Mago', 'Príncipe', 'Mosqueteira', 'Gigante', 'Arqueiras', 'Corredor', 'P.E.K.K.A', 'Golem', 'Dragão Bebê', 'Bruxa', 'Mineiro', 'Cavaleiro', 'Barril de Goblins', 'Tronco', 'Tesla', 'Lava Hound', 'Lenhador', 'Fantasma Real', 'Mago de Gelo', 'Executor'],
  animes: ['Goku', 'Naruto', 'Luffy', 'Tanjiro', 'Mikasa', 'Saitama', 'Sasuke', 'Deku', 'Gojo', 'Ichigo', 'Sharingan', 'Bankai', 'Kamehameha', 'Rasengan', 'Titan', 'Shinigami', 'Chakra', 'Espada Nichirin', 'Akatsuki', 'Grimório'],
  herois: ['Homem-Aranha', 'Thor', 'Hulk', 'Capitão América', 'Homem de Ferro', 'Viúva Negra', 'Pantera Negra', 'Doutor Estranho', 'Thanos', 'Loki', 'Ultron', 'Groot', 'Rocket', 'Wanda', 'Visão', 'Escudo', 'Mjölnir', 'Joia do Infinito', 'Hydra', 'Vibranium'],
  seriesMisterio: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers'],
  futebol: ['Flamengo', 'Corinthians', 'São Paulo', 'Palmeiras', 'Santos', 'Vasco da Gama', 'Cruzeiro', 'Grêmio', 'Internacional', 'Atlético Mineiro', 'Fluminense', 'Botafogo', 'Atlético Paranaense', 'Bahia', 'Esporte', 'Vitória', 'Coritiba', 'Goiás', 'Fortaleza', 'Ceará'],
  disney: ['Mickey', 'Minnie', 'Donald', 'Pateta', 'Plutão', 'Princesa', 'Castelo', 'Pixar', 'Maravilha', 'Star Wars', 'Congelado', 'Elsa', 'Ana', 'Simba', 'Rei Leão', 'Aladdin', 'Jasmim', 'Ariel', 'Moana', 'Rapunzel', 'Encanto', 'Buzz Lightyear', 'Woody', 'Toy Story', 'Nemo', 'Monstros SA', 'Ponto', 'Pocahontas', 'Bela', 'Fera'],
  valorant: ['Spike', 'Plant', 'Defuse', 'Clutch', 'Ace', 'Headshot', 'Ranked', 'Radiant', 'Immortal', 'Ascendant', 'Diamond', 'Platinum', 'Gold', 'Jett', 'Phoenix', 'Sage', 'Sova', 'Viper', 'Cypher', 'Reyna', 'Killjoy', 'Breach', 'Omen', 'Raze', 'Skye', 'Yoru', 'Astra', 'KAY/O', 'Chamber', 'Neon', 'Fade', 'Harbor', 'Gekko', 'Deadlock', 'Iso', 'Clove', 'Vyse', 'Ascent', 'Bind', 'Haven', 'Split', 'Breeze', 'Fracture', 'Lotus', 'Icebox', 'Pearl', 'Sunset', 'Vandal', 'Phantom', 'Operator', 'Sheriff', 'Spectre', 'Guardian'],
  roblox: ['Robux', 'Avatar', 'Noob', 'Admin', 'Ban', 'Parkour', 'Tycoon', 'Adopt Me', 'Brookhaven', 'Bloxburg', 'Murder Mystery 2', 'Doors', 'Piggy', 'Pet Simulator', 'Obby', 'Oof', 'Builder\'s Club', 'Premium', 'Evento', 'Skin', 'Item', 'Chat', 'Mapa', 'Servidor', 'Hacker', 'Glitch', 'Trade', 'Showcase', 'Tower of Hell', 'Arsenal', 'MeepCity', 'BedWars', 'Natural Disaster', 'Jailbreak'],
  supernatural: ['Dean Winchester', 'Sam Winchester', 'Castiel', 'Crowley', 'Impala 67', 'Bobby Singer', 'Lucifer', 'Anjo', 'Demônio', 'Fantasma', 'Sal Grosso', 'Água Benta', 'Bunker', 'Apocalipse', 'Caçador', 'Diário de John', 'Purgatório', 'Inferno', 'Céu', 'Colt', 'Faca de Ruby', 'Marca de Caim', 'Possessão', 'Exorcismo', 'Encruzilhada', 'Pacto', 'John Winchester', 'Mary Winchester', 'Rowena', 'Chuck (Deus)', 'Escuridão (Amara)', 'Metatron', 'Leviatã', 'Vampiro', 'Lobisomem', 'Kansas'],
  dragonball: ['Goku', 'Vegeta', 'Gohan', 'Piccolo', 'Freeza', 'Cell', 'Majin Boo', 'Esferas do Dragão', 'Shenlong', 'Saiyajin', 'Super Saiyajin', 'Kamehameha', 'Genki Dama', 'Fusão', 'Potara', 'Trunks', 'Goten', 'Bulma', 'Kuririn', 'Mestre Kame', 'Nuvem Voadora', 'Radar do Dragão', 'Torneio de Artes Marciais', 'Ki', 'Teletransporte', 'Androide 18', 'Bills', 'Whis', 'Broly', 'Planeta Vegeta', 'Oozaru (Macaco Gigante)', 'Senhor Kaioh', 'Semente dos Deuses', 'Zeno', 'Bardock', 'Cápsula Corp'],
  naruto: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake', 'Hokage', 'Vila da Folha (Konoha)', 'Chakra', 'Rasengan', 'Chidori', 'Sharingan', 'Byakugan', 'Rinnegan', 'Akatsuki', 'Itachi Uchiha', 'Gaara', 'Orochimaru', 'Jiraiya', 'Tsunade', 'Hinata Hyuga', 'Kurama (Raposa de 9 Caudas)', 'Bijuu', 'Jinchuuriki', 'Kunai', 'Shuriken', 'Bandana Ninja', 'Exame Chunin', 'Vale do Fim', 'Madara Uchiha', 'Obito', 'Pain', 'Jutsu Sexy', 'Clone das Sombras', 'Vila da Névoa', 'Ramen do Ichiraku', 'Dattebayo'],
  rock: ['The Beatles', 'Rolling Stones', 'Queen', 'AC/DC', 'Guns N\' Roses', 'Nirvana', 'Metallica', 'Iron Maiden', 'Pink Floyd', 'Led Zeppelin', 'Red Hot Chili Peppers', 'Linkin Park', 'Kiss', 'Aerosmith', 'Bon Jovi', 'U2', 'Coldplay', 'Foo Fighters', 'Black Sabbath', 'System of a Down', 'Ramones', 'The Doors', 'Green Day', 'Pearl Jam', 'Slipknot', 'Evanescence', 'Sepultura', 'Legião Urbana', 'Capital Inicial', 'Titãs', 'CPM 22', 'Charlie Brown Jr', 'Pitty', 'Raul Seixas', 'Mamonas Assassinas'],
  minecraft: ['Steve', 'Alex', 'Creeper', 'Enderman', 'Zumbi', 'Esqueleto', 'Aranha', 'Aldeão (Villager)', 'Bruxa', 'Herobrine', 'Ender Dragon', 'Wither', 'Diamante', 'Ouro', 'Ferro', 'Carvão', 'Redstone', 'Picareta', 'Espada', 'Machado', 'Crafting Table (Bancada)', 'Fornalha', 'Baú', 'Cama', 'Portal do Nether', 'The End', 'Fortaleza', 'Bioma', 'Deserto', 'Floresta', 'Caverna', 'Mineração', 'Construção', 'Bloco de Terra', 'Areia de Almas', 'Bedrock', 'Obsidiana', 'Tnt'],
  gta: ['CJ (Carl Johnson)', 'Franklin Clinton', 'Michael De Santa', 'Trevor Philips', 'Niko Bellic', 'Tommy Vercetti', 'Los Santos', 'Liberty City', 'Vice City', 'San Andreas', 'Grove Street', 'Ballas', 'Vagos', 'Polícia (LSPD)', '5 Estrelas', 'Helicóptero', 'Tanque de Guerra', 'Jetpack', 'Missão', 'Roubo de Carros', 'Assalto a Banco', 'Dinheiro', 'Carro Esportivo', 'Moto', 'Armas', 'Wanted (Procurado)', 'Lester Crest', 'Big Smoke', 'Ryder', 'Lamar Davis', 'Cassino', 'Golpe', 'Modo Online', 'Garagem', 'Los Santos Customs', 'Paraquedas', 'Cheat'],
  fnaf: ['Animatrônicos', 'Freddy Fazbear', 'Bonnie', 'Chica', 'Foxy', 'Golden Freddy', 'Springtrap', 'Glitchtrap', 'Circus Baby', 'Ennard', 'Puppet', 'Marionete', 'Ballora', 'Funtime Freddy', 'Funtime Foxy', 'Molten Freddy', 'Scraptrap', 'Helpy', 'Vanny', 'Vanessa', 'William Afton', 'Michael Afton', 'Gregory', 'Glamrock Freddy', 'Roxanne Wolf', 'Montgomery Gator', 'Sun (Daycare Attendant)', 'Moon (Daycare Attendant)', 'Pizzaria', 'Fazbear Entertainment', 'Escritório', 'Câmeras', 'Monitores', 'Corredor', 'Ventilação', 'Portas', 'Gerador', 'Energia', 'Lanternas', 'Tablet', 'Noite', 'Turno', 'Vigilância', 'Sobrevivência', 'Jumpscare', 'Missões', 'Mapas', 'Minigames', 'Colecionáveis', 'Easter eggs', 'FNAF 1', 'FNAF 2', 'FNAF 3', 'FNAF 4', 'Sister Location', 'Security Breach', 'Ultimate Custom Night', 'Custom Night', 'Teorias', 'Lore'],
  fortnite: ['Battle Royale', 'Battle Pass', 'Skin', 'V-Bucks', 'Emote', 'Drop', 'Loot', 'Chest', 'Storm', 'Battle Bus', 'Mapa', 'Zona', 'Squad', 'Duo', 'Solo', 'Build', 'Edit', 'Shotgun', 'Sniper', 'AR', 'Victory Royale', 'XP', 'Nível', 'Item Shop', 'Season', 'Update', 'Patch', 'Collab', 'Evento'],
  freefire: ['Battle Royale', 'Garena', 'Drop', 'Loot', 'Mapa', 'Safe Zone', 'Squad', 'Solo', 'Ranked', 'Skin', 'Personagem', 'Habilidade', 'Diamante', 'Arma', 'Granada', 'Sniper', 'Capa', 'Rush', 'Lobby', 'Sala', 'Guilda', 'Passe', 'Evento', 'Update', 'Headshot', 'Booyah', 'Colete', 'Capacete', 'Pet'],
  brawlstars: ['Brawler', 'Super', 'Gadget', 'Star Power', 'Gem Grab', 'Showdown', 'Brawl Ball', 'Heist', 'Siege', 'Knockout', 'Mapa', 'Skin', 'Troféu', 'Rank', 'Poder', 'Upgrade', 'Time', 'Solo', 'Dupla', 'Evento', 'Passe', 'Season', 'Caixa', 'Ataque'],
  pokemon: ['Pikachu', 'Pokébola', 'Treinador', 'Ginásio', 'Insígnia', 'Pokédex', 'Ash', 'Equipe Rocket', 'Charmander', 'Bulbasaur', 'Squirtle', 'Evolução', 'Tipo', 'Fogo', 'Água', 'Grama', 'Elétrico', 'Lendário', 'Mítico', 'Batalha', 'Ataque', 'Defesa', 'HP', 'XP', 'Região', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Galar', 'Starter', 'Capturar', 'Elite Four', 'Campeão', 'Mega Evolução', 'Shiny', 'Raid'],
  godofwar: ['Kratos', 'Atreus', 'Leviathan', 'Blades of Chaos', 'Mitologia', 'Nórdica', 'Olimpo', 'Deus', 'Guerra', 'Vingança', 'Pai', 'Filho', 'Ragnarok', 'Thor', 'Odin', 'Freya', 'Batalha', 'Boss', 'Machado', 'Espadas', 'Valhalla', 'Monstro', 'Saga', 'Herói'],
  kpop: ['BTS', 'BLACKPINK', 'TWICE', 'EXO', 'STRAY KIDS', 'SEVENTEEN', 'TXT', 'IVE', 'AESPA', 'ITZY', 'RED VELVET', 'ENHYPEN', 'NCT', 'NCT 127', 'NCT DREAM', 'GOT7', 'MONSTA X', 'ATEEZ', 'LE SSERAFIM', 'NEWJEANS', '(G)I-DLE', 'BABYMONSTER', 'TREASURE', 'BIGBANG', 'SHINee', 'SUPER JUNIOR', 'MAMAMOO', 'KISS OF LIFE', 'STAYC', 'ILLIT'],
  bts: ['RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook', 'ARMY', 'BigHit', 'HYBE', 'Bangtan', 'Mic Drop', 'Dynamite', 'Butter', 'Permission to Dance', 'Fake Love', 'Boy With Luv', 'Spring Day', 'Run BTS', 'Golden Maknae', 'Rap Line', 'Vocal Line', 'Maknae Line', 'Lightstick', 'Concert', 'World Tour', 'Comeback', 'Album', 'Solo', 'Fandom', 'Stage', 'Dance'],
  harrypotter: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore', 'Severus Snape', 'Lord Voldemort', 'Draco Malfoy', 'Minerva McGonagall', 'Sirius Black', 'Rubeus Hagrid', 'Bellatrix Lestrange', 'Neville Longbottom', 'Luna Lovegood', 'Ginny Weasley', 'Hogwarts', 'Grifinória', 'Sonserina', 'Corvinal', 'Lufa-Lufa', 'Beco Diagonal', 'Plataforma 9¾', 'Quadribol', 'Varinha das Varinhas', 'Pedra Filosofal', 'Câmara Secreta', 'Prisioneiro de Azkaban', 'Cálice de Fogo', 'Ordem da Fênix', 'Enigma do Príncipe', 'Relíquias da Morte', 'Horcrux', 'Patrono', 'Azkaban'],
  starwars: ['Luke Skywalker', 'Leia Organa', 'Han Solo', 'Darth Vader', 'Anakin Skywalker', 'Obi-Wan Kenobi', 'Yoda', 'Palpatine', 'Kylo Ren', 'Rey', 'Chewbacca', 'R2-D2', 'C-3PO', 'Boba Fett', 'Mandalorian', 'Grogu', 'Millennium Falcon', 'Estrela da Morte', 'Tatooine', 'Endor', 'Hoth', 'Naboo', 'Coruscant', 'Jedi', 'Sith', 'Sabre de Luz', 'Ordem 66', 'Guerra dos Clones', 'Império Galáctico', 'Aliança Rebelde', 'Lado Sombrio', 'Força', 'Trilogia Original', 'Saga Skywalker', 'Stormtrooper'],
  walkingdead: ['Rick Grimes', 'Daryl Dixon', 'Michonne', 'Negan', 'Carl Grimes', 'Maggie Greene', 'Glenn Rhee', 'Carol Peletier', 'Morgan Jones', 'Judith Grimes', 'Governador', 'Lucille', 'Alexandria', 'Hilltop', 'Reino', 'Santuário', 'Whisperers', 'Alpha', 'Beta', 'Caminhantes', 'CDC', 'Prisão', 'Atlanta', 'Sobreviventes', 'Apocalipse', 'Horda', 'Facão', 'Besta', 'Crossbow', 'Série', 'Temporada'],
  lacasadepapel: ['Professor', 'Tóquio', 'Berlim', 'Nairóbi', 'Rio', 'Denver', 'Moscou', 'Lisboa', 'Palermo', 'Helsinque', 'Oslo', 'Marselha', 'Bogotá', 'Raquel Murillo', 'Máscara de Dalí', 'Macacão Vermelho', 'Casa da Moeda', 'Banco da Espanha', 'Ouro', 'Cofre', 'Assalto', 'Plano', 'Túnel', 'Reféns', 'Polícia Nacional', 'Interpol', 'Helicóptero', 'Impressora', 'Dinheiro', 'Resistência', 'Bella Ciao'],
  theboys: ['Homelander', 'Billy Butcher', 'Starlight', 'Queen Maeve', 'A-Train', 'The Deep', 'Black Noir', 'Soldier Boy', 'Vought', 'Compound V', 'The Seven', 'Ryan Butcher', 'Temp V', 'Lamplighter', 'Stormfront', 'Translucent', 'Supes', 'Torres Vought', 'Madelyn Stillwell', 'Ashley Barrett', 'Neuman', 'Red River', 'Godolkin', 'Payback'],
  got: ['Jon Snow', 'Daenerys Targaryen', 'Tyrion Lannister', 'Cersei Lannister', 'Jaime Lannister', 'Arya Stark', 'Sansa Stark', 'Ned Stark', 'Bran Stark', 'Robb Stark', 'Casa Stark', 'Casa Lannister', 'Casa Targaryen', 'Dragões', 'Trono de Ferro', 'Winterfell', 'Porto Real', 'Muralha', 'Patrulha da Noite', 'White Walkers', 'Rei da Noite', 'Além da Muralha', 'Valar Morghulis', 'Valar Dohaeris', 'Espada Longclaw', 'Espada Agulha', 'Fogo Valiriano', 'Casamento Vermelho', 'Baía dos Escravos', 'Meereen', 'Dothraki', 'Imaculados', 'Sete Reinos', 'Westeros'],
  round6: ['Seong Gi-hun', 'Kang Sae-byeok', 'Oh Il-nam', 'Cho Sang-woo', 'Front Man', 'Jogador 001', 'Jogador 456', 'Boneca Gigante', 'Luz Vermelha Luz Verde', 'Batatinha Frita 1 2 3', 'Dalgona', 'Biscoito de Açúcar', 'Ponte de Vidro', 'Cabo de Guerra', 'Bolinhas de Gude', 'Máscara Quadrada', 'Máscara Triangular', 'Máscara Circular', 'Cartão Convite', 'Ilha', 'VIPs', 'Cofre', 'Prêmio em Dinheiro', 'Último Jogo'],
  onepiece: ['Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe', 'Shanks', 'Barba Branca', 'Barba Negra', 'Ace', 'Sabo', 'Gol D. Roger', 'Chapéu de Palha', 'Going Merry', 'Thousand Sunny', 'Grand Line', 'Novo Mundo', 'Akuma no Mi', 'Haki', 'Gear Second', 'Gear Fourth', 'Gear Fifth', 'Marinha', 'Almirante', 'Yonkou', 'Revolucionários', 'Laugh Tale', 'Wano', 'Dressrosa', 'Skypiea'],
  aot: ['Eren Yeager', 'Mikasa', 'Armin', 'Levi', 'Erwin', 'Hange', 'Titã', 'Titã Colossal', 'Titã Blindado', 'Titã Bestial', 'Titã Fundador', 'Muralha Maria', 'Muralha Rose', 'Muralha Sina', 'Tropa de Exploração', 'Equipamento 3D', 'Paradis', 'Marley', 'Rumbling', 'Eldianos', 'Ymir', 'Paths', 'Shiganshina'],
  jjk: ['Yuji Itadori', 'Satoru Gojo', 'Megumi Fushiguro', 'Nobara Kugisaki', 'Sukuna', 'Geto', 'Toji Fushiguro', 'Domínio', 'Expansão de Domínio', 'Energia Amaldiçoada', 'Maldição', 'Feiticeiro', 'Escola Jujutsu', 'Shibuya', 'Técnica Inata', 'Seis Olhos', 'Infinito', 'Black Flash', 'Mahito', 'Jogo do Abate', 'Rika', 'Yuta Okkotsu'],
  demonslayer: ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke', 'Kagaya', 'Muzan', 'Hashira', 'Respiração da Água', 'Respiração do Fogo', 'Respiração do Trovão', 'Respiração da Besta', 'Lâmina Nichirin', 'Onis', 'Lua Superior', 'Lua Inferior', 'Trem Infinito', 'Distrito do Entretenimento', 'Espadas', 'Caçador', 'Demônio', 'Sangue', 'Kibutsuji'],
  mha: ['Izuku Midoriya', 'All Might', 'Bakugo', 'Todoroki', 'Uraraka', 'Endeavor', 'One For All', 'All For One', 'Quirk', 'U.A.', 'Herói', 'Vilão', 'Liga dos Vilões', 'Shigaraki', 'Dabi', 'Hawks', 'Eraser Head', 'Gran Torino', 'Estágio', 'Festival Esportivo', 'Nomu', 'Uniforme', 'Treinamento', 'Plus Ultra'],
  tokyoghoul: ['Kaneki', 'Touka', 'Rize', 'Anteiku', 'CCG', 'Investigador', 'Ghoul', 'Máscara', 'Kagune', 'Kakuja', 'Aogiri', 'Jason', 'Hinami', 'Arima', 'Quinx', 'Olho Vermelho', 'Café', 'Identidade', 'Tragédia', 'Metamorfose', 'Caçador'],
  chainsawman: ['Denji', 'Pochita', 'Makima', 'Power', 'Aki', 'Chainsaw', 'Demônio', 'Caçador de Demônios', 'Contrato', 'Sangue', 'Katana Man', 'Gun Devil', 'Controle', 'Inferno', 'Anjo', 'Violência', 'Motoserra', 'Caos', 'Medo', 'Morte', 'Infernal']
};

// Mapa de dicas para palavras (palavra -> dica)
const WORD_HINTS: Record<string, string> = {
  'Cadeira': 'Pernas',
  'Mesa': 'Tampo',
  'Sofá': 'Braços',
  'Cama': 'Cabeceira',
  'Guarda-roupa': 'Portas',
  'Estante': 'Níveis',
  'Abajur': 'Cúpula',
  'Tapete': 'Fios',
  'Cortina': 'Trilho',
  'Espelho': 'Face',
  'Poltrona': 'Encosto',
  'Escrivaninha': 'Gavetas',
  'Colchão': 'Molas',
  'Berço': 'Grades',
  'Rede': 'Ganchos',
  'Banco': 'Porta',
  'Prateleira': 'Suporte',
  'Ventilador': 'Pás',
  'Ar-condicionado': 'Filtro',
  'Lareira': 'Chaminé',
  'Geladeira': 'Prateleiras',
  'Fogão': 'Bocas',
  'Micro-ondas': 'Botões',
  'Liquidificador': 'Lâminas',
  'Garfo': 'Dentes',
  'Colher': 'Concha',
  'Faca': 'Cabo',
  'Prato': 'Borda',
  'Copo': 'Boca',
  'Xícara': 'Asa',
  'Panela': 'Cabo',
  'Frigideira': 'Antiaderente',
  'Tábua de carne': 'Sulco',
  'Ralo': 'Furos',
  'Peneira': 'Trama',
  'Abridor de latas': 'Manivela',
  'Saca-rolhas': 'Rosca',
  'Palito de dente': 'Pontas',
  'Guardanapo': 'Dobra',
  'Toalha de mesa': 'Caimento',
  'Detergente': 'Bolhas',
  'Esponja': 'Furos',
  'Lixeira': 'Pedal',
  'Vassoura': 'Cabo',
  'Rodo': 'Borracha',
  'Pá': 'Cabo',
  'Balde': 'Alça',
  'Pregador': 'Mola',
  'Varal': 'Corda',
  'Ferro de passar': 'Base',
  'Escova de dentes': 'Cerdas',
  'Pasta de dente': 'Tampa',
  'Pente': 'Dentes',
  'Shampoo': 'Tampa',
  'Sabonete': 'Espuma',
  'Toalha': 'Felpas',
  'Desodorante': 'Jato',
  'Perfume': 'Válvula',
  'Cortador de unha': 'Alavanca',
  'Pinça': 'Pontas',
  'Maquiagem': 'Cor',
  'Batom': 'Bastão',
  'Espelho de bolso': 'Vidro',
  'Protetor solar': 'Fator',
  'Óculos': 'Hastes',
  'Relógio': 'Pulseira',
  'Anel': 'Círculo',
  'Colar': 'Fecho',
  'Brinco': 'Tarraxa',
  'Pulseira': 'Elo',
  'Carteira': 'Divisórias',
  'Bolsa': 'Zíper',
  'Mochila': 'Alças',
  'Mala': 'Rodinhas',
  'Chave': 'Segredo',
  'Guarda-chuva': 'Varetas',
  'Isqueiro': 'Pedra',
  'Fósforo': 'Cabeça',
  'Caneta': 'Esfera',
  'Lápis': 'Ponta',
  'Borracha': 'Farelo',
  'Apontador': 'Lâmina',
  'Caderno': 'Espiral',
  'Livro': 'Capa',
  'Agenda': 'Dias',
  'Tesoura': 'Elos',
  'Cola': 'Bico',
  'Régua': 'Traços',
  'Grampeador': 'Mola',
  'Clips': 'Metal',
  'Post-it': 'Cola',
  'Calculadora': 'Teclas',
  'Envelope': 'Aba',
  'Papel': 'Fibra',
  'Pasta': 'Elástico',
  'Estojo': 'Zíper',
  'Quadro branco': 'Moldura',
  'Giz': 'Pó',
  'Canetão': 'Feltro',
  'Compasso': 'Ponta',
  'Dicionário': 'Letras',
  'Escola': 'Muros',
  'Hospital': 'Corredores',
  'Correio': 'Fila',
  'Farmácia': 'Balcão',
  'Padaria': 'Forno',
  'Supermercado': 'Carrinho',
  'Shopping': 'Escada',
  'Cinema': 'Poltrona',
  'Teatro': 'Cortina',
  'Museu': 'Vidro',
  'Biblioteca': 'Estantes',
  'Restaurante': 'Mesa',
  'Lanchonete': 'Chapa',
  'Bar': 'Balcão',
  'Academia': 'Pesos',
  'Parque': 'Grama',
  'Praça': 'Banco',
  'Igreja': 'Torre',
  'Cemitério': 'Pedra',
  'Delegacia': 'Grade',
  'Corpo de Bombeiros': 'Sirene',
  'Hotel': 'Chave',
  'Motel': 'Garagem',
  'Aeroporto': 'Pista',
  'Rodoviária': 'Plataforma',
  'Estação de trem': 'Trilho',
  'Metrô': 'Porta',
  'Ponto de ônibus': 'Placa',
  'Estádio': 'Cadeira',
  'Zoológico': 'Grade',
  'Circo': 'Lona',
  'Parque de diversões': 'Fila',
  'Prefeitura': 'Bandeira',
  'Faculdade': 'Sala',
  'Praia': 'Grão',
  'Montanha': 'Pico',
  'Floresta': 'Troncos',
  'Deserto': 'Grãos',
  'Cachoeira': 'Pedras',
  'Rio': 'Margem',
  'Lago': 'Borda',
  'Mar': 'Espuma',
  'Oceano': 'Fundo',
  'Ilha': 'Areia',
  'Caverna': 'Entrada',
  'Vulcão': 'Cone',
  'Geleira': 'Fenda',
  'Pântano': 'Raízes',
  'Campo': 'Grama',
  'Fazenda': 'Cerca',
  'Sítio': 'Porteira',
  'Horta': 'Terra',
  'Jardim': 'Vaso',
  'Quintal': 'Muro',
  'Céu': 'Nuvens',
  'Lua': 'Cratera',
  'Marte': 'Poeira',
  'Espaço': 'Vácuo',
  'Quarto': 'Porta',
  'Sala': 'Janela',
  'Cozinha': 'Pia',
  'Banheiro': 'Azulejo',
  'Varanda': 'Grade',
  'Garagem': 'Portão',
  'Sótão': 'Telha',
  'Porão': 'Escada',
  'Corredor': 'Parede',
  'Elevador': 'Botão',
  'Escada': 'Degrau',
  'Piscina': 'Borda',
  'Sauna': 'Madeira',
  'Quadra': 'Linha',
  'Vestiário': 'Banco',
  'Maçã': 'Casca',
  'Banana': 'Cacho',
  'Laranja': 'Gomos',
  'Uva': 'Cacho',
  'Morango': 'Pintas',
  'Abacaxi': 'Coroa',
  'Melancia': 'Sementes',
  'Melão': 'Casca',
  'Limão': 'Gomos',
  'Manga': 'Caroço',
  'Pera': 'Cabo',
  'Pêssego': 'Caroço',
  'Abacate': 'Caroço',
  'Coco': 'Fibra',
  'Cereja': 'Cabo',
  'Kiwi': 'Pelos',
  'Maracujá': 'Sementes',
  'Goiaba': 'Sementes',
  'Mamão': 'Sementes',
  'Caju': 'Castanha',
  'Açaí': 'Caroço',
  'Alface': 'Folhas',
  'Tomate': 'Pele',
  'Cenoura': 'Rama',
  'Batata': 'Olhos',
  'Cebola': 'Camadas',
  'Alho': 'Dentes',
  'Brócolis': 'Talo',
  'Couve-flor': 'Buquê',
  'Espinafre': 'Maço',
  'Pepino': 'Casca',
  'Pimentão': 'Sementes',
  'Abóbora': 'Casca',
  'Berinjela': 'Casca',
  'Milho': 'Sabugo',
  'Feijão': 'Vagem',
  'Arroz': 'Grão',
  'Macarrão': 'Fios',
  'Pizza': 'Borda',
  'Hambúrguer': 'Disco',
  'Cachorro-quente': 'Molho',
  'Batata frita': 'Palito',
  'Lasanha': 'Camadas',
  'Churrasco': 'Espeto',
  'Sushi': 'Arroz',
  'Sashimi': 'Fatia',
  'Temaki': 'Alga',
  'Coxinha': 'Ponta',
  'Pastel': 'Vento',
  'Esfiha': 'Borda',
  'Kibe': 'Bico',
  'Pão de queijo': 'Casca',
  'Sanduíche': 'Recheio',
  'Sopa': 'Caldo',
  'Salada': 'Tempero',
  'Omelete': 'Dobra',
  'Ovo frito': 'Gema',
  'Bife': 'Fibra',
  'Frango assado': 'Osso',
  'Peixe': 'Espinha',
  'Chocolate': 'Barra',
  'Sorvete': 'Casquinha',
  'Bolo': 'Cobertura',
  'Torta': 'Massa',
  'Pudim': 'Calda',
  'Brigadeiro': 'Granulado',
  'Beijinho': 'Cravo',
  'Paçoca': 'Farelo',
  'Chiclete': 'Bolha',
  'Bala': 'Papel',
  'Pirulito': 'Palito',
  'Gelatina': 'Pó',
  'Mousse': 'Bolhas',
  'Panqueca': 'Disco',
  'Waffle': 'Furos',
  'Mel': 'Pote',
  'Açúcar': 'Grão',
  'Água': 'Reflexo',
  'Suco': 'Jarra',
  'Refrigerante': 'Gás',
  'Café': 'Pó',
  'Chá': 'Sachê',
  'Leite': 'Nata',
  'Cerveja': 'Espuma',
  'Vinho': 'Rolha',
  'Vodka': 'Garrafa',
  'Whisky': 'Gelo',
  'Champanhe': 'Rolha',
  'Água de coco': 'Canudo',
  'Limonada': 'Gelo',
  'Milkshake': 'Canudo',
  'Cachorro': 'Rabo',
  'Gato': 'Bigode',
  'Hamster': 'Bochecha',
  'Coelho': 'Orelhas',
  'Papagaio': 'Bico',
  'Canário': 'Penas',
  'Peixinho': 'Escamas',
  'Cavalo': 'Crina',
  'Vaca': 'Manchas',
  'Boi': 'Chifre',
  'Porco': 'Rabo',
  'Galinha': 'Penas',
  'Galo': 'Crista',
  'Pato': 'Bico',
  'Ovelha': 'Lã',
  'Cabra': 'Barba',
  'Burro': 'Orelhas',
  'Leão': 'Juba',
  'Tigre': 'Listras',
  'Onça': 'Pintas',
  'Elefante': 'Tromba',
  'Girafa': 'Manchas',
  'Zebra': 'Listras',
  'Hipopótamo': 'Dentes',
  'Rinoceronte': 'Chifre',
  'Macaco': 'Rabo',
  'Gorila': 'Peito',
  'Urso': 'Pelos',
  'Panda': 'Manchas',
  'Lobo': 'Pelos',
  'Raposa': 'Rabo',
  'Canguru': 'Bolsa',
  'Camelo': 'Corcovas',
  'Veado': 'Chifres',
  'Javali': 'Presas',
  'Tubarão': 'Barbatana',
  'Baleia': 'Cauda',
  'Golfinho': 'Bico',
  'Foca': 'Bigode',
  'Pinguim': 'Asas',
  'Polvo': 'Ventosas',
  'Lula': 'Tentáculos',
  'Caranguejo': 'Pinças',
  'Lagosta': 'Antenas',
  'Camarão': 'Antenas',
  'Tartaruga': 'Casco',
  'Jacaré': 'Escamas',
  'Crocodilo': 'Dentes',
  'Sapo': 'Pele',
  'Águia': 'Garras',
  'Falcão': 'Bico',
  'Coruja': 'Olhos',
  'Pombo': 'Penas',
  'Gaivota': 'Bico',
  'Avestruz': 'Pescoço',
  'Pavão': 'Cauda',
  'Flamingo': 'Pernas',
  'Tucano': 'Bico',
  'Borboleta': 'Antenas',
  'Abelha': 'Ferrão',
  'Formiga': 'Antenas',
  'Mosca': 'Asas',
  'Mosquito': 'Asas',
  'Aranha': 'Pernas',
  'Escorpião': 'Cauda',
  'Barata': 'Antenas',
  'Besouro': 'Casca',
  'Minhoca': 'Anéis',
  'Cobra': 'Pele',
  'Médico': 'Jaleco',
  'Enfermeiro': 'Seringa',
  'Dentista': 'Cadeira',
  'Veterinário': 'Consultório',
  'Psicólogo': 'Poltrona',
  'Professor': 'Lousa',
  'Advogado': 'Pasta',
  'Juiz': 'Martelo',
  'Policial': 'Distintivo',
  'Bombeiro': 'Capacete',
  'Detetive': 'Lupa',
  'Soldado': 'Farda',
  'Piloto': 'Painel',
  'Aeromoça': 'Carrinho',
  'Astronauta': 'Capacete',
  'Motorista': 'Volante',
  'Taxista': 'Taxímetro',
  'Caminhoneiro': 'Cabine',
  'Mecânico': 'Graxa',
  'Eletricista': 'Fios',
  'Encanador': 'Cano',
  'Pedreiro': 'Colher',
  'Arquiteto': 'Papel',
  'Engenheiro': 'Capacete',
  'Pintor': 'Pincel',
  'Carpinteiro': 'Serra',
  'Jardineiro': 'Tesoura',
  'Cozinheiro': 'Avental',
  'Chef': 'Chapéu',
  'Garçom': 'Bandeja',
  'Padeiro': 'Farinha',
  'Açougueiro': 'Faca',
  'Agricultor': 'Chapéu',
  'Pescador': 'Rede',
  'Ator': 'Palco',
  'Cantor': 'Microfone',
  'Músico': 'Instrumento',
  'Dançarino': 'Sapatilha',
  'Escritor': 'Teclado',
  'Jornalista': 'Microfone',
  'Fotógrafo': 'Lente',
  'Programador': 'Tela',
  'Cientista': 'Microscópio',
  'Político': 'Terno',
  'Padre': 'Batina',
  'Pastor': 'Bíblia',
  'Mágico': 'Cartola',
  'Palhaço': 'Nariz',
  'Atleta': 'Uniforme',
  'Futebol': 'Trave',
  'Vôlei': 'Rede',
  'Basquete': 'Aro',
  'Tênis': 'Cadarço',
  'Natação': 'Raia',
  'Corrida': 'Faixa',
  'Ciclismo': 'Guidão',
  'Skate': 'Lixa',
  'Patins': 'Freio',
  'Surfe': 'Prancha',
  'Judô': 'Faixa',
  'Karatê': 'Kimono',
  'Boxe': 'Ringue',
  'Golfe': 'Buraco',
  'Beisebol': 'Taco',
  'Futebol Americano': 'Bola',
  'Ginástica': 'Colchão',
  'Dança': 'Espelho',
  'Ioga': 'Tapete',
  'Musculação': 'Barra',
  'Xadrez': 'Tabuleiro',
  'Dama': 'Casas',
  'Baralho': 'Naipes',
  'Dominó': 'Pontos',
  'Videogame': 'Joystick',
  'Quebra-cabeça': 'Encaixe',
  'Palavras cruzadas': 'Quadrados',
  'Sinuca': 'Caçapa',
  'Boliche': 'Canaleta',
  'Dardo': 'Ponta',
  'Pipa': 'Linha',
  'Esconde-esconde': 'Parede',
  'Pega-pega': 'Toque',
  'Acampar': 'Lona',
  'Pescar': 'Anzol',
  'Ler': 'Página',
  'Pintar': 'Tinta',
  'Desenhar': 'Traço',
  'Tocar violão': 'Cordas',
  'Tocar piano': 'Teclas',
  'Tocar bateria': 'Pratos',
  'Cantar': 'Letra',
  'Cozinhar': 'Panela',
  'Viajar': 'Passaporte',
  'Tirar fotos': 'Flash',
  'Assistir filmes': 'Tela',
  'Ouvir música': 'Fone',
  'Camiseta': 'Gola',
  'Camisa': 'Botões',
  'Blusa': 'Tecido',
  'Jaqueta': 'Zíper',
  'Casaco': 'Bolso',
  'Moletom': 'Capuz',
  'Suéter': 'Trama',
  'Colete': 'Cava',
  'Calça': 'Barra',
  'Short': 'Elástico',
  'Bermuda': 'Bolso',
  'Saia': 'Bainha',
  'Vestido': 'Alça',
  'Terno': 'Lapela',
  'Gravata': 'Nó',
  'Smoking': 'Faixa',
  'Pijama': 'Botão',
  'Roupão': 'Faixa',
  'Biquíni': 'Laço',
  'Maiô': 'Decote',
  'Sunga': 'Cordão',
  'Calcinha': 'Renda',
  'Cueca': 'Elástico',
  'Meia': 'Lã',
  'Sapato': 'Sola',
  'Bota': 'Sola',
  'Sandália': 'Fivela',
  'Chinelo': 'Tiras',
  'Salto alto': 'Bico',
  'Chuteira': 'Travas',
  'Boné': 'Aba',
  'Chapéu': 'Copa',
  'Touca': 'Dobra',
  'Capacete': 'Viseira',
  'Luva': 'Dedos',
  'Cachecol': 'Franja',
  'Cinto': 'Fivela',
  'Carro': 'Volante',
  'Moto': 'Guidão',
  'Caminhão': 'Carroceria',
  'Ônibus': 'Catraca',
  'Bicicleta': 'Corrente',
  'Patinete': 'Base',
  'Trem': 'Vagão',
  'Avião': 'Turbina',
  'Helicóptero': 'Hélice',
  'Barco': 'Casco',
  'Navio': 'Chaminé',
  'Iate': 'Convés',
  'Submarino': 'Periscópio',
  'Foguete': 'Bico',
  'Balão': 'Cesto',
  'Dirigível': 'Gôndola',
  'Táxi': 'Letreiro',
  'Uber': 'Mapa',
  'Trator': 'Pneu',
  'Ambulância': 'Maca',
  'Viatura': 'Giroflex',
  'Carro de bombeiro': 'Mangueira',
  'Celular': 'Tela',
  'Smartphone': 'Câmera',
  'Tablet': 'Borda',
  'Computador': 'Cabo',
  'Notebook': 'Teclado',
  'Teclado': 'Teclas',
  'Mouse': 'Scroll',
  'Monitor': 'Base',
  'Impressora': 'Bandeja',
  'Câmera': 'Disparador',
  'Fone de ouvido': 'Fio',
  'Microfone': 'Espuma',
  'Caixa de som': 'Tela',
  'Televisão': 'Controle',
  'Controle remoto': 'Pilha',
  'Robô': 'Metal',
  'Drone': 'Câmera',
  'Satélite': 'Painel',
  'Internet': 'Cabo',
  'Wi-Fi': 'Sinal',
  'Bateria': 'Polo',
  'Carregador': 'Plugue',
  'Cabo USB': 'Conector',
  'Pen drive': 'Tampa',
  'Chuva': 'Poça',
  'Sol': 'Raios',
  'Vento': 'Movimento',
  'Neve': 'Branco',
  'Tempestade': 'Nuvens',
  'Raio': 'Clarão',
  'Trovão': 'Estrondo',
  'Arco-íris': 'Arco',
  'Furacão': 'Olho',
  'Tornado': 'Funil',
  'Terremoto': 'Rachadura',
  'Tsunami': 'Onda',
  'Eclipse': 'Sombra',
  'Amanhecer': 'Horizonte',
  'Pôr do sol': 'Horizonte',
  'Noite': 'Escuro',
  'Dia': 'Claridade',
  'Calor': 'Suor',
  'Frio': 'Arrepio',
  'Fogo': 'Cinzas',
  'Fumaça': 'Cheiro',
  'Gelo': 'Cubo',
  'Vapor': 'Branco',
  'Areia': 'Grão',
  'Terra': 'Marrom',
  'Pedra': 'Dura',
  'Ouro': 'Amarelo',
  'Prata': 'Cinza',
  'Diamante': 'Pontas',
  'Fantasma': 'Lençol',
  'Vampiro': 'Dentes',
  'Lobisomem': 'Pelos',
  'Zumbi': 'Pele',
  'Bruxa': 'Chapéu',
  'Fada': 'Varinha',
  'Sereia': 'Escamas',
  'Dragão': 'Escamas',
  'Unicórnio': 'Crina',
  'Alienígena': 'Olhos',
  'Super-herói': 'Capa',
  'Vilão': 'Risada',
  'Múmia': 'Faixa',
  'Gigante': 'Pegada',
  'Anão': 'Barba',
  'Elfo': 'Orelhas',
  'Mago': 'Cajado',
  'Terror': 'Grito',
  'Comédia': 'Risada',
  'Romance': 'Beijo',
  'Ação': 'Explosão',
  'Ficção Científica': 'Nave',
  'Faroeste': 'Chapéu',
  'Musical': 'Microfone',
  'Desenho animado': 'Traço',
  'Anime': 'Olhos',
  'Mangá': 'Preto e Branco',
  'Gibi': 'Balão',
  'Papai Noel': 'Saco',
  'Jesus Cristo': 'Cruz',
  'Anjo': 'Auréola',
  'Menino Jesus': 'Palha',
  'Reis Magos': 'Camelo',
  'Rena': 'Chifres',
  'Família': 'Abraço',
  'Árvore de Natal': 'Estrela',
  'Presentes': 'Fita',
  'Luzes': 'Fio',
  'Pisca-pisca': 'Lâmpada',
  'Estrela': 'Pontas',
  'Sino': 'Metal',
  'Vela': 'Pavio',
  'Guirlanda': 'Folhas',
  'Bola de Natal': 'Gancho',
  'Presépio': 'Palha',
  'Trenó': 'Madeira',
  'Chaminé': 'Tijolo',
  'Boneco de neve': 'Graveto',
  'Floco de neve': 'Pontas',
  'Gorro': 'Pompom',
  'Festão': 'Brilho',
  'Ceia': 'Mesa',
  'Peru': 'Osso',
  'Panetone': 'Papel',
  'Rabanada': 'Açúcar',
  'Uva-passa': 'Rugas',
  'Nozes': 'Casca',
  'Castanha': 'Casca',
  'Vinho quente': 'Cravo',
  'Canções natalinas': 'Letra',
  'Cartão de Natal': 'Envelope',
  'Tradição': 'Repetição',
  'Véspera': 'Noite',
  'Amor': 'Coração',
  'Paz': 'Pomba',
  'Esperança': 'Verde',
  'Alegria': 'Sorriso',
  'União': 'Mãos',
  'Magia': 'Cartola',
  'Perdão': 'Abraço',
  'Generosidade': 'Mão',
  'Harmonia': 'Música',
  'Fraternidade': 'Abraço',
  'Reflexão': 'Espelho',
  'Gratidão': 'Sorriso',
  'Renovação': 'Ciclo'
};

// Hints indexed by submode/theme key, parallel to PALAVRA_SECRETA_SUBMODES_DATA words array
const THEME_HINTS: Record<string, string[]> = {
  natal: ['Lenda','Fundamento','Divindade','Inocência','Jornada','Ofício','Condução','Vínculo','Centralidade','Retribuição','Vigilância','Intermitência','Orientação','Anúncio','Efêmero','Recepção','Esfericidade','Representação','Extremidade','Deslizamento','Passagem','Sazonalidade','Geometria','Proteção','Topo','Continuidade','Ritual','Abundância','Fermentação','Reaproveitamento','Controvérsia','Resistência','Proteína','Temperatura','Lirismo','Cordialidade','Hábito','Expectativa','Absoluto','Ausência','Perspectiva','Euforia','Coesão','Sobrenatural','Conciliação','Altruísmo','Equilíbrio','Irmandade','Introspecção','Reconhecimento','Ciclo'],
  estrategia: ['Elementar','Impetuosidade','Distância','Resiliência','Dualidade','Agilidade','Blindagem','Lentidão','Aéreo','Invocação','Infiltração','Equilíbrio','Arremesso','Interrupção','Defesa','Divisão','Aceleração','Transparência','Controle','Retorno'],
  animes: ['Superação','Reconhecimento','Liberdade','Empatia','Proteção','Tédio','Rancor','Legado','Absoluto','Dever','Percepção','Liberação','Energia','Concentração','Escala','Ceifador','Fluxo','Forja','Divergência','Conhecimento'],
  herois: ['Responsabilidade','Divindade','Dualidade','Liderança','Intelecto','Dissimulação','Ancestralidade','Misticismo','Equilíbrio','Travessura','Lógica','Natureza','Sobrevivência','Realidade','Sintético','Proteção','Dignidade','Singularidade','Conspiração','Raridade'],
  seriesMisterio: ['Trauma','Idealismo','Ceticismo','Carisma','Vulnerabilidade','Velocidade','Autoridade','Persistência','Remorso','Predação','Dominação','Pacatice','Reflexo','Negligência','Perspicácia','Redenção','Fúria','Performance','Paranoia','Marginalidade','Paternalismo','Distância','Astúcia','Confinamento','Inverno','Sinal','Lazer','Consumo','Rebeldia','Vínculo'],
  futebol: ['Massivo','Identidade','Soberania','Constância','Juventude','Navegação','Altitude','Imortalidade','Paixão','Resiliência','Aristocracia','Solidão','Modernidade','Regionalismo','Tradição','Rugido','Paraná','Centro','Fortaleza','Longevidade'],
  disney: ['Ícone','Parceria','Ingenuidade','Nobreza','Lealdade','Realeza','Fantasia','Inovação','Heroísmo','Galáxia','Congelamento','Isolamento','Coragem','Orgulho','Poder','Astúcia','Desejo','Profundidade','Aventura','Liberdade','Encantamento','Infinito','Amizade','Oceano','Sonho','Magia','Destino','Nobreza','Beleza','Transformação'],
  valorant: ['Objetivo','Posicionamento','Anulação','Isolamento','Superioridade','Precisão','Hierarquia','Auge','Eternidade','Elevação','Pureza','Resistência','Valor','Evasão','Renascimento','Estabilidade','Rastreio','Toxicidade','Vigilância','Sustento','Automação','Impacto','Obscuridade','Entusiasmo','Conexão','Dimensão','Cosmos','Supressão','Ostentação','Eletricidade','Pesadelo','Fluidez','Simbioze','Restrição','Foco','Dualidade','Aço','Verticalidade','Passagem','Trindade','Divisão','Amplitude','Ruptura','Tranquilidade','Frio','Submerso','Crepúsculo','Potência','Sutileza','Distância','Autoridade','Velocidade','Vigilância'],
  roblox: ['Capital','Projeção','Inexperiência','Hierarquia','Exclusão','Obstáculo','Acúmulo','Cuidado','Simulação','Subsistência','Intriga','Passagem','Perseguição','Coleção','Desafio','Reação','Irmandade','Privilégio','Sazonalidade','Estética','Utilitário','Interação','Ambiente','Hospedagem','Intrusão','Falha','Negociação','Exposição','Ascensão','Confronto','Convivência','Território','Catástrofe','Fuga'],
  supernatural: ['Proteção','Destino','Dúvida','Oportunismo','Herança','Suporte','Rebelião','Dever','Danação','Remanescente','Pureza','Sacramento','Isolamento','Profecia','Ofício','Registros','Intermediário','Sofrimento','Paraíso','Singularidade','Traição','Corrupção','Invasão','Libertação','Escolha','Negociação','Ausência','Origem','Ambição','Criação','Vazio','Escriba','Fome','Sede','Ciclo','Fundação'],
  dragonball: ['Pureza','Orgulho','Potencial','Sabedoria','Tirania','Perfeição','Caos','Busca','Realização','Linhagem','Ascensão','Energia','Coletividade','União','Elo','Futuro','Inocência','Intelecto','Resiliência','Experiência','Pureza','Localização','Glória','Essência','Instante','Ciborgue','Capricho','Zelo','Instinto','Origem','Primitivo','Tutela','Vitalidade','Totalidade','Precursor','Inovação'],
  naruto: ['Solidão','Vingança','Determinação','Remorso','Liderança','Comunidade','Energia','Rotação','Vibração','Percepção','Alcance','Divindade','Divergência','Sacrifício','Isolamento','Imortalidade','Errante','Aposta','Devoção','Ódio','Poder','Sacrifício','Alcance','Precisão','Compromisso','Provação','Dualidade','Ambição','Idealismo','Paz','Distração','Multiplicidade','Umidade','Conforto','Convicção'],
  rock: ['Revolução','Longevidade','Teatralidade','Energia','Excesso','Apatia','Intensidade','Folclore','Misticismo','Peso','Vitalidade','Angústia','Espetáculo','Persistência','Carisma','Ativismo','Atmosfera','Resiliência','Origem','Protesto','Simplicidade','Transição','Rebeldia','Expressão','Identidade','Melancolia','Raiz','Poesia','Juventude','Diversidade','Velocidade','Skate','Atitude','Maluquice','Irreverência'],
  minecraft: ['Padrão','Diferença','Instabilidade','Abstração','Decadência','Arqueria','Agilidade','Escambo','Alquimia','Mito','Soberania','Atrofia','Raridade','Brilho','Resistência','Combustão','Mecânica','Extração','Confronto','Eficiência','Manufatura','Transformação','Armazenamento','Repouso','Passagem','Finalidade','Estrutura','Ecossistema','Aridez','Vegetação','Escuridão','Esforço','Criação','Base','Lentidão','Inabalável','Temperatura','Ruptura'],
  gta: ['Retorno','Ambição','Crise','Instabilidade','Esperança','Ascensão','Simulação','Metrópole','Nostalgia','Estado','Raiz','Rivalidade','Território','Autoridade','Consequência','Aéreo','Blindagem','Verticalidade','Objetivo','Apropriação','Planejamento','Capital','Velocidade','Liberdade','Arsenal','Perseguição','Logística','Traição','Dissimulação','Parceria','Risco','Execução','Interação','Coleção','Estética','Queda','Vantagem'],
  fnaf: ['Autômatos','Liderança','Ritmo','Fome','Isolamento','Anomalia','Persistência','Contágio','Inocência','Simbioze','Controle','Manipulação','Equilíbrio','Entretenimento','Espetáculo','Fusão','Decadência','Suporte','Relutância','Dever','Culpa','Redenção','Invasão','Proteção','Vaidade','Agressividade','Dualidade','Dualidade','Estabelecimento','Corporação','Confinamento','Observação','Interface','Passagem','Condução','Restrição','Fonte','Recurso','Foco','Controle','Escuridão','Trabalho','Segurança','Resistência','Reação','Objetivo','Orientação','Interatividade','Busca','Segredo','Origem','Evolução','Finalização','Quarto','Subsolo','Modernidade','Desafio','Personalização','Especulação','História'],
  fortnite: ['Gênero','Progressão','Estética','Capital','Expressão','Início','Recurso','Sorte','Restrição','Condução','Terreno','Segurança','Coletividade','Parceria','Individualidade','Estrutura','Modificação','Proximidade','Distância','Versatilidade','Triunfo','Experiência','Hierarquia','Comércio','Ciclo','Renovação','Correção','Conexão','Espetáculo'],
  freefire: ['Gênero','Corporação','Início','Recurso','Terreno','Segurança','Coletividade','Individualidade','Prestígio','Estética','Identidade','Vantagem','Capital','Confronto','Área','Distância','Proteção','Impetuosidade','Espera','Privacidade','Irmandade','Assinatura','Sazonalidade','Melhoria','Precisão','Triunfo','Blindagem','Proteção','Companhia'],
  brawlstars: ['Identidade','Trunfo','Acessório','Potencial','Ganância','Sobrevivência','Dinâmica','Invasão','Engenharia','Eliminação','Terreno','Estética','Prestígio','Hierarquia','Força','Melhoria','Coletividade','Individualidade','Parceria','Sazonalidade','Progressão','Ciclo','Sorte','Ofensiva'],
  pokemon: ['Ícone','Confinamento','Vocação','Provação','Mérito','Conhecimento','Persistência','Antagonismo','Calor','Natureza','Fluidez','Metamorfose','Essência','Energia','Pureza','Vitalidade','Frequência','Mito','Raridade','Confronto','Iniciativa','Resistência','Vitalidade','Aprendizado','Território','Origem','Continuidade','Natureza','Espírito','Tradição','Escolha','Domínio','Hierarquia','Glória','Ascensão','Singularidade','Coletividade'],
  godofwar: ['Fúria','Curiosidade','Frio','Rancor','Crença','Inverno','Altitude','Soberania','Conflito','Reparação','Responsabilidade','Legado','Destino','Impetuosidade','Sabedoria','Duelo','Combate','Desafio','Corte','Lâmina','Glória','Abominação','Jornada','Sacrifício'],
  kpop: ['Impacto','Dualidade','Frequência','Origem','Rebeldia','Unidade','Esperança','Narcisismo','Futurismo','Confiança','Textura','Conexão','Infinito','Localização','Juventude','Sorte','Intensidade','Exploração','Resiliência','Nostalgia','Independência','Potencial','Raridade','Fundação','Brilho','Experiência','Harmonia','Vitalidade','Estrela','Atração'],
  bts: ['Liderança','Estética','Introspecção','Otimismo','Fluidez','Expressividade','Versatilidade','Lealdade','Origem','Expansão','Resistência','Autoridade','Energia','Fluidez','Liberdade','Desilusão','Afeto','Saudade','Desafio','Perfeição','Coletividade','Melodia','Hierarquia','Luz','Alcance','Jornada','Retorno','Obra','Individualidade','Fandom','Palco','Movimento'],
  harrypotter: ['Cicatriz','Amizade','Inteligência','Lealdade','Coragem','Ambição','Sabedoria','Bondade','Liderança','Magia','Proteção','Poder','Astúcia','Sacrifício','Conhecimento','Comércio','Esporte','Destino','Segredo','Maldade','Rebeldia','Amor','Mistério','Fogo','Prisão','Aventura','Tempo','Competição','Revelação','Morte','Fragmento','Proteção','Punição','Isolamento'],
  starwars: ['Esperança','Diplomacia','Aventura','Escuridão','Redenção','Sabedoria','Equilíbrio','Tirania','Conflito','Resistência','Lealdade','Mecânica','Protocolo','Caça','Honra','Inocência','Velocidade','Destruição','Deserto','Floresta','Gelo','Beleza','Poder','Ordem','Traição','Energia','Tragédia','Guerra','Império','Rebelião','Tentação','Força','Clássico','Saga','Obediência'],
  walkingdead: ['Liderança','Instinto','Habilidade','Vingança','Inocência','Determinação','Sacrifício','Sobrevivência','Redenção','Futuro','Tirania','Crueldade','Comunidade','Colina','Reino','Controle','Sussurro','Dominação','Lealdade','Ameaça','Ciência','Confinamento','Origem','Resistência','Colapso','Horda','Corte','Força','Precisão','Série','Temporada'],
  lacasadepapel: ['Estratégia','Identidade','Frieza','Emoção','Romance','Impulsividade','Sacrifício','Autoridade','Elegância','Brutalidade','Inteligência','Lealdade','Traição','Determinação','Disfarce','Uniformidade','Instituição','Segurança','Riqueza','Proteção','Invasão','Planejamento','Escavação','Reféns','Perseguição','Espionagem','Fuga','Impressão','Capital','Resistência','Revolução'],
  theboys: ['Patriotismo','Brutalidade','Esperança','Coragem','Velocidade','Profundidade','Invisibilidade','Legado','Corporação','Substância','Hierarquia','Proteção','Temporário','Redenção','Ideologia','Transparência','Poderes','Torre','Controle','Gestão','Política','Orfanato','Universidade','Vingança'],
  got: ['Bastardo','Dragões','Astúcia','Crueldade','Honra','Traição','Amor','Coragem','Visão','Determinação','Lealdade','Ganância','Ambição','Poder','Trono','Inverno','Capital','Barreira','Dever','Morte','Profecia','Além','Filosofia','Servidão','Destino','Precisão','Fogo','Tragédia','Escravidão','Libertação','Nômade','Guerreiros','Reinos','Continente'],
  round6: ['Endividamento','Frieza','Mistério','Traição','Liderança','Identidade','Número','Número','Jogo','Infância','Doçura','Escultura','Transparência','Sorte','Amizade','Máscara','Máscara','Máscara','Convite'],
};

function setupGameMode(mode: GameModeType, players: Player[], impostorId: string, selectedSubmode?: string, roomCode?: string, customWords?: string[], themeCode?: string): GameData {
  const code = roomCode || 'default';
  
  switch (mode) {
    case "palavraSecreta": {
      // If custom words provided (from user-created theme), use them
      if (customWords && customWords.length > 0) {
        // Use themeCode in poolKey to ensure different themes have separate pools
        const poolKey = themeCode ? `custom-${themeCode}-${code}` : `custom-${code}`;
        const word = getFromPool(poolKey, customWords, wordPools, code);
        return { word };
      }
      // Use pooled words - guarantees no repetition until all used
      const submode = selectedSubmode || 'classico';
      const word = getPooledWord(submode, code);
      return { word };
    }
    
    case "palavras": {
      // Use pooled location for variety
      const poolKey = `locais-${code}`;
      const location = getFromPool(poolKey, GAME_MODES.palavras.locais, wordPools, code);
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
      // Use pooled pairs for variety
      const poolKey = `faccoes-${code}`;
      const allPairs = GAME_MODES.duasFaccoes.pares;
      const pair = getFromPool(poolKey, allPairs, pairPools, code);
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
      // Create combinations of category+item and pool them
      const poolKey = `categoria-item-${code}`;
      const allCombinations: { category: string; item: string }[] = [];
      for (const [cat, items] of Object.entries(GAME_MODES.categoriaItem.categorias)) {
        for (const item of items) {
          allCombinations.push({ category: cat, item });
        }
      }
      const combo = getFromPool(poolKey, allCombinations, comboPools, code);
      return { category: combo.category, item: combo.item };
    }
    
    case "perguntasDiferentes": {
      // Use pooled questions - guarantees no repetition until all 93 used
      const pair = getPooledQuestion(code);
      return { question: pair.crew, impostorQuestion: pair.imp };
    }
    
    case "palavraComunidade": {
      // Community themes - must have custom words provided
      if (customWords && customWords.length > 0) {
        // Use themeCode in poolKey to ensure different themes have separate pools
        const poolKey = themeCode ? `comunidade-${themeCode}-${code}` : `comunidade-${code}`;
        const word = getFromPool(poolKey, customWords, wordPools, code);
        return { word };
      }
      // Fallback to classico if no custom words
      const word = getPooledWord('classico', code);
      return { word };
    }
    
    default:
      const word = getPooledWord('classico', code);
      return { word };
  }
}

import { setupRCGame, getRCRoomStats } from './rcGame.js';
import { setupSincBR, getBRRoomStats } from './sincBrGame.js';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Respostas em Comum game (separate WebSocket + API)
  setupRCGame(httpServer, app);

  // Setup Sincronia Battle Royale (continuous public rooms)
  setupSincBR(httpServer, app);

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
  const playerConnections = new Map<WebSocket, { roomCode: string; playerId?: string; lastPong: number }>();

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

  // Bot auto-vote system
  async function scheduleBotVotes(roomCode: string, bots: Player[]) {
    const delay = 3000 + Math.random() * 5000;
    
    setTimeout(async () => {
      const room = await storage.getRoom(roomCode);
      if (!room || room.status !== 'playing') return;
      
      const humanPlayers = room.players.filter(p => !p.name.startsWith('Bot '));
      if (humanPlayers.length === 0) return;
      
      for (const bot of bots) {
        const randomDelay = Math.random() * 3000;
        
        setTimeout(async () => {
          const currentRoom = await storage.getRoom(roomCode);
          if (!currentRoom || currentRoom.status !== 'playing') return;
          
          const target = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];
          const existingVotes = currentRoom.gameData?.votes || [];
          const alreadyVoted = existingVotes.some(v => v.playerId === bot.uid);
          
          if (!alreadyVoted) {
            const newVotes = [...existingVotes, { 
              playerId: bot.uid, 
              playerName: bot.name,
              targetId: target.uid,
              targetName: target.name
            }];
            
            const updatedRoom = await storage.updateRoom(roomCode, {
              gameData: {
                ...currentRoom.gameData,
                votes: newVotes
              }
            });
            
            if (updatedRoom) {
              broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
              console.log(`[Bot Vote] ${bot.name} voted for ${target.name}`);
            }
          }
        }, randomDelay);
      }
    }, delay);
  }

  // Bot auto-answer system
  async function scheduleBotAnswers(roomCode: string, bots: Player[]) {
    const delay = 2000 + Math.random() * 3000;
    const botAnswers = [
      "Interessante pergunta...",
      "Deixa eu pensar...",
      "Hmm, difícil escolher",
      "Acho que seria...",
      "Com certeza!",
      "Não tenho certeza",
      "Talvez sim, talvez não",
      "Depende do dia"
    ];
    
    setTimeout(async () => {
      const room = await storage.getRoom(roomCode);
      if (!room || room.status !== 'playing' || room.gameMode !== 'perguntasDiferentes') return;
      
      for (const bot of bots) {
        const randomDelay = Math.random() * 4000;
        
        setTimeout(async () => {
          const currentRoom = await storage.getRoom(roomCode);
          if (!currentRoom || currentRoom.status !== 'playing') return;
          
          const existingAnswers = currentRoom.gameData?.answers || [];
          const alreadyAnswered = existingAnswers.some(a => a.playerId === bot.uid);
          
          if (!alreadyAnswered) {
            const randomAnswer = botAnswers[Math.floor(Math.random() * botAnswers.length)];
            const newAnswers = [...existingAnswers, { 
              playerId: bot.uid, 
              playerName: bot.name,
              answer: randomAnswer
            }];
            
            const updatedRoom = await storage.updateRoom(roomCode, {
              gameData: {
                ...currentRoom.gameData,
                answers: newAnswers
              }
            });
            
            if (updatedRoom) {
              broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
              console.log(`[Bot Answer] ${bot.name} answered: "${randomAnswer}"`);
            }
          }
        }, randomDelay);
      }
    }, delay);
  }

  // Mark a player as disconnected (but keep them in the room - they can reconnect)
  async function markPlayerDisconnected(ws: WebSocket, roomCode: string, playerId: string) {
    console.log(`[Connection] Marking player ${playerId} as disconnected in room ${roomCode}`);
    
    const connections = roomConnections.get(roomCode);
    if (connections) {
      connections.delete(ws);
    }
    playerConnections.delete(ws);

    const room = await storage.getRoom(roomCode);
    if (!room) return;

    // Update player's connected status to false (but keep them in the room)
    const updatedPlayers = room.players.map(p => 
      p.uid === playerId ? { ...p, connected: false } : p
    );

    const updatedRoom = await storage.updateRoom(roomCode, { players: updatedPlayers });
    if (updatedRoom) {
      // Notify other players that this player is temporarily disconnected
      broadcastToRoom(roomCode, { 
        type: 'player-disconnected', 
        playerId, 
        playerName: room.players.find(p => p.uid === playerId)?.name 
      });
      broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
    }
  }

  // Mark a player as connected (restore connection status on reconnect)
  async function markPlayerConnected(roomCode: string, playerId: string) {
    console.log(`[Connection] Marking player ${playerId} as connected in room ${roomCode}`);
    
    // Cancel any pending hard exit timer for this player
    cancelHardExitRemoval(roomCode, playerId);
    
    // Cancel any pending empty room deletion since someone is reconnecting
    cancelEmptyRoomDeletion(roomCode);
    
    const room = await storage.getRoom(roomCode);
    if (!room) return null;

    // Update player's connected status to true
    const updatedPlayers = room.players.map(p => 
      p.uid === playerId ? { ...p, connected: true } : p
    );

    const updatedRoom = await storage.updateRoom(roomCode, { players: updatedPlayers });
    if (updatedRoom) {
      // Notify other players that this player reconnected
      broadcastToRoom(roomCode, { 
        type: 'player-reconnected', 
        playerId, 
        playerName: room.players.find(p => p.uid === playerId)?.name 
      });
      broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
    }
    return updatedRoom;
  }

  // Server-side heartbeat configuration
  // HEARTBEAT_INTERVAL: How often to ping clients
  // PONG_TIMEOUT: Time before marking player as disconnected_pending (soft disconnect)
  // HARD_EXIT_FALLBACK_GRACE: Time after disconnect before removing player and transferring host (hard exit)
  const HEARTBEAT_INTERVAL = 5000;  // 5 seconds
  const PONG_TIMEOUT = 15000;       // 15 seconds - marks as disconnected_pending
  const HARD_EXIT_FALLBACK_GRACE = 15000; // 15 seconds - removes player after hard exit detection

  // Track pending hard exit timers
  const hardExitTimers = new Map<string, NodeJS.Timeout>();

  // Track pending empty room deletion timers
  const emptyRoomTimers = new Map<string, NodeJS.Timeout>();
  const EMPTY_ROOM_CLEANUP_DELAY = 10000; // 10 seconds

  // Schedule room deletion when it becomes empty
  function scheduleEmptyRoomDeletion(roomCode: string) {
    // Clear any existing timer for this room
    const existingTimer = emptyRoomTimers.get(roomCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    console.log(`[Empty Room] Scheduling deletion for room ${roomCode} in ${EMPTY_ROOM_CLEANUP_DELAY}ms`);
    
    const timer = setTimeout(async () => {
      emptyRoomTimers.delete(roomCode);
      
      // Double-check the room is still empty before deleting
      const room = await storage.getRoom(roomCode);
      if (room && room.players.length === 0) {
        console.log(`[Empty Room] Deleting empty room ${roomCode}`);
        await storage.deleteRoom(roomCode);
        
        // Clean up any remaining WebSocket connections for this room
        const connections = roomConnections.get(roomCode);
        if (connections) {
          connections.clear();
          roomConnections.delete(roomCode);
        }
      } else if (room) {
        console.log(`[Empty Room] Room ${roomCode} is no longer empty, skipping deletion`);
      }
    }, EMPTY_ROOM_CLEANUP_DELAY);

    emptyRoomTimers.set(roomCode, timer);
  }

  // Cancel scheduled room deletion (e.g., when someone joins)
  function cancelEmptyRoomDeletion(roomCode: string) {
    const existingTimer = emptyRoomTimers.get(roomCode);
    if (existingTimer) {
      clearTimeout(existingTimer);
      emptyRoomTimers.delete(roomCode);
      console.log(`[Empty Room] Cancelled scheduled deletion for room ${roomCode}`);
    }
  }

  // Remove player from room and handle host transfer if needed
  async function handlePlayerHardExit(roomCode: string, playerId: string, reason: string = 'hard_exit') {
    const timerKey = `${roomCode}:${playerId}`;
    const existingTimer = hardExitTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      hardExitTimers.delete(timerKey);
    }

    console.log(`[Hard Exit] Removing player ${playerId} from room ${roomCode} (reason: ${reason})`);
    trackLobbyLeave(roomCode, playerId).catch(() => {});
    
    const room = await storage.getRoom(roomCode);
    if (!room) return;

    const playerToRemove = room.players.find(p => p.uid === playerId);
    if (!playerToRemove) return;

    const wasHost = room.hostId === playerId;
    
    // Remove player from room
    const updatedPlayers = room.players.filter(p => p.uid !== playerId);
    
    // Determine new host if needed
    let newHostId = room.hostId;
    if (wasHost && updatedPlayers.length > 0) {
      // Priority: first connected player (oldest by join order), then first disconnected_pending
      const connectedPlayers = updatedPlayers.filter(p => p.connected !== false);
      const pendingPlayers = updatedPlayers.filter(p => p.connected === false);
      
      if (connectedPlayers.length > 0) {
        newHostId = connectedPlayers[0].uid;
      } else if (pendingPlayers.length > 0) {
        newHostId = pendingPlayers[0].uid;
      } else {
        newHostId = updatedPlayers[0].uid;
      }
      console.log(`[Host Transfer] Transferring host from ${playerId} to ${newHostId}`);
    }

    const updatedRoom = await storage.updateRoom(roomCode, {
      players: updatedPlayers,
      hostId: newHostId
    });

    if (updatedRoom) {
      // Notify all players of the removal
      broadcastToRoom(roomCode, {
        type: 'player-removed',
        playerId,
        playerName: playerToRemove.name,
        reason
      });

      // If host changed, notify about that too
      if (wasHost && newHostId !== playerId) {
        const newHostPlayer = updatedPlayers.find(p => p.uid === newHostId);
        broadcastToRoom(roomCode, {
          type: 'host-changed',
          newHostId,
          newHostName: newHostPlayer?.name
        });
      }

      broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });

      // If room is now empty, schedule its deletion
      if (updatedPlayers.length === 0) {
        console.log(`[Empty Room] Room ${roomCode} is now empty, scheduling deletion`);
        scheduleEmptyRoomDeletion(roomCode);
      }
    }
  }

  // Schedule hard exit removal after grace period
  function scheduleHardExitRemoval(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    
    // Clear any existing timer
    const existingTimer = hardExitTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    console.log(`[Hard Exit] Scheduling removal for player ${playerId} in ${HARD_EXIT_FALLBACK_GRACE}ms`);
    
    const timer = setTimeout(async () => {
      hardExitTimers.delete(timerKey);
      await handlePlayerHardExit(roomCode, playerId, 'fallback_grace_expired');
    }, HARD_EXIT_FALLBACK_GRACE);

    hardExitTimers.set(timerKey, timer);
  }

  // Cancel scheduled hard exit (e.g., when player reconnects)
  function cancelHardExitRemoval(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    const existingTimer = hardExitTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      hardExitTimers.delete(timerKey);
      console.log(`[Hard Exit] Cancelled scheduled removal for player ${playerId}`);
    }
  }

  setInterval(() => {
    const now = Date.now();
    
    playerConnections.forEach(async (info, ws) => {
      if (!info.playerId || !info.roomCode) return;
      
      const timeSinceLastPong = now - info.lastPong;
      
      // Only mark as disconnected_pending if pong timeout exceeded
      if (timeSinceLastPong > PONG_TIMEOUT) {
        console.log(`[Heartbeat] Player ${info.playerId} unresponsive (${timeSinceLastPong}ms) - marking as disconnected_pending`);
        await markPlayerDisconnected(ws, info.roomCode, info.playerId);
        // Schedule hard exit removal after grace period
        // If player reconnects within grace period, the timer will be cancelled
        scheduleHardExitRemoval(info.roomCode, info.playerId);
      } else if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.error('[Heartbeat] Failed to send ping:', e);
        }
      }
    });
  }, HEARTBEAT_INTERVAL);

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
        
        // Handle pong response from client - update lastPong timestamp
        if (data.type === 'pong') {
          const info = playerConnections.get(ws);
          if (info) {
            info.lastPong = Date.now();
          }
          return;
        }
        
        // Handle intentional leave - player wants to exit the room (hard exit)
        if (data.type === 'leave') {
          const info = playerConnections.get(ws);
          if (info?.roomCode && info?.playerId) {
            console.log(`[Leave] Player ${info.playerId} is leaving room ${info.roomCode} intentionally`);
            try {
              // This is a hard exit - remove player immediately and transfer host if needed
              await handlePlayerHardExit(info.roomCode, info.playerId, 'leave_intentional');
              // Clean up connection
              const connections = roomConnections.get(info.roomCode);
              if (connections) {
                connections.delete(ws);
              }
              playerConnections.delete(ws);
              console.log(`[Leave] Successfully removed player ${info.playerId} from room ${info.roomCode}`);
            } catch (e) {
              console.error(`[Leave] Error removing player ${info.playerId}:`, e);
            }
          }
          return;
        }

        // Handle disconnect_notice - client is about to close (browser exit detection)
        // This is treated as a hard exit attempt
        if (data.type === 'disconnect_notice') {
          const info = playerConnections.get(ws);
          if (info?.roomCode && info?.playerId) {
            console.log(`[Disconnect Notice] Player ${info.playerId} notified disconnect in room ${info.roomCode}`);
            try {
              // Mark as disconnected first, then schedule hard exit removal
              await markPlayerDisconnected(ws, info.roomCode, info.playerId);
              // Schedule removal after grace period (in case of network issues, not intentional)
              scheduleHardExitRemoval(info.roomCode, info.playerId);
              console.log(`[Disconnect Notice] Scheduled hard exit for player ${info.playerId} after grace period`);
            } catch (e) {
              console.error(`[Disconnect Notice] Error processing disconnect for player ${info.playerId}:`, e);
            }
          }
          return;
        }

        // Handle sync_request - send current room state to client
        if (data.type === 'sync_request') {
          const info = playerConnections.get(ws);
          if (info?.roomCode) {
            const room = await storage.getRoom(info.roomCode);
            if (room) {
              // Update lastPong on sync request too (client is active)
              info.lastPong = Date.now();
              ws.send(JSON.stringify({ type: 'room-update', room }));
              console.log(`[Sync] Sent room state to player ${info.playerId} in room ${info.roomCode}`);
            }
          }
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
          
          // Initialize player connection with lastPong timestamp
          playerConnections.set(ws, { 
            roomCode, 
            playerId: currentPlayerId,
            lastPong: Date.now()
          });
          
          const room = await storage.getRoom(roomCode);
          if (room) {
            // Check if player already exists in room (reconnecting)
            const existingPlayer = room.players.find(p => p.uid === currentPlayerId);
            if (existingPlayer) {
              // Player is reconnecting - restore their connection status
              console.log(`[Reconnect] Player ${currentPlayerId} is reconnecting to room ${roomCode}`);
              const updatedRoom = await markPlayerConnected(roomCode, currentPlayerId);
              if (updatedRoom) {
                ws.send(JSON.stringify({ type: 'room-update', room: updatedRoom }));
              } else {
                ws.send(JSON.stringify({ type: 'room-update', room }));
              }
            } else {
              // New player joining
              ws.send(JSON.stringify({ type: 'room-update', room }));
              console.log(`[Join] Player ${currentPlayerId} joined room ${roomCode}`);
            }
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

        // Handle host entering game config screen
        if (data.type === 'host-game-config' && data.roomCode) {
          const roomCode = data.roomCode as string;
          // Broadcast to all players in the room
          broadcastToRoom(roomCode, { type: 'host-game-config' });
        }

        // Handle host going back to mode select from game config
        if (data.type === 'host-back-to-mode-select' && data.roomCode) {
          const roomCode = data.roomCode as string;
          // Broadcast to all players in the room
          broadcastToRoom(roomCode, { type: 'host-back-to-mode-select' });
        }

        // Handle trigger speaking order wheel - broadcast to all players in room
        if (data.type === 'trigger-speaking-order' && data.roomCode) {
          const roomCode = data.roomCode as string;
          const room = await storage.getRoom(roomCode);
          
          if (room && room.players) {
            // Generate random speaking order on the server so all clients get the same order
            // Include ALL connected players in the speaking order (ignore waitingForGame - they're in game now)
            // Only exclude players who are explicitly disconnected
            const activePlayers = room.players.filter(p => p.connected !== false);
            const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
            const speakingOrder = shuffled.map(p => p.uid);
            
            // Also send the full player list for name resolution
            const playerMap = Object.fromEntries(room.players.map(p => [p.uid, p.name]));
            
            // Broadcast to all players with the same order
            broadcastToRoom(roomCode, { 
              type: 'start-speaking-order-wheel',
              speakingOrder,
              playerMap
            });
          }
        }

        // Handle kick-player - host can remove a player from the room
        if (data.type === 'kick-player' && data.roomCode && data.targetPlayerId) {
          const roomCode = data.roomCode as string;
          const targetPlayerId = data.targetPlayerId as string;
          
          // SECURITY: Get the actual player ID from the WebSocket connection, NOT from client payload
          // This prevents spoofing where attackers send fake hostId
          const connectionInfo = playerConnections.get(ws);
          if (!connectionInfo || connectionInfo.roomCode !== roomCode) {
            console.log(`[Kick] Rejected: Connection not found or room mismatch`);
            return;
          }
          const actualRequesterId = connectionInfo.playerId;
          
          const room = await storage.getRoom(roomCode);
          if (!room) {
            console.log(`[Kick] Rejected: Room ${roomCode} not found`);
            return;
          }
          
          // Only host can kick players - use the verified playerId from connection
          if (room.hostId !== actualRequesterId) {
            console.log(`[Kick] Rejected: ${actualRequesterId} is not the host of room ${roomCode}`);
            return;
          }
          
          // Cannot kick yourself (the host)
          if (targetPlayerId === actualRequesterId) {
            console.log(`[Kick] Rejected: Host cannot kick themselves`);
            return;
          }
          
          const targetPlayer = room.players.find(p => p.uid === targetPlayerId);
          if (!targetPlayer) {
            console.log(`[Kick] Player ${targetPlayerId} not found in room ${roomCode}`);
            return;
          }
          
          console.log(`[Kick] Host ${actualRequesterId} is kicking player ${targetPlayerId} (${targetPlayer.name}) from room ${roomCode}`);
          
          // Remove the player from the room
          const updatedRoom = await storage.removePlayerFromRoom(roomCode, targetPlayerId);
          
          if (updatedRoom) {
            // Find the kicked player's WebSocket and close it
            playerConnections.forEach((info, playerWs) => {
              if (info.playerId === targetPlayerId && info.roomCode === roomCode) {
                // Send kicked notification before closing
                try {
                  playerWs.send(JSON.stringify({ 
                    type: 'kicked', 
                    message: 'Você foi expulso da sala pelo host' 
                  }));
                  playerWs.close();
                } catch (e) {
                  console.error('[Kick] Error sending kicked notification:', e);
                }
                playerConnections.delete(playerWs);
                const connections = roomConnections.get(roomCode);
                if (connections) {
                  connections.delete(playerWs);
                }
              }
            });
            
            // Broadcast to remaining players
            broadcastToRoom(roomCode, { 
              type: 'player-kicked', 
              playerId: targetPlayerId,
              playerName: targetPlayer.name 
            });
            broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
            console.log(`[Kick] Successfully removed player ${targetPlayer.name} from room ${roomCode}`);
          }
        }

        // Handle lobby chat message - broadcast to all players in room
        if (data.type === 'lobby-chat' && data.roomCode && data.message) {
          const roomCode = data.roomCode as string;
          const messageText = (data.message as string).trim().slice(0, 200); // Trim and limit message length
          
          // Reject empty/whitespace-only messages
          if (!messageText) return;
          
          const connectionInfo = playerConnections.get(ws);
          if (!connectionInfo || connectionInfo.roomCode !== roomCode) {
            return;
          }
          
          const room = await storage.getRoom(roomCode);
          if (!room) return;
          
          const sender = room.players.find(p => p.uid === connectionInfo.playerId);
          if (!sender) return;
          
          // Broadcast chat message to all players in room
          broadcastToRoom(roomCode, {
            type: 'lobby-chat-message',
            senderId: sender.uid,
            senderName: sender.name,
            message: messageText,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('[WebSocket Message Error]:', error);
        console.error('[WebSocket Message Error] Stack:', error instanceof Error ? error.stack : 'No stack trace');
        // Send error back to client
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Failed to process message',
              details: error instanceof Error ? error.message : String(error)
            }));
          }
        } catch (sendError) {
          console.error('[WebSocket] Failed to send error message:', sendError);
        }
      }
    });

    ws.on('close', async () => {
      console.log(`[Close] WebSocket closed for player ${currentPlayerId} in room ${currentRoomCode}`);
      
      if (currentRoomCode && currentPlayerId) {
        try {
          // Mark player as disconnected_pending first
          await markPlayerDisconnected(ws, currentRoomCode, currentPlayerId);
          // Schedule hard exit removal after grace period
          // This handles cases where connection was lost unexpectedly (not intentional leave)
          // If player reconnects within grace period, the timer is cancelled
          scheduleHardExitRemoval(currentRoomCode, currentPlayerId);
        } catch (error) {
          console.error('[WebSocket Close Error]:', error);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket Error]:', error);
      console.error('[WebSocket Error] Player:', currentPlayerId, 'Room:', currentRoomCode);
    });
  });

  // HTTP endpoint for disconnect notice via sendBeacon (more reliable for browser close)
  app.post("/api/rooms/:code/disconnect-notice", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId } = z.object({
        playerId: z.string()
      }).parse(req.body);
      
      const roomCode = code.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Find and close any existing WebSocket connection for this player
      // Collect promises to await them all before responding
      const disconnectPromises: Promise<void>[] = [];
      playerConnections.forEach((info, ws) => {
        if (info.playerId === playerId && info.roomCode === roomCode) {
          console.log(`[Disconnect Beacon] Marking player ${playerId} as disconnected in room ${roomCode}`);
          disconnectPromises.push(markPlayerDisconnected(ws, roomCode, playerId));
        }
      });

      // Wait for all WebSocket-based disconnects to complete
      if (disconnectPromises.length > 0) {
        try {
          await Promise.all(disconnectPromises);
          console.log(`[Disconnect Beacon] Successfully marked player ${playerId} as disconnected via WebSocket`);
        } catch (e) {
          console.error(`[Disconnect Beacon] Error marking player disconnected via WebSocket:`, e);
        }
      }

      // If no WebSocket found, still update player status directly
      // Re-fetch room to get current state after any WebSocket disconnects
      const currentRoom = await storage.getRoom(roomCode);
      if (currentRoom) {
        const existingPlayer = currentRoom.players.find(p => p.uid === playerId);
        if (existingPlayer && existingPlayer.connected !== false) {
          const updatedPlayers = currentRoom.players.map(p => 
            p.uid === playerId ? { ...p, connected: false } : p
          );
          
          const updatedRoom = await storage.updateRoom(roomCode, { players: updatedPlayers });
          if (updatedRoom) {
            broadcastToRoom(roomCode, { 
              type: 'player-disconnected', 
              playerId, 
              playerName: existingPlayer.name 
            });
            broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
            console.log(`[Disconnect Beacon] Successfully marked player ${playerId} as disconnected directly`);
          }
        }
        // Schedule hard exit removal after grace period
        scheduleHardExitRemoval(roomCode, playerId);
        console.log(`[Disconnect Beacon] Scheduled hard exit for player ${playerId} after grace period`);
      }

      res.status(204).send();
    } catch (error) {
      console.error('[Disconnect Beacon] Error:', error);
      res.status(400).json({ error: "Failed to process disconnect notice" });
    }
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
      const player: Player = { uid: hostId, name: hostName, connected: true };

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

      impostorTotalRoomsCreated++;
      console.log(`[Room Created] Code: ${code}, Host: ${hostName} (${hostId})`);
      trackLobbyJoin(code, hostId, hostName, true, null, null, req).catch(() => {});
      trackRoomJoin(req.cookies?.['visitor_id'] || hostId, code, null, req).catch(() => {});

      // Auto-add bots for admin testing
      if (hostName === "testeadm26") {
        console.log(`[Admin Mode] Detected admin user, adding 4 bots to room ${code}`);
        const botNames = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"];
        
        for (const botName of botNames) {
          const botId = `bot-${randomBytes(4).toString('hex')}`;
          const botPlayer: Player = { 
            uid: botId, 
            name: botName, 
            connected: true 
          };
          
          await storage.addPlayerToRoom(code, botPlayer);
          console.log(`[Admin Mode] Added bot: ${botName} (${botId})`);
        }
        
        // Get updated room with bots
        const updatedRoom = await storage.getRoom(code);
        if (updatedRoom) {
          broadcastToRoom(code, { type: 'room-update', room: updatedRoom });
          return res.json(updatedRoom);
        }
      }
      
      res.json(room);
    } catch (error) {
      console.error('[Room Create Error]:', error);
      res.status(400).json({ error: "Failed to create room", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const { code, playerId, playerName } = z.object({
        code: z.string(),
        playerId: z.string(),
        playerName: z.string(),
      }).parse(req.body);

      const roomCode = code.toUpperCase();
      console.log(`[Room Join] Player ${playerName} (${playerId}) attempting to join room ${roomCode}`);

      const room = await storage.getRoom(roomCode);
      if (!room) {
        console.log(`[Room Join] Room ${roomCode} not found`);
        return res.status(404).json({ error: "Room not found" });
      }

      // Cancel any pending empty room deletion since someone is joining
      cancelEmptyRoomDeletion(roomCode);

      // If room is already playing, mark new player as waiting for game to end
      const isGameInProgress = room.status === 'playing';
      const player: Player = { 
        uid: playerId, 
        name: playerName,
        waitingForGame: isGameInProgress,
        connected: true  // New players start as connected
      };
      const updatedRoom = await storage.addPlayerToRoom(roomCode, player);

      if (updatedRoom) {
        console.log(`[Room Join] Player ${playerName} successfully joined room ${roomCode}`);
        broadcastToRoom(roomCode, { type: 'room-update', room: updatedRoom });
        trackLobbyJoin(roomCode, playerId, playerName, false, updatedRoom.gameMode, null, req).catch(() => {});
        trackRoomJoin(req.cookies?.['visitor_id'] || playerId, roomCode, updatedRoom.gameMode, req).catch(() => {});
      }

      res.json(updatedRoom);
    } catch (error) {
      console.error('[Room Join Error]:', error);
      res.status(400).json({ error: "Failed to join room", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/rooms/:code/start", async (req, res) => {
    try {
      const { code } = req.params;
      const { gameMode, selectedSubmode, themeCode, gameConfig } = z.object({
        gameMode: z.enum(["palavraSecreta", "palavras", "duasFaccoes", "categoriaItem", "perguntasDiferentes", "palavraComunidade"]),
        selectedSubmode: z.string().optional(),
        themeCode: z.string().optional(),
        gameConfig: z.object({
          impostorCount: z.number().min(1).max(5),
          enableHints: z.boolean(),
          firstPlayerHintOnly: z.boolean()
        }).optional()
      }).parse(req.body);
      
      const room = await storage.getRoom(code.toUpperCase());
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Filter room players to only include those who are explicitly connected
      const allPlayers = (room.players || []) as Player[];
      // Players are connected if: they have connected === true (explicitly connected)
      const connectedPlayers = allPlayers.filter(p => !p.waitingForGame && p.connected === true);
      const disconnectedPlayers = allPlayers.filter(p => !p.waitingForGame && p.connected !== true);
      
      console.log(`[StartGame] Room ${code}: ${allPlayers.length} total, ${connectedPlayers.length} connected, ${disconnectedPlayers.length} disconnected`);
      
      if (connectedPlayers.length < 3) {
        return res.status(400).json({ 
          error: "Minimum 3 connected players required",
          connectedCount: connectedPlayers.length,
          disconnectedCount: disconnectedPlayers.length,
          totalCount: allPlayers.length
        });
      }

      // Note: We do NOT remove disconnected players - they stay in the room and can reconnect
      // We just don't include them in the current game round
      if (disconnectedPlayers.length > 0) {
        console.log(`[StartGame] ${disconnectedPlayers.length} players are disconnected:`, disconnectedPlayers.map(p => p.name));
        console.log(`[StartGame] Game will start with ${connectedPlayers.length} connected players`);
      }

      // If themeCode is provided, fetch custom theme words (for palavraSecreta or palavraComunidade)
      let customWords: string[] | undefined;
      if (themeCode && (gameMode === "palavraSecreta" || gameMode === "palavraComunidade")) {
        const theme = await storage.getThemeByAccessCode(themeCode);
        if (theme && theme.paymentStatus === "approved") {
          customWords = theme.palavras;
          console.log(`[StartGame] Using custom theme "${theme.titulo}" by ${theme.autor} with ${customWords.length} words`);
        } else {
          console.log(`[StartGame] Theme code ${themeCode} not found or not approved, using default words`);
        }
      }

      // Determine number of impostors (default 1 for backward compatibility)
      const impostorCount = gameConfig?.impostorCount || 1;
      
      // Validate impostor count
      if (impostorCount >= connectedPlayers.length) {
        return res.status(400).json({ 
          error: "Too many impostors for player count",
          impostorCount,
          playerCount: connectedPlayers.length
        });
      }
      
      // Select random impostors
      const shuffledPlayers = [...connectedPlayers].sort(() => Math.random() - 0.5);
      const impostorIds = shuffledPlayers.slice(0, impostorCount).map(p => p.uid);
      const impostorId = impostorIds[0]; // Keep first impostor as primary for backward compatibility
      
      console.log(`[StartGame] Selected ${impostorCount} impostor(s):`, impostorIds);
      
      const gameData = setupGameMode(gameMode, connectedPlayers, impostorId, selectedSubmode, code.toUpperCase(), customWords, themeCode);
      
      // Store game config in gameData for later use
      console.log(`[StartGame] gameConfig received:`, gameConfig);
      console.log(`[StartGame] gameMode: ${gameMode}, themeCode: ${themeCode}, word: ${gameData.word}`);
      
      if (gameConfig) {
        gameData.gameConfig = gameConfig;
        gameData.impostorIds = impostorIds;
        
        console.log(`[StartGame] Checking hint conditions:`, {
          enableHints: gameConfig.enableHints,
          isPalavraSecreta: gameMode === 'palavraSecreta',
          noThemeCode: !themeCode,
          hasWord: !!gameData.word
        });
        
        // Add hint for impostor if enabled (all built-in submodes, not community themes)
        // Note: firstPlayerHintOnly logic is handled on the frontend based on speaking order
        if (gameConfig.enableHints && gameMode === 'palavraSecreta' && !themeCode && gameData.word) {
          const submode = selectedSubmode || 'classico';
          let hint: string | undefined;

          if (submode === 'classico') {
            // Classic mode uses the word→hint dictionary
            hint = WORD_HINTS[gameData.word];
          } else {
            // Other built-in themes use positional hints (same index as the word in the words array)
            const themeWords = PALAVRA_SECRETA_SUBMODES_DATA[submode];
            const themeHints = THEME_HINTS[submode];
            if (themeWords && themeHints) {
              const wordIndex = themeWords.indexOf(gameData.word);
              if (wordIndex !== -1 && wordIndex < themeHints.length) {
                hint = themeHints[wordIndex];
              }
            }
          }

          console.log(`[StartGame] Looking for hint for word "${gameData.word}" (submode: ${submode}):`, hint);
          if (hint) {
            gameData.hint = hint;
            console.log(`[StartGame] ✅ Added hint for word "${gameData.word}": "${hint}"`);
          } else {
            console.log(`[StartGame] ⚠️ No hint found for word "${gameData.word}"`);
          }
        } else {
          console.log(`[StartGame] ❌ Hint conditions not met, skipping hint`);
        }
      } else {
        console.log(`[StartGame] ⚠️ No gameConfig provided, using defaults`);
        // Set default values for backward compatibility
        gameData.impostorIds = impostorIds;
      }
      
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
        recordGameSession('impostor', code.toUpperCase(), connectedPlayers.length).catch(() => {});
        trackLobbyGameStart(code.toUpperCase(), gameMode, themeCode ?? null).catch(() => {});
        
        // Schedule bot actions if there are bots in the room
        const bots = updatedRoom.players.filter(p => p.name.startsWith('Bot '));
        if (bots.length > 0) {
          console.log(`[Bot System] Scheduling auto-actions for ${bots.length} bots`);
          scheduleBotVotes(code.toUpperCase(), bots);
          
          // Also schedule answers for "Perguntas Diferentes" mode
          if (gameMode === 'perguntasDiferentes') {
            scheduleBotAnswers(code.toUpperCase(), bots);
          }
        }
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

      // Prevent starting voting if already started
      if (room.gameData.votingStarted === true) {
        console.log(`[Start Voting] Voting already started for room ${code}`);
        return res.json(room); // Return current room state
      }

      console.log(`[Start Voting] Starting voting for room ${code}`);

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
      console.error('[Start Voting] Error:', error);
      res.status(400).json({ error: "Failed to start voting" });
    }
  });

  app.post("/api/rooms/:code/submit-vote", async (req, res) => {
    try {
      const { code } = req.params;
      const { playerId, playerName, targetId, targetName } = req.body;
      
      console.log('[VOTE] Received vote:', { playerId, playerName, targetId, targetName });
      
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
        console.log('[VOTE] Player already voted:', playerId);
        return res.status(400).json({ error: "Already submitted vote" });
      }

      const newVote = { playerId, playerName, targetId, targetName };
      const newVotes = [...existingVotes, newVote];
      
      console.log('[VOTE] Adding vote:', newVote);
      console.log('[VOTE] All votes:', newVotes);
      
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

  // Payment Routes - Mercado Pago PIX
  const createPaymentSchema = z.object({
    titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(50, "Título deve ter no máximo 50 caracteres"),
    palavras: z.array(z.string().min(1)).min(7, "Deve ter no mínimo 7 palavras").max(25, "Deve ter no máximo 25 palavras"),
    autor: z.string().min(2, "Nome do autor deve ter pelo menos 2 caracteres").max(30, "Nome do autor deve ter no máximo 30 caracteres"),
    isPublic: z.boolean().optional().default(true)
  });

  app.post("/api/payments/create", async (req, res) => {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      
      const themeData: ThemeData = {
        titulo: validatedData.titulo,
        palavras: validatedData.palavras,
        autor: validatedData.autor,
        isPublic: validatedData.isPublic
      };
      
      const paymentResult = await createPayment(themeData);
      
      if (!paymentResult.success) {
        return res.status(400).json({ 
          error: paymentResult.error || "Falha ao criar pagamento" 
        });
      }
      
      // Save theme to database with status 'pending' and paymentId
      // This persists the theme data across server restarts
      if (paymentResult.paymentId) {
        try {
          const pendingTheme = await storage.createTheme({
            titulo: validatedData.titulo,
            autor: validatedData.autor,
            palavras: validatedData.palavras,
            isPublic: validatedData.isPublic,
            paymentStatus: 'pending',
            paymentId: String(paymentResult.paymentId),
            approved: false
          });
          console.log('[Payment] Saved pending theme to DB with paymentId:', paymentResult.paymentId, 'themeId:', pendingTheme.id);
        } catch (dbError) {
          console.error('[Payment] Failed to save pending theme to DB:', dbError);
          return res.status(500).json({ error: "Erro ao salvar tema no banco de dados" });
        }
      }
      
      res.json({
        success: true,
        paymentId: paymentResult.paymentId,
        qrCode: paymentResult.qrCode,
        qrCodeBase64: paymentResult.qrCodeBase64,
        ticketUrl: paymentResult.ticketUrl,
        expirationDate: paymentResult.expirationDate
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error('[Payment Route] Error:', error);
      res.status(500).json({ error: "Erro interno ao processar pagamento" });
    }
  });

  // Donation Payment Route
  const createDonationSchema = z.object({
    donorName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome deve ter no máximo 50 caracteres"),
    message: z.string().max(200, "Mensagem deve ter no máximo 200 caracteres").optional(),
    amount: z.number().min(1, "Valor mínimo é R$ 1,00").max(1000, "Valor máximo é R$ 1.000,00")
  });

  app.post("/api/donations/create", async (req, res) => {
    try {
      const validatedData = createDonationSchema.parse(req.body);
      
      const donationData: DonationData = {
        donorName: validatedData.donorName,
        message: validatedData.message,
        amount: validatedData.amount
      };
      
      const paymentResult = await createDonationPayment(donationData);
      
      if (!paymentResult.success) {
        return res.status(400).json({ 
          error: paymentResult.error || "Falha ao criar pagamento" 
        });
      }
      
      console.log('[Donation] Created payment:', paymentResult.paymentId, 'for donor:', donationData.donorName);
      
      res.json({
        success: true,
        paymentId: paymentResult.paymentId,
        qrCode: paymentResult.qrCode,
        qrCodeBase64: paymentResult.qrCodeBase64,
        ticketUrl: paymentResult.ticketUrl,
        expirationDate: paymentResult.expirationDate
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error('[Donation Route] Error:', error);
      res.status(500).json({ error: "Erro interno ao processar doação" });
    }
  });

  // Donation status check
  app.get("/api/donations/status/:paymentId", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      if (isNaN(paymentId)) {
        return res.status(400).json({ error: "ID de pagamento inválido" });
      }
      
      const paymentInfo = await getPaymentStatus(paymentId);
      res.json({ status: paymentInfo.status });
    } catch (error) {
      console.error('[Donation Status] Error:', error);
      res.status(500).json({ error: "Erro ao verificar status" });
    }
  });

  // Webhook for donations
  app.post("/webhook/donation", async (req, res) => {
    try {
      res.status(200).send('OK');
      
      const { type, action, data } = req.body;
      console.log('[Donation Webhook] Received:', { type, action, data });
      
      const isPaymentNotification = 
        type === 'payment' || 
        (action && action.startsWith('payment.')) ||
        (type && type.startsWith('payment.'));
      
      if (!isPaymentNotification) {
        return;
      }
      
      const paymentId = data?.id;
      if (!paymentId) {
        return;
      }
      
      const paymentInfo = await getPaymentStatus(paymentId);
      console.log('[Donation Webhook] Payment status:', paymentInfo.status, 'for ID:', paymentId);
      
    } catch (error) {
      console.error('[Donation Webhook] Error:', error);
    }
  });

  // Webhook - Mercado Pago Payment Notifications
  app.post("/webhook", async (req, res) => {
    try {
      // Always respond 200 to prevent Mercado Pago from retrying
      res.status(200).send('OK');
      
      const { type, action, data } = req.body;
      
      console.log('[Webhook] Received notification:', { type, action, data, body: JSON.stringify(req.body) });
      
      // Handle both old format (type) and new format (action)
      // Old format: { type: 'payment', data: { id: '123' } }
      // New format: { action: 'payment.updated', data: { id: '123' } }
      const isPaymentNotification = 
        type === 'payment' || 
        (action && action.startsWith('payment.')) ||
        (type && type.startsWith('payment.'));
      
      if (!isPaymentNotification) {
        console.log('[Webhook] Ignoring non-payment notification:', { type, action });
        return;
      }
      
      const paymentId = data?.id;
      if (!paymentId) {
        console.log('[Webhook] No payment ID in notification');
        return;
      }
      
      // Query payment status from Mercado Pago API
      const paymentInfo = await getPaymentStatus(paymentId);
      
      console.log('[Webhook] Payment status:', paymentInfo.status, 'for ID:', paymentId);
      
      // Only process approved payments
      if (paymentInfo.status !== 'approved') {
        console.log('[Webhook] Payment not approved, status:', paymentInfo.status);
        return;
      }
      
      // First, check if theme already exists in database by paymentId (saved when payment was created)
      console.log('[Webhook] Looking for theme with paymentId:', String(paymentId));
      let existingTheme: any;
      try {
        existingTheme = await storage.getThemeByPaymentId(String(paymentId));
        console.log('[Webhook] DB lookup result:', existingTheme ? `Found theme ${existingTheme.id}` : 'Not found');
      } catch (dbLookupError) {
        console.error('[Webhook] Error looking up theme in DB:', dbLookupError);
        // Continue to try other methods
      }
      
      if (existingTheme) {
        console.log('[Webhook] Found existing theme in DB for paymentId:', paymentId, 'themeId:', existingTheme.id);
        
        // If theme exists but not yet approved, update it
        if (existingTheme.paymentStatus !== 'approved') {
          try {
            const accessCode = existingTheme.accessCode || cryptoRandomBytes(3).toString('hex').toUpperCase();
            existingTheme = await storage.updateTheme(existingTheme.id, {
              paymentStatus: 'approved',
              approved: true,
              accessCode
            });
            console.log('[Webhook] Updated theme to approved:', existingTheme?.id, 'accessCode:', accessCode);
          } catch (updateError) {
            console.error('[Webhook] Failed to update theme to approved:', updateError);
          }
        } else {
          console.log('[Webhook] Theme already approved:', existingTheme.id);
        }
        return;
      }
      
      // Theme should already exist in database (created when payment was initiated)
      // Log warning if theme was not found - this indicates a problem
      console.error('[Webhook] Theme not found in database for paymentId:', paymentId);
      console.error('[Webhook] This should not happen - theme should be created when payment is initiated');
      
    } catch (error) {
      console.error('[Webhook] Error processing notification:', error);
      // Don't throw - we already sent 200 to avoid retries
    }
  });

  // Get public approved themes for gallery
  app.get("/api/themes/public", async (_req, res) => {
    try {
      const themes = await storage.getPublicApprovedThemes();
      // Return public theme info with accessCode for game usage
      const publicThemes = themes.map(t => ({
        id: t.id,
        titulo: t.titulo,
        autor: t.autor,
        palavrasCount: t.palavras.length,
        accessCode: t.accessCode,
        createdAt: t.createdAt
      }));
      res.json(publicThemes);
    } catch (error) {
      console.error('[Themes] Error fetching public themes:', error);
      res.status(500).json({ error: "Erro ao buscar temas" });
    }
  });

  // Get theme by access code (for using in game)
  app.get("/api/themes/code/:accessCode", async (req, res) => {
    try {
      const { accessCode } = req.params;
      const theme = await storage.getThemeByAccessCode(accessCode.toUpperCase());
      
      if (!theme) {
        return res.status(404).json({ error: "Tema não encontrado" });
      }
      
      if (theme.paymentStatus !== 'approved') {
        return res.status(400).json({ error: "Tema ainda não está disponível" });
      }
      
      // Return theme info for use in game
      res.json({
        id: theme.id,
        titulo: theme.titulo,
        autor: theme.autor,
        palavrasCount: theme.palavras.length,
        accessCode: theme.accessCode
      });
    } catch (error) {
      console.error('[Themes] Error fetching theme by code:', error);
      res.status(500).json({ error: "Erro ao buscar tema" });
    }
  });

  // Check payment status by payment ID (for polling)
  // This endpoint queries the PostgreSQL database directly - no in-memory storage
  app.get("/api/payments/status/:paymentId", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      if (isNaN(paymentId)) {
        return res.status(400).json({ error: "ID de pagamento inválido" });
      }
      
      // First, check the theme in our database
      let existingTheme = await storage.getThemeByPaymentId(String(paymentId));
      
      // If theme exists and is already approved, return immediately
      if (existingTheme && existingTheme.paymentStatus === 'approved') {
        console.log('[Payment Status] Theme already approved in DB:', existingTheme.id);
        return res.json({
          status: 'approved',
          accessCode: existingTheme.accessCode
        });
      }
      
      // Query Mercado Pago for the current payment status
      const paymentInfo = await getPaymentStatus(paymentId);
      console.log('[Payment Status] Checking payment:', paymentId, 'status:', paymentInfo.status);
      
      if (paymentInfo.status === 'approved') {
        if (existingTheme) {
          console.log('[Payment Status] Found theme in DB for paymentId:', paymentId, 'status:', existingTheme.paymentStatus);
          
          // Theme exists but not yet approved - update it to approved
          if (existingTheme.paymentStatus !== 'approved') {
            const accessCode = cryptoRandomBytes(3).toString('hex').toUpperCase();
            existingTheme = await storage.updateTheme(existingTheme.id, {
              paymentStatus: 'approved',
              approved: true,
              accessCode
            });
            console.log('[Payment Status] Updated theme to approved:', existingTheme?.id, 'accessCode:', accessCode);
          }
          
          if (existingTheme && existingTheme.paymentStatus === 'approved') {
            return res.json({
              status: 'approved',
              accessCode: existingTheme.accessCode
            });
          }
        } else {
          // Theme not found in database - this shouldn't happen as we save it when payment is created
          console.error('[Payment Status] Theme not found in database for approved payment:', paymentId);
          console.error('[Payment Status] This indicates the theme was not saved during payment creation');
        }
      }
      
      // Return the current payment status from Mercado Pago
      res.json({ status: paymentInfo.status });
    } catch (error) {
      console.error('[Payment Status] Error:', error);
      res.status(500).json({ error: "Erro ao verificar status do pagamento" });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================
  
  // Admin login endpoint - validates credentials from environment variables
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string()
      }).parse(req.body);
      
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        console.error('[Admin] Admin credentials not configured');
        return res.status(500).json({ error: "Admin não configurado" });
      }
      
      if (email === adminEmail && password === adminPassword) {
        // Generate a cryptographically secure token and store it server-side
        const token = randomBytes(32).toString('hex');
        storeAdminToken(token);
        
        console.log('[Admin] Login successful');
        return res.json({ success: true, token });
      }
      
      console.log('[Admin] Login failed - invalid credentials');
      return res.status(401).json({ error: "Credenciais inválidas" });
    } catch (error) {
      console.error('[Admin] Login error:', error);
      res.status(400).json({ error: "Erro no login" });
    }
  });
  
  // Admin logout endpoint - revokes the token server-side
  app.post("/api/admin/logout", (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        revokeAdminToken(token);
      }
      console.log('[Admin] Logout successful - token revoked');
      res.json({ success: true });
    } catch (error) {
      console.error('[Admin] Logout error:', error);
      res.status(400).json({ error: "Erro no logout" });
    }
  });
  
  // Admin middleware - validates token against server-side store
  const verifyAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && isValidAdminToken(token)) {
        next();
        return;
      }
    }
    
    res.status(401).json({ error: "Não autorizado" });
  };

  // Verify token endpoint - client calls this on page load to check if stored token is still valid
  app.get("/api/admin/verify", verifyAdmin, (_req, res) => {
    res.json({ valid: true });
  });

  // Analytics routes
  app.use('/api/analytics', createAnalyticsRouter(verifyAdmin));

  // Dashboard Stats API
  app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      const themes = await storage.getAllThemes();
      const users = await storage.getAllUsers();

      res.json({
        totalRooms: rooms.length,
        activeRooms: rooms.filter(r => r.status === 'playing').length,
        totalPlayers: rooms.reduce((acc, r) => acc + r.players.length, 0),
        totalThemes: themes.length,
        totalUsers: users.length,
        rooms: rooms.map(r => ({
          code: r.code,
          players: r.players.length,
          status: r.status,
          mode: r.gameMode,
          createdAt: r.createdAt
        }))
      });
    } catch (error) {
      console.error("[Admin Stats] Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get all rooms for admin dashboard (protected)
  app.get("/api/admin/rooms", verifyAdmin, async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      // Sort by creation date, newest first, limit to 50 — exclude Desafio da Palavra rooms
      const sortedRooms = rooms
        .filter(r => r.gameMode !== 'desafioPalavra')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
      
      res.json(sortedRooms);
    } catch (error) {
      console.error('[Admin] Error fetching rooms:', error);
      res.status(500).json({ error: "Erro ao buscar salas" });
    }
  });
  
  // Get specific room details for spectator mode (protected)
  app.get("/api/admin/rooms/:code", verifyAdmin, async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoom(code.toUpperCase());
      if (!room) return res.status(404).json({ error: "Sala não encontrada" });
      res.json(room);
    } catch (error) {
      console.error('[Admin] Error fetching room details:', error);
      res.status(500).json({ error: "Erro ao buscar detalhes da sala" });
    }
  });

  // Admin Theme Management Routes
  app.get("/api/admin/themes", verifyAdmin, async (_req, res) => {
    try {
      // Get all themes (not just public approved ones)
      const allThemes = await storage.getAllThemes?.() || [];
      res.json(allThemes);
    } catch (error) {
      console.error('[Admin] Error fetching themes:', error);
      res.status(500).json({ error: "Erro ao buscar temas" });
    }
  });

  app.delete("/api/admin/themes/:id", verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTheme(id);
      console.log(`[Admin] Theme ${id} deleted`);
      res.json({ success: true });
    } catch (error) {
      console.error('[Admin] Error deleting theme:', error);
      res.status(500).json({ error: "Erro ao excluir tema" });
    }
  });

  app.post("/api/admin/themes/:id/approve", verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateTheme(id, { approved: true });
      console.log(`[Admin] Theme ${id} approved`);
      res.json({ success: true });
    } catch (error) {
      console.error('[Admin] Error approving theme:', error);
      res.status(500).json({ error: "Erro ao aprovar tema" });
    }
  });

  app.post("/api/admin/themes/:id/reject", verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateTheme(id, { approved: false });
      console.log(`[Admin] Theme ${id} rejected`);
      res.json({ success: true });
    } catch (error) {
      console.error('[Admin] Error rejecting theme:', error);
      res.status(500).json({ error: "Erro ao rejeitar tema" });
    }
  });

  // Blog Routes
  app.get("/api/posts", async (_req, res) => {
    try {
      const blogPosts = await storage.getPosts();
      res.json(blogPosts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // Agora.io token generation endpoint
  app.post("/api/agora/token", (req, res) => {
    try {
      const { channelName, uid } = req.body;
      
      if (!channelName) {
        return res.status(400).json({ error: "channelName is required" });
      }

      const AGORA_APP_ID = '0afca49f230e4f2b86c975ef2689c383';
      const AGORA_APP_CERTIFICATE = '8bb27e4982ff430cba1fb6d25e9cbc3c';
      
      // Token expires in 24 hours
      const expirationTimeInSeconds = 86400;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      
      // Use provided uid or 0 for dynamic uid assignment
      const uidNum = uid ? parseInt(uid, 10) : 0;
      
      const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        uidNum,
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
      );

      res.json({ token, appId: AGORA_APP_ID });
    } catch (err) {
      console.error('[Agora Token Error]:', err);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // DESENHO DO IMPOSTOR — Drawing Game (separate from main game)
  // ═══════════════════════════════════════════════════════════════

  // Types and drawingRooms Map are at module scope (for stats export)
  const drawingWss = new WebSocketServer({ noServer: true });
  const drawingRoomConnections = new Map<string, Set<WebSocket>>();
  const drawingPlayerConnections = new Map<WebSocket, { roomCode: string; playerId?: string }>();

  // Drawing words pool
  const DRAWING_WORDS = [
    "Âncora", "Foguete", "Guitarra", "Bicicleta", "Castelo", "Dragão",
    "Elefante", "Flor", "Girafa", "Helicóptero", "Iglú", "Jacaré",
    "Leão", "Montanha", "Navio", "Óculos", "Pirâmide", "Queijo",
    "Robô", "Sorvete", "Tubarão", "Unicórnio", "Vulcão", "Xícara",
    "Abacaxi", "Baleia", "Cactus", "Diamante", "Estrela", "Fantasma",
    "Garrafa", "Hambúrguer", "Ilha", "Joaninha", "Koala", "Lâmpada",
    "Morcego", "Ninja", "Ovelha", "Pinguim", "Raio", "Sereia",
    "Tartaruga", "Urso", "Violão", "Aranha", "Coroa", "Espada"
  ];

  function generateDrawingRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  /** Fisher-Yates shuffle — unbiased random permutation */
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function broadcastToDrawingRoom(roomCode: string, data: unknown) {
    const connections = drawingRoomConnections.get(roomCode);
    if (!connections) return;
    const message = JSON.stringify(data);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) ws.send(message);
    });
  }

  // REST: Create drawing room
  app.post("/api/drawing-rooms", (req, res) => {
    const { hostId, playerName } = req.body;
    if (!hostId || !playerName) return res.status(400).json({ error: "Missing hostId or playerName" });

    let code = generateDrawingRoomCode();
    while (drawingRooms.has(code)) code = generateDrawingRoomCode();

    const room: DrawingRoom = {
      code,
      hostId,
      status: 'waiting',
      gameData: null,
      players: [{ uid: hostId, name: playerName, connected: true }],
      createdAt: new Date().toISOString(),
    };
    drawingRooms.set(code, room);
    drawingTotalRoomsCreated++;
    console.log(`[Drawing] Room ${code} created by ${playerName}`);
    trackLobbyJoin(code, hostId, playerName, true, 'desenho', null, req).catch(() => {});
    trackRoomJoin(req.cookies?.['visitor_id'] || hostId, code, 'desenho', req).catch(() => {});
    res.json(room);
  });

  // REST: Join drawing room
  app.post("/api/drawing-rooms/:code/join", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId, playerName } = req.body;
    const room = drawingRooms.get(code);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const existing = room.players.find(p => p.uid === playerId);
    if (existing) {
      existing.connected = true;
      existing.name = playerName;
    } else {
      room.players.push({ uid: playerId, name: playerName, connected: true });
    }

    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    broadcastToDrawingRoom(code, { type: 'player-joined', playerName });
    console.log(`[Drawing] ${playerName} joined room ${code}`);
    if (!existing) {
      trackLobbyJoin(code, playerId, playerName, false, 'desenho', null, req).catch(() => {});
      trackRoomJoin(req.cookies?.['visitor_id'] || playerId, code, 'desenho', req).catch(() => {});
    }
    res.json(room);
  });

  // REST: Start drawing game
  app.post("/api/drawing-rooms/:code/start", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { turnTimeLimit = 30, theme = 'classico' } = req.body;
    const room = drawingRooms.get(code);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const activePlayers = room.players.filter(p => p.connected !== false);
    if (activePlayers.length < 3) return res.status(400).json({ error: "Minimum 3 players" });

    // Pick impostor (random player)
    const impostorId = activePlayers[Math.floor(Math.random() * activePlayers.length)].uid;

    // Pick word from selected theme (falls back to classico)
    const themeWords = PALAVRA_SECRETA_SUBMODES_DATA[theme] || PALAVRA_SECRETA_SUBMODES_DATA['classico'] || DRAWING_WORDS;
    const word = themeWords[Math.floor(Math.random() * themeWords.length)];

    // Drawing order — Fisher-Yates shuffle for uniform randomness
    const drawingOrder = shuffleArray(activePlayers).map(p => p.uid);

    room.status = 'sorting';
    room.gameData = {
      word,
      impostorIds: [impostorId],
      drawingOrder,
      currentDrawerIndex: 0,
      currentDrawerId: drawingOrder[0],
      turnTimeLimit,
      votes: [],
      votingStarted: false,
      votesRevealed: false,
    };

    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    recordGameSession('desenho', code, activePlayers.length).catch(() => {});
    console.log(`[Drawing] Game started in room ${code}, word: ${word}, impostor: ${impostorId}`);
    res.json(room);
  });

  // REST: Transition from sorting to drawing (after roulette animation)
  app.post("/api/drawing-rooms/:code/start-drawing", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    room.status = 'drawing';
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // REST: New drawing round (host wants another round)
  app.post("/api/drawing-rooms/:code/new-round", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    // Restart turns keeping the existing canvas
    room.gameData.currentDrawerIndex = 0;
    room.gameData.currentDrawerId = room.gameData.drawingOrder![0];
    room.status = 'drawing';

    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    broadcastToDrawingRoom(code, {
      type: 'drawing-turn-start',
      drawerId: room.gameData.currentDrawerId,
      turnIndex: 0,
    });
    console.log(`[Drawing] New round started in room ${code} (canvas kept)`);
    res.json(room);
  });

  // New round with canvas cleared — all clients wipe their strokes
  app.post("/api/drawing-rooms/:code/new-round-clear", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    room.gameData.currentDrawerIndex = 0;
    room.gameData.currentDrawerId = room.gameData.drawingOrder![0];
    room.gameData.canvasSnapshot = undefined;
    room.status = 'drawing';

    broadcastToDrawingRoom(code, { type: 'drawing-canvas-clear' });
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    broadcastToDrawingRoom(code, {
      type: 'drawing-turn-start',
      drawerId: room.gameData.currentDrawerId,
      turnIndex: 0,
    });
    console.log(`[Drawing] New round started in room ${code} (canvas cleared)`);
    res.json(room);
  });

  // REST: Go to discussion (host decides no more rounds)
  app.post("/api/drawing-rooms/:code/go-to-discussion", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    room.status = 'discussion';
    room.gameData.currentDrawerId = undefined;
    broadcastToDrawingRoom(code, { type: 'drawing-phase-end' });
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // REST: Start voting
  app.post("/api/drawing-rooms/:code/start-voting", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    room.status = 'voting';
    room.gameData.votingStarted = true;
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // REST: Vote
  app.post("/api/drawing-rooms/:code/vote", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId, playerName, targetId, targetName } = req.body;
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    // Prevent duplicate votes
    if (room.gameData.votes?.some(v => v.playerId === playerId)) {
      return res.status(400).json({ error: "Already voted" });
    }

    room.gameData.votes = room.gameData.votes || [];
    room.gameData.votes.push({ playerId, playerName, targetId, targetName });

    // Check if all voted
    const activePlayers = room.players.filter(p => p.connected !== false);
    if (room.gameData.votes.length >= activePlayers.length) {
      room.status = 'result';
      room.gameData.votesRevealed = true;
    }

    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // REST: Reveal votes (host force)
  app.post("/api/drawing-rooms/:code/reveal-votes", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room || !room.gameData) return res.status(404).json({ error: "Room not found" });

    room.status = 'result';
    room.gameData.votesRevealed = true;
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // REST: Reset room (back to lobby)
  app.post("/api/drawing-rooms/:code/reset", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.status = 'waiting';
    room.gameData = null;
    broadcastToDrawingRoom(code, { type: 'drawing-room-update', room });
    res.json(room);
  });

  // Admin: List drawing rooms
  app.get("/api/admin/drawing-rooms", verifyAdmin, (_req, res) => {
    try {
      const rooms = Array.from(drawingRooms.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
      res.json(rooms);
    } catch (error) {
      console.error('[Admin] Error fetching drawing rooms:', error);
      res.status(500).json({ error: "Erro ao buscar salas de desenho" });
    }
  });

  // Admin: Inspect specific drawing room
  app.get("/api/admin/drawing-rooms/:code", verifyAdmin, (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = drawingRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada" });
    res.json(room);
  });

  // Admin: Sincronia (Respostas em Comum) rooms
  app.get("/api/admin/sincronia-rooms", verifyAdmin, (_req, res) => {
    try {
      res.json(getRCRoomStats());
    } catch (error) {
      console.error('[Admin] Error fetching sincronia rooms:', error);
      res.status(500).json({ error: "Erro ao buscar salas de sincronia" });
    }
  });

  // Admin: 30-day game session stats per game type
  app.get("/api/admin/game-sessions/:gameType", verifyAdmin, async (req, res) => {
    const { gameType } = req.params;
    if (!['impostor', 'desenho', 'sincronia', 'desafio', 'aproximacao'].includes(gameType)) {
      return res.status(400).json({ error: "Invalid game type" });
    }
    try {
      const data = await getGameSessionStats(gameType as any, 30);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch game session stats" });
    }
  });

  // Admin: Desafio da Palavra rooms (filtered from shared room storage)
  app.get("/api/admin/desafio-rooms", verifyAdmin, async (_req, res) => {
    try {
      const allRooms = await storage.getAllRooms();
      const desafioRooms = allRooms
        .filter(r => r.gameMode === 'desafioPalavra')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);
      res.json(desafioRooms);
    } catch (error) {
      console.error('[Admin] Error fetching desafio rooms:', error);
      res.status(500).json({ error: "Erro ao buscar salas de desafio" });
    }
  });

  // Admin: Inspect specific desafio room
  app.get("/api/admin/desafio-rooms/:code", verifyAdmin, async (req, res) => {
    try {
      const code = req.params.code.toUpperCase();
      const room = await storage.getRoom(code);
      if (!room || room.gameMode !== 'desafioPalavra') return res.status(404).json({ error: "Sala não encontrada" });
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar sala" });
    }
  });

  // WebSocket: Drawing game
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/drawing-ws') {
      drawingWss.handleUpgrade(request, socket, head, (ws) => {
        drawingWss.emit('connection', ws, request);
      });
    }
  });

  // ── Drawing: Heartbeat & disconnect configuration (mirrors Impostor) ──
  const DRAW_HEARTBEAT_INTERVAL = 5000;
  const DRAW_PONG_TIMEOUT = 15000;
  const DRAW_HARD_EXIT_GRACE = 15000;
  const DRAW_EMPTY_ROOM_CLEANUP = 10000;

  const drawHardExitTimers = new Map<string, NodeJS.Timeout>();
  const drawEmptyRoomTimers = new Map<string, NodeJS.Timeout>();
  const drawPlayerInfo = new Map<WebSocket, { roomCode: string; playerId: string; lastPong: number }>();

  function drawMarkDisconnected(ws: WebSocket, roomCode: string, playerId: string) {
    console.log(`[Drawing] Marking ${playerId} as disconnected in ${roomCode}`);
    const connections = drawingRoomConnections.get(roomCode);
    if (connections) connections.delete(ws);
    drawingPlayerConnections.delete(ws);
    drawPlayerInfo.delete(ws);

    const room = drawingRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (player) player.connected = false;
    broadcastToDrawingRoom(roomCode, { type: 'drawing-player-disconnected', playerId, playerName: player?.name });
    broadcastToDrawingRoom(roomCode, { type: 'drawing-room-update', room });
  }

  function drawMarkConnected(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    const t1 = drawHardExitTimers.get(timerKey);
    if (t1) { clearTimeout(t1); drawHardExitTimers.delete(timerKey); }
    const t2 = drawEmptyRoomTimers.get(roomCode);
    if (t2) { clearTimeout(t2); drawEmptyRoomTimers.delete(roomCode); }

    const room = drawingRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (player) player.connected = true;
    broadcastToDrawingRoom(roomCode, { type: 'drawing-player-reconnected', playerId, playerName: player?.name });
    broadcastToDrawingRoom(roomCode, { type: 'drawing-room-update', room });
  }

  function drawHandleHardExit(roomCode: string, playerId: string, reason: string = 'hard_exit') {
    const timerKey = `${roomCode}:${playerId}`;
    const existing = drawHardExitTimers.get(timerKey);
    if (existing) { clearTimeout(existing); drawHardExitTimers.delete(timerKey); }

    console.log(`[Drawing Hard Exit] Removing ${playerId} from ${roomCode} (${reason})`);
    const room = drawingRooms.get(roomCode);
    if (!room) return;

    const playerToRemove = room.players.find(p => p.uid === playerId);
    if (!playerToRemove) return;

    const wasHost = room.hostId === playerId;
    room.players = room.players.filter(p => p.uid !== playerId);

    if (wasHost && room.players.length > 0) {
      const connected = room.players.filter(p => p.connected !== false);
      const newHost = connected.length > 0 ? connected[0] : room.players[0];
      room.hostId = newHost.uid;
      broadcastToDrawingRoom(roomCode, { type: 'drawing-host-changed', newHostName: newHost.name, newHostId: newHost.uid });
    }

    broadcastToDrawingRoom(roomCode, { type: 'player-left', playerName: playerToRemove.name });

    if (room.players.length === 0) {
      drawingRooms.delete(roomCode);
      drawingRoomConnections.delete(roomCode);
      console.log(`[Drawing] Empty room ${roomCode} deleted`);
    } else {
      broadcastToDrawingRoom(roomCode, { type: 'drawing-room-update', room });
    }
  }

  function drawScheduleHardExit(roomCode: string, playerId: string) {
    const timerKey = `${roomCode}:${playerId}`;
    const existing = drawHardExitTimers.get(timerKey);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      drawHardExitTimers.delete(timerKey);
      drawHandleHardExit(roomCode, playerId, 'grace_expired');
    }, DRAW_HARD_EXIT_GRACE);
    drawHardExitTimers.set(timerKey, timer);
  }

  // ── Drawing: disconnect-notice beacon endpoint ──
  app.post('/api/drawing-rooms/:code/disconnect-notice', (req, res) => {
    try {
      const { playerId } = z.object({ playerId: z.string() }).parse(req.body);
      const roomCode = req.params.code.toUpperCase();
      const room = drawingRooms.get(roomCode);
      if (!room) return res.status(404).json({ error: 'Room not found' });

      drawPlayerInfo.forEach((info, ws) => {
        if (info.playerId === playerId && info.roomCode === roomCode) {
          drawMarkDisconnected(ws, roomCode, playerId);
        }
      });
      drawingPlayerConnections.forEach((info, ws) => {
        if (info.playerId === playerId && info.roomCode === roomCode) {
          drawMarkDisconnected(ws, roomCode, playerId);
        }
      });

      const player = room.players.find(p => p.uid === playerId);
      if (player && player.connected !== false) {
        player.connected = false;
        broadcastToDrawingRoom(roomCode, { type: 'drawing-player-disconnected', playerId, playerName: player.name });
        broadcastToDrawingRoom(roomCode, { type: 'drawing-room-update', room });
      }

      drawScheduleHardExit(roomCode, playerId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Failed to process disconnect notice' });
    }
  });

  // ── Drawing: WebSocket ──
  drawingWss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'pong') {
          const info = drawPlayerInfo.get(ws);
          if (info) info.lastPong = Date.now();
          return;
        }

        // Intentional leave
        if (data.type === 'leave') {
          const info = drawPlayerInfo.get(ws) || drawingPlayerConnections.get(ws);
          if (info?.roomCode && info?.playerId) {
            drawHandleHardExit(info.roomCode, info.playerId, 'leave_intentional');
            const connections = drawingRoomConnections.get(info.roomCode);
            if (connections) connections.delete(ws);
            drawingPlayerConnections.delete(ws);
            drawPlayerInfo.delete(ws);
          }
          return;
        }

        // Disconnect notice (browser closing)
        if (data.type === 'disconnect_notice') {
          const info = drawPlayerInfo.get(ws) || drawingPlayerConnections.get(ws);
          if (info?.roomCode && info?.playerId) {
            drawMarkDisconnected(ws, info.roomCode, info.playerId);
            drawScheduleHardExit(info.roomCode, info.playerId);
          }
          return;
        }

        // Sync request — send current room state
        if (data.type === 'sync_request') {
          const info = drawPlayerInfo.get(ws) || drawingPlayerConnections.get(ws);
          if (!info?.roomCode) return;
          if (drawPlayerInfo.has(ws)) drawPlayerInfo.get(ws)!.lastPong = Date.now();
          const room = drawingRooms.get(info.roomCode);
          if (room) {
            ws.send(JSON.stringify({ type: 'drawing-room-update', room }));
          }
          return;
        }

        // Join room
        if (data.type === 'join-drawing-room' && data.roomCode && data.playerId) {
          const roomCode = data.roomCode as string;
          const playerId = data.playerId as string;

          if (!drawingRoomConnections.has(roomCode)) {
            drawingRoomConnections.set(roomCode, new Set());
          }
          drawingRoomConnections.get(roomCode)!.add(ws);
          drawingPlayerConnections.set(ws, { roomCode, playerId });
          drawPlayerInfo.set(ws, { roomCode, playerId, lastPong: Date.now() });

          const room = drawingRooms.get(roomCode);
          if (room) {
            const existing = room.players.find(p => p.uid === playerId);
            if (existing) {
              console.log(`[Drawing Reconnect] ${playerId} reconnecting to ${roomCode}`);
              drawMarkConnected(roomCode, playerId);
            }
            ws.send(JSON.stringify({ type: 'drawing-room-update', room }));
          }
        }

        // Real-time stroke broadcast
        if (data.type === 'draw-stroke' && data.roomCode && data.stroke) {
          const connections = drawingRoomConnections.get(data.roomCode);
          if (!connections) return;
          const msg = JSON.stringify({ type: 'draw-stroke', stroke: data.stroke, playerId: data.playerId });
          connections.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(msg);
            }
          });
        }

        // Undo last stroke
        if (data.type === 'draw-undo' && data.roomCode) {
          const connections = drawingRoomConnections.get(data.roomCode);
          if (!connections) return;
          const msg = JSON.stringify({ type: 'draw-undo' });
          connections.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(msg);
            }
          });
        }

        // Turn complete
        if (data.type === 'drawing-turn-complete' && data.roomCode) {
          const room = drawingRooms.get(data.roomCode);
          if (!room || !room.gameData || !room.gameData.drawingOrder) return;

          const nextIndex = (room.gameData.currentDrawerIndex || 0) + 1;

          if (nextIndex >= room.gameData.drawingOrder.length) {
            room.status = 'roundEnd';
            room.gameData.currentDrawerId = undefined;
            broadcastToDrawingRoom(data.roomCode, { type: 'drawing-round-end' });
          } else {
            room.gameData.currentDrawerIndex = nextIndex;
            room.gameData.currentDrawerId = room.gameData.drawingOrder[nextIndex];
            broadcastToDrawingRoom(data.roomCode, {
              type: 'drawing-turn-start',
              drawerId: room.gameData.currentDrawerId,
              turnIndex: nextIndex,
            });
          }

          broadcastToDrawingRoom(data.roomCode, { type: 'drawing-room-update', room });
        }

      } catch (error) {
        console.error('[Drawing WS Error]:', error);
      }
    });

    ws.on('close', () => {
      const info = drawPlayerInfo.get(ws) || drawingPlayerConnections.get(ws);
      if (!info?.roomCode || !info?.playerId) {
        drawingPlayerConnections.delete(ws);
        drawPlayerInfo.delete(ws);
        return;
      }
      console.log(`[Drawing Close] WS closed for ${info.playerId} in ${info.roomCode}`);
      drawMarkDisconnected(ws, info.roomCode, info.playerId);
      drawScheduleHardExit(info.roomCode, info.playerId);
    });
  });

  // ── Drawing: Heartbeat — ping clients, detect unresponsive ──
  setInterval(() => {
    const now = Date.now();
    drawPlayerInfo.forEach((info, ws) => {
      if (!info.playerId || !info.roomCode) return;
      const timeSinceLastPong = now - info.lastPong;
      if (timeSinceLastPong > DRAW_PONG_TIMEOUT) {
        console.log(`[Drawing Heartbeat] ${info.playerId} unresponsive (${timeSinceLastPong}ms)`);
        drawMarkDisconnected(ws, info.roomCode, info.playerId);
        drawScheduleHardExit(info.roomCode, info.playerId);
      } else if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'ping' })); } catch (e) { /* ignore */ }
      }
    });
  }, DRAW_HEARTBEAT_INTERVAL);

  // ═══════════════════════════════════════════════════════════════
  // DESAFIO DA PALAVRA — multiplayer word-building game
  // ═══════════════════════════════════════════════════════════════

  // Desafio da Palavra uses the existing impostor room storage (storage.*) with
  // gameMode = 'desafioPalavra'. All lobby/connection logic is shared.
  // New WebSocket message types are handled in the existing wss (game-ws).

  // Normalize string: lowercase, remove accents, ç→c
  function normalizeWord(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ç/g, 'c');
  }

  // Verify if a word exists in Dicionário Aberto
  async function verificarPalavra(palavra: string): Promise<boolean> {
    try {
      const norm = normalizeWord(palavra);
      const url = `https://api.dicionario-aberto.net/word/${encodeURIComponent(norm)}`;
      const res = await fetch(url);
      if (!res.ok) return false;
      const data = await res.json();
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch {
      return false;
    }
  }

  // Check if any word starts with the given prefix (i.e., prefix can still grow)
  async function temExtensoes(prefixo: string): Promise<boolean> {
    try {
      const norm = normalizeWord(prefixo);
      const url = `https://api.dicionario-aberto.net/search-prefix/${encodeURIComponent(norm)}`;
      const res = await fetch(url);
      if (!res.ok) return false;
      const data: Array<{ word: string }> = await res.json();
      // Look for words strictly longer than the prefix
      return data.some(item => normalizeWord(item.word).length > norm.length);
    } catch {
      return false;
    }
  }

  // Returns the current turn player by cycling through ALL players (sorted by ordem),
  // skipping eliminated ones. turnIndex is a global counter that never resets to 0,
  // so the sequence 1-2-3-1-2-3 is always preserved regardless of who lost a life.
  function getDesafioTurnPlayer(
    players: { uid: string; ordem?: number }[],
    vidasMap: Record<string, number>,
    turnIndex: number,
  ) {
    const allSorted = [...players].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
    const n = allSorted.length;
    if (n === 0) return null;
    // Walk forward from turnIndex position until we find a living player
    for (let i = 0; i < n; i++) {
      const candidate = allSorted[(turnIndex + i) % n];
      if ((vidasMap[candidate.uid] ?? 0) > 0) return candidate;
    }
    return null;
  }

  // POST /api/desafio/rooms/create
  app.post('/api/desafio/rooms/create', async (req, res) => {
    try {
      const { hostId, hostName } = z.object({
        hostId: z.string(),
        hostName: z.string().min(1).max(30),
      }).parse(req.body);

      let code: string;
      let attempts = 0;
      do {
        code = generateRoomCode();
        attempts++;
      } while ((await storage.getRoom(code)) && attempts < 10);

      const host: Player = { uid: hostId, name: hostName, connected: true };
      const room = await storage.createRoom({
        code,
        hostId,
        status: 'waiting',
        gameMode: 'desafioPalavra',
        currentCategory: null,
        currentWord: null,
        impostorId: null,
        gameData: null,
        players: [host],
      });

      trackLobbyJoin(code, hostId, hostName, true, 'desafioPalavra', null, req).catch(() => {});
      trackRoomJoin(req.cookies?.['visitor_id'] || hostId, code, 'desafioPalavra', req).catch(() => {});
      res.json(room);
    } catch (error) {
      console.error('[Desafio] Create room error:', error);
      res.status(400).json({ error: 'Failed to create room' });
    }
  });

  // POST /api/desafio/rooms/join
  app.post('/api/desafio/rooms/join', async (req, res) => {
    try {
      const { code, playerId, playerName } = z.object({
        code: z.string(),
        playerId: z.string(),
        playerName: z.string().min(1).max(30),
      }).parse(req.body);

      const roomCode = code.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
      if (room.gameMode !== 'desafioPalavra') return res.status(400).json({ error: 'Sala não é do tipo Desafio da Palavra' });
      if (room.status === 'playing') {
        const existing = room.players.find(p => p.uid === playerId);
        if (!existing) return res.status(400).json({ error: 'Jogo já em andamento' });
      }
      if (room.players.length >= 4 && !room.players.find(p => p.uid === playerId)) {
        return res.status(400).json({ error: 'Sala cheia (máximo 4 jogadores)' });
      }

      const player: Player = { uid: playerId, name: playerName, connected: true };
      const updated = await storage.addPlayerToRoom(roomCode, player);
      if (!updated) return res.status(500).json({ error: 'Failed to join room' });

      trackLobbyJoin(roomCode, playerId, playerName, false, 'desafioPalavra', null, req).catch(() => {});
      trackRoomJoin(req.cookies?.['visitor_id'] || playerId, roomCode, 'desafioPalavra', req).catch(() => {});
      broadcastToRoom(roomCode, { type: 'room-update', room: updated });
      res.json(updated);
    } catch (error) {
      console.error('[Desafio] Join room error:', error);
      res.status(400).json({ error: 'Failed to join room' });
    }
  });

  // POST /api/desafio/rooms/:code/start
  app.post('/api/desafio/rooms/:code/start', async (req, res) => {
    try {
      const roomCode = req.params.code.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.gameMode !== 'desafioPalavra') return res.status(400).json({ error: 'Wrong game mode' });

      const activePlayers = room.players.filter(p => p.connected !== false);
      if (activePlayers.length < 2) return res.status(400).json({ error: 'Mínimo 2 jogadores' });

      // Shuffle turn order
      const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
      const vidasMap: Record<string, number> = {};
      const updatedPlayers = room.players.map((p, _i) => {
        const ordem = shuffled.findIndex(s => s.uid === p.uid);
        vidasMap[p.uid] = 3;
        return { ...p, vidas: 3, ordem: ordem >= 0 ? ordem : 99 };
      });

      const gameData = {
        currentWord: '',
        vidasMap,
        turnIndex: 0,
        wordStatus: 'jogando' as const,
        lastAction: undefined,
        vencedorId: undefined,
        vencedorName: undefined,
      };

      const updated = await storage.updateRoom(roomCode, {
        status: 'playing',
        players: updatedPlayers,
        gameData,
      });

      if (!updated) return res.status(500).json({ error: 'Failed to start game' });

      broadcastToRoom(roomCode, { type: 'room-update', room: updated });
      if (activePlayers.length >= 3) {
        recordGameSession('desafio', roomCode, activePlayers.length).catch(() => {});
      }
      res.json(updated);
    } catch (error) {
      console.error('[Desafio] Start error:', error);
      res.status(400).json({ error: 'Failed to start game' });
    }
  });

  // POST /api/desafio/rooms/:code/reset
  app.post('/api/desafio/rooms/:code/reset', async (req, res) => {
    try {
      const roomCode = req.params.code.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (!room) return res.status(404).json({ error: 'Room not found' });

      const resetPlayers = room.players.map(p => ({
        uid: p.uid,
        name: p.name,
        connected: p.connected,
        waitingForGame: false,
      }));

      const updated = await storage.updateRoom(roomCode, {
        status: 'waiting',
        gameData: null,
        players: resetPlayers,
      });

      if (!updated) return res.status(500).json({ error: 'Failed to reset' });
      broadcastToRoom(roomCode, { type: 'room-update', room: updated });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Failed to reset room' });
    }
  });

  // POST /api/desafio/rooms/:code/disconnect-notice  (sendBeacon fallback)
  app.post('/api/desafio/rooms/:code/disconnect-notice', async (req, res) => {
    try {
      const { playerId } = z.object({ playerId: z.string() }).parse(req.body);
      const roomCode = req.params.code.toUpperCase();
      const room = await storage.getRoom(roomCode);
      if (room) {
        const wasHost = room.hostId === playerId;
        const updatedPlayers = room.players.map(p =>
          p.uid === playerId ? { ...p, connected: false } : p
        );

        // Transfer host if the leaving player was the host
        let newHostId = room.hostId;
        if (wasHost) {
          const connectedPlayers = updatedPlayers.filter(p => p.connected !== false && p.uid !== playerId);
          if (connectedPlayers.length > 0) {
            newHostId = connectedPlayers[0].uid;
          } else {
            // No one connected — pick any remaining player
            const others = updatedPlayers.filter(p => p.uid !== playerId);
            if (others.length > 0) newHostId = others[0].uid;
          }
        }

        const updated = await storage.updateRoom(roomCode, {
          players: updatedPlayers,
          hostId: newHostId,
        });
        if (updated) {
          broadcastToRoom(roomCode, { type: 'room-update', room: updated });
          if (wasHost && newHostId !== playerId) {
            const newHostPlayer = updatedPlayers.find(p => p.uid === newHostId);
            broadcastToRoom(roomCode, {
              type: 'host-changed',
              newHostId,
              newHostName: newHostPlayer?.name,
            });
          }
        }
      }
      res.status(204).send();
    } catch {
      res.status(400).json({ error: 'Failed' });
    }
  });

  // ── Desafio da Palavra: WebSocket handlers (added to existing wss) ──
  // These are injected into the existing wss.on('connection') handler via a
  // separate listener on the same wss instance.

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // ── inserir-letra ──────────────────────────────────────────
        if (data.type === 'desafio-inserir-letra' && data.roomCode && data.playerId && data.letra) {
          const roomCode = data.roomCode as string;
          const playerId = data.playerId as string;
          const letra = (data.letra as string).toUpperCase().trim();

          if (letra.length !== 1 || !/[A-ZÀ-Ú]/.test(letra)) return;

          const room = await storage.getRoom(roomCode);
          if (!room || room.status !== 'playing' || room.gameMode !== 'desafioPalavra') return;

          const gd = room.gameData as any;
          if (!gd || gd.wordStatus !== 'jogando') return;

          // Verify it's this player's turn
          const currentPlayer = getDesafioTurnPlayer(room.players, gd.vidasMap ?? {}, gd.turnIndex ?? 0);
          if (!currentPlayer || currentPlayer.uid !== playerId) return;

          const newWord = (gd.currentWord || '') + letra;
          const nextTurnIndex = (gd.turnIndex ?? 0) + 1;

          const updated = await storage.updateRoom(roomCode, {
            gameData: {
              ...gd,
              currentWord: newWord,
              turnIndex: nextTurnIndex,
              lastAction: {
                type: 'inserir',
                letra,
                playerName: currentPlayer.name,
              },
            },
          });

          if (updated) broadcastToRoom(roomCode, { type: 'room-update', room: updated });
        }

        // ── desafiar ───────────────────────────────────────────────
        if (data.type === 'desafio-desafiar' && data.roomCode && data.desafianteId) {
          const roomCode = data.roomCode as string;
          const desafianteId = data.desafianteId as string;

          const room = await storage.getRoom(roomCode);
          if (!room || room.status !== 'playing' || room.gameMode !== 'desafioPalavra') return;

          const gd = room.gameData as any;
          if (!gd || gd.wordStatus !== 'jogando') return;
          if (!gd.currentWord || gd.currentWord.length === 0) return;

          // Only the current turn player can challenge (they choose: add letter OR challenge)
          const currentPlayer = getDesafioTurnPlayer(room.players, gd.vidasMap ?? {}, gd.turnIndex ?? 0);
          if (!currentPlayer || currentPlayer.uid !== desafianteId) return;

          // The challenged player is whoever placed the last letter (previous turn)
          const desafiado = getDesafioTurnPlayer(room.players, gd.vidasMap ?? {}, (gd.turnIndex ?? 0) - 1);
          if (!desafiado || desafiado.uid === desafianteId) return;

          const updated = await storage.updateRoom(roomCode, {
            gameData: {
              ...gd,
              wordStatus: 'defendendo',
              lastAction: {
                type: 'desafio',
                desafianteId,
                desafiadoId: desafiado.uid,
              },
            },
          });

          if (updated) broadcastToRoom(roomCode, { type: 'room-update', room: updated });
        }

        // ── defender-palavra ───────────────────────────────────────
        if (data.type === 'desafio-defender' && data.roomCode && data.playerId && data.palavra) {
          const roomCode = data.roomCode as string;
          const playerId = data.playerId as string;
          const palavra = (data.palavra as string).trim();

          const room = await storage.getRoom(roomCode);
          if (!room || room.status !== 'playing' || room.gameMode !== 'desafioPalavra') return;

          const gd = room.gameData as any;
          if (!gd || gd.wordStatus !== 'defendendo') return;
          if (gd.lastAction?.desafiadoId !== playerId) return;

          const prefixo = gd.currentWord || '';
          const desafianteId = gd.lastAction?.desafianteId;

          // Validate: palavra must start with prefixo, be strictly longer than prefixo,
          // and exist in the dictionary.
          // If the fragment is already a complete word (e.g. "RATO"), the defender must
          // reveal a longer word (e.g. "RATOEIRA") — revealing the same word loses.
          const normPalavra = normalizeWord(palavra);
          const normPrefixo = normalizeWord(prefixo);
          const startsWithPrefix = normPalavra.startsWith(normPrefixo);
          const isLongerThanPrefix = normPalavra.length > normPrefixo.length;
          const wordExists = startsWithPrefix && isLongerThanPrefix ? await verificarPalavra(palavra) : false;

          // If valid defense: desafiante loses a life; else desafiado loses a life
          const loserUid = wordExists ? desafianteId : playerId;
          const newVidasMap = { ...gd.vidasMap };
          if (loserUid && newVidasMap[loserUid] !== undefined) {
            newVidasMap[loserUid] = Math.max(0, newVidasMap[loserUid] - 1);
          }

          // Update player vidas on player objects too
          const updatedPlayers = room.players.map(p => ({
            ...p,
            vidas: newVidasMap[p.uid] ?? p.vidas,
          }));

          // Check for winner (only one player with lives left)
          const alive = updatedPlayers.filter(p => (newVidasMap[p.uid] ?? 0) > 0);
          const isGameOver = alive.length <= 1;

          // Advance turn: desafiante used their turn to challenge, so next is turnIndex + 1.
          // turnIndex is a global counter — never reset to 0 so the sequence stays fixed.
          const nextTurnIndex = (gd.turnIndex ?? 0) + 1;

          const updated = await storage.updateRoom(roomCode, {
            status: isGameOver ? 'waiting' : 'playing',
            players: updatedPlayers,
            gameData: {
              ...gd,
              currentWord: '',
              vidasMap: newVidasMap,
              turnIndex: nextTurnIndex,
              wordStatus: isGameOver ? 'fim_de_jogo' : 'jogando',
              lastAction: {
                type: 'desafio',
                desafianteId,
                desafiadoId: playerId,
                resultado: wordExists,
              },
              vencedorId: isGameOver ? alive[0]?.uid : undefined,
              vencedorName: isGameOver ? alive[0]?.name : undefined,
            },
          });

          if (updated) broadcastToRoom(roomCode, { type: 'room-update', room: updated });
        }

        // ── desafio-leave ──────────────────────────────────────────
        if (data.type === 'desafio-leave' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const playerId = data.playerId as string;

          const room = await storage.getRoom(roomCode);
          if (!room || room.gameMode !== 'desafioPalavra') return;

          const playerToRemove = room.players.find(p => p.uid === playerId);
          if (!playerToRemove) return;

          const wasHost = room.hostId === playerId;
          const updatedPlayers = room.players.filter(p => p.uid !== playerId);

          let newHostId = room.hostId;
          if (wasHost && updatedPlayers.length > 0) {
            const connected = updatedPlayers.filter(p => p.connected !== false);
            newHostId = (connected.length > 0 ? connected[0] : updatedPlayers[0]).uid;
          }

          const updated = await storage.updateRoom(roomCode, {
            players: updatedPlayers,
            hostId: newHostId,
          });

          if (updated) {
            broadcastToRoom(roomCode, { type: 'player-removed', playerId, playerName: playerToRemove.name });
            if (wasHost && newHostId !== playerId) {
              const newHostPlayer = updatedPlayers.find(p => p.uid === newHostId);
              broadcastToRoom(roomCode, { type: 'host-changed', newHostId, newHostName: newHostPlayer?.name });
            }
            broadcastToRoom(roomCode, { type: 'room-update', room: updated });
          }
        }

      } catch (error) {
        // Ignore parse errors from other game types
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // JOGO DA APROXIMAÇÃO — Estimation Game (separate in-memory state)
  // ═══════════════════════════════════════════════════════════════

  type AproximacaoPlayer = {
    uid: string;
    name: string;
    connected?: boolean;
    hearts: number;
    eliminated?: boolean;
  };

  type AproximacaoGuess = {
    playerId: string;
    playerName: string;
    value: number;
  };

  type AproximacaoQuestion = {
    text: string;
    answer: number;
    unit: string;
  };

  type AproximacaoGameData = {
    phase: 'guessing' | 'revealing' | 'gameover';
    question: AproximacaoQuestion;
    guesses: AproximacaoGuess[];
    roundNumber: number;
    winnerId?: string;
    winnerName?: string;
    pendingWinnerId?: string;
    pendingWinnerName?: string;
    lastRoundClosest?: string;
    lastRoundFarthest?: string;
    lastRoundResult?: { closestIds: string[]; farthestIds: string[]; allGuesses: AproximacaoGuess[] };
  };

  type AproximacaoRoom = {
    code: string;
    hostId: string;
    status: 'waiting' | 'playing';
    players: AproximacaoPlayer[];
    gameData: AproximacaoGameData | null;
    createdAt: string;
  };

  const APROXIMACAO_QUESTIONS: AproximacaoQuestion[] = [
    { text: "Qual é a altura da Torre Eiffel em metros?", answer: 330, unit: "metros" },
    { text: "Quantas edições do BBB já aconteceram até 2025?", answer: 25, unit: "edições" },
    { text: "Quantos participantes já passaram pelo BBB somando todas as edições?", answer: 408, unit: "participantes" },
    { text: "Qual é a distância entre São Paulo e Rio de Janeiro em km (em linha reta)?", answer: 358, unit: "km" },
    { text: "Quantos países existem no mundo?", answer: 195, unit: "países" },
    { text: "Qual é a população do Brasil em milhões de habitantes (2024)?", answer: 215, unit: "milhões" },
    { text: "Quantos metros tem o Cristo Redentor do Rio de Janeiro?", answer: 38, unit: "metros" },
    { text: "Qual é a extensão da Muralha da China em km?", answer: 21196, unit: "km" },
    { text: "Quantos anos tem a cidade de Roma (fundada em 753 a.C.)?", answer: 2777, unit: "anos" },
    { text: "Quantas músicas o Spotify tem disponíveis (em milhões, 2024)?", answer: 100, unit: "milhões de músicas" },
    { text: "Qual é a velocidade máxima de um guepardo em km/h?", answer: 120, unit: "km/h" },
    { text: "Quantos ossos tem o corpo humano adulto?", answer: 206, unit: "ossos" },
    { text: "Quantos metros tem a Estátua da Liberdade (incluindo o pedestal)?", answer: 93, unit: "metros" },
    { text: "Qual é a profundidade máxima do oceano em metros (Fossa das Marianas)?", answer: 11034, unit: "metros" },
    { text: "Quantos quilômetros a Lua está da Terra em média?", answer: 384400, unit: "km" },
    { text: "Quantos gramas tem um Big Mac do McDonald's?", answer: 198, unit: "gramas" },
    { text: "Quantas temporadas tem a série Grey's Anatomy?", answer: 20, unit: "temporadas" },
    { text: "Quantos filmes tem o universo cinematográfico da Marvel (MCU) até 2024?", answer: 33, unit: "filmes" },
    { text: "Qual é a quantidade de calorias em uma lata de Coca-Cola (350ml)?", answer: 151, unit: "calorias" },
    { text: "Quantas letras tem o alfabeto português?", answer: 26, unit: "letras" },
    { text: "Quantos jogadores tem um time de futebol em campo?", answer: 11, unit: "jogadores" },
    { text: "Quantos estados tem o Brasil?", answer: 26, unit: "estados" },
    { text: "Qual é a temperatura de ebulição da água em graus Celsius?", answer: 100, unit: "°C" },
    { text: "Quantos centímetros tem um metro?", answer: 100, unit: "centímetros" },
    { text: "Quantas horas tem uma semana?", answer: 168, unit: "horas" },
    { text: "Quantas edições da Copa do Mundo FIFA já foram realizadas até 2022?", answer: 22, unit: "edições" },
    { text: "Quantos gols Pelé marcou oficialmente em toda sua carreira?", answer: 1283, unit: "gols" },
    { text: "Quantos minutos tem um jogo de futebol regular (sem prorrogação)?", answer: 90, unit: "minutos" },
    { text: "Quantos quilômetros tem a fronteira do Brasil com a Argentina?", answer: 1261, unit: "km" },
    { text: "Qual é a velocidade do som no ar em m/s?", answer: 343, unit: "m/s" },
    { text: "Quantos anos viveu Leonardo da Vinci?", answer: 67, unit: "anos" },
    { text: "Quantas músicas tem o álbum Thriller do Michael Jackson?", answer: 9, unit: "músicas" },
    { text: "Quantos seguidores tinha o Instagram da Selena Gomez no pico (em milhões)?", answer: 400, unit: "milhões" },
    { text: "Quantas pessoas assistiram a final da Copa do Mundo 2022 (em bilhões)?", answer: 1.5, unit: "bilhões" },
    { text: "Quantas letras tem a palavra mais longa do dicionário inglês — pneumonoultramicroscopicsilicovolcanoconiosis?", answer: 45, unit: "letras" },
    { text: "Quantas nadadeiras tem um tubarão?", answer: 5, unit: "nadadeiras" },
    { text: "Quantos segundos tem uma hora?", answer: 3600, unit: "segundos" },
    { text: "Qual é a distância do Brasil ao Japão em km (em linha reta)?", answer: 18520, unit: "km" },
    { text: "Quantos capítulos tem a Bíblia?", answer: 1189, unit: "capítulos" },
    { text: "Quantos metros mede o pé mais longo já registrado no Guinness?", answer: 38, unit: "cm" },
    { text: "Quantas estrelas tem a bandeira do Brasil?", answer: 27, unit: "estrelas" },
    { text: "Quantos anos tem a Pirâmide de Gizé (construída aproximadamente 2560 a.C.)?", answer: 4584, unit: "anos" },
    { text: "Em quantos metros de altitude fica o Monte Everest?", answer: 8849, unit: "metros" },
    { text: "Quantas ilhas tem a Grécia?", answer: 6000, unit: "ilhas" },
    { text: "Qual é a duração em minutos do filme Vingadores: Ultimato?", answer: 181, unit: "minutos" },
    { text: "Quantas músicas tem o Spotify no Brasil (estimativa em milhões)?", answer: 80, unit: "milhões" },
    { text: "Quantos dentes tem um ser humano adulto com os sisos?", answer: 32, unit: "dentes" },
    { text: "Quantas espécies de dinossauros foram descobertas até hoje?", answer: 1000, unit: "espécies" },
    { text: "Qual é o peso médio de um elefante africano adulto em kg?", answer: 5000, unit: "kg" },
    { text: "Quantos idiomas são falados no mundo?", answer: 7000, unit: "idiomas" },
    { text: "Quantos litros de sangue um adulto tem no corpo?", answer: 5, unit: "litros" },
    { text: "Quantos watts de energia o sol produz por segundo (em yottawatts)?", answer: 384, unit: "yottawatts" },
    { text: "Quantas calories uma maçã média tem?", answer: 95, unit: "calorias" },
    { text: "Quantos anos levou para construir a Sagrada Família em Barcelona (iniciada em 1882)?", answer: 143, unit: "anos" },
    { text: "Quantas estações de metrô existem em São Paulo?", answer: 91, unit: "estações" },
    { text: "Quantos quilômetros tem a Amazônia (área em km²)?", answer: 5500000, unit: "km²" },
    { text: "Quantos personagens jogáveis tem Super Smash Bros. Ultimate?", answer: 89, unit: "personagens" },
    { text: "Quantas canções gravou Roberto Carlos ao longo da carreira?", answer: 500, unit: "canções" },
    { text: "Quantas temporadas tem 'The Simpsons'?", answer: 35, unit: "temporadas" },
    { text: "Em quantos países o Mc Donald's está presente?", answer: 100, unit: "países" },
    { text: "Quantos sócios tem o Flamengo (o maior clube do Brasil em número)?", answer: 100000, unit: "sócios" },
    { text: "Quantos episódios tem a série Friends?", answer: 236, unit: "episódios" },
    // Novas perguntas adicionadas
    { text: "Qual a altura do Cristo Redentor com pedestal em metros?", answer: 38, unit: "metros" },
    { text: "Quantos minutos dura o filme Titanic?", answer: 194, unit: "minutos" },
    { text: "Quantos degraus tem a escadaria da Penha no Rio de Janeiro?", answer: 382, unit: "degraus" },
    { text: "Quantos dias o astronauta Marcos Pontes ficou no espaço?", answer: 9, unit: "dias" },
    { text: "Qual a população aproximada de São Paulo em milhões?", answer: 12, unit: "milhões" },
    { text: "Qual o tempo de gestação de um elefante africano em meses?", answer: 22, unit: "meses" },
    { text: "Quantos Oscars o filme Ben-Hur venceu?", answer: 11, unit: "Oscars" },
    { text: "Quantos anos durou a Guerra dos Cem Anos?", answer: 116, unit: "anos" },
    { text: "Qual o recorde dos 100m rasos de Usain Bolt em segundos?", answer: 9.58, unit: "segundos" },
    { text: "Quantos anos viveu a pessoa mais velha da história?", answer: 122, unit: "anos" },
    { text: "Qual a profundidade da Fossa das Marianas em metros?", answer: 10984, unit: "metros" },
    { text: "Quantos degraus tem a Torre Eiffel?", answer: 1665, unit: "degraus" },
    { text: "Quantos episódios tem Breaking Bad?", answer: 62, unit: "episódios" },
    { text: "Quantos episódios tem Game of Thrones?", answer: 73, unit: "episódios" },
    { text: "Quantos episódios tem The Office (US)?", answer: 201, unit: "episódios" },
    { text: "Quantos minutos dura o filme Interestelar?", answer: 169, unit: "minutos" },
    { text: "Quantos minutos dura O Senhor dos Anéis: O Retorno do Rei (versão cinema)?", answer: 201, unit: "minutos" },
    { text: "Quantos capítulos tem o mangá Naruto?", answer: 700, unit: "capítulos" },
    { text: "Quantos capítulos tem o mangá Death Note?", answer: 108, unit: "capítulos" },
    { text: "Quantos capítulos tem o mangá Attack on Titan?", answer: 139, unit: "capítulos" },
    { text: "Quantos anos durou a Segunda Guerra Mundial?", answer: 6, unit: "anos" },
    { text: "Quantos anos durou a Guerra Fria?", answer: 44, unit: "anos" },
    { text: "Quantos dias durou a missão da Apollo 11?", answer: 8, unit: "dias" },
    { text: "Quantos anos durou o Império Romano do Ocidente até sua queda?", answer: 503, unit: "anos" },
    { text: "Quantos capítulos tem o mangá One Piece até o capítulo 1000?", answer: 1000, unit: "capítulos" },
    { text: "Quantos dentes um tubarão pode perder ao longo da vida?", answer: 30000, unit: "dentes" },
    { text: "Em média, quantas vezes o coração humano bate por dia?", answer: 100000, unit: "batimentos" },
    { text: "Em média, quantos litros de saliva um ser humano produz por dia?", answer: 1, unit: "litros" },
    { text: "Quantos neurônios tem o cérebro humano?", answer: 86000000000, unit: "neurônios" },
    { text: "Em média, quantos pelos tem um gato doméstico?", answer: 60000, unit: "pelos" },
    { text: "Em média, quantos litros de sangue passam pelo coração por dia?", answer: 7000, unit: "litros" },
    { text: "Em média, quantos sonhos uma pessoa tem por noite?", answer: 4, unit: "sonhos" },
    { text: "Em média, quantas bactérias existem no corpo humano?", answer: 39000000000000, unit: "bactérias" },
    { text: "Em média, quantos passos uma pessoa dá ao longo da vida?", answer: 216000000, unit: "passos" },
    { text: "Quantos cérebros tem uma minhoca?", answer: 5, unit: "cérebros" },
    { text: "Quantos corações tem um polvo?", answer: 3, unit: "corações" },
    { text: "Quantos olhos tem uma abelha?", answer: 5, unit: "olhos" },
    { text: "Em média, quantos litros de água uma nuvem pode carregar?", answer: 500000, unit: "litros" },
    { text: "Quantas espécies de insetos existem no mundo?", answer: 1000000, unit: "espécies" },
    { text: "Em média, quantas formigas existem para cada humano na Terra?", answer: 2500000, unit: "formigas" },
    { text: "Quantos litros de água existem nos oceanos da Terra?", answer: 1332000000000000000, unit: "litros" },
    { text: "Em média, quantos segundos dura a vida de uma pessoa?", answer: 2520000000, unit: "segundos" },
    { text: "Quantos km a luz percorre em 1 segundo?", answer: 299792, unit: "km" },
    { text: "Em média, quantos celulares existem no mundo?", answer: 8000000000, unit: "celulares" },

    // Cultura pop, entretenimento e tecnologia
    { text: "Quantas novelas a TV Globo já produziu?", answer: 350, unit: "novelas" },
    { text: "Quantos desenhos tem a Cartoon Network?", answer: 210, unit: "produções originais" },
    { text: "Quantos personagens tem o jogo Street Fighter?", answer: 113, unit: "personagens" },
    { text: "Quantos personagens tem o jogo Mortal Kombat?", answer: 98, unit: "personagens" },
    { text: "Quantos filmes por dia são vistos na Netflix?", answer: 230000000, unit: "filmes/dia" },
    { text: "Quantas músicas tem o Spotify?", answer: 120000000, unit: "músicas" },
    { text: "Quantas mensagens são enviadas por dia no WhatsApp?", answer: 140000000000, unit: "mensagens" },
    { text: "Quantos posts são postados por dia no X (Twitter)?", answer: 500000000, unit: "posts" },
    { text: "Quantos vídeos existem no TikTok?", answer: 1500000000, unit: "vídeos" },
    { text: "Quantos filmes a Marvel Studios já lançou?", answer: 37, unit: "filmes" },
    { text: "Quantos filmes tem a saga Star Wars?", answer: 12, unit: "filmes" },
    { text: "Quantos episódios tem The Simpsons?", answer: 770, unit: "episódios" },
    { text: "Quantos jogadores registrados tem Fortnite?", answer: 550000000, unit: "jogadores" },
    { text: "Quantos jogadores registrados tem Minecraft?", answer: 600000000, unit: "jogadores" },
    { text: "Quantos jogos existem na Steam?", answer: 115000, unit: "jogos" },
    { text: "Quantos consoles PlayStation 2 foram vendidos?", answer: 158000000, unit: "unidades" },
    { text: "Quantos consoles PlayStation 5 foram vendidos?", answer: 65000000, unit: "unidades" },
    { text: "Quantos usuários ativos tem League of Legends?", answer: 160000000, unit: "usuários mensais" },
    { text: "Quantos seguidores tem Lionel Messi no Instagram?", answer: 505000000, unit: "seguidores" },
    { text: "Quantos gols tem Cristiano Ronaldo na carreira?", answer: 915, unit: "gols" },
    { text: "Quantos títulos tem o Real Madrid?", answer: 103, unit: "títulos" },
    { text: "Quantos estádios existem no Brasil?", answer: 750, unit: "estádios" },
    { text: "Quantos aeroportos existem no Brasil?", answer: 2400, unit: "aeroportos" },
    { text: "Quantos parques tem a Disney?", answer: 12, unit: "parques" },
    { text: "Quantos filmes a Pixar já lançou?", answer: 29, unit: "filmes" },
    { text: "Quantos episódios tem Naruto?", answer: 720, unit: "episódios" },
    { text: "Quantos episódios tem One Piece?", answer: 1120, unit: "episódios" },
    { text: "Quantos episódios tem Dragon Ball no total?", answer: 639, unit: "episódios" },
    { text: "Quantos pokémons existem?", answer: 1025, unit: "pokémons" },
    { text: "Quantos filmes tem Velozes e Furiosos?", answer: 11, unit: "filmes" },
    { text: "Quantos filmes tem Transformers?", answer: 8, unit: "filmes" },
    { text: "Quantos filmes tem a franquia Jurassic Park/World?", answer: 6, unit: "filmes" },
    { text: "Quantos filmes tem o Homem-Aranha no total (live-action solo)?", answer: 10, unit: "filmes" },

    // Fast food e alimentação
    { text: "Quantos McDonald's existem no Brasil?", answer: 1150, unit: "unidades" },
    { text: "Quantos Burger King existem no Brasil?", answer: 960, unit: "unidades" },
    { text: "Quantas lojas tem o McDonald's no mundo?", answer: 41500, unit: "lojas" },
    { text: "Quantas lojas tem o Burger King no mundo?", answer: 19500, unit: "lojas" },
    { text: "Quantos litros de café são consumidos por dia no mundo?", answer: 2250000000, unit: "xícaras/dia" },

    // Mundo e tecnologia
    { text: "Quantos bebês nascem por dia no mundo?", answer: 385000, unit: "bebês" },
    { text: "Quantos vídeos são assistidos por dia no YouTube?", answer: 5000000000, unit: "vídeos" },
    { text: "Quantos usuários tem o Instagram?", answer: 2400000000, unit: "usuários" },
    { text: "Quantos e-mails são enviados por dia?", answer: 360000000000, unit: "e-mails" },
    { text: "Quantos sites existem na internet?", answer: 1100000000, unit: "sites" },
    { text: "Quantos carros existem no mundo?", answer: 1450000000, unit: "carros" },
    { text: "Quantas línguas existem no mundo?", answer: 7168, unit: "línguas" },
    { text: "Quantos países existem no mundo?", answer: 195, unit: "países" },
    { text: "Quantas empresas existem no mundo?", answer: 330000000, unit: "empresas" },
    { text: "Quantos livros existem no mundo?", answer: 160000000, unit: "títulos únicos" },
    { text: "Quantos anos tem a Terra?", answer: 4540000000, unit: "anos" },

    // Brasil
    { text: "Quantos habitantes tem São Paulo (cidade)?", answer: 11500000, unit: "habitantes" },
    { text: "Quantos habitantes tem o Brasil?", answer: 203000000, unit: "habitantes" },
    { text: "Quantos policiais existem no Brasil?", answer: 650000, unit: "policiais" },
    { text: "Quantos professores existem no Brasil?", answer: 2500000, unit: "professores" },
    { text: "Quantos alunos existem no Brasil?", answer: 47300000, unit: "alunos" },
    { text: "Quantos km de estradas existem no Brasil?", answer: 1700000, unit: "km" },
    { text: "Quantos filmes são produzidos por ano nos EUA?", answer: 700, unit: "filmes/ano" },
  ];

  const aproximacaoRooms = new Map<string, AproximacaoRoom>();
  const aproximacaoQuestionPools = new Map<string, number[]>();

  // Admin: Aproximação rooms (in-memory Map)
  app.get("/api/admin/aproximacao-rooms", verifyAdmin, (_req, res) => {
    try {
      const rooms = Array.from(aproximacaoRooms.values()).map(r => ({
        code: r.code,
        hostId: r.hostId,
        status: r.status,
        players: r.players.map(p => ({ uid: p.uid, name: p.name, hearts: p.hearts, eliminated: p.eliminated ?? false, connected: p.connected ?? true })),
        currentQuestion: r.gameData?.question?.text ?? null,
        currentQuestionAnswer: r.gameData?.question?.answer ?? null,
        currentQuestionUnit: r.gameData?.question?.unit ?? null,
        phase: r.gameData?.phase ?? null,
        roundNumber: r.gameData?.roundNumber ?? 0,
        guessCount: r.gameData?.guesses?.length ?? 0,
        winnerId: r.gameData?.winnerId ?? null,
        winnerName: r.gameData?.winnerName ?? null,
        createdAt: r.createdAt,
      }));
      res.json(rooms);
    } catch (error) {
      console.error('[Admin] Error fetching aproximacao rooms:', error);
      res.status(500).json({ error: "Erro ao buscar salas de aproximação" });
    }
  });

  function generateAproximacaoCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function broadcastToAproximacaoRoom(roomCode: string, data: unknown) {
    const message = JSON.stringify(data);
    playerConnections.forEach((info, ws) => {
      if (info.roomCode === roomCode && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  function getNextAproximacaoQuestion(roomCode: string): AproximacaoQuestion {
    let pool = aproximacaoQuestionPools.get(roomCode);
    if (!pool || pool.length === 0) {
      const indices = APROXIMACAO_QUESTIONS.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      pool = indices;
      aproximacaoQuestionPools.set(roomCode, pool);
    }
    const idx = pool.pop()!;
    aproximacaoQuestionPools.set(roomCode, pool);
    return APROXIMACAO_QUESTIONS[idx];
  }

  // Helper: process the reveal logic for a given room
  function doAproximacaoReveal(roomCode: string) {
    const room = aproximacaoRooms.get(roomCode);
    if (!room || !room.gameData || room.gameData.phase !== 'guessing') return;

    const { question, guesses } = room.gameData;
    if (guesses.length === 0) return;

    // Sort by closeness for display
    const sorted = [...guesses].sort((a, b) =>
      Math.abs(a.value - question.answer) - Math.abs(b.value - question.answer)
    );

    const distOf = (g: { value: number }) => Math.abs(g.value - question.answer);
    const minDist = distOf(sorted[0]);
    const maxDist = distOf(sorted[sorted.length - 1]);

    // Identify groups — players that share the exact same distance
    const closestGroup = sorted.filter(g => distOf(g) === minDist);
    const farthestGroup = sorted.filter(g => distOf(g) === maxDist);

    const closestIds = closestGroup.map(g => g.playerId);
    const farthestIds = farthestGroup.map(g => g.playerId);

    // If all players have the exact same distance, no one wins or loses
    if (minDist === maxDist) {
      room.gameData.phase = 'revealing';
      room.gameData.lastRoundResult = { closestIds, farthestIds, allGuesses: sorted };
      broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
      return;
    }

    // No heart award for closest — only the farthest loses a heart

    // Deduct -1 heart from ALL players in the farthest group (even if tied)
    for (const farthestId of farthestIds) {
      const loser = room.players.find(p => p.uid === farthestId);
      if (loser) {
        loser.hearts = Math.max(loser.hearts - 1, 0);
        if (loser.hearts === 0) loser.eliminated = true;
      }
    }

    const alivePlayers = room.players.filter(p => !p.eliminated);
    let winnerId: string | undefined;
    let winnerName: string | undefined;
    if (alivePlayers.length === 1) {
      winnerId = alivePlayers[0].uid;
      winnerName = alivePlayers[0].name;
    }

    // Always go through 'revealing' so players see the last answer before winner screen
    room.gameData.phase = 'revealing';
    room.gameData.lastRoundResult = { closestIds, farthestIds, allGuesses: sorted };
    if (winnerId) {
      room.gameData.pendingWinnerId = winnerId;
      room.gameData.pendingWinnerName = winnerName;
    }

    broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
  }

  // Bot system: schedule random guesses for bots in a round
  function scheduleAproximacaoBotGuesses(roomCode: string) {
    const room = aproximacaoRooms.get(roomCode);
    if (!room || !room.gameData) return;
    const bots = room.players.filter(p => p.name.startsWith('Bot ') && !p.eliminated);
    if (bots.length === 0) return;

    for (const bot of bots) {
      // Random delay between 2 and 9 seconds so bots feel natural
      const delay = 2000 + Math.floor(Math.random() * 7000);
      setTimeout(() => {
        const currentRoom = aproximacaoRooms.get(roomCode);
        if (!currentRoom || !currentRoom.gameData || currentRoom.gameData.phase !== 'guessing') return;
        if (currentRoom.players.find(p => p.uid === bot.uid)?.eliminated) return;

        const answer = currentRoom.gameData.question.answer;
        // Log-space variation: ±1 order of magnitude for large numbers, ±60% for small
        let botGuess: number;
        if (answer <= 0) {
          botGuess = Math.random() * 10;
        } else if (answer < 20) {
          // Small integers: vary ±60% and round to nearest integer
          const variation = 0.4 + Math.random() * 1.2; // 0.4x to 1.6x
          botGuess = Math.round(answer * variation);
          if (botGuess < 1) botGuess = 1;
        } else {
          // Log-space: vary by ±0.7 log10 units (~factor of 5 up or down)
          const logAnswer = Math.log10(answer);
          const logVariation = (Math.random() - 0.5) * 1.4;
          botGuess = Math.round(Math.pow(10, logAnswer + logVariation));
        }

        const existingIdx = currentRoom.gameData.guesses.findIndex(g => g.playerId === bot.uid);
        const guess: AproximacaoGuess = { playerId: bot.uid, playerName: bot.name, value: botGuess };
        if (existingIdx >= 0) {
          currentRoom.gameData.guesses[existingIdx] = guess;
        } else {
          currentRoom.gameData.guesses.push(guess);
        }
        broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room: currentRoom });
        console.log(`[Bot Aprox] ${bot.name} guessed ${botGuess} (answer: ${answer})`);
      }, delay);
    }
  }

  // ── Aproximação: Connection tracking (ping-pong + hard exit) ──────────────
  const aproximacaoConnections = new Map<WebSocket, { roomCode: string; playerId: string; lastPong: number }>();
  const aproximacaoHardExitTimers = new Map<string, NodeJS.Timeout>();
  const APROX_PONG_TIMEOUT = 15000;
  const APROX_HARD_EXIT_GRACE = 15000;

  function markAproximacaoDisconnected(roomCode: string, playerId: string) {
    const room = aproximacaoRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (player && player.connected !== false) {
      player.connected = false;
      broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
    }
  }

  function handleAproximacaoHardExit(roomCode: string, playerId: string) {
    const room = aproximacaoRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (!player) return;

    // Remove player from room
    room.players = room.players.filter(p => p.uid !== playerId);

    // Transfer host if needed
    if (room.hostId === playerId && room.players.length > 0) {
      const next = room.players.find(p => p.connected !== false) ?? room.players[0];
      room.hostId = next.uid;
      broadcastToAproximacaoRoom(roomCode, { type: 'host-changed', newHostId: next.uid, newHostName: next.name });
    }

    broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });

    // If room is empty, delete it
    if (room.players.length === 0) {
      aproximacaoRooms.delete(roomCode);
    }
  }

  function scheduleAproximacaoHardExit(roomCode: string, playerId: string) {
    const key = `${roomCode}:${playerId}`;
    const existing = aproximacaoHardExitTimers.get(key);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      aproximacaoHardExitTimers.delete(key);
      handleAproximacaoHardExit(roomCode, playerId);
    }, APROX_HARD_EXIT_GRACE);
    aproximacaoHardExitTimers.set(key, timer);
  }

  function cancelAproximacaoHardExit(roomCode: string, playerId: string) {
    const key = `${roomCode}:${playerId}`;
    const existing = aproximacaoHardExitTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      aproximacaoHardExitTimers.delete(key);
    }
  }

  // Heartbeat: ping Aproximação clients, detect timeouts
  setInterval(() => {
    const now = Date.now();
    aproximacaoConnections.forEach((info, ws) => {
      if (now - info.lastPong > APROX_PONG_TIMEOUT) {
        markAproximacaoDisconnected(info.roomCode, info.playerId);
        scheduleAproximacaoHardExit(info.roomCode, info.playerId);
        aproximacaoConnections.delete(ws);
      } else if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'ping' })); } catch {}
      }
    });
  }, 5000);

  // REST: Create aproximacao room
  app.post("/api/aproximacao-rooms", (req, res) => {
    const { hostId, playerName } = req.body;
    if (!hostId || !playerName) return res.status(400).json({ error: "Missing hostId or playerName" });

    let code = generateAproximacaoCode();
    while (aproximacaoRooms.has(code)) code = generateAproximacaoCode();

    const room: AproximacaoRoom = {
      code,
      hostId,
      status: 'waiting',
      gameData: null,
      players: [{ uid: hostId, name: playerName, connected: true, hearts: 3 }],
      createdAt: new Date().toISOString(),
    };
    aproximacaoRooms.set(code, room);
    console.log(`[Aproximação] Room ${code} created by ${playerName}`);
    trackRoomJoin(req.cookies?.['visitor_id'] || hostId, code, 'aproximacao', req).catch(() => {});

    // Auto-add bots for admin testing
    if (playerName === "testeadm26") {
      console.log(`[Aproximação Bot] Admin detected — adding 4 bots to room ${code}`);
      const botNames = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta"];
      for (const botName of botNames) {
        const botId = `aprox-bot-${Math.random().toString(36).substr(2, 8)}`;
        room.players.push({ uid: botId, name: botName, connected: true, hearts: 3 });
        console.log(`[Aproximação Bot] Added ${botName} (${botId})`);
      }
    }

    res.json(room);
  });

  // REST: Join aproximacao room
  app.post("/api/aproximacao-rooms/:code/join", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId, playerName } = req.body;
    const room = aproximacaoRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada" });
    if (room.status !== 'waiting') return res.status(400).json({ error: "Jogo já em andamento" });

    const existing = room.players.find(p => p.uid === playerId);
    if (existing) {
      existing.connected = true;
      existing.name = playerName;
    } else {
      room.players.push({ uid: playerId, name: playerName, connected: true, hearts: 3 });
    }

    broadcastToAproximacaoRoom(code, { type: 'aproximacao-room-update', room });
    console.log(`[Aproximação] ${playerName} joined room ${code}`);
    if (!existing) trackRoomJoin(req.cookies?.['visitor_id'] || playerId, code, 'aproximacao', req).catch(() => {});
    res.json(room);
  });

  // REST: Get aproximacao room
  app.get("/api/aproximacao-rooms/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = aproximacaoRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada" });
    res.json(room);
  });

  // REST: Beacon fallback for browser hard-exit
  app.post("/api/aproximacao-rooms/:code/disconnect-notice", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'Missing playerId' });
    markAproximacaoDisconnected(code, playerId);
    scheduleAproximacaoHardExit(code, playerId);
    res.json({ ok: true });
  });

  // ── Aproximação: WebSocket handlers ──
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // ── pong (Aproximação context) ────────────────────────────────────
        if (data.type === 'pong') {
          const info = aproximacaoConnections.get(ws);
          if (info) info.lastPong = Date.now();
          // (ImpostorGame handler also processes pong for its own map)
          return;
        }

        // ── aproximacao-leave (intentional exit) ──────────────────────────
        if (data.type === 'aproximacao-leave' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          aproximacaoConnections.delete(ws);
          cancelAproximacaoHardExit(roomCode, data.playerId);
          handleAproximacaoHardExit(roomCode, data.playerId);
          return;
        }

        // ── aproximacao-disconnect-notice (beacon fallback) ───────────────
        if (data.type === 'aproximacao-disconnect-notice' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          markAproximacaoDisconnected(roomCode, data.playerId);
          scheduleAproximacaoHardExit(roomCode, data.playerId);
          return;
        }

        // ── aproximacao-join ──────────────────────────────────────────────
        if (data.type === 'aproximacao-join' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room) return;

          // Register / update connection tracking
          aproximacaoConnections.set(ws, { roomCode, playerId: data.playerId, lastPong: Date.now() });
          // Cancel any pending hard exit (reconnect)
          cancelAproximacaoHardExit(roomCode, data.playerId);

          // Mark player connected
          const player = room.players.find(p => p.uid === data.playerId);
          if (player) player.connected = true;
          broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
        }

        // ── aproximacao-start ───────────────────────────────────────────────
        if (data.type === 'aproximacao-start' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room || room.hostId !== data.playerId) return;

          const question = getNextAproximacaoQuestion(roomCode);
          // Reset hearts for all active players
          room.players.forEach(p => { p.hearts = 3; p.eliminated = false; });
          room.status = 'playing';
          room.gameData = {
            phase: 'guessing',
            question,
            guesses: [],
            roundNumber: 1,
          };
          aproximacaoRooms.set(roomCode, room);
          broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
          // Schedule bot guesses if there are bots
          scheduleAproximacaoBotGuesses(roomCode);
        }

        // ── aproximacao-submit-guess ───────────────────────────────────────
        if (data.type === 'aproximacao-submit-guess' && data.roomCode && data.playerId && data.value !== undefined) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'guessing') return;

          const player = room.players.find(p => p.uid === data.playerId);
          if (!player || player.eliminated) return;

          // Replace or add guess
          const existingIdx = room.gameData.guesses.findIndex(g => g.playerId === data.playerId);
          const guess: AproximacaoGuess = {
            playerId: data.playerId,
            playerName: player.name,
            value: Number(data.value),
          };
          if (existingIdx >= 0) {
            room.gameData.guesses[existingIdx] = guess;
          } else {
            room.gameData.guesses.push(guess);
          }
          broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });

          // Auto-reveal when every active player has guessed
          const activePlayers = room.players.filter(p => !p.eliminated && p.connected !== false);
          const allGuessed = activePlayers.every(p => room.gameData!.guesses.some(g => g.playerId === p.uid));
          if (allGuessed) {
            doAproximacaoReveal(roomCode);
          }
        }

        // ── aproximacao-reveal ─────────────────────────────────────────────
        if (data.type === 'aproximacao-reveal' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'guessing') return;
          if (room.hostId !== data.playerId) return;

          const activePlayers = room.players.filter(p => !p.eliminated && p.connected !== false);
          const allGuessed = activePlayers.every(p => room.gameData!.guesses.some(g => g.playerId === p.uid));
          if (!allGuessed) return;

          doAproximacaoReveal(roomCode);
        }

        // ── aproximacao-next-round ─────────────────────────────────────────
        if (data.type === 'aproximacao-next-round' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'revealing') return;
          if (room.hostId !== data.playerId) return;

          // If a winner was determined in the last round, transition to gameover now
          if (room.gameData.pendingWinnerId) {
            room.gameData.phase = 'gameover';
            room.gameData.winnerId = room.gameData.pendingWinnerId;
            room.gameData.winnerName = room.gameData.pendingWinnerName;
            broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
            return;
          }

          const question = getNextAproximacaoQuestion(roomCode);
          room.gameData = {
            phase: 'guessing',
            question,
            guesses: [],
            roundNumber: (room.gameData.roundNumber || 1) + 1,
          };
          broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
          // Schedule bot guesses for the new round
          scheduleAproximacaoBotGuesses(roomCode);
        }

        // ── aproximacao-return-to-lobby ────────────────────────────────────
        if (data.type === 'aproximacao-return-to-lobby' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = aproximacaoRooms.get(roomCode);
          if (!room) return;
          if (room.hostId !== data.playerId) return;

          room.status = 'waiting';
          room.gameData = null;
          room.players.forEach(p => { p.hearts = 3; p.eliminated = false; });
          // Clear question pool to get fresh questions
          aproximacaoQuestionPools.delete(roomCode);
          broadcastToAproximacaoRoom(roomCode, { type: 'aproximacao-room-update', room });
        }

      } catch {
        // Ignore parse errors from other game types
      }
    });

    ws.on('close', () => {
      const info = aproximacaoConnections.get(ws);
      if (info) {
        aproximacaoConnections.delete(ws);
        markAproximacaoDisconnected(info.roomCode, info.playerId);
        scheduleAproximacaoHardExit(info.roomCode, info.playerId);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RANKMASTER GAME
  // ─────────────────────────────────────────────────────────────────────────────

  type RankMasterItem = { id: string; label: string; trueRank: number };
  type RankMasterChallenge = { id: string; category: string; items: RankMasterItem[] };
  type RankMasterPlayer = { uid: string; name: string; connected?: boolean; score: number };
  type RankMasterPlayerOrder = { playerId: string; playerName: string; orderedIds: string[]; penalty: number };
  type RankMasterGameData = {
    phase: 'preparing' | 'ordering' | 'revealing' | 'gameover';
    challenge: RankMasterChallenge;
    shuffledItems: RankMasterItem[];
    orders: RankMasterPlayerOrder[];
    roundNumber: number;
    totalRounds: number;
    topCount: number;
    roundWinnerIds: string[];
    preparingEndsAt: number;
  };
  type RankMasterRoom = {
    code: string;
    hostId: string;
    status: 'waiting' | 'playing';
    players: RankMasterPlayer[];
    gameData: RankMasterGameData | null;
    selectedTheme: string;
    createdAt: string;
  };

  const RANKMASTER_CHALLENGES: RankMasterChallenge[] = [
    {
      id: "atores-vingadores",
      category: "Atores mais Ricos de Vingadores",
      items: [
        { id: "rdj", label: "Robert Downey Jr.", trueRank: 1 },
        { id: "sj", label: "Scarlett Johansson", trueRank: 2 },
        { id: "ce", label: "Chris Evans", trueRank: 3 },
        { id: "rh", label: "Chris Hemsworth", trueRank: 4 },
        { id: "mr", label: "Mark Ruffalo", trueRank: 5 },
        { id: "jr", label: "Jeremy Renner", trueRank: 6 },
        { id: "slj", label: "Samuel L. Jackson", trueRank: 7 },
        { id: "bc", label: "Benedict Cumberbatch", trueRank: 8 },
        { id: "th", label: "Tom Holland", trueRank: 9 },
        { id: "cb", label: "Chadwick Boseman", trueRank: 10 },
      ],
    },
    {
      id: "bilheterias-filmes",
      category: "Maiores Bilheterias da História do Cinema",
      items: [
        { id: "avatar", label: "Avatar", trueRank: 1 },
        { id: "avengers-eg", label: "Vingadores: Ultimato", trueRank: 2 },
        { id: "avatar2", label: "Avatar: O Caminho da Água", trueRank: 3 },
        { id: "titanic", label: "Titanic", trueRank: 4 },
        { id: "starwars7", label: "Star Wars: O Despertar da Força", trueRank: 5 },
        { id: "avengers-iw", label: "Vingadores: Guerra Infinita", trueRank: 6 },
        { id: "spiderman-nwh", label: "Homem-Aranha: Sem Volta Para Casa", trueRank: 7 },
        { id: "lion-king", label: "O Rei Leão (2019)", trueRank: 8 },
        { id: "furious7", label: "Velozes e Furiosos 7", trueRank: 9 },
        { id: "frozen2", label: "Frozen 2", trueRank: 10 },
      ],
    },
    {
      id: "paises-populosos",
      category: "Países Mais Populosos do Mundo",
      items: [
        { id: "india", label: "Índia", trueRank: 1 },
        { id: "china", label: "China", trueRank: 2 },
        { id: "usa", label: "Estados Unidos", trueRank: 3 },
        { id: "indonesia", label: "Indonésia", trueRank: 4 },
        { id: "pakistan", label: "Paquistão", trueRank: 5 },
        { id: "brasil", label: "Brasil", trueRank: 6 },
        { id: "nigeria", label: "Nigéria", trueRank: 7 },
        { id: "bangladesh", label: "Bangladesh", trueRank: 8 },
        { id: "russia", label: "Rússia", trueRank: 9 },
        { id: "etiopia", label: "Etiópia", trueRank: 10 },
      ],
    },
    {
      id: "paises-maiores",
      category: "Maiores Países do Mundo por Território",
      items: [
        { id: "russia-t", label: "Rússia", trueRank: 1 },
        { id: "canada-t", label: "Canadá", trueRank: 2 },
        { id: "usa-t", label: "Estados Unidos", trueRank: 3 },
        { id: "china-t", label: "China", trueRank: 4 },
        { id: "brasil-t", label: "Brasil", trueRank: 5 },
        { id: "australia-t", label: "Austrália", trueRank: 6 },
        { id: "india-t", label: "Índia", trueRank: 7 },
        { id: "argentina-t", label: "Argentina", trueRank: 8 },
        { id: "cazaquistao-t", label: "Cazaquistão", trueRank: 9 },
        { id: "argelia-t", label: "Argélia", trueRank: 10 },
      ],
    },
    {
      id: "redes-sociais",
      category: "Redes Sociais com Mais Usuários Ativos",
      items: [
        { id: "facebook", label: "Facebook", trueRank: 1 },
        { id: "youtube", label: "YouTube", trueRank: 2 },
        { id: "whatsapp", label: "WhatsApp", trueRank: 3 },
        { id: "instagram", label: "Instagram", trueRank: 4 },
        { id: "wechat", label: "WeChat", trueRank: 5 },
        { id: "tiktok", label: "TikTok", trueRank: 6 },
        { id: "telegram", label: "Telegram", trueRank: 7 },
        { id: "snapchat", label: "Snapchat", trueRank: 8 },
        { id: "pinterest", label: "Pinterest", trueRank: 9 },
        { id: "twitter", label: "X (Twitter)", trueRank: 10 },
      ],
    },
    {
      id: "esportes-olimpicos",
      category: "Esportes com Mais Atletas nos Jogos Olímpicos",
      items: [
        { id: "atletismo", label: "Atletismo", trueRank: 1 },
        { id: "natacao", label: "Natação", trueRank: 2 },
        { id: "ginastica", label: "Ginástica Artística", trueRank: 3 },
        { id: "ciclismo", label: "Ciclismo", trueRank: 4 },
        { id: "judô", label: "Judô", trueRank: 5 },
        { id: "remo", label: "Remo", trueRank: 6 },
        { id: "vela", label: "Vela", trueRank: 7 },
        { id: "tiro", label: "Tiro Esportivo", trueRank: 8 },
        { id: "luta", label: "Luta Olímpica", trueRank: 9 },
        { id: "canoagem", label: "Canoagem", trueRank: 10 },
      ],
    },
    {
      id: "empresas-valiosas",
      category: "Empresas Mais Valiosas do Mundo",
      items: [
        { id: "apple", label: "Apple", trueRank: 1 },
        { id: "microsoft", label: "Microsoft", trueRank: 2 },
        { id: "nvidia", label: "NVIDIA", trueRank: 3 },
        { id: "alphabet", label: "Alphabet (Google)", trueRank: 4 },
        { id: "amazon", label: "Amazon", trueRank: 5 },
        { id: "saudi-aramco", label: "Saudi Aramco", trueRank: 6 },
        { id: "meta", label: "Meta", trueRank: 7 },
        { id: "berkshire", label: "Berkshire Hathaway", trueRank: 8 },
        { id: "tsmc", label: "TSMC", trueRank: 9 },
        { id: "tesla", label: "Tesla", trueRank: 10 },
      ],
    },
    {
      id: "montanhas-altas",
      category: "Montanhas Mais Altas do Mundo",
      items: [
        { id: "everest", label: "Monte Everest", trueRank: 1 },
        { id: "k2", label: "K2", trueRank: 2 },
        { id: "kangchenjunga", label: "Kangchenjunga", trueRank: 3 },
        { id: "lhotse", label: "Lhotse", trueRank: 4 },
        { id: "makalu", label: "Makalu", trueRank: 5 },
        { id: "cho-oyu", label: "Cho Oyu", trueRank: 6 },
        { id: "dhaulagiri", label: "Dhaulagiri", trueRank: 7 },
        { id: "manaslu", label: "Manaslu", trueRank: 8 },
        { id: "nanga-parbat", label: "Nanga Parbat", trueRank: 9 },
        { id: "annapurna", label: "Annapurna", trueRank: 10 },
      ],
    },
    {
      id: "jogos-vendidos",
      category: "Jogos Mais Vendidos de Todos os Tempos",
      items: [
        { id: "minecraft", label: "Minecraft", trueRank: 1 },
        { id: "gta5", label: "GTA V", trueRank: 2 },
        { id: "tetris", label: "Tetris", trueRank: 3 },
        { id: "wii-sports", label: "Wii Sports", trueRank: 4 },
        { id: "pubg", label: "PUBG", trueRank: 5 },
        { id: "mario-kart8", label: "Mario Kart 8 Deluxe", trueRank: 6 },
        { id: "pokemon-gsrby", label: "Pokémon G/S/R/BY", trueRank: 7 },
        { id: "terraria", label: "Terraria", trueRank: 8 },
        { id: "animal-crossing", label: "Animal Crossing: New Horizons", trueRank: 9 },
        { id: "mario-bros", label: "Super Mario Bros", trueRank: 10 },
      ],
    },
    {
      id: "artistas-streams",
      category: "Artistas com Mais Streams no Spotify (histórico)",
      items: [
        { id: "ed-sheeran", label: "Ed Sheeran", trueRank: 1 },
        { id: "bad-bunny", label: "Bad Bunny", trueRank: 2 },
        { id: "taylor-swift", label: "Taylor Swift", trueRank: 3 },
        { id: "the-weeknd", label: "The Weeknd", trueRank: 4 },
        { id: "drake", label: "Drake", trueRank: 5 },
        { id: "ariana", label: "Ariana Grande", trueRank: 6 },
        { id: "billie", label: "Billie Eilish", trueRank: 7 },
        { id: "post-malone", label: "Post Malone", trueRank: 8 },
        { id: "rihanna", label: "Rihanna", trueRank: 9 },
        { id: "juice-wrld", label: "Juice WRLD", trueRank: 10 },
      ],
    },
    {
      id: "atores-ricos-vingadores-v2",
      category: "Atores mais Ricos da Franquia Vingadores (Patrimônio)",
      items: [
        { id: "rdj-v2", label: "Robert Downey Jr. ($300M+)", trueRank: 1 },
        { id: "slj-v2", label: "Samuel L. Jackson ($250M)", trueRank: 2 },
        { id: "sj-v2", label: "Scarlett Johansson ($165M)", trueRank: 3 },
        { id: "rh-v2", label: "Chris Hemsworth ($130M)", trueRank: 4 },
        { id: "ce-v2", label: "Chris Evans ($110M)", trueRank: 5 },
        { id: "pr-v2", label: "Paul Rudd ($70M)", trueRank: 6 },
        { id: "jr-v2", label: "Jeremy Renner ($80M)", trueRank: 7 },
        { id: "mr-v2", label: "Mark Ruffalo ($35M)", trueRank: 8 },
        { id: "th-v2", label: "Tom Holland ($25M)", trueRank: 9 },
        { id: "bc-v2", label: "Benedict Cumberbatch ($20M)", trueRank: 10 },
      ],
    },
    {
      id: "marcas-luxo",
      category: "Marcas de Luxo mais Valiosas do Mundo",
      items: [
        { id: "lv", label: "Louis Vuitton", trueRank: 1 },
        { id: "hermes", label: "Hermès", trueRank: 2 },
        { id: "chanel", label: "Chanel", trueRank: 3 },
        { id: "gucci", label: "Gucci", trueRank: 4 },
        { id: "dior", label: "Dior", trueRank: 5 },
        { id: "cartier", label: "Cartier", trueRank: 6 },
        { id: "rolex", label: "Rolex", trueRank: 7 },
        { id: "tiffany", label: "Tiffany & Co.", trueRank: 8 },
        { id: "prada", label: "Prada", trueRank: 9 },
        { id: "burberry", label: "Burberry", trueRank: 10 },
      ],
    },
    {
      id: "bilionarios-tech",
      category: "Maiores Bilionários da Tecnologia (Forbes 2025/26)",
      items: [
        { id: "musk", label: "Elon Musk (Tesla/X)", trueRank: 1 },
        { id: "bezos", label: "Jeff Bezos (Amazon)", trueRank: 2 },
        { id: "zuck", label: "Mark Zuckerberg (Meta)", trueRank: 3 },
        { id: "ellison", label: "Larry Ellison (Oracle)", trueRank: 4 },
        { id: "gates", label: "Bill Gates (Microsoft)", trueRank: 5 },
        { id: "lpage", label: "Larry Page (Google)", trueRank: 6 },
        { id: "brin", label: "Sergey Brin (Google)", trueRank: 7 },
        { id: "ballmer", label: "Steve Ballmer (Microsoft)", trueRank: 8 },
        { id: "dell", label: "Michael Dell (Dell)", trueRank: 9 },
        { id: "huang", label: "Jensen Huang (NVIDIA)", trueRank: 10 },
      ],
    },
    {
      id: "franquias-bilheteria",
      category: "Franquias de Cinema com Maior Bilheteria Total",
      items: [
        { id: "mcu", label: "Universo Cinematográfico Marvel (MCU)", trueRank: 1 },
        { id: "starwars", label: "Star Wars", trueRank: 2 },
        { id: "spiderman", label: "Spider-Man (Sony/Marvel)", trueRank: 3 },
        { id: "harrypotter", label: "Wizarding World (Harry Potter)", trueRank: 4 },
        { id: "bond", label: "James Bond", trueRank: 5 },
        { id: "avengers4", label: "Avengers (Apenas os 4 filmes)", trueRank: 6 },
        { id: "fastnfurious", label: "Fast & Furious", trueRank: 7 },
        { id: "batman", label: "Batman", trueRank: 8 },
        { id: "disney-live", label: "Disney Live Actions", trueRank: 9 },
        { id: "xmen", label: "X-Men", trueRank: 10 },
      ],
    },
    {
      id: "moedas-valorizadas",
      category: "Moedas mais Valorizadas frente ao Dólar (USD)",
      items: [
        { id: "dinar-kw", label: "Dinar do Kuwait", trueRank: 1 },
        { id: "dinar-bh", label: "Dinar do Bahrein", trueRank: 2 },
        { id: "rial-om", label: "Rial de Omã", trueRank: 3 },
        { id: "dinar-jo", label: "Dinar da Jordânia", trueRank: 4 },
        { id: "libra", label: "Libra Esterlina", trueRank: 5 },
        { id: "dolar-cayman", label: "Dólar das Ilhas Cayman", trueRank: 6 },
        { id: "euro", label: "Euro", trueRank: 7 },
        { id: "franco", label: "Franco Suíço", trueRank: 8 },
        { id: "dolar-us", label: "Dólar Americano", trueRank: 9 },
        { id: "dolar-ca", label: "Dólar Canadense", trueRank: 10 },
      ],
    },
    {
      id: "atletas-pagos",
      category: "Atletas mais Bem Pagos do Mundo (Salário + Patrocínio)",
      items: [
        { id: "cr7", label: "Cristiano Ronaldo (Futebol)", trueRank: 1 },
        { id: "rahm", label: "Jon Rahm (Golfe)", trueRank: 2 },
        { id: "messi", label: "Lionel Messi (Futebol)", trueRank: 3 },
        { id: "lebron", label: "LeBron James (Basquete)", trueRank: 4 },
        { id: "giannis", label: "Giannis Antetokounmpo (Basquete)", trueRank: 5 },
        { id: "mbappe", label: "Kylian Mbappé (Futebol)", trueRank: 6 },
        { id: "neymar", label: "Neymar Jr. (Futebol)", trueRank: 7 },
        { id: "benzema", label: "Karim Benzema (Futebol)", trueRank: 8 },
        { id: "curry", label: "Stephen Curry (Basquete)", trueRank: 9 },
        { id: "lamar", label: "Lamar Jackson (Futebol Americano)", trueRank: 10 },
      ],
    },
    {
      id: "cidades-caras",
      category: "Cidades com o Custo de Vida mais Caro (Global)",
      items: [
        { id: "zurique", label: "Zurique", trueRank: 1 },
        { id: "singapura", label: "Singapura", trueRank: 2 },
        { id: "genebra", label: "Genebra", trueRank: 3 },
        { id: "nyc", label: "Nova York", trueRank: 4 },
        { id: "hongkong", label: "Hong Kong", trueRank: 5 },
        { id: "la", label: "Los Angeles", trueRank: 6 },
        { id: "paris", label: "Paris", trueRank: 7 },
        { id: "telaviv", label: "Tel Aviv", trueRank: 8 },
        { id: "copenhague", label: "Copenhague", trueRank: 9 },
        { id: "sfran", label: "São Francisco", trueRank: 10 },
      ],
    },
    {
      id: "transferencias-futebol",
      category: "Transferências mais Caras da História do Futebol",
      items: [
        { id: "neymar-tf", label: "Neymar (Barça → PSG)", trueRank: 1 },
        { id: "mbappe-tf", label: "Kylian Mbappé (Mônaco → PSG)", trueRank: 2 },
        { id: "coutinho-tf", label: "Philippe Coutinho (Liverpool → Barça)", trueRank: 3 },
        { id: "joaofelix-tf", label: "João Félix (Benfica → Atl. Madrid)", trueRank: 4 },
        { id: "enzo-tf", label: "Enzo Fernández (Benfica → Chelsea)", trueRank: 5 },
        { id: "griezmann-tf", label: "Antoine Griezmann (Atl. Madrid → Barça)", trueRank: 6 },
        { id: "grealish-tf", label: "Jack Grealish (Aston Villa → Man. City)", trueRank: 7 },
        { id: "rice-tf", label: "Declan Rice (West Ham → Arsenal)", trueRank: 8 },
        { id: "caicedo-tf", label: "Moisés Caicedo (Brighton → Chelsea)", trueRank: 9 },
        { id: "dembele-tf", label: "Ousmane Dembélé (Dortmund → Barça)", trueRank: 10 },
      ],
    },
    {
      id: "youtubers-faturamento",
      category: "YouTubers com Maior Faturamento Anual",
      items: [
        { id: "mrbeast", label: "MrBeast", trueRank: 1 },
        { id: "jakepaul", label: "Jake Paul", trueRank: 2 },
        { id: "markiplier", label: "Markiplier", trueRank: 3 },
        { id: "rhettlink", label: "Rhett and Link", trueRank: 4 },
        { id: "unspeakable", label: "Unspeakable", trueRank: 5 },
        { id: "likenastya", label: "Like Nastya", trueRank: 6 },
        { id: "ryankaji", label: "Ryan Kaji", trueRank: 7 },
        { id: "dudeperfect", label: "Dude Perfect", trueRank: 8 },
        { id: "loganpaul", label: "Logan Paul", trueRank: 9 },
        { id: "prestonplayz", label: "PrestonPlayz", trueRank: 10 },
      ],
    },
    {
      id: "carros-leilao",
      category: "Carros mais Caros já Vendidos em Leilão",
      items: [
        { id: "merc-srl", label: "Mercedes-Benz 300 SLR Uhlenhaut", trueRank: 1 },
        { id: "ferrari-gto", label: "Ferrari 250 GTO (1962)", trueRank: 2 },
        { id: "ferrari-335", label: "Ferrari 335 S Spider Scaglietti", trueRank: 3 },
        { id: "merc-w196", label: "Mercedes-Benz W196", trueRank: 4 },
        { id: "ferrari-290", label: "Ferrari 290 MM", trueRank: 5 },
        { id: "ferrari-275-nart", label: "Ferrari 275 GTB/4*S NART Spider", trueRank: 6 },
        { id: "ferrari-275-c", label: "Ferrari 275 GTB/C Speciale", trueRank: 7 },
        { id: "aston-dbr1", label: "Aston Martin DBR1", trueRank: 8 },
        { id: "jag-dtype", label: "Jaguar D-Type", trueRank: 9 },
        { id: "alfa-8c", label: "Alfa Romeo 8C 2900B", trueRank: 10 },
      ],
    },
    {
      id: "economias-pib",
      category: "Maiores Economias do Mundo (PIB Nominal)",
      items: [
        { id: "usa-pib", label: "Estados Unidos", trueRank: 1 },
        { id: "china-pib", label: "China", trueRank: 2 },
        { id: "alemanha-pib", label: "Alemanha", trueRank: 3 },
        { id: "japao-pib", label: "Japão", trueRank: 4 },
        { id: "india-pib", label: "Índia", trueRank: 5 },
        { id: "uk-pib", label: "Reino Unido", trueRank: 6 },
        { id: "franca-pib", label: "França", trueRank: 7 },
        { id: "brasil-pib", label: "Brasil", trueRank: 8 },
        { id: "italia-pib", label: "Itália", trueRank: 9 },
        { id: "canada-pib", label: "Canadá", trueRank: 10 },
      ],
    },
    {
      id: "turnees-lucrativas",
      category: "Artistas Musicais com Turnês mais Lucrativas (Histórico)",
      items: [
        { id: "taylorswift-tour", label: "Taylor Swift (The Eras Tour)", trueRank: 1 },
        { id: "eltonjohn-tour", label: "Elton John (Farewell Yellow Brick Road)", trueRank: 2 },
        { id: "edsheeran-tour", label: "Ed Sheeran (Divide Tour)", trueRank: 3 },
        { id: "u2-tour", label: "U2 (360° Tour)", trueRank: 4 },
        { id: "coldplay-tour", label: "Coldplay (Music of the Spheres)", trueRank: 5 },
        { id: "harrystyles-tour", label: "Harry Styles (Love on Tour)", trueRank: 6 },
        { id: "gnr-tour", label: "Guns N' Roses (Not in This Lifetime)", trueRank: 7 },
        { id: "beyonce-tour", label: "Beyoncé (Renaissance World Tour)", trueRank: 8 },
        { id: "stones-tour", label: "The Rolling Stones (A Bigger Bang)", trueRank: 9 },
        { id: "waters-tour", label: "Roger Waters (The Wall Live)", trueRank: 10 },
      ],
    },
    {
      id: "selecoes-valiosas",
      category: "Seleções de Futebol mais Valiosas (2025/26)",
      items: [
        { id: "england-sel", label: "Inglaterra", trueRank: 1 },
        { id: "france-sel", label: "França", trueRank: 2 },
        { id: "brasil-sel", label: "Brasil", trueRank: 3 },
        { id: "espanha-sel", label: "Espanha", trueRank: 4 },
        { id: "portugal-sel", label: "Portugal", trueRank: 5 },
        { id: "alemanha-sel", label: "Alemanha", trueRank: 6 },
        { id: "argentina-sel", label: "Argentina", trueRank: 7 },
        { id: "italia-sel", label: "Itália", trueRank: 8 },
        { id: "holanda-sel", label: "Holanda", trueRank: 9 },
        { id: "belgica-sel", label: "Bélgica", trueRank: 10 },
      ],
    },
    {
      id: "pinturas-caras",
      category: "Pinturas mais Caras Vendidas (Leilão/Privado)",
      items: [
        { id: "salvator-mundi", label: "Salvator Mundi (Leonardo da Vinci)", trueRank: 1 },
        { id: "interchange", label: "Interchange (Willem de Kooning)", trueRank: 2 },
        { id: "card-players", label: "The Card Players (Paul Cézanne)", trueRank: 3 },
        { id: "nafea", label: "Nafea Faa Ipoipo (Paul Gauguin)", trueRank: 4 },
        { id: "number17a", label: "Number 17A (Jackson Pollock)", trueRank: 5 },
        { id: "standard-station", label: "Standard Station (Ed Ruscha)", trueRank: 6 },
        { id: "marilyn", label: "Shot Sage Blue Marilyn (Andy Warhol)", trueRank: 7 },
        { id: "no6-rothko", label: "No. 6 (Violet, Green and Red) (Mark Rothko)", trueRank: 8 },
        { id: "wasserschlangen", label: "Wasserschlangen II (Gustav Klimt)", trueRank: 9 },
        { id: "nu-couche", label: "Nu couché (Amedeo Modigliani)", trueRank: 10 },
      ],
    },
    {
      id: "bancos-brasil",
      category: "Maiores Bancos do Brasil (Ativos Totais)",
      items: [
        { id: "itau", label: "Itaú Unibanco", trueRank: 1 },
        { id: "bb", label: "Banco do Brasil", trueRank: 2 },
        { id: "bradesco", label: "Bradesco", trueRank: 3 },
        { id: "caixa", label: "Caixa Econômica Federal", trueRank: 4 },
        { id: "santander-br", label: "Santander Brasil", trueRank: 5 },
        { id: "btg", label: "BTG Pactual", trueRank: 6 },
        { id: "safra", label: "Safra", trueRank: 7 },
        { id: "nubank", label: "Nubank", trueRank: 8 },
        { id: "xp", label: "XP Investimentos", trueRank: 9 },
        { id: "banrisul", label: "Banrisul", trueRank: 10 },
      ],
    },
    {
      id: "influenciadores-br",
      category: "Influenciadores Brasileiros com Maior Engajamento",
      items: [
        { id: "virginia", label: "Virginia Fonseca", trueRank: 1 },
        { id: "neymar-inf", label: "Neymar Jr.", trueRank: 2 },
        { id: "carlinhos", label: "Carlinhos Maia", trueRank: 3 },
        { id: "anitta", label: "Anitta", trueRank: 4 },
        { id: "casimiro", label: "Casimiro", trueRank: 5 },
        { id: "whindersson", label: "Whindersson Nunes", trueRank: 6 },
        { id: "felipeneto", label: "Felipe Neto", trueRank: 7 },
        { id: "larissa", label: "Larissa Manoela", trueRank: 8 },
        { id: "maisa", label: "Maisa Silva", trueRank: 9 },
        { id: "juliette", label: "Juliette", trueRank: 10 },
      ],
    },
    {
      id: "loterias-premios",
      category: "Maiores Prêmios de Loteria já Pagos no Mundo",
      items: [
        { id: "pb-2022", label: "US$ 2.04 Bilhões (Powerball - EUA)", trueRank: 1 },
        { id: "pb-2023", label: "US$ 1.76 Bilhão (Powerball - EUA)", trueRank: 2 },
        { id: "mm-2023", label: "US$ 1.60 Bilhão (Mega Millions - EUA)", trueRank: 3 },
        { id: "pb-2016", label: "US$ 1.58 Bilhão (Powerball - EUA)", trueRank: 4 },
        { id: "mm-2018", label: "US$ 1.53 Bilhão (Mega Millions - EUA)", trueRank: 5 },
        { id: "mm-2023b", label: "US$ 1.35 Bilhão (Mega Millions - EUA)", trueRank: 6 },
        { id: "mm-2024", label: "US$ 1.33 Bilhão (Mega Millions - EUA)", trueRank: 7 },
        { id: "pb-2021", label: "US$ 1.08 Bilhão (Powerball - EUA)", trueRank: 8 },
        { id: "mm-2021", label: "US$ 1.05 Bilhão (Mega Millions - EUA)", trueRank: 9 },
        { id: "pb-2019", label: "US$ 768 Milhões (Powerball - EUA)", trueRank: 10 },
      ],
    },
    {
      id: "consoles-vendidos",
      category: "Consoles de Videogame mais Vendidos da História",
      items: [
        { id: "ps2", label: "PlayStation 2 (160M+)", trueRank: 1 },
        { id: "switch", label: "Nintendo Switch (155M)", trueRank: 2 },
        { id: "ds", label: "Nintendo DS (154M)", trueRank: 3 },
        { id: "gameboy", label: "Game Boy / Color (118M)", trueRank: 4 },
        { id: "ps4", label: "PlayStation 4 (117M)", trueRank: 5 },
        { id: "ps1", label: "PlayStation 1 (102M)", trueRank: 6 },
        { id: "wii", label: "Wii (101M)", trueRank: 7 },
        { id: "ps3", label: "PlayStation 3 (87M)", trueRank: 8 },
        { id: "ps5", label: "PlayStation 5 (84M)", trueRank: 9 },
        { id: "xbox360", label: "Xbox 360 (84M)", trueRank: 10 },
      ],
    },
    {
      id: "instagram-seguidos",
      category: "Pessoas mais Seguidas no Instagram (2026)",
      items: [
        { id: "ig-oficial", label: "Instagram (Conta oficial)", trueRank: 1 },
        { id: "cr7-ig", label: "Cristiano Ronaldo", trueRank: 2 },
        { id: "messi-ig", label: "Lionel Messi", trueRank: 3 },
        { id: "selena-ig", label: "Selena Gomez", trueRank: 4 },
        { id: "kylie-ig", label: "Kylie Jenner", trueRank: 5 },
        { id: "rock-ig", label: "Dwayne Johnson (The Rock)", trueRank: 6 },
        { id: "ariana-ig", label: "Ariana Grande", trueRank: 7 },
        { id: "kim-ig", label: "Kim Kardashian", trueRank: 8 },
        { id: "beyonce-ig", label: "Beyoncé", trueRank: 9 },
        { id: "khloe-ig", label: "Khloé Kardashian", trueRank: 10 },
      ],
    },
    {
      id: "naruto-personagens",
      category: "Personagens de Naruto mais Fortes (Nível de Poder no Auge)",
      items: [
        { id: "kaguya", label: "Kaguya Otsutsuki", trueRank: 1 },
        { id: "hagoromo", label: "Hagoromo Otsutsuki (Sábio dos 6 Caminhos)", trueRank: 2 },
        { id: "madara", label: "Madara Uchiha (Modo Rikudō)", trueRank: 3 },
        { id: "naruto", label: "Naruto Uzumaki (Modo Baryon/Rikudō)", trueRank: 4 },
        { id: "sasuke", label: "Sasuke Uchiha (Rinnegan Supremo)", trueRank: 5 },
        { id: "obito", label: "Obito Uchiha (Jinchuriki do 10 Caudas)", trueRank: 6 },
        { id: "hashirama", label: "Hashirama Senju (1º Hokage)", trueRank: 7 },
        { id: "guy", label: "Might Guy (8 Portões)", trueRank: 8 },
        { id: "minato", label: "Minato Namikaze (4º Hokage)", trueRank: 9 },
        { id: "itachi", label: "Itachi Uchiha", trueRank: 10 },
      ],
    },
    {
      id: "fastfood-marcas",
      category: "Marcas de Fast Food mais Valiosas (2026)",
      items: [
        { id: "mcdonalds", label: "McDonald's", trueRank: 1 },
        { id: "starbucks", label: "Starbucks", trueRank: 2 },
        { id: "kfc", label: "KFC", trueRank: 3 },
        { id: "subway", label: "Subway", trueRank: 4 },
        { id: "tacobell", label: "Taco Bell", trueRank: 5 },
        { id: "burgerking", label: "Burger King", trueRank: 6 },
        { id: "pizzahut", label: "Pizza Hut", trueRank: 7 },
        { id: "chipotle", label: "Chipotle", trueRank: 8 },
        { id: "dominos", label: "Domino's", trueRank: 9 },
        { id: "chickfila", label: "Chick-fil-A", trueRank: 10 },
      ],
    },
    {
      id: "apps-baixados",
      category: "Aplicativos mais Baixados do Mundo",
      items: [
        { id: "tiktok-app", label: "TikTok", trueRank: 1 },
        { id: "instagram-app", label: "Instagram", trueRank: 2 },
        { id: "facebook-app", label: "Facebook", trueRank: 3 },
        { id: "whatsapp-app", label: "WhatsApp", trueRank: 4 },
        { id: "capcut-app", label: "CapCut", trueRank: 5 },
        { id: "telegram-app", label: "Telegram", trueRank: 6 },
        { id: "snapchat-app", label: "Snapchat", trueRank: 7 },
        { id: "spotify-app", label: "Spotify", trueRank: 8 },
        { id: "netflix-app", label: "Netflix", trueRank: 9 },
        { id: "zoom-app", label: "Zoom", trueRank: 10 },
      ],
    },
    {
      id: "reality-shows-br",
      category: "Reality Shows mais Famosos no Brasil",
      items: [
        { id: "bbb", label: "Big Brother Brasil (Globo)", trueRank: 1 },
        { id: "fazenda", label: "A Fazenda (Record)", trueRank: 2 },
        { id: "masterchef", label: "MasterChef Brasil (Band)", trueRank: 3 },
        { id: "ferias-ex", label: "De Férias com o Ex (MTV)", trueRank: 4 },
        { id: "voice", label: "The Voice Brasil (Globo)", trueRank: 5 },
        { id: "nolimite", label: "No Limite (Globo)", trueRank: 6 },
        { id: "powercouple", label: "Power Couple (Record)", trueRank: 7 },
        { id: "maskedsinger", label: "The Masked Singer Brasil (Globo)", trueRank: 8 },
        { id: "cantacomigo", label: "Canta Comigo (Record)", trueRank: 9 },
        { id: "mulheresricas", label: "Mulheres Ricas (Band)", trueRank: 10 },
      ],
    },
    {
      id: "novelas-globo",
      category: "Novelas da Globo com Maior Impacto Cultural",
      items: [
        { id: "roque-santeiro", label: "Roque Santeiro", trueRank: 1 },
        { id: "valetudo", label: "Vale Tudo", trueRank: 2 },
        { id: "rei-gado", label: "O Rei do Gado", trueRank: 3 },
        { id: "clone", label: "O Clone", trueRank: 4 },
        { id: "senhora-destino", label: "Senhora do Destino", trueRank: 5 },
        { id: "avenida-brasil", label: "Avenida Brasil", trueRank: 6 },
        { id: "caminho-indias", label: "Caminho das Índias", trueRank: 7 },
        { id: "forca-querer", label: "A Força do Querer", trueRank: 8 },
        { id: "pantanal", label: "Pantanal (Remake)", trueRank: 9 },
        { id: "mulheres-apaixonadas", label: "Mulheres Apaixonadas", trueRank: 10 },
      ],
    },
    {
      id: "gols-selecao-br",
      category: "Jogadores com mais Gols pela Seleção Brasileira",
      items: [
        { id: "neymar-gol", label: "Neymar Jr.", trueRank: 1 },
        { id: "pele-gol", label: "Pelé", trueRank: 2 },
        { id: "ronaldo-gol", label: "Ronaldo Fenômeno", trueRank: 3 },
        { id: "romario-gol", label: "Romário", trueRank: 4 },
        { id: "zico-gol", label: "Zico", trueRank: 5 },
        { id: "bebeto-gol", label: "Bebeto", trueRank: 6 },
        { id: "rivaldo-gol", label: "Rivaldo", trueRank: 7 },
        { id: "jairzinho-gol", label: "Jairzinho", trueRank: 8 },
        { id: "ronaldinho-gol", label: "Ronaldinho Gaúcho", trueRank: 9 },
        { id: "ademir-gol", label: "Ademir Menezes", trueRank: 10 },
      ],
    },
    {
      id: "estadios-brasil",
      category: "Maiores Estádios do Brasil (Capacidade)",
      items: [
        { id: "maracana", label: "Maracanã (Rio de Janeiro)", trueRank: 1 },
        { id: "mane", label: "Mané Garrincha (Brasília)", trueRank: 2 },
        { id: "morumbi", label: "Morumbi (São Paulo)", trueRank: 3 },
        { id: "castelao", label: "Castelão (Fortaleza)", trueRank: 4 },
        { id: "mineirao", label: "Mineirão (Belo Horizonte)", trueRank: 5 },
        { id: "arruda", label: "Arruda (Recife)", trueRank: 6 },
        { id: "arena-gremio", label: "Arena do Grêmio (Porto Alegre)", trueRank: 7 },
        { id: "mangueirao", label: "Mangueirão (Belém)", trueRank: 8 },
        { id: "beira-rio", label: "Beira-Rio (Porto Alegre)", trueRank: 9 },
        { id: "neo-quimica", label: "Neo Química Arena (São Paulo)", trueRank: 10 },
      ],
    },
    {
      id: "marcas-br",
      category: "Marcas Brasileiras mais Valiosas (2025/2026)",
      items: [
        { id: "itau-mk", label: "Itaú", trueRank: 1 },
        { id: "bradesco-mk", label: "Bradesco", trueRank: 2 },
        { id: "bb-mk", label: "Banco do Brasil", trueRank: 3 },
        { id: "skol", label: "Skol", trueRank: 4 },
        { id: "petrobras", label: "Petrobras", trueRank: 5 },
        { id: "ambev", label: "Ambev", trueRank: 6 },
        { id: "vale-mk", label: "Vale", trueRank: 7 },
        { id: "natura", label: "Natura", trueRank: 8 },
        { id: "nubank-mk", label: "Nubank", trueRank: 9 },
        { id: "magalu", label: "Magalu", trueRank: 10 },
      ],
    },
    {
      id: "refrigerantes-br",
      category: "Refrigerantes mais Consumidos no Brasil (Market Share)",
      items: [
        { id: "cocacola", label: "Coca-Cola", trueRank: 1 },
        { id: "guarana", label: "Guaraná Antarctica", trueRank: 2 },
        { id: "fanta", label: "Fanta (Laranja/Uva)", trueRank: 3 },
        { id: "sprite", label: "Sprite", trueRank: 4 },
        { id: "pepsi", label: "Pepsi", trueRank: 5 },
        { id: "dolly", label: "Dolly", trueRank: 6 },
        { id: "itubaina", label: "Itubaína", trueRank: 7 },
        { id: "sukita", label: "Sukita", trueRank: 8 },
        { id: "kuat", label: "Kuat", trueRank: 9 },
        { id: "schin", label: "Schin", trueRank: 10 },
      ],
    },
    {
      id: "pizza-sabores",
      category: "Sabores de Pizza mais Pedidos no Brasil",
      items: [
        { id: "calabresa", label: "Calabresa", trueRank: 1 },
        { id: "mussarela", label: "Muçarela", trueRank: 2 },
        { id: "portuguesa", label: "Portuguesa", trueRank: 3 },
        { id: "frango-cat", label: "Frango com Catupiry", trueRank: 4 },
        { id: "margherita", label: "Margherita", trueRank: 5 },
        { id: "napolitana", label: "Napolitana", trueRank: 6 },
        { id: "4queijos", label: "Quatro Queijos", trueRank: 7 },
        { id: "brigadeiro", label: "Brigadeiro (Doce)", trueRank: 8 },
        { id: "rucula", label: "Rúcula com Tomate Seco", trueRank: 9 },
        { id: "baiana", label: "Baiana", trueRank: 10 },
      ],
    },
    {
      id: "champions-titulos",
      category: "Clubes com mais Títulos da Champions League",
      items: [
        { id: "real-ucl", label: "Real Madrid (15)", trueRank: 1 },
        { id: "milan-ucl", label: "AC Milan (7)", trueRank: 2 },
        { id: "bayern-ucl", label: "Bayern de Munique (6)", trueRank: 3 },
        { id: "liverpool-ucl", label: "Liverpool (6)", trueRank: 4 },
        { id: "barca-ucl", label: "Barcelona (5)", trueRank: 5 },
        { id: "ajax-ucl", label: "Ajax (4)", trueRank: 6 },
        { id: "inter-ucl", label: "Inter de Milão (3)", trueRank: 7 },
        { id: "manu-ucl", label: "Manchester United (3)", trueRank: 8 },
        { id: "juve-ucl", label: "Juventus (2)", trueRank: 9 },
        { id: "chelsea-ucl", label: "Chelsea (2)", trueRank: 10 },
      ],
    },
    {
      id: "copa-mundo-campeoes",
      category: "Maiores Campeões da Copa do Mundo (Masculino)",
      items: [
        { id: "brasil-cm", label: "Brasil (5 títulos)", trueRank: 1 },
        { id: "alemanha-cm", label: "Alemanha (4 títulos)", trueRank: 2 },
        { id: "italia-cm", label: "Itália (4 títulos)", trueRank: 3 },
        { id: "argentina-cm", label: "Argentina (3 títulos)", trueRank: 4 },
        { id: "franca-cm", label: "França (2 títulos)", trueRank: 5 },
        { id: "uruguai-cm", label: "Uruguai (2 títulos)", trueRank: 6 },
        { id: "espanha-cm", label: "Espanha (1 título)", trueRank: 7 },
        { id: "england-cm", label: "Inglaterra (1 título)", trueRank: 8 },
        { id: "holanda-cm", label: "Holanda (Finalista sem título)", trueRank: 9 },
        { id: "portugal-cm", label: "Portugal", trueRank: 10 },
      ],
    },
    {
      id: "brasileirao-campeoes",
      category: "Maiores Campeões do Brasileirão (Série A)",
      items: [
        { id: "palmeiras-br", label: "Palmeiras (12)", trueRank: 1 },
        { id: "santos-br", label: "Santos (8)", trueRank: 2 },
        { id: "flamengo-br", label: "Flamengo (7)", trueRank: 3 },
        { id: "corinthians-br", label: "Corinthians (7)", trueRank: 4 },
        { id: "saopaulo-br", label: "São Paulo (6)", trueRank: 5 },
        { id: "cruzeiro-br", label: "Cruzeiro (4)", trueRank: 6 },
        { id: "fluminense-br", label: "Fluminense (4)", trueRank: 7 },
        { id: "vasco-br", label: "Vasco (4)", trueRank: 8 },
        { id: "internacional-br", label: "Internacional (3)", trueRank: 9 },
        { id: "atletico-br", label: "Atlético-MG (3)", trueRank: 10 },
      ],
    },
    {
      id: "carros-brasil",
      category: "Carros mais Vendidos na História do Brasil",
      items: [
        { id: "gol", label: "Volkswagen Gol", trueRank: 1 },
        { id: "fiat-uno", label: "Fiat Uno", trueRank: 2 },
        { id: "fusca", label: "Volkswagen Fusca", trueRank: 3 },
        { id: "fiat-palio", label: "Fiat Palio", trueRank: 4 },
        { id: "corsa", label: "Chevrolet Corsa", trueRank: 5 },
        { id: "onix", label: "Chevrolet Onix", trueRank: 6 },
        { id: "ford-ka", label: "Ford Ka", trueRank: 7 },
        { id: "kombi", label: "Volkswagen Kombi", trueRank: 8 },
        { id: "corolla", label: "Toyota Corolla", trueRank: 9 },
        { id: "hb20", label: "Hyundai HB20", trueRank: 10 },
      ],
    },
    {
      id: "marvel-avaliados",
      category: "Filmes da Marvel mais Bem Avaliados (Crítica/Público)",
      items: [
        { id: "ultimato-mv", label: "Vingadores: Ultimato", trueRank: 1 },
        { id: "aranhaverso-mv", label: "Homem-Aranha: No Aranhaverso", trueRank: 2 },
        { id: "pantera-mv", label: "Pantera Negra", trueRank: 3 },
        { id: "homem-ferro-mv", label: "Homem de Ferro", trueRank: 4 },
        { id: "logan-mv", label: "Logan", trueRank: 5 },
        { id: "guerra-inf-mv", label: "Vingadores: Guerra Infinita", trueRank: 6 },
        { id: "guardioes-mv", label: "Guardiões da Galáxia", trueRank: 7 },
        { id: "soldado-mv", label: "Capitão América: O Soldado Invernal", trueRank: 8 },
        { id: "ragnarok-mv", label: "Thor: Ragnarok", trueRank: 9 },
        { id: "deadpool-mv", label: "Deadpool", trueRank: 10 },
      ],
    },
    {
      id: "bilheteria-cinema-br",
      category: "Maiores Bilheterias do Cinema Brasileiro (Público)",
      items: [
        { id: "mae-peca3", label: "Minha Mãe é uma Peça 3", trueRank: 1 },
        { id: "nada-perder", label: "Nada a Perder", trueRank: 2 },
        { id: "dez-mandamentos", label: "Os Dez Mandamentos: O Filme", trueRank: 3 },
        { id: "tropa-elite2", label: "Tropa de Elite 2", trueRank: 4 },
        { id: "dona-flor", label: "Dona Flor e Seus Dois Maridos", trueRank: 5 },
        { id: "mae-peca2", label: "Minha Mãe é uma Peça 2", trueRank: 6 },
        { id: "dama-lotacao", label: "A Dama da Lotação", trueRank: 7 },
        { id: "se-eu-fosse", label: "Se Eu Fosse Você 2", trueRank: 8 },
        { id: "trapalhao", label: "O Trapalhão nas Minas do Rei Salomão", trueRank: 9 },
        { id: "lucio-flavio", label: "Lúcio Flávio, o Passageiro da Agonia", trueRank: 10 },
      ],
    },
  ];

  const CHALLENGE_THEMES: Record<string, string> = {
    'atores-vingadores': 'cinema-tv',
    'atores-ricos-vingadores-v2': 'cinema-tv',
    'bilheterias-filmes': 'cinema-tv',
    'franquias-bilheteria': 'cinema-tv',
    'marvel-avaliados': 'cinema-tv',
    'bilheteria-cinema-br': 'cinema-tv',
    'reality-shows-br': 'cinema-tv',
    'novelas-globo': 'cinema-tv',
    'naruto-personagens': 'cinema-tv',

    'artistas-streams': 'musica',
    'turnees-lucrativas': 'musica',

    'esportes-olimpicos': 'esportes',
    'atletas-pagos': 'esportes',
    'transferencias-futebol': 'esportes',
    'selecoes-valiosas': 'esportes',
    'champions-titulos': 'esportes',
    'copa-mundo-campeoes': 'esportes',
    'brasileirao-campeoes': 'esportes',
    'gols-selecao-br': 'esportes',
    'estadios-brasil': 'esportes',

    'empresas-valiosas': 'tecnologia',
    'bilionarios-tech': 'tecnologia',
    'redes-sociais': 'tecnologia',
    'apps-baixados': 'tecnologia',
    'youtubers-faturamento': 'tecnologia',
    'instagram-seguidos': 'tecnologia',
    'consoles-vendidos': 'tecnologia',
    'jogos-vendidos': 'tecnologia',

    'paises-populosos': 'geografia',
    'paises-maiores': 'geografia',
    'montanhas-altas': 'geografia',
    'cidades-caras': 'geografia',
    'economias-pib': 'geografia',
    'moedas-valorizadas': 'geografia',

    'bancos-brasil': 'brasil',
    'influenciadores-br': 'brasil',
    'marcas-br': 'brasil',
    'refrigerantes-br': 'brasil',
    'pizza-sabores': 'brasil',
    'carros-brasil': 'brasil',

    'marcas-luxo': 'dinheiro',
    'fastfood-marcas': 'dinheiro',
    'carros-leilao': 'dinheiro',
    'loterias-premios': 'dinheiro',
    'pinturas-caras': 'dinheiro',
  };

  const rankMasterRooms = new Map<string, RankMasterRoom>();
  const rankMasterUsedChallenges = new Map<string, number[]>();

  function generateRankMasterCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function broadcastToRankMasterRoom(roomCode: string, data: unknown) {
    const message = JSON.stringify(data);
    rankMasterConnections.forEach((info, ws) => {
      if (info.roomCode === roomCode && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getNextRankMasterChallenge(roomCode: string, selectedTheme = 'all'): RankMasterChallenge {
    let used = rankMasterUsedChallenges.get(roomCode) ?? [];

    const themed = selectedTheme === 'all'
      ? RANKMASTER_CHALLENGES
      : RANKMASTER_CHALLENGES.filter(c => CHALLENGE_THEMES[c.id] === selectedTheme);
    const pool_base = themed.length > 0 ? themed : RANKMASTER_CHALLENGES;

    const available = pool_base.filter(c => {
      const globalIndex = RANKMASTER_CHALLENGES.indexOf(c);
      return !used.includes(globalIndex);
    });
    const pool = available.length > 0 ? available : pool_base;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const globalIndex = RANKMASTER_CHALLENGES.indexOf(chosen);

    if (available.length > 0) {
      used = [...used, globalIndex];
    } else {
      used = [globalIndex];
    }
    rankMasterUsedChallenges.set(roomCode, used);
    return chosen;
  }

  function calculateRankMasterPenalty(orderedIds: string[], challenge: RankMasterChallenge): number {
    let penalty = 0;
    for (const item of challenge.items) {
      const playerPos = orderedIds.indexOf(item.id) + 1;
      if (playerPos === 0) {
        penalty += 10;
      } else {
        penalty += Math.abs(item.trueRank - playerPos);
      }
    }
    return penalty;
  }

  function doRankMasterReveal(roomCode: string) {
    const room = rankMasterRooms.get(roomCode);
    if (!room || !room.gameData || room.gameData.phase !== 'ordering') return;

    const { orders, challenge } = room.gameData;
    if (orders.length === 0) return;

    const minPenalty = Math.min(...orders.map(o => o.penalty));
    const roundWinnerIds = orders
      .filter(o => o.penalty === minPenalty)
      .map(o => o.playerId);

    for (const winnerId of roundWinnerIds) {
      const player = room.players.find(p => p.uid === winnerId);
      if (player) player.score += 100;
    }

    room.gameData.phase = 'revealing';
    room.gameData.roundWinnerIds = roundWinnerIds;
    broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });
  }

  const rankMasterConnections = new Map<WebSocket, { roomCode: string; playerId: string; lastPong: number }>();
  const rankMasterHardExitTimers = new Map<string, NodeJS.Timeout>();
  const RM_PONG_TIMEOUT = 15000;
  const RM_HARD_EXIT_GRACE = 15000;

  function markRankMasterDisconnected(roomCode: string, playerId: string) {
    const room = rankMasterRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (player && player.connected !== false) {
      player.connected = false;
      broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });
    }
  }

  function handleRankMasterHardExit(roomCode: string, playerId: string) {
    const room = rankMasterRooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.uid === playerId);
    if (!player) return;

    room.players = room.players.filter(p => p.uid !== playerId);

    if (room.hostId === playerId && room.players.length > 0) {
      const next = room.players.find(p => p.connected !== false) ?? room.players[0];
      room.hostId = next.uid;
      broadcastToRankMasterRoom(roomCode, { type: 'host-changed', newHostId: next.uid, newHostName: next.name });
    }

    broadcastToRankMasterRoom(roomCode, { type: 'player-removed', playerName: player.name });
    broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });

    if (room.players.length === 0) {
      rankMasterRooms.delete(roomCode);
      rankMasterUsedChallenges.delete(roomCode);
    }
  }

  function scheduleRankMasterHardExit(roomCode: string, playerId: string) {
    const key = `${roomCode}:${playerId}`;
    const existing = rankMasterHardExitTimers.get(key);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      rankMasterHardExitTimers.delete(key);
      handleRankMasterHardExit(roomCode, playerId);
    }, RM_HARD_EXIT_GRACE);
    rankMasterHardExitTimers.set(key, timer);
  }

  function cancelRankMasterHardExit(roomCode: string, playerId: string) {
    const key = `${roomCode}:${playerId}`;
    const existing = rankMasterHardExitTimers.get(key);
    if (existing) {
      clearTimeout(existing);
      rankMasterHardExitTimers.delete(key);
    }
  }

  setInterval(() => {
    const now = Date.now();
    rankMasterConnections.forEach((info, ws) => {
      if (now - info.lastPong > RM_PONG_TIMEOUT) {
        markRankMasterDisconnected(info.roomCode, info.playerId);
        scheduleRankMasterHardExit(info.roomCode, info.playerId);
        rankMasterConnections.delete(ws);
      } else if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: 'ping' })); } catch {}
      }
    });
  }, 5000);

  app.post("/api/rankmaster-rooms", (req, res) => {
    const { hostId, playerName } = req.body;
    if (!hostId || !playerName) return res.status(400).json({ error: "Missing hostId or playerName" });

    let code = generateRankMasterCode();
    while (rankMasterRooms.has(code)) code = generateRankMasterCode();

    const room: RankMasterRoom = {
      code,
      hostId,
      status: 'waiting',
      gameData: null,
      selectedTheme: 'all',
      players: [{ uid: hostId, name: playerName, connected: true, score: 0 }],
      createdAt: new Date().toISOString(),
    };
    rankMasterRooms.set(code, room);
    console.log(`[RankMaster] Room ${code} created by ${playerName}`);
    res.json(room);
  });

  app.post("/api/rankmaster-rooms/:code/join", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId, playerName } = req.body;
    const room = rankMasterRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada" });
    if (room.status !== 'waiting') return res.status(400).json({ error: "Jogo já em andamento" });

    const existing = room.players.find(p => p.uid === playerId);
    if (existing) {
      existing.connected = true;
      existing.name = playerName;
    } else {
      room.players.push({ uid: playerId, name: playerName, connected: true, score: 0 });
    }

    broadcastToRankMasterRoom(code, { type: 'rankmaster-room-update', room });
    console.log(`[RankMaster] ${playerName} joined room ${code}`);
    res.json(room);
  });

  app.get("/api/rankmaster-rooms/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = rankMasterRooms.get(code);
    if (!room) return res.status(404).json({ error: "Sala não encontrada" });
    res.json(room);
  });

  app.post("/api/rankmaster-rooms/:code/disconnect-notice", (req, res) => {
    const code = req.params.code.toUpperCase();
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'Missing playerId' });
    markRankMasterDisconnected(code, playerId);
    scheduleRankMasterHardExit(code, playerId);
    res.json({ ok: true });
  });

  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'pong') {
          const info = rankMasterConnections.get(ws);
          if (info) info.lastPong = Date.now();
          return;
        }

        if (data.type === 'rankmaster-leave' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          rankMasterConnections.delete(ws);
          cancelRankMasterHardExit(roomCode, data.playerId);
          handleRankMasterHardExit(roomCode, data.playerId);
          return;
        }

        if (data.type === 'rankmaster-join' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room) return;

          rankMasterConnections.set(ws, { roomCode, playerId: data.playerId, lastPong: Date.now() });
          cancelRankMasterHardExit(roomCode, data.playerId);

          const player = room.players.find(p => p.uid === data.playerId);
          if (player) player.connected = true;
          broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });
          return;
        }

        if (data.type === 'rankmaster-start' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room || room.hostId !== data.playerId) return;

          const totalRounds = Math.min(10, Math.max(1, Number(data.totalRounds) || 3));
          const topCount = data.topCount === 5 ? 5 : 10;
          const selectedTheme = (typeof data.selectedTheme === 'string' && data.selectedTheme) ? data.selectedTheme : 'all';
          room.selectedTheme = selectedTheme;
          const challenge = getNextRankMasterChallenge(roomCode, selectedTheme);
          const slicedChallenge = { ...challenge, items: challenge.items.slice(0, topCount) };
          const shuffledItems = shuffleArray(slicedChallenge.items);
          const preparingEndsAt = Date.now() + 5500;

          room.players.forEach(p => { p.score = 0; });
          room.status = 'playing';
          room.gameData = {
            phase: 'preparing',
            challenge: slicedChallenge,
            shuffledItems,
            orders: [],
            roundNumber: 1,
            totalRounds,
            topCount,
            roundWinnerIds: [],
            preparingEndsAt,
          };
          rankMasterRooms.set(roomCode, room);
          broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });

          setTimeout(() => {
            const current = rankMasterRooms.get(roomCode);
            if (current?.gameData?.phase === 'preparing') {
              current.gameData.phase = 'ordering';
              broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room: current });
            }
          }, 5500);
          return;
        }

        if (data.type === 'rankmaster-submit-order' && data.roomCode && data.playerId && data.orderedIds) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'ordering') return;

          const player = room.players.find(p => p.uid === data.playerId);
          if (!player) return;

          const orderedIds: string[] = data.orderedIds;
          const penalty = calculateRankMasterPenalty(orderedIds, room.gameData.challenge);

          const existingIdx = room.gameData.orders.findIndex(o => o.playerId === data.playerId);
          const order: RankMasterPlayerOrder = {
            playerId: data.playerId,
            playerName: player.name,
            orderedIds,
            penalty,
          };
          if (existingIdx >= 0) {
            room.gameData.orders[existingIdx] = order;
          } else {
            room.gameData.orders.push(order);
          }
          broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });

          const activePlayers = room.players.filter(p => p.connected !== false);
          const allSubmitted = activePlayers.every(p => room.gameData!.orders.some(o => o.playerId === p.uid));
          if (allSubmitted) {
            doRankMasterReveal(roomCode);
          }
          return;
        }

        if (data.type === 'rankmaster-reveal' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'ordering') return;
          if (room.hostId !== data.playerId) return;
          doRankMasterReveal(roomCode);
          return;
        }

        if (data.type === 'rankmaster-skip-challenge' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room || !room.gameData || room.gameData.phase !== 'ordering') return;
          if (room.hostId !== data.playerId) return;

          const topCount = room.gameData.topCount ?? 10;
          const challenge = getNextRankMasterChallenge(roomCode, room.selectedTheme ?? 'all');
          const slicedChallenge = { ...challenge, items: challenge.items.slice(0, topCount) };
          const shuffledItems = shuffleArray(slicedChallenge.items);
          const preparingEndsAt = Date.now() + 5500;

          room.gameData = {
            ...room.gameData,
            phase: 'preparing',
            challenge: slicedChallenge,
            shuffledItems,
            orders: [],
            roundWinnerIds: [],
            preparingEndsAt,
          };
          rankMasterRooms.set(roomCode, room);
          broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });

          setTimeout(() => {
            const current = rankMasterRooms.get(roomCode);
            if (current?.gameData?.phase === 'preparing') {
              current.gameData.phase = 'ordering';
              broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room: current });
            }
          }, 5500);
          return;
        }

        if (data.type === 'rankmaster-next-round' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room || !room.gameData) return;
          if (room.hostId !== data.playerId) return;

          if (room.gameData.phase === 'revealing') {
            const isLastRound = room.gameData.roundNumber >= room.gameData.totalRounds;
            if (isLastRound) {
              room.gameData.phase = 'gameover';
              broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });
              return;
            }

            const topCount = room.gameData.topCount ?? 10;
            const challenge = getNextRankMasterChallenge(roomCode, room.selectedTheme ?? 'all');
            const slicedChallenge = { ...challenge, items: challenge.items.slice(0, topCount) };
            const shuffledItems = shuffleArray(slicedChallenge.items);
            const preparingEndsAt = Date.now() + 5500;

            room.gameData = {
              phase: 'preparing',
              challenge: slicedChallenge,
              shuffledItems,
              orders: [],
              roundNumber: room.gameData.roundNumber + 1,
              totalRounds: room.gameData.totalRounds,
              topCount,
              roundWinnerIds: [],
              preparingEndsAt,
            };
            broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });

            setTimeout(() => {
              const current = rankMasterRooms.get(roomCode);
              if (current?.gameData?.phase === 'preparing') {
                current.gameData.phase = 'ordering';
                broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room: current });
              }
            }, 5500);
          }
          return;
        }

        if (data.type === 'rankmaster-return-to-lobby' && data.roomCode && data.playerId) {
          const roomCode = (data.roomCode as string).toUpperCase();
          const room = rankMasterRooms.get(roomCode);
          if (!room) return;
          if (room.hostId !== data.playerId) return;

          room.status = 'waiting';
          room.gameData = null;
          room.players.forEach(p => { p.score = 0; });
          rankMasterUsedChallenges.delete(roomCode);
          broadcastToRankMasterRoom(roomCode, { type: 'rankmaster-room-update', room });
          return;
        }

      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      const info = rankMasterConnections.get(ws);
      if (info) {
        rankMasterConnections.delete(ws);
        markRankMasterDisconnected(info.roomCode, info.playerId);
        scheduleRankMasterHardExit(info.roomCode, info.playerId);
      }
    });
  });

  return httpServer;
}
