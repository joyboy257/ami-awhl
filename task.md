# AMI Task Breakdown

## Git & GitHub Setup

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-001 | Verify Git installed | Check `git --version` works | — | Version number printed |
| T-002 | Configure Git identity | Set `user.name` and `user.email` | T-001 | `git config --list` shows values |
| T-003 | Verify .gitignore exists | Check for .gitignore in repo root | T-001 | File exists or create minimal |
| T-004 | Create GitHub repo | Create empty repo on GitHub web UI | — | Repo URL available |
| T-005 | Add remote origin | `git remote add origin <URL>` | T-004 | `git remote -v` shows origin |
| T-006 | Initial commit | Commit implementation_plan.md + task.md | T-005 | `git log` shows commit |
| T-007 | Push to main | `git push -u origin main` | T-006 | Remote shows files |

---

## Phase 1: Infrastructure

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-101 | Create 001_pgcrypto.sql | `CREATE EXTENSION IF NOT EXISTS pgcrypto` | T-007 | File exists |
| T-102 | Create 002_jobs.sql | Jobs table DDL | T-101 | File exists |
| T-103 | Create 003_domains.sql | Domains table DDL | T-101 | File exists |
| T-104 | Create 004_pages_alter.sql | Add columns to pages | T-103 | File exists |
| T-105 | Create 005_sitemaps_alter.sql | Add locking columns to sitemaps | T-101 | File exists |
| T-106 | Create 006_serp.sql | serp_profiles, keywords, geo_sets | T-103 | File exists |
| T-107 | Create 007_vertical_services.sql | vertical_services table | T-101 | File exists |
| T-108 | Create 008_serp_snapshots.sql | serp_snapshots, serp_results | T-106 | File exists |
| T-109 | Create 009_http_fetches.sql | http_fetches, page_html, page_content | T-104 | File exists |
| T-110 | Apply all migrations | Run 001–009 against Postgres | T-109 | `\dt wellness.*` shows tables |
| T-111 | Verify pgcrypto | `SELECT gen_random_uuid()` | T-110 | UUID returned |

---

## Phase 2: Discovery

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-201 | Build W-1 Discover Sitemaps | Robots + guess logic | T-110 | Workflow JSON exists |
| T-202 | Build W-2 Expand Sitemap | Parse XML, depth limit, batch | T-201 | Workflow JSON exists |
| T-203 | Build O-Sweeper (sitemaps) | Reclaim stuck sitemaps | T-202 | Workflow JSON exists |
| T-204 | Test W-1 with fixture | Seed clinic, run W-1 | T-201 | Sitemaps in DB |
| T-205 | Test W-2 with fixture | Queue sitemap, run W-2 | T-202 | Pages in DB |
| T-206 | Test idempotency | Run W-1/W-2 twice | T-205 | No duplicates |

---

## Phase 3: Keyword Pipeline

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-301 | Seed vertical_services | Insert services for each vertical | T-110 | Rows in DB |
| T-302 | Seed geo_sets | Insert SG_CORE_10, SG_ALL | T-110 | Rows in DB |
| T-303 | Seed keyword_templates | Insert template patterns | T-302 | Rows in DB |
| T-304 | Build W-K1 Generate | Template × geo × service | T-303 | Workflow JSON |
| T-305 | Build W-K2 Expand | SERP signals extraction | T-304 | Workflow JSON |
| T-306 | Build W-K3 Tier | Tier + prune logic | T-305 | Workflow JSON |
| T-307 | Test K1 | Run K1, check cap 300 | T-304 | Keywords in DB |
| T-308 | Test uniqueness | Insert duplicate → fails | T-307 | Constraint error |

---

## Phase 4: SERP Intelligence

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-401 | Seed serp_profiles | EN desktop, ZH mobile per vertical | T-110 | Rows in DB |
| T-402 | Build O-SERP | Schedule by tier | T-401 | Workflow JSON |
| T-403 | Build W-6 SERP Fetch | SerpAPI call, store raw_json | T-402 | Workflow JSON |
| T-404 | Test W-6 | Snapshot one keyword | T-403 | serp_snapshots row |
| T-405 | Verify last_snapshot_at | Check keyword updated | T-404 | Timestamp set |

---

## Phase 5: Crawl

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-501 | Build robots microservice | Docker container for parsing | T-110 | Container runs |
| T-502 | Build O-Daily | Enqueue crawl by track_level | T-501 | Workflow JSON |
| T-503 | Build W-3 Fetch Router | HTTP + gates + fallback | T-502 | Workflow JSON |
| T-504 | Test HTTP path | Fetch simple page | T-503 | http_fetches row |
| T-505 | Test fallback path | Fetch JS page → Crawl4AI | T-504 | page_content row |
| T-506 | Test canonical hashing | Same page → same hash | T-505 | Hash matches |

---

## Phase 6: Extraction

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-601 | Build W-4 Extract Meta | Title, headings, links | T-506 | Workflow JSON |
| T-602 | Build W-5 Extract AI | Offers, CTAs | T-601 | Workflow JSON |
| T-603 | Test W-4 | Parse fixture page | T-601 | page_metadata row |
| T-604 | Test W-5 | Extract offers | T-602 | clinic_offers row |
| T-605 | Test hash gate | Same hash → no new job | T-604 | Job count unchanged |

---

## Phase 7: Scoring

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-701 | Build O-Score | Weekly scoring workflow | T-604 | Workflow JSON |
| T-702 | Test scoring | Run O-Score | T-701 | competitor_score set |
| T-703 | Test track_level | Verify A/B/C assignment | T-702 | track_level set |
| T-704 | Test clinic-only filter | Directories excluded | T-703 | Score=0 for directories |

---

## Phase 8: Ops

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-801 | Build O-Sweeper (jobs) | Reclaim stuck jobs | T-503 | Workflow JSON |
| T-802 | Build O-Robots | Refresh robots snapshots | T-501 | Workflow JSON |
| T-803 | Build O-Classify | Domain classification | T-802 | Workflow JSON |
| T-804 | Test sweeper | Lock job, expire, sweep | T-801 | Job reclaimed |
| T-805 | Test robots refresh | Expire snapshot, refresh | T-802 | New fetched_at |

---

## Phase 9: Dashboard

| ID | Title | Description | Dependencies | Validation |
| :--- | :--- | :--- | :--- | :--- |
| T-901 | Init Next.js project | Create dashboard/ folder | T-704 | App runs |
| T-902 | Connect to Postgres | Read-only queries | T-901 | Data displayed |
| T-903 | Vertical overview page | Tables by vertical | T-902 | Page loads |
| T-904 | Competitor tracking page | Score + rank | T-903 | Page loads |
| T-905 | Offer comparison page | Prices across clinics | T-904 | Page loads |
| T-906 | Validate 12 queries | Dashboard answers all | T-905 | All pass |
