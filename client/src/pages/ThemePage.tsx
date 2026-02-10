import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Play, Users, Zap, ArrowRight, Home } from 'lucide-react';
import { SideAds, BottomAd } from "@/components/AdSense";
import { getThemeBySlug, THEMES, type ThemeData } from '@/data/themes';
import { PALAVRA_SECRETA_SUBMODES } from '@/lib/palavra-secreta-submodes';

interface ThemePageProps {
  themeSlug: string;
}

function getRelatedThemes(currentSlug: string): ThemeData[] {
  const all = THEMES.filter(t => t.slug !== currentSlug);
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

export default function ThemePage({ themeSlug }: ThemePageProps) {
  const theme = getThemeBySlug(themeSlug);
  const [, setLocation] = useLocation();
  const relatedThemes = getRelatedThemes(themeSlug);

  // Get the full word list from the game submodes
  const submodeData = PALAVRA_SECRETA_SUBMODES[theme?.categoryId as keyof typeof PALAVRA_SECRETA_SUBMODES];
  const allWords = submodeData?.words || theme?.examples || [];

  useEffect(() => {
    window.scrollTo(0, 0);

    if (theme) {
      document.title = theme.seo.pt.title;

      const setMeta = (selector: string, attr: string, content: string) => {
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          const [key, val] = attr.split('=');
          el.setAttribute(key, val);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('meta[name="description"]', 'name=description', theme.seo.pt.description);
      setMeta('meta[property="og:title"]', 'property=og:title', theme.seo.pt.title);
      setMeta('meta[property="og:description"]', 'property=og:description', theme.seo.pt.description);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://tikjogos.com.br/jogo-do-impostor/temas/${themeSlug}`);
    }
  }, [themeSlug, theme]);

  if (!theme) {
    return (
      <div className="min-h-screen bg-[#1C202C] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">Tema não encontrado</h1>
          <Link href="/">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-bold rounded-xl">
              Voltar para Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePlayClick = () => {
    setLocation(`/?tema=${theme.categoryId}&origem=seo`);
  };

  return (
    <div className="min-h-screen bg-[#1C202C] text-white">
      <SideAds />
      <BottomAd />

      {/* Header */}
      <header className="bg-[#242642] border-b-4 border-[#2f3252] py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Home size={20} />
              <span className="font-bold">TikJogos</span>
            </button>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <Link href="/jogo-do-impostor/temas" className="hover:text-white transition-colors">
              Todos os Temas
            </Link>
            <span>|</span>
            <Link href="/como-jogar" className="hover:text-white transition-colors">
              Como Jogar
            </Link>
          </nav>
          <button
            onClick={handlePlayClick}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-green-800 text-white font-black text-sm rounded-xl hover:brightness-110 transition-all active:border-b-0 active:translate-y-1"
          >
            JOGAR AGORA
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-300">Início</Link>
        <span className="mx-2">›</span>
        <Link href="/jogo-do-impostor/temas" className="hover:text-slate-300">Temas</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-300">{theme.name}</span>
      </div>

      {/* Hero — H1 + descrição + CTA */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-4xl mb-4 block">{theme.icon}</span>
          <h1 className="text-3xl md:text-5xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
            Jogo do Impostor {theme.name}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-4 leading-relaxed max-w-3xl mx-auto">
            Jogue o <strong>jogo do impostor {theme.name.toLowerCase()}</strong> online e grátis no TikJogos.
            {' '}Este tema traz {allWords.length} palavras exclusivas do universo de {theme.name} para
            partidas de dedução social com seus amigos.
          </p>

          <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
            {theme.shortDescription}. Sem cadastro, sem download — basta criar uma sala e compartilhar o código.
          </p>

          {/* CTA Principal */}
          <button
            onClick={handlePlayClick}
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 border-b-[6px] border-green-800 text-white font-black text-xl rounded-2xl hover:brightness-110 transition-all shadow-2xl active:border-b-0 active:translate-y-2 group"
          >
            <Play size={28} className="fill-current" />
            <span>JOGAR {theme.name.toUpperCase()} AGORA</span>
            <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Multiplayer Online</h3>
              <p className="text-sm text-slate-400">Jogue com amigos direto do navegador</p>
            </div>

            <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Grátis</h3>
              <p className="text-sm text-slate-400">Sem cadastro, sem download, sem limites</p>
            </div>

            <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Play className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">{allWords.length} Palavras</h3>
              <p className="text-sm text-slate-400">Tema completo com palavras selecionadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Tema + Lista de Palavras */}
      <section className="py-12 px-4 bg-[#16213e]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6">
            Sobre o tema {theme.name} no Jogo do Impostor
          </h2>

          <div className="bg-[#242642] rounded-2xl p-6 md:p-8 border-2 border-[#2f3252] mb-8">
            <p className="text-slate-300 leading-relaxed mb-4">
              O tema <strong>{theme.name}</strong> foi criado para fãs que querem jogar o
              {' '}<strong>jogo do impostor</strong> com palavras do universo que amam.
              Durante a partida, todos os jogadores recebem uma palavra secreta deste tema — exceto o impostor,
              que precisa fingir que sabe qual é.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Com {allWords.length} palavras disponíveis, cada rodada é diferente.
              As palavras vão desde termos conhecidos até referências que só os verdadeiros fãs de {theme.name} vão reconhecer,
              tornando a dedução ainda mais divertida.
            </p>
          </div>

          <h3 className="text-xl font-bold mb-4">Palavras usadas neste tema:</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {allWords.map((word) => (
              <span
                key={word}
                className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/25 rounded-lg text-purple-300 text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Como jogar o Impostor {theme.name}</h2>

          <div className="space-y-4">
            {[
              { n: '1', color: 'bg-blue-500', title: 'Crie uma sala', desc: `Escolha o modo "Palavra Secreta" e selecione o tema ${theme.name}.` },
              { n: '2', color: 'bg-yellow-500', title: 'Convide seus amigos', desc: 'Compartilhe o código da sala para todos entrarem.' },
              { n: '3', color: 'bg-red-500', title: 'Descubra o impostor', desc: 'Todos recebem uma palavra, exceto o impostor. Conversem, façam perguntas e votem!' },
            ].map((step) => (
              <div key={step.n} className="bg-[#242642] rounded-2xl p-5 border-2 border-[#2f3252]">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 ${step.color} rounded-full flex items-center justify-center shrink-0 font-black`}>
                    {step.n}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Secundário */}
          <div className="text-center mt-10">
            <button
              onClick={handlePlayClick}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 border-b-[6px] border-purple-800 text-white font-black text-xl rounded-2xl hover:brightness-110 transition-all shadow-2xl active:border-b-0 active:translate-y-2"
            >
              <Play size={28} className="fill-current" />
              Jogar {theme.name} Agora
            </button>
          </div>
        </div>
      </section>

      {/* Temas Relacionados — links internos */}
      <section className="py-12 px-4 bg-[#16213e]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Outros Temas do Jogo do Impostor</h2>
          <p className="text-slate-400 text-center mb-8">
            Explore mais temas ou <Link href="/jogo-do-impostor/temas" className="text-purple-400 hover:underline">veja todos os temas disponíveis</Link>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedThemes.map((related) => (
              <Link key={related.slug} href={`/jogo-do-impostor/temas/${related.slug}`}>
                <div className="bg-[#242642] rounded-xl p-4 border-2 border-[#2f3252] hover:border-purple-500/50 transition-all cursor-pointer group text-center">
                  <span className="text-2xl block mb-2">{related.icon}</span>
                  <h3 className="font-bold text-sm mb-1 group-hover:text-purple-400 transition-colors">
                    {related.name}
                  </h3>
                  <p className="text-xs text-slate-500">{related.wordCount} palavras</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Link interno para a página principal */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 mb-4">
            O <Link href="/" className="text-purple-400 hover:underline font-bold">Jogo do Impostor</Link> é um jogo de dedução social
            online e gratuito. Jogue com amigos usando dezenas de temas diferentes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
            <Link href="/" className="text-purple-400 hover:underline">Página Principal</Link>
            <span className="text-slate-600">•</span>
            <Link href="/como-jogar" className="text-purple-400 hover:underline">Como Jogar</Link>
            <span className="text-slate-600">•</span>
            <Link href="/jogo-do-impostor/temas" className="text-purple-400 hover:underline">Todos os Temas</Link>
            <span className="text-slate-600">•</span>
            <Link href="/blog" className="text-purple-400 hover:underline">Blog</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#2f3252]">
        <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
          <p className="mb-2">© 2026 TikJogos - Jogo do Impostor Online</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <span>|</span>
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <span>|</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
