# AMI Workflow Documentation

> Complete reference for the 8 automated pipelines powering AMI competitive intelligence.

---

## Pipeline Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   W-1       │ → │   W-2       │ → │   W-3       │ → │   W-4       │
│ Build       │    │ SERP        │    │ Site        │    │ Crawl       │
│ Queries     │    │ Pipeline    │    │ Discovery   │    │ Router      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↓                  ↓                  ↓                  ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   W-5A/B/C  │ ← │   W-6       │ ← │   W-7       │ ← │   W-8       │
│ Extraction  │    │ Commercial  │    │ Scoring     │    │ Monitor     │
│ (SEO/KW)    │    │ Facts       │    │             │    │ & Expand    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## Execution Order & Frequency

| Order | Workflow | Name | Frequency | Dependencies |
|:-----:|----------|------|-----------|--------------|
| 1 | **W-1** | Build Search Queries | **Once**, then monthly | None |
| 2 | **W-2** | SERP Pipeline | **Weekly** | W-1 (queries exist) |
| 3 | **W-3** | Site Discovery | **After W-2**, then weekly | W-2 (domains exist) |
| 4 | **W-4** | Crawl Router | **Daily** | W-3 (pages exist) |
| 5 | **W-5A** | SEO Extraction | **After W-4** | W-4 (content crawled) |
| 6 | **W-5B** | Keyword Extraction | **After W-4** | W-4 (content crawled) |
| 7 | **W-5C** | Clinic Keyword Rollup | **After W-5B** | W-5B (keywords extracted) |
| 8 | **W-6** | Commercial Facts | **After W-4** | W-4 (content crawled) |
| 9 | **W-7** | Scoring | **Daily** (end of day) | W-5, W-6 complete |
| 10 | **W-8** | Monitor & Expand | **Daily** | All others |

---

## W-1: Build Search Queries

### Purpose
Generate the search queries we'll use to find competitors on Google.

### What It Does
1. Loads **verticals** (TCM, Beauty, Chiropractic, Aesthetics)
2. Loads **services** per vertical (e.g., Acupuncture, Botox, Facial)
3. Loads **geo sets** (Singapore locations: Orchard, Tampines, "near me")
4. Applies **templates** (e.g., "best {service} in {location}")
5. Generates all permutations → inserts into `search_queries`

### Key Settings
| Setting | Value |
|---------|-------|
| Max queries per vertical | 200 |
| Priority tiers | A (high-intent), B (medium), C (low) |

### Outcomes
- ✅ `search_queries` table populated
- ✅ Each query linked to a vertical
- ✅ Unique constraint prevents duplicates

### Tables Written
- `wellness.search_queries`

---

## W-2: SERP Pipeline

### Purpose
Discover who ranks on Google for each query.

### What It Does
1. Picks **pending queries** from `search_queries`
2. Calls **SerpAPI** with Google Singapore profile
3. Stores **raw JSON** in `serp_snapshots`
4. Parses **organic results** and **local pack**
5. Creates/updates `domains` and `clinics`
6. Stores **ranked positions** in `serp_results`

### Key Settings
| Setting | Value |
|---------|-------|
| API | SerpAPI (Google Search) |
| Profile | gl=sg, hl=en, device=desktop |
| Results parsed | Top 10 organic + Local Pack (3 results) |

### Outcomes
- ✅ Competitors discovered automatically
- ✅ Every domain linked to a clinic
- ✅ SERP positions tracked for trending analysis
- ✅ Raw data preserved for audit

### Tables Written
- `wellness.serp_snapshots` (raw API response)
- `wellness.serp_results` (parsed rankings)
- `wellness.domains` (new competitor domains)
- `wellness.clinics` (new competitor entities)

---

## W-3: Site Discovery

### Purpose
Map out every page on each competitor's website.

### What It Does
1. Picks **pending domains** (discovery_state = 'pending')
2. Fetches **robots.txt** via Robots Microservice
3. Checks **crawl permission** (is the site allowed?)
4. Fetches **sitemaps** (sitemap.xml, sitemap_index.xml)
5. Parses **all page URLs** from sitemaps
6. Inserts into `pages` table

### Key Settings
| Setting | Value |
|---------|-------|
| Max sitemap depth | 3 levels (index → sitemap → pages) |
| Respects robots.txt | Yes |
| Handles gzip | Yes |

### Outcomes
- ✅ Full URL inventory per competitor
- ✅ Identifies key pages: /pricing, /services, /about
- ✅ Marks domains as `done` when complete

### Tables Written
- `wellness.sitemaps`
- `wellness.pages`
- `wellness.domains` (updates discovery_state)

---

## W-4: Crawl Router

### Purpose
Fetch actual HTML content from discovered pages.

### What It Does
1. Claims **batch of pending pages** (state = 'pending')
2. Checks **rate limits** per domain
3. Fetches via **HTTP** first (fast, cheap)
4. Falls back to **Firecrawl/Crawl4AI** if needed (JS-rendered)
5. Stores **raw HTML** and **markdown** in `page_content`
6. Updates page **last_crawled_at** and **status**

### Key Settings
| Setting | Value |
|---------|-------|
| Batch size | 10 pages per run |
| Rate limit | 1 request/second per domain |
| Timeout | 30 seconds |
| Fallback enabled | Yes (for JS-heavy sites) |

### Outcomes
- ✅ Page content ready for extraction
- ✅ Markdown version for AI processing
- ✅ HTTP status tracked (404, 403, 500)
- ✅ Provider metadata stored (which tool fetched it)

### Tables Written
- `wellness.page_content` (HTML + markdown)
- `wellness.http_fetches` (request metadata)
- `wellness.pages` (updates crawl state)

---

## W-5A: SEO Extraction

### Purpose
Extract SEO signals from crawled pages.

### What It Does
1. Reads **crawled pages** with content
2. Extracts:
   - Title tag
   - Meta description
   - H1 heading
   - Canonical URL
   - Schema.org structured data
3. Stores in `page_seo_signals`

### Outcomes
- ✅ SEO audit data per page
- ✅ Identifies competitors with strong SEO hygiene
- ✅ Detects LocalBusiness schema (Google Maps optimization)

### Tables Written
- `wellness.page_seo_signals`

---

## W-5B: Keyword Extraction

### Purpose
Identify target keywords from page content.

### What It Does
1. Analyzes **page content** (title, H1, body)
2. Extracts **keyword phrases** (1-3 words)
3. Scores **relevance** to vertical
4. Stores with **evidence** (where found on page)

### Outcomes
- ✅ Keyword inventory per competitor
- ✅ Identifies what terms competitors are targeting
- ✅ Evidence-backed (not guesswork)

### Tables Written
- `wellness.page_keywords`

---

## W-5C: Clinic Keyword Rollup

### Purpose
Aggregate keywords from all pages up to clinic level.

### What It Does
1. Groups keywords by **clinic**
2. Counts **frequency** across all pages
3. Identifies **top keywords** per clinic
4. Stores rollup in `clinic_keywords`

### Outcomes
- ✅ Clinic-level keyword profile
- ✅ Identifies dominant themes per competitor
- ✅ Powers "Keyword Gap" analysis

### Tables Written
- `wellness.clinic_keywords`

---

## W-6: Commercial Facts

### Purpose
Extract pricing, offers, and CTAs from competitor pages.

### What It Does
1. Uses **AI extraction** (structured prompts, temperature=0)
2. Extracts:
   - **Offers**: trial prices, packages, promotions
   - **CTAs**: WhatsApp, phone, booking forms, email
3. Stores with **evidence snippets** (proof text)

### Key Settings
| Setting | Value |
|---------|-------|
| AI Model | GPT-4 / Claude |
| Temperature | 0 (deterministic) |
| Evidence required | Yes (50+ char snippet) |

### Outcomes
- ✅ Competitor pricing database
- ✅ CTA method tracking (who uses WhatsApp?)
- ✅ Trial offer leaderboard
- ✅ Every fact has proof snippet

### Tables Written
- `wellness.clinic_offers`
- `wellness.clinic_ctas`

---

## W-7: Scoring

### Purpose
Calculate competitive scores for each clinic.

### What It Does
1. Loads **all extracted data** for a clinic
2. Calculates **5 dimension scores**:
   - **Visibility** (SERP rankings, keyword coverage)
   - **Inventory** (page count, content depth)
   - **Conversion** (CTA types, WhatsApp presence)
   - **Commercial** (offer variety, pricing evidence)
   - **Technical** (SEO hygiene, schema markup)
3. Computes **weighted average** → 0-100 score
4. Stores **breakdown** in JSON for drilldown

### Key Settings
| Dimension | Weight |
|-----------|--------|
| Visibility | 30% |
| Inventory | 15% |
| Conversion | 20% |
| Commercial | 20% |
| Technical | 15% |

### Outcomes
- ✅ Every clinic has a competitive score
- ✅ Dimension-level breakdown for battlecards
- ✅ Score confidence rating
- ✅ Comparable across verticals

### Tables Written
- `wellness.clinics` (updates competitor_score, score_breakdown, score_confidence)

---

## W-8: Monitor & Expand

### Purpose
Keep data fresh and discover new competitors.

### What It Does
1. **Re-runs SERP queries** on schedule
2. **Detects new domains** from search results
3. **Triggers W-3 discovery** for new domains
4. **Schedules re-crawls** for stale pages
5. **Detects changes** (price changes, new offers)
6. **Logs events** for Change Radar

### Key Settings
| Setting | Value |
|---------|-------|
| SERP refresh cycle | Weekly |
| Page re-crawl threshold | 7 days stale |
| Change detection | Price, CTA, offer type |

### Outcomes
- ✅ Data stays fresh automatically
- ✅ New competitors discovered continuously
- ✅ Changes logged for alerting
- ✅ No manual intervention required

### Tables Written
- `wellness.change_events` (new/changed items)
- Various tables refreshed

---

## Recommended Daily Schedule

```
06:00 AM  ─── W-4: Crawl Router (batch 1)
08:00 AM  ─── W-4: Crawl Router (batch 2)
10:00 AM  ─── W-5A/5B: Extraction
12:00 PM  ─── W-6: Commercial Facts
02:00 PM  ─── W-4: Crawl Router (batch 3)
04:00 PM  ─── W-5C: Keyword Rollup
06:00 PM  ─── W-7: Scoring
08:00 PM  ─── W-8: Monitor & Expand
```

### Weekly Tasks
- **Monday**: W-2 SERP refresh (all queries)
- **Tuesday**: W-3 Discovery for new domains
- **Friday**: Data quality audit

### Monthly Tasks
- **W-1**: Refresh keyword list (new services, locations)
- **Review**: Prune inactive competitors

---

## Triggering Workflows

### Manual (n8n UI)
1. Open n8n at http://localhost:55000
2. Navigate to workflow
3. Click **Execute Workflow**

### Scheduled (n8n Cron)
- Each workflow can have a Schedule Trigger node
- Configure cron expression for automated runs

### API Trigger
```bash
curl -X POST http://localhost:55000/webhook/w4-crawl
```

---

## Monitoring Health

### Dashboard: Data Health Page
- Shows crawl success rates
- Shows domain discovery status
- Shows recent pipeline runs

### Database Checks
```sql
-- Pending pages (should decrease over time)
SELECT count(*) FROM wellness.pages WHERE state = 'pending';

-- Recently scored clinics
SELECT count(*) FROM wellness.clinics 
WHERE scored_at > NOW() - INTERVAL '24 hours';

-- Extraction coverage
SELECT count(*) FROM wellness.clinic_offers 
WHERE extracted_at > NOW() - INTERVAL '7 days';
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No new competitors | W-2 not run recently | Trigger W-2 |
| Pages stuck pending | W-4 rate limited | Check domain rate limits |
| Missing scores | W-7 not run | Trigger W-7 |
| Stale data | W-8 not scheduled | Enable W-8 cron |
| Empty extractions | Page content missing | Re-run W-4 for failed pages |

---

> **Key Principle**: Each workflow is **idempotent** — safe to re-run without creating duplicates.
