import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, BookOpen, CheckCircle2, CircleHelp, Gamepad2, Lightbulb, Play, Rocket, Trophy } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { BottomAd, SideAds } from "@/components/AdSense";
import { setPageSeo } from "@/lib/pageSeo";
import bombaLogo from "@/assets/bomba-logo.png";

type Lang = "pt" | "en" | "es";
type GuideKey = "bomba" | "rankify" | "aproximacao";

type Guide = {
  name: string;
  badge: string;
  intro: string;
  logo: string;
  logoAlt: string;
  accent: string;
  accentSoft: string;
  gameHref: string;
  canonical: Record<Lang, string>;
  seoTitle: Record<Lang, string>;
  seoDescription: Record<Lang, string>;
  objective: Record<Lang, string>;
  steps: Record<Lang, Array<{ title: string; description: string }>>;
  rules: Record<Lang, Array<{ title: string; description: string }>>;
  example: Record<Lang, { title: string; lines: string[]; result: string }>;
  tips: Record<Lang, string[]>;
  faqs: Record<Lang, Array<{ question: string; answer: string }>>;
};

const UI = {
  pt: { back: "Todos os guias", objective: "Objetivo do jogo", start: "Como começar", rules: "Como funciona", example: "Exemplo de rodada", tips: "Dicas para jogar melhor", faq: "Dúvidas frequentes", play: "Jogar agora" },
  en: { back: "All guides", objective: "Game objective", start: "How to start", rules: "How it works", example: "Round example", tips: "Tips to play better", faq: "Frequently asked questions", play: "Play now" },
  es: { back: "Todas las guías", objective: "Objetivo del juego", start: "Cómo comenzar", rules: "Cómo funciona", example: "Ejemplo de ronda", tips: "Consejos para jugar mejor", faq: "Preguntas frecuentes", play: "Jugar ahora" },
};

const GUIDES: Record<GuideKey, Guide> = {
  bomba: {
    name: "Bomba",
    badge: "Guia do Bomba",
    intro: "Escolha uma letra, responda dentro do tema e passe a vez antes que o tempo acabe.",
    logo: bombaLogo,
    logoAlt: "Logo do jogo Bomba",
    accent: "#ff244d",
    accentSoft: "rgba(255,36,77,.12)",
    gameHref: "/bomba",
    canonical: { pt: "/como-jogar/bomba", en: "/en/how-to-play/bomba", es: "/es/como-jugar/bomba" },
    seoTitle: { pt: "Como Jogar Bomba Online", en: "How to Play Bomba Online", es: "Cómo Jugar Bomba Online" },
    seoDescription: {
      pt: "Aprenda como jogar Bomba no TikJogos: escolha letras, responda ao tema antes do cronômetro e evite ser eliminado.",
      en: "Learn how to play Bomba on TikJogos: choose letters, answer the theme before time runs out and avoid elimination.",
      es: "Aprende a jugar Bomba en TikJogos: elige letras, responde al tema antes de que se acabe el tiempo y evita ser eliminado.",
    },
    objective: {
      pt: "Responder palavras válidas antes do cronômetro zerar. Cada letra usada sai do tabuleiro; se a bomba explodir na sua vez, você é eliminado da rodada.",
      en: "Give valid answers before the timer reaches zero. Each used letter leaves the board; if the bomb explodes on your turn, you are eliminated from the round.",
      es: "Dar respuestas válidas antes de que el cronómetro llegue a cero. Cada letra usada sale del tablero; si la bomba explota en tu turno, quedas eliminado de la ronda.",
    },
    steps: {
      pt: [{ title: "Crie ou entre", description: "Na Home, digite seu apelido e crie uma sala ou entre com o código dos amigos." }, { title: "Ajuste a partida", description: "O líder escolhe o tempo por jogador e pode vetar letras." }, { title: "Comece a rodada", description: "Um tema é sorteado e o primeiro jogador recebe a bomba." }],
      en: [{ title: "Create or join", description: "On the Home page, enter your nickname and create a room or join with your friends' code." }, { title: "Set up the match", description: "The host chooses the time per player and may ban letters." }, { title: "Start the round", description: "A theme is drawn and the first player receives the bomb." }],
      es: [{ title: "Crea o entra", description: "En la página de inicio, escribe tu apodo y crea una sala o entra con el código de tus amigos." }, { title: "Configura la partida", description: "El líder elige el tiempo por jugador y puede vetar letras." }, { title: "Comienza la ronda", description: "Se sortea un tema y el primer jugador recibe la bomba." }],
    },
    rules: {
      pt: [{ title: "Escolha uma letra", description: "Na sua vez, toque em uma letra disponível. Depois de escolhê-la, você precisa responder com ela." }, { title: "Dê uma resposta", description: "Digite uma palavra que comece com a letra selecionada e pertença ao tema sorteado." }, { title: "Passe a vez", description: "Quando a resposta é aceita, a letra é eliminada, o próximo jogador recebe a vez e o tempo reinicia." }, { title: "Evite a explosão", description: "Se o tempo acabar antes da resposta, a bomba explode e o jogador da vez é eliminado. O grupo vence se completar o alfabeto." }],
      en: [{ title: "Choose a letter", description: "On your turn, tap an available letter. Once selected, you must answer with it." }, { title: "Give an answer", description: "Type a word that starts with the selected letter and fits the drawn theme." }, { title: "Pass the turn", description: "When accepted, the letter is removed, the next player takes the turn and the timer resets." }, { title: "Avoid the explosion", description: "If time runs out, the bomb explodes and the current player is eliminated. The group wins by completing the alphabet." }],
      es: [{ title: "Elige una letra", description: "En tu turno, toca una letra disponible. Después de elegirla, debes responder con ella." }, { title: "Da una respuesta", description: "Escribe una palabra que empiece con la letra seleccionada y corresponda al tema sorteado." }, { title: "Pasa el turno", description: "Al aceptar la respuesta, la letra se elimina, juega la siguiente persona y el tiempo se reinicia." }, { title: "Evita la explosión", description: "Si se acaba el tiempo, la bomba explota y el jugador actual queda eliminado. El grupo gana al completar el alfabeto." }],
    },
    example: {
      pt: { title: "Tema sorteado: Bebidas", lines: ["Ana escolhe C e responde Café.", "A letra C é eliminada e a vez passa para Bruno.", "Bruno escolhe S e responde Suco antes do tempo acabar."], result: "Se Bruno não responder a tempo, a bomba explode nele e ele é eliminado da rodada." },
      en: { title: "Drawn theme: Drinks", lines: ["Ana chooses C and answers Coffee.", "The letter C is removed and Bruno takes the turn.", "Bruno chooses J and answers Juice before time runs out."], result: "If Bruno does not answer in time, the bomb explodes on him and he is eliminated from the round." },
      es: { title: "Tema sorteado: Bebidas", lines: ["Ana elige C y responde Café.", "La letra C se elimina y el turno pasa a Bruno.", "Bruno elige J y responde Jugo antes de que se acabe el tiempo."], result: "Si Bruno no responde a tiempo, la bomba explota sobre él y queda eliminado de la ronda." },
    },
    tips: {
      pt: ["Pense em duas ou três respostas enquanto os outros jogam.", "Escolha a letra apenas quando já tiver uma palavra em mente.", "Use o modo local quando todos estiverem no mesmo lugar."],
      en: ["Think of two or three answers while the others play.", "Choose a letter only when you already have a word in mind.", "Use local mode when everyone is together."],
      es: ["Piensa en dos o tres respuestas mientras juegan los demás.", "Elige una letra solo cuando ya tengas una palabra en mente.", "Usa el modo local cuando todos estén juntos."],
    },
    faqs: {
      pt: [{ question: "Posso trocar de letra depois de escolher?", answer: "Não. A letra fica travada até você enviar uma resposta válida ou o tempo acabar." }, { question: "Existe modo local?", answer: "Sim. No modo local, os jogadores usam o mesmo aparelho e dizem as palavras em voz alta." }],
      en: [{ question: "Can I change letters after choosing?", answer: "No. The letter stays locked until you submit a valid answer or time runs out." }, { question: "Is there a local mode?", answer: "Yes. In local mode, players share one device and say the words aloud." }],
      es: [{ question: "¿Puedo cambiar de letra después de elegir?", answer: "No. La letra queda bloqueada hasta que envíes una respuesta válida o se acabe el tiempo." }, { question: "¿Hay modo local?", answer: "Sí. En el modo local, los jugadores comparten un dispositivo y dicen las palabras en voz alta." }],
    },
  },
  rankify: {
    name: "Rankify",
    badge: "Guia do Rankify",
    intro: "Ordene os itens de cada desafio e descubra quem chega mais perto do ranking correto.",
    logo: "/rankify-logo.png",
    logoAlt: "Logo do jogo Rankify",
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,.12)",
    gameHref: "/rankmaster",
    canonical: { pt: "/como-jogar/rankify", en: "/en/how-to-play/rankify", es: "/es/como-jugar/rankify" },
    seoTitle: { pt: "Como Jogar Rankify Online", en: "How to Play Rankify Online", es: "Cómo Jugar Rankify Online" },
    seoDescription: { pt: "Aprenda como jogar Rankify no TikJogos: organize o ranking, compare com o gabarito e marque mais pontos que seus amigos.", en: "Learn how to play Rankify on TikJogos: order the ranking, compare it with the answer and score more points than your friends.", es: "Aprende a jugar Rankify en TikJogos: ordena el ranking, compáralo con la respuesta y suma más puntos que tus amigos." },
    objective: { pt: "Colocar os itens na ordem correta, do primeiro ao último lugar. Quanto mais próxima sua lista estiver do gabarito, melhor será seu resultado.", en: "Place the items in the correct order, from first to last. The closer your list is to the answer key, the better your result.", es: "Colocar los elementos en el orden correcto, del primero al último. Cuanto más cerca esté tu lista de la respuesta, mejor será tu resultado." },
    steps: {
      pt: [{ title: "Entre em uma sala", description: "Digite seu apelido, crie uma sala ou use o código enviado pelo líder." }, { title: "Defina o formato", description: "O líder escolhe Top 5 ou Top 10, número de rodadas e tema." }, { title: "Receba o desafio", description: "Todos recebem os mesmos itens em uma ordem embaralhada." }],
      en: [{ title: "Join a room", description: "Enter your nickname, create a room or use the code sent by the host." }, { title: "Choose the format", description: "The host selects Top 5 or Top 10, number of rounds and theme." }, { title: "Get the challenge", description: "Everyone receives the same items in a shuffled order." }],
      es: [{ title: "Entra en una sala", description: "Escribe tu apodo, crea una sala o usa el código enviado por el líder." }, { title: "Elige el formato", description: "El líder selecciona Top 5 o Top 10, número de rondas y tema." }, { title: "Recibe el desafío", description: "Todos reciben los mismos elementos en orden aleatorio." }],
    },
    rules: {
      pt: [{ title: "Monte seu ranking", description: "Arraste os itens até a posição que considera correta, do 1º ao último lugar." }, { title: "Confirme a ordem", description: "Quando estiver satisfeito, envie sua lista. Depois de confirmar, ela não pode ser alterada." }, { title: "Veja o gabarito", description: "Quando todos terminarem, o líder revela a classificação correta item por item." }, { title: "Some pontos", description: "Quem tiver a menor diferença em relação ao gabarito vence a rodada e recebe 100 pontos." }],
      en: [{ title: "Build your ranking", description: "Drag the items into the order you believe is correct, from first to last." }, { title: "Confirm the order", description: "Submit your list when ready. It cannot be changed after confirmation." }, { title: "See the answer", description: "When everyone finishes, the host reveals the correct ranking item by item." }, { title: "Score points", description: "The player with the smallest difference from the answer wins the round and earns 100 points." }],
      es: [{ title: "Crea tu ranking", description: "Arrastra los elementos al orden que consideres correcto, del primero al último." }, { title: "Confirma el orden", description: "Envía tu lista cuando esté lista. Después de confirmar no se puede cambiar." }, { title: "Mira la respuesta", description: "Cuando todos terminen, el líder revela la clasificación correcta elemento por elemento." }, { title: "Suma puntos", description: "Quien tenga la menor diferencia respecto a la respuesta gana la ronda y recibe 100 puntos." }],
    },
    example: { pt: { title: "Desafio: Países mais populosos", lines: ["Você arrasta os países para formar seu Top 5.", "Todos confirmam suas listas.", "O gabarito revela a posição correta de cada país."], result: "A lista com menos posições erradas vence a rodada e soma 100 pontos." }, en: { title: "Challenge: Most populated countries", lines: ["You drag the countries to build your Top 5.", "Everyone confirms their lists.", "The answer reveals each country's correct position."], result: "The list with the smallest ranking difference wins the round and scores 100 points." }, es: { title: "Desafío: Países más poblados", lines: ["Arrastras los países para crear tu Top 5.", "Todos confirman sus listas.", "La respuesta revela la posición correcta de cada país."], result: "La lista con menor diferencia gana la ronda y suma 100 puntos." } },
    tips: { pt: ["Comece posicionando os itens que você tem certeza.", "Compare grandezas antes de decidir posições vizinhas.", "Revise toda a lista antes de confirmar."], en: ["Start by placing the items you are sure about.", "Compare values before deciding neighboring positions.", "Review the whole list before confirming."], es: ["Empieza colocando los elementos de los que estás seguro.", "Compara magnitudes antes de decidir posiciones vecinas.", "Revisa toda la lista antes de confirmar."] },
    faqs: { pt: [{ question: "Preciso saber tudo de memória?", answer: "Não. Parte da diversão é estimar, discutir depois e se surpreender com o gabarito." }, { question: "O que acontece em um empate?", answer: "Jogadores com o mesmo melhor resultado dividem a vitória da rodada e recebem os pontos." }], en: [{ question: "Do I need to know everything by heart?", answer: "No. Estimating, discussing afterward and being surprised by the answer is part of the fun." }, { question: "What happens in a tie?", answer: "Players with the same best result share the round win and receive the points." }], es: [{ question: "¿Necesito saber todo de memoria?", answer: "No. Estimar, conversar después y sorprenderse con la respuesta es parte de la diversión." }, { question: "¿Qué pasa en un empate?", answer: "Los jugadores con el mismo mejor resultado comparten la victoria y reciben los puntos." }] },
  },
  aproximacao: {
    name: "Jogo da Aproximação",
    badge: "Guia da Aproximação",
    intro: "Dê o melhor palpite, chegue perto da resposta correta e proteja seus corações.",
    logo: "/aproximacao-logo.webp",
    logoAlt: "Logo do Jogo da Aproximação",
    accent: "#06b6d4",
    accentSoft: "rgba(6,182,212,.12)",
    gameHref: "/aproximacao",
    canonical: { pt: "/como-jogar/aproximacao", en: "/en/how-to-play/approximation", es: "/es/como-jugar/aproximacion" },
    seoTitle: { pt: "Como Jogar o Jogo da Aproximação", en: "How to Play the Approximation Game", es: "Cómo Jugar el Juego de Aproximación" },
    seoDescription: { pt: "Aprenda como jogar o Jogo da Aproximação: envie palpites, ganhe corações ao chegar mais perto e evite a eliminação.", en: "Learn how to play the Approximation Game: submit guesses, earn hearts by getting closest and avoid elimination.", es: "Aprende a jugar el Juego de Aproximación: envía estimaciones, gana corazones al acercarte y evita la eliminación." },
    objective: { pt: "Chegar o mais perto possível da resposta numérica correta. Todos começam com 3 corações; quem chega mais perto ganha um e quem fica mais distante perde um.", en: "Get as close as possible to the correct numerical answer. Everyone starts with 3 hearts; the closest player gains one and the farthest loses one.", es: "Acercarse lo máximo posible a la respuesta numérica correcta. Todos empiezan con 3 corazones; quien más se acerca gana uno y quien queda más lejos pierde uno." },
    steps: { pt: [{ title: "Crie ou entre", description: "Use seu apelido para criar uma sala ou entrar com o código dos amigos." }, { title: "Reúna os jogadores", description: "Cada participante começa a partida com 3 corações." }, { title: "Inicie o desafio", description: "O líder começa e uma pergunta numérica aparece para todos." }], en: [{ title: "Create or join", description: "Use your nickname to create a room or join with your friends' code." }, { title: "Gather players", description: "Each participant starts the match with 3 hearts." }, { title: "Start the challenge", description: "The host begins and a numerical question appears for everyone." }], es: [{ title: "Crea o entra", description: "Usa tu apodo para crear una sala o entrar con el código de tus amigos." }, { title: "Reúne jugadores", description: "Cada participante comienza la partida con 3 corazones." }, { title: "Comienza el desafío", description: "El líder inicia y aparece una pregunta numérica para todos." }] },
    rules: { pt: [{ title: "Leia a pergunta", description: "A rodada apresenta uma pergunta cuja resposta é um número." }, { title: "Envie seu palpite", description: "Cada jogador digita uma estimativa sem ver os palpites dos outros." }, { title: "Compare as distâncias", description: "Depois da revelação, o jogo calcula quem ficou mais perto e quem ficou mais longe da resposta." }, { title: "Proteja seus corações", description: "O mais próximo ganha um coração, o mais distante perde um e quem chega a zero é eliminado." }], en: [{ title: "Read the question", description: "The round presents a question whose answer is a number." }, { title: "Submit your guess", description: "Each player enters an estimate without seeing the other guesses." }, { title: "Compare distances", description: "After the reveal, the game calculates who was closest and farthest from the answer." }, { title: "Protect your hearts", description: "The closest gains a heart, the farthest loses one and anyone at zero is eliminated." }], es: [{ title: "Lee la pregunta", description: "La ronda presenta una pregunta cuya respuesta es un número." }, { title: "Envía tu estimación", description: "Cada jugador escribe una estimación sin ver las de los demás." }, { title: "Compara distancias", description: "Después de revelar, el juego calcula quién quedó más cerca y más lejos de la respuesta." }, { title: "Protege tus corazones", description: "El más cercano gana un corazón, el más lejano pierde uno y quien llega a cero queda eliminado." }] },
    example: { pt: { title: "Pergunta: Quantos quilômetros tem a Linha do Equador?", lines: ["Ana responde 35.000 km.", "Bruno responde 40.000 km.", "Caio responde 52.000 km."], result: "A resposta é cerca de 40.075 km: Bruno ganha um coração e Caio, o mais distante, perde um." }, en: { title: "Question: How long is the Equator?", lines: ["Ana answers 35,000 km.", "Bruno answers 40,000 km.", "Caio answers 52,000 km."], result: "The answer is about 40,075 km: Bruno gains a heart and Caio, the farthest, loses one." }, es: { title: "Pregunta: ¿Cuántos kilómetros mide el ecuador?", lines: ["Ana responde 35.000 km.", "Bruno responde 40.000 km.", "Caio responde 52.000 km."], result: "La respuesta es cerca de 40.075 km: Bruno gana un corazón y Caio, el más lejano, pierde uno." } },
    tips: { pt: ["Observe a unidade pedida antes de responder.", "Use referências conhecidas para construir uma estimativa.", "Evite palpites extremos quando não tiver certeza."], en: ["Check the requested unit before answering.", "Use familiar references to build an estimate.", "Avoid extreme guesses when you are unsure."], es: ["Comprueba la unidad solicitada antes de responder.", "Usa referencias conocidas para crear una estimación.", "Evita estimaciones extremas cuando no estés seguro."] },
    faqs: { pt: [{ question: "Quantos corações cada jogador tem?", answer: "Todos começam com 3 corações. O total pode aumentar ao vencer rodadas." }, { question: "Quando alguém é eliminado?", answer: "Quando perde o último coração. A pessoa acompanha o restante até a partida terminar." }], en: [{ question: "How many hearts does each player have?", answer: "Everyone starts with 3 hearts. The total can increase by winning rounds." }, { question: "When is someone eliminated?", answer: "When they lose their last heart. They can watch the rest of the match." }], es: [{ question: "¿Cuántos corazones tiene cada jugador?", answer: "Todos comienzan con 3 corazones. El total puede aumentar al ganar rondas." }, { question: "¿Cuándo queda eliminado alguien?", answer: "Cuando pierde su último corazón. Puede mirar el resto de la partida." }] },
  },
};

function getLanguage(path: string): Lang {
  if (path.startsWith("/en/")) return "en";
  if (path.startsWith("/es/")) return "es";
  return "pt";
}

export default function ComoJogarOutros({ game }: { game: GuideKey }) {
  const [path] = useLocation();
  const lang = getLanguage(path);
  const guide = GUIDES[game];
  const ui = UI[lang];
  const localizedIntro = lang === "pt" ? guide.intro : guide.seoDescription[lang];
  const hubHref = lang === "en" ? "/en/how-to-play" : lang === "es" ? "/es/como-jugar" : "/comojogar";

  useEffect(() => {
    setPageSeo({
      title: `${guide.seoTitle[lang]} | TikJogos`,
      description: guide.seoDescription[lang],
      canonical: `https://tikjogos.com.br${guide.canonical[lang]}`,
    });
    window.scrollTo(0, 0);
  }, [guide, lang]);

  return (
    <div className="min-h-screen bg-[#1a1b2e] text-white">
      <MobileNav />
      <SideAds />
      <BottomAd />
      <main className="mx-auto w-full max-w-4xl space-y-12 px-4 py-10 md:py-16">
        <Link href={hubHref} className="inline-flex items-center gap-2 font-bold text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> {ui.back}
        </Link>

        <header className="space-y-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[.18em]" style={{ borderColor: `${guide.accent}66`, color: guide.accent, background: guide.accentSoft }}>
            <BookOpen className="h-4 w-4" /> {lang === "pt" ? guide.badge : lang === "en" ? `${guide.name} guide` : `Guía de ${guide.name}`}
          </span>
          <h1 className="text-4xl font-black md:text-6xl">{guide.seoTitle[lang]}</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">{localizedIntro}</p>
          <img src={guide.logo} alt={guide.logoAlt} className="mx-auto h-24 max-w-[280px] object-contain md:h-28" />
        </header>

        <section className="rounded-3xl border border-[#343854] bg-[#242642] p-6 md:p-8">
          <h2 className="mb-3 flex items-center gap-3 text-2xl font-black"><Trophy style={{ color: guide.accent }} /> {ui.objective}</h2>
          <p className="leading-relaxed text-slate-300">{guide.objective[lang]}</p>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-3 text-2xl font-black"><Rocket style={{ color: guide.accent }} /> {ui.start}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {guide.steps[lang].map((step, index) => <article key={step.title} className="rounded-2xl border border-[#343854] bg-[#242642] p-5"><span className="text-3xl font-black" style={{ color: guide.accent }}>{index + 1}</span><h3 className="mt-2 font-black">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p></article>)}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-3 text-2xl font-black"><Gamepad2 style={{ color: guide.accent }} /> {ui.rules}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {guide.rules[lang].map((rule, index) => <article key={rule.title} className="rounded-2xl border p-5" style={{ borderColor: `${guide.accent}44`, background: guide.accentSoft }}><div className="mb-3 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl font-black text-[#111427]" style={{ background: guide.accent }}>{index + 1}</span><h3 className="font-black">{rule.title}</h3></div><p className="text-sm leading-relaxed text-slate-300">{rule.description}</p></article>)}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-3 text-2xl font-black"><CheckCircle2 style={{ color: guide.accent }} /> {ui.example}</h2>
          <div className="overflow-hidden rounded-3xl border border-[#343854] bg-[#242642]">
            <h3 className="bg-[#111427] px-6 py-4 font-black" style={{ color: guide.accent }}>{guide.example[lang].title}</h3>
            <ol className="space-y-3 p-6">{guide.example[lang].lines.map((line, index) => <li key={line} className="flex gap-3 text-slate-300"><span className="font-black" style={{ color: guide.accent }}>{index + 1}.</span>{line}</li>)}</ol>
            <p className="border-t border-[#343854] px-6 py-4 font-bold text-white">{guide.example[lang].result}</p>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-3 text-2xl font-black"><Lightbulb className="text-yellow-400" /> {ui.tips}</h2>
          <div className="grid gap-4 md:grid-cols-3">{guide.tips[lang].map(tip => <p key={tip} className="rounded-2xl border border-[#343854] bg-[#242642] p-5 text-sm leading-relaxed text-slate-300">{tip}</p>)}</div>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-3 text-2xl font-black"><CircleHelp style={{ color: guide.accent }} /> {ui.faq}</h2>
          <div className="space-y-3">{guide.faqs[lang].map(faq => <article key={faq.question} className="rounded-2xl border border-[#343854] bg-[#242642] p-5"><h3 className="font-black">{faq.question}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{faq.answer}</p></article>)}</div>
        </section>

        <div className="flex justify-center pb-8"><Link href={guide.gameHref} className="inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-xl font-black text-[#111427] shadow-2xl transition-transform hover:-translate-y-1" style={{ background: guide.accent }}><Play className="h-6 w-6 fill-current" /> {ui.play}</Link></div>
      </main>
    </div>
  );
}
