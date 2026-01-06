-- check: assert_queue_contract.sql
-- Purpose: Verify Job Queue and Sitemaps state machines contract
-- Source: rules-master.md §5

DO $$
BEGIN
    -- 1. Check Jobs Queue Contract
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'wellness' AND table_name = 'jobs' AND column_name = 'locked_at'
    ) THEN RAISE EXCEPTION 'jobs.locked_at missing'; END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'wellness' AND table_name = 'jobs' AND column_name = 'available_at'
    ) THEN RAISE EXCEPTION 'jobs.available_at missing'; END IF;

    -- 2. Check Sitemaps Locking Contract
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'wellness' AND table_name = 'sitemaps' AND column_name = 'locked_at'
    ) THEN RAISE EXCEPTION 'sitemaps.locked_at missing'; END IF;

    RAISE NOTICE '✅ Queue Contract assertion pass: Jobs and Sitemaps have locking primitives.';
END $$;
