-- Migration: 006_serp_profiles_keywords.sql
-- Purpose: SERP profiles, geo sets, keywords (Adaptive)
-- Source: pipeline_strategy.md §2.8
-- Idempotent: Yes

-- 1. Create Helper Tables (If not exist)
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

-- 2. Adapt Keywords Table
-- Rename keyword -> keyword_text if explicitly keyword exists and keyword_text does not
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='wellness' AND table_name='keywords' AND column_name='keyword') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='wellness' AND table_name='keywords' AND column_name='keyword_text') THEN
        ALTER TABLE wellness.keywords RENAME COLUMN keyword TO keyword_text;
    END IF;
END $$;

-- Add new columns
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS serp_profile_id UUID REFERENCES wellness.serp_profiles(id);
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'C';
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS seed_keyword_id UUID REFERENCES wellness.keywords(id);
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE wellness.keywords ADD COLUMN IF NOT EXISTS last_snapshot_at TIMESTAMPTZ;

-- 3. Backfill SERP Profiles (Per Vertical)
-- Create 'Legacy Migration' profile for each vertical that has keywords
INSERT INTO wellness.serp_profiles (vertical_id, name)
SELECT DISTINCT k.vertical_id, 'Legacy Migration'
FROM wellness.keywords k
WHERE k.vertical_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM wellness.serp_profiles sp 
      WHERE sp.vertical_id = k.vertical_id AND sp.name = 'Legacy Migration'
  );

-- Backfill keywords.serp_profile_id
UPDATE wellness.keywords k
SET serp_profile_id = sp.id
FROM wellness.serp_profiles sp
WHERE k.serp_profile_id IS NULL
  AND k.vertical_id = sp.vertical_id
  AND sp.name = 'Legacy Migration';

-- 4. Safe Constraint Update
DO $$
DECLARE
    duplicate_count INT;
    null_profile_count INT;
BEGIN
    -- Check for duplicates under NEW constraint
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT keyword_text, serp_profile_id 
        FROM wellness.keywords 
        GROUP BY keyword_text, serp_profile_id 
        HAVING COUNT(*) > 1
    ) sub;

    -- Check for NULL profiles
    SELECT COUNT(*) INTO null_profile_count 
    FROM wellness.keywords 
    WHERE serp_profile_id IS NULL;

    -- Safety check before changing constraints
    IF duplicate_count = 0 AND null_profile_count = 0 THEN
        -- Drop legacy constraint if exists
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ux_keywords_vertical_keyword') THEN
            ALTER TABLE wellness.keywords DROP CONSTRAINT ux_keywords_vertical_keyword;
        END IF;

        -- Enforce NOT NULL on serp_profile_id
        ALTER TABLE wellness.keywords ALTER COLUMN serp_profile_id SET NOT NULL;
        
        -- Add new UNIQUE constraint
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'keywords_keyword_text_serp_profile_id_key') THEN
             ALTER TABLE wellness.keywords ADD UNIQUE(keyword_text, serp_profile_id);
        END IF;
    ELSE
        RAISE NOTICE 'Skipping constraint enforcement: found % duplicates and % null profiles. Manual intervention required.', duplicate_count, null_profile_count;
    END IF;
END $$;
