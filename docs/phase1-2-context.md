# AMI Phase 1-2 Context (For Next Agent Session)

## Project Overview
**AMI (AWHL Market Intelligence)** - Automated competitor intelligence pipeline for wellness verticals in Singapore.

---

## Current State (2026-01-08)

### Database Status
| Table | Count |
|-------|-------|
| verticals | 4 (Chiropractic, TCM, Beauty, Aesthetics) |
| search_queries | ~1,400 |
| serp_snapshots | 365+ |
| serp_results | 730+ |
| domains | 224 (26 complete, 193 pending, 5 in_progress) |
| pages | 478 |

### Workflows Status
| Workflow | Status | Location |
|----------|--------|----------|
| W-1: Build Search Queries | ✅ Working | `n8n/workflows/W-1_Build_Search_Queries.json` |
| W-2: SERP Pipeline | ✅ Working | `n8n/workflows/W-2_SERP_Pipeline.json` |
| W-3: Site Discovery | ✅ Working | `n8n/workflows/W-3_Site_Discovery.json` |

---

## Key Technical Decisions

### n8n Workflow Patterns
1. **No `new URL()` constructor** - Use regex for domain extraction:
   ```javascript
   const match = urlStr.match(/^https?:\/\/(?:www\.)?([^\/:]+)/i);
   ```

2. **Preserve data through Postgres nodes** - Use `RETURNING` clause:
   ```sql
   UPDATE ... RETURNING id, domain, sitemap_url
   ```

3. **Batch loop-back** - Use Aggregate node before looping to Split node to prevent repeated processing

4. **Avoid `$node` references** - Pass data via `$input.item.json` when possible

### API Configuration
- **Serper.dev** for SERP data (replaced SerpAPI)
- API key stored in n8n credential: "Serper Search" node header

### Database Schema
- Schema: `wellness`
- Key tables: `verticals`, `search_queries`, `serp_snapshots`, `serp_results`, `domains`, `pages`
- Constraints: `domain_not_empty` CHECK on domains table

---

## Next Phase: Phase 3 (Crawl & Enrichment)

### Tasks
- T-301: Build W4 (Crawl Router)
- T-302: Build W5A (SEO Extraction)
- T-303: Build W5B (Keyword Extraction)
- T-304: Build W5C (Clinic Keyword Rollup)
- T-305: Build W6 (Commercial Facts)

### Key Files
- `docs/ami-master-plan.md` - Overall architecture
- `docs/pipeline_strategy.md` - Pipeline design patterns
- `docs/data_strategy.md` - Data model
- `docs/task.md` - Task checklist
- `.agent/rules/` - Development rules

### Docker Services
```bash
docker ps  # ami-postgres, ami-n8n, ami-robots-parser
```

---

## Known Issues / Notes
1. **Aesthetics vertical** has 0 queries (needs investigation)
2. **W-3 LIMIT** is 20 per run - increase if needed
3. **Robots microservice** at `http://ami-robots-parser:3000` (Docker network)
