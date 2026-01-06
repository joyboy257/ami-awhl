---
trigger: always_on
---

# AMI Git & Delivery Workflow Rules

## Branching
- `main` is protected: only merge via PR.
- Feature branches: `feat/<area>-<short-name>` or `chore/<area>-<short-name>`.
- One branch = one deliverable set (e.g., migrations 001–003).

## Commit Discipline
Each PR must include:
- Summary
- Risks
- Test evidence (commands + SQL assertions run)
- Rollback notes (how to revert)

## No “Drive-by” Changes
If a change is not required for the PR’s stated scope:
- do not do it
- instead file it as a follow-up task

## Merge Order
- Schema migrations before workflows that depend on them.
- Core ingestion before scoring.
- Scoring before dashboard.
