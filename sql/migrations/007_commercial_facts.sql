-- T-107: Create Commercial Facts tables
-- Part of Clean v1.0 migration set

-- Clinic Offers: Pricing and promos
CREATE TABLE IF NOT EXISTS wellness.clinic_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES wellness.clinics(id),
    service_name TEXT NOT NULL,
    offer_type TEXT NOT NULL, -- trial, package, promo, etc
    price_currency TEXT DEFAULT 'SGD',
    price_value NUMERIC,
    evidence_url TEXT NOT NULL,
    evidence_snippet TEXT NOT NULL,
    extracted_for_hash TEXT NOT NULL, -- content_hash of the source page
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, service_name, offer_type, extracted_for_hash)
);

-- Clinic CTAs: Conversion paths
CREATE TABLE IF NOT EXISTS wellness.clinic_ctas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES wellness.clinics(id),
    page_id UUID NOT NULL REFERENCES wellness.pages(id),
    cta_text TEXT NOT NULL,
    cta_type TEXT, -- WhatsApp, Booking Link, etc
    evidence_snippet TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, cta_text, cta_type)
);

CREATE INDEX IF NOT EXISTS idx_clinic_offers_clinic_id ON wellness.clinic_offers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_ctas_clinic_id ON wellness.clinic_ctas(clinic_id);
