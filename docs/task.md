# AMI Task List (Clean v1.0)

This is the granular task checklist for the AMI implementation. Update status as you progress.

---

## Phase 1: Infrastructure & Seeding

### 1.1 Schema Migrations
- [x] T-101: Create `001_core_entities.sql` (verticals, services, geo_sets, templates)
- [x] T-102: Create `002_clinics_domains.sql`
- [x] T-103: Create `003_serp_tables.sql`
- [x] T-104: Create `004_discovery_inventory.sql` (sitemaps, pages)
- [x] T-105: Create `005_crawl_tables.sql` (page_fetches, page_content)
- [x] T-106: Create `006_enrichment_tables.sql` (page_seo, page_keywords, clinic_keywords)
- [x] T-107: Create `007_commercial_facts.sql` (clinic_offers, clinic_ctas)
- [x] T-108: Create `008_ops_tables.sql` (runs, jobs)
- [x] T-109: Apply all migrations to local Postgres

### 1.2 Seed Data
- [x] T-110: Create `seed_verticals.sql`
- [x] T-111: Create `seed_services.sql` (10-30 services per vertical)
- [x] T-112: Create `seed_geo_sets.sql`
- [x] T-113: Create `seed_templates.sql`
- [x] T-114: Apply all seeds to local Postgres

### 1.3 Verification (Phase 1)
- [x] T-115: Create `tests/sql/assert_schema.sql`
- [x] T-116: Run schema assertions, confirm all tables exist
- [x] T-117: Build and test Robots Microservice (services/robots)

---

## Phase 2: Discovery & SERP (W1-W3)

### 2.1 Workflows
- [x] T-201: Build W1 (Build Search Queries) n8n workflow
- [x] T-202: Build W2A (SERP Snapshot) n8n workflow
- [x] T-203: Build W2B (Seed Clinics/Domains) n8n workflow
- [x] T-204: Build W2C (Seed Keywords) n8n workflow
- [x] T-205: Build W3 (Site Discovery) n8n workflow


### 2.2 Verification (Phase 2)
- [x] T-206: Run W1 for all 4 verticals, verify `search_queries` populated
- [x] T-207: Run W2 for Tier A queries, verify `serp_snapshots`, `serp_results`, `domains`, `clinics`
- [x] T-208: Run W3 for seeded domains, verify `sitemaps`, `pages` populated
- [ ] T-209: Rerun W1-W3, verify idempotency (no duplicate rows)

---

## Phase 3: Crawl & Enrichment (W4-W6)

### 3.1 Workflows
- [ ] T-301: Build W4 (Crawl Router) n8n workflow
- [ ] T-302: Build W5A (SEO Extraction) n8n workflow
- [ ] T-303: Build W5B (Keyword Extraction) n8n workflow
- [ ] T-304: Build W5C (Clinic Keyword Rollup) n8n workflow
- [ ] T-305: Build W6 (Commercial Facts) n8n workflow

### 3.2 Verification (Phase 3)
- [ ] T-306: Run W4 for sample pages, verify `page_fetches`, `page_content`, `content_hash`
- [ ] T-307: Run W5, verify `page_seo`, `page_keywords`, `clinic_keywords`
- [ ] T-308: Run W6, verify `clinic_offers`, `clinic_ctas` with evidence

---

## Phase 4: Scoring & Monitoring (W7-W8)

### 4.1 Workflows
- [ ] T-401: Build W7 (Scoring) n8n workflow
- [ ] T-402: Build W8 (Monitor + Expand) n8n workflow

### 4.2 Verification (Phase 4)
- [ ] T-403: Run W7, verify `competitor_score` populated on `clinics`
- [ ] T-404: Trigger W8, verify schedule logic and domain expansion

---

## Phase 5: Orchestration (O-Run)

- [ ] T-501: Build O-Run orchestrator workflow
- [ ] T-502: Run O-Run in `smoke` mode for 1 vertical
- [ ] T-503: Verify `runs` and `jobs` tables populated correctly
- [ ] T-504: Full E2E test: O-Run → W1-W7 completes without manual intervention
