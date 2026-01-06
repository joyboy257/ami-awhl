# AMI Task Breakdown

## Git & GitHub Setup

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-000 | Confirm repo root | `pwd` shows awhl-market-intel | — | [x] Path correct |
| T-001 | Verify Git installed | `git --version` | — | [x] Version printed |
| T-002 | Check git init status | `ls -la .git` | T-001 | [x] .git exists |
| T-003 | Init git if needed | `git init` (only if T-002 fails) | T-002 | [x] .git exists |
| T-004 | Rename branch to main | `git branch -M main` | T-003 | [x] Branch is main |
| T-005 | Configure identity | `git config user.name/email` | T-004 | [x] Config shows values |
| T-006 | Check remote | `git remote -v` | T-005 | [x] Show current remote |
| T-007 | Set/update remote | `git remote add/set-url origin` | T-006 | [x] Remote matches GitHub |
| T-008 | Verify .gitignore | Check exists or create minimal | T-007 | [x] File exists |
| T-009 | Initial commit | `git add . && git commit` | T-008 | [x] Commit hash shown |
| T-010 | Push to main | `git push -u origin main` | T-009 | [x] Remote updated |

---

## Phase 1: Infrastructure

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-101 | Create 001_pgcrypto.sql | `CREATE EXTENSION IF NOT EXISTS pgcrypto` | T-010 | [x] File exists |
| T-102 | Create 002_jobs.sql | Jobs table DDL | T-101 | [x] File exists |
| T-103 | Create 003_domains.sql | Domains table DDL | T-101 | [x] File exists |
| T-104 | Create 004_pages_alter.sql | Add domain_id, sitemap_lastmod, etc. | T-103 | [x] File exists |
| T-105 | Create 005_sitemaps_alter.sql | Add locking + depth columns | T-101 | [x] File exists |
| T-106 | Create 006_serp_profiles_keywords.sql | serp_profiles, keywords, geo_sets, templates | T-103 | [x] File exists |
| T-107 | Create 007_vertical_services.sql | vertical_services table | T-101 | [x] File exists |
| T-108 | Create 008_serp_snapshots_results.sql | serp_snapshots, serp_results | T-106 | [x] File exists |
| T-109 | Create 009_http_fetches_page_storage.sql | http_fetches, page_html, page_content | T-104 | [x] File exists |
| T-110 | Apply all migrations | Run 001–009 against Postgres | T-109 | [x] `\dt wellness.*` OK |
| T-111 | Verify pgcrypto | `SELECT gen_random_uuid()` | T-110 | [x] UUID returned |
| T-112 | Backfill domains | Insert domains from existing pages.url | T-110 | [x] Rows inserted |
| T-113 | Backfill pages.domain_id | UPDATE pages SET domain_id FROM domains | T-112 | [x] 0 nulls |
| T-114 | Create assert_schema.sql | Schema validation queries | T-110 | [x] File + passes |
| T-115 | Create assert_uniques.sql | Uniqueness checks | T-114 | [x] File + passes |
| T-116 | Create assert_queue_contract.sql | Jobs lock columns exist | T-114 | [x] File + passes |
| T-117 | Build robots microservice | Docker container for parsing | T-110 | [x] Container runs |
| T-118 | Test robots microservice | POST request returns decision | T-117 | JSON response |

---

## Phase 2: Discovery

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-201 | Build W-1 Discover Sitemaps | Robots + guess logic | T-118 | [/] Workflow JSON |
| T-202 | Build W-2 Expand Sitemap | Parse XML, depth limit, batch | T-201 | Workflow JSON |
| T-203 | Build O-Sweeper (sitemaps) | Reclaim stuck sitemaps | T-202 | Workflow JSON |
| T-204 | Add fixtures: sitemaps | tests/fixtures/sitemaps/*.xml | T-201 | Files exist |
| T-205 | Test W-1 with fixture | Seed clinic, run W-1 | T-204 | Sitemaps in DB |
| T-206 | Test W-2 with fixture | Queue sitemap, run W-2 | T-205 | Pages in DB |
| T-207 | Test idempotency | Run W-1/W-2 twice | T-206 | No duplicates |
| T-208 | Test crash recovery | Kill W-2, run sweeper | T-207 | Job reclaimed |
| T-209 | Create assert_discovery.sql | Discovery validation | T-207 | File + passes |
| T-210 | Create runbook: discovery | docs/runbooks/discovery_test.md | T-209 | File exists |

---

## Phase 3: Keyword Pipeline

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-301 | Seed vertical_services | Insert services for each vertical | T-118 | Rows in DB |
| T-302 | Seed geo_sets | Insert SG_CORE_10, SG_ALL | T-118 | Rows in DB |
| T-303 | Seed keyword_templates | Insert template patterns | T-302 | Rows in DB |
| T-304 | Seed serp_profiles | EN desktop, ZH mobile per vertical | T-118 | Rows in DB |
| T-305 | Build W-K1 Generate | Template × geo × service | T-303 | Workflow JSON |
| T-306 | Build W-K2 Expand | SERP signals extraction | T-305 | Workflow JSON |
| T-307 | Build W-K3 Tier | Tier + prune logic | T-306 | Workflow JSON |
| T-308 | Test K1 | Run K1, check cap 300 | T-305 | Keywords in DB |
| T-309 | Test uniqueness | Insert duplicate → fails | T-308 | Constraint error |
| T-310 | Create assert_keywords.sql | Keyword validation | T-309 | File + passes |

---

## Phase 4: SERP Intelligence

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-401 | Build O-SERP | Schedule by tier | T-304 | Workflow JSON |
| T-402 | Build W-6 SERP Fetch | SerpAPI call, store raw_json | T-401 | Workflow JSON |
| T-403 | Test W-6 | Snapshot one keyword | T-402 | serp_snapshots row |
| T-404 | Verify last_snapshot_at | Check keyword updated | T-403 | Timestamp set |
| T-405 | Create assert_serp.sql | SERP validation | T-404 | File + passes |

---

## Phase 5: Crawl

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-501 | Build O-Daily | Enqueue crawl by track_level | T-118 | Workflow JSON |
| T-502 | Build W-3 Fetch Router | HTTP + gates + fallback | T-501 | Workflow JSON |
| T-503 | Test HTTP path | Fetch simple page | T-502 | http_fetches row |
| T-504 | Test fallback path | Fetch JS page → Crawl4AI | T-503 | page_content row |
| T-505 | Test canonical hashing | Same page → same hash | T-504 | Hash matches |
| T-506 | Test robots skip | Disallowed URL → skipped | T-505 | result_json logged |
| T-507 | Create assert_crawl.sql | Crawl validation | T-506 | File + passes |
| T-508 | Create runbook: crawl | docs/runbooks/crawl_test.md | T-507 | File exists |

---

## Phase 6: Extraction

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-601 | Build W-4 Extract Meta | Title, headings, links | T-507 | Workflow JSON |
| T-602 | Build W-5 Extract AI | Offers, CTAs with evidence | T-601 | Workflow JSON |
| T-603 | Test W-4 | Parse fixture page | T-601 | page_metadata row |
| T-604 | Test W-5 | Extract offers | T-602 | clinic_offers row |
| T-605 | Test evidence fields | evidence_url + snippet populated | T-604 | No nulls |
| T-606 | Test hash gate | Same hash → no new job | T-605 | Job count unchanged |
| T-607 | Create assert_extraction.sql | Extraction validation | T-606 | File + passes |

---

## Phase 7: Scoring

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-701 | Build O-Score | Weekly scoring workflow | T-607 | Workflow JSON |
| T-702 | Test scoring | Run O-Score | T-701 | competitor_score set |
| T-703 | Test track_level | Verify A/B/C assignment | T-702 | track_level set |
| T-704 | Test clinic-only filter | Directories excluded | T-703 | Score=0 for dirs |
| T-705 | Create assert_scoring.sql | Scoring validation | T-704 | File + passes |

---

## Phase 8: Ops

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-801 | Build O-Sweeper (jobs) | Reclaim stuck jobs | T-502 | Workflow JSON |
| T-802 | Build O-Robots | Refresh robots snapshots | T-117 | Workflow JSON |
| T-803 | Build O-Classify | Domain classification | T-802 | Workflow JSON |
| T-804 | Test sweeper | Lock job, expire, sweep | T-801 | Job reclaimed |
| T-805 | Test robots refresh | Expire snapshot, refresh | T-802 | New fetched_at |
| T-806 | Create assert_ops.sql | Ops validation | T-805 | File + passes |

---

## Phase 9: Dashboard

| ID | Title | Description | Deps | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-899 | Pipeline Stability Gate | All previous phases pass | T-806, T-705, T-607, T-507, T-405, T-310, T-210 | All asserts green |
| T-901 | Init Next.js project | Create dashboard/ folder | T-899 | App runs |
| T-902 | Connect to Postgres | Read-only queries | T-901 | Data displayed |
| T-903 | Vertical overview page | Tables by vertical | T-902 | Page loads |
| T-904 | Competitor tracking page | Score + rank | T-903 | Page loads |
| T-905 | Offer comparison page | Prices across clinics | T-904 | Page loads |
| T-906 | Validate 12 queries | Dashboard answers all | T-905 | All pass |
| T-907 | Create runbook: dashboard | docs/runbooks/dashboard_test.md | T-906 | File exists |
