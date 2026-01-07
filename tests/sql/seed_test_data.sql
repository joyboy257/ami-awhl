-- Seed Multi-Domain Test Data
-- Clinic: "Test Clinic Multi"
-- Domains: "localhost:9000" (Primary), "127.0.0.1:9000" (Secondary)
-- Note: Using localhost variants to simulate different domains pointing to same fixture server

INSERT INTO wellness.verticals (name) VALUES ('Test Vertical') ON CONFLICT DO NOTHING;

INSERT INTO wellness.clinics (id, vertical_id, name)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM wellness.verticals WHERE name = 'Test Vertical' LIMIT 1),
    'Test Clinic Multi'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO wellness.domains (id, domain, domain_class)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'localhost:9000', 'competitor'),
    ('33333333-3333-3333-3333-333333333333', '127.0.0.1:9000', 'competitor')
ON CONFLICT (domain) DO UPDATE SET domain_class = EXCLUDED.domain_class;

INSERT INTO wellness.clinic_domains (clinic_id, domain_id, domain, domain_type)
VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'localhost:9000', 'primary'),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '127.0.0.1:9000', 'secondary')
ON CONFLICT (clinic_id, domain) DO NOTHING;

-- Cleanup sitemaps for clean test
DELETE FROM wellness.sitemaps WHERE clinic_id = '11111111-1111-1111-1111-111111111111';
