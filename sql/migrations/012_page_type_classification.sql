-- Migration 012: Add page_type classification column
-- Purpose: Classify pages as content, image, sitemap, or asset for efficient filtering
-- Safe to re-run (idempotent)

-- Add page_type column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'wellness' 
        AND table_name = 'pages' 
        AND column_name = 'page_type'
    ) THEN
        ALTER TABLE wellness.pages ADD COLUMN page_type TEXT;
    END IF;
END $$;

-- Set default for new rows
ALTER TABLE wellness.pages ALTER COLUMN page_type SET DEFAULT 'content';

-- First set all NULL to 'content' as default
UPDATE wellness.pages SET page_type = 'content' WHERE page_type IS NULL;

-- Classify image files
UPDATE wellness.pages 
SET page_type = 'image' 
WHERE page_type = 'content'
  AND (
    url ILIKE '%.jpg' OR url ILIKE '%.jpeg' 
    OR url ILIKE '%.png' OR url ILIKE '%.gif' 
    OR url ILIKE '%.webp' OR url ILIKE '%.svg'
    OR url ILIKE '%.ico' OR url ILIKE '%.bmp'
  );

-- Classify sitemap URLs
UPDATE wellness.pages 
SET page_type = 'sitemap' 
WHERE page_type = 'content'
  AND url ILIKE '%sitemap%';

-- Classify other assets (PDFs, CSS, JS)
UPDATE wellness.pages 
SET page_type = 'asset' 
WHERE page_type = 'content'
  AND (
    url ILIKE '%.pdf' 
    OR url ILIKE '%.css' 
    OR url ILIKE '%.js'
  );

-- Create index for fast filtering by page_type
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON wellness.pages(page_type);

-- Verification query (run manually to confirm)
-- SELECT page_type, count(*) FROM wellness.pages GROUP BY page_type ORDER BY count DESC;
