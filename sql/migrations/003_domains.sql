-- Migration: 003_domains.sql
-- Purpose: Domain registry with classification and rate limiting
-- Source: pipeline_strategy.md §2.2, data_strategy.md §1
-- Idempotent: Yes (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS wellness.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  domain_class TEXT DEFAULT 'unknown',
  last_request_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
