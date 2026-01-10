import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { analyticsMiddleware } from "./analyticsMiddleware";

const app = express();

// Add cache-control headers to prevent stale assets
app.use((req, res, next) => {
  if (req.url === '/' || req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(analyticsMiddleware);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // Import and run seed
  import("./seed").catch(err => console.error("Seed failed:", err));

  // Catch-all for unhandled routes before error handler
  // This prevents the error handler from showing "Oops!" page for valid SPA routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    // If we get here and it's not an API route, it means no route matched
    // But we should let the SPA handle it (for client-side routing)
    if (!req.path.startsWith('/api') && !res.headersSent) {
      // Don't call next() with error, just pass through
      // The static file handler or Vite will serve the SPA
      return next();
    }
    next();
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error with full stack trace
    console.error(`[Error Handler] ${status} ${req.method} ${req.path}`);
    console.error(`[Error Handler] Message:`, message);
    console.error(`[Error Handler] Stack:`, err.stack);

    // Check if response has already been sent
    if (res.headersSent) {
      console.error('[Error Handler] Headers already sent, cannot send error response');
      return;
    }

    // For API routes, return JSON error
    if (req.path.startsWith('/api')) {
      res.status(status).json({ message });
      return;
    }

    // For non-API routes, let the SPA handle it (don't show error page)
    // This allows React Router to handle 404s and other client-side routing
    console.log('[Error Handler] Non-API route error, passing to next handler');
    next();
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Handle server errors
  httpServer.on('error', (error: any) => {
    console.error('Server error:', error);
  });

  // Handle client connection errors
  httpServer.on('clientError', (err: any, socket: any) => {
    console.error('Client error:', err.message);
    if (err.code === 'ECONNRESET' || !socket.writable) {
      return;
    }
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('[Uncaught Exception]:', error);
    console.error('[Uncaught Exception] Stack:', error.stack);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Unhandled Rejection] at:', promise);
    console.error('[Unhandled Rejection] reason:', reason);
  });
})();
