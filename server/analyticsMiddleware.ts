import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { analyticsEvents, type InsertAnalyticsEvent } from '@shared/schema';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';

const COOKIE_NAME = 'visitor_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 365 days

// Debounce: prevent tracking the same page multiple times in quick succession
const recentPageviews = new Map<string, number>(); // visitorId+path -> timestamp
const DEBOUNCE_MS = 2000; // 2 seconds

// Paths to ignore (static assets, API health checks)
const IGNORE_PATHS = [
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|map|json|txt|xml|webmanifest)$/i,
  /^\/api\//,  // Ignore ALL API routes
  /^\/assets\//,
  /^\/node_modules\//,
  /^\/@/,  // Vite dev server paths
  /^\/favicon/,
  /^\/manifest/,
  /^\/site\.webmanifest$/,  // Explicitly ignore site.webmanifest
  /^\/robots/,
  /^\/sitemap/,
];

export async function analyticsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip tracking for ignored paths
  if (IGNORE_PATHS.some(pattern => pattern.test(req.path))) {
    return next();
  }

  // Only track GET requests for HTML pages
  if (req.method !== 'GET') {
    return next();
  }

  console.log(`[Analytics] Tracking: ${req.method} ${req.path}`);

  // Extract or create visitor ID
  let visitorId = req.cookies?.[COOKIE_NAME];
  let isNewVisitor = false;

  if (!visitorId) {
    visitorId = randomUUID();
    isNewVisitor = true;
    
    res.cookie(COOKIE_NAME, visitorId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // Allow client-side reading
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // Check if this visitor already has a unique_visitor record in the database
  let shouldTrackAsUnique = false;
  
  if (db && visitorId) {
    try {
      const existingVisitor = await db
        .select()
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.visitorId, visitorId),
            eq(analyticsEvents.eventType, 'unique_visitor')
          )
        )
        .limit(1);
      
      shouldTrackAsUnique = isNewVisitor || existingVisitor.length === 0;
      
      console.log(`[Analytics] Visitor: ${visitorId.substring(0, 8)}... | New: ${isNewVisitor} | ExistsInDB: ${existingVisitor.length > 0} | WillTrackUnique: ${shouldTrackAsUnique}`);
    } catch (error) {
      console.error('[Analytics] Error checking visitor:', error);
      shouldTrackAsUnique = isNewVisitor;
    }
  } else {
    shouldTrackAsUnique = isNewVisitor;
  }

  // Extract metadata
  const ipAddress = extractRealIP(req);
  const userAgent = req.headers['user-agent'] || null;
  const pagePath = req.path;
  const referrer = req.headers['referer'] || null;

  // Debounce: check if we recently tracked this exact page for this visitor
  const debounceKey = `${visitorId}:${pagePath}`;
  const lastTracked = recentPageviews.get(debounceKey);
  const now = Date.now();
  
  if (lastTracked && (now - lastTracked) < DEBOUNCE_MS) {
    console.log(`[Analytics] ⏭️  SKIPPED (debounce): ${pagePath} for ${visitorId.substring(0, 8)}... (${now - lastTracked}ms ago)`);
    return next();
  }
  
  recentPageviews.set(debounceKey, now);
  
  // Cleanup old entries (older than 10 seconds)
  const entriesToDelete: string[] = [];
  recentPageviews.forEach((timestamp, key) => {
    if (now - timestamp > 10000) {
      entriesToDelete.push(key);
    }
  });
  entriesToDelete.forEach(key => recentPageviews.delete(key));

  // Track unique visitor event (only once per visitor, checked in DB)
  if (shouldTrackAsUnique) {
    console.log(`[Analytics] → Registering UNIQUE_VISITOR for ${visitorId.substring(0, 8)}...`);
    trackEvent({
      visitorId,
      eventType: 'unique_visitor',
      ipAddress,
      userAgent,
      pagePath,
      referrer,
    }).catch(err => {
      console.error('[Analytics] Failed to track unique visitor:', err);
    });
  }

  // Always track pageview
  console.log(`[Analytics] → Registering PAGEVIEW for ${visitorId.substring(0, 8)}...`);
  trackEvent({
    visitorId,
    eventType: 'pageview',
    ipAddress,
    userAgent,
    pagePath,
    referrer,
  }).catch(err => {
    console.error('[Analytics] Failed to track pageview:', err);
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
