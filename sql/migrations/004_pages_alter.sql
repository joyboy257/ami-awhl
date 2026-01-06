-- Migration: 004_pages_alter.sql
-- Purpose: Add domain_id FK and tracking columns to existing pages table
-- Source: pipeline_strategy.md §2.3
-- Idempotent: Yes

ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS domain_id UUID;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS sitemap_lastmod TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_http_status INT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_content_hash TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS page_type TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS type_conf FLOAT DEFAULT 0;

-- Backfill domain_id using strict host extraction (case-normalized)
-- Matches:
-- 1. Exact host: url host == domain (e.g. example.com == example.com)
-- 2. WWW strip: url host (www.example.com) == domain (example.com)
UPDATE wellness.pages p 
SET domain_id = d.id 
FROM wellness.domains d 
WHERE (
    -- Extract host from URL (ignoring protocol/port) and match exactly
    lower(d.domain) = lower(substring(p.url from 'https?://([^/:]+)'))
    OR 
    -- Match host with 'www.' stripped against domain
    lower(d.domain) = lower(regexp_replace(substring(p.url from 'https?://([^/:]+)'), '^www\.', ''))
)
AND p.domain_id IS NULL;

-- Add FK safely
ALTER TABLE wellness.pages DROP CONSTRAINT IF EXISTS pages_domain_id_fkey;
ALTER TABLE wellness.pages ADD CONSTRAINT pages_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES wellness.domains(id);
