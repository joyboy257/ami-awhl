-- T-106: Create Enrichment and Keyword tables
-- Part of Clean v1.0 migration set

-- Page SEO: Structured metadata extraction
CREATE TABLE IF NOT EXISTS wellness.page_seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES wellness.pages(id),
    content_hash TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    h1 TEXT,
    canonical_url TEXT,
    schema_types TEXT[], -- e.g. ['LocalBusiness', 'MedicalClinic']
    internal_links_count INTEGER,
    external_links_count INTEGER,
    og_data JSONB,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, content_hash)
);

-- Page Keywords: Per-page terms
CREATE TABLE IF NOT EXISTS wellness.page_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES wellness.pages(id),
    term TEXT NOT NULL,
    score NUMERIC, 
    extraction_method TEXT, -- cheap, ai
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, term)
);

-- Clinic Keywords: Rolled-up terms per clinic
CREATE TABLE IF NOT EXISTS wellness.clinic_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES wellness.clinics(id),
    term TEXT NOT NULL,
    total_score NUMERIC,
    source_method TEXT, -- rollup
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, term)
);

CREATE INDEX IF NOT EXISTS idx_page_seo_page_id ON wellness.page_seo(page_id);
CREATE INDEX IF NOT EXISTS idx_page_keywords_term ON wellness.page_keywords(term);
CREATE INDEX IF NOT EXISTS idx_clinic_keywords_clinic_id ON wellness.clinic_keywords(clinic_id);
