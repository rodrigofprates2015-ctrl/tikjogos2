import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Play, ArrowRight, Sparkles, ChevronRight, Palette, Youtube, Instagram, MessageCircle } from 'lucide-react';
import { THEMES } from '@/data/themes';
import { MobileNav } from '@/components/MobileNav';
import { SideAds, BottomAd } from '@/components/AdSense';
import { useLanguage } from '@/hooks/useLanguage';
import logoTikjogos from '@assets/logo tikjogos_1764616571363.png';

const PAGE_SEO = {
  pt: {
    title: 'Todos os Temas do Jogo do Impostor Online – TikJogos',
    description: 'Explore todos os temas do Jogo do Impostor: Clash Royale, Futebol, Disney, Valorant, Naruto e mais. Jogue grátis online com amigos no TikJogos.',
    h1: 'Todos os Temas do Jogo do Impostor',
    subtitle: 'Escolha um tema e jogue com amigos. Cada tema possui palavras-chave exclusivas para partidas únicas de dedução social.',
    themeCount: 'temas disponíveis',
    words: 'palavras',
    playNow: 'JOGAR AGORA',
    seeTheme: 'Ver tema',
    ctaTitle: 'Quer criar seu próprio tema?',
    ctaDescription: 'Por apenas R$ 3, você pode criar um tema personalizado com palavras exclusivas.',
    ctaButton: 'CRIAR MEU TEMA',
    howItWorks: 'Como Funciona',
    step1Title: 'Escolha um tema',
    step1Desc: 'Selecione entre os temas disponíveis com palavras-chave exclusivas.',
    step2Title: 'Crie uma sala',
    step2Desc: 'Compartilhe o código da sala com seus amigos para começar.',
    step3Title: 'Descubra o impostor',
    step3Desc: 'Use as palavras do tema para fazer perguntas e encontrar o traidor!',
    faqTitle: 'Perguntas Frequentes',
    faq: [
      { q: 'Quantos temas estão disponíveis no TikJogos?', a: `Atualmente temos ${THEMES.length} temas disponíveis, incluindo Clash Royale, Futebol, Disney, Valorant, Naruto, Minecraft e muitos outros. Novos temas são adicionados regularmente.` },
      { q: 'Preciso pagar para jogar com os temas?', a: 'Não! Todos os temas listados são 100% gratuitos. Você também pode criar temas personalizados por apenas R$ 3.' },
      { q: 'Posso jogar no celular?', a: 'Sim! O TikJogos funciona diretamente no navegador, sem necessidade de download. Funciona em celulares, tablets e computadores.' },
      { q: 'Como funciona o Jogo do Impostor com temas?', a: 'Cada tema possui um conjunto de palavras-chave exclusivas. Durante a partida, todos recebem uma palavra do tema, exceto o impostor, que recebe uma palavra diferente. O objetivo é descobrir quem é o impostor através de perguntas e dedução.' },
    ],
  },
  en: {
    title: 'All Impostor Game Themes Online – TikJogos',
    description: 'Explore all Impostor Game themes: Clash Royale, Soccer, Disney, Valorant, Naruto and more. Play free online with friends on TikJogos.',
    h1: 'All Impostor Game Themes',
    subtitle: 'Choose a theme and play with friends. Each theme has exclusive keywords for unique social deduction matches.',
    themeCount: 'available themes',
    words: 'words',
    playNow: 'PLAY NOW',
    seeTheme: 'See theme',
    ctaTitle: 'Want to create your own theme?',
    ctaDescription: 'For only R$ 3, you can create a custom theme with exclusive words.',
    ctaButton: 'CREATE MY THEME',
    howItWorks: 'How It Works',
    step1Title: 'Choose a theme',
    step1Desc: 'Select from available themes with exclusive keywords.',
    step2Title: 'Create a room',
    step2Desc: 'Share the room code with your friends to start.',
    step3Title: 'Find the impostor',
    step3Desc: 'Use the theme words to ask questions and find the traitor!',
    faqTitle: 'Frequently Asked Questions',
    faq: [
      { q: 'How many themes are available on TikJogos?', a: `We currently have ${THEMES.length} available themes, including Clash Royale, Soccer, Disney, Valorant, Naruto, Minecraft and many more. New themes are added regularly.` },
      { q: 'Do I need to pay to play with themes?', a: 'No! All listed themes are 100% free. You can also create custom themes for only R$ 3.' },
      { q: 'Can I play on mobile?', a: 'Yes! TikJogos works directly in the browser, no download needed. Works on phones, tablets and computers.' },
      { q: 'How does the Impostor Game with themes work?', a: 'Each theme has a set of exclusive keywords. During the match, everyone receives a word from the theme, except the impostor, who receives a different word. The goal is to find the impostor through questions and deduction.' },
    ],
  },
  es: {
    title: 'Todos los Temas del Juego del Impostor Online – TikJogos',
    description: 'Explora todos los temas del Juego del Impostor: Clash Royale, Fútbol, Disney, Valorant, Naruto y más. Juega gratis online con amigos en TikJogos.',
    h1: 'Todos los Temas del Juego del Impostor',
    subtitle: 'Elige un tema y juega con amigos. Cada tema tiene palabras clave exclusivas para partidas únicas de deducción social.',
    themeCount: 'temas disponibles',
    words: 'palabras',
    playNow: 'JUGAR AHORA',
    seeTheme: 'Ver tema',
    ctaTitle: '¿Quieres crear tu propio tema?',
    ctaDescription: 'Por solo R$ 3, puedes crear un tema personalizado con palabras exclusivas.',
    ctaButton: 'CREAR MI TEMA',
    howItWorks: 'Cómo Funciona',
    step1Title: 'Elige un tema',
    step1Desc: 'Selecciona entre los temas disponibles con palabras clave exclusivas.',
    step2Title: 'Crea una sala',
    step2Desc: 'Comparte el código de la sala con tus amigos para empezar.',
    step3Title: 'Descubre al impostor',
    step3Desc: '¡Usa las palabras del tema para hacer preguntas y encontrar al traidor!',
    faqTitle: 'Preguntas Frecuentes',
    faq: [
      { q: '¿Cuántos temas están disponibles en TikJogos?', a: `Actualmente tenemos ${THEMES.length} temas disponibles, incluyendo Clash Royale, Fútbol, Disney, Valorant, Naruto, Minecraft y muchos más. Se agregan nuevos temas regularmente.` },
      { q: '¿Necesito pagar para jugar con los temas?', a: '¡No! Todos los temas listados son 100% gratuitos. También puedes crear temas personalizados por solo R$ 3.' },
      { q: '¿Puedo jugar en el celular?', a: 'Sí. TikJogos funciona directamente en el navegador, sin necesidad de descarga. Funciona en celulares, tablets y computadoras.' },
      { q: '¿Cómo funciona el Juego del Impostor con temas?', a: 'Cada tema tiene un conjunto de palabras clave exclusivas. Durante la partida, todos reciben una palabra del tema, excepto el impostor, que recibe una palabra diferente. El objetivo es descubrir quién es el impostor a través de preguntas y deducción.' },
    ],
  },
};

export default function Temas() {
  const [, setLocation] = useLocation();
  const { lang, langPath, t } = useLanguage();
  const seo = PAGE_SEO[lang] || PAGE_SEO.pt;

  const totalWords = THEMES.reduce((sum, th) => sum + th.wordCount, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = seo.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    // Breadcrumb JSON-LD
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'temas-breadcrumb-jsonld';
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'TikJogos', item: window.location.origin + langPath('/') },
        { '@type': 'ListItem', position: 2, name: 'Temas', item: window.location.origin + langPath('/temas') },
      ],
    });
    document.head.appendChild(breadcrumbScript);

    // FAQ JSON-LD
    const faqScript = document.createElement('script');
    faqScript.id = 'temas-faq-jsonld';
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
    document.head.appendChild(faqScript);

    // ItemList JSON-LD for themes
    const itemListScript = document.createElement('script');
    itemListScript.id = 'temas-itemlist-jsonld';
    itemListScript.type = 'application/ld+json';
    itemListScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: seo.h1,
      numberOfItems: THEMES.length,
      itemListElement: THEMES.map((theme, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: theme.name,
        url: window.location.origin + langPath(`/temas/${theme.slug}`),
      })),
    });
    document.head.appendChild(itemListScript);

    return () => {
      document.getElementById('temas-breadcrumb-jsonld')?.remove();
      document.getElementById('temas-faq-jsonld')?.remove();
      document.getElementById('temas-itemlist-jsonld')?.remove();
    };
  }, [lang, seo]);

  const handlePlay = (categoryId: string) => {
    setLocation(`/?tema=${categoryId}&origem=seo`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#1a1b2e' }}>
      <MobileNav />
      <SideAds />
      <BottomAd />

      <main className="flex-grow">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <ol className="flex items-center gap-1 text-sm font-bold flex-wrap">
            <li>
              <Link href={langPath('/')} className="text-slate-500 hover:text-purple-400 transition-colors">
                TikJogos
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-600" /></li>
            <li className="text-purple-400">
              Temas
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="flex items-center justify-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm mb-4">
              <Sparkles className="w-5 h-5" /> {THEMES.length} {seo.themeCount}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-black mb-6 leading-tight">
              {seo.h1.split(' ').map((word, i, arr) =>
                i >= arr.length - 2
                  ? <span key={i} className="text-purple-500">{word} </span>
                  : word + ' '
              )}
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto font-medium mb-4">
              {seo.subtitle}
            </p>

            <p className="text-slate-500 text-sm font-bold">
              {totalWords}+ {seo.words}
            </p>
          </div>
        </section>

        {/* Themes Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES.map((theme) => {
              const themeSeo = theme.seo[lang] || theme.seo.pt;
              return (
                <article
                  key={theme.slug}
                  className="group bg-[#242642] rounded-[2.5rem] border-4 border-[#2f3252] overflow-hidden shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50"
                >
                  <div className="p-6 sm:p-8">
                    {/* Icon + Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl border-2 border-purple-500/20 shrink-0">
                        {theme.icon}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl font-black text-white group-hover:text-purple-400 transition-colors truncate">
                          {theme.name}
                        </h2>
                        <p className="text-slate-500 text-sm font-bold">
                          {theme.wordCount} {seo.words}
                        </p>
                      </div>
                    </div>

                    {/* SEO Description */}
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4">
                      {themeSeo.description}
                    </p>

                    {/* Example words */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {theme.examples.slice(0, 4).map((ex) => (
                        <span
                          key={ex}
                          className="px-3 py-1 bg-slate-800/80 rounded-full text-xs font-bold text-slate-300 border border-slate-700"
                        >
                          {ex}
                        </span>
                      ))}
                      <span className="px-3 py-1 text-xs font-bold text-slate-500">
                        +{theme.wordCount - 4}
                      </span>
                    </div>

                    {/* Play button */}
                    <button
                      onClick={() => handlePlay(theme.categoryId)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-green-800 text-white font-black text-sm rounded-2xl hover:brightness-110 transition-all active:border-b-0 active:translate-y-1 group/btn"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {seo.playNow}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-[#16213e]/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-10 text-center">
              {seo.howItWorks}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '1', color: 'bg-blue-500', title: seo.step1Title, desc: seo.step1Desc },
                { num: '2', color: 'bg-rose-500', title: seo.step2Title, desc: seo.step2Desc },
                { num: '3', color: 'bg-green-500', title: seo.step3Title, desc: seo.step3Desc },
              ].map((step) => (
                <div key={step.num} className="bg-[#242642] rounded-2xl p-6 border-2 border-[#2f3252] text-center">
                  <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xl text-white`}>
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-10 text-center">
              {seo.faqTitle}
            </h2>

            <div className="space-y-4">
              {seo.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-[#242642] rounded-2xl border-2 border-[#2f3252] overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-white text-lg hover:text-purple-400 transition-colors list-none">
                    <span>{item.q}</span>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-400 font-medium leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Create Theme */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-[3rem] p-8 md:p-12 border-4 border-purple-500/30 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-purple-500/30">
                  <Palette className="w-8 h-8 text-purple-400" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  {seo.ctaTitle}
                </h2>

                <p className="text-slate-400 text-lg font-medium mb-8 max-w-xl mx-auto">
                  {seo.ctaDescription}
                </p>

                <Link
                  href={langPath('/criar-tema')}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-violet-500 border-b-[6px] border-purple-800 text-white font-black text-xl rounded-2xl hover:brightness-110 transition-all shadow-2xl active:border-b-0 active:translate-y-2"
                >
                  <Palette className="w-6 h-6" />
                  {seo.ctaButton}
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t-8 border-[#242642] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center cursor-pointer">
                <img
                  src={logoTikjogos}
                  alt="TikJogos Impostor"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-400 max-w-md text-lg font-medium">
                {t('blogPage.footerDesc', 'A experiência definitiva de dedução social no espaço. Junte-se a milhares de tripulantes e descubra quem é o traidor.')}
              </p>
              <div className="flex gap-4">
                <a href="https://www.youtube.com/@RAPMUGEN?sub_confirmation=1" target="_blank" rel="noopener noreferrer" title="YouTube" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Youtube className="w-6 h-6 text-white" />
                </a>
                <a href="https://www.instagram.com/jogodoimpostor/" target="_blank" rel="noopener noreferrer" title="Instagram" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" title="Discord" className="w-12 h-12 bg-slate-800 hover:bg-purple-600 rounded-2xl flex items-center justify-center transition-all hover:-translate-y-1">
                  <MessageCircle className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">{t('nav.navigation', 'NAVEGAÇÃO')}</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href={langPath('/')} className="hover:text-purple-400 transition-colors">{t('nav.home', 'Início')}</Link></li>
                <li><Link href={langPath('/temas')} className="hover:text-purple-400 transition-colors">Temas</Link></li>
                <li><Link href={langPath('/blog')} className="hover:text-purple-400 transition-colors">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href={langPath('/comojogar')} className="hover:text-purple-400 transition-colors">{t('nav.howToPlay', 'Como Jogar')}</Link></li>
                <li><Link href={langPath('/outros-jogos')} className="hover:text-purple-400 transition-colors">{t('nav.otherGames', 'Outros Jogos')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black mb-6 text-xl uppercase tracking-tighter">{t('nav.support', 'SUPORTE')}</h4>
              <ul className="flex flex-col gap-3 text-slate-400 font-bold text-left">
                <li><Link href={langPath('/termos')} className="hover:text-purple-400 transition-colors">{t('nav.terms', 'Termos de Uso')}</Link></li>
                <li><Link href={langPath('/privacidade')} className="hover:text-purple-400 transition-colors">{t('nav.privacy', 'Privacidade')}</Link></li>
                <li>
                  <a href="https://discord.gg/H3cjkcd7Pz" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                    {t('nav.officialDiscord', 'Discord Oficial')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-slate-500 font-bold">{t('blogPage.copyright', '© 2026 TikJogos Entertainment. Todos os direitos reservados.')}</p>
            <div className="flex items-center gap-2 text-slate-500 font-bold whitespace-nowrap">
              <span>{t('blogPage.madeWith', 'Feito com 💜 na Galáxia TikJogos')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
