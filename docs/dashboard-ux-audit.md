# AMI Dashboard UX Audit Report

**Audit Date:** 12 January 2026  
**Auditor:** Third-Party UX Review  
**Dashboard Version:** v1.0

---

## Executive Summary

The AMI Dashboard provides a solid foundation for competitive intelligence visualization. However, several critical issues impact data quality, user trust, and actionable insights. This audit identifies **12 issues** across 7 pages with prioritized recommendations.

### Overall Score: **6.5/10**

| Criteria | Score | Status |
|----------|-------|--------|
| Visual Design | 8/10 | ✅ Good |
| Data Accuracy | 5/10 | ⚠️ Critical Issues |
| UX Flow | 7/10 | ✅ Acceptable |
| Functionality | 6/10 | ⚠️ Needs Work |
| Performance | 7/10 | ✅ Acceptable |

---

## Page-by-Page Findings

### 1. Home Page (`/`)

**What Works:**
- Clean executive summary with key metrics
- Good visual hierarchy with KPIs prominently displayed

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| H-1 | 🔴 High | Duplicate entries in "Top Threats" (Winkwax appears twice) | Undermines trust in data accuracy |
| H-2 | 🟡 Medium | "Top Opportunities" section empty | Missed actionable insights |
| H-3 | 🟡 Medium | Red "1 Issue" badge in sidebar with no explanation | Creates confusion/anxiety |

---

### 2. Market Map (`/market-map`)

**What Works:**
- Full competitor list with 227 entries
- Sorting and filtering capabilities
- Score badges with color coding

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| M-1 | 🔴 High | SEO Hygiene shows static 20% for ALL competitors | Metric is unusable/misleading |
| M-2 | 🟡 Medium | Some top competitors show only 1 page | Data quality concern |
| M-3 | 🟢 Low | No search/filter by clinic name visible | Navigation inefficiency |

---

### 3. Keywords (`/keywords`)

**What Works:**
- 828 keywords tracked with tier classification
- Clean table layout with sortable columns

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| K-1 | 🟡 Medium | "Last Check" shows future dates (1/12/2026) | Timezone/date formatting error |
| K-2 | 🟡 Medium | Many keywords show "—" for Top Rank despite snapshots | Missing data connection |
| K-3 | 🟢 Low | Tier filter could show keyword counts per tier | Better context |

---

### 4. Offers & Pricing (`/offers`)

**What Works:**
- CTA Mix chart clearly shows WhatsApp dominance
- Offer type filtering implemented

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| O-1 | 🔴 High | Trial Leaderboard shows 10+ identical "Winkwax" entries | Leaderboard unusable |
| O-2 | 🔴 High | Price Distribution chart fails to load (skeleton state) | Critical feature broken |
| O-3 | 🟡 Medium | Price format shows "SGD$99" (redundant currency) | Minor formatting issue |

---

### 5. Change Radar (`/change-radar`)

**What Works:**
- Real-time event tracking concept
- Event type filtering implemented

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| C-1 | 🔴 High | Single clinic dominates feed with repetitive CTA events | Signal buried in noise |
| C-2 | 🟡 Medium | No event grouping/deduplication | Poor signal-to-noise ratio |
| C-3 | 🟢 Low | No date range filtering | Limited analysis capability |

---

### 6. Data Health (`/data-health`)

**What Works:**
- Shows overall pipeline status
- Visual progress indicators

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| D-1 | 🔴 High | Crawl Success shows 46% but DB shows only 18% crawled | Misleading metric |
| D-2 | 🟡 Medium | "Recent Pipeline Runs" is empty | No operational visibility |
| D-3 | 🟢 Low | No refresh timestamp visible | Freshness unclear |

---

### 7. AWHL Brands (`/awhl`)

**What Works:**
- ✅ Best designed page in the dashboard
- Clear "vs Market Average" comparisons
- Brand cards with key metrics
- Recent activity feed

**Issues:**

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| A-1 | 🟡 Medium | Recent activity only shows one brand (Natrahea) | Incomplete view |
| A-2 | 🟢 Low | No drill-down to individual brand details | Limited depth |

---

## Priority Matrix

### 🔴 Critical (Fix This Week)

| ID | Page | Issue | Recommended Fix |
|----|------|-------|-----------------|
| O-1 | Offers | Duplicate Winkwax entries | Add `DISTINCT ON` or aggregate in SQL query |
| O-2 | Offers | Price chart not loading | Debug `priceDistribution` query - likely null handling |
| M-1 | Market Map | Static 20% SEO score | Replace with actual page_seo data or remove column |
| C-1 | Change Radar | Repetitive events | Aggregate events by clinic per day |
| D-1 | Data Health | Wrong crawl percentage | Fix calculation to use `page_content` count |
| H-1 | Home | Duplicate threats | Add `DISTINCT` to threats query |

### 🟡 Important (Fix Next Sprint)

| ID | Page | Issue | Recommended Fix |
|----|------|-------|-----------------|
| K-1 | Keywords | Date formatting | Use proper locale formatting |
| K-2 | Keywords | Missing top rank | Join SERP results correctly |
| H-2 | Home | Empty opportunities | Populate with actual data |
| D-2 | Data Health | Empty pipeline runs | Create `workflow_runs` table |
| A-1 | AWHL | Limited activity | Query all AWHL brands |

### 🟢 Nice-to-Have (Backlog)

- Add search bar to Market Map
- Show keyword counts per tier in filter buttons
- Add date range filter to Change Radar
- Add brand detail drill-down to AWHL

---

## Design Recommendations

### 1. Empty State Handling
Currently, empty states show blank areas. Implement:
- Helpful messages explaining why data is missing
- CTAs to trigger data collection workflows

### 2. Data Freshness Indicators
Add visible timestamps showing:
- When data was last refreshed
- Age of oldest data point

### 3. Deduplication Strategy
Apply at query level:
```sql
-- Example for offers
SELECT DISTINCT ON (clinic_id, offer_type, price_value) ...
```

### 4. Error Boundaries
Add React error boundaries to prevent full page crashes when a single component fails.

---

## Technical Debt

| Area | Issue | Effort |
|------|-------|--------|
| Queries | `home.ts` duplicates in threats | 1 hour |
| Queries | `offers.ts` missing DISTINCT | 1 hour |
| Schema | Missing `workflow_runs` table | 2 hours |
| Schema | `page_seo` not connected to scoring | 4 hours |
| UI | Tooltip z-index on all pages | Done ✅ |
| UI | Sorting fixed on Market Map | Done ✅ |

---

## Summary

The dashboard has **strong visual foundations** but suffers from **data quality issues** that undermine executive trust. The most critical fixes involve:

1. **Deduplicating** query results (Offers, Home, Change Radar)
2. **Fixing broken** Price Distribution chart
3. **Correcting** Data Health metrics to match reality
4. **Replacing** placeholder SEO scores with real data

Estimated effort to address Critical issues: **8-12 hours**

---

*Audit conducted via automated browser testing and manual code review*
