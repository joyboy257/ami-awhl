-- Migration: 005_sitemaps_alter.sql
-- Purpose: Add locking and depth columns to existing sitemaps table
-- Source: pipeline_strategy.md §2.4
-- Idempotent: Yes (ADD COLUMN IF NOT EXISTS)
-- Note: FK enforcement deferred to later migration

ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS depth INT DEFAULT 0;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS parent_sitemap_id UUID;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMPTZ;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS locked_by TEXT;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS error_json JSONB;
