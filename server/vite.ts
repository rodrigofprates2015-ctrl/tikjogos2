import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfigFn from "../vite.config";
import fs from "fs";
import path from "path";
import { getSeoForPath, injectSeoIntoHtml } from "./seo";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const resolvedConfig = typeof viteConfigFn === "function"
    ? await viteConfigFn({ command: "serve", mode: "development" }, { mode: "development", command: "serve", isSsrBuild: false, isPreview: false })
    : viteConfigFn;

  const vite = await createViteServer({
    ...resolvedConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        console.error('[Vite Error]:', msg);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      let page = await vite.transformIndexHtml(url, template);

      const seo = getSeoForPath(url);
      if (seo) {
        page = injectSeoIntoHtml(page, seo);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      console.error('[Vite Transform Error]:', e);
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
