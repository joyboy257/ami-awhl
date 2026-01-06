-- Migration: 001_pgcrypto.sql
-- Purpose: Enable pgcrypto extension for UUID generation
-- Source: pipeline_strategy.md §2.0
-- Idempotent: Yes (IF NOT EXISTS)

CREATE EXTENSION IF NOT EXISTS pgcrypto;
