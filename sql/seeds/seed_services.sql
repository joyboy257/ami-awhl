-- T-111: Seed Services
-- 10-20 services per vertical

-- TCM
INSERT INTO wellness.services (vertical_id, service_name, synonyms)
SELECT id, 'Acupuncture', '{"Chinese acupuncture", "Needling"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Cupping', '{"Hijama", "Fire cupping"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Tui Na', '{"Chinese massage", "Medical massage"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Gua Sha', '{"Scraping"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Moxibustion', '{"Moxa"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Herbal Medicine', '{"Chinese herbs"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Fertility Acupuncture', '{"IVF support"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
UNION ALL SELECT id, 'Sports Injury TCM', '{"Pain management"}'::text[] FROM wellness.verticals WHERE name = 'TCM'
ON CONFLICT (vertical_id, service_name) DO NOTHING;

-- Beauty
INSERT INTO wellness.services (vertical_id, service_name, synonyms)
SELECT id, 'Facial', '{"Skincare treatment", "Face cleaning"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Manicure', '{"Nail care"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Pedicure', '{"Toe care"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Eyelash Extension', '{"Lash lift", "Lashes"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Eyebrow Embroidery', '{"Microblading"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Waxing', '{"Hair removal"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
UNION ALL SELECT id, 'Body Scrub', '{"Exfoliation"}'::text[] FROM wellness.verticals WHERE name = 'Beauty'
ON CONFLICT (vertical_id, service_name) DO NOTHING;

-- Chiropractic
INSERT INTO wellness.services (vertical_id, service_name, synonyms)
SELECT id, 'Spinal Adjustment', '{"Chiro adjustment"}'::text[] FROM wellness.verticals WHERE name = 'Chiropractic'
UNION ALL SELECT id, 'Posture Correction', '{"Scoliosis treatment"}'::text[] FROM wellness.verticals WHERE name = 'Chiropractic'
UNION ALL SELECT id, 'Pediatric Chiropractic', '{"Kids chiro"}'::text[] FROM wellness.verticals WHERE name = 'Chiropractic'
UNION ALL SELECT id, 'Sports Chiropractic', '{"Athlete care"}'::text[] FROM wellness.verticals WHERE name = 'Chiropractic'
UNION ALL SELECT id, 'Slip Disc Treatment', '{"Herniated disc care"}'::text[] FROM wellness.verticals WHERE name = 'Chiropractic'
ON CONFLICT (vertical_id, service_name) DO NOTHING;

-- Aesthetics
INSERT INTO wellness.services (vertical_id, service_name, synonyms)
SELECT id, 'Botox', '{"Botulinum toxin"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'Dermal Fillers', '{"Hyaluronic acid"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'Laser Hair Removal', '{"IPL", "Diodelaser"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'HIFU', '{"Focused ultrasound", "Skin tightening"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'Hydrafacial', '{"Deep cleansing"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'Pico Laser', '{"Pigmentation removal"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
UNION ALL SELECT id, 'Fat Freeze', '{"Cryolipolysis", "Coolsculpting"}'::text[] FROM wellness.verticals WHERE name = 'Aesthetics'
ON CONFLICT (vertical_id, service_name) DO NOTHING;
