-- T-110: Seed Verticals
-- Scope: TCM, Beauty, Chiropractic, Aesthetics

INSERT INTO wellness.verticals (name, description) VALUES
('TCM', 'Chinese medicine clinics (acupuncture, cupping, tui na)'),
('Beauty', 'Salons, nails, lash/brow, skincare studios'),
('Chiropractic', 'Spine/posture clinics'),
('Aesthetics', 'Medical aesthetics (botox/fillers/laser/facials)')
ON CONFLICT (name) DO NOTHING;
