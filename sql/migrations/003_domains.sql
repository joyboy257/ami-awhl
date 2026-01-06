-- Migration: 003_domains.sql
-- Purpose: Adapt existing domains table (Adaptive Strategy)
-- Source: pipeline_strategy.md §2.2
-- Idempotent: Yes (safe to re-run)

-- 1. Add new columns
ALTER TABLE wellness.domains ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE wellness.domains ADD COLUMN IF NOT EXISTS domain_class TEXT;
ALTER TABLE wellness.domains ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Backfill (Idempotent updates)
-- Map legacy 'class' to 'domain_class'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='wellness' AND table_name='domains' AND column_name='class') THEN
        EXECUTE 'UPDATE wellness.domains SET domain_class = class WHERE domain_class IS NULL AND class IS NOT NULL';
    END IF;
END $$;

-- Ensure UUIDs exist for all rows
UPDATE wellness.domains SET id = gen_random_uuid() WHERE id IS NULL;

-- 3. Enforce Constraints
-- Make ID not null and unique (effectively a secondary PK)
ALTER TABLE wellness.domains ALTER COLUMN id SET NOT NULL;
ALTER TABLE wellness.domains DROP CONSTRAINT IF EXISTS domains_id_unique;
ALTER TABLE wellness.domains ADD CONSTRAINT domains_id_unique UNIQUE(id);
