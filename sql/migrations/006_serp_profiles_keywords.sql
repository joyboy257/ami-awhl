-- Migration: 006_serp_profiles_keywords.sql
-- Purpose: SERP profiles, geo sets, keyword templates, and keywords tables
-- Source: pipeline_strategy.md §2.8
-- Idempotent: Yes (IF NOT EXISTS)
-- Depends on: wellness.verticals

CREATE TABLE IF NOT EXISTS wellness.serp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  name TEXT NOT NULL,
  gl TEXT DEFAULT 'sg',
  hl TEXT DEFAULT 'en',
  device TEXT DEFAULT 'desktop',
  location TEXT DEFAULT 'Singapore',
  uule TEXT,
  UNIQUE(vertical_id, name)
);

CREATE TABLE IF NOT EXISTS wellness.geo_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  modifiers TEXT[] NOT NULL,
  priority_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wellness.keyword_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  geo_set_id UUID REFERENCES wellness.geo_sets(id),
  language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS wellness.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_text TEXT NOT NULL,
  serp_profile_id UUID NOT NULL REFERENCES wellness.serp_profiles(id),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  tier TEXT DEFAULT 'C',
  source TEXT DEFAULT 'manual',
  seed_keyword_id UUID REFERENCES wellness.keywords(id),
  active BOOLEAN DEFAULT TRUE,
  last_snapshot_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword_text, serp_profile_id)
);
