/**
 * Server-side SEO meta injection for SPA routes.
 * Replaces default title/description in index.html before sending to crawlers.
 */

interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
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

  return html;
}
