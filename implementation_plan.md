# AMI Implementation Plan

## 1. Scope & Non-Goals

### In Scope
- SQL migrations 001–009 (schema setup)
- n8n workflows: Discovery, Keyword, SERP, Crawl, Extract, Scoring, Ops
- Postgres queue-based orchestration
- Fetch Router with Crawl4AI/Firecrawl fallback
- Dashboard (Next.js, later phase)

### Non-Goals
- Cloud deployment (local-first only)
- Real-time streaming (batch-oriented)
- Mobile app
- Public API

---

## 2. Repo Structure (Assumed)

```
awhl-market-intel/
├── docs/                    # Strategy docs (existing)
├── sql/migrations/          # 001–009 migration files
├── n8n/workflows/           # Exported workflow JSONs
├── services/                # Microservices (robots-parser)
├── tests/fixtures/          # Test data
└── dashboard/               # Next.js (future)
```

---

## 3. Phases (Dependency Order)

### Phase 1: Infrastructure
**Goals**: Postgres schema ready, n8n connected, robots microservice running.
**Inputs**: Docker, existing Postgres container.
**Outputs**: All tables created, pgcrypto enabled.
**Acceptance**:
- `\dt wellness.*` shows all expected tables.
- `SELECT gen_random_uuid();` works.
**Risks**: Enum conflicts with existing schema. **Mitigation**: Use IF NOT EXISTS.

---

### Phase 2: Discovery (W-1, W-2)
**Goals**: Sitemaps discovered, pages inventory populated.
**Inputs**: Seed clinics with homepage URLs.
**Outputs**: `wellness.sitemaps`, `wellness.pages` populated.
**Acceptance**:
- Re-run twice → no duplicates.
- Stuck sitemaps reclaimed by sweeper.
**Risks**: Gzip sitemaps, recursion depth. **Mitigation**: Explicit depth limit (3).

---

### Phase 3: Keyword Pipeline (W-K1, W-K2, W-K3)
**Goals**: Keywords generated, tiered, pruned.
**Inputs**: `vertical_services`, `geo_sets`, `keyword_templates`.
**Outputs**: `wellness.keywords` with tiers A/B/C.
**Acceptance**:
- Unique by `(keyword_text, serp_profile_id)`.
- Cap 300 per vertical per run.
**Risks**: Keyword explosion. **Mitigation**: geo_set priority + hard cap.

---

### Phase 4: SERP Intelligence (O-SERP, W-6)
**Goals**: SERP snapshots captured, results stored.
**Inputs**: Active keywords with tiers.
**Outputs**: `wellness.serp_snapshots`, `wellness.serp_results`.
**Acceptance**:
- `raw_json` stored for audit.
- `last_snapshot_at` updated on keywords.
**Risks**: SerpAPI rate limits. **Mitigation**: Tiered cadence (A=3x/wk).

---

### Phase 5: Crawl (O-Daily, W-3)
**Goals**: Pages fetched, HTML stored, content hashed.
**Inputs**: Pages needing refresh per `track_level`.
**Outputs**: `wellness.http_fetches`, `wellness.page_html`, `wellness.page_content`.
**Acceptance**:
- Canonical hashing: `sha256(markdown ?? cleaned_html ?? raw_html)`.
- Same content → same hash regardless of provider.
**Risks**: 403/429 blocks. **Mitigation**: Fetch Router fallback chain.

---

### Phase 6: Extraction (W-4, W-5)
**Goals**: Metadata + AI-extracted offers/CTAs stored.
**Inputs**: Pages with changed `content_hash`.
**Outputs**: `wellness.page_metadata`, `wellness.clinic_offers`, `wellness.clinic_ctas`.
**Acceptance**:
- Only enqueue if hash changed.
- AI jobs gated by `prompt_version`.
**Risks**: LLM hallucinations. **Mitigation**: temperature=0, strict JSON schema.

---

### Phase 7: Scoring (O-Score)
**Goals**: Competitor scores computed, track_level assigned.
**Inputs**: SERP results, page counts, offers.
**Outputs**: `clinics.competitor_score`, `clinics.track_level`.
**Acceptance**:
- Scoring excludes `domain_class != 'clinic'`.
- Track_level updates weekly.
**Risks**: Directory pollution. **Mitigation**: Clinic-only filter.

---

### Phase 8: Ops (O-Sweeper, O-Robots, O-Classify)
**Goals**: Stuck jobs reclaimed, robots refreshed, domains classified.
**Inputs**: Jobs/sitemaps with expired locks, stale robots.
**Outputs**: Clean queue state, fresh robots snapshots.
**Acceptance**:
- No jobs stuck >15 min.
- Robots snapshots <24h old.
**Risks**: Over-aggressive sweeper. **Mitigation**: 10 min schedule.

---

### Phase 9: Dashboard
**Goals**: Next.js UI for querying intelligence.
**Inputs**: All normalized tables.
**Outputs**: Vertical view, competitor tracking, offer comparison.
**Acceptance**:
- Can answer all 12 example user queries from master plan.
**Risks**: Scope creep. **Mitigation**: MVP first (tables + filters).

---

## 4. Definition of Done (Entire Project)

- [ ] All 009 migrations applied successfully.
- [ ] All workflows (W-1→W-7, W-K1→K3, O-*) tested with fixtures.
- [ ] Idempotency proven: re-run produces no duplicates.
- [ ] Crash recovery proven: kill mid-job → sweeper reclaims.
- [ ] Dashboard answers all 12 example queries.
- [ ] Documentation updated with runbooks.
