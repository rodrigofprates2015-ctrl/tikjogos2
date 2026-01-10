import { Router } from 'express';
import { db } from './db';
import { analyticsEvents, rooms } from '@shared/schema';
import { sql, count, countDistinct, gte, and, lte } from 'drizzle-orm';

const router = Router();

// Middleware to verify admin (will be passed from main routes)
export function createAnalyticsRouter(verifyAdmin: any) {
  // GET /api/analytics/summary
  router.get('/summary', verifyAdmin, async (req, res) => {
    try {
      if (!db) {
        console.error('[Analytics API] Database not configured - DATABASE_URL missing');
        return res.status(503).json({ 
          error: 'Database not available',
          message: 'DATABASE_URL environment variable is not configured. Analytics requires a PostgreSQL database.'
        });
      }

      // Total pageviews (only pageview events, not unique_visitor)
      const totalPageviewsResult = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.eventType} = 'pageview'`);
      const totalPageviews = totalPageviewsResult[0]?.count || 0;

      // Total unique visitors (distinct visitor_id where event_type = 'unique_visitor')
      const totalUniqueVisitorsResult = await db
        .select({ count: countDistinct(analyticsEvents.visitorId) })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.eventType} = 'unique_visitor'`);
      const totalUniqueVisitors = totalUniqueVisitorsResult[0]?.count || 0;

      // Last 30 days pageviews (grouped by date)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const pageviewsLast30Days = await db
        .select({
          date: sql<string>`DATE(${analyticsEvents.createdAt})`,
          count: count(),
        })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'pageview'`)
        .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
        .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

      // Last 30 days unique visitors (grouped by date)
      const uniqueVisitorsLast30Days = await db
        .select({
          date: sql<string>`DATE(${analyticsEvents.createdAt})`,
          count: countDistinct(analyticsEvents.visitorId),
        })
        .from(analyticsEvents)
        .where(
          sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo} AND ${analyticsEvents.eventType} = 'unique_visitor'`
        )
        .groupBy(sql`DATE(${analyticsEvents.createdAt})`)
        .orderBy(sql`DATE(${analyticsEvents.createdAt})`);

      // Fill missing dates with zero counts
      const pageviewsTimeSeries = fillMissingDates(pageviewsLast30Days, 30);
      const uniqueVisitorsTimeSeries = fillMissingDates(uniqueVisitorsLast30Days, 30);

      res.json({
        totalPageviews,
        totalUniqueVisitors,
        pageviewsLast30Days: pageviewsTimeSeries,
        uniqueVisitorsLast30Days: uniqueVisitorsTimeSeries,
      });
    } catch (error: any) {
      console.error('[Analytics API] Error fetching summary:', error);
      
      // Check if it's a table not found error
      const isTableNotFound = error?.message?.includes('relation "analytics_events" does not exist') ||
                              error?.message?.includes('table') ||
                              error?.code === '42P01';
      
      if (isTableNotFound) {
        return res.status(503).json({ 
          error: 'Analytics table not created',
          message: 'Run "npm run db:push" to create the analytics_events table.'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to fetch analytics data',
        message: error?.message || 'Unknown error'
      });
    }
  });

  // GET /api/analytics/rooms-stats
  router.get('/rooms-stats', verifyAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ 
          error: 'Database not available',
          message: 'DATABASE_URL environment variable is not configured.'
        });
      }

      const now = new Date();
      
      // Start of today (00:00:00)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Start of this month (first day at 00:00:00)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Rooms created today
      const roomsTodayResult = await db
        .select({ count: count() })
        .from(rooms)
        .where(gte(rooms.createdAt, startOfToday));
      const roomsToday = roomsTodayResult[0]?.count || 0;
      
      // Rooms created this month
      const roomsMonthResult = await db
        .select({ count: count() })
        .from(rooms)
        .where(gte(rooms.createdAt, startOfMonth));
      const roomsMonth = roomsMonthResult[0]?.count || 0;
      
      // Total rooms ever created
      const roomsTotalResult = await db
        .select({ count: count() })
        .from(rooms);
      const roomsTotal = roomsTotalResult[0]?.count || 0;
      
      // Rooms by day for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const roomsLast30Days = await db
        .select({
          date: sql<string>`DATE(${rooms.createdAt})`,
          count: count(),
        })
        .from(rooms)
        .where(gte(rooms.createdAt, thirtyDaysAgo))
        .groupBy(sql`DATE(${rooms.createdAt})`)
        .orderBy(sql`DATE(${rooms.createdAt})`);
      
      // Fill missing dates
      const roomsTimeSeries = fillMissingDates(roomsLast30Days, 30);
      
      res.json({
        roomsToday,
        roomsMonth,
        roomsTotal,
        roomsLast30Days: roomsTimeSeries,
      });
    } catch (error: any) {
      console.error('[Analytics API] Error fetching rooms stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch rooms statistics',
        message: error?.message || 'Unknown error'
      });
    }
  });

  return router;
}

// Helper function to fill missing dates
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
