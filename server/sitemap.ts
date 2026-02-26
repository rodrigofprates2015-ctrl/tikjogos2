/**
 * Dynamic sitemap and robots.txt generation.
 * Reads theme slugs from seo.ts and blog posts from blogContent.ts
 * so new content is automatically included without manual XML edits.
 */
import type { Express } from 'express';
import { BLOG_POSTS_FULL } from './blogContent';

const BASE_URL = 'https://tikjogos.com.br';

// All theme slugs (must match THEME_SEO keys in seo.ts and routes in App.tsx)
const THEME_SLUGS = [
  'animes', 'attack-on-titan', 'bandas-de-rock', 'brawl-stars', 'bts',
  'chainsaw-man', 'clash-royale', 'classico', 'demon-slayer', 'disney',
  'dragon-ball', 'fnaf', 'fortnite', 'free-fire', 'futebol',
  'game-of-thrones', 'god-of-war', 'gta', 'harry-potter', 'herois',
  'jujutsu-kaisen', 'kpop', 'la-casa-de-papel', 'minecraft',
  'my-hero-academia', 'naruto', 'natal', 'one-piece', 'pokemon',
  'roblox', 'round-6', 'star-wars', 'stranger-things', 'super-herois',
  'supernatural', 'the-boys', 'the-walking-dead', 'tokyo-ghoul', 'valorant',
];

// i18n route groups: [pt, en, es]
const I18N_PAGES: Array<{ paths: [string, string, string]; priority: string; changefreq: string }> = [
  { paths: ['/', '/en', '/es'], priority: '1.0', changefreq: 'daily' },
  { paths: ['/como-jogar/jogo-do-impostor', '/en/how-to-play/impostor-game', '/es/como-jugar/juego-del-impostor'], priority: '0.9', changefreq: 'weekly' },
  { paths: ['/como-jogar/jogo-do-impostor-desenho', '/en/how-to-play/impostor-drawing-game', '/es/como-jugar/juego-del-impostor-dibujo'], priority: '0.8', changefreq: 'weekly' },
  { paths: ['/como-jogar/sincronia', '/en/how-to-play/sincronia', '/es/como-jugar/sincronia'], priority: '0.8', changefreq: 'weekly' },
  { paths: ['/desenho-impostor', '/en/desenho-impostor', '/es/desenho-impostor'], priority: '0.8', changefreq: 'weekly' },
  { paths: ['/respostas-em-comum', '/en/common-answers', '/es/respuestas-en-comun'], priority: '0.8', changefreq: 'weekly' },
  { paths: ['/modo-local', '/en/local-mode', '/es/modo-local'], priority: '0.7', changefreq: 'weekly' },
  { paths: ['/temas', '/en/temas', '/es/temas-del-juego'], priority: '0.8', changefreq: 'weekly' },
  { paths: ['/criar-tema', '/en/create-theme', '/es/crear-tema'], priority: '0.6', changefreq: 'monthly' },
  { paths: ['/doacoes', '/en/donations', '/es/donaciones'], priority: '0.5', changefreq: 'monthly' },
  { paths: ['/blog', '/en/blog', '/es/blog'], priority: '0.7', changefreq: 'weekly' },
];

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlEntry(loc: string, opts: { priority?: string; changefreq?: string; lastmod?: string; hreflangs?: [string, string, string] } = {}): string {
  const { priority = '0.5', changefreq = 'monthly', lastmod = today(), hreflangs } = opts;
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (hreflangs) {
    xml += `    <xhtml:link rel="alternate" hreflang="pt" href="${escapeXml(hreflangs[0])}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(hreflangs[1])}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${escapeXml(hreflangs[2])}" />\n`;
  }
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  xml += `  </url>`;
  return xml;
}

function generateMainSitemap(): string {
  const entries: string[] = [];

  for (const page of I18N_PAGES) {
    const [pt, en, es] = page.paths;
    const hreflangs: [string, string, string] = [
      `${BASE_URL}${pt}`,
      `${BASE_URL}${en}`,
      `${BASE_URL}${es}`,
    ];
    entries.push(urlEntry(`${BASE_URL}${pt}`, {
      priority: page.priority,
      changefreq: page.changefreq,
      hreflangs,
    }));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;
}

function generateTemasSitemap(): string {
  const entries: string[] = [];

  // Hub page
  entries.push(urlEntry(`${BASE_URL}/jogo-do-impostor/temas`, {
    priority: '0.8',
    changefreq: 'weekly',
  }));

  // Individual theme pages
  for (const slug of THEME_SLUGS) {
    entries.push(urlEntry(`${BASE_URL}/jogo-do-impostor/temas/${slug}`, {
      priority: '0.7',
      changefreq: 'monthly',
    }));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

function generateBlogSitemap(): string {
  const entries: string[] = [];

  // Blog index (with hreflangs)
  entries.push(urlEntry(`${BASE_URL}/blog`, {
    priority: '0.7',
    changefreq: 'weekly',
    hreflangs: [`${BASE_URL}/blog`, `${BASE_URL}/en/blog`, `${BASE_URL}/es/blog`],
  }));

  // Individual posts
  for (const post of BLOG_POSTS_FULL) {
    entries.push(urlEntry(`${BASE_URL}/blog/${post.slug}`, {
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: post.date || today(),
    }));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`;
}

function generateSitemapIndex(): string {
  const d = today();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${d}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-temas.xml</loc>
    <lastmod>${d}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blog.xml</loc>
    <lastmod>${d}</lastmod>
  </sitemap>
</sitemapindex>`;
}

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashadmin
Disallow: /ad-test
Disallow: /sala/
Disallow: /prototipo

Sitemap: ${BASE_URL}/sitemap_index.xml
`;

export function registerSitemapRoutes(app: Express) {
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(ROBOTS_TXT);
  });

  app.get('/sitemap_index.xml', (_req, res) => {
    res.type('application/xml').send(generateSitemapIndex());
  });

  app.get('/sitemap.xml', (_req, res) => {
    res.type('application/xml').send(generateMainSitemap());
  });

  app.get('/sitemap-temas.xml', (_req, res) => {
    res.type('application/xml').send(generateTemasSitemap());
  });

  app.get('/sitemap-blog.xml', (_req, res) => {
    res.type('application/xml').send(generateBlogSitemap());
  });
}
