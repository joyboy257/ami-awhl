# AWHL Market Intelligence (AMI) — Master Plan / Roadmap
Codename: AMI  
Owner: Lead Automation + Data Platform Engineering  
Runtime: Local-first (Docker + n8n + Postgres)  
Schema: `wellness` (Postgres)  

---

## 0) Strategy & Intent
AMI is a deterministic, local-first data platform to reverse-engineer competitor strategies in Singapore Wellness.

**Core Capabilities:**
- **Entity Mapping**: brands ↔ domains ↔ locations
- **Pricing Intel**: trials, bundles, memberships with evidence
- **SERP Dominance**: organic + local pack + clinic-only scoring
- **Keyword Pipeline**: generate → expand → tier → snapshot
- **Fetch Router**: HTTP-first, fallback to Crawl4AI/Firecrawl for JS-heavy/blocked pages, store markdown + html with canonical hashing

### Target Verticals (Singapore)
| Vertical | Description |
| :--- | :--- |
| **Chiropractic** | Spine/posture clinics |
| **Beauty** | Salons, nail, lash/brow |
| **Facials** | Treatment centers, medical spas |
| **Massage** | Spa chains, boutique parlors |
| **TCM** | Chinese medicine, acupuncture |
| **Mens Beauty** | Male grooming, barbershops |

### Example User Queries
1.  "Top 10 keywords used by **Chiropractic** clinics?"
2.  "Average trial price for **Hydrafacial** across **Facials**?"
3.  "Who owns the Local Pack for 'chiropractor singapore'?"
4.  "Compare **Brand X** vs **Brand Y** on pages, offers, visibility."

---

## 1) Core Principles
1.  **Vertical-First**: `vertical_id` on clinics + keywords.
2.  **Profile-Bound Keywords**: Unique by `(keyword_text, serp_profile_id)`.
3.  **Fetch Router**: HTTP → quality gates → Crawl4AI → Firecrawl → reschedule.
4.  **Canonical Hashing**: `sha256(markdown ?? cleaned_html ?? raw_html)`.
5.  **Clinic-Only Scoring**: Visibility excludes directories.
6.  **Track Level**: A/B/C controls crawl cadence.

---

## 2) Schema Summary
*See `docs/data_strategy.md` for full details.*

| Layer | Key Tables |
| :--- | :--- |
| Entity | `domains`, `clinics`, `clinic_domains` |
| Discovery | `sitemaps` (depth, locking), `pages` (domain_id FK) |
| Jobs | `jobs` (dedupe_key, available_at, locking) |
| Crawl | `http_fetches`, `page_html`, `page_content` |
| Keywords | `serp_profiles`, `keywords`, `geo_sets`, `vertical_services` |
| SERP | `serp_snapshots` (raw_json), `serp_results` |
| Extraction | `clinic_offers`, `clinic_ctas`, `page_metadata` |
| Scoring | `clinics.competitor_score`, `clinics.track_level` |

---

## 3) Pipeline Phases
*See `docs/pipeline_strategy.md` for workflow details.*

| Phase | Workflows |
| :--- | :--- |
| **Discovery** | W-1 (robots), W-2 (sitemap expand) |
| **Keyword** | W-K1 (templates), W-K2 (SERP expand), W-K3 (tier/prune) |
| **SERP** | O-SERP (schedule), W-6 (snapshot) |
| **Crawl** | O-Daily (queue), W-3 (Fetch Router) |
| **Extract** | W-4 (metadata), W-5 (AI offers/CTAs) |
| **Scoring** | O-Score (weekly) |
| **Ops** | O-Sweeper, O-Robots, O-Classify |

---

## 4) Engineering Standards
- **Idempotency**: `dedupe_key` on jobs, `extracted_for_hash` on extractions
- **Crash-Safe**: Lock expiry + sweeper for sitemaps and jobs
- **Canonical Hashing**: Consistent across all providers
- **Evidence**: Store `evidence_url` + `evidence_snippet` for offers/CTAs

---

## 5) Next Actions
1.  ✅ Finalize `pipeline_strategy.md` v5.1
2.  ✅ Sync `data_strategy.md`
3.  ⏳ User approval of all strategy docs
4.  ⏳ Generate SQL migrations (001-009)
5.  ⏳ Build n8n workflows in dependency order
