/**
 * OPTIMIZED ANALYTICS QUERIES
 * Reduz compute time no Render limitando dados e usando índices
 */

import { db } from './db';
import { analyticsEvents } from '@shared/schema';
import { desc, and, gte } from 'drizzle-orm';
import { addDays } from 'date-fns';

/**
 * ✅ OTIMIZADO: Busca apenas últimos 30 dias
 * ❌ ANTES: Buscava TUDO desde o início
 */
export async function getAnalyticsEventsOptimized(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate))
      .limit(10000)  // ← Importante: limite máximo
      .orderBy(desc(analyticsEvents.createdAt));
    
    return events;
  } catch (error) {
    console.error('[Analytics] Error fetching events:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Pageviews agregados por dia
 * Muito mais rápido que processar linha por linha
 */
export async function getPageviewsAggregated(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= $1
         AND event_type = 'pageview'
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 31`,
      [startDate]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('[Analytics] Error aggregating pageviews:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Visitantes únicos por dia (com limite)
 */
export async function getUniqueVisitorsAggregated(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT visitor_id) as count
       FROM analytics_events
       WHERE created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 31`,
      [startDate]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('[Analytics] Error counting unique visitors:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Devices (top 10 apenas)
 */
export async function getDevicesAggregated(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        device_type,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= $1
       GROUP BY device_type
       ORDER BY count DESC
       LIMIT 10`,
      [startDate]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('[Analytics] Error getting devices:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Browsers (top 10 apenas)
 */
export async function getBrowsersAggregated(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        browser_name,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= $1
       GROUP BY browser_name
       ORDER BY count DESC
       LIMIT 10`,
      [startDate]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('[Analytics] Error getting browsers:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Países (top 10 apenas)
 */
export async function getCountriesAggregated(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        COALESCE(country, 'Unknown') as country,
        COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= $1
       GROUP BY country
       ORDER BY count DESC
       LIMIT 10`,
      [startDate]
    );
    
    return result.rows || [];
  } catch (error) {
    console.error('[Analytics] Error getting countries:', error);
    return [];
  }
}

/**
 * ✅ OTIMIZADO: Resumo dashboard (uma única query)
 */
export async function getDashboardSummaryOptimized(days: number = 30) {
  const startDate = addDays(new Date(), -days);
  
  try {
    const result = await db.execute(
      `SELECT 
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        ROUND(AVG(session_duration)::numeric, 2) as avg_session_duration
       FROM analytics_events
       WHERE created_at >= $1`,
      [startDate]
    );
    
    return result.rows[0] || { 
      total_pageviews: 0, 
      unique_visitors: 0, 
      avg_session_duration: 0 
    };
  } catch (error) {
    console.error('[Analytics] Error getting dashboard summary:', error);
    return { 
      total_pageviews: 0, 
      unique_visitors: 0, 
      avg_session_duration: 0 
    };
  }
}
