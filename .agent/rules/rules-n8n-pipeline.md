---
trigger: always_on
---

# AMI n8n Pipeline Rules

## Standard Worker Shape (Mandatory)
Every worker workflow must follow this wiring pattern:

1) CLAIM job/sitemap row (SKIP LOCKED)
2) THROTTLE (domain atomic update / advisory lock)
3) COMPLIANCE (robots decision)
4) DO WORK (fetch/parse/extract)
5) WRITE RESULTS (DB)
6) UPDATE STATE (done/skipped/error) + store error_json/result_json
7) WORKFLOW_RUNS write (start/end + stats)

No worker should halt because a branch returns 0 items.

## No-output traps
- Always split branches from the parser output (index vs urlset, etc.)
- Use Merge nodes only when both branches are guaranteed to output
- Prefer separate insert branches per output type

## Error Handling
- Avoid relying on Error Trigger for business logic.
- If using “Continue On Fail”, you must branch explicitly on errors and still update DB state.

## Provider Router (W-3)
- HTTP first
- fallback to Firecrawl/Crawl4AI based on deterministic quality gates
- store provider metadata and canonical content for hashing

## Logging / Observability
- Every run writes to `wellness.workflow_runs`
- Every job state change is persisted and queryable
- No “silent failures” allowed
