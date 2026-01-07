-- T-108: Create Ops and Orchestration tables
-- Part of Clean v1.0 migration set

-- Runs: Execution batches
CREATE TABLE IF NOT EXISTS wellness.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode TEXT DEFAULT 'smoke' CHECK (mode IN ('smoke', 'full')),
    budgets JSONB, -- { maxQueries, maxPages, etc }
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    result_summary JSONB, -- counts: { queued, succeeded, failed, skipped }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs: Queue table for workers
CREATE TABLE IF NOT EXISTS wellness.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES wellness.runs(id),
    job_type TEXT NOT NULL, -- serp_snapshot, page_crawl, etc
    payload JSONB NOT NULL,
    dedupe_key TEXT UNIQUE, -- e.g. "type:payload_hash"
    state TEXT DEFAULT 'available' CHECK (state IN ('available', 'locked', 'done', 'failed', 'skipped')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    available_at TIMESTAMPTZ DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    lock_expires_at TIMESTAMPTZ,
    result_json JSONB, -- success metadata or error details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_state_available ON wellness.jobs(state, available_at) WHERE state = 'available';
CREATE INDEX IF NOT EXISTS idx_jobs_run_id ON wellness.jobs(run_id);
