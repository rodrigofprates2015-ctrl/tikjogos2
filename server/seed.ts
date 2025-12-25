import { storage } from "../server/storage";

const seedPosts = [
  {
    title: "O que é o Jogo do Impostor e por que ele faz tanto sucesso?",
    slug: "o-que-e-o-jogo-do-impostor",
    category: "Pilar",
    excerpt: "Descubra a psicologia por trás da desconfiança e entenda por que esse jogo de dedução social conquistou milhões de pessoas.",
    featured: true,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Se você já participou de uma reunião de amigos onde a tensão se misturava com risadas nervosas, provavelmente estava jogando algo relacionado à dedução social. O Jogo do Impostor conquistou milhões de jogadores justamente por essa combinação única: ele une estratégia mental, observação afiada e muita interação social.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A psicologia por trás da desconfiança</h2>
      <p class="mb-4">Diferente de jogos de tabuleiro tradicionais, onde a sorte nos dados define o vencedor, aqui o "tabuleiro" é a mente dos outros jogadores. Cada rodada cria um clima de desconfiança saudável. Você não está lutando contra o jogo; está lutando contra a capacidade de mentir (ou de dizer a verdade) dos seus companheiros.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Por que nenhuma partida é igual?</h2>
      <p class="mb-4">A rejogabilidade é um dos pontos fortes desse gênero. Você pode jogar com o mesmo grupo de pessoas dez vezes seguidas, e as dez partidas serão completamente diferentes. Isso acontece porque o fator humano faz com que nenhuma partida seja igual à outra.</p>
    `
  },
  {
    title: "Como usar o TikJogos para partidas mais organizadas",
    slug: "como-usar-o-tikjogos",
    category: "Dica",
    excerpt: "Chega de bagunça com papel e caneta. Veja como a tecnologia pode eliminar a burocracia e focar na estratégia.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Quem joga o Jogo do Impostor "analogicamente" sabe que a bagunça é quase inevitável. Sorteios manuais demoram, alguém sempre vê o papel do outro sem querer, e cronometrar as rodadas vira uma tarefa chata.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Centralizando a bagunça</h3>
      <p class="mb-4">O principal problema de grupos grandes é o fluxo de informação. O TikJogos centraliza essas informações e ajuda a manter o controle do andamento do jogo.</p>
    `
  },
  {
    title: "Estratégias básicas para quem joga como impostor",
    slug: "estrategias-impostor",
    category: "Estratégia",
    excerpt: "Tirou a carta do Impostor? Não entre em pânico. Aprenda a mentir com coerência e usar os outros a seu favor.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Tirar a carta (ou receber o aviso na tela) de que você é o Impostor gera um pico de adrenalina imediato. Ser impostor exige mais do que simplesmente mentir.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A Regra de Ouro: Coerência</h3>
      <p class="mb-4">O maior erro dos novatos é tentar ser criativo demais. É fundamental manter um comportamento coerente durante toda a partida.</p>
    `
  },
  {
    title: "Dicas para identificar o impostor mais rápido",
    slug: "identificar-impostor-rapido",
    category: "Estratégia",
    excerpt: "Aprenda a ler os sinais sutis, contradições e o comportamento apressado que entregam os mentirosos.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Identificar o impostor exige paciência e atenção, pois o mentiroso raramente se entrega com um erro gritante logo de cara.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O perigo da pressa</h3>
      <p class="mb-4">O impostor sente o tempo correr de forma diferente. Para ele, cada segundo de silêncio é uma tortura.</p>
    `
  },
  {
    title: "A importância da comunicação no Jogo do Impostor",
    slug: "importancia-comunicacao",
    category: "Social",
    excerpt: "Não é sobre quem mente melhor, é sobre quem fala melhor. Descubra como a oratória define o vencedor.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Muitas pessoas acham que o Jogo do Impostor é sobre quem mente melhor. Na verdade, ele é sobre quem se comunica melhor.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Construindo pontes e alianças</h3>
      <p class="mb-4">Ninguém ganha esse jogo sozinho (a menos que seja um impostor muito sortudo). Para os inocentes, a união faz a força.</p>
    `
  },
  {
    title: "Por que jogos de dedução social são tão envolventes?",
    slug: "por-que-jogos-deducao-envolventes",
    category: "Pilar",
    excerpt: "Um mergulho profundo na psicologia dos jogos, o 'círculo mágico' da mentira e a química da emoção.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <h2 class="text-2xl font-bold text-white mb-4">O \"Círculo Mágico\" da Mentira</h2>
      <p class="mb-4">Na teoria dos jogos, existe o conceito de \"círculo mágico\": um espaço onde as regras do mundo real são suspensas.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A Química da Emoção</h2>
      <p class="mb-4">Quando jogamos, experimentamos picos de dopamina e cortisol. O suspense da incerteza cria uma experiência memorável.</p>
    `
  },
  {
    title: "Como o Jogo do Impostor melhora o raciocínio lógico",
    slug: "raciocinio-logico-impostor",
    category: "Estratégia",
    excerpt: "Por trás da diversão, existe um verdadeiro exercício cognitivo acontecendo. Veja como o jogo treina sua mente.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Por trás da diversão, existe um verdadeiro exercício cognitivo acontecendo. O participante precisa analisar informações limitadas e tomar decisões rápidas.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Decisão sob pressão</h3>
      <p class="mb-4">O processo de análise rápida fortalece o pensamento crítico. Você aprende a separar fatos de suposições.</p>
    `
  },
  {
    title: "Jogo do Impostor: diversão para amigos e família",
    slug: "diversao-amigos-familia",
    category: "Social",
    excerpt: "Encontrar uma atividade que agrade a todos é difícil. O Jogo do Impostor brilha ao unir gerações e quebrar o gelo.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">O Jogo do Impostor é ideal para grupos variados porque nivela o campo de jogo. Não exige reflexos rápidos, apenas interação humana.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Acessibilidade é a chave</h3>
      <p class="mb-4">As regras simples permitem que qualquer pessoa participe, mesmo sem experiência prévia. O jogo atua como um lubrificante social perfeito.</p>
    `
  },
  {
    title: "Erros comuns de iniciantes no Jogo do Impostor",
    slug: "erros-comuns-iniciantes",
    category: "Estratégia",
    excerpt: "Ninguém nasce um mestre da manipulação. Evite esses deslizes clássicos e encurte sua curva de aprendizado.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">As primeiras partidas costumam ser um desastre cômico. Observar onde os novatos escorregam é a melhor forma de aprender.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O erro do \"Tagarela\"</h3>
      <p class="mb-4">O impostor iniciante muitas vezes tenta preencher o silêncio com palavras vazias, o que acaba entregando sua culpa.</p>
    `
  },
  {
    title: "Como criar partidas mais equilibradas",
    slug: "partidas-mais-equilibradas",
    category: "Dica",
    excerpt: "O segredo para evitar partidas frustrantes não é sorte, é matemática e ajuste de regras. Saiba como equilibrar sua sala.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Partidas equilibradas dependem de regras bem definidas. O ponto mais crítico é a proporção entre jogadores e impostores.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A matemática do caos</h3>
      <p class="mb-4">Grupos pequenos (3-5 pessoas) devem ter no máximo 1 impostor. Grupos grandes podem aumentar esse número.</p>
    `
  },
  {
    title: "A evolução dos jogos sociais online: do tabuleiro à tela",
    slug: "evolucao-jogos-sociais",
    category: "Pilar",
    excerpt: "Como a tecnologia transformou a 'mesa de jantar' em salas virtuais globais. Uma jornada histórica dos jogos de dedução.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <h2 class="text-2xl font-bold text-white mb-4">Da mesa de jantar ao Mobile</h2>
      <p class="mb-4">Houve um tempo em que jogar socialmente exigia logística complexa. Com os smartphones, o tabuleiro está no bolso de todo mundo.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">O fim da bagunça logística</h2>
      <p class="mb-4">A digitalização resolveu a fricção do jogo. Plataformas modernas automatizam sorteios e cronômetros.</p>
    `
  },
  {
    title: "Por que o Jogo do Impostor nunca fica repetitivo",
    slug: "jogo-nunca-repetitivo",
    category: "Social",
    excerpt: "Mesmo com regras fixas, o comportamento humano muda a cada rodada. Descubra o segredo do replay infinito.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">O motor do jogo são as pessoas. O ser humano é inconsistente por natureza, o que torna cada partida única.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Imprevisibilidade das decisões</h3>
      <p class="mb-4">Em jogos sociais, a melhor jogada depende de quem está ouvindo. As camadas de meta-jogo garantem o frescor da experiência.</p>
    `
  },
  {
    title: "Como lidar com a pressão de ser acusado",
    slug: "pressao-ser-acusado",
    category: "Estratégia",
    excerpt: "O coração dispara e todos olham para você. Aprenda técnicas para manter a calma e convencer o grupo de sua inocência.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">Ser acusado é um micro-teste de gerenciamento de crise. Manter o controle emocional planta dúvida na cabeça dos acusadores.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Clareza é sua melhor defesa</h3>
      <p class="mb-4">Responder com objetividade transmite confiança. Argumentos lógicos vencem argumentos emocionais no calor da discussão.</p>
    `
  },
  {
    title: "Jogo do Impostor como ferramenta de integração",
    slug: "ferramenta-integracao",
    category: "Social",
    excerpt: "Empresas e escolas estão usando dedução social para quebrar o gelo. Veja como o jogo dissolve hierarquias.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">O jogo força a interação horizontal. Hierarquias se dissolvem quando o estagiário precisa acusar o gerente na partida.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Soft Skills na prática</h3>
      <p class="mb-4">Mais do que diversão, o jogo estimula a comunicação clara, empatia e o trabalho em equipe para vencer o inimigo comum.</p>
    `
  },
  {
    title: "TikJogos: praticidade e diversão em um só lugar",
    slug: "praticidade-tikjogos",
    category: "Dica",
    excerpt: "A experiência do Jogo do Impostor repensada para o mundo digital. Interface simples e fluida para todas as idades.",
    featured: false,
    author: "Equipe TikJogos",
    content: `
      <p class="mb-4">O TikJogos remove os obstáculos que impedem o jogo de acontecer. A interface simples permite que qualquer pessoa, de 8 a 80 anos, jogue.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Fluidez é tudo</h3>
      <p class="mb-4">A automação do site torna as partidas mais agradáveis. Menos tempo gerenciando burocracia, mais tempo se divertindo com amigos.</p>
    `
  }
];

async function seed() {
  console.log(`Seeding ${seedPosts.length} blog posts...`);
  for (const postData of seedPosts) {
    const existing = await storage.getPostBySlug(postData.slug);
    if (!existing) {
      await storage.createPost(postData);
      console.log(`Created post: ${postData.title}`);
    } else {
      console.log(`Skipping existing post: ${postData.slug}`);
    }
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
