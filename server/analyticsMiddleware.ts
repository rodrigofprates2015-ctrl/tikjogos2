import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { analyticsEvents, type InsertAnalyticsEvent } from '@shared/schema';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'visitor_id';
const UNIQUE_COOKIE_NAME = 'visitor_seen';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 365 days

const recentPageviews = new Map<string, number>();
const DEBOUNCE_MS = 30000;
const QUOTA_BACKOFF_MS = 10 * 60 * 1000;
let analyticsPausedUntil = 0;

const IGNORE_PATHS = [
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|map|json|txt|xml|webmanifest)$/i,
  /^\/api\//,
  /^\/assets\//,
  /^\/node_modules\//,
  /^\/@/,
  /^\/favicon/,
  /^\/manifest/,
  /^\/site\.webmanifest$/,
  /^\/robots/,
  /^\/sitemap/,
];

function parseDeviceType(ua: string): string {
  if (!ua) return 'unknown';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function parseBrowser(ua: string): string {
  if (!ua) return 'unknown';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/brave/i.test(ua)) return 'Brave';
  if (/vivaldi/i.test(ua)) return 'Vivaldi';
  if (/samsungbrowser/i.test(ua)) return 'Samsung Browser';
  if (/ucbrowser/i.test(ua)) return 'UC Browser';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/crios/i.test(ua) || (/chrome/i.test(ua) && !/chromium/i.test(ua))) return 'Chrome';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

function extractGeo(req: Request): { country: string | null; city: string | null } {
  const country = (req.headers['cf-ipcountry'] as string) ||
    (req.headers['x-vercel-ip-country'] as string) ||
    (req.headers['x-country'] as string) ||
    null;
  const city = (req.headers['cf-ipcity'] as string) ||
    (req.headers['x-vercel-ip-city'] as string) ||
    (req.headers['x-city'] as string) ||
    null;
  return { country, city };
}

export function extractRealIP(req: Request): string | null {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    null
  );
}

export async function analyticsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (IGNORE_PATHS.some(pattern => pattern.test(req.path))) {
    return next();
  }

  if (req.method !== 'GET') {
    return next();
  }

  let visitorId = req.cookies?.[COOKIE_NAME];
  let isNewVisitor = false;

  if (!visitorId) {
    visitorId = randomUUID();
    isNewVisitor = true;
    
    res.cookie(COOKIE_NAME, visitorId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  const shouldTrackAsUnique = isNewVisitor || req.cookies?.[UNIQUE_COOKIE_NAME] !== '1';
  if (shouldTrackAsUnique) {
    res.cookie(UNIQUE_COOKIE_NAME, '1', {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  const ipAddress = extractRealIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const pagePath = req.path;
  const referrer = req.headers['referer'] || null;
  const deviceType = parseDeviceType(userAgent);
  const browser = parseBrowser(userAgent);
  const { country, city } = extractGeo(req);

  const debounceKey = `${visitorId}:${pagePath}`;
  const lastTracked = recentPageviews.get(debounceKey);
  const now = Date.now();
  
  if (lastTracked && (now - lastTracked) < DEBOUNCE_MS) {
    return next();
  }
  
  recentPageviews.set(debounceKey, now);
  
  const entriesToDelete: string[] = [];
  recentPageviews.forEach((timestamp, key) => {
    if (now - timestamp > 10000) {
      entriesToDelete.push(key);
    }
  });
  entriesToDelete.forEach(key => recentPageviews.delete(key));

  const baseData = {
    visitorId,
    ipAddress,
    userAgent,
    pagePath,
    referrer,
    deviceType,
    browser,
    country,
    city,
  };

  if (shouldTrackAsUnique) {
    trackEvent({ ...baseData, eventType: 'unique_visitor' }).catch(() => {});
  }

  trackEvent({ ...baseData, eventType: 'pageview' }).catch(() => {});

  next();
}

// Track when a user joins a room
export async function trackRoomJoin(visitorId: string, roomCode: string, gameMode: string | null, req: Request) {
  const userAgent = req.headers['user-agent'] || '';
  const { country, city } = extractGeo(req);
  
  await trackEvent({
    visitorId,
    eventType: 'room_join',
    ipAddress: extractRealIP(req),
    userAgent,
    pagePath: `/room/${roomCode}`,
    referrer: null,
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    country,
    city,
    roomCode,
    gameMode,
  }).catch(() => {});
}

// Track session end with duration
export async function trackSessionEnd(visitorId: string, durationSeconds: number, req: Request) {
  const userAgent = req.headers['user-agent'] || '';
  const { country, city } = extractGeo(req);
  
  await trackEvent({
    visitorId,
    eventType: 'session_end',
    ipAddress: extractRealIP(req),
    userAgent,
    pagePath: null,
    referrer: null,
    deviceType: parseDeviceType(userAgent),
    browser: parseBrowser(userAgent),
    country,
    city,
    sessionDuration: String(durationSeconds),
  }).catch(() => {});
}

async function trackEvent(data: Omit<InsertAnalyticsEvent, 'id' | 'createdAt'>) {
  if (!db) return;
  if (Date.now() < analyticsPausedUntil) return;

  try {
    await db.insert(analyticsEvents).values(data);
  } catch (error) {
    if (isComputeQuotaError(error)) {
      analyticsPausedUntil = Date.now() + QUOTA_BACKOFF_MS;
      console.warn('[Analytics] Database compute quota exceeded; pausing analytics writes temporarily');
      return;
    }
    console.error('[Analytics] Error inserting event:', error);
  }
}

function isComputeQuotaError(error: unknown): boolean {
  const message = String((error as any)?.message || error || '').toLowerCase();
  return message.includes('compute time quota') || message.includes('exceeded the compute');
}
