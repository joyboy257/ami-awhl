-- T-104: Create Discovery and Inventory tables
-- Part of Clean v1.0 migration set

-- Sitemaps: Tracked for recursive discovery
CREATE TABLE IF NOT EXISTS wellness.sitemaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES wellness.domains(id),
    url TEXT NOT NULL,
    depth INTEGER DEFAULT 1,
    parent_sitemap_id UUID REFERENCES wellness.sitemaps(id),
    last_fetched_at TIMESTAMPTZ,
    last_mod TIMESTAMPTZ,
    error_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, url)
);

-- Pages: URL Inventory per domain
CREATE TABLE IF NOT EXISTS wellness.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES wellness.domains(id),
    url TEXT NOT NULL,
    page_type TEXT, -- service, pricing, contact, etc
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_crawled_at TIMESTAMPTZ,
    last_http_status INTEGER,
    content_hash TEXT, -- SHA256 of cleaned markdown
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, url)
);

CREATE INDEX IF NOT EXISTS idx_pages_domain_id ON wellness.pages(domain_id);
CREATE INDEX IF NOT EXISTS idx_pages_content_hash ON wellness.pages(content_hash);
