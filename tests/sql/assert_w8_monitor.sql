-- T-404: W-8 Monitor + Expand Verification Queries
-- Run these to validate W-8 concurrency, scheduling, and refresh logic

-- ============================================
-- 1. Verify runs table has W-8 records
-- ============================================
SELECT 
  id,
  mode,
  status,
  started_at,
  ended_at,
  EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at)) / 60 as duration_minutes,
  result_summary
FROM wellness.runs
WHERE mode = 'monitor'
ORDER BY started_at DESC
LIMIT 5;

-- ============================================
-- 2. Stale lock override test setup
-- Creates a fake stale run to test override behavior
-- ============================================
-- WARNING: Only run this in test environment!
-- INSERT INTO wellness.runs (mode, status, started_at, budgets)
-- VALUES ('monitor', 'running', NOW() - INTERVAL '3 hours', '{"test": true}')
-- RETURNING id, 'This run should be overridden by W-8' as note;

-- ============================================
-- 3. Discovery refresh candidates check
-- Shows how many domains would be refreshed
-- ============================================
WITH persistent_failures AS (
  SELECT domain_id
  FROM wellness.sitemaps
  WHERE error_json IS NOT NULL
  GROUP BY domain_id
  HAVING COUNT(*) >= 3
),
top_performers AS (
  SELECT c.id as clinic_id
  FROM wellness.clinics c
  WHERE c.competitor_score > 0
    AND c.competitor_score >= (
      SELECT PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY competitor_score)
      FROM wellness.clinics c2 
      WHERE c2.vertical_id = c.vertical_id
        AND c2.competitor_score > 0
    )
),
domain_pages AS (
  SELECT domain_id, COUNT(*) as page_count
  FROM wellness.pages
  GROUP BY domain_id
)
SELECT 
  d.id,
  d.domain,
  d.discovery_state,
  d.created_at,
  EXTRACT(DAY FROM (NOW() - d.created_at)) as days_since_created,
  COALESCE(dp.page_count, 0) as page_count,
  CASE WHEN d.clinic_id IN (SELECT clinic_id FROM top_performers) THEN 'YES' ELSE 'NO' END as is_top_performer,
  CASE WHEN d.id IN (SELECT domain_id FROM persistent_failures) THEN 'YES' ELSE 'NO' END as has_persistent_failures,
  CASE 
    WHEN d.id IN (SELECT domain_id FROM persistent_failures) THEN 'EXCLUDED: persistent failures'
    WHEN d.created_at >= NOW() - INTERVAL '60 days' THEN 'EXCLUDED: not stale (< 60 days)'
    WHEN d.discovery_state != 'complete' THEN 'EXCLUDED: not complete'
    WHEN COALESCE(dp.page_count, 0) < 5 THEN 'REFRESH: low coverage'
    WHEN d.clinic_id IN (SELECT clinic_id FROM top_performers) THEN 'REFRESH: top performer'
    ELSE 'EXCLUDED: does not meet criteria'
  END as refresh_decision
FROM wellness.domains d
LEFT JOIN domain_pages dp ON d.id = dp.domain_id
ORDER BY refresh_decision, d.created_at ASC
LIMIT 20;

-- ============================================
-- 4. Aggregator domains check
-- Shows domains that match aggregator patterns
-- ============================================
SELECT 
  domain,
  domain_class,
  CASE 
    WHEN domain ~* '(theurbanlist|threebestrated|yelp|tripadvisor|honeycombers)' THEN 'MATCH: known aggregator'
    WHEN domain ~* '(review|rating|directory|compare|best.*of)' THEN 'MATCH: aggregator pattern'
    ELSE 'NO MATCH'
  END as aggregator_detection
FROM wellness.domains
WHERE domain_class IS NULL
  AND (
    domain ~* '(theurbanlist|threebestrated|yelp|tripadvisor|honeycombers)'
    OR domain ~* '(review|rating|directory|compare|best.*of)'
  );

-- ============================================
-- 5. Crawl due pages check
-- Shows pages that would be selected for re-crawl
-- ============================================
SELECT 
  p.id,
  p.url,
  p.page_type,
  p.last_crawled_at,
  d.domain,
  d.domain_class,
  EXTRACT(DAY FROM (NOW() - p.last_crawled_at)) as days_since_crawl
FROM wellness.pages p
JOIN wellness.domains d ON p.domain_id = d.id
WHERE (
    p.last_crawled_at < NOW() - INTERVAL '7 days'
    OR p.last_crawled_at IS NULL
  )
  AND p.page_type IN ('service', 'pricing', 'contact', 'about')
  AND d.discovery_state = 'complete'
  AND d.domain_class IS DISTINCT FROM 'aggregator'
ORDER BY p.last_crawled_at ASC NULLS FIRST
LIMIT 20;

-- ============================================
-- 6. SERP refresh candidates (Tier A)
-- Shows queries not snapshotted in last 24 hours
-- ============================================
SELECT 
  sq.id,
  sq.query_text,
  sq.priority_tier,
  v.name as vertical,
  (SELECT MAX(captured_at) FROM wellness.serp_snapshots WHERE query_id = sq.id) as last_snapshot,
  EXTRACT(HOUR FROM (NOW() - (SELECT MAX(captured_at) FROM wellness.serp_snapshots WHERE query_id = sq.id))) as hours_since_snapshot
FROM wellness.search_queries sq
JOIN wellness.verticals v ON sq.vertical_id = v.id
WHERE sq.priority_tier = 'A' 
  AND sq.active = true
  AND sq.id NOT IN (
    SELECT query_id FROM wellness.serp_snapshots
    WHERE captured_at >= NOW() - INTERVAL '24 hours'
  )
ORDER BY v.name, sq.query_text
LIMIT 20;

-- ============================================
-- 7. Jobs enqueued by W-8 check
-- Shows crawl jobs created by monitor runs
-- ============================================
SELECT 
  j.id,
  j.job_type,
  j.state,
  j.payload->>'page_id' as page_id,
  j.payload->>'url' as url,
  r.mode as run_mode,
  j.created_at
FROM wellness.jobs j
JOIN wellness.runs r ON j.run_id = r.id
WHERE r.mode = 'monitor'
ORDER BY j.created_at DESC
LIMIT 20;

-- ============================================
-- 8. Cadence logic verification
-- Use these with different NOW() values to test
-- ============================================
SELECT 
  EXTRACT(DOW FROM NOW()) as day_of_week,
  CASE WHEN EXTRACT(DOW FROM NOW()) = 0 THEN 'Sunday - Tier B should run' ELSE 'Weekday - Tier A only' END as tier_b_note,
  EXTRACT(DAY FROM NOW()) as day_of_month,
  CASE WHEN EXTRACT(DAY FROM NOW()) = 1 THEN 'First of month - Discovery refresh should run' ELSE 'Not 1st - Skip discovery refresh' END as discovery_note;
