import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { getSeoForPath, injectSeoIntoHtml } from "./seo";

export function serveStatic(app: Express) {
  // esbuild bundles everything into dist/, so __dirname is /app/dist
  const distPath = __dirname;
  
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
      const html = injectSeoIntoHtml(indexHtml, seo);
      res.send(html);
    } else {
      res.send(indexHtml);
    }
  });
}
