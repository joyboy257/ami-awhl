# AMI Pipeline: Stakeholder Overview

> **What is AMI?**  
> AMI (AWHL Market Intelligence) is an automated competitive intelligence platform for the Singapore wellness market.

---

## The Big Picture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   W-1       │ → │   W-2       │ → │   W-3       │ → │   W-4+      │
│ Build       │    │ SERP        │    │ Site        │    │ Crawl &     │
│ Queries     │    │ Mining      │    │ Discovery   │    │ Extract     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     ↓                   ↓                   ↓                   ↓
  Search              Discover           Map Their           Extract
  Keywords            Competitors        Websites            Intel
```

---

## W-1: Build Search Queries

### 🎯 Business Goal
_"What should we ask Google to find our competitors?"_

### What It Does
- Combines **services** (e.g., "Acupuncture", "Botox") with **locations** (e.g., "Tampines", "near me") and **intent patterns** (e.g., "best {service} in {location}")
- Generates hundreds of targeted search queries automatically

### Stakeholder Value
✅ No manual guesswork about which keywords matter  
✅ Covers 4 verticals: TCM, Beauty, Chiropractic, Aesthetics  
✅ Bounded: Max 200 queries per vertical (prevents runaway costs)

### Output
→ Populated `search_queries` table ready for SERP mining

---

## W-2: SERP Pipeline

### 🎯 Business Goal
_"Who ranks on Google for these keywords?"_

### What It Does
1. **Calls SerpAPI** for each query (Google Singapore results)
2. **Stores raw snapshots** for audit trail
3. **Parses organic results** and **local pack** (Google Maps listings)
4. **Seeds competitor domains** and **clinics** automatically

### Stakeholder Value
✅ Discovers competitors you didn't know existed  
✅ Tracks who owns the Local Pack (Maps visibility)  
✅ Links domains to verticals automatically  

### Output
→ `serp_snapshots` (raw Google data)  
→ `serp_results` (ranked competitors)  
→ `domains` (competitor websites)  
→ `clinics` (business entities)

---

## W-3: Site Discovery

### 🎯 Business Goal
_"What pages exist on each competitor's website?"_

### What It Does
1. **Checks robots.txt** (respects crawling rules)
2. **Fetches sitemaps** (XML files listing all pages)
3. **Inventories pages** (URLs ready for deeper crawling)

### Stakeholder Value
✅ Builds complete site maps of competitors  
✅ Identifies key pages: /pricing, /services, /contact  
✅ Respects website policies (good actor behavior)

### Output
→ `sitemaps` (discovered sitemap files)  
→ `pages` (URL inventory per domain)

---

## What Comes Next?

| Workflow | Purpose |
|----------|---------|
| **W-4: Crawl Router** | Fetch actual page content |
| **W-5: SEO Enrichment** | Extract titles, meta, keywords |
| **W-6: Commercial Facts** | Extract prices, offers, CTAs |
| **W-7: Scoring** | Rank competitors by visibility + strength |
| **W-8: Monitoring** | Keep data fresh over time |

---

## Why This Matters

### For Marketing
- Know exactly what competitors are promoting
- Identify pricing gaps and opportunities
- Track who dominates Google for key terms

### For Strategy
- Data-driven competitor battlecards
- Evidence-backed pricing recommendations
- Market positioning insights

### For Operations
- Automated, repeatable data collection
- No manual research required
- Fresh data on demand

---

## Key Principles

1. **Evidence-First**: Every extracted fact includes proof (screenshots, snippets)
2. **Idempotent**: Safe to re-run without creating duplicates
3. **Bounded**: Hard limits prevent runaway API costs
4. **Local-First**: All data stored in your own Postgres database

---

> _"When we click Trigger Workflow, AMI runs smoothly and reliably populates Postgres with the data needed for competitive intelligence."_  
> — AMI Master Plan
