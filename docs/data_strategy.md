# AMI Data Collection Strategy

## Executive Summary
**Objective**: Reverse-engineer competitor SEO strategies, pricing, and SERP dominance in Singapore Wellness.
**Context**: Multi-domain clinic groups, local pack dominance, profile-bound keywords.

---

## 1. Entity & Domain Layer
| Table | Key Columns | Uniqueness |
| :--- | :--- | :--- |
| `wellness.domains` | `domain`, `domain_class` | `UNIQUE(domain)` |
| `wellness.clinics` | `vertical_id`, `competitor_score`, `track_level` | — |
| `wellness.clinic_domains` | `clinic_id`, `domain_id`, `domain_type` | `UNIQUE(clinic_id, domain_id)` |

---

## 2. Discovery & Page Layer
| Table | Key Columns | Uniqueness |
| :--- | :--- | :--- |
| `wellness.sitemaps` | `depth`, `parent_sitemap_id`, locking fields | `UNIQUE(clinic_id, url)` |
| `wellness.pages` | `domain_id` FK, `sitemap_lastmod`, `last_crawled_at`, `last_http_status` | `UNIQUE(clinic_id, url)` |

---

## 3. Job Queue Layer
| Table | Key Columns | Notes |
| :--- | :--- | :--- |
| `wellness.jobs` | `dedupe_key`, `available_at`, locking, `result_json` | `UNIQUE(dedupe_key)` |

**Robots decisions** stored in `jobs.result_json` when skipping:
```json
{"skip_reason": "robots", "robots_decision": {"allowed": false, "reason": "disallow_rule:/private/"}}
```

---

## 4. Crawl & Fetch Layer
| Table | Key Columns | Uniqueness |
| :--- | :--- | :--- |
| `wellness.http_fetches` | `page_id`, `fetch_provider`, `quality_gate_failed` | — (append-only) |
| `wellness.page_html` | `page_id`, `content_hash`, `raw_html` | `UNIQUE(page_id, content_hash)` |
| `wellness.page_content` | `page_id`, `content_hash`, `markdown`, `word_count` | `UNIQUE(page_id, content_hash)` |

**Canonical Hashing**: `content_hash = sha256(markdown ?? cleaned_html ?? raw_html)`

---

## 5. Keyword & SERP Layer
| Table | Key Columns | Uniqueness |
| :--- | :--- | :--- |
| `wellness.serp_profiles` | `vertical_id`, `gl`, `hl`, `device`, `location` | `UNIQUE(vertical_id, name)` |
| `wellness.keywords` | `keyword_text`, `serp_profile_id`, `tier`, `source` | `UNIQUE(keyword_text, serp_profile_id)` |
| `wellness.geo_sets` | `name`, `modifiers[]`, `priority_order` | `UNIQUE(name)` |
| `wellness.keyword_templates` | `template`, `geo_set_id` | — |
| `wellness.vertical_services` | `vertical_id`, `service_name`, `synonyms[]` | `UNIQUE(vertical_id, service_name)` |
| `wellness.serp_snapshots` | `keyword_id`, `raw_json`, `raw_hash` | `UNIQUE(keyword_id, serp_profile_id, captured_at)` |
| `wellness.serp_results` | `snapshot_id`, `rank_position`, `block_type`, `domain_id` | `UNIQUE(snapshot_id, rank_position, block_type)` |

---

## 6. Extraction Layer
| Table | Key Columns | Uniqueness |
| :--- | :--- | :--- |
| `wellness.clinic_offers` | `clinic_id`, `service_name`, `offer_type`, `evidence_url`, `evidence_snippet` | `UNIQUE(clinic_id, service_name, offer_type, extracted_for_hash)` |
| `wellness.clinic_ctas` | `page_id`, `cta_text`, `cta_type`, `evidence_snippet` | `UNIQUE(page_id, cta_text, cta_type)` |
| `wellness.page_metadata` | `page_id`, `extracted_for_hash` | `UNIQUE(page_id, extracted_for_hash)` |

**Evidence Strategy**: Store `evidence_url` + `evidence_snippet` (short text) for dashboard display without re-fetching.

---

## 7. Scoring Layer
| Column | Table | Notes |
| :--- | :--- | :--- |
| `competitor_score` | `wellness.clinics` | Weekly computed, excludes directories |
| `track_level` | `wellness.clinics` | A/B/C → controls refresh cadence |

---

## 8. Implementation Priorities
1.  `CREATE EXTENSION IF NOT EXISTS pgcrypto`
2.  Create all tables in dependency order (see `pipeline_strategy.md` §2)
3.  Backfill `pages.domain_id` from existing data
4.  Seed `vertical_services` + `geo_sets` + `serp_profiles`
