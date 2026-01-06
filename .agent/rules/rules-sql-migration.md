---
trigger: always_on
---

# AMI SQL Migration Rules

## Naming / ordering
- `sql/migrations/001_*.sql`, `002_*.sql`, etc.
- Each migration should be idempotent where possible:
  - `CREATE TABLE IF NOT EXISTS`
  - `ADD COLUMN IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`

## Zero Surprise Alters
Any ALTER that introduces NOT NULL or foreign keys must be staged:
1) add nullable column
2) backfill
3) validate with SQL assertions
4) then enforce NOT NULL / FK (in a later migration)

## Backfill is explicit
Backfills must be in their own migration or clearly labeled section:
- inputs
- expected row counts updated
- verification queries

## Verification scripts
For every migration set, add:
- `tests/sql/assert_schema.sql` (tables/columns exist)
- `tests/sql/assert_uniques.sql` (no duplicates)
- `tests/sql/assert_state_machines.sql` (jobs/sitemaps valid states)
