-- T-301 Prep: Add html_body column to page_content for rich SEO extraction
-- This allows us to re-parse HTML later for comprehensive SEO analysis

ALTER TABLE wellness.page_content 
ADD COLUMN IF NOT EXISTS html_body TEXT;

COMMENT ON COLUMN wellness.page_content.html_body IS 'Full HTML body for later SEO re-extraction';

-- Add index on content_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_content_hash ON wellness.page_content(content_hash);
