/**
 * Server-side SEO meta injection for SPA routes.
 * Replaces default title/description in index.html before sending to crawlers.
 */

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  /** Extra HTML to inject before </head> (hreflang, schema, etc.) */
  extraHead?: string;
  /** HTML content to inject inside <div id="root"> for SSR of blog posts */
  ssrContent?: string;
}

const BASE_URL = 'https://tikjogos.com.br';

// ── Blog post metadata (server-side mirror of client/src/data/blogPosts.ts) ──

interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  content: string;
  /** Translated slugs for hreflang */
  slugs: { en: string; es: string };
}

/**
 * Minimal blog post data needed for server-side SEO injection.
 * Keep in sync with client/src/data/blogPosts.ts.
 */
const BLOG_POSTS_META: BlogPostMeta[] = [
  {
    slug: 'jogo-do-impostor-desenho',
    title: 'Jogo do Impostor Desenho: A Nova Sensação que Combina Gartic e Impostor',
    excerpt: 'Descubra o Jogo do Impostor Desenho, a variante que une desenho colaborativo com dedução social. Saiba como jogar, estratégias e por que é tão viciante.',
    date: '2026-02-07',
    author: 'Equipe TikJogos',
    content: 'Você já jogou Jogo do Impostor Desenho? Se ainda não, prepare-se para descobrir a forma mais criativa, engraçada e desafiadora de jogar o clássico jogo de dedução social. Essa inovadora variante une o melhor do Gartic (desenho colaborativo) com a tensão do Impostor, criando uma experiência única.',
    slugs: { en: 'impostor-drawing-game', es: 'juego-del-impostor-dibujo' },
  },
  {
    slug: 'jogo-do-impostor-guia-de-estrategias-e-analise-do-metagame',
    title: 'Jogo do Impostor: Guia de Estratégias e Análise do Metagame no TikJogos',
    excerpt: 'Domine o jogo do impostor com táticas de especialista, análise comportamental e lógica sistêmica. Guia técnico completo.',
    date: '2026-02-06',
    author: 'Equipe TikJogos',
    content: 'O jogo do impostor tornou-se o epicentro da dedução social moderna. No TikJogos, a experiência é otimizada para oferecer o máximo de competitividade e profundidade estratégica.',
    slugs: { en: 'impostor-game-strategy-guide-and-metagame-analysis', es: 'juego-del-impostor-guia-de-estrategias-y-analisis-del-metagame' },
  },
  {
    slug: 'a-alma-dos-games-sociais-por-que-a-desconfianca-nos-fascina',
    title: 'A alma dos games sociais: Por que a desconfiança nos fascina?',
    excerpt: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural ao transformar a desconfiança em uma experiência profunda.',
    date: '2026-02-04',
    author: 'Equipe TikJogos',
    content: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural entre gamers e diversos grupos de amigos por conseguir transformar uma premissa extremamente simples em uma experiência psicológica profunda e muito intensa.',
    slugs: { en: 'the-soul-of-social-games-why-distrust-fascinates-us', es: 'el-alma-de-los-juegos-sociales-por-que-la-desconfianza-nos-fascina' },
  },
  {
    slug: 'tikjogos-partidas-mais-organizadas-e-estrategicas',
    title: 'TikJogos: Partidas mais organizadas e estratégicas',
    excerpt: 'Descubra como o TikJogos elimina a burocracia dos papéis e foca na pura diversão e dedução social.',
    date: '2026-02-03',
    author: 'Equipe TikJogos',
    content: 'Qualquer pessoa que já tenha tentado organizar uma partida do Jogo do Impostor de maneira estritamente tradicional sabe o quão frustrante a desorganização logística pode ser.',
    slugs: { en: 'tikjogos-more-organized-and-strategic-matches', es: 'tikjogos-partidas-mas-organizadas-y-estrategicas' },
  },
  {
    slug: 'estrategias-essenciais-para-quem-joga-como-impostor',
    title: 'Estratégias essenciais para quem joga como impostor',
    excerpt: 'Assumir o papel de vilão exige coerência narrativa e controle emocional. Aprenda a dominar a arte da camuflagem.',
    date: '2026-02-02',
    author: 'Equipe TikJogos',
    content: 'Assumir o papel de impostor exige muito mais do que apenas a capacidade de inventar mentiras. O verdadeiro desafio reside na manutenção de uma coerência narrativa impecável durante todo o desenrolar da partida.',
    slugs: { en: 'essential-strategies-for-playing-as-impostor', es: 'estrategias-esenciales-para-jugar-como-impostor' },
  },
  {
    slug: 'como-identificar-o-impostor-usando-logica-e-paciencia',
    title: 'Como identificar o impostor usando lógica e paciência',
    excerpt: 'Encontrar o impostor não é sorte, mas um processo rigoroso de análise comportamental e lógica.',
    date: '2026-02-01',
    author: 'Equipe TikJogos',
    content: 'Encontrar o impostor em meio a um grupo de amigos não é uma questão de sorte ou intuição mística, mas sim um processo rigoroso de análise lógica e paciência estratégica.',
    slugs: { en: 'how-to-identify-the-impostor-using-logic-and-patience', es: 'como-identificar-al-impostor-usando-logica-y-paciencia' },
  },
  {
    slug: 'por-que-a-comunicacao-define-o-vencedor-da-partida',
    title: 'Por que a comunicação define o vencedor da partida',
    excerpt: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores.',
    date: '2026-01-31',
    author: 'Equipe TikJogos',
    content: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores no Jogo do Impostor.',
    slugs: { en: 'why-communication-defines-the-winner', es: 'por-que-la-comunicacion-define-al-ganador' },
  },
  {
    slug: 'o-segredo-psicologico-por-tras-do-sucesso-do-genero',
    title: 'O segredo psicológico por trás do sucesso do gênero',
    excerpt: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura.',
    date: '2026-01-30',
    author: 'Equipe TikJogos',
    content: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura nos jogos de dedução social.',
    slugs: { en: 'the-psychological-secret-behind-the-genres-success', es: 'el-secreto-psicologico-detras-del-exito-del-genero' },
  },
  {
    slug: 'desenvolvimento-cognitivo-exercitando-a-mente-no-espaco',
    title: 'Desenvolvimento Cognitivo: Exercitando a mente no espaço',
    excerpt: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
    date: '2026-01-29',
    author: 'Equipe TikJogos',
    content: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
    slugs: { en: 'cognitive-development-exercising-the-mind-in-space', es: 'desarrollo-cognitivo-ejercitando-la-mente-en-el-espacio' },
  },
  {
    slug: 'erros-comuns-de-iniciantes-e-como-evita-los',
    title: 'Erros comuns de iniciantes e como evitá-los',
    excerpt: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no jogo.',
    date: '2026-01-28',
    author: 'Equipe TikJogos',
    content: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no Jogo do Impostor.',
    slugs: { en: 'common-beginner-mistakes-and-how-to-avoid-them', es: 'errores-comunes-de-principiantes-y-como-evitarlos' },
  },
];

/** Look up a blog post by any slug (pt, en, or es) */
function findBlogPostBySlug(slug: string): BlogPostMeta | undefined {
  // PT slug (primary)
  const byPt = BLOG_POSTS_META.find(p => p.slug === slug);
  if (byPt) return byPt;
  // EN/ES slugs
  return BLOG_POSTS_META.find(p => p.slugs.en === slug || p.slugs.es === slug);
}

/** Build hreflang link tags for a blog post */
function buildHreflangTags(post: BlogPostMeta): string {
  const ptUrl = `${BASE_URL}/blog/${post.slug}`;
  const enUrl = `${BASE_URL}/en/blog/${post.slugs.en}`;
  const esUrl = `${BASE_URL}/es/blog/${post.slugs.es}`;
  return [
    `<link rel="alternate" hreflang="pt" href="${ptUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="es" href="${esUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${ptUrl}" />`,
  ].join('\n    ');
}

/** Build Article + BreadcrumbList JSON-LD for a blog post */
function buildBlogSchema(post: BlogPostMeta, canonical: string): string {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author, url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'TikJogos', url: BASE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    inLanguage: 'pt-BR',
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TikJogos', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };
  return [
    `<script type="application/ld+json">${JSON.stringify(article)}</script>`,
    `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`,
  ].join('\n    ');
}

/** Build minimal SSR HTML for a blog post so crawlers see real content */
function buildBlogSsrContent(post: BlogPostMeta): string {
  // Escape HTML entities in content
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return [
    `<article>`,
    `<h1>${esc(post.title)}</h1>`,
    `<p><strong>${esc(post.author)}</strong> &middot; ${esc(post.date)}</p>`,
    `<p>${esc(post.excerpt)}</p>`,
    `<div>${esc(post.content)}</div>`,
    `</article>`,
  ].join('');
}

// Theme SEO data — must match client/src/data/themes.ts
const THEME_SEO: Record<string, { title: string; description: string }> = {
  classico: {
    title: 'Jogo do Impostor Clássico Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Clássico! Palavras do dia a dia para partidas de dedução social. Grátis e online.',
  },
  natal: {
    title: 'Jogo do Impostor Natal Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Natal! Palavras natalinas para partidas de dedução social. Grátis e online.',
  },
  'clash-royale': {
    title: 'Jogo do Impostor Clash Royale Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Clash Royale! Tropas, feitiços e termos do jogo da Supercell. Grátis e online.',
  },
  animes: {
    title: 'Jogo do Impostor Animes Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Animes! Personagens e termos do mundo dos animes. Grátis e online.',
  },
  herois: {
    title: 'Jogo do Impostor Super Heróis Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Super Heróis! Heróis, vilões e poderes do universo dos quadrinhos. Grátis e online.',
  },
  'super-herois': {
    title: 'Jogo do Impostor Super Heróis Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Super Heróis! Heróis, vilões e poderes do universo dos quadrinhos. Grátis e online.',
  },
  'stranger-things': {
    title: 'Jogo do Impostor Stranger Things Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Stranger Things! Personagens e termos da série da Netflix. Grátis e online.',
  },
  futebol: {
    title: 'Jogo do Impostor Futebol Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Futebol! Termos, jogadores e táticas do esporte mais popular do mundo. Grátis e online.',
  },
  disney: {
    title: 'Jogo do Impostor Disney Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Disney! Personagens e filmes do universo Disney. Grátis e online.',
  },
  valorant: {
    title: 'Jogo do Impostor Valorant Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Valorant! Agentes, mapas e termos do FPS tático da Riot Games. Grátis e online.',
  },
  roblox: {
    title: 'Jogo do Impostor Roblox Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Roblox! Termos e referências da plataforma de jogos. Grátis e online.',
  },
  supernatural: {
    title: 'Jogo do Impostor Supernatural Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Supernatural! Personagens e termos da série de caçadores. Grátis e online.',
  },
  'dragon-ball': {
    title: 'Jogo do Impostor Dragon Ball Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Dragon Ball! Personagens, golpes e transformações do anime. Grátis e online.',
  },
  naruto: {
    title: 'Jogo do Impostor Naruto Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Naruto! Ninjas, jutsus e termos do universo Naruto. Grátis e online.',
  },
  'bandas-de-rock': {
    title: 'Jogo do Impostor Bandas de Rock Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Bandas de Rock! Bandas lendárias e termos do rock. Grátis e online.',
  },
  minecraft: {
    title: 'Jogo do Impostor Minecraft Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Minecraft! Blocos, mobs e termos do jogo sandbox. Grátis e online.',
  },
  gta: {
    title: 'Jogo do Impostor GTA Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema GTA! Personagens e termos da franquia Grand Theft Auto. Grátis e online.',
  },
  fnaf: {
    title: 'Jogo do Impostor FNAF Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema FNAF! Animatrônicos e termos de Five Nights at Freddy\'s. Grátis e online.',
  },
  fortnite: {
    title: 'Jogo do Impostor Fortnite Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Fortnite! Battle Royale, skins e termos do jogo da Epic Games. Grátis e online.',
  },
  'free-fire': {
    title: 'Jogo do Impostor Free Fire Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Free Fire! Termos do Battle Royale da Garena. Grátis e online.',
  },
  'brawl-stars': {
    title: 'Jogo do Impostor Brawl Stars Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Brawl Stars! Brawlers, modos e termos do jogo da Supercell. Grátis e online.',
  },
  pokemon: {
    title: 'Jogo do Impostor Pokémon Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Pokémon! Treinadores, pokémons e termos do universo Pokémon. Grátis e online.',
  },
  'god-of-war': {
    title: 'Jogo do Impostor God of War Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema God of War! Kratos, mitologia e termos da saga épica. Grátis e online.',
  },
  kpop: {
    title: 'Jogo do Impostor K-POP Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema K-POP! Grupos como BTS, BLACKPINK, TWICE e mais. Grátis e online.',
  },
  bts: {
    title: 'Jogo do Impostor BTS Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema BTS! Membros, músicas e termos do grupo de K-POP. Grátis e online.',
  },
  'harry-potter': {
    title: 'Jogo do Impostor Harry Potter Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Harry Potter! Personagens, feitiços e locais do mundo bruxo. Grátis e online.',
  },
  'star-wars': {
    title: 'Jogo do Impostor Star Wars Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Star Wars! Jedis, Siths e termos da galáxia. Grátis e online.',
  },
  'the-walking-dead': {
    title: 'Jogo do Impostor The Walking Dead Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema The Walking Dead! Personagens e termos do apocalipse zumbi. Grátis e online.',
  },
  'la-casa-de-papel': {
    title: 'Jogo do Impostor La Casa de Papel Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema La Casa de Papel! Personagens e termos da série de assaltos. Grátis e online.',
  },
  'the-boys': {
    title: 'Jogo do Impostor The Boys Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema The Boys! Supes, Vought e termos da série de anti-heróis. Grátis e online.',
  },
  'game-of-thrones': {
    title: 'Jogo do Impostor Game of Thrones Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Game of Thrones! Casas, personagens e termos de Westeros. Grátis e online.',
  },
  'round-6': {
    title: 'Jogo do Impostor Round 6 Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Round 6 (Squid Game)! Jogos, personagens e termos da série coreana. Grátis e online.',
  },
  'one-piece': {
    title: 'Jogo do Impostor One Piece Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema One Piece! Piratas, Akuma no Mi e termos do Grand Line. Grátis e online.',
  },
  'attack-on-titan': {
    title: 'Jogo do Impostor Attack on Titan Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Attack on Titan! Titãs e termos de Shingeki no Kyojin. Grátis e online.',
  },
  'jujutsu-kaisen': {
    title: 'Jogo do Impostor Jujutsu Kaisen Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Jujutsu Kaisen! Feiticeiros, maldições e termos do anime. Grátis e online.',
  },
  'demon-slayer': {
    title: 'Jogo do Impostor Demon Slayer Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Demon Slayer! Caçadores e respirações de Kimetsu no Yaiba. Grátis e online.',
  },
  'my-hero-academia': {
    title: 'Jogo do Impostor My Hero Academia Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema My Hero Academia! Heróis, vilões e Quirks de Boku no Hero. Grátis e online.',
  },
  'tokyo-ghoul': {
    title: 'Jogo do Impostor Tokyo Ghoul Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Tokyo Ghoul! Ghouls, investigadores e termos do anime. Grátis e online.',
  },
  'chainsaw-man': {
    title: 'Jogo do Impostor Chainsaw Man Online – Tema Oficial | TikJogos',
    description: 'Jogue o jogo do Impostor com o tema Chainsaw Man! Demônios, caçadores e termos do anime. Grátis e online.',
  },
};

// Static page SEO data
const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/como-jogar': {
    title: 'Como Jogar o Jogo do Impostor Online | TikJogos',
    description: 'Aprenda como jogar o Jogo do Impostor online. Regras, dicas e estratégias para jogar com amigos. Grátis e sem download.',
  },
  '/comojogar': {
    title: 'Como Jogar o Jogo do Impostor Online | TikJogos',
    description: 'Aprenda como jogar o Jogo do Impostor online. Regras, dicas e estratégias para jogar com amigos. Grátis e sem download.',
  },
  '/modo-local': {
    title: 'Jogo do Impostor Modo Local – Jogar Offline | TikJogos',
    description: 'Jogue o Jogo do Impostor no modo local, passando o celular entre amigos. Sem internet necessária.',
  },
  '/outros-jogos': {
    title: 'Outros Jogos Online Grátis | TikJogos',
    description: 'Descubra outros jogos online grátis no TikJogos. Jogos de dedução, estratégia e diversão com amigos.',
  },
  '/temas': {
    title: 'Todos os Temas do Jogo do Impostor | TikJogos',
    description: 'Explore todos os temas disponíveis no Jogo do Impostor. Animes, séries, games e muito mais. Grátis e online.',
  },
  '/jogo-do-impostor/temas': {
    title: 'Todos os Temas do Jogo do Impostor | TikJogos',
    description: 'Explore todos os temas disponíveis no Jogo do Impostor. Animes, séries, games e muito mais. Grátis e online.',
  },
  '/blog': {
    title: 'Blog do Jogo do Impostor | TikJogos',
    description: 'Dicas, estratégias e novidades sobre o Jogo do Impostor. Leia artigos sobre dedução social e jogos online.',
  },
  '/modos-de-jogo': {
    title: 'Modos de Jogo do Impostor | TikJogos',
    description: 'Conheça todos os modos de jogo do Impostor: Palavra Secreta, Quem Sou Eu e mais. Grátis e online.',
  },
  '/modos': {
    title: 'Modos de Jogo do Impostor | TikJogos',
    description: 'Conheça todos os modos de jogo do Impostor: Palavra Secreta, Quem Sou Eu e mais. Grátis e online.',
  },
  '/termo': {
    title: 'Termo – Jogo de Palavras Online | TikJogos',
    description: 'Jogue Termo online grátis no TikJogos. Descubra a palavra do dia em 6 tentativas.',
  },
};

/**
 * Get SEO metadata for a given URL path.
 * Returns null if no specific SEO data exists (use default).
 */
export function getSeoForPath(urlPath: string): SeoMeta | null {
  // Blog post pages: /blog/{slug}, /en/blog/{slug}, /es/blog/{slug}
  const blogMatch = urlPath.match(/^(?:\/(en|es))?\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[2];
    const post = findBlogPostBySlug(slug);
    if (post) {
      const canonical = `${BASE_URL}/blog/${post.slug}`;
      return {
        title: `${post.title} | TikJogos Blog`,
        description: post.excerpt,
        canonical,
        extraHead: [buildHreflangTags(post), buildBlogSchema(post, canonical)].join('\n    '),
        ssrContent: buildBlogSsrContent(post),
      };
    }
  }

  // Theme pages: /jogo-do-impostor/temas/{slug}
  const themeMatch = urlPath.match(/^\/jogo-do-impostor\/temas\/([a-z0-9-]+)$/);
  if (themeMatch) {
    const slug = themeMatch[1];
    const seo = THEME_SEO[slug];
    if (seo) {
      return {
        title: seo.title,
        description: seo.description,
        canonical: `${BASE_URL}/jogo-do-impostor/temas/${slug}`,
      };
    }
  }

  // Static pages
  const pageSeo = PAGE_SEO[urlPath];
  if (pageSeo) {
    return {
      title: pageSeo.title,
      description: pageSeo.description,
      canonical: `${BASE_URL}${urlPath}`,
    };
  }

  return null;
}

/**
 * Inject SEO meta tags into HTML string, replacing defaults.
 */
export function injectSeoIntoHtml(html: string, seo: SeoMeta): string {
  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${seo.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${seo.description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${seo.canonical}" />`
  );

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${seo.title}" />`
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${seo.description}" />`
  );

  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${seo.canonical}" />`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${seo.title}" />`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${seo.description}" />`
  );

  // Replace twitter:url
  html = html.replace(
    /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:url" content="${seo.canonical}" />`
  );

  // Inject extra head content (hreflang, schema) before </head>
  if (seo.extraHead) {
    html = html.replace('</head>', `    ${seo.extraHead}\n  </head>`);
  }

  // Inject SSR content inside <div id="root"> for crawlers
  if (seo.ssrContent) {
    html = html.replace('<div id="root"></div>', `<div id="root">${seo.ssrContent}</div>`);
  }

  return html;
}
