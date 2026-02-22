/**
 * Server-side SEO meta injection for SPA routes.
 * Replaces default title/description in index.html before sending to crawlers.
 * Also injects visible HTML content so search engines see real text, not an empty div.
 */

import { BLOG_POSTS_FULL, getBlogPostBySlug, markdownToHtml, type BlogPostFull } from './blogContent.js';

interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  articleSchema?: string;
  /** HTML content to inject inside the body for crawlers */
  bodyHtml?: string;
  /** hreflang alternate links */
  hreflangTags?: string;
}

const BASE_URL = 'https://tikjogos.com.br';

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
  '/como-jogar/jogo-do-impostor': {
    title: 'Como Jogar o Jogo do Impostor Online | TikJogos',
    description: 'Aprenda como jogar o Jogo do Impostor online. Regras, dicas e estratégias para jogar com amigos. Grátis e sem download.',
  },
  '/como-jogar/jogo-do-impostor-desenho': {
    title: 'Como Jogar Desenho do Impostor | TikJogos',
    description: 'Aprenda como jogar o Desenho do Impostor. Todos desenham a mesma palavra, menos o impostor! Regras, dicas e estratégias.',
  },
  '/como-jogar/sincronia': {
    title: 'Como Jogar Sincronia - Respostas em Comum | TikJogos',
    description: 'Aprenda como jogar Sincronia, o jogo onde você ganha pontos ao dar a mesma resposta que outros jogadores. Regras e estratégias.',
  },
  '/how-to-play/impostor-game': {
    title: 'How to Play Impostor Game Online | TikJogos',
    description: 'Learn how to play the Impostor Game online. Rules, tips and strategies to play with friends. Free, no download.',
  },
  '/how-to-play/impostor-drawing-game': {
    title: 'How to Play Impostor Drawing Game | TikJogos',
    description: 'Learn how to play Impostor Drawing. Everyone draws the same word except the impostor! Rules, tips and strategies.',
  },
  '/how-to-play/sincronia': {
    title: 'How to Play Sincronia - Common Answers | TikJogos',
    description: 'Learn how to play Sincronia, the game where you score by giving the same answer as other players. Rules and strategies.',
  },
  '/como-jugar/juego-del-impostor': {
    title: 'Cómo Jugar al Juego del Impostor Online | TikJogos',
    description: 'Aprende a jugar al Juego del Impostor online. Reglas, consejos y estrategias para jugar con amigos. Gratis y sin descarga.',
  },
  '/como-jugar/juego-del-impostor-dibujo': {
    title: 'Cómo Jugar Dibujo del Impostor | TikJogos',
    description: 'Aprende a jugar Dibujo del Impostor. ¡Todos dibujan la misma palabra menos el impostor! Reglas, consejos y estrategias.',
  },
  '/como-jugar/sincronia': {
    title: 'Cómo Jugar Sincronia - Respuestas en Común | TikJogos',
    description: 'Aprende a jugar Sincronia, el juego donde ganas puntos al dar la misma respuesta que otros jugadores. Reglas y estrategias.',
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

/** Parse a "DD Mon YYYY" date string into an ISO date */
function parseBlogDate(dateStr: string): string {
  const months: Record<string, string> = {
    'Jan': '01', 'Fev': '02', 'Mar': '03', 'Abr': '04',
    'Mai': '05', 'Jun': '06', 'Jul': '07', 'Ago': '08',
    'Set': '09', 'Out': '10', 'Nov': '11', 'Dez': '12',
  };
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }
  return new Date().toISOString();
}

/** Get localized title/excerpt for a blog post */
function getLocalizedPost(post: BlogPostFull, lang: string) {
  if (lang === 'en') return { title: post.titleEn, excerpt: post.excerptEn, slug: post.slugEn };
  if (lang === 'es') return { title: post.titleEs, excerpt: post.excerptEs, slug: post.slugEs };
  return { title: post.title, excerpt: post.excerpt, slug: post.slug };
}

/** Build hreflang link tags for a blog post */
function buildBlogHreflang(post: BlogPostFull): string {
  return [
    `<link rel="alternate" hreflang="pt" href="${BASE_URL}/blog/${post.slug}" />`,
    `<link rel="alternate" hreflang="en" href="${BASE_URL}/en/blog/${post.slugEn}" />`,
    `<link rel="alternate" hreflang="es" href="${BASE_URL}/es/blog/${post.slugEs}" />`,
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog/${post.slug}" />`,
  ].join('\n    ');
}

/** Build visible article HTML for crawlers */
function buildArticleHtml(post: BlogPostFull, lang: string): string {
  const loc = getLocalizedPost(post, lang);
  const contentHtml = markdownToHtml(post.content);
  return `<article itemscope itemtype="https://schema.org/BlogPosting" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
      <h1 itemprop="headline">${escapeHtml(loc.title)}</h1>
      <p itemprop="description">${escapeHtml(loc.excerpt)}</p>
      <meta itemprop="image" content="${post.image}" />
      <meta itemprop="datePublished" content="${parseBlogDate(post.date)}" />
      <span itemprop="author" itemscope itemtype="https://schema.org/Person">
        <meta itemprop="name" content="${escapeHtml(post.authorName)}" />
      </span>
      <div itemprop="articleBody">${contentHtml}</div>
    </article>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Get SEO metadata for a given URL path.
 * Returns null if no specific SEO data exists (use default).
 */
export function getSeoForPath(urlPath: string): SeoMeta | null {
  // Strip trailing slash (except root) and query string
  let path = urlPath.split('?')[0];
  path = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

  // Blog post pages: /blog/{slug}, /en/blog/{slug}, /es/blog/{slug}
  const blogMatch = path.match(/^(?:\/(en|es))?\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const lang = blogMatch[1] || 'pt';
    const slug = blogMatch[2];
    const post = getBlogPostBySlug(slug);
    if (post) {
      const loc = getLocalizedPost(post, lang);
      const langPrefix = lang === 'pt' ? '' : `/${lang}`;
      const canonical = `${BASE_URL}${langPrefix}/blog/${loc.slug}`;
      const isoDate = parseBlogDate(post.date);

      const articleSchema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': loc.title,
        'description': loc.excerpt,
        'image': post.image,
        'datePublished': isoDate,
        'dateModified': isoDate,
        'author': { '@type': 'Person', 'name': post.authorName },
        'publisher': {
          '@type': 'Organization',
          'name': 'TikJogos',
          'url': BASE_URL,
          'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/logo.png` },
        },
        'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical },
      });

      return {
        title: `${loc.title} - TikJogos Blog`,
        description: loc.excerpt,
        canonical,
        image: post.image,
        type: 'article',
        publishedTime: isoDate,
        author: post.authorName,
        articleSchema,
        bodyHtml: buildArticleHtml(post, lang),
        hreflangTags: buildBlogHreflang(post),
      };
    }
  }

  // Blog index: /blog, /en/blog, /es/blog
  const blogIndexMatch = path.match(/^(?:\/(en|es))?\/blog$/);
  if (blogIndexMatch) {
    const pageSeo = PAGE_SEO['/blog'];
    if (pageSeo) {
      const hreflang = [
        `<link rel="alternate" hreflang="pt" href="${BASE_URL}/blog" />`,
        `<link rel="alternate" hreflang="en" href="${BASE_URL}/en/blog" />`,
        `<link rel="alternate" hreflang="es" href="${BASE_URL}/es/blog" />`,
        `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog" />`,
      ].join('\n    ');

      // Build a list of blog posts as visible HTML for crawlers
      const listHtml = BLOG_POSTS_FULL.map(p => {
        return `<li><a href="${BASE_URL}/blog/${p.slug}">${escapeHtml(p.title)}</a> - ${escapeHtml(p.excerpt)}</li>`;
      }).join('\n        ');

      return {
        title: pageSeo.title,
        description: pageSeo.description,
        canonical: `${BASE_URL}${path}`,
        hreflangTags: hreflang,
        bodyHtml: `<nav style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-label="Blog posts">
      <h1>${escapeHtml(pageSeo.title)}</h1>
      <ul>
        ${listHtml}
      </ul>
    </nav>`,
      };
    }
  }

  // Theme pages: /jogo-do-impostor/temas/{slug}
  const themeMatch = path.match(/^\/jogo-do-impostor\/temas\/([a-z0-9-]+)$/);
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

  // Static pages (check with and without lang prefix)
  const langPageMatch = path.match(/^\/(en|es)(\/.*)?$/);
  if (langPageMatch) {
    const basePath = langPageMatch[2] || '/';
    const pageSeo = PAGE_SEO[basePath];
    if (pageSeo) {
      return {
        title: pageSeo.title,
        description: pageSeo.description,
        canonical: `${BASE_URL}${path}`,
      };
    }
  }

  const pageSeo = PAGE_SEO[path];
  if (pageSeo) {
    return {
      title: pageSeo.title,
      description: pageSeo.description,
      canonical: `${BASE_URL}${path}`,
    };
  }

  // Homepage
  if (path === '/' || path === '/en' || path === '/es') {
    const hreflang = [
      `<link rel="alternate" hreflang="pt" href="${BASE_URL}/" />`,
      `<link rel="alternate" hreflang="en" href="${BASE_URL}/en" />`,
      `<link rel="alternate" hreflang="es" href="${BASE_URL}/es" />`,
      `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`,
    ].join('\n    ');

    return {
      title: 'TikJogos - Jogo do Impostor Online Grátis Com Amigos | Impostor Game',
      description: 'Jogue Impostor online grátis! Encontre amigos, estratégias e desafie outros jogadores no TikJogos. Sem downloads.',
      canonical: `${BASE_URL}${path === '/' ? '/' : path}`,
      hreflangTags: hreflang,
      bodyHtml: `<main style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">
      <h1>TikJogos - Jogo do Impostor Online Grátis</h1>
      <p>Jogue o Jogo do Impostor online grátis com amigos! Dedução social, estratégia e diversão sem downloads. Crie uma sala, convide amigos e descubra quem é o impostor.</p>
      <h2>Modos de Jogo</h2>
      <ul>
        <li><a href="${BASE_URL}/como-jogar/jogo-do-impostor">Como Jogar Impostor</a></li>
        <li><a href="${BASE_URL}/como-jogar/jogo-do-impostor-desenho">Como Jogar Desenho</a></li>
        <li><a href="${BASE_URL}/como-jogar/sincronia">Como Jogar Sincronia</a></li>
        <li><a href="${BASE_URL}/modo-local">Modo Local</a></li>
        <li><a href="${BASE_URL}/temas">Temas</a></li>
        <li><a href="${BASE_URL}/blog">Blog</a></li>
        <li><a href="${BASE_URL}/outros-jogos">Outros Jogos</a></li>
      </ul>
      <h2>Posts Recentes</h2>
      <ul>
        ${BLOG_POSTS_FULL.slice(0, 5).map(p => `<li><a href="${BASE_URL}/blog/${p.slug}">${escapeHtml(p.title)}</a></li>`).join('\n        ')}
      </ul>
    </main>`,
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

  // Replace og:type for articles
  if (seo.type) {
    html = html.replace(
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:type" content="${seo.type}" />`
    );
  }

  // Replace og:image if provided
  if (seo.image) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:image" content="${seo.image}" />`
    );
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:image" content="${seo.image}" />`
    );
  }

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

  // Inject extra tags before </head>
  {
    let extraHead = '';

    if (seo.publishedTime) {
      extraHead += `\n    <meta property="article:published_time" content="${seo.publishedTime}" />`;
    }
    if (seo.author) {
      extraHead += `\n    <meta property="article:author" content="${seo.author}" />`;
    }
    if (seo.articleSchema) {
      extraHead += `\n    <script type="application/ld+json">${seo.articleSchema}</script>`;
    }
    if (seo.hreflangTags) {
      extraHead += `\n    ${seo.hreflangTags}`;
    }

    if (extraHead) {
      html = html.replace('</head>', `${extraHead}\n  </head>`);
    }
  }

  // Inject visible content into body for crawlers (positioned off-screen so
  // it doesn't flash before React hydrates, but fully readable by bots)
  if (seo.bodyHtml) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"></div>\n    ${seo.bodyHtml}`
    );
  }

  return html;
}
