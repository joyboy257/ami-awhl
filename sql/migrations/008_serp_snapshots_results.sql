-- Migration: 008_serp_snapshots_results.sql
-- Purpose: SERP snapshots and parsed results
-- Source: pipeline_strategy.md §2.9, data_strategy.md §5
-- Idempotent: Yes (IF NOT EXISTS)
-- Depends on: wellness.keywords, wellness.serp_profiles, wellness.domains

CREATE TABLE IF NOT EXISTS wellness.serp_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES wellness.keywords(id),
  serp_profile_id UUID NOT NULL REFERENCES wellness.serp_profiles(id),
  raw_json JSONB,
  raw_hash TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword_id, serp_profile_id, captured_at)
);

CREATE TABLE IF NOT EXISTS wellness.serp_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES wellness.serp_snapshots(id),
  rank_position INT NOT NULL,
  block_type TEXT NOT NULL,  -- organic, local_pack, featured, ad
  domain_id UUID REFERENCES wellness.domains(id),
  url TEXT,
  title TEXT,
  snippet TEXT,
  UNIQUE(snapshot_id, rank_position, block_type)
);
