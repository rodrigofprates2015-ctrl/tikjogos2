import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getSeoForPath, injectSeoIntoHtml } from "./seo";

export function serveStatic(app: Express) {
  // Works both when the server is bundled and when Render starts the TS source.
  const distPath = path.resolve(process.cwd(), "dist");
  
  const indexPath = path.join(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error(`Could not find index.html at: ${indexPath}`);
    throw new Error(`index.html not found in ${distPath}`);
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Ensure proper content types
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  // Inject SEO meta tags based on the requested URL
  app.use("*", (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const seo = getSeoForPath(req.originalUrl);
    if (seo) {
      if (seo.robots) res.setHeader('X-Robots-Tag', seo.robots);
      const html = injectSeoIntoHtml(indexHtml, seo);
      res.send(html);
    } else {
      // Unknown SPA URLs used to return the homepage with HTTP 200. Search
      // engines correctly classified many of those responses as soft 404s.
      const notFoundHtml = injectSeoIntoHtml(indexHtml, {
        title: 'Página não encontrada | TikJogos',
        description: 'A página solicitada não existe no TikJogos.',
        canonical: `https://tikjogos.com.br${req.path}`,
        robots: 'noindex, nofollow, noarchive',
      });
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
      res.status(404).send(notFoundHtml);
    }
  });
}
