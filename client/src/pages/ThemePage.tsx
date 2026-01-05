import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Play, Users, Zap, ArrowRight, Home } from 'lucide-react';

interface ThemeConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  metaDescription: string;
  about: string;
  examples: string[];
  relatedThemes: Array<{ id: string; name: string }>;
}

const THEMES: Record<string, ThemeConfig> = {
  disney: {
    id: 'disney',
    name: 'Disney',
    title: 'Jogo do Impostor da Disney Online Grátis',
    description: 'Jogue o Jogo do Impostor da Disney online grátis no TikJogos. Palavras prontas, jogo rápido e divertido para jogar com amigos.',
    metaDescription: 'Jogue o Jogo do Impostor da Disney online grátis no TikJogos. Palavras prontas, jogo rápido e divertido para jogar com amigos.',
    about: 'Neste tema, as palavras são inspiradas no universo Disney. Você pode encontrar personagens como Mickey, Elsa e Simba, além de filmes e animações famosas.',
    examples: ['Mickey', 'Elsa', 'Simba', 'Buzz Lightyear', 'Moana'],
    relatedThemes: [
      { id: 'animes', name: 'Animes' },
      { id: 'herois', name: 'Heróis Marvel' },
      { id: 'natal', name: 'Natal' }
    ]
  },
  'clash-royale': {
    id: 'estrategia',
    name: 'Clash Royale',
    title: 'Jogo do Impostor de Clash Royale Online Grátis',
    description: 'Jogue o Jogo do Impostor de Clash Royale online grátis no TikJogos. Palavras prontas com cartas e personagens do jogo.',
    metaDescription: 'Jogue o Jogo do Impostor de Clash Royale online grátis no TikJogos. Palavras prontas com cartas e personagens do jogo.',
    about: 'Neste tema, as palavras incluem cartas, personagens e elementos do Clash Royale. Perfeito para fãs do jogo de estratégia.',
    examples: ['P.E.K.K.A', 'Mago', 'Gigante', 'Príncipe', 'Golem'],
    relatedThemes: [
      { id: 'valorant', name: 'Valorant' },
      { id: 'animes', name: 'Animes' },
      { id: 'futebol', name: 'Futebol' }
    ]
  },
  valorant: {
    id: 'valorant',
    name: 'Valorant',
    title: 'Jogo do Impostor de Valorant Online Grátis',
    description: 'Jogue o Jogo do Impostor de Valorant online grátis no TikJogos. Palavras prontas com agentes, mapas e termos do jogo.',
    metaDescription: 'Jogue o Jogo do Impostor de Valorant online grátis no TikJogos. Palavras prontas com agentes, mapas e termos do jogo.',
    about: 'Neste tema, as palavras incluem agentes, mapas, armas e termos do Valorant. Ideal para jogadores do FPS tático da Riot Games.',
    examples: ['Jett', 'Spike', 'Phantom', 'Ascent', 'Radiant'],
    relatedThemes: [
      { id: 'clash-royale', name: 'Clash Royale' },
      { id: 'animes', name: 'Animes' },
      { id: 'herois', name: 'Heróis Marvel' }
    ]
  },
  natal: {
    id: 'natal',
    name: 'Natal',
    title: 'Jogo do Impostor de Natal Online Grátis',
    description: 'Jogue o Jogo do Impostor de Natal online grátis no TikJogos. Palavras prontas com temas natalinos para jogar com a família.',
    metaDescription: 'Jogue o Jogo do Impostor de Natal online grátis no TikJogos. Palavras prontas com temas natalinos para jogar com a família.',
    about: 'Neste tema, as palavras são inspiradas no Natal. Perfeito para jogar com a família durante as festas de fim de ano.',
    examples: ['Papai Noel', 'Árvore de Natal', 'Presentes', 'Rena', 'Estrela'],
    relatedThemes: [
      { id: 'disney', name: 'Disney' },
      { id: 'classico', name: 'Clássico' },
      { id: 'animes', name: 'Animes' }
    ]
  },
  animes: {
    id: 'animes',
    name: 'Animes',
    title: 'Jogo do Impostor de Animes Online Grátis',
    description: 'Jogue o Jogo do Impostor de Animes online grátis no TikJogos. Palavras prontas com personagens e termos de animes populares.',
    metaDescription: 'Jogue o Jogo do Impostor de Animes online grátis no TikJogos. Palavras prontas com personagens e termos de animes populares.',
    about: 'Neste tema, as palavras incluem personagens, técnicas e elementos de animes populares como Naruto, Dragon Ball, One Piece e mais.',
    examples: ['Goku', 'Naruto', 'Luffy', 'Kamehameha', 'Sharingan'],
    relatedThemes: [
      { id: 'disney', name: 'Disney' },
      { id: 'herois', name: 'Heróis Marvel' },
      { id: 'valorant', name: 'Valorant' }
    ]
  },
  herois: {
    id: 'herois',
    name: 'Heróis Marvel',
    title: 'Jogo do Impostor de Heróis Marvel Online Grátis',
    description: 'Jogue o Jogo do Impostor de Heróis Marvel online grátis no TikJogos. Palavras prontas com super-heróis e vilões da Marvel.',
    metaDescription: 'Jogue o Jogo do Impostor de Heróis Marvel online grátis no TikJogos. Palavras prontas com super-heróis e vilões da Marvel.',
    about: 'Neste tema, as palavras incluem super-heróis, vilões e elementos do universo Marvel. Perfeito para fãs dos Vingadores e MCU.',
    examples: ['Homem-Aranha', 'Thor', 'Thanos', 'Vibranium', 'Mjölnir'],
    relatedThemes: [
      { id: 'disney', name: 'Disney' },
      { id: 'animes', name: 'Animes' },
      { id: 'stranger-things', name: 'Stranger Things' }
    ]
  },
  'stranger-things': {
    id: 'seriesMisterio',
    name: 'Stranger Things',
    title: 'Jogo do Impostor de Stranger Things Online Grátis',
    description: 'Jogue o Jogo do Impostor de Stranger Things online grátis no TikJogos. Palavras prontas com personagens e elementos da série.',
    metaDescription: 'Jogue o Jogo do Impostor de Stranger Things online grátis no TikJogos. Palavras prontas com personagens e elementos da série.',
    about: 'Neste tema, as palavras incluem personagens, locais e elementos da série Stranger Things. Explore o Upside Down com seus amigos!',
    examples: ['Eleven', 'Demogorgon', 'Hawkins', 'Upside Down', 'Vecna'],
    relatedThemes: [
      { id: 'herois', name: 'Heróis Marvel' },
      { id: 'disney', name: 'Disney' },
      { id: 'animes', name: 'Animes' }
    ]
  },
  futebol: {
    id: 'futebol',
    name: 'Futebol',
    title: 'Jogo do Impostor de Futebol Online Grátis',
    description: 'Jogue o Jogo do Impostor de Futebol online grátis no TikJogos. Palavras prontas com times brasileiros e termos do futebol.',
    metaDescription: 'Jogue o Jogo do Impostor de Futebol online grátis no TikJogos. Palavras prontas com times brasileiros e termos do futebol.',
    about: 'Neste tema, as palavras incluem times brasileiros, jogadores e termos do futebol. Perfeito para fãs do esporte mais popular do Brasil.',
    examples: ['Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos'],
    relatedThemes: [
      { id: 'clash-royale', name: 'Clash Royale' },
      { id: 'valorant', name: 'Valorant' },
      { id: 'classico', name: 'Clássico' }
    ]
  },
  classico: {
    id: 'classico',
    name: 'Clássico',
    title: 'Jogo do Impostor Clássico Online Grátis',
    description: 'Jogue o Jogo do Impostor Clássico online grátis no TikJogos. Palavras prontas com temas variados para todos os públicos.',
    metaDescription: 'Jogue o Jogo do Impostor Clássico online grátis no TikJogos. Palavras prontas com temas variados para todos os públicos.',
    about: 'Neste tema, as palavras incluem objetos do cotidiano, lugares, comidas, animais e muito mais. O tema mais completo e versátil.',
    examples: ['Cadeira', 'Hospital', 'Pizza', 'Cachorro', 'Futebol'],
    relatedThemes: [
      { id: 'natal', name: 'Natal' },
      { id: 'futebol', name: 'Futebol' },
      { id: 'disney', name: 'Disney' }
    ]
  }
};

interface ThemePageProps {
  themeSlug: string;
}

export default function ThemePage({ themeSlug }: ThemePageProps) {
  const theme = THEMES[themeSlug];
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Update meta tags
    if (theme) {
      document.title = `${theme.title} | TikJogos`;
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', theme.metaDescription);

      // Update or create og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', theme.title);

      // Update or create og:description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', theme.metaDescription);

      // Update or create canonical link
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
    // Redirect to home with theme parameter
    setLocation(`/?tema=${theme.id}&origem=seo`);
  };

  return (
    <div className="min-h-screen bg-[#1C202C] text-white">
        {/* Header */}
        <header className="bg-[#242642] border-b-4 border-[#2f3252] py-4 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/">
              <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <Home size={20} />
                <span className="font-bold">TikJogos</span>
              </button>
            </Link>
            <button
              onClick={handlePlayClick}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-green-800 text-white font-black text-sm rounded-xl hover:brightness-110 transition-all active:border-b-0 active:translate-y-1"
            >
              JOGAR AGORA
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Jogo do Impostor {theme.name} para Jogar Online
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              {theme.description}
            </p>

            {/* CTA Principal */}
            <button
              onClick={handlePlayClick}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 border-b-[6px] border-green-800 text-white font-black text-xl rounded-2xl hover:brightness-110 transition-all shadow-2xl active:border-b-0 active:translate-y-2 group"
            >
              <Play size={28} className="fill-current" />
              <span>JOGAR AGORA</span>
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
                <h3 className="font-bold text-lg mb-2">Palavras Prontas</h3>
                <p className="text-sm text-slate-400">Tema completo com palavras selecionadas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-12 px-4 bg-[#16213e]/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Como Funciona o Jogo</h2>
            
            <div className="space-y-6">
              <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0 font-black text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Todos recebem uma palavra</h3>
                    <p className="text-slate-400">Cada jogador recebe uma palavra secreta do tema {theme.name}.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0 font-black text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Um jogador é o impostor</h3>
                    <p className="text-slate-400">O impostor recebe uma palavra diferente e precisa descobrir qual é a palavra dos outros.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0 font-black text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Descubra quem é o impostor</h3>
                    <p className="text-slate-400">Conversem, façam perguntas e votem para descobrir quem é o impostor!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre o Tema */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-6 text-center">Sobre o Tema {theme.name}</h2>
            
            <div className="bg-[#242642] rounded-2xl p-8 border-2 border-[#2f3252] mb-8">
              <p className="text-lg text-slate-300 leading-relaxed mb-6">
                {theme.about}
              </p>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="font-bold text-lg mb-4">Exemplos de palavras:</h3>
                <div className="flex flex-wrap gap-2">
                  {theme.examples.map((example) => (
                    <span
                      key={example}
                      className="px-4 py-2 bg-purple-500/20 border-2 border-purple-500/30 rounded-xl text-purple-300 font-bold text-sm"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Secundário */}
            <div className="text-center">
              <button
                onClick={handlePlayClick}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 border-b-[6px] border-purple-800 text-white font-black text-xl rounded-2xl hover:brightness-110 transition-all shadow-2xl active:border-b-0 active:translate-y-2"
              >
                <Play size={28} className="fill-current" />
                Jogar o Tema {theme.name} Agora
              </button>
            </div>
          </div>
        </section>

        {/* Temas Relacionados */}
        <section className="py-12 px-4 bg-[#16213e]/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Outros Temas Populares</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {theme.relatedThemes.map((related) => (
                <Link key={related.id} href={`/jogo-do-impostor/temas/${related.id}`}>
                  <div className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252] hover:border-purple-500/50 transition-all cursor-pointer group">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                      {related.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Jogo do Impostor de {related.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-[#2f3252]">
          <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
            <p className="mb-2">© 2026 TikJogos - Jogo do Impostor Online</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </Link>
              <span>|</span>
              <Link href="/termos" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <span>|</span>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </footer>
      </div>
  );
}
