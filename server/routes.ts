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
  const poolKey = `palavra-${submode}`;
  const words = PALAVRA_SECRETA_SUBMODES_DATA[submode] || GAME_MODES.palavraSecreta.data;
  return getFromPool(poolKey, words, wordPools, roomCode);
}

// Get question from pool for Perguntas Diferentes
function getPooledQuestion(roomCode: string): { crew: string; imp: string } {
  const poolKey = `perguntas`;
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
  clashRoyale: ['Mago', 'Príncipe', 'Mosqueteira', 'Gigante', 'Arqueiras', 'Corredor', 'P.E.K.K.A', 'Golem', 'Dragão Bebê', 'Bruxa', 'Mineiro', 'Cavaleiro', 'Barril de Goblins', 'Tronco', 'Tesla', 'Lava Hound', 'Lenhador', 'Fantasma Real', 'Mago de Gelo', 'Executor'],
  animes: ['Goku', 'Naruto', 'Luffy', 'Tanjiro', 'Mikasa', 'Saitama', 'Sasuke', 'Deku', 'Gojo', 'Ichigo', 'Sharingan', 'Bankai', 'Kamehameha', 'Rasengan', 'Titan', 'Shinigami', 'Chakra', 'Espada Nichirin', 'Akatsuki', 'Grimório'],
  marvel: ['Homem-Aranha', 'Thor', 'Hulk', 'Capitão América', 'Homem de Ferro', 'Viúva Negra', 'Pantera Negra', 'Doutor Estranho', 'Thanos', 'Loki', 'Ultron', 'Groot', 'Rocket', 'Wanda', 'Visão', 'Escudo', 'Mjölnir', 'Joia do Infinito', 'Hydra', 'Vibranium'],
  strangerThings: ['Eleven', 'Mike', 'Lucas', 'Dustin', 'Will', 'Max', 'Hopper', 'Joyce', 'Vecna', 'Demogorgon', 'Mind Flayer', 'Hawkins', 'Upside Down', 'Barb', 'Robin', 'Steve', 'Billy', 'Eddie', 'Murray', 'Kali', 'Brenner', 'Suzie', 'Erica', 'Laboratório', 'Neva', 'Walkie-talkie', 'Arcade', 'Starcourt', 'Hellfire', 'Byers']
};

function setupGameMode(mode: GameModeType, players: Player[], impostorId: string, selectedSubmode?: string, roomCode?: string): GameData {
  const code = roomCode || 'default';
  
  switch (mode) {
    case "palavraSecreta": {
      // Use pooled words - guarantees no repetition until all used
      const submode = selectedSubmode || 'classico';
      const word = getPooledWord(submode, code);
      return { word };
    }
    
    case "palavras": {
      // Use pooled location for variety
      const poolKey = `locais`;
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
      const poolKey = `faccoes`;
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
      const poolKey = `categoria-item`;
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
    
    default:
      const word = getPooledWord('classico', code);
      return { word };
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

  // Server-side heartbeat: ping all clients every 5 seconds
  // Mark players as disconnected (NOT remove) if they don't respond in 10 seconds
  const PING_INTERVAL = 5000;
  const DISCONNECT_TIMEOUT = 10000;

  setInterval(() => {
    const now = Date.now();
    
    playerConnections.forEach(async (info, ws) => {
      if (!info.playerId || !info.roomCode) return;
      
      const timeSinceLastPong = now - info.lastPong;
      
      if (timeSinceLastPong > DISCONNECT_TIMEOUT) {
        console.log(`[Heartbeat] Player ${info.playerId} unresponsive (${timeSinceLastPong}ms) - marking as disconnected`);
        await markPlayerDisconnected(ws, info.roomCode, info.playerId);
      } else if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.error('[Heartbeat] Failed to send ping:', e);
        }
      }
    });
  }, PING_INTERVAL);

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
      console.log(`[Close] WebSocket closed for player ${currentPlayerId} in room ${currentRoomCode}`);
      
      if (currentRoomCode && currentPlayerId) {
        // Mark player as disconnected (but keep them in the room - they can reconnect)
        await markPlayerDisconnected(ws, currentRoomCode, currentPlayerId);
        // Note: We do NOT remove the player or change host - they might reconnect
        // Players remain in the room until they manually leave
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
        waitingForGame: isGameInProgress,
        connected: true  // New players start as connected
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

      const impostorIndex = Math.floor(Math.random() * connectedPlayers.length);
      const impostorId = connectedPlayers[impostorIndex].uid;
      
      const gameData = setupGameMode(gameMode, connectedPlayers, impostorId, selectedSubmode, code.toUpperCase());
      
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
