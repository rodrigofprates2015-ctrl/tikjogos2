/**
 * Blog post content for server-side HTML injection.
 * Duplicated from client/src/data/blogPosts.ts because that file uses
 * Vite path aliases (@/) and React component imports that don't resolve
 * in the server context.
 *
 * When adding a new blog post, add its content here AND in the client data file.
 */

export interface BlogPostFull {
  slug: string;
  slugEn: string;
  slugEs: string;
  title: string;
  titleEn: string;
  titleEs: string;
  excerpt: string;
  excerptEn: string;
  excerptEs: string;
  content: string;
  image: string;
  date: string;
  authorName: string;
  readTime: string;
  category: string;
}

export const BLOG_POSTS_FULL: BlogPostFull[] = [
  {
    slug: 'desafio-da-palavra-novo-jogo-tikjogos',
    slugEn: 'word-challenge-new-game-tikjogos',
    slugEs: 'desafio-de-la-palabra-nuevo-juego-tikjogos',
    title: 'Desafio da Palavra: o novo jogo de letras do TikJogos',
    titleEn: 'Word Challenge: the new letter game on TikJogos',
    titleEs: 'Desafío de la Palabra: el nuevo juego de letras de TikJogos',
    excerpt: 'Adicione letras, blefe e desafie seus amigos neste jogo de palavras multiplayer. Conheça as regras, estratégias e como jogar.',
    excerptEn: 'Add letters, bluff and challenge your friends in this multiplayer word game. Learn the rules, strategies and how to play.',
    excerptEs: 'Añade letras, farolea y desafía a tus amigos en este juego de palabras multijugador. Conoce las reglas, estrategias y cómo jugar.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1200',
    date: '21 Mar 2026',
    authorName: 'Time TikJogos',
    readTime: '4 min',
    category: 'Novidades',
    content: `O **Desafio da Palavra** chegou ao TikJogos para transformar suas noites com amigos em duelos de vocabulário e blefe. A premissa é simples: cada jogador adiciona uma letra ao fragmento na mesa, mas sempre deve ter uma palavra real em mente. Quem blefar e for desafiado perde uma vida. Último com vida vence.

### Como Funciona

Na sua vez, você escolhe uma letra pelo teclado e ela é adicionada ao fragmento atual. Você precisa ter uma palavra válida em mente que comece com esse fragmento — mas não precisa revelá-la a menos que seja desafiado.

O jogador seguinte pode, em vez de adicionar uma letra, **desafiar** você. Quando desafiado, você revela a palavra que tinha em mente:

- **Palavra válida** → o desafiante perde uma ❤️
- **Palavra inválida ou inexistente** → você perde uma ❤️

### A Ordem dos Turnos

A sequência é definida no início e nunca muda: 1→2→3→1→2→3. Mesmo que alguém seja eliminado, a ordem continua — o jogador eliminado é simplesmente pulado.

### Estratégias para Vencer

**Blefe calculado**: adicione letras incomuns que parecem impossíveis mas você tem uma palavra em mente. Isso pressiona os adversários a desafiar — e perder.

**Desafie com certeza**: só desafie quando tiver quase certeza de que o fragmento não leva a nada. Um desafio errado custa uma vida.

**Palavras longas são escudos**: quanto mais longa a palavra que você tem em mente, mais letras pode adicionar com segurança.

### Jogue Agora

O **Desafio da Palavra** está disponível gratuitamente no TikJogos. Crie uma sala, compartilhe o código com seus amigos e veja quem tem o vocabulário — e os nervos — mais fortes.`,
  },
  {
    slug: 'jogo-do-impostor-desenho',
    slugEn: 'impostor-drawing-game',
    slugEs: 'juego-del-impostor-dibujo',
    title: 'Jogo do Impostor Desenho: A Nova Sensação que Combina Gartic e Impostor',
    titleEn: 'Impostor Drawing Game: The New Sensation Combining Gartic and Impostor',
    titleEs: 'Juego del Impostor Dibujo: La Nueva Sensación que Combina Gartic e Impostor',
    excerpt: 'Descubra o Jogo do Impostor Desenho, a variante que une desenho colaborativo com dedução social. Saiba como jogar, estratégias e por que é tão viciante.',
    excerptEn: 'Discover the Impostor Drawing Game, the variant that combines collaborative drawing with social deduction. Learn how to play, strategies and why it is so addictive.',
    excerptEs: 'Descubre el Juego del Impostor Dibujo, la variante que une dibujo colaborativo con deducción social. Aprende a jugar, estrategias y por qué es tan adictivo.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200',
    date: '07 Fev 2026',
    authorName: 'Equipe TikJogos',
    readTime: '10 min',
    category: 'News',
    content: `Você já jogou **Jogo do Impostor Desenho**? Se ainda não, prepare-se para descobrir a forma mais criativa, engraçada e desafiadora de jogar o clássico jogo de dedução social. Essa inovadora variante une o melhor do Gartic (desenho colaborativo) com a tensão do Impostor, criando uma experiência única que vai transformar suas noites com amigos.

### O que é Jogo do Impostor Desenho?
O **Jogo do Impostor Desenho** é uma evolução do tradicional Jogo do Impostor. Em vez de simplesmente adivinhar palavras através de pistas verbais, aqui todos os jogadores desenham colaborativamente uma palavra secreta. Mas tem um detalhe: o impostor não sabe qual é a palavra!

A mecânica é simples, mas gera momentos hilariantes:
1. **Sorteio**: Um jogador é escolhido como impostor
2. **Palavra Secreta**: Todos recebem a mesma palavra para desenhar (menos o impostor)
3. **Desenho Colaborativo**: Cada jogador desenha por 30-45 segundos e passa o desenho adiante
4. **Discussão**: Todos analisam o resultado final
5. **Votação**: Decidem quem era o impostor

### Por que o Jogo do Impostor Desenho é tão Viciante?

#### 1. O Impostor em Desvantagem Real
Diferente do Jogo do Impostor tradicional, aqui é muito mais difícil blefar. Quando você não sabe a palavra, desenhar algo que faz sentido é quase impossível.

#### 2. Pistas Visuais Inequívocas
Cada traço conta uma história. Um desenho que deveria ser de "gato" mas saiu parecendo "espaguete" é uma bandeira vermelha GIGANTE.

#### 3. Diversão Garantida
O desenho final é SEMPRE estranho. Ninguém consegue desenhar perfeitamente passando de mão em mão, então o resultado é um caos criativo que gera risadas.

### Estratégias para Ganhar no Jogo do Impostor Desenho

#### Para os Honestos:
1. **Observe o fluxo visual**: Procure por traços que não fazem sentido com a palavra
2. **Identifique mudanças drásticas**: Se alguém desenhou algo completamente diferente, pode ser o impostor
3. **Concordância suspeita**: Impostor tende a concordar com tudo para não parecer suspeito

#### Para o Impostor:
1. **Desenhe vagamente**: Linhas abstratas são menos reveladoras
2. **Finja certeza**: Mesmo que não tenha ideia do que é
3. **Tome turnos curtos**: Quanto mais rápido terminar, menos chance de errar

### Conclusão
O **Jogo do Impostor Desenho** é prova de que jogos de festa nunca saem de moda — eles apenas evoluem. Ao combinar a criatividade do Gartic com a tensão do Impostor, temos uma experiência que é divertida, desafiadora, social, memorável e viciante.`,
  },
  {
    slug: 'jogo-do-impostor-guia-de-estrategias-e-analise-do-metagame',
    slugEn: 'impostor-game-strategy-guide-and-metagame-analysis',
    slugEs: 'juego-del-impostor-guia-de-estrategias-y-analisis-del-metagame',
    title: 'Jogo do Impostor: Guia de Estratégias e Análise do Metagame no TikJogos',
    titleEn: 'Impostor Game: Strategy Guide and Metagame Analysis on TikJogos',
    titleEs: 'Juego del Impostor: Guía de Estrategias y Análisis del Metagame en TikJogos',
    excerpt: 'Domine o jogo do impostor com táticas de especialista, análise comportamental e lógica sistêmica. Guia técnico completo.',
    excerptEn: 'Master the impostor game with expert tactics, behavioral analysis and systemic logic. Complete technical guide.',
    excerptEs: 'Domina el juego del impostor con tácticas de especialista, análisis comportamental y lógica sistémica. Guía técnica completa.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    date: '06 Fev 2026',
    authorName: 'Estrategista Chefe',
    readTime: '7 min',
    category: 'Tips',
    content: `O **jogo do impostor** tornou-se o epicentro da dedução social moderna. No TikJogos, a experiência do **jogo do impostor** é otimizada para oferecer o máximo de competitividade e profundidade estratégica.

### A Psicologia por trás do Jogo do Impostor
O sucesso no **jogo do impostor** não é aleatório. Ele reside na gestão eficiente da assimetria de informação. Enquanto a Tripulação utiliza dados concretos para identificar padrões, quem assume o papel no **jogo do impostor** deve dominar a arte do mimetismo semântico.

### Táticas de Especialista para o Jogo do Impostor
Para elevar sua taxa de vitória no **jogo do impostor**, aplique os seguintes protocolos:

1. **Protocolo de Verificação (Tripulação)**: As perguntas devem ser elaboradas para expor lacunas de conhecimento. Utilize termos vagos que apenas quem conhece o segredo pode decodificar.
2. **Protocolo de Infiltração (Impostor)**: O segredo para vencer como traidor é a antecipação. Identifique os líderes de opinião e replique seus padrões de linguagem.
3. **Análise de Variáveis (Sistêmica)**: Cada modo do jogo (como 'Palavra Secreta' ou 'Locais & Funções') exige uma abordagem lógica distinta.

### TikJogos: A Referência Técnica no Jogo do Impostor
Nossa plataforma foi desenvolvida para ser a casa definitiva do **jogo do impostor**. Através de sorteios imparciais e uma interface que favorece a imersão, o jogo permite que a habilidade pura de dedução seja o único fator determinante para o resultado.`,
  },
  {
    slug: 'a-alma-dos-games-sociais-por-que-a-desconfianca-nos-fascina',
    slugEn: 'the-soul-of-social-games-why-distrust-fascinates-us',
    slugEs: 'el-alma-de-los-juegos-sociales-por-que-la-desconfianza-nos-fascina',
    title: 'A alma dos games sociais: Por que a desconfiança nos fascina?',
    titleEn: 'The Soul of Social Games: Why Does Distrust Fascinate Us?',
    titleEs: 'El alma de los juegos sociales: ¿Por qué la desconfianza nos fascina?',
    excerpt: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural ao transformar a desconfiança em uma experiênca profunda.',
    excerptEn: 'The Impostor Game has established itself as a true cultural phenomenon by transforming distrust into a profound experience.',
    excerptEs: 'El Juego del Impostor se ha consolidado como un verdadero fenómeno cultural al transformar la desconfianza en una experiencia profunda.',
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200',
    date: '04 Fev 2026',
    authorName: 'Capitão Miller',
    readTime: '6 min',
    category: 'Community',
    content: `O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural entre gamers e diversos grupos de amigos por conseguir transformar uma premissa extremamente simples em uma experiência psicológica profunda e muito intensa.

### O Fator Humano como Variável
Cada resposta ligeiramente vaga, cada pausa inesperada ao falar e cada acusação lançada sem uma base sólida cria uma tensão palpável que mantém todos os jogadores em estado de alerta máximo durante toda a sessão. O jogo consegue misturar de forma magistral os elementos de observação atenta, estratégia de manipulação e interação social orgânica.

### Narrativas Inéditas
Um dos aspectos mais fascinantes é que nenhuma partida jamais será igual à outra, justamente porque o fator humano é a variável que altera completamente o curso dos acontecimentos. O mesmo grupo de pessoas pode se reunir para jogar diversas vezes consecutivas e, ainda assim, cada rodada será capaz de gerar histórias inéditas, repletas de reviravoltas dramáticas e momentos de pura surpresa coletiva.`,
  },
  {
    slug: 'tikjogos-partidas-mais-organizadas-e-estrategicas',
    slugEn: 'tikjogos-more-organized-and-strategic-matches',
    slugEs: 'tikjogos-partidas-mas-organizadas-y-estrategicas',
    title: 'TikJogos: Partidas mais organizadas e estratégicas',
    titleEn: 'TikJogos: More Organized and Strategic Matches',
    titleEs: 'TikJogos: Partidas más organizadas y estratégicas',
    excerpt: 'Descubra como o TikJogos elimina a burocracia dos papéis e foca na pura diversão e dedução social.',
    excerptEn: 'Discover how TikJogos eliminates paper bureaucracy and focuses on pure fun and social deduction.',
    excerptEs: 'Descubre cómo TikJogos elimina la burocracia del papel y se enfoca en la pura diversión y deducción social.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    date: '03 Fev 2026',
    authorName: 'Equipe Tech',
    readTime: '4 min',
    category: 'Update',
    content: `Qualquer pessoa que já tenha tentado organizar uma partida do Jogo do Impostor de maneira estritamente tradicional sabe o quão frustrante a desorganização logística pode ser. O uso de papéis picados e canetas que falham acabam quebrando o ritmo necessário para manter a imersão psicológica.

Neste contexto, o TikJogos surge como uma solução definitiva, funcionando como um verdadeiro juiz digital que centraliza todas as informações vitais da partida.

### Pilares da Experiência
- **Sorteio Imparcial**: Garante que a escolha das funções seja aleatória e justa.
- **Sigilo Absoluto**: Evita que olhares acidentais revelem a identidade do impostor.
- **Cronômetro Automático**: Mantém a pressão e o dinamismo da rodada.

A facilidade de iniciar uma nova rodada com apenas alguns cliques permite que os grupos joguem muito mais partidas em um curto espaço de tempo, aproveitando melhor os momentos de lazer.`,
  },
  {
    slug: 'estrategias-essenciais-para-quem-joga-como-impostor',
    slugEn: 'essential-strategies-for-playing-as-impostor',
    slugEs: 'estrategias-esenciales-para-jugar-como-impostor',
    title: 'Estratégias essenciais para quem joga como impostor',
    titleEn: 'Essential Strategies for Playing as Impostor',
    titleEs: 'Estrategias esenciales para jugar como impostor',
    excerpt: 'Assumir o papel de vilão exige coerência narrativa e controle emocional. Aprenda a dominar a arte da camuflagem.',
    excerptEn: 'Taking on the villain role requires narrative coherence and emotional control. Learn to master the art of camouflage.',
    excerptEs: 'Asumir el papel de villano exige coherencia narrativa y control emocional. Aprende a dominar el arte del camuflaje.',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200',
    date: '02 Fev 2026',
    authorName: 'O Infiltrado',
    readTime: '5 min',
    category: 'Tips',
    content: `Assumir o papel de impostor exige muito mais do que apenas a capacidade de inventar mentiras. O verdadeiro desafio reside na manutenção de uma coerência narrativa impecável durante todo o desenrolar da partida, enquanto se controla o próprio comportamento não-verbal.

### Dicas de Mestre
1. **Mantenha seu Padrão**: Não mude drasticamente sua personalidade ao receber a função de vilão. Se você costuma ser calado, continue calado.
2. **Escuta Ativa**: Ouça os outros participantes antes de se posicionar. Muitas vezes, inocentes criam teorias erradas que você pode usar a seu favor.
3. **Plante Sementes de Dúvida**: Em vez de atacar frontalmente, faça perguntas sutis que levem os outros a questionarem a validade das informações apresentadas.

A vitória depende da capacidade de plantar incertezas sem parecer o autor direto delas.`,
  },
  {
    slug: 'como-identificar-o-impostor-usando-logica-e-paciencia',
    slugEn: 'how-to-identify-the-impostor-using-logic-and-patience',
    slugEs: 'como-identificar-al-impostor-usando-logica-y-paciencia',
    title: 'Como identificar o impostor usando lógica e paciência',
    titleEn: 'How to Identify the Impostor Using Logic and Patience',
    titleEs: 'Cómo identificar al impostor usando lógica y paciencia',
    excerpt: 'Encontrar o impostor não é sorte, mas um processo rigoroso de análise comportamental e lógica.',
    excerptEn: 'Finding the impostor is not luck, but a rigorous process of behavioral analysis and logic.',
    excerptEs: 'Encontrar al impostor no es suerte, sino un proceso riguroso de análisis comportamental y lógica.',
    image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=1200',
    date: '01 Fev 2026',
    authorName: 'Detetive Orion',
    readTime: '5 min',
    category: 'Tips',
    content: `Encontrar o impostor em meio a um grupo de amigos não é uma questão de sorte ou intuição mística, mas sim um processo rigoroso de análise lógica e paciência estratégica.

### Sinais de Alerta
- **Pressão do Tempo**: O impostor frequentemente tenta acelerar as decisões do coletivo para evitar que contradições venham à tona.
- **Contradições Verbais**: Mentiras complexas exigem um esforço cognitivo maior, o que gera rachaduras na narrativa quando questionadas.
- **Mudança de Discurso**: Observe se o suspeito muda ligeiramente sua versão dos fatos conforme o cerco se fecha.

A primeira regra para uma detecção eficiente é observar o fluxo das informações e identificar onde as histórias começam a se fragmentar.`,
  },
  {
    slug: 'por-que-a-comunicacao-define-o-vencedor-da-partida',
    slugEn: 'why-communication-defines-the-winner',
    slugEs: 'por-que-la-comunicacion-define-al-ganador',
    title: 'Por que a comunicação define o vencedor da partida',
    titleEn: 'Why Communication Defines the Winner of the Match',
    titleEs: '¿Por qué la comunicación define al ganador de la partida?',
    excerpt: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores.',
    excerptEn: 'Knowing how to speak clearly and listen attentively are the decisive skills that separate winners from losers.',
    excerptEs: 'Saber hablar con claridad y escuchar con atención son las competencias decisivas que separan ganadores de perdedores.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
    date: '31 Jan 2026',
    authorName: 'Luna Star',
    readTime: '4 min',
    category: 'News',
    content: `Diferente do que muitos acreditam, o Jogo do Impostor não premia necessariamente aquele que possui a maior habilidade de mentir friamente, mas sim quem domina a arte da comunicação interpessoal.

### O Poder da Escuta Ativa
A prática da escuta ativa é um diferencial competitivo que permite perceber incoerências, mudanças de tom de voz e hesitações micro-comportamentais. Quando você se comunica focando no outro, torna-se capaz de captar nuances que passariam despercebidas.

### Organização do Debate
Uma comunicação fragmentada ou caótica favorece o impostor, que utiliza o ruído para se esconder. Ao estabelecer um método organizado de troca de informações, o espaço para mentiras diminui drasticamente. A vitória pertence àqueles que orquestram a narrativa coletiva.`,
  },
  {
    slug: 'o-segredo-psicologico-por-tras-do-sucesso-do-genero',
    slugEn: 'the-psychological-secret-behind-the-genres-success',
    slugEs: 'el-secreto-psicologico-detras-del-exito-del-genero',
    title: 'O segredo psicológico por trás do sucesso do gênero',
    titleEn: 'The Psychological Secret Behind the Genre\'s Success',
    titleEs: 'El secreto psicológico detrás del éxito del género',
    excerpt: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura.',
    excerptEn: 'Understand the concept of the "magic circle" and how it allows us to explore facets of our personality safely.',
    excerptEs: 'Entiende el concepto del "círculo mágico" y cómo nos permite explorar facetas de nuestra personalidad de forma segura.',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1200',
    date: '30 Jan 2026',
    authorName: 'Dr. Nexus',
    readTime: '5 min',
    category: 'Community',
    content: `Os jogos de dedução social operam em um campo psicológico fascinante onde as normas sociais são suspensas para dar lugar ao lúdico. Eles criam o "círculo mágico", um espaço seguro onde mentir e manipular são incentivados pela mecânica da diversão.

### Catarse Social
Essa permissão especial libera emoções que costumamos reprimir, proporcionando uma forma única de catarse. O esforço mental para sustentar uma mentira enquanto se é observado estimula áreas profundas do cérebro, gerando uma experiência intensa e envolvente.

### O Prazer da Descoberta
Sentir que você foi capaz de ver através da máscara de um amigo ou que conseguiu enganar a todos com uma atuação brilhante gera um senso de realização pessoal muito forte. É essa profundidade humana que garante o sucesso do gênero.`,
  },
  {
    slug: 'desenvolvimento-cognitivo-exercitando-a-mente-no-espaco',
    slugEn: 'cognitive-development-exercising-the-mind-in-space',
    slugEs: 'desarrollo-cognitivo-ejercitando-la-mente-en-el-espacio',
    title: 'Desenvolvimento Cognitivo: Exercitando a mente no espaço',
    titleEn: 'Cognitive Development: Exercising the Mind in Space',
    titleEs: 'Desarrollo Cognitivo: Ejercitando la mente en el espacio',
    excerpt: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
    excerptEn: 'Actively participating in Impostor Game rounds is an excellent exercise for quick decision-making and critical analysis.',
    excerptEs: 'Participar activamente en rondas del Juego del Impostor es un excelente ejercicio para la toma de decisiones rápidas y análisis crítico.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    date: '29 Jan 2026',
    authorName: 'Profe Galática',
    readTime: '4 min',
    category: 'News',
    content: `O jogador nunca está em uma posição passiva; ele precisa avaliar cada informação recebida, compará-la com fatos anteriores e decidir se deve confiar. Esse processo de filtragem de dados é a base do método científico aplicado à vida cotidiana.

### Benefícios Mentais
- **Atenção Plena**: Observar detalhes sutis como mudanças na velocidade da fala.
- **Memória de Curto Prazo**: Lembrar com precisão quem disse o quê e em qual momento.
- **Argumentação e Retórica**: Estruturar o pensamento de forma lógica para convencer os outros.

O Jogo do Impostor transforma o lazer em uma academia para o cérebro, refinando processos mentais que utilizamos para resolver problemas complexos todos os dias.`,
  },
  {
    slug: 'erros-comuns-de-iniciantes-e-como-evita-los',
    slugEn: 'common-beginner-mistakes-and-how-to-avoid-them',
    slugEs: 'errores-comunes-de-principiantes-y-como-evitarlos',
    title: 'Erros comuns de iniciantes e como evitá-los',
    titleEn: 'Common Beginner Mistakes and How to Avoid Them',
    titleEs: 'Errores comunes de principiantes y cómo evitarlos',
    excerpt: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no jogo.',
    excerptEn: 'Don\'t fall into behavioral traps! Learn why talking too much can be your downfall in the game.',
    excerptEs: '¡No caigas en trampas comportamentales! Descubre por qué hablar demasiado puede ser tu fin en el juego.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    date: '28 Jan 2026',
    authorName: 'Comandante Nova',
    readTime: '6 min',
    category: 'Tips',
    content: `Muitos jogadores novatos acabam caindo em armadilhas que revelam sua identidade ou os tornam alvos fáceis. Um dos erros mais clássicos é acreditar que falar sem parar prova a sua inocência.

### O que NÃO fazer
1. **Falar Excessivamente**: O excesso de explicações gera suspeita imediata e fornece material para contradições.
2. **Acusações Precipitadas**: Apontar o dedo muito cedo sem evidências sólidas pode eliminar um aliado ou atrair atenção indesejada para você.
3. **Falta de Paciência**: Mudar de opinião assim que alguém discorda demonstra insegurança que os impostores adoram explorar.

O jogo é uma maratona psicológica, não um sprint. Desenvolver uma visão periférica e manter um registro mental das falas alheias são passos fundamentais para evoluir.`,
  },
];

// Lookup by any slug (PT, EN, ES)
const BLOG_CONTENT_MAP = new Map<string, BlogPostFull>();
for (const post of BLOG_POSTS_FULL) {
  BLOG_CONTENT_MAP.set(post.slug, post);
  BLOG_CONTENT_MAP.set(post.slugEn, post);
  BLOG_CONTENT_MAP.set(post.slugEs, post);
}

export function getBlogPostBySlug(slug: string): BlogPostFull | undefined {
  return BLOG_CONTENT_MAP.get(slug);
}

/** Convert simple markdown content to HTML for crawler consumption */
export function markdownToHtml(md: string): string {
  let html = md
    // Escape HTML entities in content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // List items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Remove youtube embeds (not useful for crawlers)
    .replace(/\{\{youtube:[^}]+\}\}/g, '')
    // Paragraphs: wrap non-tag lines
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) return trimmed;
      // Wrap consecutive <li> in <ul>
      if (trimmed.includes('<li>')) return `<ul>${trimmed}</ul>`;
      return `<p>${trimmed.replace(/\n/g, ' ')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}
