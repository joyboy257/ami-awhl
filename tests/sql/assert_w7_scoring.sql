-- T-403: W-7 Scoring Verification Queries
-- Run these after executing W-7 to validate scoring correctness

-- ============================================
-- 1. Zero-data clinics should have low score + low confidence
-- Expected: 0 (no high scores with low confidence)
-- ============================================
SELECT 
  COUNT(*) as problem_clinics,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM wellness.clinics
WHERE competitor_score > 20 
  AND score_confidence < 20;

-- ============================================
-- 2. Score breakdown populated for all scored clinics
-- Expected: 0 missing
-- ============================================
SELECT 
  COUNT(*) as missing_breakdown,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM wellness.clinics
WHERE competitor_score > 0 
  AND score_breakdown IS NULL;

-- ============================================
-- 3. Visibility includes both raw and normalized
-- Should see both values populated
-- ============================================
SELECT 
  c.name,
  c.competitor_score,
  c.score_confidence,
  c.score_breakdown->'visibility'->>'normalized' as vis_normalized,
  c.score_breakdown->'visibility'->>'raw' as vis_raw,
  c.score_breakdown->'visibility'->>'vertical_min' as vertical_min,
  c.score_breakdown->'visibility'->>'vertical_max' as vertical_max
FROM wellness.clinics c
WHERE c.competitor_score > 0
ORDER BY c.competitor_score DESC
LIMIT 10;

-- ============================================
-- 4. Tier weighting correlation check
-- Higher tier_a_appearances should correlate with higher visibility
-- ============================================
SELECT 
  c.name,
  (c.score_breakdown->'visibility'->>'tier_a_appearances')::int as tier_a_appearances,
  (c.score_breakdown->'visibility'->>'tier_b_appearances')::int as tier_b_appearances,
  (c.score_breakdown->'visibility'->>'normalized')::numeric as visibility_score
FROM wellness.clinics c
WHERE c.score_breakdown IS NOT NULL
  AND c.score_breakdown->'visibility' IS NOT NULL
ORDER BY (c.score_breakdown->'visibility'->>'normalized')::numeric DESC NULLS LAST
LIMIT 15;

-- ============================================
-- 5. Component score distribution
-- Verify scores are reasonable (not all 0 or all 100)
-- ============================================
SELECT 
  'visibility' as component,
  AVG((score_breakdown->'visibility'->>'normalized')::numeric) as avg_score,
  MIN((score_breakdown->'visibility'->>'normalized')::numeric) as min_score,
  MAX((score_breakdown->'visibility'->>'normalized')::numeric) as max_score,
  COUNT(*) as count
FROM wellness.clinics WHERE score_breakdown IS NOT NULL
UNION ALL
SELECT 
  'inventory',
  AVG((score_breakdown->'inventory'->>'score')::numeric),
  MIN((score_breakdown->'inventory'->>'score')::numeric),
  MAX((score_breakdown->'inventory'->>'score')::numeric),
  COUNT(*)
FROM wellness.clinics WHERE score_breakdown IS NOT NULL
UNION ALL
SELECT 
  'conversion',
  AVG((score_breakdown->'conversion'->>'score')::numeric),
  MIN((score_breakdown->'conversion'->>'score')::numeric),
  MAX((score_breakdown->'conversion'->>'score')::numeric),
  COUNT(*)
FROM wellness.clinics WHERE score_breakdown IS NOT NULL
UNION ALL
SELECT 
  'commercial',
  AVG((score_breakdown->'commercial'->>'score')::numeric),
  MIN((score_breakdown->'commercial'->>'score')::numeric),
  MAX((score_breakdown->'commercial'->>'score')::numeric),
  COUNT(*)
FROM wellness.clinics WHERE score_breakdown IS NOT NULL
UNION ALL
SELECT 
  'technical',
  AVG((score_breakdown->'technical'->>'score')::numeric),
  MIN((score_breakdown->'technical'->>'score')::numeric),
  MAX((score_breakdown->'technical'->>'score')::numeric),
  COUNT(*)
FROM wellness.clinics WHERE score_breakdown IS NOT NULL;

-- ============================================
-- 6. Per-vertical leaderboard (top 5 per vertical)
-- ============================================
SELECT 
  v.name as vertical,
  c.name as clinic_name,
  c.competitor_score,
  c.score_confidence,
  ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY c.competitor_score DESC) as rank
FROM wellness.clinics c
JOIN wellness.verticals v ON c.vertical_id = v.id
WHERE c.competitor_score > 0
ORDER BY v.name, c.competitor_score DESC;

-- ============================================
-- 7. Low confidence alerts (clinics to investigate)
-- These have scores but low data quality
-- ============================================
SELECT 
  c.name,
  c.competitor_score,
  c.score_confidence,
  c.score_breakdown->>'completeness' as completeness,
  c.score_breakdown->'top_signals' as top_signals
FROM wellness.clinics c
WHERE c.competitor_score > 0
  AND c.score_confidence < 40
ORDER BY c.competitor_score DESC
LIMIT 10;

-- ============================================
-- 8. Scoring timestamp verification
-- All scored clinics should have scored_at populated
-- ============================================
SELECT 
  COUNT(*) as scored_without_timestamp,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM wellness.clinics
WHERE competitor_score > 0
  AND scored_at IS NULL;
