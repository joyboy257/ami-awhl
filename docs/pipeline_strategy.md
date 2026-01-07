# AMI Pipeline Strategy (n8n) — Clean v1.0

Verticals in scope (v1):
- TCM
- Beauty
- Chiropractic
- Aesthetics

---

## 1) Mental Model (The Loop)

You are running a loop:

**Vertical → Search Queries → SERP → Clinics/Domains → Site Inventory → Crawl → SEO + Keywords + Commercial Facts → Score → Monitor → Repeat**

Everything must be:
- **Bounded** (hard budgets to prevent runaway costs)
- **Retryable** (job-based execution, resumable)
- **Observable** (clear run/job status + failure reasons)
- **Incremental** (reprocess only when content changes)

```mermaid
graph TD
    V[Verticals] --> W1[W1 Build Search Queries]
    W1 --> SQ[(search_queries)]
    SQ --> W2[W2 SERP Snapshot + Seed]
    W2 --> SD[(serp_snapshots)]
    W2 --> SR[(serp_results)]
    W2 --> CL[(clinics)]
    W2 --> DM[(domains)]
    DM --> W3[W3 Site Discovery]
    W3 --> SM[(sitemaps)]
    W3 --> PG[(pages)]
    PG --> W4[W4 Crawl Router]
    W4 --> PF[(page_fetches)]
    W4 --> PC[(page_content)]
    PC --> W5[W5 SEO + Keywords]
    W5 --> SEO[(page_seo)]
    W5 --> PK[(page_keywords)]
    W5 --> CK[(clinic_keywords)]
    PC --> W6[W6 Commercial Facts]
    W6 --> OF[(clinic_offers)]
    W6 --> CTA[(clinic_ctas)]
    SR --> W7[W7 Scoring]
    CK --> W7
    OF --> W7
    W7 --> SC[(competitor_scores)]
    SC --> W8[W8 Monitor + Expand]
    W8 -.-> W2
    W8 -.-> W4
2) Minimum Viable Data (Tables)
Keep tables simple and “source-of-truth-ish”. Extend later.

Core entities
verticals — { id, name }

geo_sets — SG areas (optional but recommended)

services — per vertical service taxonomy

search_query_templates — patterns like "best {service} in {geo}", "{service} near me"

search_queries — generated queries per vertical (output of W1)

Seeding + SERP
serp_snapshots — raw SerpAPI JSON per query + timestamp

serp_results — parsed results (rank, type=organic/local_pack, title, url, domain)

clinics — canonical business entity (name, vertical_id, confidence, first_seen_at)

domains — domain list + mapping to clinic_id

Site inventory + crawl
sitemaps — discovered sitemap URLs per domain

pages — URL inventory (url, domain_id, page_type, last_seen, last_crawled_at, content_hash)

page_fetches — fetch logs (status_code, fetch_method, bytes, error, fetched_at)

page_content — cleaned markdown + html refs (or blob path)

Enrichment outputs
page_seo — title/meta/H1/canonical/schema/hreflang/etc.

page_keywords — extracted keywords per page (term, score, method)

clinic_keywords — rolled up keywords per clinic/domain

clinic_offers — prices/packages/trials evidence-based

clinic_ctas — whatsapp/book/phone etc evidence-based

Ops (required for “smooth runs”)
runs — run_id, started/ended, mode, budgets, status

jobs — queue table (job_type, payload, state, attempts, available_at, locked_at)

You cannot have “smooth trigger” without runs + jobs even if everything else is perfect.

3) Workflow Map (W1 → W8)
Workflow 1 — Build Search Queries (per vertical)
Goal: generate the search queries to discover clinics + keyword universe.
Trigger: manual (“Run for verticals”), or weekly schedule.

Inputs

verticals = {TCM, Beauty, Chiropractic, Aesthetics}

services per vertical (start with 10–30 each)

geo terms (optional): Central, East, West, North, CBD, neighborhoods, “near me”

query templates: 10–20 patterns

Process

Cartesian product but bounded:

max_queries_per_vertical_per_run (default 200)

enforce uniqueness via hash(vertical_id + query_text + geo)

Two layers:

Service queries: “acupuncture near me”, “chiropractor tampines”

Intent queries: price, trial, package, promo, review, best

Output
Insert into search_queries:

vertical_id, query_text, geo, intent_tag, priority_tier (A/B/C), active=true

Workflow 2 — Seed Clinics + Keywords (SERP-driven + optional manual)
Goal: discover clinics/domains from SERP and seed your keyword universe.
Trigger: after W1, or “Run full seed”.

Inputs

search_queries where active=true and priority_tier in (A, B)

2A) SERP snapshot

Call SerpAPI for each query (bounded)

Store raw JSON in serp_snapshots

Parse:

organic results (url, title, snippet)

local pack / map pack (if available)

Upsert serp_results

2B) Convert SERP results into clinic/domain seeds

Extract domain from each result URL

Heuristics:

exclude directories/aggregators (config denylist)

prefer URLs with patterns like /contact, /services, /treatment, /pricing

Upsert:

domains

clinics (best-effort name from SERP; mark low confidence if uncertain)

map domain → clinic (if unsure, keep clinic unresolved but domain retained)

2C) Seed keywords (initial)
3 keyword sources:

your query_texts (highest intent)

SERP “related searches / people also ask” (expand)

SERP snippets/title n-grams (lightweight)

Store in clinic_keywords (or dedicated keywords table) with:

vertical_id, term, source={query|related|snippet}, initial_score

Outputs

domains/clinics ready to crawl

initial keywords aligned to vertical

Workflow 3 — Site Discovery (build URL inventory per domain)
Goal: turn each seeded domain into a page inventory.
Trigger: after W2, or daily for new domains.

Inputs

domains where discovery_state != complete

Process

Fetch robots.txt

Extract sitemap URLs

Guess common sitemap endpoints regardless (bounded)

Fetch/parse sitemap XML:

recurse to depth 3

extract page URLs (+ lastmod if present)

Outputs

sitemaps filled

pages populated with candidate URLs

mark domain discovery complete + counts

Discovery does not crawl deeply; it only builds inventory.

Workflow 4 — Crawl Router (fetch + clean content)
Goal: fetch pages reliably and store stable content hashes.
Trigger: scheduled (hourly) + manual “crawl now”.

Inputs

pages due for crawl:

last_crawled_at is null OR older than track_level interval

not excluded by rules (robots, duplicates, denylist)

Process

Enforce per-domain throttle (critical)

Try in order:

HTTP GET

if thin/blocked → headless (Crawl4AI)

if still blocked → Firecrawl

Save:

fetch metadata in page_fetches

HTML (or pointer to storage)

cleaned markdown in page_content

content_hash = sha256(markdown) on pages

Outputs

content DB filled with stable hashes (enables incremental processing)

Workflow 5 — SEO Enrichment (on changed pages)
Goal: enrich SEO fields + derive keywords from content.
Trigger: whenever content_hash changes (or after crawl batch).

Inputs

pages where content_hash != last_processed_hash

5A) SEO metadata extraction (deterministic)
Extract from HTML:

title, meta description

H1/H2s

canonical

robots meta

OG tags

schema.org JSON-LD presence + types

hreflang (if any)

internal links count, external links count

image alt coverage (optional)

Store in page_seo.

5B) Keyword extraction (2-pass)

Pass 1 (cheap): tf-idf / n-grams / RAKE-like from markdown

Pass 2 (AI only for priority pages): “extract service + geo + intent keywords”

Store in page_keywords.

5C) Roll up to clinic/domain level
Aggregate top terms across all pages per domain (weight service pages > blog).
Store in clinic_keywords.

Outputs

SEO data + keywords ready

Workflow 6 — Commercial Facts (offers, prices, promos, CTAs)
Goal: produce battlecard-ready facts with evidence.
Trigger: after W5, only for likely commercial pages.

Inputs

pages where page_type in (service, commercial, contact)
OR content contains pricing signals

Process
AI extraction with evidence rule:

Offer type (trial/package)

Price + currency

Service

CTA type (WhatsApp/Book/Call)

Evidence snippet = exact text match

Store in clinic_offers, clinic_ctas with URL/page reference.

Outputs

evidence-backed commercial intel

Workflow 7 — Competitor Scoring (visibility + site strength)
Goal: convert signals into rankings.

Inputs

serp_results (rankings)

clinic_offers presence

site inventory completeness

SEO hygiene signals (schema, canonical, etc.)

Outputs

clinics.competitor_score

per-vertical leaderboards

Workflow 8 — Monitoring + Expansion Loop
Goal: keep data fresh + discover new competitors.

Cadence:

Daily: Tier A SERPs

Weekly: Tier B SERPs

Monthly: refresh discovery for domains

Continuous: crawl due pages

Continuous: enrich changed pages

Expansion:

auto-add new domains from SERPs into discovery queue

4) One-Click Trigger (O-Run Orchestrator)
Instead of manually triggering 8 workflows, make one orchestrator.

Input: vertical(s), mode (smoke/full), budgets
Action: creates run_id, then enqueues jobs in order:

build_queries (W1)

serp_snapshot (W2A)

seed_clinics_keywords (W2B/W2C)

domain_discovery (W3)

crawl_pages (W4)

seo_enrich_keywords (W5)

commercial_extract (W6)

score (W7)

Success condition: queue drained + asserts pass.

This is the mechanism that makes “Trigger Workflow = smooth run” true.

5) Practical Defaults (Caps)
max search queries per vertical per run: 200

max SERP calls per run: 100–300

max new domains seeded per run: 50

max pages per domain to crawl initially: 50

prioritize /services, /treatments, /contact, /pricing

per-domain concurrency: 1

retry policy: 3 attempts, exponential backoff, then mark “needs review”

6) Sanity Checks (Expected DB State After Each Workflow)
After W1: search_queries has rows for all 4 verticals ✅

After W2: serp_snapshots, serp_results, domains, clinics populated ✅

After W3: pages count jumps per domain ✅

After W4: page_content filled, content_hash present, fetch logs show success rates ✅

After W5: page_seo, page_keywords, clinic_keywords populated ✅

After W6: offers + CTAs show up with evidence ✅

After W7: competitor score tables filled ✅