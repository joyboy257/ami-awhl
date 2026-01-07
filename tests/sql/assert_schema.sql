-- T-115: Schema Assertions
-- Verify tables exist and have expected row counts after seeding

DO $$
BEGIN
    -- 1. Verify Tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'verticals') THEN RAISE EXCEPTION 'wellness.verticals missing'; END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'services') THEN RAISE EXCEPTION 'wellness.services missing'; END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'geo_sets') THEN RAISE EXCEPTION 'wellness.geo_sets missing'; END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'search_queries') THEN RAISE EXCEPTION 'wellness.search_queries missing'; END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'jobs') THEN RAISE EXCEPTION 'wellness.jobs missing'; END IF;
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'wellness' AND table_name = 'runs') THEN RAISE EXCEPTION 'wellness.runs missing'; END IF;

    -- 2. Verify Seed Data
    IF (SELECT count(*) FROM wellness.verticals) != 4 THEN RAISE EXCEPTION 'Verticals seed mismatch'; END IF;
    IF (SELECT count(*) FROM wellness.geo_sets) != 5 THEN RAISE EXCEPTION 'Geo Sets seed mismatch'; END IF;
    IF (SELECT count(*) FROM wellness.search_query_templates) < 10 THEN RAISE EXCEPTION 'Templates seed mismatch'; END IF;
    IF (SELECT count(*) FROM wellness.services) < 20 THEN RAISE EXCEPTION 'Services seed mismatch'; END IF;

    RAISE NOTICE 'SUCCESS: Schema and Seed verification passed.';
END $$;
