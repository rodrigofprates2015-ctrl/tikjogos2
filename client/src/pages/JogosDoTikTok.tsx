import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Bomb,
  Check,
  Clock3,
  Gamepad2,
  HelpCircle,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { BottomAd, SideAds } from "@/components/AdSense";
import { setPageSeo } from "@/lib/pageSeo";

const games = [
  {
    title: "Jogo do Impostor",
    description:
      "Descubra quem recebeu uma informação diferente. O impostor precisa improvisar, blefar e convencer o grupo de que sabe a resposta.",
    href: "/",
    guide: "/como-jogar/jogo-do-impostor",
    action: "Jogar o Impostor",
    icon: Users,
    color: "orange",
  },
  {
    title: "Jogo da Bomba",
    description:
      "Escolha uma letra, responda ao tema e passe a vez antes que o tempo acabe. Pensar sob pressão faz parte do desafio.",
    href: "/bomba",
    guide: "/como-jogar/bomba",
    action: "Jogar Bomba",
    icon: Bomb,
    color: "rose",
  },
  {
    title: "T3:MP:00 — Jogo do Cronômetro",
    description:
      "Inicie o contador e tente pará-lo no tempo exato. Vence quem demonstrar mais precisão e chegar mais perto do alvo.",
    href: "/cronometro",
    guide: "/como-jogar/cronometro",
    action: "Jogar T3:MP:00",
    icon: Clock3,
    color: "cyan",
  },
  {
    title: "Sincronia",
    description:
      "Responda como os outros participantes responderiam. Quanto mais o grupo pensa parecido, mais pontos conquista.",
    href: "/respostas-em-comum",
    guide: "/como-jogar/sincronia",
    action: "Jogar Sincronia",
    icon: Sparkles,
    color: "purple",
  },
  {
    title: "Aproximação",
    description:
      "Dê o seu melhor palpite. Você não precisa conhecer o número exato: basta chegar mais perto do que os adversários.",
    href: "/aproximacao",
    guide: "/como-jogar/aproximacao",
    action: "Jogar Aproximação",
    icon: Target,
    color: "blue",
  },
] as const;

const colorClasses: Record<string, string> = {
  orange: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  purple: "border-purple-400/30 bg-purple-500/10 text-purple-300",
  blue: "border-blue-400/30 bg-blue-500/10 text-blue-300",
};

const faq = [
  {
    question: "Os jogos do TikTok são gratuitos?",
    answer: "Sim. Os jogos disponíveis no TikJogos podem ser acessados gratuitamente.",
  },
  {
    question: "Preciso ter uma conta no TikTok?",
    answer:
      "Não. Os jogos são inspirados em brincadeiras e desafios populares nas redes sociais, mas funcionam de forma independente.",
  },
  {
    question: "É necessário instalar algum aplicativo?",
    answer:
      "Não para jogar pelo site. Você pode acessar o TikJogos diretamente pelo navegador do celular ou do computador.",
  },
  {
    question: "Posso jogar com amigos à distância?",
    answer:
      "Sim. Nos jogos com salas online, crie uma sala e compartilhe o código para que cada amigo entre pelo próprio aparelho.",
  },
  {
    question: "O TikJogos pertence ao TikTok?",
    answer:
      "Não. O TikJogos é uma plataforma independente e não possui vínculo oficial com o TikTok. A expressão jogos do TikTok descreve brincadeiras e desafios conhecidos por meio da plataforma.",
  },
];

export default function JogosDoTikTok() {
  useEffect(() => {
    const canonical = "https://tikjogos.com.br/jogos-do-tiktok";
    const description =
      "Jogue gratuitamente os jogos do TikTok que viralizaram. Crie uma sala e divirta-se com Impostor, Bomba, Cronômetro e outros desafios.";

    setPageSeo({
      title: "Jogos do TikTok: desafios virais para jogar com amigos | TikJogos",
      description,
      canonical,
      keywords:
        "jogos do TikTok, jogos do TikTok para jogar com amigos, jogos virais do TikTok, brincadeiras do TikTok, desafios do TikTok, jogos online para amigos",
    });

    const upsertMeta = (property: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    upsertMeta("og:title", "Jogos do TikTok para jogar com amigos");
    upsertMeta("og:description", description);
    upsertMeta("og:url", canonical);
    upsertMeta("og:type", "website");

    const schemaId = "jogos-do-tiktok-schema";
    document.getElementById(schemaId)?.remove();
    const schema = document.createElement("script");
    schema.id = schemaId;
    schema.type = "application/ld+json";
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: "Jogos do TikTok para jogar com amigos",
          url: canonical,
          description,
          isPartOf: { "@type": "WebSite", name: "TikJogos", url: "https://tikjogos.com.br" },
        },
        {
          "@type": "ItemList",
          name: "Jogos virais disponíveis no TikJogos",
          itemListElement: games.map((game, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: game.title,
            url: `https://tikjogos.com.br${game.href}`,
          })),
        },
        {
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    });
    document.head.appendChild(schema);
    window.scrollTo(0, 0);

    return () => document.getElementById(schemaId)?.remove();
  }, []);

  return (
    <div className="min-h-screen bg-[#17182a] text-white">
      <MobileNav />
      <SideAds />
      <BottomAd />

      <main>
        <header className="relative overflow-hidden border-b border-white/10 px-4 py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,.25),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,.18),transparent_34%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-purple-200">
              <Sparkles className="h-4 w-4" /> Diversão que viralizou
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.05] md:text-7xl">
              Jogos do TikTok para jogar com amigos
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 md:text-xl">
              Reunimos desafios rápidos, divertidos e fáceis de compartilhar. Escolha um jogo, crie uma sala e comece a partida gratuitamente pelo celular ou computador.
            </p>
            <a href="#escolha-um-jogo" className="mt-9 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-8 py-5 text-lg font-black shadow-[0_6px_0_#581c87] transition-transform hover:-translate-y-1">
              <Play className="h-6 w-6 fill-current" /> Escolher um jogo
            </a>
          </div>
        </header>

        <section id="escolha-um-jogo" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:py-20">
          <div className="mb-9 max-w-3xl">
            <p className="font-black uppercase tracking-[.18em] text-purple-300">Jogue agora</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Os jogos que transformam qualquer encontro</h2>
            <p className="mt-4 leading-relaxed text-slate-300 md:text-lg">
              Não é preciso preparar cartas, peças ou longas explicações. Cada desafio foi pensado para começar rápido e manter todos participando.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {games.map(({ title, description, href, guide, action, icon: Icon, color }, index) => (
              <article key={title} className={`rounded-3xl border-2 border-[#343854] bg-[#22243e] p-6 shadow-[0_8px_0_#0d1020] md:p-8 ${index === games.length - 1 ? "md:col-span-2" : ""}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colorClasses[color]}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-2xl font-black md:text-3xl">{title}</h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">{description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-black transition-colors hover:bg-purple-500">
                    <Play className="h-4 w-4 fill-current" /> {action}
                  </Link>
                  <Link href={guide} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-200 hover:bg-white/10">
                    Como jogar <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111426] px-4 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="font-black uppercase tracking-[.18em] text-orange-300">Por que todo mundo joga?</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Regras simples, reações imprevisíveis</h2>
              <p className="mt-5 leading-relaxed text-slate-300 md:text-lg">
                Algumas brincadeiras precisam de tabuleiro. Outras exigem cartas ou preparação. Os jogos que viralizam no TikTok seguem outra lógica: são rápidos de entender, fáceis de compartilhar e capazes de transformar qualquer encontro em uma disputa divertida.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                [Gamepad2, "Comece rápido", "Entenda o objetivo em poucos segundos e entre direto na partida."],
                [Users, "Todo mundo participa", "Blefes, palpites e respostas inesperadas mantêm o grupo envolvido."],
                [Sparkles, "Jogue onde estiver", "Use o celular ou computador, presencialmente ou à distância."],
              ].map(([Icon, title, text]) => {
                const CardIcon = Icon as typeof Gamepad2;
                return <article key={title as string} className="rounded-2xl border border-[#343854] bg-[#22243e] p-5"><CardIcon className="h-7 w-7 text-purple-300"/><h3 className="mt-4 font-black">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">{text as string}</p></article>;
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 md:py-20">
          <div className="rounded-3xl border-2 border-purple-400/20 bg-purple-500/10 p-6 md:p-10">
            <h2 className="text-3xl font-black md:text-4xl">Como jogar no TikJogos</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Escolha um dos jogos disponíveis.",
                "Digite seu apelido e crie uma sala.",
                "Compartilhe o código com seus amigos.",
                "Aguarde todos entrarem e comece a partida.",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#1b1d34] p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 font-black">{index + 1}</span>
                  <span className="pt-1 font-bold text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 md:pb-24">
          <div className="mb-8 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-purple-300" />
            <h2 className="mt-4 text-3xl font-black md:text-5xl">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-[#343854] bg-[#22243e] p-6">
                <h3 className="flex items-start gap-3 text-lg font-black"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />{item.question}</h3>
                <p className="mt-3 pl-8 leading-relaxed text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-600 p-8 text-center md:p-12">
            <h2 className="text-3xl font-black md:text-5xl">Escolha o próximo desafio</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-purple-100">Reúna seus amigos e descubra quem mente melhor, pensa mais rápido ou tem a melhor noção de tempo.</p>
            <a href="#escolha-um-jogo" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-black text-purple-800 shadow-lg"><Gamepad2 className="h-5 w-5"/> Ver todos os jogos</a>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0f1120] px-4 py-8 text-center text-sm text-slate-400">
        <p>O TikJogos é uma plataforma independente e não possui vínculo oficial com o TikTok.</p>
        <p className="mt-2">© 2026 TikJogos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
