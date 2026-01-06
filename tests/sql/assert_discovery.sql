-- check: assert_discovery.sql
-- Purpose: Validate sitemap discovery and expansion results

DO $$
DECLARE
    sitemap_count INT;
    duplicate_count INT;
    depth_check INT;
BEGIN
    -- 1. Check if sitemaps were discovered
    SELECT COUNT(*) INTO sitemap_count FROM wellness.sitemaps;
    IF sitemap_count = 0 THEN
        RAISE EXCEPTION 'Discovery failed: No sitemaps found in wellness.sitemaps';
    END IF;

    -- 2. Check for duplicates in sitemaps (clinic_id, url)
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT clinic_id, url FROM wellness.sitemaps 
        GROUP BY clinic_id, url HAVING COUNT(*) > 1
    ) sub;
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Deduplication failed: % duplicate sitemaps found', duplicate_count;
    END IF;

    -- 3. Check for duplicates in pages (clinic_id, url)
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT clinic_id, url FROM wellness.pages 
        GROUP BY clinic_id, url HAVING COUNT(*) > 1
    ) sub;
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Deduplication failed: % duplicate pages found', duplicate_count;
    END IF;

    -- 4. Check Depth Constraint (Phase 2 requirement: no depth > 3)
    SELECT COUNT(*) INTO depth_check FROM wellness.sitemaps WHERE depth > 3;
    IF depth_check > 0 THEN
        RAISE EXCEPTION 'Depth contract violation: % sitemaps found with depth > 3', depth_check;
    END IF;

    RAISE NOTICE '✅ Discovery assertion pass: Sitemaps and pages are valid, unique, and depth-compliant.';
END $$;
