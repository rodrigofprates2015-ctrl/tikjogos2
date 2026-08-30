import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { pool } from "./db";

const scrypt = promisify(scryptCallback);

type SafeUser = { id: string; email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null; authProvider: string; createdAt?: Date | null; lastLoginAt?: Date | null };
const memoryUsers = new Map<string, SafeUser & { passwordHash?: string | null }>();

function safeUser(row: any): SafeUser {
  return { id: row.id, email: row.email ?? null, firstName: row.first_name ?? row.firstName ?? null, lastName: row.last_name ?? row.lastName ?? null, profileImageUrl: row.profile_image_url ?? row.profileImageUrl ?? null, authProvider: row.auth_provider ?? row.authProvider ?? "email", createdAt: row.created_at ?? row.createdAt ?? null, lastLoginAt: row.last_login_at ?? row.lastLoginAt ?? null };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(key, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

async function findUserById(id: string) {
  if (!pool) return memoryUsers.get(id) ?? null;
  const result = await (pool as any).query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return result.rows[0] ?? null;
}

async function findUserByEmail(email: string) {
  if (!pool) return Array.from(memoryUsers.values()).find((user) => user.email === email) ?? null;
  const result = await (pool as any).query("SELECT * FROM users WHERE lower(email) = $1 LIMIT 1", [email]);
  return result.rows[0] ?? null;
}

async function saveOAuthUser(profile: { googleId: string; email: string; firstName?: string; lastName?: string; picture?: string }) {
  const existing = await findUserByEmail(profile.email);
  const id = existing?.id ?? `google_${profile.googleId}`;
  if (!pool) {
    const user = { id, email: profile.email, firstName: profile.firstName ?? null, lastName: profile.lastName ?? null, profileImageUrl: profile.picture ?? null, authProvider: existing?.authProvider === "email" ? "email,google" : "google", createdAt: existing?.createdAt ?? new Date(), lastLoginAt: new Date() };
    memoryUsers.set(id, user);
    return user;
  }
  const result = await (pool as any).query(
    `INSERT INTO users (id,email,first_name,last_name,profile_image_url,auth_provider,google_id,last_login_at)
     VALUES ($1,$2,$3,$4,$5,'google',$6,NOW())
     ON CONFLICT (email) DO UPDATE SET google_id=$6, profile_image_url=COALESCE(EXCLUDED.profile_image_url,users.profile_image_url), auth_provider=CASE WHEN users.auth_provider LIKE '%email%' THEN 'email,google' ELSE 'google' END, last_login_at=NOW(), updated_at=NOW()
     RETURNING *`,
    [id, profile.email, profile.firstName ?? null, profile.lastName ?? null, profile.picture ?? null, profile.googleId],
  );
  return result.rows[0];
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || (isProduction ? "" : "dev-only-secret-not-for-production");
  if (!sessionSecret) throw new Error("SESSION_SECRET environment variable is required in production");
  const config: session.SessionOptions = { name: "tikjogos.sid", secret: sessionSecret, resave: false, saveUninitialized: false, cookie: { httpOnly: true, secure: isProduction, maxAge: sessionTtl, sameSite: "lax" } };
  if (process.env.DATABASE_URL) {
    const PgStore = connectPg(session);
    config.store = new PgStore({ conObject: { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }, createTableIfMissing: true, ttl: sessionTtl, tableName: "sessions" });
  }
  return session(config);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => { try { const user = await findUserById(id); done(null, user ? safeUser(user) : false); } catch (error) { done(error); } });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const email = String(req.body.email ?? "").trim().toLowerCase();
      const password = String(req.body.password ?? "");
      const name = String(req.body.name ?? "").trim();
      if (!/^\S+@\S+\.\S+$/.test(email) || name.length < 2 || password.length < 8) return res.status(400).json({ error: "Informe nome, e-mail válido e senha com pelo menos 8 caracteres." });
      if (await findUserByEmail(email)) return res.status(409).json({ error: "Este e-mail já está cadastrado." });
      const passwordHash = await hashPassword(password);
      const id = `email_${randomBytes(12).toString("hex")}`;
      const names = name.split(/\s+/);
      let user: any;
      if (!pool) { user = { id, email, firstName: names[0], lastName: names.slice(1).join(" ") || null, profileImageUrl: null, authProvider: "email", passwordHash, createdAt: new Date(), lastLoginAt: new Date() }; memoryUsers.set(id, user); }
      else { const result = await (pool as any).query(`INSERT INTO users (id,email,first_name,last_name,password_hash,auth_provider,last_login_at) VALUES ($1,$2,$3,$4,$5,'email',NOW()) RETURNING *`, [id,email,names[0],names.slice(1).join(" ")||null,passwordHash]); user=result.rows[0]; }
      req.login(safeUser(user), (error) => error ? next(error) : res.status(201).json(safeUser(user)));
    } catch (error) { next(error); }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const email = String(req.body.email ?? "").trim().toLowerCase();
      const user = await findUserByEmail(email);
      const storedHash = user?.password_hash ?? user?.passwordHash;
      if (!user || !storedHash || !(await verifyPassword(String(req.body.password ?? ""), storedHash))) return res.status(401).json({ error: "E-mail ou senha incorretos." });
      if (pool) await (pool as any).query("UPDATE users SET last_login_at=NOW(), updated_at=NOW() WHERE id=$1", [user.id]);
      req.login(safeUser(user), (error) => error ? next(error) : res.json(safeUser(user)));
    } catch (error) { next(error); }
  });

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallback = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
  app.get("/api/auth/google", (req, res) => {
    if (!googleClientId || !googleClientSecret) return res.redirect("/entrar?google=unavailable");
    const state = randomBytes(24).toString("hex");
    (req.session as any).googleOAuthState = state;
    const requestedReturnTo = String(req.query.returnTo ?? "");
    (req.session as any).googleOAuthReturnTo = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/conta";
    const params = new URLSearchParams({ client_id: googleClientId, redirect_uri: googleCallback, response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });
  app.get("/api/auth/google/callback", async (req, res, next) => {
    try {
      if (!googleClientId || !googleClientSecret || req.query.state !== (req.session as any).googleOAuthState) return res.redirect("/entrar?google=error");
      delete (req.session as any).googleOAuthState;
      const returnTo = (req.session as any).googleOAuthReturnTo || "/conta";
      delete (req.session as any).googleOAuthReturnTo;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: String(req.query.code ?? ""), client_id: googleClientId, client_secret: googleClientSecret, redirect_uri: googleCallback, grant_type: "authorization_code" }) });
      if (!tokenResponse.ok) return res.redirect("/entrar?google=error");
      const tokens: any = await tokenResponse.json();
      const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      const profile: any = await profileResponse.json();
      if (!profile.email || !profile.email_verified) return res.redirect("/entrar?google=unverified");
      const user = await saveOAuthUser({ googleId: profile.sub, email: profile.email.toLowerCase(), firstName: profile.given_name, lastName: profile.family_name, picture: profile.picture });
      req.login(safeUser(user), (error) => error ? next(error) : res.redirect(returnTo));
    } catch (error) { next(error); }
  });

  app.post("/api/auth/logout", (req, res) => req.logout(() => req.session.destroy(() => res.json({ success: true }))));
  app.get("/api/logout", (req, res) => req.logout(() => req.session.destroy(() => res.redirect("/"))));
  app.get("/api/auth/user", (req, res) => res.json(req.isAuthenticated() && req.user ? req.user : null));
  app.get("/api/auth/providers", (_req, res) => res.json({ google: Boolean(googleClientId && googleClientSecret), email: true }));
}

export const isAuthenticated: RequestHandler = (req, res, next) => req.isAuthenticated() ? next() : res.status(401).json({ message: "Unauthorized" });
