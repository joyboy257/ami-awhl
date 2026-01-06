-- Migration: 004_pages_alter.sql
-- Purpose: Add domain_id FK and tracking columns to existing pages table
-- Source: pipeline_strategy.md §2.3
-- Idempotent: Yes (ADD COLUMN IF NOT EXISTS)
-- Note: FK enforcement deferred to later migration

ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS domain_id UUID;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS sitemap_lastmod TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_http_status INT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_content_hash TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS page_type TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS type_conf FLOAT DEFAULT 0;
