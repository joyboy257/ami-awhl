# AWHL Market Intelligence (AMI) — Master Plan (Clean v1.0)

**Codename**: AMI  
**Owner**: Lead Automation + Data Platform Engineering  
**Runtime**: Local-first (Docker + n8n + Postgres)  
**Schema**: `wellness` (Postgres)

---

## 0) Strategy & Intent

AMI is a deterministic, local-first data platform to reverse-engineer competitor strategies in Singapore wellness markets.

**The Loop**  
`Vertical` → `Search Queries` → `SERP` → `Clinics/Domains` → `Site Inventory` → `Crawl` → `SEO + Keywords + Commercial Facts` → `Score` → `Monitor` → *Repeat*

**North Star Expectation**  
When we click **Trigger workflow**, AMI should run **smoothly** and reliably populate Postgres with the data needed for competitive intelligence.

**Core Capabilities**
- **Clinic Discovery**: Build competitor lists via SERP mining (not manual guessing).
- **Entity Mapping**: `Clinic ↔ Domain ↔ Pages` with durable IDs.
- **SEO Intelligence**: Titles/H1/meta, schema presence, canonical hygiene, keyword footprints.
- **Keyword Pipeline**: Generate → tier → snapshot → expand.
- **Commercial Intel**: Trials/packages/pricing + CTAs with **evidence snippets**.
- **Scoring**: Visibility (SERP) + on-site strength (inventory + SEO + commercial signals).
- **Ops Reliability**: Runs + Jobs queue so execution is bounded, retryable, and observable.

---

## 1) Target Verticals (Singapore) — v1 Scope

| Vertical | Description |
| :--- | :--- |
| **TCM** | Chinese medicine clinics (acupuncture, cupping, tui na) |
| **Beauty** | Salons, nails, lash/brow, skincare studios |
| **Chiropractic** | Spine/posture clinics |
| **Aesthetics** | Medical aesthetics (botox/fillers/laser/facials) |

> Note: Facials/Massage are not separate verticals in Clean v1.0; they sit under **Beauty** or **Aesthetics** depending on positioning.

---

## 2) Example User Queries & Data Requirements (Success Criteria)

These questions define what “good data” looks like.

### Q1: “Top 10 keywords competitors use in **Chiropractic**?”
*Business Question*: “What are they ranking for that I’m not?”

| Data Source | Purpose |
| :--- | :--- |
| `search_queries` | What we asked Google. |
| `serp_results` | Who ranks in top positions. |
| `clinic_keywords` | Rolled-up terms across the clinic’s site. |
| `domains` | Filter out directories/aggregators. |

### Q2: “Average trial/package price for **Aesthetics** services (e.g., Hydrafacial / laser)?”
*Business Question*: “How should we price first-time offers?”

| Data Source | Purpose |
| :--- | :--- |
| `clinic_offers` | Prices where `offer_type` in (‘trial’, ‘package’). |
| `clinics` | Filter by `vertical` = ‘Aesthetics’. |
| `evidence_snippet` | MUST show exact on-page proof. |
| `pages` | Link offer back to source URL. |

### Q3: “Who owns the Local Pack for ‘chiropractor singapore’?”
*Business Question*: “Which clinic has the best Maps strategy?”

| Data Source | Purpose |
| :--- | :--- |
| `serp_results` | Filter `type` = `local_pack`. |
| Aggregation | Count appearances per `domain_id` / `clinic_id`. |

### Q4: “Battlecard: Compare Brand A vs Brand B”
*Business Question*: “Pages, offers, visibility, SEO hygiene.”

| Data Source | Purpose |
| :--- | :--- |
| `pages` | Site size + key page types. |
| `clinic_offers` / `clinic_ctas` | Pricing + conversion strategy. |
| `page_seo` | SEO hygiene signals. |
| `competitor_score` | Visibility + strength score. |

---

## 3) Schema Summary (Clean v1.0)

*Detailed workflow logic lives in `docs/pipeline_strategy.md`.*

| Layer | Key Tables |
| :--- | :--- |
| **Core Entities** | `verticals`, `services`, `geo_sets`, `search_query_templates` |
| **SERP + Seeding** | `search_queries`, `serp_snapshots`, `serp_results`, `clinics`, `domains` |
| **Discovery + Inventory** | `sitemaps`, `pages` |
| **Crawl** | `page_fetches`, `page_content` |
| **Enrichment** | `page_seo`, `page_keywords`, `clinic_keywords` |
| **Commercial Facts** | `clinic_offers`, `clinic_ctas` |
| **Ops** | `runs`, `jobs` |

---

## 4) Pipeline Workflows (W1–W8)

| Workflow | Purpose | Primary Outputs |
| :--- | :--- | :--- |
| **W1: Build Search Queries** | Generate bounded search queries for all 4 verticals (service + intent layers). | `search_queries` |
| **W2: Seed Clinics + Keywords (SERP)** | SERP snapshot → parse results → seed domains/clinics → seed initial keywords. | `serp_snapshots`, `serp_results`, `domains`, `clinics`, `clinic_keywords` |
| **W3: Site Discovery** | robots + sitemap discovery → sitemap expansion (depth ≤ 3) → pages inventory. | `sitemaps`, `pages` |
| **W4: Crawl Router** | Fetch pages (HTTP → headless → Firecrawl) → store content + hash. | `page_fetches`, `page_content`, `pages.content_hash` |
| **W5: SEO Enrichment + Page Keywords** | Extract SEO fields + keywords (cheap then AI for priority) → roll up clinic keywords. | `page_seo`, `page_keywords`, `clinic_keywords` |
| **W6: Commercial Facts** | AI extraction of offers/CTAs (with evidence). | `clinic_offers`, `clinic_ctas` |
| **W7: Scoring** | Compute competitor scores (visibility + site strength). | `clinics.competitor_score` (or `competitor_scores`) |
| **W8: Monitoring + Expansion** | Cadenced SERP refresh + crawl refresh + new domain discovery loop. | refreshed `serp_*`, `page_*`, plus new domains/pages |

---

## 5) Execution Model (The “Smooth Trigger” Contract)

### O-Run Orchestrator (Required)
Instead of manually triggering 8 workflows, we trigger **one** orchestrator that:
1) creates a `run_id` in `runs`,  
2) enqueues bounded `jobs` in dependency order,  
3) returns immediately (asynchronous execution via workers).

**Inputs**
- `vertical_ids[]` (default: all 4)
- `mode`: `smoke` | `full`
- `budgets`: `{ maxQueriesPerVertical, maxSerpCalls, maxNewDomains, maxPagesPerDomainInitial }`

**Success**
- job queue drained for `run_id`
- no stale locks
- asserts pass (minimum inserts achieved; failure reasons recorded in `jobs.result_json`)

---

## 6) Engineering Standards (Non-Negotiable)

- **Idempotency**
  - job-level `dedupe_key` (or unique `(job_type, payload_hash)`)
  - page-level `content_hash = sha256(markdown)`
- **Crash Safety**
  - lock expiry + sweeper to release stale jobs
  - retries: 3 attempts + exponential backoff
- **Bounded by Design**
  - max 200 queries/vertical/run
  - max 50 new domains/run
  - max 50 pages/domain (initial crawl)
  - per-domain concurrency: 1
- **Evidence Rule**
  - all offers/CTAs MUST include `evidence_snippet` and source URL/page reference
- **Observability**
  - every job writes `result_json` on success/failure/skip
  - `runs` summarize counts: queued/succeeded/failed/skipped

---

## 7) Operational Cadence (Default)

- **Tier A SERPs**: daily
- **Tier B SERPs**: weekly
- **Domain discovery refresh**: monthly
- **Crawl router**: hourly/continuous
- **SEO + extraction**: on content hash change

---

## 8) Next Actions (Rebased to Clean v1.0)

1) **Apply SQL migrations + seeds** (local Postgres) for:  
   `verticals/services/geo_sets/templates/search_queries/serp/sitemaps/pages/crawl/enrichment/offers/runs/jobs`.
2) Implement **O-Run** + `jobs` workers (claim/lock/retry/expire).
3) Build W1 → W3 first (queries → SERP seeding → sitemap inventory).
4) Build W4 crawl router with throttle + fallback.
5) Add W5 SEO enrichment + keyword extraction (cheap-first).
6) Add W6 commercial extraction with evidence rule.
7) Add W7 scoring.
8) Add W8 monitoring schedules + expansion logic.
9) Create minimal “Ops views” (run health, crawl health, extraction health) for debugging.
