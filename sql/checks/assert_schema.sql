-- check: assert_schema.sql
-- Purpose: Verify all Phase 1 tables and essential columns exist
-- Run with: psql ... -f assert_schema.sql

DO $$
DECLARE
    missing_tables TEXT[];
    missing_columns TEXT[];
BEGIN
    -- 1. Check Tables
    SELECT ARRAY_AGG(t) INTO missing_tables
    FROM unnest(ARRAY[
        'jobs', 'domains', 'pages', 'sitemaps', 
        'vertical_services', 'serp_profiles', 'keywords', 'geo_sets', 'keyword_templates',
        'serp_snapshots', 'serp_results', 'http_fetches', 'page_html', 'page_content'
    ]) AS t
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'wellness' AND table_name = t
    );

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', missing_tables;
    END IF;

    -- 2. Check Key Columns (Adaptive verification)
    SELECT ARRAY_AGG(c) INTO missing_columns
    FROM unnest(ARRAY[
        'wellness.domains.id', 
        'wellness.domains.domain_class',
        'wellness.pages.domain_id',
        'wellness.sitemaps.locked_at',
        'wellness.jobs.dedupe_key'
    ]) AS c
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = split_part(c, '.', 1) 
          AND table_name = split_part(c, '.', 2) 
          AND column_name = split_part(c, '.', 3)
    );

    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns: %', missing_columns;
    END IF;

    RAISE NOTICE '✅ Schema assertion pass: All Phase 1 tables and columns present.';
END $$;
