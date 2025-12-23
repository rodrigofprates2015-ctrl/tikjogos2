import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const isProduction = process.env.NODE_ENV === "production";
  
  let sessionSecret = process.env.SESSION_SECRET;
  
  if (!sessionSecret) {
    if (isProduction) {
      throw new Error("SESSION_SECRET environment variable is required in production");
    }
    console.warn("SESSION_SECRET not set. Using development-only fallback.");
    sessionSecret = "dev-only-secret-not-for-production";
  }
  
  const sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
    },
  };

  if (process.env.DATABASE_URL) {
    try {
      const pgStore = connectPg(session);
      const store = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
      });
      sessionConfig.store = store;
      console.log("PostgreSQL session store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL session store:", error);
      console.log("Falling back to in-memory session store");
    }
  }

  return session(sessionConfig);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn("GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
    
    app.get("/api/login", (_req, res) => {
      res.status(503).json({ 
        message: "GitHub authentication not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET." 
      });
    });

    app.get("/api/auth/user", (_req, res) => {
      res.status(401).json({ message: "Unauthorized" });
    });

    return;
  }

  const callbackURL = process.env.GITHUB_CALLBACK_URL || 
    (process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/github/callback`
      : "http://localhost:5000/api/auth/github/callback");

  passport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
          const names = (profile.displayName || profile.username || "").split(" ");
          
          const userData = {
            id: `github_${profile.id}`,
            email,
            firstName: names[0] || profile.username,
            lastName: names.slice(1).join(" ") || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
          };

          await storage.upsertUser(userData);

          done(null, {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            accessToken,
          });
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.get("/api/login", passport.authenticate("github", { scope: ["user:email"] }));

  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/api/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
