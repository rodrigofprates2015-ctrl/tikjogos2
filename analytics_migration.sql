-- Migration: Create analytics_events table
-- Execute this SQL directly in your Railway PostgreSQL database

-- Create the analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(20) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  page_path VARCHAR(500),
  referrer VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'analytics_events'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'analytics_events';
