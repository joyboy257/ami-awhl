-- Migration: 009_http_fetches_page_storage.sql
-- Purpose: HTTP fetch log and page content storage (html + markdown)
-- Source: pipeline_strategy.md §2.5, §2.6
-- Idempotent: Yes (IF NOT EXISTS)
-- Depends on: wellness.pages, wellness.domains

CREATE TABLE IF NOT EXISTS wellness.http_fetches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  url TEXT NOT NULL,
  domain_id UUID REFERENCES wellness.domains(id),
  status_code INT,
  final_url TEXT,
  headers_json JSONB,
  duration_ms INT,
  fetch_provider TEXT DEFAULT 'n8n',
  provider_cost NUMERIC,
  quality_gate_failed TEXT,
  error_json JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fetches_page 
  ON wellness.http_fetches(page_id, fetched_at DESC);

CREATE TABLE IF NOT EXISTS wellness.page_html (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  content_hash TEXT NOT NULL,
  raw_html TEXT,
  html_gzip BYTEA,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, content_hash)
);

CREATE TABLE IF NOT EXISTS wellness.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  content_hash TEXT NOT NULL,
  markdown TEXT,
  word_count INT,
  provider TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, content_hash)
);
