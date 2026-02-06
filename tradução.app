// Arquivo de traduções - TikJogos (Completo com Blog Posts)
// Idiomas: Português (PT), Inglês (EN), Espanhol (ES)

export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    // Navegação e Menu
    nav: {
      home: 'Início',
      blog: 'Blog',
      howToPlay: 'Como Jogar',
      themes: 'Temas',
      createTheme: 'Criar Tema',
      donate: 'Doar',
      privacy: 'Privacidade',
      terms: 'Termos de Uso',
    },

    // Página Inicial (ImpostorGame)
    home: {
      title: 'TikJogos',
      subtitle: 'O Jogo do Impostor Reimaginado',
      description: 'Desconfiança, estratégia e diversão em um só lugar. Jogue com amigos e descubra quem é o impostor.',
      createRoom: 'Criar Sala',
      joinRoom: 'Entrar em Sala',
      playLocal: 'Modo Local',
      createTheme: 'Criar Tema',
      nickname: 'Digite seu apelido',
      roomCode: 'Código da sala',
      saveNickname: 'Lembrar meu apelido',
      enterCode: 'Entrar',
    },

    // Modo de Jogo (GameModes)
    gameModes: {
      title: 'Modos de Jogo',
      description: 'Escolha seu modo favorito e comece a jogar',
      classic: {
        name: 'Modo Clássico',
        description: 'O jogo tradicional com discussões e votações',
      },
      rapid: {
        name: 'Modo Rápido',
        description: 'Partidas rápidas com menos rodadas',
      },
      hardcore: {
        name: 'Modo Hardcore',
        description: 'Desafio máximo com regras mais rigorosas',
      },
      custom: {
        name: 'Modo Customizado',
        description: 'Crie suas próprias regras',
      },
    },

    // Como Jogar
    howToPlay: {
      title: 'Como Jogar',
      objective: 'Objetivo do Jogo',
      objectiveDesc: 'Encontre o(s) impostor(es) antes que eles sabotagem o grupo.',
      roles: 'Papéis',
      crewmate: 'Tripulante - Complete as tarefas',
      impostor: 'Impostor - Sabote e elimine',
      gameplay: 'Gameplay',
      gameplayDesc: 'Discussão, votação e execução de suspeitos.',
      tips: 'Dicas',
      tipObserve: 'Observe o comportamento dos outros',
      tipCommunicate: 'Comunique-se com seu time',
      tipVote: 'Vote com confiança mas cuidado',
    },

    // Criar Tema
    createTheme: {
      title: 'Criar Tema',
      description: 'Crie seu próprio tema personalizado para o jogo',
      themeTitle: 'Título do Tema',
      authorName: 'Nome do Autor',
      words: 'Palavras (mínimo 7)',
      addWord: 'Adicionar Palavra',
      isPublic: 'Tornar Público',
      isPrivate: 'Privado',
      price: 'R$ 3,00',
      acceptTerms: 'Aceito os termos e condições',
      create: 'Criar Tema',
      paymentPending: 'Aguardando Pagamento',
      scanQr: 'Escaneie o QR Code',
      copying: 'Copiar PIX',
      copied: 'Copiado!',
      success: 'Tema criado com sucesso!',
      successCode: 'Código de Acesso',
      error: 'Erro ao criar tema',
      minWords: 'Mínimo de 7 palavras necessário',
      maxWords: 'Máximo de 25 palavras',
    },

    // Doações
    donate: {
      title: 'Apoiar o Projeto',
      description: 'Sua contribuição ajuda a manter o TikJogos funcionando e em constante evolução.',
      thanks: 'Obrigado por apoiar!',
      donorName: 'Seu Nome',
      message: 'Mensagem (opcional)',
      amount: 'Valor (R$)',
      presets: ['R$ 5', 'R$ 10', 'R$ 20', 'R$ 50'],
      customAmount: 'Valor Customizado',
      donate: 'Fazer Doação',
      paymentPending: 'Aguardando Confirmação',
      scanQr: 'Escaneie o QR Code com seu app do Banco',
      minAmount: 'Valor mínimo é R$ 1,00',
      maxAmount: 'Valor máximo é R$ 1.000,00',
      success: 'Doação recebida com sucesso!',
      error: 'Erro ao processar doação',
    },

    // Blog
    blog: {
      title: 'Blog do Impostor',
      subtitle: 'Central de Comando',
      description: 'Notícias galácticas, estratégias de sabotagem e atualizações direto da central TikJogos.',
      readMore: 'Ler Mais',
      readTime: 'min de leitura',
      published: 'Publicado em',
      author: 'Por',
      category: 'Categoria',
      noComments: 'Nenhum comentário ainda',
    },

    // Posts do Blog
    blogPosts: {
      post1: {
        title: 'A alma dos games sociais: Por que a desconfiança nos fascina?',
        excerpt: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural ao transformar a desconfiança em uma experiência profunda.',
        content: `O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural entre gamers e diversos grupos de amigos por conseguir transformar uma premissa extremamente simples em uma experiência psicológica profunda e muito intensa. Diferente da maioria dos jogos tradicionais, onde o objetivo principal é competir contra regras matemáticas fixas ou mecânicas de reflexo rápidas, aqui os participantes são colocados para enfrentar diretamente a mente e a intuição uns dos outros.

Essa mudança de paradigma retira o foco do tabuleiro físico ou da interface digital e o transporta para o campo das interações humanas puras, onde cada palavra dita possui um peso estratégico fundamental para o sucesso ou fracasso do grupo. A grande força motriz que sustenta toda a dinâmica desta modalidade está fundamentada na desconfiança constante e na leitura comportamental.

### O Fator Humano como Variável
Cada resposta ligeiramente vaga, cada pausa inesperada ao falar e cada acusação lançada sem uma base sólida cria uma tensão palpável que mantém todos os jogadores em estado de alerta máximo durante toda a sessão. O jogo consegue misturar de forma magistral os elementos de observação atenta, estratégia de manipulação e interação social orgânica. Não se trata apenas de descobrir quem está mentindo, mas sim de entender as motivações por trás de cada comportamento.

### Narrativas Inéditas
Um dos aspectos mais fascinantes é que nenhuma partida jamais será igual à outra, justamente porque o fator humano é a variável que altera completamente o curso dos acontecimentos. O mesmo grupo de pessoas pode se reunir para jogar diversas vezes consecutivas e, ainda assim, cada rodada será capaz de gerar histórias inéditas, repletas de reviravoltas dramáticas e momentos de pura surpresa coletiva.`,
        author: 'Capitão Miller',
        role: 'Estrategista Social',
        date: '04 Fev 2026',
        category: 'Comunidade',
      },
      post2: {
        title: 'TikJogos: Partidas mais organizadas e estratégicas',
        excerpt: 'Descubra como o TikJogos elimina a burocracia dos papéis e foca na pura diversão e dedução social.',
        content: `Qualquer pessoa que já tenha tentado organizar uma partida do Jogo do Impostor de maneira estritamente tradicional sabe o quão frustrante a desorganização logística pode ser. O uso de papéis picados e canetas que falham acabam quebrando o ritmo necessário para manter a imersão psicológica.

Neste contexto, o TikJogos surge como uma solução definitiva, funcionando como um verdadeiro juiz digital que centraliza todas as informações vitais da partida. A plataforma assume a responsabilidade de gerenciar o tempo, realizar os sorteios de forma automatizada e distribuir as funções secretas sem margem para erro humano.

### Pilares da Experiência
- **Sorteio Imparcial**: Garante que a escolha das funções seja aleatória e justa.
- **Sigilo Absoluto**: Evita que olhares acidentais revelem a identidade do impostor.
- **Cronômetro Automático**: Mantém a pressão e o dinamismo da rodada.

A facilidade de iniciar uma nova rodada com apenas alguns cliques permite que os grupos joguem muito mais partidas em um curto espaço de tempo, aproveitando melhor os momentos de lazer. O foco sai da logística e volta para as pessoas.`,
        author: 'Equipe Tech',
        role: 'Desenvolvedores',
        date: '03 Fev 2026',
        category: 'Atualização',
      },
      post3: {
        title: 'Estratégias essenciais para quem joga como impostor',
        excerpt: 'Assumir o papel de vilão exige coerência narrativa e controle emocional. Aprenda a dominar a arte da camuflagem.',
        content: `Assumir o papel de impostor exige muito mais do que apenas a capacidade de inventar mentiras. O verdadeiro desafio reside na manutenção de uma coerência narrativa impecável durante todo o desenrolar da partida, enquanto se controla o próprio comportamento não-verbal.

### Dicas de Mestre
1. **Mantenha seu Padrão**: Não mude drasticamente sua personalidade ao receber a função de vilão. Se você costuma ser calado, continue calado.
2. **Escuta Ativa**: Ouça os outros participantes antes de se posicionar. Muitas vezes, inocentes criam teorias erradas que você pode usar a seu favor.
3. **Plante Sementes de Dúvida**: Em vez de atacar frontalmente, faça perguntas sutis que levem os outros a questionarem a validade das informações apresentadas.

A vitória depende da capacidade de plantar incertezas sem parecer o autor direto delas. Quando você domina a arte de se tornar parte da paisagem, a descoberta da sua identidade torna-se uma tarefa quase impossível.`,
        author: 'O Infiltrado',
        role: 'Estrategista',
        date: '02 Fev 2026',
        category: 'Dicas',
      },
      post4: {
        title: 'Como identificar o impostor usando lógica e paciência',
        excerpt: 'Encontrar o impostor não é sorte, mas um processo rigoroso de análise comportamental e lógica.',
        content: `Encontrar o impostor em meio a um grupo de amigos não é uma questão de sorte ou intuição mística, mas sim um processo rigoroso de análise lógica e paciência estratégica.

### Sinais de Alerta
- **Pressão do Tempo**: O impostor frequentemente tenta acelerar as decisões do coletivo para evitar que contradições venham à tona.
- **Contradições Verbais**: Mentiras complexas exigem um esforço cognitivo maior, o que gera rachaduras na narrativa quando questionadas.
- **Mudança de Discurso**: Observe se o suspeito muda ligeiramente sua versão dos fatos conforme o cerco se fecha.

A primeira regra para uma detecção eficiente é observar o fluxo das informações e identificar onde as histórias começam a se fragmentar. A paciência permite que você colete dados suficientes para construir um caso sólido.`,
        author: 'Detetive Orion',
        role: 'Analista de Dados',
        date: '01 Fev 2026',
        category: 'Dicas',
      },
      post5: {
        title: 'Por que a comunicação define o vencedor da partida',
        excerpt: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores.',
        content: `Diferente do que muitos acreditam, o Jogo do Impostor não premia necessariamente aquele que possui a maior habilidade de mentir friamente, mas sim quem domina a arte da comunicação interpessoal.

### O Poder da Escuta Ativa
A prática da escuta ativa é um diferencial competitivo que permite perceber incoerências, mudanças de tom de voz e hesitações micro-comportamentais. Quando você se comunica focando no outro, torna-se capaz de captar nuances que passariam despercebidas.

### Organização do Debate
Uma comunicação fragmentada ou caótica favorece o impostor, que utiliza o ruído para se esconder. Ao estabelecer um método organizado de troca de informações, o espaço para mentiras diminui drasticamente. A vitória pertence àqueles que orquestram a narrativa coletiva.`,
        author: 'Luna Star',
        role: 'Gerente de Comunidade',
        date: '31 Jan 2026',
        category: 'Notícias',
      },
      post6: {
        title: 'O segredo psicológico por trás do sucesso do gênero',
        excerpt: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura.',
        content: `Os jogos de dedução social operam em um campo psicológico fascinante onde as normas sociais são suspensas para dar lugar ao lúdico. Eles criam o "círculo mágico", um espaço seguro onde mentir e manipular são incentivados pela mecânica da diversão.

### Catarse Social
Essa permissão especial libera emoções que costumamos reprimir, proporcionando uma forma única de catarse. O esforço mental para sustentar uma mentira enquanto se é observado estimula áreas profundas do cérebro, gerando uma experiência intensa e envolvente.

### O Prazer da Descoberta
Sentir que você foi capaz de ver através da máscara de um amigo ou que conseguiu enganar a todos com uma atuação brilhante gera um senso de realização pessoal muito forte. É essa profundidade humana que garante o sucesso do gênero.`,
        author: 'Dr. Nexus',
        role: 'Psicólogo Gamificado',
        date: '30 Jan 2026',
        category: 'Comunidade',
      },
      post7: {
        title: 'Desenvolvimento Cognitivo: Exercitando a mente no espaço',
        excerpt: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
        content: `O jogador nunca está em uma posição passiva; ele precisa avaliar cada informação recebida, compará-la com fatos anteriores e decidir se deve confiar. Esse processo de filtragem de dados é a base do método científico aplicado à vida cotidiana.

### Benefícios Mentais
- **Atenção Plena**: Observar detalhes sutis como mudanças na velocidade da fala.
- **Memória de Curto Prazo**: Lembrar com precisão quem disse o quê e em qual momento.
- **Argumentação e Retórica**: Estruturar o pensamento de forma lógica para convencer os outros.

O Jogo do Impostor transforma o lazer em uma academia para o cérebro, refinando processos mentais que utilizamos para resolver problemas complexos todos os dias.`,
        author: 'Profe Galática',
        role: 'Educação Lúdica',
        date: '29 Jan 2026',
        category: 'Notícias',
      },
      post8: {
        title: 'Erros comuns de iniciantes e como evitá-los',
        excerpt: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no jogo.',
        content: `Muitos jogadores novatos acabam caindo em armadilhas que revelam sua identidade ou os tornam alvos fáceis. Um dos erros mais clássicos é acreditar que falar sem parar prova a sua inocência.

### O que NÃO fazer
1. **Falar Excessivamente**: O excesso de explicações gera suspeita imediata e fornece material para contradições.
2. **Acusações Precipitadas**: Apontar o dedo muito cedo sem evidências sólidas pode eliminar um aliado ou atrair atenção indesejada para você.
3. **Falta de Paciência**: Mudar de opinião assim que alguém discorda demonstra insegurança que os impostores adoram explorar.

O jogo é uma maratona psicológica, não um sprint. Desenvolver uma visão periférica e manter um registro mental das falas alheias são passos fundamentais para evoluir.`,
        author: 'Comandante Nova',
        role: 'Instrutora de Voo',
        date: '28 Jan 2026',
        category: 'Dicas',
      },
    },

    // Termos e Privacidade
    legal: {
      privacy: 'Política de Privacidade',
      terms: 'Termos de Uso',
      copyright: '© 2026 TikJogos. Todos os direitos reservados.',
      lastUpdated: 'Última atualização',
    },

    // Erros
    errors: {
      notFound: 'Página não encontrada',
      notFoundDesc: 'Desculpe, a página que você está procurando não existe.',
      backHome: 'Voltar à Tela Inicial',
      serverError: 'Erro no servidor',
      tryAgain: 'Tentar Novamente',
      loading: 'Carregando...',
    },

    // Botões Comuns
    buttons: {
      send: 'Enviar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      back: 'Voltar',
      next: 'Próximo',
      submit: 'Enviar',
      save: 'Salvar',
      delete: 'Deletar',
      edit: 'Editar',
      copy: 'Copiar',
      share: 'Compartilhar',
      play: 'Jogar',
      start: 'Começar',
      exit: 'Sair',
    },

    // Validações
    validation: {
      required: 'Este campo é obrigatório',
      minLength: 'Mínimo de {min} caracteres',
      maxLength: 'Máximo de {max} caracteres',
      invalidEmail: 'Email inválido',
      invalidNumber: 'Número inválido',
      passwordMismatch: 'As senhas não correspondem',
    },

    // Modal e Alertas
    alerts: {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Atenção',
      info: 'Informação',
      confirm: 'Você tem certeza?',
    },
  },

  en: {
    // Navigation and Menu
    nav: {
      home: 'Home',
      blog: 'Blog',
      howToPlay: 'How to Play',
      themes: 'Themes',
      createTheme: 'Create Theme',
      donate: 'Donate',
      privacy: 'Privacy',
      terms: 'Terms of Use',
    },

    // Home Page (ImpostorGame)
    home: {
      title: 'TikJogos',
      subtitle: 'The Impostor Game Reimagined',
      description: 'Suspicion, strategy, and fun in one place. Play with friends and discover who the impostor is.',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      playLocal: 'Local Mode',
      createTheme: 'Create Theme',
      nickname: 'Enter your nickname',
      roomCode: 'Room code',
      saveNickname: 'Remember my nickname',
      enterCode: 'Enter',
    },

    // Game Modes
    gameModes: {
      title: 'Game Modes',
      description: 'Choose your favorite mode and start playing',
      classic: {
        name: 'Classic Mode',
        description: 'The traditional game with discussions and voting',
      },
      rapid: {
        name: 'Rapid Mode',
        description: 'Quick matches with fewer rounds',
      },
      hardcore: {
        name: 'Hardcore Mode',
        description: 'Maximum challenge with stricter rules',
      },
      custom: {
        name: 'Custom Mode',
        description: 'Create your own rules',
      },
    },

    // How to Play
    howToPlay: {
      title: 'How to Play',
      objective: 'Game Objective',
      objectiveDesc: 'Find the impostor(s) before they sabotage the group.',
      roles: 'Roles',
      crewmate: 'Crewmate - Complete tasks',
      impostor: 'Impostor - Sabotage and eliminate',
      gameplay: 'Gameplay',
      gameplayDesc: 'Discussion, voting, and elimination of suspects.',
      tips: 'Tips',
      tipObserve: 'Observe the behavior of others',
      tipCommunicate: 'Communicate with your team',
      tipVote: 'Vote with confidence but be careful',
    },

    // Create Theme
    createTheme: {
      title: 'Create Theme',
      description: 'Create your own custom theme for the game',
      themeTitle: 'Theme Title',
      authorName: 'Author Name',
      words: 'Words (minimum 7)',
      addWord: 'Add Word',
      isPublic: 'Make Public',
      isPrivate: 'Private',
      price: '$3.00',
      acceptTerms: 'I accept the terms and conditions',
      create: 'Create Theme',
      paymentPending: 'Awaiting Payment',
      scanQr: 'Scan the QR Code',
      copying: 'Copy PIX',
      copied: 'Copied!',
      success: 'Theme created successfully!',
      successCode: 'Access Code',
      error: 'Error creating theme',
      minWords: 'Minimum 7 words required',
      maxWords: 'Maximum 25 words',
    },

    // Donations
    donate: {
      title: 'Support the Project',
      description: 'Your contribution helps keep TikJogos running and constantly evolving.',
      thanks: 'Thank you for supporting!',
      donorName: 'Your Name',
      message: 'Message (optional)',
      amount: 'Amount ($)',
      presets: ['$5', '$10', '$20', '$50'],
      customAmount: 'Custom Amount',
      donate: 'Make a Donation',
      paymentPending: 'Awaiting Confirmation',
      scanQr: 'Scan the QR Code with your Bank app',
      minAmount: 'Minimum amount is $1.00',
      maxAmount: 'Maximum amount is $1,000.00',
      success: 'Donation received successfully!',
      error: 'Error processing donation',
    },

    // Blog
    blog: {
      title: 'Impostor Blog',
      subtitle: 'Command Center',
      description: 'Galactic news, sabotage strategies, and updates directly from the TikJogos command center.',
      readMore: 'Read More',
      readTime: 'min read',
      published: 'Published on',
      author: 'By',
      category: 'Category',
      noComments: 'No comments yet',
    },

    // Blog Posts
    blogPosts: {
      post1: {
        title: 'The Soul of Social Games: Why does distrust fascinate us?',
        excerpt: 'The Impostor Game has established itself as a true cultural phenomenon by turning distrust into a profound experience.',
        content: `The Impostor Game has established itself as a true cultural phenomenon among gamers and various groups of friends by managing to transform an extremely simple premise into a profound and very intense psychological experience. Unlike most traditional games, where the main objective is to compete against fixed mathematical rules or fast reflexes, here participants are placed to face directly the minds and intuitions of each other.

This paradigm shift removes the focus from the physical board or digital interface and transports it to the field of pure human interactions, where each word spoken has fundamental strategic weight for the success or failure of the group. The great driving force that sustains the entire dynamics of this modality is based on constant distrust and behavioral reading.

### The Human Factor as a Variable
Each slightly vague response, each unexpected pause when speaking, and each accusation thrown without solid grounds creates a palpable tension that keeps all players in a state of maximum alert throughout the entire session. The game manages to masterfully mix the elements of careful observation, manipulation strategy, and organic social interaction. It is not just about discovering who is lying, but about understanding the motivations behind each behavior.

### Unprecedented Narratives
One of the most fascinating aspects is that no match will ever be the same as another, precisely because the human factor is the variable that completely alters the course of events. The same group of people can gather to play several times in a row and, yet, each round will be able to generate unprecedented stories, full of dramatic twists and moments of pure collective surprise.`,
        author: 'Captain Miller',
        role: 'Social Strategist',
        date: 'Feb 04, 2026',
        category: 'Community',
      },
      post2: {
        title: 'TikJogos: More organized and strategic matches',
        excerpt: 'Discover how TikJogos eliminates the bureaucracy of papers and focuses on pure fun and social deduction.',
        content: `Anyone who has tried to organize a match of the Impostor Game in a strictly traditional way knows how frustrating logistical disorganization can be. The use of torn papers and failing pens end up breaking the rhythm needed to maintain psychological immersion.

In this context, TikJogos emerges as a definitive solution, functioning as a true digital referee that centralizes all vital information of the match. The platform takes responsibility for managing time, conducting draws automatically, and distributing secret functions without room for human error.

### Pillars of Experience
- **Impartial Lottery**: Guarantees that the choice of roles is random and fair.
- **Absolute Secrecy**: Prevents accidental glances from revealing the impostor's identity.
- **Automatic Timer**: Maintains the pressure and dynamism of the round.

The ease of starting a new round with just a few clicks allows groups to play many more matches in a short period of time, making better use of leisure moments. The focus shifts from logistics back to people.`,
        author: 'Tech Team',
        role: 'Developers',
        date: 'Feb 03, 2026',
        category: 'Update',
      },
      post3: {
        title: 'Essential strategies for those who play as impostor',
        excerpt: 'Taking on the role of villain requires narrative coherence and emotional control. Learn to master the art of camouflage.',
        content: `Taking on the role of impostor requires much more than just the ability to invent lies. The true challenge lies in maintaining impeccable narrative coherence throughout the course of the match, while controlling your own non-verbal behavior.

### Master Tips
1. **Maintain Your Pattern**: Do not drastically change your personality when you receive the villain function. If you tend to be quiet, stay quiet.
2. **Active Listening**: Listen to other participants before taking a position. Often, innocents create wrong theories that you can use to your advantage.
3. **Plant Seeds of Doubt**: Instead of attacking frontally, ask subtle questions that lead others to question the validity of the information presented.

Victory depends on the ability to plant uncertainties without seeming to be their direct author. When you master the art of becoming part of the landscape, discovering your identity becomes an almost impossible task.`,
        author: 'The Infiltrator',
        role: 'Strategist',
        date: 'Feb 02, 2026',
        category: 'Tips',
      },
      post4: {
        title: 'How to identify the impostor using logic and patience',
        excerpt: 'Finding the impostor is not luck, but a rigorous process of behavioral analysis and logic.',
        content: `Finding the impostor among a group of friends is not a matter of luck or mystical intuition, but rather a rigorous process of logical analysis and strategic patience.

### Warning Signs
- **Time Pressure**: The impostor frequently tries to accelerate collective decisions to prevent contradictions from coming to light.
- **Verbal Contradictions**: Complex lies require greater cognitive effort, which creates cracks in the narrative when questioned.
- **Change of Discourse**: Observe if the suspect slightly changes their version of the facts as the net closes.

The first rule for efficient detection is to observe the flow of information and identify where stories begin to fragment. Patience allows you to collect sufficient data to build a solid case.`,
        author: 'Detective Orion',
        role: 'Data Analyst',
        date: 'Feb 01, 2026',
        category: 'Tips',
      },
      post5: {
        title: 'Why communication defines the winner of the match',
        excerpt: 'Knowing how to speak clearly and listen carefully are the decisive skills that separate winners from losers.',
        content: `Contrary to what many believe, the Impostor Game does not necessarily reward those who have the greatest ability to lie coldly, but rather those who master the art of interpersonal communication.

### The Power of Active Listening
The practice of active listening is a competitive advantage that allows you to perceive inconsistencies, changes in tone of voice, and micro-behavioral hesitations. When you communicate by focusing on the other person, you become able to capture nuances that would go unnoticed.

### Organization of Debate
Fragmented or chaotic communication favors the impostor, who uses noise to hide. By establishing an organized method of exchanging information, the space for lies decreases drastically. Victory belongs to those who orchestrate the collective narrative.`,
        author: 'Luna Star',
        role: 'Community Manager',
        date: 'Jan 31, 2026',
        category: 'News',
      },
      post6: {
        title: 'The psychological secret behind the genre\'s success',
        excerpt: 'Understand the concept of the "magic circle" and how it allows us to explore facets of our personality safely.',
        content: `Social deduction games operate in a fascinating psychological field where social norms are suspended to give way to play. They create the "magic circle", a safe space where lying and manipulation are encouraged by the mechanics of fun.

### Social Catharsis
This special permission releases emotions that we usually repress, providing a unique form of catharsis. The mental effort to sustain a lie while being watched stimulates deep areas of the brain, generating an intense and engaging experience.

### The Pleasure of Discovery
Feeling that you were able to see through a friend's mask or that you managed to fool everyone with a brilliant performance generates a very strong sense of personal accomplishment. It is this human depth that guarantees the success of the genre.`,
        author: 'Dr. Nexus',
        role: 'Gamified Psychologist',
        date: 'Jan 30, 2026',
        category: 'Community',
      },
      post7: {
        title: 'Cognitive Development: Exercising the mind in space',
        excerpt: 'Actively participating in rounds of the Impostor Game is an excellent exercise for quick decision-making and critical analysis.',
        content: `The player is never in a passive position; he needs to evaluate each piece of information received, compare it with previous facts, and decide whether to trust. This data filtering process is the basis of the scientific method applied to everyday life.

### Mental Benefits
- **Mindfulness**: Observing subtle details like changes in speech speed.
- **Short-term Memory**: Remember precisely who said what and at what moment.
- **Argumentation and Rhetoric**: Structure your thinking logically to convince others.

The Impostor Game transforms leisure into an academy for the brain, refining mental processes we use to solve complex problems every day.`,
        author: 'Prof. Galactic',
        role: 'Playful Education',
        date: 'Jan 29, 2026',
        category: 'News',
      },
      post8: {
        title: 'Common beginner mistakes and how to avoid them',
        excerpt: 'Don\'t fall into behavioral traps! Learn why talking too much can be your end in the game.',
        content: `Many novice players end up falling into traps that reveal their identity or make them easy targets. One of the most classic mistakes is believing that talking non-stop proves your innocence.

### What NOT to do
1. **Excessive Talking**: Excessive explanations generate immediate suspicion and provide material for contradictions.
2. **Hasty Accusations**: Pointing the finger too early without solid evidence can eliminate an ally or attract unwanted attention to you.
3. **Lack of Patience**: Changing your mind as soon as someone disagrees shows insecurity that impostors love to exploit.

The game is a psychological marathon, not a sprint. Developing peripheral vision and maintaining a mental record of others' speech are fundamental steps to evolve.`,
        author: 'Commander Nova',
        role: 'Flight Instructor',
        date: 'Jan 28, 2026',
        category: 'Tips',
      },
    },

    // Terms and Privacy
    legal: {
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      copyright: '© 2026 TikJogos. All rights reserved.',
      lastUpdated: 'Last updated',
    },

    // Errors
    errors: {
      notFound: 'Page not found',
      notFoundDesc: 'Sorry, the page you are looking for does not exist.',
      backHome: 'Back to Home',
      serverError: 'Server error',
      tryAgain: 'Try Again',
      loading: 'Loading...',
    },

    // Common Buttons
    buttons: {
      send: 'Send',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      copy: 'Copy',
      share: 'Share',
      play: 'Play',
      start: 'Start',
      exit: 'Exit',
    },

    // Validations
    validation: {
      required: 'This field is required',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      invalidEmail: 'Invalid email',
      invalidNumber: 'Invalid number',
      passwordMismatch: 'Passwords do not match',
    },

    // Modals and Alerts
    alerts: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      confirm: 'Are you sure?',
    },
  },

  es: {
    // Navegación y Menú
    nav: {
      home: 'Inicio',
      blog: 'Blog',
      howToPlay: 'Cómo Jugar',
      themes: 'Temas',
      createTheme: 'Crear Tema',
      donate: 'Donar',
      privacy: 'Privacidad',
      terms: 'Términos de Uso',
    },

    // Página de Inicio
    home: {
      title: 'TikJogos',
      subtitle: 'El Juego del Impostor Reinventado',
      description: 'Desconfianza, estrategia y diversión en un solo lugar. Juega con amigos y descubre quién es el impostor.',
      createRoom: 'Crear Sala',
      joinRoom: 'Unirse a Sala',
      playLocal: 'Modo Local',
      createTheme: 'Crear Tema',
      nickname: 'Ingresa tu apodo',
      roomCode: 'Código de sala',
      saveNickname: 'Recordar mi apodo',
      enterCode: 'Entrar',
    },

    // Modos de Juego
    gameModes: {
      title: 'Modos de Juego',
      description: 'Elige tu modo favorito y comienza a jugar',
      classic: {
        name: 'Modo Clásico',
        description: 'El juego tradicional con discusiones y votaciones',
      },
      rapid: {
        name: 'Modo Rápido',
        description: 'Partidas rápidas con menos rondas',
      },
      hardcore: {
        name: 'Modo Hardcore',
        description: 'Desafío máximo con reglas más estrictas',
      },
      custom: {
        name: 'Modo Personalizado',
        description: 'Crea tus propias reglas',
      },
    },

    // Cómo Jugar
    howToPlay: {
      title: 'Cómo Jugar',
      objective: 'Objetivo del Juego',
      objectiveDesc: 'Encuentra al (los) impostor(es) antes de que sabotee(n) al grupo.',
      roles: 'Roles',
      crewmate: 'Tripulante - Completa las tareas',
      impostor: 'Impostor - Sabotea y elimina',
      gameplay: 'Jugabilidad',
      gameplayDesc: 'Discusión, votación y eliminación de sospechosos.',
      tips: 'Consejos',
      tipObserve: 'Observa el comportamiento de los demás',
      tipCommunicate: 'Comunícate con tu equipo',
      tipVote: 'Vota con confianza pero con cuidado',
    },

    // Crear Tema
    createTheme: {
      title: 'Crear Tema',
      description: 'Crea tu propio tema personalizado para el juego',
      themeTitle: 'Título del Tema',
      authorName: 'Nombre del Autor',
      words: 'Palabras (mínimo 7)',
      addWord: 'Agregar Palabra',
      isPublic: 'Hacer Público',
      isPrivate: 'Privado',
      price: '€3,00',
      acceptTerms: 'Acepto los términos y condiciones',
      create: 'Crear Tema',
      paymentPending: 'Esperando Pago',
      scanQr: 'Escanea el Código QR',
      copying: 'Copiar PIX',
      copied: '¡Copiado!',
      success: '¡Tema creado exitosamente!',
      successCode: 'Código de Acceso',
      error: 'Error al crear tema',
      minWords: 'Se requiere mínimo 7 palabras',
      maxWords: 'Máximo 25 palabras',
    },

    // Donaciones
    donate: {
      title: 'Apoyar el Proyecto',
      description: 'Tu contribución ayuda a mantener TikJogos funcionando y en constante evolución.',
      thanks: '¡Gracias por apoyar!',
      donorName: 'Tu Nombre',
      message: 'Mensaje (opcional)',
      amount: 'Cantidad (€)',
      presets: ['€5', '€10', '€20', '€50'],
      customAmount: 'Cantidad Personalizada',
      donate: 'Hacer una Donación',
      paymentPending: 'Esperando Confirmación',
      scanQr: 'Escanea el Código QR con tu app del Banco',
      minAmount: 'La cantidad mínima es €1,00',
      maxAmount: 'La cantidad máxima es €1.000,00',
      success: '¡Donación recibida exitosamente!',
      error: 'Error al procesar donación',
    },

    // Blog
    blog: {
      title: 'Blog del Impostor',
      subtitle: 'Centro de Comando',
      description: 'Noticias galácticas, estrategias de sabotaje y actualizaciones directas del centro de comando de TikJogos.',
      readMore: 'Leer Más',
      readTime: 'min de lectura',
      published: 'Publicado en',
      author: 'Por',
      category: 'Categoría',
      noComments: 'Sin comentarios aún',
    },

    // Posts del Blog
    blogPosts: {
      post1: {
        title: 'El alma de los juegos sociales: ¿Por qué la desconfianza nos fascina?',
        excerpt: 'El Juego del Impostor se ha consolidado como un verdadero fenómeno cultural al transformar la desconfianza en una experiencia profunda.',
        content: `El Juego del Impostor se ha consolidado como un verdadero fenómeno cultural entre jugadores y diversos grupos de amigos al lograr transformar una premisa extremadamente simple en una experiencia psicológica profunda y muy intensa. A diferencia de la mayoría de los juegos tradicionales, donde el objetivo principal es competir contra reglas matemáticas fijas o mecánicas de reflejos rápidos, aquí los participantes son colocados para enfrentar directamente las mentes e intuiciones unos de otros.

Este cambio de paradigma quita el enfoque del tablero físico o la interfaz digital y lo transporta al campo de las interacciones humanas puras, donde cada palabra hablada tiene un peso estratégico fundamental para el éxito o fracaso del grupo. La gran fuerza impulsora que sostiene toda la dinámica de esta modalidad se basa en la desconfianza constante y la lectura del comportamiento.

### El Factor Humano como Variable
Cada respuesta ligeramente vaga, cada pausa inesperada al hablar y cada acusación lanzada sin base sólida crea una tensión palpable que mantiene a todos los jugadores en estado de máxima alerta durante toda la sesión. El juego logra mezclar magistralmente los elementos de observación cuidadosa, estrategia de manipulación e interacción social orgánica. No se trata solo de descubrir quién está mintiendo, sino de entender las motivaciones detrás de cada comportamiento.

### Narrativas Inéditas
Uno de los aspectos más fascinantes es que ninguna partida será jamás igual a otra, precisamente porque el factor humano es la variable que altera completamente el curso de los eventos. El mismo grupo de personas puede reunirse para jugar varias veces seguidas y, aun así, cada ronda será capaz de generar historias inéditas, llenas de giros dramáticos y momentos de pura sorpresa colectiva.`,
        author: 'Capitán Miller',
        role: 'Estratega Social',
        date: '04 Feb 2026',
        category: 'Comunidad',
      },
      post2: {
        title: 'TikJogos: Partidas más organizadas y estratégicas',
        excerpt: 'Descubre cómo TikJogos elimina la burocracia de los papeles y se enfoca en la pura diversión y deducción social.',
        content: `Cualquiera que haya intentado organizar una partida del Juego del Impostor de manera estrictamente tradicional sabe lo frustrante que puede ser la desorganización logística. El uso de papeles rotos y bolígrafos que fallan terminan rompiendo el ritmo necesario para mantener la inmersión psicológica.

En este contexto, TikJogos surge como una solución definitiva, funcionando como un verdadero árbitro digital que centraliza toda la información vital de la partida. La plataforma asume la responsabilidad de gestionar el tiempo, realizar sorteos de forma automatizada y distribuir funciones secretas sin margen para errores humanos.

### Pilares de la Experiencia
- **Sorteo Imparcial**: Garantiza que la elección de roles sea aleatoria y justa.
- **Secreto Absoluto**: Evita que miradas accidentales revelen la identidad del impostor.
- **Cronómetro Automático**: Mantiene la presión y el dinamismo de la ronda.

La facilidad de iniciar una nueva ronda con solo unos pocos clics permite que los grupos jueguen muchas más partidas en un período corto, aprovechando mejor los momentos de ocio. El enfoque cambia de la logística a las personas.`,
        author: 'Equipo Tech',
        role: 'Desarrolladores',
        date: '03 Feb 2026',
        category: 'Actualización',
      },
      post3: {
        title: 'Estrategias esenciales para quienes juegan como impostor',
        excerpt: 'Asumir el papel de villano requiere coherencia narrativa y control emocional. Aprende a dominar el arte del camuflaje.',
        content: `Asumir el papel de impostor requiere mucho más que solo la capacidad de inventar mentiras. El verdadero desafío radica en mantener una coherencia narrativa impecable durante todo el transcurso de la partida, mientras se controla el propio comportamiento no verbal.

### Consejos de Maestría
1. **Mantén tu Patrón**: No cambies drásticamente tu personalidad cuando recibas la función de villano. Si tiende a ser callado, mantente callado.
2. **Escucha Activa**: Escucha a los otros participantes antes de tomar una posición. A menudo, los inocentes crean teorías incorrectas que puedes usar a tu favor.
3. **Planta Semillas de Duda**: En lugar de atacar frontalmente, haz preguntas sutiles que lleven a otros a cuestionar la validez de la información presentada.

La victoria depende de la capacidad de plantar incertidumbre sin parecer su autor directo. Cuando dominas el arte de convertirte en parte del paisaje, descubrir tu identidad se vuelve una tarea casi imposible.`,
        author: 'El Infiltrado',
        role: 'Estratega',
        date: '02 Feb 2026',
        category: 'Consejos',
      },
      post4: {
        title: 'Cómo identificar al impostor usando lógica y paciencia',
        excerpt: 'Encontrar al impostor no es suerte, sino un proceso riguroso de análisis del comportamiento y lógica.',
        content: `Encontrar al impostor entre un grupo de amigos no es una cuestión de suerte o intuición mística, sino un proceso riguroso de análisis lógico y paciencia estratégica.

### Señales de Alerta
- **Presión del Tiempo**: El impostor frecuentemente intenta acelerar las decisiones colectivas para evitar que las contradicciones salgan a la luz.
- **Contradicciones Verbales**: Las mentiras complejas requieren mayor esfuerzo cognitivo, lo que genera grietas en la narrativa cuando se cuestionan.
- **Cambio de Discurso**: Observa si el sospechoso cambia ligeramente su versión de los hechos conforme se cierra la red.

La primera regla para una detección eficiente es observar el flujo de información e identificar dónde comienzan a fragmentarse las historias. La paciencia te permite recopilar datos suficientes para construir un caso sólido.`,
        author: 'Detective Orion',
        role: 'Analista de Datos',
        date: '01 Feb 2026',
        category: 'Consejos',
      },
      post5: {
        title: 'Por qué la comunicación define al ganador de la partida',
        excerpt: 'Saber hablar con claridad y escuchar con atención son las competencias decisivas que separan ganadores de perdedores.',
        content: `Contrario a lo que muchos creen, el Juego del Impostor no premia necesariamente a quién tiene la mayor habilidad para mentir en frío, sino a quién domina el arte de la comunicación interpersonal.

### El Poder de la Escucha Activa
La práctica de la escucha activa es una ventaja competitiva que permite percibir inconsistencias, cambios en el tono de voz y hesitaciones microcomportamentales. Cuando te comunicas enfocándote en el otro, te vuelves capaz de captar matices que pasarían desapercibidos.

### Organización del Debate
Una comunicación fragmentada o caótica favorece al impostor, que utiliza el ruido para esconderse. Al establecer un método organizado de intercambio de información, el espacio para mentiras disminuye drásticamente. La victoria pertenece a quienes orquestan la narrativa colectiva.`,
        author: 'Luna Star',
        role: 'Gerente de Comunidad',
        date: '31 Jan 2026',
        category: 'Noticias',
      },
      post6: {
        title: 'El secreto psicológico detrás del éxito del género',
        excerpt: 'Entiende el concepto del "círculo mágico" y cómo te permite explorar facetas de tu personalidad de manera segura.',
        content: `Los juegos de deducción social operan en un campo psicológico fascinante donde las normas sociales se suspenden para dar paso a lo lúdico. Crean el "círculo mágico", un espacio seguro donde mentir y manipular son incentivados por la mecánica de la diversión.

### Catarsis Social
Este permiso especial libera emociones que generalmente reprimimos, proporcionando una forma única de catarsis. El esfuerzo mental para sostener una mentira mientras se es observado estimula áreas profundas del cerebro, generando una experiencia intensa y envolvente.

### El Placer del Descubrimiento
Sentir que fuiste capaz de ver a través de la máscara de un amigo o que lograste engañar a todos con una actuación brillante genera un fuerte sentido de logro personal. Es esta profundidad humana la que garantiza el éxito del género.`,
        author: 'Dr. Nexus',
        role: 'Psicólogo Gamificado',
        date: '30 Jan 2026',
        category: 'Comunidad',
      },
      post7: {
        title: 'Desarrollo Cognitivo: Ejercitando la mente en el espacio',
        excerpt: 'Participar activamente en rondas del Juego del Impostor es un excelente ejercicio para la toma rápida de decisiones y análisis crítico.',
        content: `El jugador nunca está en una posición pasiva; debe evaluar cada pieza de información recibida, compararla con hechos anteriores y decidir si confiar. Este proceso de filtrado de datos es la base del método científico aplicado a la vida cotidiana.

### Beneficios Mentales
- **Atención Plena**: Observar detalles sutiles como cambios en la velocidad del habla.
- **Memoria a Corto Plazo**: Recordar con precisión quién dijo qué y en qué momento.
- **Argumentación y Retórica**: Estructurar el pensamiento de forma lógica para convencer a otros.

El Juego del Impostor transforma el ocio en una academia para el cerebro, refinando procesos mentales que utilizamos para resolver problemas complejos cada día.`,
        author: 'Profe Galáctica',
        role: 'Educación Lúdica',
        date: '29 Jan 2026',
        category: 'Noticias',
      },
      post8: {
        title: 'Errores comunes de principiantes y cómo evitarlos',
        excerpt: '¡No caigas en trampas de comportamiento! Descubre por qué hablar demasiado puede ser tu fin en el juego.',
        content: `Muchos jugadores novatos terminan cayendo en trampas que revelan su identidad o los hacen objetivos fáciles. Uno de los errores más clásicos es creer que hablar sin parar prueba tu inocencia.

### Qué NO hacer
1. **Hablar Excesivamente**: El exceso de explicaciones genera sospecha inmediata y proporciona material para contradicciones.
2. **Acusaciones Precipitadas**: Señalar con el dedo muy pronto sin evidencia sólida puede eliminar a un aliado o atraer atención no deseada hacia ti.
3. **Falta de Paciencia**: Cambiar de opinión tan pronto como alguien discrepa demuestra inseguridad que a los impostores les encanta explotar.

El juego es una maratón psicológica, no un sprint. Desarrollar visión periférica y mantener un registro mental del discurso de otros son pasos fundamentales para evolucionar.`,
        author: 'Comandante Nova',
        role: 'Instructora de Vuelo',
        date: '28 Jan 2026',
        category: 'Consejos',
      },
    },

    // Términos y Privacidad
    legal: {
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
      copyright: '© 2026 TikJogos. Todos los derechos reservados.',
      lastUpdated: 'Última actualización',
    },

    // Errores
    errors: {
      notFound: 'Página no encontrada',
      notFoundDesc: 'Lo sentimos, la página que buscas no existe.',
      backHome: 'Volver a Inicio',
      serverError: 'Error del servidor',
      tryAgain: 'Intentar de Nuevo',
      loading: 'Cargando...',
    },

    // Botones Comunes
    buttons: {
      send: 'Enviar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      copy: 'Copiar',
      share: 'Compartir',
      play: 'Jugar',
      start: 'Comenzar',
      exit: 'Salir',
    },

    // Validaciones
    validation: {
      required: 'Este campo es obligatorio',
      minLength: 'Mínimo {min} caracteres',
      maxLength: 'Máximo {max} caracteres',
      invalidEmail: 'Email inválido',
      invalidNumber: 'Número inválido',
      passwordMismatch: 'Las contraseñas no coinciden',
    },

    // Modales y Alertas
    alerts: {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      confirm: '¿Estás seguro?',
    },
  },
};

// Função para obter tradução
export function getTranslation(lang: Language, path: string): string {
  const keys = path.split('.');
  let value: any = translations[lang];

  for (const key of keys) {
    value = value?.[key];
  }

  return value ?? path;
}

// Hook para usar as traduções
export function useTranslation(lang: Language) {
  return (path: string, defaultValue?: string) => {
    const value = getTranslation(lang, path);
    return value || defaultValue || path;
  };
}
