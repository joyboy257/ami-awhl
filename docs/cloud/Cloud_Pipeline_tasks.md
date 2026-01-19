# AMI Cloud Pipeline Execution Order

## Phase 1: Setup (Prerequisites)
**Status:** ✅ Completed (Seeds run on Cloud DB)
- `verticals`, `services`, `geo_sets`, `search_query_templates` are seeded.

---

## Phase 2: Discovery
Goal: Find competitor domains and discover their pages.

| Step | Workflow | Purpose | Runs |
|------|----------|---------|------|
| 1 | **W-1: Build Search Queries** | Creates search queries from `templates` + `services` + `geo`. | **Once** |
| 2 | **W-2: SERP Pipeline** | Searches Google via Serper, discovers competitor domains. | **Once per vertical** (Repeatedly run until 0 queries depend remaining) |
| 3 | **W-3: Site Discovery** | Finds sitemaps and discovers pages for domains found in W-2. | **Multiple** (Repeatedly run until all pending domains are processed) |

---

## Phase 3: Crawl & Extract
Goal: Fetch content and extract structured data.

| Step | Workflow | Purpose | Runs |
|------|----------|---------|------|
| 4 | **W-4: Crawl Router** | Fetches page HTML, converts to markdown, and stores in `page_content`. | **Multiple** (Processes 50 pages per run) |
| 5 | **W-5A: SEO Extraction** | Extracts metadata: titles, meta descriptions, H1s, canonicals. | **After W-4** (Run repeatedly) |
| 6 | **W-6: Commercial Facts** | Extracts business data: offers, CTAs, WhatsApp links. | **After W-4** (Run repeatedly) |

---

## Phase 4: Scoring & Rollup
Goal: Aggregate data and score competitors.

| Step | Workflow | Purpose | Runs |
|------|----------|---------|------|
| 7 | **W-5B/5C: Keyword Rollup** | Aggregates keyword usage from pages to clinic level. | **After W-5A** |
| 8 | **W-7: Scoring** | Calculates final competitor scores based on visibility, content, and offers. | **After all extraction** |

---

## Quick Reference Command Chain
```
W-1 (1x) 
  → W-2 (until done) 
    → W-3 (until done) 
      → W-4 (until done) 
        → W-5A (until done) 
          → W-6 (until done) 
            → W-5C 
              → W-7
```
