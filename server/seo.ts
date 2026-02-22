/**
 * Server-side SEO meta injection for SPA routes.
 * Replaces default title/description in index.html before sending to crawlers.
 */

interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
  articleSchema?: string;
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

// Blog post SEO data — inlined here because client/src/data/blogPosts.ts uses
// Vite path aliases (@/) and React component imports that don't resolve server-side.
interface BlogPostSeo {
  slug: string;
  slugEn: string;
  slugEs: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  authorName: string;
}

const BLOG_POSTS_SEO: BlogPostSeo[] = [
  {
    slug: 'jogo-do-impostor-desenho',
    slugEn: 'impostor-drawing-game',
    slugEs: 'juego-del-impostor-dibujo',
    title: 'Jogo do Impostor Desenho: A Nova Sensação que Combina Gartic e Impostor',
    excerpt: 'Descubra o Jogo do Impostor Desenho, a variante que une desenho colaborativo com dedução social. Saiba como jogar, estratégias e por que é tão viciante.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200',
    date: '07 Fev 2026',
    authorName: 'Equipe TikJogos',
  },
  {
    slug: 'jogo-do-impostor-guia-de-estrategias-e-analise-do-metagame',
    slugEn: 'impostor-game-strategy-guide-and-metagame-analysis',
    slugEs: 'juego-del-impostor-guia-de-estrategias-y-analisis-del-metagame',
    title: 'Jogo do Impostor: Guia de Estratégias e Análise do Metagame no TikJogos',
    excerpt: 'Domine o jogo do impostor com táticas de especialista, análise comportamental e lógica sistêmica. Guia técnico completo.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    date: '06 Fev 2026',
    authorName: 'Estrategista Chefe',
  },
  {
    slug: 'a-alma-dos-games-sociais-por-que-a-desconfianca-nos-fascina',
    slugEn: 'the-soul-of-social-games-why-distrust-fascinates-us',
    slugEs: 'el-alma-de-los-juegos-sociales-por-que-la-desconfianza-nos-fascina',
    title: 'A alma dos games sociais: Por que a desconfiança nos fascina?',
    excerpt: 'O Jogo do Impostor consolidou-se como um verdadeiro fenômeno cultural ao transformar a desconfiança em uma experiênca profunda.',
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200',
    date: '04 Fev 2026',
    authorName: 'Dr. Nexus',
  },
  {
    slug: 'tikjogos-partidas-mais-organizadas-e-estrategicas',
    slugEn: 'tikjogos-more-organized-and-strategic-matches',
    slugEs: 'tikjogos-partidas-mas-organizadas-y-estrategicas',
    title: 'TikJogos: Partidas mais organizadas e estratégicas',
    excerpt: 'Descubra como o TikJogos elimina a burocracia dos papéis e foca na pura diversão e dedução social.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    date: '03 Fev 2026',
    authorName: 'Comandante Nova',
  },
  {
    slug: 'estrategias-essenciais-para-quem-joga-como-impostor',
    slugEn: 'essential-strategies-for-playing-as-impostor',
    slugEs: 'estrategias-esenciales-para-jugar-como-impostor',
    title: 'Estratégias essenciais para quem joga como impostor',
    excerpt: 'Assumir o papel de vilão exige coerência narrativa e controle emocional. Aprenda a dominar a arte da camuflagem.',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200',
    date: '02 Fev 2026',
    authorName: 'O Infiltrado',
  },
  {
    slug: 'como-identificar-o-impostor-usando-logica-e-paciencia',
    slugEn: 'how-to-identify-the-impostor-using-logic-and-patience',
    slugEs: 'como-identificar-al-impostor-usando-logica-y-paciencia',
    title: 'Como identificar o impostor usando lógica e paciência',
    excerpt: 'Encontrar o impostor não é sorte, mas um processo rigoroso de análise comportamental e lógica.',
    image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&q=80&w=1200',
    date: '01 Fev 2026',
    authorName: 'Detetive Orion',
  },
  {
    slug: 'por-que-a-comunicacao-define-o-vencedor-da-partida',
    slugEn: 'why-communication-defines-the-winner',
    slugEs: 'por-que-la-comunicacion-define-al-ganador',
    title: 'Por que a comunicação define o vencedor da partida',
    excerpt: 'Saber falar com clareza e ouvir com atenção são as competências decisivas que separam vencedores de perdedores.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200',
    date: '31 Jan 2026',
    authorName: 'Capitão Miller',
  },
  {
    slug: 'o-segredo-psicologico-por-tras-do-sucesso-do-genero',
    slugEn: 'the-psychological-secret-behind-the-genres-success',
    slugEs: 'el-secreto-psicologico-detras-del-exito-del-genero',
    title: 'O segredo psicológico por trás do sucesso do gênero',
    excerpt: 'Entenda o conceito do "círculo mágico" e como ele nos permite explorar facetas da nossa personalidade de forma segura.',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=1200',
    date: '30 Jan 2026',
    authorName: 'Luna Star',
  },
  {
    slug: 'desenvolvimento-cognitivo-exercitando-a-mente-no-espaco',
    slugEn: 'cognitive-development-exercising-the-mind-in-space',
    slugEs: 'desarrollo-cognitivo-ejercitando-la-mente-en-el-espacio',
    title: 'Desenvolvimento Cognitivo: Exercitando a mente no espaço',
    excerpt: 'Participar ativamente de rodadas do Jogo do Impostor é um exercício excelente para a tomada de decisões rápidas e análise crítica.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    date: '29 Jan 2026',
    authorName: 'Profe Galática',
  },
  {
    slug: 'erros-comuns-de-iniciantes-e-como-evita-los',
    slugEn: 'common-beginner-mistakes-and-how-to-avoid-them',
    slugEs: 'errores-comunes-de-principiantes-y-como-evitarlos',
    title: 'Erros comuns de iniciantes e como evitá-los',
    excerpt: 'Não caia em armadilhas comportamentais! Saiba por que falar demais pode ser o seu fim no jogo.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1200',
    date: '28 Jan 2026',
    authorName: 'Equipe Tech',
  },
];

// Build lookup maps: slug -> BlogPostSeo (for PT, EN, ES slugs)
const BLOG_SLUG_MAP = new Map<string, BlogPostSeo>();
for (const post of BLOG_POSTS_SEO) {
  BLOG_SLUG_MAP.set(post.slug, post);
  BLOG_SLUG_MAP.set(post.slugEn, post);
  BLOG_SLUG_MAP.set(post.slugEs, post);
}

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

/**
 * Get SEO metadata for a given URL path.
 * Returns null if no specific SEO data exists (use default).
 */
export function getSeoForPath(urlPath: string): SeoMeta | null {
  // Strip trailing slash (except root)
  const path = urlPath.length > 1 && urlPath.endsWith('/') ? urlPath.slice(0, -1) : urlPath;

  // Blog post pages: /blog/{slug}, /en/blog/{slug}, /es/blog/{slug}
  const blogMatch = path.match(/^(?:\/(en|es))?\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const lang = blogMatch[1] || 'pt';
    const slug = blogMatch[2];
    const post = BLOG_SLUG_MAP.get(slug);
    if (post) {
      const canonicalSlug = lang === 'en' ? post.slugEn : lang === 'es' ? post.slugEs : post.slug;
      const langPrefix = lang === 'pt' ? '' : `/${lang}`;
      const canonical = `${BASE_URL}${langPrefix}/blog/${canonicalSlug}`;
      const isoDate = parseBlogDate(post.date);

      const articleSchema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt,
        'image': post.image,
        'datePublished': isoDate,
        'dateModified': isoDate,
        'author': {
          '@type': 'Person',
          'name': post.authorName,
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'TikJogos',
          'url': BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': `${BASE_URL}/logo.png`,
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonical,
        },
      });

      return {
        title: `${post.title} - TikJogos Blog`,
        description: post.excerpt,
        canonical,
        image: post.image,
        type: 'article',
        publishedTime: isoDate,
        author: post.authorName,
        articleSchema,
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

  // Inject article-specific meta tags and JSON-LD schema before </head>
  if (seo.publishedTime || seo.author || seo.articleSchema) {
    let extraTags = '';
    if (seo.publishedTime) {
      extraTags += `\n    <meta property="article:published_time" content="${seo.publishedTime}" />`;
    }
    if (seo.author) {
      extraTags += `\n    <meta property="article:author" content="${seo.author}" />`;
    }
    if (seo.articleSchema) {
      extraTags += `\n    <script type="application/ld+json">${seo.articleSchema}</script>`;
    }
    html = html.replace('</head>', `${extraTags}\n  </head>`);
  }

  return html;
}
