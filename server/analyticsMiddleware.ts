import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { analyticsEvents, type InsertAnalyticsEvent } from '@shared/schema';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'visitor_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 365 days

// Paths to ignore (static assets, API health checks)
const IGNORE_PATHS = [
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|map)$/i,
  /^\/api\/health/,
  /^\/api\/version/,
];

export function analyticsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip tracking for ignored paths
  if (IGNORE_PATHS.some(pattern => pattern.test(req.path))) {
    return next();
  }

  // Extract or create visitor ID
  let visitorId = req.cookies?.[COOKIE_NAME];
  let eventType: 'unique_visitor' | 'pageview' = 'pageview';

  if (!visitorId) {
    visitorId = randomUUID();
    eventType = 'unique_visitor';
    
    res.cookie(COOKIE_NAME, visitorId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // Allow client-side reading
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // Extract metadata
  const ipAddress = extractRealIP(req);
  const userAgent = req.headers['user-agent'] || null;
  const pagePath = req.path;
  const referrer = req.headers['referer'] || null;

  // Async tracking (non-blocking)
  trackEvent({
    visitorId,
    eventType,
    ipAddress,
    userAgent,
    pagePath,
    referrer,
  }).catch(err => {
    console.error('[Analytics] Failed to track event:', err);
  });

  next();
}

function extractRealIP(req: Request): string | null {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    null
  );
}

async function trackEvent(data: Omit<InsertAnalyticsEvent, 'id' | 'createdAt'>) {
  if (!db) {
    console.warn('[Analytics] Database not available, skipping tracking');
    return;
  }

  try {
    await db.insert(analyticsEvents).values(data);
  } catch (error) {
    console.error('[Analytics] Error inserting event:', error);
  }
}
