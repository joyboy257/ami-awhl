# AMI Pipeline Strategy (n8n) — v5.1

## 0. Pipeline Overview

```
INPUTS → DISCOVERY → KEYWORD → SERP → CRAWL → EXTRACT → SCORING → OUTPUTS

Discovery: W-1 robots → W-2 sitemap expand → pages inventory
Keyword: K1 templates → K2 SERP expand → K3 tier/prune
SERP: O-SERP schedule → W-6 snapshot → visibility
Crawl: O-Daily queue → W-3 Fetch Router (HTTP → Crawl4AI/Firecrawl) → store
Extract: W-4 meta → W-5 AI (offers/CTAs) → normalize
Scoring: O-Score weekly → track_level → refresh cadence
Ops: O-Sweeper + O-Robots + O-Classify
```

---

## 1. Core Principles

| Principle | Implementation |
| :--- | :--- |
| **Vertical-First** | `vertical_id` on `clinics` + `keywords`. |
| **Profile-Bound Keywords** | Unique by `(keyword_text, serp_profile_id)`. |
| **Fetch Router** | HTTP first → quality gates → Crawl4AI/Firecrawl fallback. |
| **Clinic-Only Scoring** | Visibility excludes directories (`domain_class`). |
| **Canonical Hashing** | `content_hash = sha256(markdown ?? cleaned_html ?? raw_html)`. |

---

## 2. Schema Patches

### 2.0 Prerequisites
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 2.1 wellness.jobs
```sql
CREATE TABLE wellness.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  target_kind TEXT NOT NULL,
  target_id UUID,
  target_url TEXT,
  input_hash TEXT,
  prompt_version TEXT,
  model TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  state TEXT DEFAULT 'queued',
  result_json JSONB,
  priority INT DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  lock_expires_at TIMESTAMPTZ,
  locked_by TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);
CREATE INDEX idx_jobs_claim ON wellness.jobs(job_type, state, available_at);
```

### 2.2 wellness.domains
```sql
CREATE TABLE wellness.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT UNIQUE NOT NULL,
  domain_class TEXT DEFAULT 'unknown',
  last_request_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 wellness.pages (Alterations)
```sql
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES wellness.domains(id);
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS sitemap_lastmod TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMPTZ;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_http_status INT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS last_content_hash TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS page_type TEXT;
ALTER TABLE wellness.pages ADD COLUMN IF NOT EXISTS type_conf FLOAT DEFAULT 0;
```

### 2.4 wellness.sitemaps (Alterations)
```sql
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS depth INT DEFAULT 0;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS parent_sitemap_id UUID REFERENCES wellness.sitemaps(id);
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMPTZ;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS locked_by TEXT;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0;
ALTER TABLE wellness.sitemaps ADD COLUMN IF NOT EXISTS error_json JSONB;
```

### 2.5 wellness.http_fetches
```sql
CREATE TABLE wellness.http_fetches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  url TEXT NOT NULL,
  domain_id UUID REFERENCES wellness.domains(id),
  status_code INT,
  final_url TEXT,
  headers_json JSONB,
  duration_ms INT,
  fetch_provider TEXT DEFAULT 'n8n',
  provider_cost NUMERIC,
  quality_gate_failed TEXT,
  error_json JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_fetches_page ON wellness.http_fetches(page_id, fetched_at DESC);
```

### 2.6 wellness.page_html + wellness.page_content
```sql
CREATE TABLE wellness.page_html (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  content_hash TEXT NOT NULL,
  raw_html TEXT,
  html_gzip BYTEA,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, content_hash)
);

CREATE TABLE wellness.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES wellness.pages(id),
  content_hash TEXT NOT NULL,
  markdown TEXT,
  word_count INT,
  provider TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, content_hash)
);
```

### 2.7 wellness.vertical_services
```sql
CREATE TABLE wellness.vertical_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  service_name TEXT NOT NULL,
  synonyms TEXT[] DEFAULT '{}',
  intent TEXT DEFAULT 'commercial',
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(vertical_id, service_name)
);
```

### 2.8 wellness.serp_profiles + geo_sets + keyword_templates
```sql
CREATE TABLE wellness.serp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  name TEXT NOT NULL,
  gl TEXT DEFAULT 'sg',
  hl TEXT DEFAULT 'en',
  device TEXT DEFAULT 'desktop',
  location TEXT DEFAULT 'Singapore',
  uule TEXT,
  UNIQUE(vertical_id, name)
);

CREATE TABLE wellness.geo_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  modifiers TEXT[] NOT NULL,
  priority_order INT DEFAULT 0
);

CREATE TABLE wellness.keyword_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template TEXT NOT NULL,
  geo_set_id UUID REFERENCES wellness.geo_sets(id),
  language TEXT DEFAULT 'en'
);

CREATE TABLE wellness.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_text TEXT NOT NULL,
  serp_profile_id UUID NOT NULL REFERENCES wellness.serp_profiles(id),
  vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
  tier TEXT DEFAULT 'C',
  source TEXT DEFAULT 'manual',
  seed_keyword_id UUID REFERENCES wellness.keywords(id),
  active BOOLEAN DEFAULT TRUE,
  last_snapshot_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword_text, serp_profile_id)
);
```

### 2.9 wellness.serp_snapshots + serp_results
```sql
CREATE TABLE wellness.serp_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID NOT NULL REFERENCES wellness.keywords(id),
  serp_profile_id UUID NOT NULL REFERENCES wellness.serp_profiles(id),
  raw_json JSONB,
  raw_hash TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(keyword_id, serp_profile_id, captured_at)
);

CREATE TABLE wellness.serp_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES wellness.serp_snapshots(id),
  rank_position INT NOT NULL,
  block_type TEXT NOT NULL,  -- organic, local_pack, featured, ad
  domain_id UUID REFERENCES wellness.domains(id),
  url TEXT,
  title TEXT,
  snippet TEXT,
  UNIQUE(snapshot_id, rank_position, block_type)
);
```

---

## 3. Robots Compliance

### 3.1 Microservice Response
```json
{"allowed": true, "reason": "allow_rule:/", "matched_rule": "/", "user_agent": "AMI-Bot", "crawl_delay": 5}
```

### 3.2 Storage
Decisions stored in `jobs.result_json` when skipping:
```json
{"skip_reason": "robots", "robots_decision": {"allowed": false, "reason": "disallow_rule:/private/"}}
```

---

## 4. W-3 Fetch Router

### 4.1 Decision Flow
```
1. Claim job → 2. Resolve domain_id → 3. Check robots
4. Atomic throttle → 5. HTTP fetch → 6. Quality gates
7. If gates fail → Fallback provider → 8. Store + hash
9. If hash changed → enqueue extract_meta
```

### 4.2 Quality Gates
| Gate | Check | Action |
| :--- | :--- | :--- |
| Status | 403, 429, 503 | → Fallback |
| Size | <2KB | → Fallback |
| SPA Shell | `#root`/`#__next` + <200 words | → Fallback |
| Text Ratio | visible_text/html < 0.05 | → Fallback |
| Bot Block | "cf-browser-verification" | → Fallback |

### 4.3 Canonical Hashing
```
content_hash = sha256(markdown ?? cleaned_html ?? raw_html)
```
Applied **after** provider returns, ensuring identical content → identical hash regardless of provider.

### 4.4 Provider Failover
```
HTTP 403/429 → try Crawl4AI (self-host)
Crawl4AI 429/5xx → try Firecrawl
Firecrawl 429/5xx → reschedule (available_at + 1 hour)
```

### 4.5 Provider Contracts

**Firecrawl:**
```
POST https://api.firecrawl.dev/v1/scrape
Headers: Authorization: Bearer $FIRECRAWL_API_KEY
Body: {"url": "...", "formats": ["markdown", "html"], "timeout": 30000}
Response: {"success": true, "data": {"markdown": "...", "html": "..."}}
```

**Crawl4AI (self-host):**
```
POST http://crawl4ai:8000/crawl
Body: {"url": "...", "word_count_threshold": 50}
Response: {"success": true, "markdown": "...", "cleaned_html": "..."}
```

---

## 5. Workflow Inventory

| ID | Type | Purpose |
| :--- | :--- | :--- |
| **O-Daily** | Orchestrator | Enqueue crawl by track_level |
| **O-SERP** | Orchestrator | Enqueue SERP by tier |
| **O-Score** | Orchestrator | Weekly scoring |
| **W-1** | Discovery | Robots + sitemaps |
| **W-2** | Discovery | Sitemap expansion |
| **W-3** | Job Worker | Fetch Router |
| **W-4** | Job Worker | Extract metadata |
| **W-5** | Job Worker | Extract AI |
| **W-6** | Job Worker | SERP snapshot |
| **W-K1** | Keyword | Generate templates |
| **W-K2** | Keyword | Expand SERP |
| **W-K3** | Keyword | Tier + prune |
| **O-Sweeper** | Ops | Reclaim stuck |
| **O-Robots** | Ops | Refresh robots |
| **O-Classify** | Ops | Classify domains |

---

## 6. Acceptance Criteria

- [ ] `CREATE EXTENSION pgcrypto` in migration 001.
- [ ] All DDLs exist: jobs, domains, http_fetches, page_html, page_content, vertical_services, serp_snapshots, serp_results.
- [ ] Canonical hashing uses `markdown ?? cleaned_html ?? raw_html`.
- [ ] Provider failover: HTTP → Crawl4AI → Firecrawl → reschedule.
- [ ] Keywords unique by `(keyword_text, serp_profile_id)`.
- [ ] serp_results unique by `(snapshot_id, rank_position, block_type)`.
