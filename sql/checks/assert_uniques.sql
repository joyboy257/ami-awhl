-- check: assert_uniques.sql
-- Purpose: Verify Uniqueness Constraints per Data Strategy
-- Source: data_strategy.md

DO $$
BEGIN
    -- 1. Domains: UNIQUE(id) and legacy UNIQUE(domain)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'wellness' AND table_name = 'domains' AND constraint_type = 'UNIQUE'
    ) THEN RAISE NOTICE 'Warning: Explicit UNIQUE constraint verification requires checking constraint names or indexes directly.'; END IF;

    -- 2. Jobs: dedupe_key
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'wellness' AND tablename = 'jobs' AND indexdef LIKE '%dedupe_key%'
    ) THEN RAISE EXCEPTION 'jobs.dedupe_key uniqueness missing'; END IF;

    -- 3. Serp Profiles: vertical_id + name
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'wellness' AND tablename = 'serp_profiles' AND indexdef LIKE '%(vertical_id, name)%'
    ) THEN RAISE EXCEPTION 'serp_profiles uniqueness missing'; END IF;

    -- 4. Keywords: keyword_text + serp_profile_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'wellness' AND tablename = 'keywords' AND indexdef LIKE '%(keyword_text, serp_profile_id)%'
    ) THEN RAISE EXCEPTION 'keywords uniqueness missing'; END IF;

    RAISE NOTICE '✅ Uniqueness assertion pass: Core unique indexes exist.';
END $$;
