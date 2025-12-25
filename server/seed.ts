import { storage } from "../server/storage";
import { insertPostSchema } from "@shared/schema";

const seedPosts = [
  {
    title: "O que é o Jogo do Impostor e por que ele faz tanto sucesso?",
    slug: "o-que-e-o-jogo-do-impostor",
    category: "Conteúdo Pilar",
    excerpt: "Descubra a psicologia por trás da desconfiança e por que essa dinâmica de dedução social conquistou milhões de jogadores.",
    featured: true,
    author: "Equipe TikJogos",
    content: `Se você já participou de uma reunião de amigos onde a tensão se misturava com risadas nervosas, provavelmente estava jogando algo relacionado à dedução social. O Jogo do Impostor conquistou milhões de jogadores justamente por essa combinação única: ele une estratégia mental, observação afiada e muita interação social.

Mas o que torna essa dinâmica tão viciante? A resposta curta é que ele transforma seus amigos em enigmas. A proposta é simples na teoria, mas na prática exige uma atenção constante aos detalhes e ao comportamento de quem está ao seu redor.

### A psicologia por trás da desconfiança
Diferente de jogos de tabuleiro tradicionais, onde a sorte nos dados define o vencedor, aqui o "tabuleiro" é a mente dos outros jogadores. Cada rodada cria um clima de desconfiança saudável. Você não está lutando contra o jogo; está lutando contra a capacidade de mentir (ou de dizer a verdade) dos seus companheiros.

Qualquer atitude pode levantar suspeitas. Se alguém fica muito quieto, é suspeito. Se fala demais, é suspeito. Esse estado de alerta permanente é o que mantém todos os participantes envolvidos do início ao fim da partida. Ninguém fica esperando passivamente a sua vez de jogar; o jogo acontece em tempo real, na conversa e nos olhares.

### Por que nenhuma partida é igual?
A rejogabilidade é um dos pontos fortes desse gênero. Você pode jogar com o mesmo grupo de pessoas dez vezes seguidas, e as dez partidas serão completamente diferentes.

Isso acontece porque o fator humano faz com que nenhuma partida seja igual à outra. Em uma rodada, seu amigo tímido pode ser um impostor agressivo; na outra, ele pode ser um inocente injustiçado. Essa variabilidade torna o jogo sempre interessante e imprevisível.

### Como funciona a dinâmica básica
Geralmente, o grupo recebe uma palavra secreta ou um tema, exceto uma pessoa: o impostor. O objetivo dele é se misturar e fingir que sabe do que todos estão falando. Já o objetivo do grupo é identificar quem é o intruso antes que seja tarde demais.

O ciclo do jogo envolve:
1. **Recebimento de informações:** Todos leem suas dicas, menos o impostor.
2. **Rodada de discussão:** Perguntas e respostas vagas para testar o conhecimento alheio.
3. **Votação:** O momento da verdade onde as alianças se rompem.

### O segredo do sucesso viral
Nos últimos anos, vimos uma explosão desses jogos (como Among Us ou Spyfall). O motivo é a conexão. Em um mundo cada vez mais digital, o Jogo do Impostor força a interação humana direta, a leitura de linguagem corporal e o debate. É uma experiência social completa.

No fim das contas, ganhar ou perder é detalhe. O que faz sucesso mesmo é a história que o grupo cria junto: aquela mentira descarada que colou ou a acusação perfeita que desmascarou o vilão no último segundo.`
  },
  {
    title: "Como usar o TikJogos para partidas mais organizadas",
    slug: "como-usar-o-tikjogos",
    category: "Tutorial",
    excerpt: "Elimine a bagunça de sorteios manuais e cronometros com a plataforma TikJogos.",
    featured: false,
    author: "Equipe TikJogos",
    content: `Quem joga o Jogo do Impostor "analogicamente" (usando papel e caneta ou apenas a conversa) sabe que a bagunça é quase inevitável. Sorteios manuais demoram, alguém sempre vê o papel do outro sem querer, e cronometrar as rodadas vira uma tarefa chata.

Foi para resolver esses atritos que o TikJogos surgiu. A plataforma funciona como uma solução prática para organizar partidas do Jogo do Impostor, eliminando a burocracia para que vocês possam ir direto ao que interessa.

### Centralizando a bagunça
O principal problema de grupos grandes é o fluxo de informação. "De quem é a vez?", "Quanto tempo falta?", "Quem já votou?". O TikJogos centraliza essas informações e ajuda a manter o controle do andamento do jogo.

Ao usar a ferramenta como "juiz" e organizador, você tira o peso das costas dos participantes. Ninguém precisa ficar de fora para moderar a partida; o sistema faz isso por vocês.

### Adeus às falhas técnicas
Não há nada pior do que uma partida arruinada porque alguém esqueceu de contar o tempo ou se confundiu na ordem de fala. Com a ferramenta digital, os jogadores evitam confusões comuns, como falhas na contagem de tempo ou na definição de turnos.

**Vantagens de digitalizar a partida:**
- **Sorteio imparcial:** O algoritmo define o impostor, garantindo aleatoriedade real.
- **Sigilo:** Cada um vê sua palavra/função na própria tela, sem risco de "espiar".
- **Timer automático:** A pressão do tempo é real e igual para todos.

### Foco total na estratégia
Quando a logística deixa de ser um problema, a qualidade do jogo sobe. A automação permite que o grupo foque no mais importante: a estratégia, a comunicação e a diversão durante a partida.

Em vez de discutir regras ou quem é o próximo, vocês gastam saliva defendendo sua inocência ou montando armadilhas lógicas para pegar o mentiroso. O TikJogos atua nos bastidores para que a "guerra social" brilhe no palco principal.`
  }
];

async function seed() {
  console.log("Seeding blog posts...");
  for (const postData of seedPosts) {
    const existing = await storage.getPostBySlug(postData.slug);
    if (!existing) {
      await storage.createPost(postData);
      console.log(`Created post: ${postData.title}`);
    }
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
