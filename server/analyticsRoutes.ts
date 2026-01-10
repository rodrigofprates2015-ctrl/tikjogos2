import { Router } from 'express';
import { db } from './db';
import { analyticsEvents } from '@shared/schema';
import { sql, count, countDistinct } from 'drizzle-orm';

const router = Router();

// Middleware to verify admin (will be passed from main routes)
export function createAnalyticsRouter(verifyAdmin: any) {
  // GET /api/analytics/summary
  router.get('/summary', verifyAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }

      // Total pageviews (all events)
      const totalPageviewsResult = await db
        .select({ count: count() })
        .from(analyticsEvents);
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
        .where(sql`${analyticsEvents.createdAt} >= ${thirtyDaysAgo}`)
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
    } catch (error) {
      console.error('[Analytics API] Error fetching summary:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
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
