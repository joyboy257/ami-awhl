-- T-113: Seed Search Query Templates
-- Patterns like "best {service} in {geo}"

INSERT INTO wellness.search_query_templates (template, intent_tag) VALUES
('best {service} in {geo}', 'commercial'),
('{service} near {geo}', 'navigational'),
('{service} singapore', 'navigational'),
('{service} price singapore', 'price'),
('{service} trial price', 'trial'),
('{service} promo', 'promo'),
('{service} package deals', 'package'),
('{service} review {geo}', 'review'),
('recommended {service} {geo}', 'commercial'),
('{service} clinic {geo}', 'navigational')
ON CONFLICT (template) DO NOTHING;
