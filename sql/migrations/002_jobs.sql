-- Migration: 002_jobs.sql
-- Purpose: Job queue table with locking, deduplication, and scheduling
-- Source: pipeline_strategy.md §2.1
-- Idempotent: Yes (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS wellness.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id UUID,
  target_url TEXT,
  input_hash TEXT,
  prompt_version TEXT,
  model TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  state TEXT DEFAULT 'queued',
  result_json JSONB,
  priority INT DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  lock_expires_at TIMESTAMPTZ,
  locked_by TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_claim 
  ON wellness.jobs(job_type, state, available_at);
