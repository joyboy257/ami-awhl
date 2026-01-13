# AMI Database Analysis Report

**Date:** 13 January 2026 (Updated)  
**Prepared for:** CTO & CEO  
**System:** AWHL Market Intelligence (AMI)

---

## Executive Summary

AMI is a competitive intelligence platform tracking **227 wellness clinics** across 3 verticals in Singapore. The system monitors competitor websites, pricing, offers, and search engine rankings to provide strategic market insights.

### Current Data Asset

| Metric | Value | Status |
|--------|-------|--------|
| **Clinics Tracked** | 227 | ✅ Good |
| **Domains Monitored** | 227 | ✅ Good |
| **Total Pages Discovered** | 6,727 | ✅ Good |
| **Content Pages Crawled** | 3,752 | ✅ 94% of crawlable |
| **Keywords Tracked** | 828 | ✅ Good |
| **Offers Captured** | 360 | ✅ Active |
| **CTAs Detected** | 712 | ✅ Good |

---

## Page Discovery & Crawl Analysis

### Understanding Page Types

Not all discovered URLs are crawlable content. Analysis of the 6,727 pages reveals:

| Page Type | Count | % of Total | Crawl Action |
|-----------|-------|------------|--------------|
| **Content Pages** | ~4,000 | 59% | ✅ Crawl & extract |
| **Image Files** | 1,728 | 26% | ⏭ Skip (not content) |
| **Sitemap URLs** | 1,000 | 15% | ⏭ Metadata only |
| **Other Assets** | ~0 | <1% | ⏭ Skip (PDFs, CSS, JS) |

### Why We Skip Non-Content Pages

1. **Image files** (`.jpg`, `.png`, `.gif`, `.webp`)
   - These are embedded assets, not standalone content
   - No text to extract for competitive intelligence
   - Correctly filtered by W-4B workflow

2. **Sitemap URLs** (contains "sitemap")
   - XML metadata files listing other URLs
   - Already processed during discovery phase (W-2)
   - Re-crawling would be redundant

3. **Static assets** (`.pdf`, `.css`, `.js`)
   - Technical files not relevant for market intelligence
   - Would waste crawl capacity

### Actual Crawl Coverage

| Metric | Value |
|--------|-------|
| Content pages discovered | ~4,000 |
| Content pages crawled | 3,752 |
| **Content crawl rate** | **94%** ✅ |
| Pending content pages | ~247 |

> **Key Insight:** The apparent 56% overall crawl rate (3,752/6,727) is misleading. When measuring against *crawlable content only*, we've achieved **94% coverage**.

---

## Market Coverage

### Verticals Breakdown

```
Beauty        ████████████████████████░░░░░░  117 clinics (52%)
Chiropractic  ███████████░░░░░░░░░░░░░░░░░░░   57 clinics (25%)
TCM           ██████████░░░░░░░░░░░░░░░░░░░░   51 clinics (22%)
```

### AWHL Brand Positioning (Updated)

| Brand | Competitive Score | Market Position | Crawl Status |
|-------|-------------------|-----------------|--------------|
| **Dr HAACH** | 44/100 | #2 overall | ✅ Well covered |
| **Natrahea** | 38/100 | #4 overall | ✅ Crawled |
| **Guo Tai TCM** | 9/100 | Bottom quartile | ⚠️ Needs content |
| **HAACH** | 5/100 | Bottom quartile | ⚠️ Needs content |

> **Insight:** Dr HAACH and Natrahea have good crawl coverage. Guo Tai TCM and HAACH have low scores likely due to limited discoverable content on their sites.

---

## Competitive Intelligence Data

### Pricing Intelligence

| Offer Type | Count | Average Price |
|------------|-------|---------------|
| Regular Services | 166 | $173 |
| Packages | 104 | $226 |
| Trial Offers | 62 | $357 |
| Promotions | 28 | $561 |

**Total Offers Tracked:** 360

### Conversion Channels (CTAs)

| Channel | Count | % of Total |
|---------|-------|------------|
| WhatsApp | 213 | 30% |
| Contact Forms | 192 | 27% |
| Phone/Call | 154 | 22% |
| Email | 136 | 19% |
| Online Booking | 17 | 2% |

> **Insight:** WhatsApp is the dominant conversion channel in Singapore wellness. Only 2% use online booking systems.

---

## Search Visibility

### Keywords by Vertical

| Vertical | Keywords Tracked | SERP Snapshots |
|----------|------------------|----------------|
| TCM | 316 | 530+ |
| Beauty | 286 | 480+ |
| Chiropractic | 226 | 400+ |

**Total SERP Results Analyzed:** 2,000

### Keyword Performance

- **15,031** page-level keyword associations
- **2,373** clinic-level keyword mappings
- **1,514** SERP snapshots captured

---

## Top Competitors (by Score)

| Rank | Clinic | Vertical | Score |
|------|--------|----------|-------|
| 1 | Lifechirocentre | Chiropractic | 50 |
| 2 | **Dr HAACH** 🔶 | Aesthetics | 44 |
| 3 | Fresha | Beauty | 43 |
| 4 | **Natrahea** 🔶 | Chiropractic | 38 |
| 5 | Sinkangtcm | TCM | 37 |
| 6 | Makuang | TCM | 36 |
| 7 | Chiro Singapore | Chiropractic | 35 |
| 8 | Mirageaesthetic | Beauty | 34 |

🔶 = AWHL brands

---

## Data Quality Assessment

### ✅ Strengths

1. **Broad market coverage** - 227 competitors across all 3 target verticals
2. **High content crawl rate** - 94% of crawlable content captured
3. **Strong CTA detection** - 712 conversion touchpoints captured
4. **Good keyword foundation** - 828 search queries monitored
5. **Pricing data** - 360 offers with evidence links

### ⚠️ Areas for Improvement

| Issue | Current | Target | Gap |
|-------|---------|--------|-----|
| Pending content pages | 247 | 0 | Run W-4B once more |
| SEO metadata extraction | Partial | 100% | Run W-5A |
| Data freshness | 7 days | <3 days | Schedule regular runs |

---

## Recommended Actions

### Immediate (Today)

1. **Run W-4B Depth Crawl** one more time
   - Will crawl remaining ~247 content pages
   - Completion: ~100% content coverage

### Short-term (This Week)

2. **Run Extraction Workflows**
   - W-5A: SEO metadata extraction (titles, meta descriptions, H1s)
   - W-5B: Keyword extraction from page content
   - W-6: Commercial facts (offers, CTAs, pricing)

3. **Run Scoring Workflow**
   - W-7: Recalculate competitor scores with complete data

### Medium-term (Monthly)

4. **Schedule Regular Crawls**
   - W-4B: Weekly re-crawl for content changes
   - W-3 SERP: Daily keyword tracking
   - W-7: Weekly score recalculations

---

## Technical Infrastructure

| Component | Status |
|-----------|--------|
| PostgreSQL Database | ✅ Running |
| n8n Workflow Engine | ✅ Running |
| Dashboard (Next.js) | ✅ Running |
| Docker Environment | ✅ Stable |

---

## Appendix: Database Schema

```
wellness.clinics (227 rows)
    └── wellness.domains (227 rows)
            └── wellness.pages (6,727 rows)
                    └── wellness.page_content (3,752 rows)
                    └── wellness.page_keywords (15,031 rows)
    └── wellness.clinic_offers (360 rows)
    └── wellness.clinic_ctas (712 rows)
    └── wellness.clinic_keywords (2,373 rows)

wellness.search_queries (828 rows)
    └── wellness.serp_snapshots (1,514 rows)
            └── wellness.serp_results (2,000 rows)
```

---

## Appendix: Page Type Classification Logic

The W-4B crawler uses the following filters to identify crawlable content:

```sql
-- Skip conditions (NOT crawled)
url ILIKE '%sitemap%'     -- Sitemap XML files
url ILIKE '%.jpg'         -- JPEG images
url ILIKE '%.png'         -- PNG images  
url ILIKE '%.gif'         -- GIF images
url ILIKE '%.webp'        -- WebP images
url ILIKE '%.pdf'         -- PDF documents
url ILIKE '%.css'         -- CSS stylesheets
url ILIKE '%.js'          -- JavaScript files
```

This ensures crawl capacity is focused on actual content pages with extractable competitive intelligence.

---

*Report updated from live database queries on 13 Jan 2026*
