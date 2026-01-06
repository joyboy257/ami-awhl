-- Migration: 007_vertical_services.sql
-- Purpose: Vertical-specific services with synonyms
-- Source: pipeline_strategy.md §2.7, data_strategy.md §5
-- Idempotent: Yes (IF NOT EXISTS)
-- Depends on: wellness.verticals

CREATE TABLE IF NOT EXISTS wellness.vertical_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  service_name TEXT NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  intent TEXT DEFAULT 'commercial',
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(vertical_id, service_name)
);
