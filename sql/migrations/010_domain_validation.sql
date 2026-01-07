-- Migration: Add CHECK constraint to prevent invalid domains
-- Date: 2026-01-07

-- Add constraint to wellness.domains to prevent null, empty, or invalid domain strings
ALTER TABLE wellness.domains ADD CONSTRAINT IF NOT EXISTS domain_not_empty 
  CHECK (domain IS NOT NULL AND domain != '' AND domain != 'null' AND domain != 'undefined' AND length(domain) >= 4);
