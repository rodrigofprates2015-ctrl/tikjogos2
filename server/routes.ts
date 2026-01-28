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
import { RtcTokenBuilder, RtcRole } from 'agora-token';

// Note: All pending themes are now stored directly in PostgreSQL database
// This ensures persistence across server restarts and works in all deployment environments

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
  return randomBytes(2).toString('hex').toUpperCase().substring(0, 4);
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
  fnaf: ['Animatrônicos', 'Freddy Fazbear', 'Bonnie', 'Chica', 'Foxy', 'Golden Freddy', 'Springtrap', 'Glitchtrap', 'Circus Baby', 'Ennard', 'Puppet', 'Marionete', 'Ballora', 'Funtime Freddy', 'Funtime Foxy', 'Molten Freddy', 'Scraptrap', 'Helpy', 'Vanny', 'Vanessa', 'William Afton', 'Michael Afton', 'Gregory', 'Glamrock Freddy', 'Roxanne Wolf', 'Montgomery Gator', 'Sun (Daycare Attendant)', 'Moon (Daycare Attendant)', 'Pizzaria', 'Fazbear Entertainment', 'Escritório', 'Câmeras', 'Monitores', 'Corredor', 'Ventilação', 'Portas', 'Gerador', 'Energia', 'Lanternas', 'Tablet', 'Noite', 'Turno', 'Vigilância', 'Sobrevivência', 'Jumpscare', 'Missões', 'Mapas', 'Minigames', 'Colecionáveis', 'Easter eggs', 'FNAF 1', 'FNAF 2', 'FNAF 3', 'FNAF 4', 'Sister Location', 'Security Breach', 'Ultimate Custom Night', 'Custom Night', 'Teorias', 'Lore']
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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

      console.log(`[Room Created] Code: ${code}, Host: ${hostName} (${hostId})`);
      
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
        
        // Add hint for impostor if enabled and it's classic palavraSecreta
        // Note: firstPlayerHintOnly logic will be handled on frontend based on speaking order
        if (gameConfig.enableHints && gameMode === 'palavraSecreta' && !themeCode && gameData.word) {
          const hint = WORD_HINTS[gameData.word];
          console.log(`[StartGame] Looking for hint for word "${gameData.word}":`, hint);
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
        // Generate a simple session token
        const token = randomBytes(32).toString('hex');
        
        // Clear any existing admin session data first
        if (req.session) {
          delete (req.session as any).adminToken;
          delete (req.session as any).isAdmin;
        }
        
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
  
  // Admin logout endpoint - clears session and cookie
  app.post("/api/admin/logout", (req, res) => {
    try {
      if (req.session) {
        delete (req.session as any).adminToken;
        delete (req.session as any).isAdmin;
        req.session.destroy((err) => {
          if (err) {
            console.error('[Admin] Session destroy error:', err);
          }
          // Clear the session cookie
          res.clearCookie('tikjogos.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          console.log('[Admin] Logout successful - session and cookie cleared');
          res.json({ success: true });
        });
      } else {
        console.log('[Admin] Logout successful - no session to clear');
        res.json({ success: true });
      }
    } catch (error) {
      console.error('[Admin] Logout error:', error);
      res.status(400).json({ error: "Erro no logout" });
    }
  });
  
  // Admin middleware to verify admin token - ONLY checks Bearer token, not session
  const verifyAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token.length > 0) {
        next();
        return;
      }
    }
    
    res.status(401).json({ error: "Não autorizado" });
  };

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
      // Sort by creation date, newest first, limit to 50
      const sortedRooms = rooms
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

  return httpServer;
}
