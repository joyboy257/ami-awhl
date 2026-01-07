-- T-101: Create core entities (verticals, services, geo_sets, templates)
-- Part of Clean v1.0 migration set

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS wellness;

-- Verticals: Market classification
CREATE TABLE IF NOT EXISTS wellness.verticals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geo Sets: SG Areas/Regions
CREATE TABLE IF NOT EXISTS wellness.geo_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    modifiers TEXT[] NOT NULL, -- e.g. ['Central', 'Tampines', 'Near me']
    priority_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services: Vertical-specific taxonomy
CREATE TABLE IF NOT EXISTS wellness.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID NOT NULL REFERENCES wellness.verticals(id),
    service_name TEXT NOT NULL,
    synonyms TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vertical_id, service_name)
);

-- Search Query Templates: Patterns for W1
CREATE TABLE IF NOT EXISTS wellness.search_query_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template TEXT NOT NULL UNIQUE, -- e.g. "best {service} in {geo}"
    intent_tag TEXT, -- price, trial, etc
    created_at TIMESTAMPTZ DEFAULT NOW()
);
