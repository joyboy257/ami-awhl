--
-- PostgreSQL database dump
--

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 14.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: wellness; Type: SCHEMA; Schema: -; Owner: deon
--

CREATE SCHEMA wellness;


ALTER SCHEMA wellness OWNER TO deon;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clinic_ctas; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.clinic_ctas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    page_id uuid NOT NULL,
    cta_text text NOT NULL,
    cta_type text,
    evidence_snippet text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.clinic_ctas OWNER TO deon;

--
-- Name: clinic_keywords; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.clinic_keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    term text NOT NULL,
    total_score numeric,
    source_method text,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.clinic_keywords OWNER TO deon;

--
-- Name: clinic_offers; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.clinic_offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    service_name text NOT NULL,
    offer_type text NOT NULL,
    price_currency text DEFAULT 'SGD'::text,
    price_value numeric,
    evidence_url text NOT NULL,
    evidence_snippet text NOT NULL,
    extracted_for_hash text NOT NULL,
    extracted_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.clinic_offers OWNER TO deon;

--
-- Name: clinics; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.clinics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    vertical_id uuid NOT NULL,
    competitor_score numeric DEFAULT 0,
    track_level text DEFAULT 'B'::text,
    confidence numeric DEFAULT 1.0,
    first_seen_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT clinics_track_level_check CHECK ((track_level = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))
);


ALTER TABLE wellness.clinics OWNER TO deon;

--
-- Name: domains; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.domains (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    domain text NOT NULL,
    domain_class text,
    discovery_state text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT domains_discovery_state_check CHECK ((discovery_state = ANY (ARRAY['pending'::text, 'in_progress'::text, 'complete'::text])))
);


ALTER TABLE wellness.domains OWNER TO deon;

--
-- Name: geo_sets; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.geo_sets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    modifiers text[] NOT NULL,
    priority_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.geo_sets OWNER TO deon;

--
-- Name: jobs; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    run_id uuid,
    job_type text NOT NULL,
    payload jsonb NOT NULL,
    dedupe_key text,
    state text DEFAULT 'available'::text,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    available_at timestamp with time zone DEFAULT now(),
    locked_at timestamp with time zone,
    locked_by text,
    lock_expires_at timestamp with time zone,
    result_json jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT jobs_state_check CHECK ((state = ANY (ARRAY['available'::text, 'locked'::text, 'done'::text, 'failed'::text, 'skipped'::text])))
);


ALTER TABLE wellness.jobs OWNER TO deon;

--
-- Name: page_content; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.page_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    content_hash text NOT NULL,
    markdown text NOT NULL,
    word_count integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.page_content OWNER TO deon;

--
-- Name: page_fetches; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.page_fetches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    status_code integer,
    fetch_method text,
    fetch_provider text,
    bytes_received integer,
    error_message text,
    quality_gate_failed boolean DEFAULT false,
    fetched_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.page_fetches OWNER TO deon;

--
-- Name: page_keywords; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.page_keywords (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    term text NOT NULL,
    score numeric,
    extraction_method text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.page_keywords OWNER TO deon;

--
-- Name: page_seo; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.page_seo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    content_hash text NOT NULL,
    title text,
    meta_description text,
    h1 text,
    canonical_url text,
    schema_types text[],
    internal_links_count integer,
    external_links_count integer,
    og_data jsonb,
    extracted_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.page_seo OWNER TO deon;

--
-- Name: pages; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_id uuid NOT NULL,
    url text NOT NULL,
    page_type text,
    last_seen_at timestamp with time zone DEFAULT now(),
    last_crawled_at timestamp with time zone,
    last_http_status integer,
    content_hash text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.pages OWNER TO deon;

--
-- Name: runs; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mode text DEFAULT 'smoke'::text,
    budgets jsonb,
    status text DEFAULT 'pending'::text,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    result_summary jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT runs_mode_check CHECK ((mode = ANY (ARRAY['smoke'::text, 'full'::text]))),
    CONSTRAINT runs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])))
);


ALTER TABLE wellness.runs OWNER TO deon;

--
-- Name: search_queries; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.search_queries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vertical_id uuid NOT NULL,
    query_text text NOT NULL,
    geo text,
    intent_tag text,
    priority_tier text DEFAULT 'B'::text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT search_queries_priority_tier_check CHECK ((priority_tier = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))
);


ALTER TABLE wellness.search_queries OWNER TO deon;

--
-- Name: search_query_templates; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.search_query_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template text NOT NULL,
    intent_tag text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.search_query_templates OWNER TO deon;

--
-- Name: serp_results; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.serp_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    snapshot_id uuid NOT NULL,
    rank_position integer NOT NULL,
    block_type text NOT NULL,
    title text,
    url text,
    domain_id uuid,
    snippet text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT serp_results_block_type_check CHECK ((block_type = ANY (ARRAY['organic'::text, 'local_pack'::text, 'ad'::text, 'other'::text])))
);


ALTER TABLE wellness.serp_results OWNER TO deon;

--
-- Name: serp_snapshots; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.serp_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    query_id uuid NOT NULL,
    raw_json jsonb NOT NULL,
    raw_hash text NOT NULL,
    captured_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.serp_snapshots OWNER TO deon;

--
-- Name: services; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vertical_id uuid NOT NULL,
    service_name text NOT NULL,
    synonyms text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.services OWNER TO deon;

--
-- Name: sitemaps; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.sitemaps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_id uuid NOT NULL,
    url text NOT NULL,
    depth integer DEFAULT 1,
    parent_sitemap_id uuid,
    last_fetched_at timestamp with time zone,
    last_mod timestamp with time zone,
    error_json jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.sitemaps OWNER TO deon;

--
-- Name: verticals; Type: TABLE; Schema: wellness; Owner: deon
--

CREATE TABLE wellness.verticals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE wellness.verticals OWNER TO deon;

--
-- Name: clinic_ctas clinic_ctas_page_id_cta_text_cta_type_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_ctas
    ADD CONSTRAINT clinic_ctas_page_id_cta_text_cta_type_key UNIQUE (page_id, cta_text, cta_type);


--
-- Name: clinic_ctas clinic_ctas_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_ctas
    ADD CONSTRAINT clinic_ctas_pkey PRIMARY KEY (id);


--
-- Name: clinic_keywords clinic_keywords_clinic_id_term_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_keywords
    ADD CONSTRAINT clinic_keywords_clinic_id_term_key UNIQUE (clinic_id, term);


--
-- Name: clinic_keywords clinic_keywords_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_keywords
    ADD CONSTRAINT clinic_keywords_pkey PRIMARY KEY (id);


--
-- Name: clinic_offers clinic_offers_clinic_id_service_name_offer_type_extracted_f_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_offers
    ADD CONSTRAINT clinic_offers_clinic_id_service_name_offer_type_extracted_f_key UNIQUE (clinic_id, service_name, offer_type, extracted_for_hash);


--
-- Name: clinic_offers clinic_offers_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_offers
    ADD CONSTRAINT clinic_offers_pkey PRIMARY KEY (id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: domains domains_domain_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.domains
    ADD CONSTRAINT domains_domain_key UNIQUE (domain);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: geo_sets geo_sets_name_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.geo_sets
    ADD CONSTRAINT geo_sets_name_key UNIQUE (name);


--
-- Name: geo_sets geo_sets_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.geo_sets
    ADD CONSTRAINT geo_sets_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_dedupe_key_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.jobs
    ADD CONSTRAINT jobs_dedupe_key_key UNIQUE (dedupe_key);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: page_content page_content_page_id_content_hash_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_content
    ADD CONSTRAINT page_content_page_id_content_hash_key UNIQUE (page_id, content_hash);


--
-- Name: page_content page_content_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_content
    ADD CONSTRAINT page_content_pkey PRIMARY KEY (id);


--
-- Name: page_fetches page_fetches_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_fetches
    ADD CONSTRAINT page_fetches_pkey PRIMARY KEY (id);


--
-- Name: page_keywords page_keywords_page_id_term_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_keywords
    ADD CONSTRAINT page_keywords_page_id_term_key UNIQUE (page_id, term);


--
-- Name: page_keywords page_keywords_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_keywords
    ADD CONSTRAINT page_keywords_pkey PRIMARY KEY (id);


--
-- Name: page_seo page_seo_page_id_content_hash_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_seo
    ADD CONSTRAINT page_seo_page_id_content_hash_key UNIQUE (page_id, content_hash);


--
-- Name: page_seo page_seo_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_seo
    ADD CONSTRAINT page_seo_pkey PRIMARY KEY (id);


--
-- Name: pages pages_domain_id_url_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.pages
    ADD CONSTRAINT pages_domain_id_url_key UNIQUE (domain_id, url);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: runs runs_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.runs
    ADD CONSTRAINT runs_pkey PRIMARY KEY (id);


--
-- Name: search_queries search_queries_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.search_queries
    ADD CONSTRAINT search_queries_pkey PRIMARY KEY (id);


--
-- Name: search_queries search_queries_vertical_id_query_text_geo_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.search_queries
    ADD CONSTRAINT search_queries_vertical_id_query_text_geo_key UNIQUE (vertical_id, query_text, geo);


--
-- Name: search_query_templates search_query_templates_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.search_query_templates
    ADD CONSTRAINT search_query_templates_pkey PRIMARY KEY (id);


--
-- Name: search_query_templates search_query_templates_template_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.search_query_templates
    ADD CONSTRAINT search_query_templates_template_key UNIQUE (template);


--
-- Name: serp_results serp_results_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_results
    ADD CONSTRAINT serp_results_pkey PRIMARY KEY (id);


--
-- Name: serp_results serp_results_snapshot_id_rank_position_block_type_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_results
    ADD CONSTRAINT serp_results_snapshot_id_rank_position_block_type_key UNIQUE (snapshot_id, rank_position, block_type);


--
-- Name: serp_snapshots serp_snapshots_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_snapshots
    ADD CONSTRAINT serp_snapshots_pkey PRIMARY KEY (id);


--
-- Name: serp_snapshots serp_snapshots_query_id_captured_at_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_snapshots
    ADD CONSTRAINT serp_snapshots_query_id_captured_at_key UNIQUE (query_id, captured_at);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_vertical_id_service_name_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.services
    ADD CONSTRAINT services_vertical_id_service_name_key UNIQUE (vertical_id, service_name);


--
-- Name: sitemaps sitemaps_domain_id_url_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.sitemaps
    ADD CONSTRAINT sitemaps_domain_id_url_key UNIQUE (domain_id, url);


--
-- Name: sitemaps sitemaps_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.sitemaps
    ADD CONSTRAINT sitemaps_pkey PRIMARY KEY (id);


--
-- Name: verticals verticals_name_key; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.verticals
    ADD CONSTRAINT verticals_name_key UNIQUE (name);


--
-- Name: verticals verticals_pkey; Type: CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.verticals
    ADD CONSTRAINT verticals_pkey PRIMARY KEY (id);


--
-- Name: idx_clinic_ctas_clinic_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_clinic_ctas_clinic_id ON wellness.clinic_ctas USING btree (clinic_id);


--
-- Name: idx_clinic_keywords_clinic_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_clinic_keywords_clinic_id ON wellness.clinic_keywords USING btree (clinic_id);


--
-- Name: idx_clinic_offers_clinic_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_clinic_offers_clinic_id ON wellness.clinic_offers USING btree (clinic_id);


--
-- Name: idx_domains_clinic_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_domains_clinic_id ON wellness.domains USING btree (clinic_id);


--
-- Name: idx_jobs_run_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_jobs_run_id ON wellness.jobs USING btree (run_id);


--
-- Name: idx_jobs_state_available; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_jobs_state_available ON wellness.jobs USING btree (state, available_at) WHERE (state = 'available'::text);


--
-- Name: idx_page_content_page_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_page_content_page_id ON wellness.page_content USING btree (page_id);


--
-- Name: idx_page_fetches_page_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_page_fetches_page_id ON wellness.page_fetches USING btree (page_id);


--
-- Name: idx_page_keywords_term; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_page_keywords_term ON wellness.page_keywords USING btree (term);


--
-- Name: idx_page_seo_page_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_page_seo_page_id ON wellness.page_seo USING btree (page_id);


--
-- Name: idx_pages_content_hash; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_pages_content_hash ON wellness.pages USING btree (content_hash);


--
-- Name: idx_pages_domain_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_pages_domain_id ON wellness.pages USING btree (domain_id);


--
-- Name: idx_serp_results_domain_id; Type: INDEX; Schema: wellness; Owner: deon
--

CREATE INDEX idx_serp_results_domain_id ON wellness.serp_results USING btree (domain_id);


--
-- Name: clinic_ctas clinic_ctas_clinic_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_ctas
    ADD CONSTRAINT clinic_ctas_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES wellness.clinics(id);


--
-- Name: clinic_ctas clinic_ctas_page_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_ctas
    ADD CONSTRAINT clinic_ctas_page_id_fkey FOREIGN KEY (page_id) REFERENCES wellness.pages(id);


--
-- Name: clinic_keywords clinic_keywords_clinic_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_keywords
    ADD CONSTRAINT clinic_keywords_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES wellness.clinics(id);


--
-- Name: clinic_offers clinic_offers_clinic_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinic_offers
    ADD CONSTRAINT clinic_offers_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES wellness.clinics(id);


--
-- Name: clinics clinics_vertical_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.clinics
    ADD CONSTRAINT clinics_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES wellness.verticals(id);


--
-- Name: domains domains_clinic_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.domains
    ADD CONSTRAINT domains_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES wellness.clinics(id);


--
-- Name: jobs jobs_run_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.jobs
    ADD CONSTRAINT jobs_run_id_fkey FOREIGN KEY (run_id) REFERENCES wellness.runs(id);


--
-- Name: page_content page_content_page_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_content
    ADD CONSTRAINT page_content_page_id_fkey FOREIGN KEY (page_id) REFERENCES wellness.pages(id);


--
-- Name: page_fetches page_fetches_page_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_fetches
    ADD CONSTRAINT page_fetches_page_id_fkey FOREIGN KEY (page_id) REFERENCES wellness.pages(id);


--
-- Name: page_keywords page_keywords_page_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_keywords
    ADD CONSTRAINT page_keywords_page_id_fkey FOREIGN KEY (page_id) REFERENCES wellness.pages(id);


--
-- Name: page_seo page_seo_page_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.page_seo
    ADD CONSTRAINT page_seo_page_id_fkey FOREIGN KEY (page_id) REFERENCES wellness.pages(id);


--
-- Name: pages pages_domain_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.pages
    ADD CONSTRAINT pages_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES wellness.domains(id);


--
-- Name: search_queries search_queries_vertical_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.search_queries
    ADD CONSTRAINT search_queries_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES wellness.verticals(id);


--
-- Name: serp_results serp_results_domain_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_results
    ADD CONSTRAINT serp_results_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES wellness.domains(id);


--
-- Name: serp_results serp_results_snapshot_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_results
    ADD CONSTRAINT serp_results_snapshot_id_fkey FOREIGN KEY (snapshot_id) REFERENCES wellness.serp_snapshots(id);


--
-- Name: serp_snapshots serp_snapshots_query_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.serp_snapshots
    ADD CONSTRAINT serp_snapshots_query_id_fkey FOREIGN KEY (query_id) REFERENCES wellness.search_queries(id);


--
-- Name: services services_vertical_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.services
    ADD CONSTRAINT services_vertical_id_fkey FOREIGN KEY (vertical_id) REFERENCES wellness.verticals(id);


--
-- Name: sitemaps sitemaps_domain_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.sitemaps
    ADD CONSTRAINT sitemaps_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES wellness.domains(id);


--
-- Name: sitemaps sitemaps_parent_sitemap_id_fkey; Type: FK CONSTRAINT; Schema: wellness; Owner: deon
--

ALTER TABLE ONLY wellness.sitemaps
    ADD CONSTRAINT sitemaps_parent_sitemap_id_fkey FOREIGN KEY (parent_sitemap_id) REFERENCES wellness.sitemaps(id);


--
-- PostgreSQL database dump complete
--

