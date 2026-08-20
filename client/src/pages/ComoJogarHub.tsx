import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Bomb, Gamepad2, Pencil, Sparkles, Target, Trophy } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { BottomAd, SideAds } from "@/components/AdSense";
import { useLanguage } from "@/hooks/useLanguage";
import { setPageSeo } from "@/lib/pageSeo";

const COPY = {
  pt: {
    badge: "Central de guias",
    title: "Como jogar no TikJogos",
    description: "Escolha um jogo e aprenda as regras, o objetivo da partida e as melhores dicas antes de começar.",
    open: "Ver como jogar",
    seoTitle: "Como Jogar no TikJogos: Regras de Todos os Jogos",
    seoDescription: "Veja como jogar todos os jogos do TikJogos: Impostor, Desenho, Bomba, Cronômetro, Sincronia, Rankify, Aproximação e Desafio da Palavra.",
  },
  en: {
    badge: "Guide center",
    title: "How to play on TikJogos",
    description: "Choose a game and learn its rules, match objective and best tips before you start.",
    open: "View guide",
    seoTitle: "How to Play on TikJogos: Rules for Every Game",
    seoDescription: "Learn how to play every TikJogos game: Impostor, Drawing, Bomba, Timer, Sincronia, Rankify, Approximation and Word Challenge.",
  },
  es: {
    badge: "Central de guías",
    title: "Cómo jugar en TikJogos",
    description: "Elige un juego y aprende las reglas, el objetivo y los mejores consejos antes de comenzar.",
    open: "Ver cómo jugar",
    seoTitle: "Cómo Jugar en TikJogos: Reglas de Todos los Juegos",
    seoDescription: "Aprende a jugar todos los juegos de TikJogos: Impostor, Dibujo, Bomba, Cronómetro, Sincronia, Rankify, Aproximación y Desafío de la Palabra.",
  },
};

const GUIDE_COPY = {
  pt: [
    { title: "Jogo do Impostor", description: "Descubra as regras, a votação e como jogar como tripulante ou impostor.", href: "/como-jogar/jogo-do-impostor", icon: Gamepad2, color: "orange" },
    { title: "Bomba", description: "Escolha letras e responda ao tema antes que a bomba exploda na sua vez.", href: "/como-jogar/bomba", icon: Bomb, color: "red" },
    { title: "T3:MP:00 — Jogo do Cronômetro", description: "Pare o cronômetro no tempo sorteado e chegue mais perto que seus amigos.", href: "/como-jogar/cronometro", icon: Target, color: "cyan" },
    { title: "Desenho do Impostor", description: "Todos desenham a mesma palavra, menos quem é o impostor.", href: "/como-jogar/jogo-do-impostor-desenho", icon: Pencil, color: "emerald" },
    { title: "Sincronia", description: "Pense como os outros jogadores e tente dar a mesma resposta.", href: "/como-jogar/sincronia", icon: Sparkles, color: "purple" },
    { title: "Rankify", description: "Organize cada ranking e chegue o mais perto possível do gabarito.", href: "/como-jogar/rankify", icon: Trophy, color: "amber" },
    { title: "Jogo da Aproximação", description: "Dê palpites numéricos, proteja seus corações e evite a eliminação.", href: "/como-jogar/aproximacao", icon: Target, color: "cyan" },
    { title: "Desafio da Palavra", description: "Adicione letras, forme palavras e use estratégia para não ser eliminado.", href: "/como-jogar/desafio-da-palavra", icon: Bomb, color: "violet" },
  ],
  en: [
    { title: "Impostor Game", description: "Learn the rules, voting and how to play as a crewmate or impostor.", href: "/en/how-to-play/impostor-game", icon: Gamepad2, color: "orange" },
    { title: "Bomba", description: "Choose letters and answer the theme before the bomb explodes on your turn.", href: "/en/how-to-play/bomba", icon: Bomb, color: "red" },
    { title: "Timer Game", description: "Stop the timer at the drawn target and get closer than your friends.", href: "/en/how-to-play/timer-game", icon: Target, color: "cyan" },
    { title: "Impostor Drawing", description: "Everyone draws the same word except the impostor.", href: "/en/how-to-play/impostor-drawing-game", icon: Pencil, color: "emerald" },
    { title: "Sincronia", description: "Think like the other players and try to give the same answer.", href: "/en/how-to-play/sincronia", icon: Sparkles, color: "purple" },
    { title: "Rankify", description: "Order each ranking and get as close as possible to the answer key.", href: "/en/how-to-play/rankify", icon: Trophy, color: "amber" },
    { title: "Approximation Game", description: "Make numerical guesses, protect your hearts and avoid elimination.", href: "/en/how-to-play/approximation", icon: Target, color: "cyan" },
    { title: "Word Challenge", description: "Add letters, form words and use strategy to avoid elimination.", href: "/en/how-to-play/word-challenge", icon: Bomb, color: "violet" },
  ],
  es: [
    { title: "Juego del Impostor", description: "Aprende las reglas, la votación y cómo jugar como tripulante o impostor.", href: "/es/como-jugar/juego-del-impostor", icon: Gamepad2, color: "orange" },
    { title: "Bomba", description: "Elige letras y responde al tema antes de que la bomba explote en tu turno.", href: "/es/como-jugar/bomba", icon: Bomb, color: "red" },
    { title: "Juego del Cronómetro", description: "Detén el cronómetro en el tiempo sorteado y acércate más que tus amigos.", href: "/es/como-jugar/juego-del-cronometro", icon: Target, color: "cyan" },
    { title: "Dibujo del Impostor", description: "Todos dibujan la misma palabra excepto el impostor.", href: "/es/como-jugar/juego-del-impostor-dibujo", icon: Pencil, color: "emerald" },
    { title: "Sincronia", description: "Piensa como los demás jugadores e intenta dar la misma respuesta.", href: "/es/como-jugar/sincronia", icon: Sparkles, color: "purple" },
    { title: "Rankify", description: "Ordena cada ranking y acércate lo máximo posible a la respuesta.", href: "/es/como-jugar/rankify", icon: Trophy, color: "amber" },
    { title: "Juego de Aproximación", description: "Envía estimaciones numéricas, protege tus corazones y evita la eliminación.", href: "/es/como-jugar/aproximacion", icon: Target, color: "cyan" },
    { title: "Desafío de la Palabra", description: "Añade letras, forma palabras y usa estrategia para evitar la eliminación.", href: "/es/como-jugar/desafio-de-la-palabra", icon: Bomb, color: "violet" },
  ],
};

const COLOR_CLASSES: Record<string, string> = {
  orange: "border-orange-500/30 bg-orange-500/10 text-orange-400 group-hover:border-orange-400",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-400",
  purple: "border-purple-500/30 bg-purple-500/10 text-purple-400 group-hover:border-purple-400",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-400 group-hover:border-violet-400",
  red: "border-red-500/30 bg-red-500/10 text-red-400 group-hover:border-red-400",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400 group-hover:border-amber-400",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 group-hover:border-cyan-400",
};

export default function ComoJogarHub() {
  const { lang } = useLanguage();
  const language = (lang === "en" || lang === "es" ? lang : "pt") as keyof typeof COPY;
  const copy = COPY[language];
  const guides = GUIDE_COPY[language];
  const canonical = language === "en" ? "/en/how-to-play" : language === "es" ? "/es/como-jugar" : "/comojogar";

  useEffect(() => {
    setPageSeo({
      title: `${copy.seoTitle} | TikJogos`,
      description: copy.seoDescription,
      canonical: `https://tikjogos.com.br${canonical}`,
    });
    window.scrollTo(0, 0);
  }, [canonical, copy]);

  return (
    <div className="min-h-screen bg-[#1a1b2e] text-white">
      <MobileNav />
      <SideAds />
      <BottomAd />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
            <BookOpen className="h-4 w-4" /> {copy.badge}
          </span>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">{copy.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{copy.description}</p>
        </header>

        <section className="grid gap-5 md:grid-cols-2" aria-label={copy.badge}>
          {guides.map(({ title, description, href, icon: Icon, color }) => (
            <Link key={href} href={href} className="group rounded-3xl border-2 border-[#343854] bg-[#242642] p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-purple-950/30 md:p-8">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${COLOR_CLASSES[color]}`}>
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">{title}</h2>
              <p className="mt-3 min-h-12 leading-relaxed text-slate-400">{description}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-black text-purple-300 transition-colors group-hover:text-purple-200">
                {copy.open} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
