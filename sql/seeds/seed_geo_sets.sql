-- T-112: Seed Geo Sets
-- Singapore Regions

INSERT INTO wellness.geo_sets (name, modifiers, priority_order) VALUES
('Central', '{"CBD", "Orchard", "Tanjong Pagar", "central singapore"}', 1),
('East', '{"Tampines", "Bedok", "Paya Lebar", "east singapore"}', 0),
('West', '{"Jurong", "Clementi", "Boon Lay", "west singapore"}', 0),
('North', '{"Woodlands", "Yishun", "Ang Mo Kio", "north singapore"}', 0),
('Near me', '{"near me", "nearby", "around me"}', 2)
ON CONFLICT (name) DO NOTHING;
