# AMI Implementation Plan (Clean v1.0)

## Goal
Execute the Clean v1.0 build-out for AMI (AWHL Market Intelligence). This plan details the phased implementation of the Postgres schema and n8n pipelines required to run the Loop:

`Vertical → Search Queries → SERP → Clinics/Domains → Site Inventory → Crawl → SEO + Keywords + Commercial Facts → Score → Monitor`

---

## Phase 1: Infrastructure & Seeding

This phase establishes the foundational database schema and seeds static configuration.

### 1.1 Core Schema Migrations

#### [NEW] [001_core_entities.sql](file:///Users/deon/awhl-market-intel/sql/migrations/001_core_entities.sql)
- Creates `verticals`, `services`, `geo_sets`, `search_query_templates`.
- Dependencies: None.

#### [NEW] [002_clinics_domains.sql](file:///Users/deon/awhl-market-intel/sql/migrations/002_clinics_domains.sql)
- Creates `clinics` and `domains` tables with `clinic_id` FK.
- Dependencies: `001`.

#### [NEW] [003_serp_tables.sql](file:///Users/deon/awhl-market-intel/sql/migrations/003_serp_tables.sql)
- Creates `search_queries`, `serp_snapshots`, `serp_results`.
- Dependencies: `001`, `002`.

#### [NEW] [004_discovery_inventory.sql](file:///Users/deon/awhl-market-intel/sql/migrations/004_discovery_inventory.sql)
- Creates `sitemaps` and `pages` tables.
- Dependencies: `002`.

#### [NEW] [005_crawl_tables.sql](file:///Users/deon/awhl-market-intel/sql/migrations/005_crawl_tables.sql)
- Creates `page_fetches` and `page_content`.
- Dependencies: `004`.

#### [NEW] [006_enrichment_tables.sql](file:///Users/deon/awhl-market-intel/sql/migrations/006_enrichment_tables.sql)
- Creates `page_seo`, `page_keywords`, `clinic_keywords`.
- Dependencies: `004`, `002`.

#### [NEW] [007_commercial_facts.sql](file:///Users/deon/awhl-market-intel/sql/migrations/007_commercial_facts.sql)
- Creates `clinic_offers` and `clinic_ctas` with evidence columns.
- Dependencies: `002`, `004`.

#### [NEW] [008_ops_tables.sql](file:///Users/deon/awhl-market-intel/sql/migrations/008_ops_tables.sql)
- Creates `runs` and `jobs` tables for orchestration.
- Dependencies: None.

---

### 1.2 Seed Data

#### [NEW] [seed_verticals.sql](file:///Users/deon/awhl-market-intel/sql/seeds/seed_verticals.sql)
- Inserts TCM, Beauty, Chiropractic, Aesthetics.

#### [NEW] [seed_services.sql](file:///Users/deon/awhl-market-intel/sql/seeds/seed_services.sql)
- Populates 10-30 services per vertical.

#### [NEW] [seed_geo_sets.sql](file:///Users/deon/awhl-market-intel/sql/seeds/seed_geo_sets.sql)
- Populates SG areas (Central, East, West, North, CBD).

#### [NEW] [seed_templates.sql](file:///Users/deon/awhl-market-intel/sql/seeds/seed_templates.sql)
- Populates 10-20 search query templates.

---

## Phase 2: Discovery & SERP Pipelines (W1-W3)

### 2.1 n8n Workflows

#### [NEW] W1: Build Search Queries
- Reads `services`, `geo_sets`, `templates` from DB.
- Generates bounded `search_queries` (max 200/vertical).
- Writes to `wellness.search_queries`.

#### [NEW] W2: SERP Snapshot & Seed Clinics
- Reads `search_queries` (Tier A/B).
- Calls SerpAPI, stores raw JSON in `serp_snapshots`.
- Parses results into `serp_results`, seeds `domains`/`clinics`.

#### [NEW] W3: Site Discovery
- Reads `domains` where `discovery_state != 'complete'`.
- Fetches robots.txt, parses sitemaps (depth ≤ 3).
- Populates `sitemaps` and `pages` inventory.

---

## Phase 3: Crawl & Enrichment (W4-W6)

### 3.1 n8n Workflows

#### [NEW] W4: Crawl Router
- Claims pages from `jobs` queue.
- Fetches content (HTTP -> Headless -> Firecrawl fallback).
- Stores results in `page_fetches`, `page_content`.
- Computes `content_hash`.

#### [NEW] W5: SEO Enrichment + Keywords
- Triggered by `content_hash` change.
- Extracts SEO metadata into `page_seo`.
- Extracts keywords into `page_keywords`, rolls up to `clinic_keywords`.

#### [NEW] W6: Commercial Facts Extraction
- Triggered for service/commercial pages.
- AI extraction of offers/CTAs with evidence.
- Writes to `clinic_offers`, `clinic_ctas`.

---

## Phase 4: Scoring & Monitoring (W7-W8)

#### [NEW] W7: Scoring
- Computes `competitor_score` from SERP visibility + site strength.

#### [NEW] W8: Monitor + Expand
- Schedules: Daily Tier A SERP, Weekly Tier B, Monthly domain refresh.
- Adds newly discovered domains to the discovery queue.

---

## Phase 5: Orchestration (O-Run)

#### [NEW] O-Run Orchestrator Workflow
- Single trigger to run the full loop for given vertical(s).
- Creates `run_id`, enqueues `jobs` in dependency order (W1 → W7).
- Mode: `smoke` (limited budget) | `full`.

---

## Verification Plan

### Automated Tests (SQL Assertions)
- `tests/sql/assert_schema.sql`: Verify all tables exist.
- `tests/sql/assert_uniques.sql`: Verify unique constraints.
- `tests/sql/assert_state_machines.sql`: Verify `jobs` and `sitemaps` state validity.

### Manual Verification
- Run W1-W3 for a single vertical (smoke test).
- Verify row counts in `search_queries`, `serp_results`, `pages`.
- Re-run W1-W3 to prove idempotency (no duplicate inserts).
