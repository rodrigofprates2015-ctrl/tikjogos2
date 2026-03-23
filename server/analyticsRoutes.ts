import { Router } from 'express';
import { db } from './db';
import { analyticsEvents, rooms } from '@shared/schema';
import { sql, count, countDistinct, gte, avg, lt } from 'drizzle-orm';
import { trackSessionEnd } from './analyticsMiddleware';
import { getRCRoomStats } from './rcGame';
import { getBRRoomStats } from './sincBrGame';
import { getImpostorRoomStats, getDrawingRoomStats } from './routes';

const router = Router();

// Safe query wrapper: returns fallback on failure (handles missing columns gracefully)
async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e) { console.warn('[Analytics] Query fallback:', (e as any)?.message?.slice(0, 80)); return fallback; }
}

export function createAnalyticsRouter(verifyAdmin: any) {

  // ─── POST /api/analytics/session-end (public, called by client) ───
  router.post('/session-end', async (req, res) => {
    try {
      const { visitorId, duration } = req.body;
      if (!visitorId || typeof duration !== 'number') {
        return res.status(400).json({ error: 'Missing visitorId or duration' });
      }
      await trackSessionEnd(visitorId, duration, req);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  });

  // ─── POST /api/analytics/reset (admin only — zeroes all analytics data) ───
  router.post('/reset', verifyAdmin, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not available' });
      // Delete all analytics events
      await db.delete(analyticsEvents);
      // Delete all room records from DB
      await db.delete(rooms);
      console.log('[Analytics] All analytics data and room records reset by admin');
      res.json({ ok: true, message: 'All analytics data reset' });
    } catch (error: any) {
      console.error('[Analytics] Reset error:', error);
      res.status(500).json({ error: error?.message });
    }
  });

  // ─── GET /api/analytics/dashboard (main endpoint) ───
  router.get('/dashboard', verifyAdmin, async (req, res) => {
    try {
      if (!db) {
        // Return in-memory game stats when DB is unavailable
        const emptyDays = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (29 - i));
          return { date: d.toISOString().split('T')[0], count: 0 };
        });
        return res.json({
          overview: {
            totalPageviews: 0, totalUniqueVisitors: 0, totalPlayers: 0,
            avgSessionDuration: 0,
            changes: { pageviews: 0, visitors: 0, players: 0, session: 0 },
          },
          timeSeries: { pageviews: emptyDays, visitors: emptyDays, rooms: emptyDays },
          devices: [], browsers: [],
          geo: { countries: [], cities: [] },
          games: {
            roomsTotal: 0, roomsToday: 0, roomsMonth: 0, activeRooms: 0,
            abandonmentRate: 0, avgRoomDuration: 0,
            gameModes: [], themeUsage: [], roomsLast30Days: emptyDays, roomsPerDayMonth: [],
          },
          impostor: await getImpostorRoomStats(),
          drawing: getDrawingRoomStats(),
          sincronia: getRCRoomStats(),
          palavra: getBRRoomStats(),
          topPages: [], referrers: [],
        });
      }

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // ── Overview KPIs (no session_duration) ──
      const [
        totalPageviewsRes,
        totalUniqueVisitorsRes,
        totalPlayersRes,
        weekPageviewsRes,
        weekVisitorsRes,
        weekPlayersRes,
        prevWeekPageviewsRes,
        prevWeekVisitorsRes,
        prevWeekPlayersRes,
      ] = await Promise.all([
        db.select({ count: count() }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'pageview'`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'unique_visitor'`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'room_join'`),
        db.select({ count: count() }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.createdAt} >= ${sevenDaysAgo}`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'unique_visitor' AND ${analyticsEvents.createdAt} >= ${sevenDaysAgo}`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'room_join' AND ${analyticsEvents.createdAt} >= ${sevenDaysAgo}`),
        db.select({ count: count() }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.createdAt} >= ${fourteenDaysAgo} AND ${analyticsEvents.createdAt} < ${sevenDaysAgo}`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'unique_visitor' AND ${analyticsEvents.createdAt} >= ${fourteenDaysAgo} AND ${analyticsEvents.createdAt} < ${sevenDaysAgo}`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'room_join' AND ${analyticsEvents.createdAt} >= ${fourteenDaysAgo} AND ${analyticsEvents.createdAt} < ${sevenDaysAgo}`),
      ]);

      // Session duration queries (may fail if column doesn't exist yet)
      const avgSessionRes = await safeQuery(
        () => db!.select({ avg: avg(sql`CAST(${analyticsEvents.sessionDuration} AS INTEGER)`) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'session_end' AND ${analyticsEvents.sessionDuration} IS NOT NULL`),
        [{ avg: null }] as any
      );
      const weekSessionRes = await safeQuery(
        () => db!.select({ avg: avg(sql`CAST(${analyticsEvents.sessionDuration} AS INTEGER)`) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'session_end' AND ${analyticsEvents.sessionDuration} IS NOT NULL AND ${analyticsEvents.createdAt} >= ${sevenDaysAgo}`),
        [{ avg: null }] as any
      );
      const prevWeekSessionRes = await safeQuery(
        () => db!.select({ avg: avg(sql`CAST(${analyticsEvents.sessionDuration} AS INTEGER)`) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'session_end' AND ${analyticsEvents.sessionDuration} IS NOT NULL AND ${analyticsEvents.createdAt} >= ${fourteenDaysAgo} AND ${analyticsEvents.createdAt} < ${sevenDaysAgo}`),
        [{ avg: null }] as any
      );

      // ── Time series (30 days) ──
      const [pageviewsTS, visitorsTS, roomsTS] = await Promise.all([
        db.select({ date: sql<string>`DATE(${analyticsEvents.createdAt})`, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'pageview'`)
          .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
          .orderBy(sql`DATE(${analyticsEvents.createdAt})`),
        db.select({ date: sql<string>`DATE(${analyticsEvents.createdAt})`, count: countDistinct(analyticsEvents.visitorId) })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'unique_visitor'`)
          .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
          .orderBy(sql`DATE(${analyticsEvents.createdAt})`),
        db.select({ date: sql<string>`DATE(${rooms.createdAt})`, count: count() })
          .from(rooms)
          .where(gte(rooms.createdAt, thirtyDaysAgo))
          .groupBy(sql`DATE(${rooms.createdAt})`)
          .orderBy(sql`DATE(${rooms.createdAt})`),
      ]);

      // ── Devices & Browsers (may fail if columns missing) ──
      const deviceStats = await safeQuery(
        () => db!.select({ deviceType: analyticsEvents.deviceType, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.deviceType} IS NOT NULL`)
          .groupBy(analyticsEvents.deviceType),
        []
      );
      const browserStats = await safeQuery(
        () => db!.select({ browser: analyticsEvents.browser, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.browser} IS NOT NULL`)
          .groupBy(analyticsEvents.browser)
          .orderBy(sql`count(*) DESC`)
          .limit(10),
        []
      );

      // ── Geo (may fail if columns missing) ──
      const countryStats = await safeQuery(
        () => db!.select({ country: analyticsEvents.country, count: countDistinct(analyticsEvents.visitorId) })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'unique_visitor' AND ${analyticsEvents.country} IS NOT NULL`)
          .groupBy(analyticsEvents.country)
          .orderBy(sql`count(DISTINCT ${analyticsEvents.visitorId}) DESC`)
          .limit(10),
        []
      );
      const cityStats = await safeQuery(
        () => db!.select({ city: analyticsEvents.city, count: countDistinct(analyticsEvents.visitorId) })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'unique_visitor' AND ${analyticsEvents.city} IS NOT NULL`)
          .groupBy(analyticsEvents.city)
          .orderBy(sql`count(DISTINCT ${analyticsEvents.visitorId}) DESC`)
          .limit(10),
        []
      );

      // ── Rooms / Games ──
      const [roomsTotalRes, roomsTodayRes, roomsMonthRes] = await Promise.all([
        db.select({ count: count() }).from(rooms),
        db.select({ count: count() }).from(rooms).where(gte(rooms.createdAt, startOfToday)),
        db.select({ count: count() }).from(rooms).where(gte(rooms.createdAt, startOfMonth)),
      ]);

      const gameModeStats = await safeQuery(
        () => db!.select({ gameMode: analyticsEvents.gameMode, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'room_join' AND ${analyticsEvents.gameMode} IS NOT NULL`)
          .groupBy(analyticsEvents.gameMode)
          .orderBy(sql`count(*) DESC`)
          .limit(10),
        []
      );

      const roomJoinCounts = await safeQuery(
        () => db!.select({ roomCode: analyticsEvents.roomCode, count: countDistinct(analyticsEvents.visitorId) })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'room_join' AND ${analyticsEvents.roomCode} IS NOT NULL AND ${analyticsEvents.createdAt} >= ${thirtyDaysAgo}`)
          .groupBy(analyticsEvents.roomCode),
        []
      );

      // Calculate abandonment rate (rooms with 0 joins / total rooms in period)
      const roomsCreatedLast30 = roomsTS.reduce((sum, d) => sum + d.count, 0);
      const roomsWithPlayers = roomJoinCounts.length;
      const abandonmentRate = roomsCreatedLast30 > 0
        ? Math.round(((roomsCreatedLast30 - roomsWithPlayers) / roomsCreatedLast30) * 100)
        : 0;

      // Active rooms (in-memory, from storage)
      // We'll count rooms with status != 'finished' from the rooms table
      const activeRoomsRes = await db
        .select({ count: count() })
        .from(rooms)
        .where(sql`${rooms.status} != 'finished'`);

      // Theme usage stats
      const themeStats = await db
        .select({
          gameMode: rooms.gameMode,
          count: count(),
        })
        .from(rooms)
        .where(sql`${rooms.gameMode} IS NOT NULL AND ${rooms.createdAt} >= ${thirtyDaysAgo}`)
        .groupBy(rooms.gameMode)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Average room duration (may fail if session_duration column missing)
      const avgRoomDurationRes = await safeQuery(
        () => db!.select({ avg: avg(sql`CAST(${analyticsEvents.sessionDuration} AS INTEGER)`) })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'session_end' AND ${analyticsEvents.roomCode} IS NOT NULL AND ${analyticsEvents.sessionDuration} IS NOT NULL AND ${analyticsEvents.createdAt} >= ${thirtyDaysAgo}`),
        [{ avg: null }] as any
      );

      // Rooms created per day (for monthly chart saving)
      const roomsPerDayMonth = await db
        .select({ date: sql<string>`DATE(${rooms.createdAt})`, count: count() })
        .from(rooms)
        .where(gte(rooms.createdAt, startOfMonth))
        .groupBy(sql`DATE(${rooms.createdAt})`)
        .orderBy(sql`DATE(${rooms.createdAt})`);

      // Top pages visited
      const topPages = await safeQuery(
        () => db!.select({ page: analyticsEvents.pagePath, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.pagePath} IS NOT NULL AND ${analyticsEvents.createdAt} >= ${thirtyDaysAgo}`)
          .groupBy(analyticsEvents.pagePath)
          .orderBy(sql`count(*) DESC`)
          .limit(10),
        []
      );

      // Referrer stats
      const referrerStats = await safeQuery(
        () => db!.select({ referrer: analyticsEvents.referrer, count: count() })
          .from(analyticsEvents)
          .where(sql`${analyticsEvents.eventType} = 'pageview' AND ${analyticsEvents.referrer} IS NOT NULL AND ${analyticsEvents.referrer} != '' AND ${analyticsEvents.createdAt} >= ${thirtyDaysAgo}`)
          .groupBy(analyticsEvents.referrer)
          .orderBy(sql`count(*) DESC`)
          .limit(10),
        []
      );

      const calcChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const weekPV = weekPageviewsRes[0]?.count || 0;
      const prevPV = prevWeekPageviewsRes[0]?.count || 0;
      const weekUV = weekVisitorsRes[0]?.count || 0;
      const prevUV = prevWeekVisitorsRes[0]?.count || 0;
      const weekPL = weekPlayersRes[0]?.count || 0;
      const prevPL = prevWeekPlayersRes[0]?.count || 0;
      const weekSess = Number(weekSessionRes[0]?.avg) || 0;
      const prevSess = Number(prevWeekSessionRes[0]?.avg) || 0;

      res.json({
        overview: {
          totalPageviews: totalPageviewsRes[0]?.count || 0,
          totalUniqueVisitors: totalUniqueVisitorsRes[0]?.count || 0,
          totalPlayers: totalPlayersRes[0]?.count || 0,
          avgSessionDuration: Math.round(Number(avgSessionRes[0]?.avg) || 0),
          changes: {
            pageviews: calcChange(weekPV, prevPV),
            visitors: calcChange(weekUV, prevUV),
            players: calcChange(weekPL, prevPL),
            session: calcChange(weekSess, prevSess),
          },
        },
        timeSeries: {
          pageviews: fillMissingDates(pageviewsTS, 30),
          visitors: fillMissingDates(visitorsTS, 30),
          rooms: fillMissingDates(roomsTS, 30),
        },
        devices: (deviceStats || []).map(d => ({ name: d.deviceType || 'unknown', value: d.count })),
        browsers: (browserStats || []).map(b => ({ name: b.browser || 'unknown', value: b.count })),
        geo: {
          countries: (countryStats || []).map(c => ({ name: c.country || 'unknown', value: c.count })),
          cities: (cityStats || []).map(c => ({ name: c.city || 'unknown', value: c.count })),
        },
        games: {
          roomsTotal: roomsTotalRes[0]?.count || 0,
          roomsToday: roomsTodayRes[0]?.count || 0,
          roomsMonth: roomsMonthRes[0]?.count || 0,
          activeRooms: activeRoomsRes[0]?.count || 0,
          abandonmentRate,
          avgRoomDuration: Math.round(Number(avgRoomDurationRes[0]?.avg) || 0),
          gameModes: (gameModeStats || []).map(g => ({ name: g.gameMode || 'unknown', value: g.count })),
          themeUsage: (themeStats || []).map(t => ({ name: t.gameMode || 'unknown', value: t.count })),
          roomsLast30Days: fillMissingDates(roomsTS, 30),
          roomsPerDayMonth: roomsPerDayMonth.map(d => ({ date: d.date, count: d.count })),
        },
        impostor: await getImpostorRoomStats(),
        drawing: getDrawingRoomStats(),
        sincronia: getRCRoomStats(),
        palavra: getBRRoomStats(),
        topPages: (topPages || []).map(p => ({ name: p.page || '/', value: p.count })),
        referrers: (referrerStats || []).map(r => ({ name: r.referrer || 'direct', value: r.count })),
      });
    } catch (error: any) {
      console.error('[Analytics API] Error fetching dashboard:', error);
      
      if (error?.code === '42P01') {
        return res.status(503).json({
          error: 'Analytics table not created',
          message: 'Run "npm run db:push" to create the analytics_events table.',
        });
      }
      
      res.status(500).json({
        error: 'Failed to fetch analytics data',
        message: error?.message || 'Unknown error',
      });
    }
  });

  // Keep legacy endpoints for backward compatibility
  router.get('/summary', verifyAdmin, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not available' });
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [pvRes, uvRes, pvTS, uvTS] = await Promise.all([
        db.select({ count: count() }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'pageview'`),
        db.select({ count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.eventType} = 'unique_visitor'`),
        db.select({ date: sql<string>`DATE(${analyticsEvents.createdAt})`, count: count() }).from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'pageview'`).groupBy(sql`DATE(${analyticsEvents.createdAt})`).orderBy(sql`DATE(${analyticsEvents.createdAt})`),
        db.select({ date: sql<string>`DATE(${analyticsEvents.createdAt})`, count: countDistinct(analyticsEvents.visitorId) }).from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'unique_visitor'`).groupBy(sql`DATE(${analyticsEvents.createdAt})`).orderBy(sql`DATE(${analyticsEvents.createdAt})`),
      ]);
      res.json({ totalPageviews: pvRes[0]?.count || 0, totalUniqueVisitors: uvRes[0]?.count || 0, pageviewsLast30Days: fillMissingDates(pvTS, 30), uniqueVisitorsLast30Days: fillMissingDates(uvTS, 30) });
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  });

  router.get('/rooms-stats', verifyAdmin, async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not available' });
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [todayRes, monthRes, totalRes, tsRes] = await Promise.all([
        db.select({ count: count() }).from(rooms).where(gte(rooms.createdAt, startOfToday)),
        db.select({ count: count() }).from(rooms).where(gte(rooms.createdAt, startOfMonth)),
        db.select({ count: count() }).from(rooms),
        db.select({ date: sql<string>`DATE(${rooms.createdAt})`, count: count() }).from(rooms).where(gte(rooms.createdAt, thirtyDaysAgo)).groupBy(sql`DATE(${rooms.createdAt})`).orderBy(sql`DATE(${rooms.createdAt})`),
      ]);
      res.json({ roomsToday: todayRes[0]?.count || 0, roomsMonth: monthRes[0]?.count || 0, roomsTotal: totalRes[0]?.count || 0, roomsLast30Days: fillMissingDates(tsRes, 30) });
    } catch (error: any) {
      res.status(500).json({ error: error?.message });
    }
  });

  return router;
}

function fillMissingDates(
  data: Array<{ date: string; count: number }>,
  days: number
): Array<{ date: string; count: number }> {
  const result: Array<{ date: string; count: number }> = [];
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
    });
  }

  return result;
}
