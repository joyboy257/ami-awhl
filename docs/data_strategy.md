# AMI Data Strategy (Clean v1.0)

## 0) Core Objective
Establish a deterministic, local-first data foundation to reverse-engineer competitor strategies in Singapore wellness markets. The Postgres schema (`wellness`) serves as the single source of truth for all competitive intelligence.

---

## 1) Entity & Domain Model
The relationship between businesses and their digital presence must be durable.

| Component | Responsibility | Key Invariants |
| :--- | :--- | :--- |
| **Verticals** | Market classification (TCM, Beauty, Chiro, Aesthetics). | Root of all service/keyword scoping. |
| **Services** | Vertical-specific taxonomy (e.g., "Acupuncture", "Hydrafacial"). | Bridges queries to commercial facts. |
| **Clinics** | The business entity being analyzed. | Linked to visibility scores and offers. |
| **Domains** | The technical host representing a clinic. | 1:1 or N:1 mapping to Clinics; source of "Site Inventory". |

- **Uniqueness**: `UNIQUE(domain)` in `wellness.domains`.
- **Deduplication**: Multi-domain clinic groups must be reconciled to a single `clinic_id` where possible.

---

## 2) Discovery Data (SERP-First)
AMI discovers competitors via SERP mining, not manual input.

| Stage | Data Object | Purpose |
| :--- | :--- | :--- |
| **Input** | `search_queries` | Hashed queries: `(vertical_id, query_text, geo)`. |
| **Raw** | `serp_snapshots` | Immutable SerpAPI JSON with timestamps. |
| **Structured** | `serp_results` | Ranked results (organic/local) with domain extraction. |
| **Keyword Seed** | `clinic_keywords` | High-intent terms from queries + related searches. |

---

## 3) Site Inventory & Content Lifecycle
We build a full manifest of a domain's pages before crawling.

### A. Inventory (`wellness.sitemaps`, `wellness.pages`)
- **Discovery**: Recursive sitemap parsing (depth ≤ 3).
- **Inventory**: All discovered URLs are stored in `pages` with `domain_id` and `page_type` (service, pricing, contact, etc.).
- **Uniqueness**: `UNIQUE(domain_id, url)`.

### B. Ingestion (`wellness.page_fetches`, `wellness.page_content`)
- **Router**: HTTP -> Headless -> Firecrawl fallback.
- **Storage**: Clean markdown extracted from raw HTML.
- **Idempotency**: `content_hash = sha256(markdown)`. Downstream enrichment only triggers if the hash changes.

---

## 4) Intelligence Layer (Fact Extraction)
Business intelligence must be verifiable.

| Data Type | Table | Requirement |
| :--- | :--- | :--- |
| **SEO Hygiene** | `page_seo` | Deterministic extraction of Meta, H1, Schema, Links. |
| **Keywords** | `page_keywords` | Term density (cheap) + Service/Geo mapping (AI). |
| **Offers** | `clinic_offers` | Prices/Packages with `evidence_snippet`. |
| **CTAs** | `clinic_ctas` | Conversion paths (WhatsApp, Booking hooks). |

- **The Evidence Rule**: No commercial fact (price, promo) exists without an `evidence_snippet` and `source_url`.

---

## 5) Ops & Orchestration (Smooth Runs)
Execution is managed via a job queue to ensure reliability and observability.

- **Runs**: Every execution batch has a `run_id` with defined budgets (max queries, max pages).
- **Jobs**: Every discrete task (SERP call, page fetch, AI extract) is a row in `wellness.jobs`.
- **States**: `pending` → `locked` → `done` | `failed`.
- **Obs**: `jobs.result_json` captures success metadata or error stack traces.

---

## 6) Scoring & Monitor (Outputs)
- **Visibility Score**: Derived from `serp_results` (rank weight + frequency).
- **Strength Score**: Derived from "Intelligence Layer" (SEO hygiene + commercial depth).
- **Refresh Cadence**: Profile-bound (`Tier A` daily, `Tier B` weekly).

---

## 7) Data Integrity Rules
1. **Never Destructive**: Use soft deletes or state transitions; never `DELETE` production facts.
2. **Local-First**: Artifacts (HTML/Images) stored in local volumes, metadata in Postgres.
3. **Deterministic**: Given the same HTML, the Parser must produce the same Markdown/SEO struct.
4. **Bounded**: Every workflow run MUST respect budget caps in `runs.budgets`.
