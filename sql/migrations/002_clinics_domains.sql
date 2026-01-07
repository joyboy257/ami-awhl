-- T-102: Create clinics and domains
-- Part of Clean v1.0 migration set

-- Clinics: The business entity being analyzed
CREATE TABLE IF NOT EXISTS wellness.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT, -- Can be null initially if unresolved
    vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
    competitor_score NUMERIC DEFAULT 0,
    track_level TEXT DEFAULT 'B' CHECK (track_level IN ('A', 'B', 'C')),
    confidence NUMERIC DEFAULT 1.0,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains: The technical host representing a clinic
CREATE TABLE IF NOT EXISTS wellness.domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES wellness.clinics(id),
    domain TEXT NOT NULL UNIQUE, -- e.g. "example-chiro.sg"
    domain_class TEXT, -- config denylist uses this to filter directories
    discovery_state TEXT DEFAULT 'pending' CHECK (discovery_state IN ('pending', 'in_progress', 'complete')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_clinic_id ON wellness.domains(clinic_id);
