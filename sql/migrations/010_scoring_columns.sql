-- Migration 010: Scoring Columns
-- Purpose: Add columns for W-7 scoring workflow outputs
-- Dependencies: clinics table must exist

-- ============================================
-- 1. Add scoring columns to clinics table
-- ============================================

-- score_confidence: 0-100, measures data completeness
-- Higher confidence = more data available for scoring
ALTER TABLE wellness.clinics 
  ADD COLUMN IF NOT EXISTS score_confidence NUMERIC DEFAULT 0;

-- score_breakdown: JSONB with component scores + explanations
-- Structure: { visibility: {...}, inventory: {...}, conversion: {...}, ... }
ALTER TABLE wellness.clinics 
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB;

-- scored_at: timestamp of last scoring run
ALTER TABLE wellness.clinics 
  ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ;

-- ============================================
-- 2. Add indexes for leaderboard queries
-- ============================================

-- Fast lookup for overall leaderboard
CREATE INDEX IF NOT EXISTS idx_clinics_competitor_score 
  ON wellness.clinics(competitor_score DESC);

-- Fast lookup for per-vertical leaderboard
CREATE INDEX IF NOT EXISTS idx_clinics_vertical_score 
  ON wellness.clinics(vertical_id, competitor_score DESC);

-- ============================================
-- 3. Add index for W-8 discovery refresh
-- ============================================

-- Fast lookup for stale domains needing refresh
CREATE INDEX IF NOT EXISTS idx_domains_discovery_created 
  ON wellness.domains(discovery_state, created_at);

-- ============================================
-- 4. Verification
-- ============================================

-- Verify columns added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'wellness' 
      AND table_name = 'clinics' 
      AND column_name = 'score_confidence'
  ) THEN
    RAISE EXCEPTION 'Migration 010 failed: score_confidence column not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'wellness' 
      AND table_name = 'clinics' 
      AND column_name = 'score_breakdown'
  ) THEN
    RAISE EXCEPTION 'Migration 010 failed: score_breakdown column not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'wellness' 
      AND table_name = 'clinics' 
      AND column_name = 'scored_at'
  ) THEN
    RAISE EXCEPTION 'Migration 010 failed: scored_at column not created';
  END IF;
  
  RAISE NOTICE 'Migration 010: All columns verified successfully';
END $$;
