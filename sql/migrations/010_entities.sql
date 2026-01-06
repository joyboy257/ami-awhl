-- Migration: 010_entities.sql
-- Purpose: Ensure entities tables exist for discovery
-- Source: data_strategy.md §1

CREATE TABLE IF NOT EXISTS wellness.verticals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_id UUID REFERENCES wellness.verticals(id),
    name TEXT NOT NULL,
    competitor_score NUMERIC DEFAULT 0,
    track_level TEXT DEFAULT 'C',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness.clinic_domains (
    clinic_id UUID REFERENCES wellness.clinics(id),
    domain_id UUID REFERENCES wellness.domains(id),
    domain TEXT NOT NULL,
    domain_type TEXT DEFAULT 'primary',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (clinic_id, domain)
);
