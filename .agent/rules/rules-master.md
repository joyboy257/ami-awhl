---
trigger: always_on
---

# AMI Project Rules (Master)

These rules govern ALL work on AMI (AWHL Market Intelligence) executed by AG/LLM agents.

If any instruction conflicts: **this file wins**.

---

## 0) Prime Directive
**Local-first, deterministic, test-gated delivery.**
No “magic”. Every pipeline change must be observable, repeatable, and reversible.

---

## 1) Hard Stop Rules (Non-Negotiable)
AG MUST NOT:
- Modify production data destructively without an explicit backfill plan + SQL checks.
- Invent tables/columns outside of a documented migration.
- Create new workflows/routes/services “because it feels cleaner.”
- Skip idempotency safeguards because “it’s probably fine.”
- Build UI/dashboards before the ingestion pipeline is stable and validated.
- Rely on hidden state in n8n (e.g., implicit node ordering) for correctness.

AG MUST:
- Treat **Postgres as the source of truth**.
- Keep **n8n as an orchestrator**; business logic lives in deterministic nodes/services.
- Capture failures into DB (job state + error_json), not just logs.

---

## 2) Source of Truth Documents
These documents define the system. Changes must be proposed as patches, not silently drifted:
- `ami-master-plan.md`
- `data_strategy.md`
- `pipeline_strategy.md`

If implementation reveals gaps: open a **doc patch proposal** first (tiny diff), then implement.

---

## 3) Idempotency Contract (Global)
Every workflow must be safely re-runnable.
**No duplicates. No silent partials.**

### Required patterns
- Use unique constraints / dedupe keys for inserts.
- Use UPSERT with clear conflict targets.
- Jobs and sitemaps must have crash-safe locking and reclaim logic.
- Every extraction table must be keyed to `extracted_for_hash` (or equivalent).

### Forbidden patterns
- “Insert then clean duplicates later”
- “Best effort, might double write”
- “Assume node output is non-empty” for downstream steps

---

## 4) Evidence-First Data Contract
Any extracted business intelligence (offers/ctas/contacts/locations) must include:
- `evidence_url`
- `evidence_snippet` (short text proof)
- `extracted_for_hash`
- timestamp (`extracted_at`)

No unverifiable “facts”.

---

## 5) Queue Contract (Jobs + Sitemaps)
- Discovery uses `wellness.sitemaps` state machine.
- Crawl/Extract/SERP/Scoring/Ops use `wellness.jobs`.
- Both must support:
  - `locked_at`, `lock_expires_at`, `locked_by`
  - reclaim stale locks
  - `available_at` backoff (real time-based backoff, not priority-only)

---

## 6) Robots & Compliance Contract
- Always store robots snapshots with expiry logic.
- Crawl decision must be computed deterministically and stored with reason.
- If robots disallows: mark skipped/blocked with a reason, don’t retry forever.

---

## 7) Fetch Contract (Provider Router)
W-3 is a **fetch router**:
- HTTP first
- Quality gates
- Fallback to Firecrawl/Crawl4AI selectively
- Standardize hashing across providers:
  `hash_input = markdown if exists else cleaned_html else raw_html`

Store:
- `http_fetches` always
- `page_content` markdown when available
- provider metadata

---

## 8) Keyword Strategy Contract (Upstream SERP Input)
Keyword creation must be deterministic and bounded:
- Seed from `vertical_services` + templates + geo sets
- Expand via SERP signals with provenance
- Hard caps per run
- Tiering + pruning rules documented

No uncontrolled cartesian explosions.

---

## 9) Testing & Acceptance Gates (Required)
No phase is “done” unless it has:
- SQL-level assertions (counts, uniqueness, state transitions)
- rerun test proves idempotency
- failure-mode tests (empty outputs, 404, invalid XML, 429/403)
- sweeper test (stale lock reclaim)

Artifacts must be stored in repo:
- `tests/fixtures/` (sitemaps/html)
- `tests/sql/` (assertions)
- `docs/runbooks/` (how to run locally)

---

## 10) Change Management
All changes must be delivered as small, reviewable increments:
- One migration or one workflow change set at a time
- Explicit “What changed / Why / How tested”
- Git branch per work item; main remains stable

---

## 11) Default Operating Assumptions
- Temperature = 0 for AI extract jobs unless explicitly changed.
- SERP profiles are fixed per run (gl/hl/device/location).
- Rate limiting is domain_id based and atomic.

---

## 12) Definition of Done (Global)
Project is “done” only when:
- Pipelines run locally end-to-end (Discovery → SERP → Crawl → Extract → Normalize → Score)
- Idempotency proven by reruns (no duplicates)
- Observability: workflow_runs + job states show clear outcomes
- Dashboard reads from DB with no hidden logic
