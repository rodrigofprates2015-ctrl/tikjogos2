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
      <p class="mb-4">Mas o que torna essa dinâmica tão viciante? A resposta curta é que ele transforma seus amigos em enigmas. A proposta é simples na teoria, mas na prática exige uma atenção constante aos detalhes e ao comportamento de quem está ao seu redor.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A psicologia por trás da desconfiança</h2>
      <p class="mb-4">Diferente de jogos de tabuleiro tradicionais, onde a sorte nos dados define o vencedor, aqui o "tabuleiro" é a mente dos outros jogadores. Cada rodada cria um clima de desconfiança saudável. Você não está lutando contra o jogo; está lutando contra a capacidade de mentir (ou de dizer a verdade) dos seus companheiros.</p>
      <p class="mb-4">Qualquer atitude pode levantar suspeitas. Se alguém fica muito quieto, é suspeito. Se fala demais, é suspeito. Esse estado de alerta permanente é o que mantém todos os participantes envolvidos do início ao fim da partida. Ninguém fica esperando passivamente a sua vez de jogar; o jogo acontece em tempo real, na conversa e nos olhares.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Por que nenhuma partida é igual?</h2>
      <p class="mb-4">A rejogabilidade é um dos pontos fortes desse gênero. Você pode jogar com o mesmo grupo de pessoas dez vezes seguidas, e as dez partidas serão completamente diferentes.</p>
      <p class="mb-4">Isso acontece porque o fator humano faz com que nenhuma partida seja igual à outra. Em uma rodada, seu amigo tímido pode ser um impostor agressivo; na outra, ele pode ser um inocente injustiçado. Essa variabilidade torna o jogo sempre interessante e imprevisível.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Como funciona a dinâmica básica</h2>
      <p class="mb-4">Geralmente, o grupo recebe uma palavra secreta ou um tema, exceto uma pessoa: o impostor. O objetivo dele é se misturar e fingir que sabe do que todos estão falando. Já o objetivo do grupo é identificar quem é o intruso antes que seja tarde demais.</p>
      <p class="mb-4">O ciclo do jogo envolve:</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Recebimento de informações: Todos leem suas dicas, menos o impostor.</li>
        <li class="mb-2">Rodada de discussão: Perguntas e respostas vagas para testar o conhecimento alheio.</li>
        <li class="mb-2">Votação: O momento da verdade onde as alianças se rompem.</li>
      </ul>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">O segredo do sucesso viral</h2>
      <p class="mb-4">Nos últimos anos, vimos uma explosão desses jogos (como Among Us ou Spyfall). O motivo é a conexão. Em um mundo cada vez mais digital, o Jogo do Impostor força a interação humana direta, a leitura de linguagem corporal e o debate. É uma experiência social completa.</p>
      <p class="mb-4">No fim das contas, ganhar ou perder é detalhe. O que faz sucesso mesmo é a história que o grupo cria junto: aquela mentira descarada que colou ou a acusação perfeita que desmascarou o vilão no último segundo.</p>
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
      <p class="mb-4">Quem joga o Jogo do Impostor "analogicamente" (usando papel e caneta ou apenas a conversa) sabe que a bagunça é quase inevitável. Sorteios manuais demoram, alguém sempre vê o papel do outro sem querer, e cronometrar as rodadas vira uma tarefa chata.</p>
      <p class="mb-4">Foi para resolver esses atritos que o TikJogos surgiu. A plataforma funciona como uma solução prática para organizar partidas do Jogo do Impostor, eliminando a burocracia para que vocês possam ir direto ao que interessa.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Centralizando a bagunça</h3>
      <p class="mb-4">O principal problema de grupos grandes é o fluxo de informação. "De quem é a vez?", "Quanto tempo falta?", "Quem já votou?". O TikJogos centraliza essas informações e ajuda a manter o controle do andamento do jogo.</p>
      <p class="mb-4">Ao usar a ferramenta como "juiz" e organizador, você tira o peso das costas dos participantes. Ninguém precisa ficar de fora para moderar a partida; o sistema faz isso por vocês.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Adeus às falhas técnicas</h3>
      <p class="mb-4">Não há nada pior do que uma partida arruinada porque alguém esqueceu de contar o tempo ou se confundiu na ordem de fala. Com a ferramenta digital, os jogadores evitam confusões comuns, como falhas na contagem de tempo ou na definição de turnos.</p>
      <p class="mb-4">Vantagens de digitalizar a partida:</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Sorteio imparcial: O algoritmo define o impostor, garantindo aleatoriedade real.</li>
        <li class="mb-2">Sigilo: Cada um vê sua palavra/função na própria tela, sem risco de "espiar".</li>
        <li class="mb-2">Timer automático: A pressão do tempo é real e igual para todos.</li>
      </ul>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Foco total na estratégia</h3>
      <p class="mb-4">Quando a logística deixa de ser um problema, a qualidade do jogo sobe. A automação permite que o grupo foque no mais importante: a estratégia, a comunicação e a diversão durante a partida.</p>
      <p class="mb-4">Em vez de discutir regras ou quem é o próximo, vocês gastam saliva defendendo sua inocência ou montando armadilhas lógicas para pegar o mentiroso. O TikJogos atua nos bastidores para que a "guerra social" brilhe no palco principal.</p>
      <p class="mb-4">Experimente rodar a próxima partida com o auxílio do site e perceba como o ritmo fica mais dinâmico. É a tecnologia trabalhando a favor da resenha.</p>
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
      <p class="mb-4">Tirar a carta (ou receber o aviso na tela) de que você é o Impostor gera um pico de adrenalina imediato. Para alguns, é pânico; para outros, é a glória. Mas, independentemente de como você se sente, sobreviver exige técnica.</p>
      <p class="mb-4">Ser impostor exige mais do que simplesmente mentir. Mentir é fácil; difícil é construir uma realidade alternativa que faça sentido para os outros jogadores enquanto você não tem a menor ideia do que está acontecendo.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A Regra de Ouro: Coerência</h3>
      <p class="mb-4">O maior erro dos novatos é tentar ser criativo demais. É fundamental manter um comportamento coerente durante toda a partida. Se você costuma falar pouco quando é inocente, não comece a falar pelos cotovelos agora. Se você é agressivo nas acusações normalmente, manter-se passivo vai acender um alerta na cabeça dos seus amigos.</p>
      <p class="mb-4">Tente replicar seu "estado natural" de jogo. A coerência é o melhor camuflagem.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Cuidado com o exagero</h3>
      <p class="mb-4">Quando não sabemos o tema da rodada, a tendência é dar respostas muito genéricas ou, no desespero, inventar detalhes complexos. Cuidado. Ações exageradas ou explicações longas demais costumam chamar atenção e gerar desconfiança.</p>
      <p class="mb-4">Quem diz a verdade geralmente é direto. Quem mente precisa "enfeitar" a história para torná-la credível. O grupo percebe esse esforço extra. Prefira ser vago, mas seguro, do que específico e errado.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Use os outros a seu favor</h3>
      <p class="mb-4">Você não tem a informação, mas os outros têm. Observar o comportamento dos outros jogadores ajuda a escolher o melhor momento para agir ou acusar alguém.</p>
      <p class="mb-4">Deixe que os inocentes falem primeiro. Muitas vezes, um inocente confuso dá uma dica que você pode "roubar" e usar como se fosse sua. Ou, melhor ainda, dois inocentes podem começar a brigar entre si. Quando isso acontece, o melhor que o impostor pode fazer é pegar a pipoca e assistir — ou sutilmente colocar lenha na fogueira para desviar o foco de si mesmo.</p>
      <p class="mb-4">Jogar de impostor é a arte de se esconder à vista de todos. Mantenha a calma, respire fundo e lembre-se: você só precisa convencer a maioria, não todo mundo.</p>
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
      <p class="mb-4">Todo grupo tem aquele jogador que se acha o Sherlock Holmes, mas acaba acusando a pessoa errada na primeira rodada. Não seja essa pessoa. Encontrar o impostor não é um jogo de adivinhação, é um jogo de paciência e análise fria.</p>
      <p class="mb-4">Identificar o impostor exige paciência e atenção, pois o mentiroso raramente se entrega com um erro gritante logo de cara. O segredo está nos detalhes sutis que a maioria deixa passar enquanto está preocupada demais pensando na própria defesa.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O perigo da pressa</h3>
      <p class="mb-4">Você já notou que, assim que a rodada começa, alguém sempre tenta atropelar a discussão? Fique alerta. Jogadores apressados ou que mudam versões com frequência podem estar escondendo algo.</p>
      <p class="mb-4">O impostor sente o tempo correr de forma diferente. Para ele, cada segundo de silêncio é uma tortura, então a tendência natural é tentar preencher o vazio ou desviar o foco rapidamente. Se alguém está tentando acelerar uma votação sem provas ou muda de argumento a cada nova informação que surge, ligue o radar. A pressa é inimiga da inocência.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A caça às contradições</h3>
      <p class="mb-4">A verdade é fácil de lembrar porque ela é um fato. A mentira é uma construção mental que precisa ser sustentada. Por isso, pequenas contradições costumam aparecer com o tempo.</p>
      <p class="mb-4">Preste atenção na memória: O jogador disse no começo que "sabia o que era o objeto", mas agora diz que "achava que era outra coisa"?</p>
      <p class="mb-4">Vagueza excessiva: O impostor muitas vezes concorda com o grupo, mas não adiciona nada novo. Ele repete o que o último falou com outras palavras.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Visão panorâmica do jogo</h3>
      <p class="mb-4">Um erro clássico é focar em um único suspeito e ignorar o resto da mesa. Analisar o contexto geral da partida ajuda a evitar acusações injustas e erros estratégicos.</p>
      <p class="mb-4">Às vezes, um inocente está apenas nervoso ou é naturalmente confuso. Se você focar apenas nele ("tunnel vision"), o verdadeiro impostor vai aproveitar sua distração para manipular o resto do grupo contra o alvo fácil. Olhe para quem está quieto, para quem está rindo demais e para quem está concordando com tudo. O contexto diz mais do que as palavras.</p>
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
      <p class="mb-4">Muitas pessoas acham que o Jogo do Impostor é sobre quem mente melhor. Na verdade, ele é sobre quem se comunica melhor. A oratória e a capacidade de persuasão são as armas mais letais nessa arena.</p>
      <p class="mb-4">A comunicação é uma das principais ferramentas do jogo, e saber se expressar com clareza faz toda a diferença entre ser eliminado injustamente ou liderar seu time à vitória. Não adianta ter a dedução correta na sua cabeça se você não consegue traduzi-la em palavras que convençam os outros.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A arte de ouvir (Escuta Ativa)</h3>
      <p class="mb-4">Em uma mesa barulhenta, quem ouve tem vantagem. Ouvir os argumentos dos outros jogadores é tão importante quanto defender o próprio ponto de vista.</p>
      <p class="mb-4">Muitas vezes, o impostor se entrega não pelo que ele fala, mas pelo que ele deixa de falar ou como ele reage ao que foi dito. Se você estiver ocupado demais pensando na sua próxima frase, vai perder a falha no discurso do oponente.</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Escute o tom de voz: ele tremeu?</li>
        <li class="mb-2">Escute a coerência: a história bate com a rodada anterior?</li>
        <li class="mb-2">Escute o silêncio: quem parou de falar quando o assunto ficou quente?</li>
      </ul>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Construindo pontes e alianças</h3>
      <p class="mb-4">Ninguém ganha esse jogo sozinho (a menos que seja um impostor muito sortudo). Para os inocentes, a união faz a força. Um diálogo bem construído aumenta a confiança do grupo e influencia diretamente o resultado da partida.</p>
      <p class="mb-4">Quando você se comunica de forma clara, sem agressividade desnecessária, você se torna uma âncora de confiança. As pessoas tendem a seguir quem parece racional e calmo. Se a comunicação do grupo for caótica, com todos gritando, o impostor vence pelo cansaço. Se o diálogo for organizado, o impostor fica sem espaço para se esconder.</p>
      <p class="mb-4">Lembre-se: no TikJogos ou na sala de casa, a palavra é sua ferramenta. Use-a com sabedoria.</p>
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
      <p class="mb-4">Existe algo paradoxal nos seres humanos: nós somos ensinados desde crianças que mentir é errado e que devemos confiar nos nossos amigos. No entanto, alguns dos momentos mais divertidos da vida adulta envolvem sentar ao redor de uma mesa, olhar nos olhos dos nossos melhores amigos e mentir descaradamente — ou acusá-los de traição.</p>
      <p class="mb-4">Jogos de dedução social (como o Jogo do Impostor, Lobisomem, Mafia e Among Us) explodiram em popularidade na última década. Mas por que gostamos tanto de ser enganados ou de enganar? A resposta está na complexidade da nossa mente e na nossa necessidade de interação.</p>
      <p class="mb-4">Jogos de dedução social colocam o jogador em situações desafiadoras e imprevisíveis, criando um laboratório seguro para testar habilidades que raramente usamos no cotidiano.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">O "Círculo Mágico" da Mentira</h2>
      <p class="mb-4">Na teoria dos jogos, existe o conceito de "círculo mágico": um espaço onde as regras do mundo real são suspensas e novas regras passam a valer. No mundo real, mentir destrói a confiança. Dentro do jogo, mentir é a mecânica principal.</p>
      <p class="mb-4">Essa inversão de valores é liberadora. O jogo permite que você experimente a adrenalina da transgressão sem as consequências morais reais. Quando você é o impostor, seu cérebro entra em um estado de hipervigilância.</p>
      <p class="mb-4">Eles estimulam o raciocínio lógico e a leitura de comportamentos humanos de uma forma que poucos outros passatempos conseguem. Você precisa processar múltiplas camadas de informação simultaneamente:</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">A informação do jogo: Qual é a palavra secreta?</li>
        <li class="mb-2">A informação social: Quem está olhando para quem? Quem riu nervoso?</li>
        <li class="mb-2">A sua própria performance: Estou parecendo culpado?</li>
      </ul>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Um treino para o cérebro (Raciocínio Lógico)</h2>
      <p class="mb-4">Não se engane achando que é "apenas uma brincadeira". O esforço cognitivo para manter uma mentira coerente é muito maior do que para dizer a verdade. O impostor precisa construir uma realidade paralela, lembrar-se do que disse há dois minutos e adaptar essa história conforme novas perguntas surgem.</p>
      <p class="mb-4">Para os inocentes, o desafio é puramente dedutivo. É um quebra-cabeça vivo. Diferente de um Sudoku, onde os números são estáticos, aqui as "peças" do quebra-cabeça (os outros jogadores) estão ativamente tentando te confundir.</p>
      <p class="mb-4">Esse tipo de jogo cria experiências intensas e memoráveis, mesmo em partidas rápidas. A intensidade vem da aposta social. Você está apostando sua reputação de "bom leitor de pessoas" contra a capacidade de atuação do seu amigo.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A Química da Emoção</h2>
      <p class="mb-4">Por que essas partidas são tão memoráveis? A ciência explica. Quando jogamos, experimentamos picos de dopamina (recompensa) e cortisol (estresse/atenção).</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">O suspense: A incerteza constante mantém o cérebro engajado.</li>
        <li class="mb-2">A revelação: O momento em que o impostor é revelado gera uma descarga emocional forte — seja o alívio de ter acertado ou o choque de ter sido enganado.</li>
        <li class="mb-2">O vínculo: Ironicamente, a desconfiança do jogo gera união fora dele. As histórias de "como eu te enganei naquela rodada" viram lendas internas do grupo de amigos por anos.</li>
      </ul>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">Imprevisibilidade: O fator replay infinito</h2>
      <p class="mb-4">Videogames com histórias lineares têm fim. Um livro tem uma última página. Mas jogos baseados em interação humana são inesgotáveis. O jogo muda dependendo de quem está jogando, do humor das pessoas naquele dia e até do nível de cansaço do grupo.</p>
      <p class="mb-4">As situações desafiadoras e imprevisíveis garantem que não exista uma "fórmula mágica" para vencer. O que funcionou ontem com seu primo pode não funcionar hoje com seu colega de trabalho. Isso exige que o jogador esteja em constante adaptação.</p>
      <p class="mb-4">Em resumo, esses jogos são envolventes porque são, essencialmente, sobre nós. Eles despem as formalidades sociais e nos deixam brincar com a natureza humana em sua forma mais crua: a comunicação, a persuasão e a intuição. É um teste de caráter onde, felizmente, todos podem rir no final.</p>
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
      <p class="mb-4">Muitas vezes, encaramos jogos de festa apenas como uma forma de passar o tempo e dar risada. Mas você já parou para pensar no "suor mental" que acontece durante uma partida do Jogo do Impostor? Por trás da diversão, existe um verdadeiro exercício cognitivo acontecendo.</p>
      <p class="mb-4">Durante o jogo, o participante precisa analisar informações limitadas e tomar decisões rápidas. Diferente de um problema de matemática onde todos os dados estão na mesa, aqui os dados estão ocultos, distorcidos ou incompletos. Isso força seu cérebro a trabalhar em dobro.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Decisão sob pressão</h3>
      <p class="mb-4">No mundo corporativo ou acadêmico, raramente temos todas as variáveis antes de fazer uma escolha. No Jogo do Impostor, essa realidade é simulada em cada rodada. Você tem poucos segundos para decidir se confia na pessoa ao seu lado ou se lança uma acusação que pode eliminar um inocente.</p>
      <p class="mb-4">Esse processo de análise rápida fortalece o pensamento crítico e a capacidade de avaliação. Você aprende a separar o que é fato (o que foi dito) do que é suposição (como foi dito). Essa habilidade de filtrar ruídos é valiosa tanto na mesa de jogo quanto na vida real.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O treino da atenção plena</h3>
      <p class="mb-4">Outro ponto crucial é o foco. Em um mundo cheio de distrações, manter a atenção contínua em uma conversa é difícil. No entanto, perder uma frase no Jogo do Impostor pode ser fatal.</p>
      <p class="mb-4">Com o tempo, o jogador desenvolve mais atenção aos detalhes e coerência lógica. Você começa a notar padrões:</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Aquela pausa estranha antes de responder.</li>
        <li class="mb-2">A contradição entre a rodada 1 e a rodada 3.</li>
        <li class="mb-2">O olhar desviado.</li>
      </ul>
      <p class="mb-4">Esses detalhes, que passariam despercebidos no cotidiano, tornam-se pistas vitais. O jogo ensina seu cérebro a estar "ligado" e a buscar coerência onde parece haver caos.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Raciocínio dedutivo vs. indutivo</h3>
      <p class="mb-4">Para os inocentes, o jogo é um exercício de lógica dedutiva: "Se A é verdade, então B não pode ser o impostor". Para o impostor, é um exercício de criatividade e lógica indutiva: "Como eu crio uma regra geral que justifique meu comportamento específico?".</p>
      <p class="mb-4">Ambos os lados estão exercitando a mente. Portanto, na próxima vez que alguém disser que você está "perdendo tempo" jogando, lembre-se: você está apenas levando seu cérebro para a academia.</p>
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
      <p class="mb-4">Encontrar uma atividade que agrade a gregos e troianos é uma das tarefas mais difíceis em reuniões sociais. O primo gamer quer algo complexo, a tia quer apenas conversar, e os amigos querem beber e rir. É nesse cenário caótico que o Jogo do Impostor brilha.</p>
      <p class="mb-4">O Jogo do Impostor é ideal para grupos variados, incluindo amigos e familiares, justamente porque ele nivela o campo de jogo. Não exige reflexos rápidos de videogame nem conhecimento enciclopédico de trivia. Ele exige apenas interação humana.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Acessibilidade é a chave</h3>
      <p class="mb-4">Quantas vezes você tentou explicar um jogo de tabuleiro novo e metade da mesa desistiu na metade das regras? A barreira de entrada costuma ser o vilão da diversão em grupo.</p>
      <p class="mb-4">Aqui, as regras simples permitem que qualquer pessoa participe, mesmo sem experiência prévia. Se você sabe conversar e sabe mentir (ou tentar não mentir), você sabe jogar. Isso permite que gerações diferentes joguem juntas: o avô pode ser tão bom impostor quanto o neto adolescente, pois a mecânica base é social, não técnica.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Quebrando o gelo</h3>
      <p class="mb-4">Em festas onde nem todos se conhecem bem, o silêncio constrangedor pode ser um problema. O jogo atua como um lubrificante social perfeito.</p>
      <p class="mb-4">O resultado são momentos leves, engraçados e cheios de interação social. A acusação absurda que alguém faz no calor do momento vira piada interna pelo resto da noite. A defesa apaixonada de um inocente que acaba sendo eliminado gera risadas e pedidos de desculpas.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Competitividade saudável</h3>
      <p class="mb-4">Diferente de jogos cooperativos onde o "líder" do grupo acaba jogando por todos, ou jogos competitivos agressivos que geram brigas reais (estamos olhando para você, Banco Imobiliário), o Jogo do Impostor mantém a leveza.</p>
      <p class="mb-4">A tensão existe, mas ela é resolvida rapidamente a cada rodada curta. Ninguém fica eliminado por horas esperando o jogo acabar. O ciclo rápido de partidas mantém a energia da sala alta e garante que todos tenham a chance de ser o vilão ou o herói da vez. É a receita perfeita para transformar uma noite monótona em um evento memorável.</p>
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
      <p class="mb-4">Ninguém nasce um mestre da manipulação (felizmente). Como em qualquer habilidade, as primeiras partidas de Jogo do Impostor costumam ser um desastre cômico. Mas observar onde os novatos escorregam é a melhor forma de encurtar sua curva de aprendizado.</p>
      <p class="mb-4">Jogadores iniciantes costumam falar demais ou acusar sem provas concretas. Vamos dissecar esses e outros deslizes clássicos para que você não precise cometê-los.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O erro do "Tagarela"</h3>
      <p class="mb-4">Existe um mito de que, se você falar muito, vai parecer que está contribuindo e, portanto, é inocente. Errado. O impostor iniciante muitas vezes sente o silêncio como uma ameaça e tenta preenchê-lo com palavras vazias. Ele explica demais o porquê da sua dica, justifica demais suas ações.</p>
      <p class="mb-4">Para os observadores experientes, esse excesso de explicação é um sinal de culpa. Quem diz a verdade geralmente é sucinto. Quem mente precisa construir um cenário. Falar demais apenas te dá mais chances de se contradizer.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O erro do "Acusador Precoce"</h3>
      <p class="mb-4">Do outro lado da moeda, temos o inocente ansioso. Ele ouve uma frase meio dúbia e imediatamente grita: "É ELE!". Esses comportamentos facilitam a identificação e reduzem as chances de vitória. Por quê?</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Se você é inocente: Acusar sem provas cria caos e pode eliminar um aliado, ajudando o impostor.</li>
        <li class="mb-2">Se você é impostor: Acusar agressivamente chama a atenção para você. Se o acusado provar inocência, você é o próximo na reta.</li>
      </ul>
      <p class="mb-4">A paciência é uma virtude estratégica aqui. Guarde suas suspeitas até ter um padrão de comportamento, não apenas um palpite isolado.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O medo de errar</h3>
      <p class="mb-4">Muitos iniciantes travam porque têm medo de parecerem "bobos" ou de serem eliminados cedo. Mas perder faz parte. Aprender com os erros faz parte do processo de evolução dentro do jogo.</p>
      <p class="mb-4">Se você foi pego mentindo, analise: o que te entregou? Foi o tom de voz? Foi a dica desconexa? Se você acusou errado, o que te enganou? A manipulação do outro ou sua própria pressa? Cada derrota te torna um jogador mais perigoso para a próxima rodada. Então, abrace os erros iniciais — eles são o preço da sua futura maestria.</p>
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
      <p class="mb-4">Todo mundo já jogou aquela partida frustrante onde o impostor ganhou em trinta segundos ou, pior, onde os inocentes descobriram tudo na primeira pergunta. O segredo para evitar isso não é sorte, é matemática e ajuste de regras.</p>
      <p class="mb-4">Partidas equilibradas dependem de regras bem definidas desde o início. Antes de começar, o grupo precisa concordar com o "tom" do jogo: vale mentir sobre coisas fora do jogo? Vale gritar? Estabelecer esses limites evita que a partida vire uma anarquia.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A matemática do caos (Quantos Impostores?)</h3>
      <p class="mb-4">O ponto mais crítico para o equilíbrio é a proporção. Ajustar o número de impostores ao tamanho do grupo é essencial.</p>
      <ul class="list-disc list-inside mb-4 ml-4">
        <li class="mb-2">Grupos pequenos (3-5 pessoas): 1 impostor é o limite. Mais que isso torna o jogo impossível para os inocentes.</li>
        <li class="mb-2">Grupos médios (6-9 pessoas): Aqui você pode começar a arriscar com 2 impostores, o que cria uma dinâmica interessante onde um impostor pode sacrificar o outro para ganhar confiança.</li>
        <li class="mb-2">Grupos grandes (10+): É necessário aumentar o número de vilões para que o jogo não dure uma eternidade.</li>
      </ul>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">O papel do moderador (ou da tecnologia)</h3>
      <p class="mb-4">Em jogos manuais, o moderador tem o poder de equilibrar o jogo, dando dicas extras se os inocentes estiverem perdidos. Porém, isso pode gerar acusações de favoritismo. Ao usar ferramentas digitais como o TikJogos, esse cuidado garante partidas mais justas e emocionantes para todos. O algoritmo não tem favoritos. Ele distribui as funções de forma imparcial, garantindo que o equilíbrio técnico seja mantido, deixando para os humanos apenas a tarefa de jogar e se divertir.</p>
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
      <p class="mb-4">Houve um tempo em que "jogar socialmente" exigia uma logística complexa: marcar uma data com semanas de antecedência, limpar a mesa da sala de jantar, organizar dezenas de peças, cartas e dados, e torcer para ninguém derrubar refrigerante no tabuleiro.</p>
      <p class="mb-4">Os jogos sociais sempre foram pilares da interação humana, mas com o avanço da internet, os jogos sociais ganharam novas possibilidades. O que antes era restrito ao espaço físico da sua sala de estar, agora rompe fronteiras geográficas. Mas essa transição não aconteceu da noite para o dia; ela é fruto de uma evolução tecnológica e comportamental.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A Era da Conexão Discada e os Primeiros Passos</h2>
      <p class="mb-4">No início da internet, jogos online eram experiências solitárias ou extremamente nichadas (MMORPGs complexos). O "social" era limitado a chats de texto frios. Faltava o elemento humano: a risada, o tom de voz, a linguagem corporal. Com a chegada da banda larga e, posteriormente, das chamadas de voz, jogos sociais online começaram a fazer sentido.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">A Revolução Mobile</h2>
      <p class="mb-4">A verdadeira explosão veio com os smartphones. O tabuleiro está agora no bolso de todo mundo, disponível para uma partida rápida no intervalo do trabalho ou na fila do banco.</p>
      <p class="mb-4">A tecnologia simplificou a organização de partidas, tornando possível jogar com grupos de qualquer tamanho, em qualquer lugar. Aplicativos como o TikJogos surgiram justamente para preencher essa lacuna: oferecer a experiência de jogos de dedução social sem a necessidade de componentes físicos ou moderadores humanos.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">O fim da bagunça logística</h2>
      <p class="mb-4">A digitalização resolveu a fricção do jogo. Plataformas modernas automatizam sorteios, distribuem informações secretas a cada jogador e controlam o tempo de cada fase. Isso permite que o grupo se concentre 100% na estratégia e na diversão.</p>
      <p class="mb-4">A acessibilidade aumentou exponencialmente: não é mais preciso ser um "gamer" para participar. Basta ter um celular e disposição para interagir.</p>
      <h2 class="text-2xl font-bold text-white mb-4 mt-8">O futuro: realidade virtual e além</h2>
      <p class="mb-4">O próximo passo natural é a imersão total. Imagine jogar o Jogo do Impostor em realidade virtual, onde você consegue ver a linguagem corporal (mesmo que virtual) dos outros jogadores, detectar hesitações nos gestos e sentir a tensão de uma sala de verdade.</p>
      <p class="mb-4">A tecnologia segue evoluindo para aproximar pessoas, e os jogos sociais continuam sendo uma das formas mais puras de conexão humana — seja ao redor de uma mesa ou através de uma tela.</p>
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
      <p class="mb-4">Você pode jogar com o mesmo grupo dezenas de vezes. Mas cada rodada traz novas surpresas: o jogador que sempre mente dessa vez resolve falar a verdade; o amigo calmo explode em uma acusação dramática; alguém que nunca ganhou de impostor finalmente engana todo mundo.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Imprevisibilidade das decisões</h3>
      <p class="mb-4">Em jogos sociais, a melhor jogada depende de quem está ouvindo. As camadas de meta-jogo garantem o frescor da experiência.</p>
      <p class="mb-4">Se na última partida você foi muito agressivo e perdeu, talvez na próxima você tente ser mais discreto. Mas seus amigos também lembram da partida anterior — e agora desconfiam do seu silêncio. Esse ciclo de adaptação constante impede que qualquer estratégia funcione para sempre.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">A influência do contexto</h3>
      <p class="mb-4">O humor do grupo, o horário do dia, até mesmo o nível de cansaço afetam como as pessoas jogam. Uma partida às 3 da manhã, quando todos estão exaustos, será completamente diferente de uma partida animada no início de uma festa.</p>
      <p class="mb-4">Essa sensibilidade ao contexto humano é algo que nenhum videogame tradicional consegue replicar. É o que faz dos jogos de dedução social uma experiência verdadeiramente viva.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Histórias que ficam</h3>
      <p class="mb-4">No final, o que torna o jogo inesquecível são as histórias. Aquela vez que você convenceu todo mundo de que era inocente com uma atuação digna de Oscar. Ou quando você acusou errado seu melhor amigo e ele te olhou traído por uma semana.</p>
      <p class="mb-4">Essas memórias se tornam parte da cultura do grupo. E é por isso que, mesmo depois de centenas de partidas, todos ainda querem jogar mais uma rodada.</p>
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
      <p class="mb-4">Quando todos os olhares se voltam para você e alguém aponta o dedo, seu corpo reage instintivamente: o coração acelera, as mãos suam, a voz treme. Mesmo sendo completamente inocente, essa reação física pode te condenar.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Respire antes de responder</h3>
      <p class="mb-4">O primeiro impulso é se defender imediatamente, às vezes até interrompendo o acusador. Resista. Responder com objetividade transmite confiança. Deixe a pessoa terminar de falar e só então apresente sua defesa.</p>
      <p class="mb-4">Essa pausa de alguns segundos faz maravilhas: mostra que você está no controle, que não está desesperado, e te dá tempo para formular uma resposta lógica em vez de emocional.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Clareza é sua melhor defesa</h3>
      <p class="mb-4">Argumentos lógicos vencem argumentos emocionais no calor da discussão. Em vez de gritar "NÃO FUI EU!", tente algo como: "Na rodada 2, eu dei a dica X, que está diretamente relacionada ao tema. Se eu fosse impostor, como eu saberia disso?".</p>
      <p class="mb-4">Esse tipo de defesa factual força seus acusadores a reconsiderar. Emoção gera mais emoção; lógica gera dúvida.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Não contra-ataque imediatamente</h3>
      <p class="mb-4">Outro erro comum é imediatamente acusar de volta a pessoa que te acusou. Isso parece desespero. Se você realmente é inocente, foque em provar sua inocência primeiro. Só depois, com calma, você pode sugerir outros suspeitos — mas baseado em evidências, não em vingança.</p>
      <p class="mb-4">Lembre-se: mesmo que você perca essa rodada, a forma como você lida com a pressão define como os outros te verão nas próximas partidas. Jogadores que mantêm a compostura são sempre mais respeitados — e mais perigosos.</p>
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
      <p class="mb-4">Empresas e instituições de ensino têm descoberto o poder dos jogos de dedução social como ferramenta de team building. Em um ambiente onde normalmente existem barreiras hierárquicas ou sociais, o jogo cria um campo neutro.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Quebrando barreiras corporativas</h3>
      <p class="mb-4">Em uma reunião de trabalho, o estagiário raramente questiona o diretor. Mas durante uma partida do Jogo do Impostor, ele não só pode como deve — se as evidências apontarem para isso. Essa inversão temporária de dinâmicas cria laços inesperados.</p>
      <p class="mb-4">Depois de algumas rodadas rindo juntos, aquela barreira invisível entre departamentos ou níveis hierárquicos começa a diminuir. As pessoas passam a se ver como indivíduos, não apenas como cargos.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Soft Skills na prática</h3>
      <p class="mb-4">Mais do que diversão, o jogo estimula a comunicação clara, empatia e o trabalho em equipe para vencer o inimigo comum.</p>
      <p class="mb-4">Escuta ativa, argumentação, leitura de linguagem corporal, gestão de conflitos — todas essas habilidades são exercitadas em cada partida. É treinamento de soft skills disfarçado de diversão.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Aplicação em sala de aula</h3>
      <p class="mb-4">Professores também têm usado jogos de dedução para ensinar conceitos de lógica, ética e comunicação. O formato lúdico engaja estudantes que normalmente teriam dificuldade com aulas expositivas tradicionais.</p>
      <p class="mb-4">A próxima vez que sua empresa ou escola planejar um evento de integração, considere trocar a palestra motivacional por algumas rodadas de impostor. Os resultados podem surpreender.</p>
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
      <p class="mb-4">Quantas vezes você quis jogar com amigos, mas alguém não tinha o aplicativo certo, ou ninguém queria ser o moderador, ou simplesmente dava muito trabalho organizar tudo? O TikJogos foi criado exatamente para eliminar essas barreiras.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Sem downloads complicados</h3>
      <p class="mb-4">A plataforma funciona diretamente no navegador. Basta compartilhar um link e todos podem entrar na sala. Sem necessidade de criar contas, baixar aplicativos ou configurar nada.</p>
      <p class="mb-4">Essa simplicidade é proposital: queremos que o tempo entre "vamos jogar?" e "o jogo começou!" seja o menor possível.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Fluidez é tudo</h3>
      <p class="mb-4">A automação do site torna as partidas mais agradáveis. Menos tempo gerenciando burocracia, mais tempo se divertindo com amigos.</p>
      <p class="mb-4">O sistema cuida do sorteio de quem será impostor, distribui as palavras secretas, controla o tempo de cada fase e gerencia as votações. Você só precisa se preocupar em jogar.</p>
      <h3 class="text-xl font-semibold text-indigo-300 mb-2">Para todas as ocasiões</h3>
      <p class="mb-4">Seja uma festa de aniversário, uma reunião de família no Natal, um happy hour com colegas de trabalho ou uma chamada de vídeo com amigos distantes — o TikJogos se adapta.</p>
      <p class="mb-4">A experiência foi pensada para ser inclusiva. Não importa se você é um gamer experiente ou nunca jogou nada digital na vida: a curva de aprendizado é praticamente zero.</p>
      <p class="mb-4">Experimente uma partida e descubra por que tantos grupos estão trocando os jogos de tabuleiro tradicionais por essa alternativa moderna, prática e igualmente divertida.</p>
    `
  }
];

const seedThemes = [
  {
    titulo: "Futebol",
    autor: "Maylon",
    palavras: [
      "Gol", "Pênalti", "Escanteio", "Impedimento", "Cartão", "Juiz", "Árbitro",
      "Torcida", "Estádio", "Campo", "Bola", "Chuteira", "Uniforme", "Goleiro",
      "Zagueiro", "Lateral", "Volante", "Meia", "Atacante", "Centroavante",
      "Craque", "Drible", "Falta", "Barreira", "Cobrança", "Cabeçada", "Voleio",
      "Defesa", "Rebatida", "Trave", "Rede", "Placar", "Vitória", "Empate",
      "Derrota", "Campeonato", "Copa", "Liga", "Clássico", "Derby"
    ],
    isPublic: true,
    accessCode: "FUTEBOL",
    paymentStatus: "approved",
    approved: true
  },
  {
    titulo: "Disney",
    autor: "@Luciana",
    palavras: [
      "Mickey", "Minnie", "Donald", "Pateta", "Pluto", "Cinderela", "Branca de Neve",
      "Bela", "Fera", "Aladdin", "Jasmine", "Ariel", "Elsa", "Anna", "Olaf",
      "Simba", "Nala", "Timon", "Pumba", "Woody", "Buzz", "Nemo", "Dory",
      "Moana", "Maui", "Rapunzel", "Flynn", "Mulan", "Pocahontas", "Hércules",
      "Megara", "Tarzan", "Jane", "Peter Pan", "Sininho", "Capitão Gancho",
      "Dumbo", "Bambi", "Pinóquio", "Gepeto", "Jiminy", "Cruella", "Malévola",
      "Ursula", "Jafar", "Scar", "Hades", "Gaston", "Rainha Má"
    ],
    isPublic: true,
    accessCode: "DISNEY",
    paymentStatus: "approved",
    approved: true
  }
];

async function seed() {
  console.log("Seeding " + seedPosts.length + " blog posts...");
  for (const postData of seedPosts) {
    const existing = await storage.getPostBySlug(postData.slug);
    if (!existing) {
      await storage.createPost(postData);
      console.log("Created post: " + postData.title);
    } else {
      console.log("Skipping existing post: " + postData.slug);
    }
  }
  
  console.log("\nSeeding " + seedThemes.length + " featured themes...");
  for (const themeData of seedThemes) {
    const existing = await storage.getThemeByAccessCode(themeData.accessCode);
    if (!existing) {
      await storage.createTheme(themeData);
      console.log("Created theme: " + themeData.titulo + " (" + themeData.accessCode + ")");
    } else {
      console.log("Skipping existing theme: " + themeData.titulo);
    }
  }
  
  console.log("\nSeeding complete!");
}

seed().catch(console.error);
