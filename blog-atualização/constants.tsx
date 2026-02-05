
import { Post, GameMode } from './types';

export const COLORS = {
  bgMain: '#1a1b2e',
  bgPanel: '#242642',
  bgPanelDark: '#1e2036',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  green: '#22c55e',
  emerald: '#10b981',
  yellow: '#facc15',
  rose: '#f43f5e',
  orange: '#f97316',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate400: '#94a3b8',
};

export const GAME_MODES: GameMode[] = [
  {
    id: 'palavra-secreta',
    title: 'Palavra Secreta',
    desc: 'Uma palavra para todos. O Impostor tenta adivinhar!',
    difficulty: 'Fácil',
    iconName: 'Key'
  },
  {
    id: 'locais-funcoes',
    title: 'Locais & Funções',
    desc: 'Cada um recebe um Local e uma Função. O Impostor não sabe o local.',
    difficulty: 'Médio',
    iconName: 'MapPin'
  },
  {
    id: 'categoria-item',
    title: 'Categoria + Item',
    desc: 'Todos sabem a categoria e o item. O Impostor só sabe a categoria.',
    difficulty: 'Médio',
    iconName: 'Package'
  },
  {
    id: 'duas-faccoes',
    title: 'Duas Facções',
    desc: 'Dois times com palavras diferentes. O Impostor não sabe nenhuma.',
    difficulty: 'Difícil',
    iconName: 'Users'
  },
  {
    id: 'perguntas-diferentes',
    title: 'Perguntas Diferentes',
    desc: 'Tripulantes e Impostor recebem perguntas parecidas, mas diferentes.',
    difficulty: 'Difícil',
    iconName: 'HelpCircle'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'A alma dos games sociais: Por que a desconfiança nos fascina?',
    excerpt: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural ao transformar a desconfiança em uma experiênca profunda.',
    content: `O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural entre gamers e diversos grupos de amigos por conseguir transformar uma premissa extremamente simples em uma experiência psicológica profunda e muito intensa. Diferente da maioria dos jogos tradicionais, onde o objetivo principal é competir contra regras matemáticas fixas ou mecânicas de reflexo rápidas, aqui os participantes são colocados para enfrentar diretamente a mente e a intuição uns dos outros.

Essa mudança de paradigma retira o foco do tabuleiro físico ou da interface digital e o transporta para o campo das interações humanas puras, onde cada palavra dita possui um peso estratégico fundamental para o sucesso ou fracasso do grupo. A grande força motriz que sustenta toda a dinâmica desta modalidade está fundamentada na desconfiança constante e na leitura comportamental.

### O Fator Humano como Variável
Cada resposta ligeiramente vaga, cada pausa inesperada ao falar e cada acusação lançada sem uma base sólida cria uma tensão palpável que mantém todos os jogadores em estado de alerta máximo durante toda a sessão. O jogo consegue misturar de forma magistral os elementos de observação atenta, estratégia de manipulação e interação social orgânica. Não se trata apenas de descobrir quem está mentindo, mas sim de entender as motivações por trás de cada comportamento.

### Narrativas Inéditas
Um dos aspectos mais fascinantes é que nenhuma partida jamais será igual à outra, justamente porque o fator humano é a variável que altera completamente o curso dos acontecimentos. O mesmo grupo de pessoas pode se reunir para jogar diversas vezes consecutivas e, ainda assim, cada rodada será capaz de gerar histórias inéditas, repletas de reviravoltas dramáticas e momentos de pura surpresa coletiva.`,
    author: {
      name: 'Capitão Miller',
      role: 'Estrategista Social',
      avatar: 'https://picsum.photos/seed/miller/100/100'
    },
    date: '04 Fev 2026',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min',
    featured: true
  },
  {
    id: '2',
    title: 'TikJogos: Partidas mais organizadas e estratégicas',
    excerpt: 'Descubra como o TikJogos elimina a burocracia dos papéis e foca na pura diversão e dedução social.',
    content: `Qualquer pessoa que já tenha tentado organizar uma partida do Jogo do Impostor de maneira estritamente tradicional sabe o quão frustrante a desorganização logística pode ser. O uso de papéis picados e canetas que falham acabam quebrando o ritmo necessário para manter a imersão psicológica.

Neste contexto, o TikJogos surge como uma solução definitiva, funcionando como um verdadeiro juiz digital que centraliza todas as informações vitais da partida. A plataforma assume a responsabilidade de gerenciar o tempo, realizar os sorteios de forma automatizada e distribuir as funções secretas sem margem para erro humano.

### Pilares da Experiência
- **Sorteio Imparcial**: Garante que a escolha das funções seja aleatória e justa.
- **Sigilo Absoluto**: Evita que olhares acidentais revelem a identidade do impostor.
- **Cronômetro Automático**: Mantém a pressão e o dinamismo da rodada.

A facilidade de iniciar uma nova rodada com apenas alguns cliques permite que os grupos joguem muito mais partidas em um curto espaço de tempo, aproveitando melhor os momentos de lazer. O foco sai da logística e volta para as pessoas.`,
    author: {
      name: 'Equipe Tech',
      role: 'Desenvolvedores',
      avatar: 'https://picsum.photos/seed/tech/100/100'
    },
    date: '03 Fev 2026',
    category: 'Update',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min'
  },
  {
    id: '3',
    title: 'Estratégias essenciais para quem joga como impostor',
    excerpt: 'Assumir o papel de vilão exige coerência narrativa e controle emocional. Aprenda a dominar a arte da camuflagem.',
    content: `Assumir o papel de impostor exige muito mais do que apenas a capacidade de inventar mentiras. O verdadeiro desafio reside na manutenção de uma coerência narrativa impecável durante todo o desenrolar da partida, enquanto se controla o próprio comportamento não-verbal.

### Dicas de Mestre
1. **Mantenha seu Padrão**: Não mude drasticamente sua personalidade ao receber a função de vilão. Se você costuma ser calado, continue calado.
2. **Escuta Ativa**: Ouça os outros participantes antes de se posicionar. Muitas vezes, inocentes criam teorias erradas que você pode usar a seu favor.
3. **Plante Sementes de Dúvida**: Em vez de atacar frontalmente, faça perguntas sutis que levem os outros a questionarem a validade das informações apresentadas.

A vitória depende da capacidade de plantar incertezas sem parecer o autor direto delas. Quando você domina a arte de se tornar parte da paisagem, a descoberta da sua identidade torna-se uma tarefa quase impossível.`,
    author: {
      name: 'O Infiltrado',
      role: 'Estrategista',
      avatar: 'https://picsum.photos/seed/spy/100/100'
    },
    date: '02 Fev 2026',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min'
  },
  {
    id: '4',
    title: 'Como identificar o impostor usando lógica e paciência',
    excerpt: 'Encontrar o impostor não é sorte, mas um processo rigoroso de análise comportamental e lógica.',
    content: `Encontrar o impostor em meio a um grupo de amigos não é uma questão de sorte ou intuição mística, mas sim um processo rigoroso de análise lógica e paciência estratégica.

### Sinais de Alerta
- **Pressão do Tempo**: O impostor frequentemente tenta acelerar as decisões do coletivo para evitar que contradições venham à tona.
- **Contradições Verbais**: Mentiras complexas exigem um esforço cognitivo maior, o que gera rachaduras na narrativa quando questionadas.
- **Mudança de Discurso**: Observe se o suspeito muda ligeiramente sua versão dos fatos conforme o cerco se fecha.

A primeira regra para uma detecção eficiente é observar o fluxo das informações e identificar onde as histórias começam a se fragmentar. A paciência permite que você colete dados suficientes para construir um caso sólido.`,
    author: {
      name: 'Detetive Orion',
      role: 'Analista de Dados',
      avatar: 'https://picsum.photos/seed/detective/100/100'
    },
    date: '01 Fev 2026',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min'
  },
  {
    id: '5',
    title: 'Por que a comunicação define o vencedor da partida',
    excerpt: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores.',
    content: `Diferente do que muitos acreditam, o Jogo do Impostor não premia necessariamente aquele que possui a maior habilidade de mentir friamente, mas sim quem domina a arte da comunicação interpessoal.

### O Poder da Escuta Ativa
A prática da escuta ativa é um diferencial competitivo que permite perceber incoerências, mudanças de tom de voz e hesitações micro-comportamentais. Quando você se comunica focando no outro, torna-se capaz de captar nuances que passariam despercebidas.

### Organização do Debate
Uma comunicação fragmentada ou caótica favorece o impostor, que utiliza o ruído para se esconder. Ao estabelecer um método organizado de troca de informações, o espaço para mentiras diminui drasticamente. A vitória pertence àqueles que orquestram a narrativa coletiva.`,
    author: {
      name: 'Luna Star',
      role: 'Gerente de Comunidade',
      avatar: 'https://picsum.photos/seed/luna/100/100'
    },
    date: '31 Jan 2026',
    category: 'News',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min'
  },
  {
    id: '6',
    title: 'O segredo psicológico por trás do sucesso do gênero',
    excerpt: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura.',
    content: `Os jogos de dedução social operam em um campo psicológico fascinante onde as normas sociais são suspensas para dar lugar ao lúdico. Eles criam o "círculo mágico", um espaço seguro onde mentir e manipular são incentivados pela mecânica da diversão.

### Catarse Social
Essa permissão especial libera emoções que costumamos reprimir, proporcionando uma forma única de catarse. O esforço mental para sustentar uma mentira enquanto se é observado estimula áreas profundas do cérebro, gerando uma experiência intensa e envolvente.

### O Prazer da Descoberta
Sentir que você foi capaz de ver através da máscara de um amigo ou que conseguiu enganar a todos com uma atuação brilhante gera um senso de realização pessoal muito forte. É essa profundidade humana que garante o sucesso do gênero.`,
    author: {
      name: 'Dr. Nexus',
      role: 'Psicólogo Gamefied',
      avatar: 'https://picsum.photos/seed/nexus/100/100'
    },
    date: '30 Jan 2026',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1200',
    readTime: '5 min'
  },
  {
    id: '7',
    title: 'Desenvolvimento Cognitivo: Exercitando a mente no espaço',
    excerpt: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
    content: `O jogador nunca está em uma posição passiva; ele precisa avaliar cada informação recebida, compará-la com fatos anteriores e decidir se deve confiar. Esse processo de filtragem de dados é a base do método científico aplicado à vida cotidiana.

### Benefícios Mentais
- **Atenção Plena**: Observar detalhes sutis como mudanças na velocidade da fala.
- **Memória de Curto Prazo**: Lembrar com precisão quem disse o quê e em qual momento.
- **Argumentação e Retórica**: Estruturar o pensamento de forma lógica para convencer os outros.

O Jogo do Impostor transforma o lazer em uma academia para o cérebro, refinando processos mentais que utilizamos para resolver problemas complexos todos os dias.`,
    author: {
      name: 'Profe Galática',
      role: 'Educação Lúdica',
      avatar: 'https://picsum.photos/seed/edu/100/100'
    },
    date: '29 Jan 2026',
    category: 'News',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    readTime: '4 min'
  },
  {
    id: '8',
    title: 'Erros comuns de iniciantes e como evitá-los',
    excerpt: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no jogo.',
    content: `Muitos jogadores novatos acabam caindo em armadilhas que revelam sua identidade ou os tornam alvos fáceis. Um dos erros mais clássicos é acreditar que falar sem parar prova a sua inocência.

### O que NÃO fazer
1. **Falar Excessivamente**: O excesso de explicações gera suspeita imediata e fornece material para contradições.
2. **Acusações Precipitadas**: Apontar o dedo muito cedo sem evidências sólidas pode eliminar um aliado ou atrair atenção indesejada para você.
3. **Falta de Paciência**: Mudar de opinião assim que alguém discorda demonstra insegurança que os impostores adoram explorar.

O jogo é uma maratona psicológica, não um sprint. Desenvolver uma visão periférica e manter um registro mental das falas alheias são passos fundamentais para evoluir.`,
    author: {
      name: 'Comandante Nova',
      role: 'Instrutora de Voo',
      avatar: 'https://picsum.photos/seed/nova/100/100'
    },
    date: '28 Jan 2026',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    readTime: '6 min'
  }
];
