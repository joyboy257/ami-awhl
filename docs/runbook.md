# AMI Pipeline Runbook (End-to-End Testing)

This runbook provides a step-by-step guide to test the AMI pipeline from W-1 through W-3.

---

## Prerequisites

- [ ] Postgres running locally on port 5432
- [ ] Database `awhl` exists with `wellness` schema applied
- [ ] Seed data applied (verticals, services, geo_sets, templates)
- [ ] n8n running and accessible
- [ ] Robots microservice running on port 8000 (optional for W-3)

---

## Pre-Test Validation

Run these SQL checks before starting:

```sql
-- Verify seed data exists
SELECT 'verticals' as tbl, count(*) FROM wellness.verticals
UNION ALL SELECT 'services', count(*) FROM wellness.services
UNION ALL SELECT 'geo_sets', count(*) FROM wellness.geo_sets
UNION ALL SELECT 'search_query_templates', count(*) FROM wellness.search_query_templates;
```

**Expected**: verticals=4, services>=20, geo_sets>=5, templates>=10.

---

## W-1: Build Search Queries

### Goal
Generate bounded search queries from seed data (services × templates × geos).

### Test Steps
1. [ ] Open n8n workflow `W-1: Build Search Queries`
2. [ ] Click "Execute Workflow"
3. [ ] Observe execution completes without error

### Validation Queries
```sql
-- Check queries were generated
SELECT vertical_id, count(*) as query_count
FROM wellness.search_queries
GROUP BY vertical_id;

-- Expected: 4 rows (one per vertical), each with <= 200 queries
```

### Idempotency Test
1. [ ] Run W-1 again
2. [ ] Verify no duplicate queries created (count unchanged)

---

## W-2: SERP Pipeline

### Goal
Call SerpAPI for queries, store snapshots, parse results, seed domains/clinics.

### Test Steps
1. [ ] Ensure SerpAPI credentials are configured in n8n
2. [ ] Open n8n workflow `W-2: SERP Pipeline`
3. [ ] Click "Execute Workflow"
4. [ ] Monitor for rate limiting or API errors

### Validation Queries
```sql
-- Check snapshots created
SELECT count(*) FROM wellness.serp_snapshots;

-- Check results parsed
SELECT block_type, count(*) 
FROM wellness.serp_results 
GROUP BY block_type;

-- Check domains seeded
SELECT count(*) FROM wellness.domains;

-- Check clinics seeded
SELECT count(*) FROM wellness.clinics;
```

### Expected Outcomes
- `serp_snapshots`: 1 row per query processed
- `serp_results`: Multiple rows per snapshot (organic + local_pack)
- `domains`: New domains discovered
- `clinics`: Clinics created with `vertical_id` linked

---

## W-3: Site Discovery

### Goal
For each pending domain, discover sitemaps and populate page inventory.

### Test Steps
1. [ ] Ensure Robots service is running: `curl http://localhost:8000/check -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com","robots_txt_url":"https://example.com/robots.txt"}'`
2. [ ] Open n8n workflow `W-3: Site Discovery`
3. [ ] Click "Execute Workflow"

### Validation Queries
```sql
-- Check domain states
SELECT discovery_state, count(*) 
FROM wellness.domains 
GROUP BY discovery_state;

-- Check sitemaps discovered
SELECT count(*) FROM wellness.sitemaps;

-- Check pages inventoried
SELECT d.domain, count(p.id) as page_count
FROM wellness.domains d
LEFT JOIN wellness.pages p ON p.domain_id = d.id
GROUP BY d.domain
ORDER BY page_count DESC
LIMIT 10;
```

### Expected Outcomes
- `domains.discovery_state`: Transitions from `pending` → `in_progress` → `complete`
- `sitemaps`: At least 1 per successfully processed domain
- `pages`: Variable, depends on sitemap content

---

## Post-Test Cleanup (Optional)

```sql
-- Reset for re-testing (DESTRUCTIVE)
TRUNCATE wellness.search_queries CASCADE;
TRUNCATE wellness.serp_snapshots CASCADE;
TRUNCATE wellness.serp_results CASCADE;
TRUNCATE wellness.domains CASCADE;
TRUNCATE wellness.clinics CASCADE;
TRUNCATE wellness.sitemaps CASCADE;
TRUNCATE wellness.pages CASCADE;
```

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| W-1 returns 0 queries | Missing seed data | Re-run seed scripts |
| W-2 SerpAPI 429 | Rate limited | Add delay between calls |
| W-3 no pages found | Sitemap 404 | Normal for some domains |
| FK constraint error | Missing parent record | Check dependency order |

---

## Success Criteria

- [ ] W-1 generates queries for all 4 verticals
- [ ] W-2 populates snapshots, results, domains, clinics
- [ ] W-3 discovers pages for at least 50% of domains
- [ ] Idempotency: Re-running any workflow causes no duplicates
