-- T-105: Create Crawl and Content tables
-- Part of Clean v1.0 migration set

-- Page Fetches: Log of every attempt
CREATE TABLE IF NOT EXISTS wellness.page_fetches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES wellness.pages(id),
    status_code INTEGER,
    fetch_method TEXT, -- http, headless, firecrawl
    fetch_provider TEXT, -- axios, crawl4ai, etc
    bytes_received INTEGER,
    error_message TEXT,
    quality_gate_failed BOOLEAN DEFAULT FALSE,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Content: Cleansed markdown storage
CREATE TABLE IF NOT EXISTS wellness.page_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES wellness.pages(id),
    content_hash TEXT NOT NULL, -- Matched against pages.content_hash
    markdown TEXT NOT NULL,
    word_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_page_fetches_page_id ON wellness.page_fetches(page_id);
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON wellness.page_content(page_id);
