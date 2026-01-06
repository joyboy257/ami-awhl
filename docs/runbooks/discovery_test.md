# Discovery Pipeline Local Test Runbook

This guide explains how to verify the Discovery pipeline (W-1 and W-2) using mock fixtures.

## Prerequisites
- Postgres running with `wellness` schema and Phase 1 migrations applied.
- n8n running with `W-1_Discover_Sitemaps` and `W-2_Expand_Sitemap` workflows imported.

## Test Step 1: Seed Data
Seed a mock clinic and domain associated with it.

```sql
-- Seed Vertical (if missing)
INSERT INTO wellness.verticals (name) VALUES ('Chiropractic') ON CONFLICT DO NOTHING;

-- Seed Clinic
INSERT INTO wellness.clinics (vertical_id, name) 
SELECT id, 'Mock Clinic' FROM wellness.verticals WHERE name = 'Chiropractic'
ON CONFLICT DO NOTHING;

-- Seed Domain
INSERT INTO wellness.domains (domain, domain_class) VALUES ('mock-clinic.com', 'competitor') ON CONFLICT DO NOTHING;

-- Link Clinic to Domain
INSERT INTO wellness.clinic_domains (clinic_id, domain_id, domain)
SELECT c.id, d.id, d.domain 
FROM wellness.clinics c, wellness.domains d
WHERE c.name = 'Mock Clinic' AND d.domain = 'mock-clinic.com'
ON CONFLICT DO NOTHING;
```

## Test Step 2: Run W-1 (Discovery)
Trigger W-1 webhook with the `clinic_id`.

**CLI Example (curl):**
```bash
curl -X POST http://localhost:5678/webhook/discover-sitemaps \
     -H "Content-Type: application/json" \
     -d "{\"clinic_id\": \"<CLINIC_UUID>\"}"
```

**Verification:**
Check `wellness.sitemaps` for entries from both robots.txt and guess list.

## Test Step 3: Run W-2 (Expansion)
Trigger W-2 (or let it run if on a schedule) to process the queued sitemaps.

## Test Step 4: Verify Idempotency
Run W-1 and W-2 again. 

## Test Step 5: Run Assertions
Run the SQL assertion script to confirm schema invariants.

```bash
psql -d ami -f tests/sql/assert_discovery.sql
```

## Expected Results
1. `wellness.sitemaps` contains at least 3 rows (robots sitemaps + guess sitemaps).
2. No duplicate `(clinic_id, url)` pairs in `wellness.sitemaps` or `wellness.pages`.
3. All sitemaps have `depth <= 3`.
