-- ==============================================================================
-- TEJAS GRID - Migration 03: 20-District Expansion & Anchor Campus Microgrid Seed
-- Populates 20 target Rajasthan districts and representative higher education campuses
-- ==============================================================================

-- 1. SEED 20 RAJASTHAN DISTRICTS
INSERT INTO districts (name, code) VALUES
    ('Jaipur', 'JPR'),
    ('Jodhpur', 'JDH'),
    ('Kota', 'KOTA'),
    ('Udaipur', 'UDZ'),
    ('Ajmer', 'AJM'),
    ('Bikaner', 'BKN'),
    ('Alwar', 'ALW'),
    ('Sikar', 'SIKR'),
    ('Bharatpur', 'BHR'),
    ('Banswara', 'BWA'),
    ('Bhilwara', 'BHL'),
    ('Churu', 'CUR'),
    ('Jhalawar', 'JHW'),
    ('Sri Ganganagar', 'SGNR'),
    ('Chittorgarh', 'COR'),
    ('Jhunjhunu', 'JJN'),
    ('Pali', 'PALI'),
    ('Nagaur', 'NGO'),
    ('Hanumangarh', 'HMH'),
    ('Barmer', 'BME')
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- 2. SEED OR UPDATE 20 ANCHOR CAMPUSES

-- Campus 1: Jaipur (MNIT / UNIRAJ Campus)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'MNIT / UNIRAJ Campus', id, 26.9124, 75.7873, 500.0, 350.0, 50.0, 200.0
FROM districts WHERE code = 'JPR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'MNIT / UNIRAJ Campus');

-- Campus 2: Jodhpur (IIT Jodhpur / JNVU Campus)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'IIT Jodhpur / JNVU Campus', id, 26.2389, 73.0243, 600.0, 450.0, 100.0, 300.0
FROM districts WHERE code = 'JDH'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'IIT Jodhpur / JNVU Campus');

-- Campus 3: Kota (RTU / Govt Poly College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'RTU / Govt Poly College', id, 25.2138, 75.8648, 400.0, 250.0, 30.0, 150.0
FROM districts WHERE code = 'KOTA'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'RTU / Govt Poly College');

-- Campus 4: Udaipur (MLSU / CTAE MPUAT Campus)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'MLSU / CTAE MPUAT Campus', id, 24.5854, 73.7125, 450.0, 300.0, 40.0, 180.0
FROM districts WHERE code = 'UDZ'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'MLSU / CTAE MPUAT Campus');

-- Campus 5: Ajmer (Govt Engineering College Ajmer)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt Engineering College Ajmer', id, 26.4499, 74.6399, 350.0, 220.0, 30.0, 120.0
FROM districts WHERE code = 'AJM'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt Engineering College Ajmer');

-- Campus 6: Bikaner (BTU / Govt Engg College Bikaner)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'BTU / Govt Engg College Bikaner', id, 28.0229, 73.3119, 400.0, 320.0, 80.0, 200.0
FROM districts WHERE code = 'BKN'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'BTU / Govt Engg College Bikaner');

-- Campus 7: Alwar (RRBMU / Govt Arts College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'RRBMU / Govt Arts College', id, 27.5530, 76.6346, 300.0, 180.0, 20.0, 100.0
FROM districts WHERE code = 'ALW'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'RRBMU / Govt Arts College');

-- Campus 8: Sikar (Pandit Deendayal Upadhyaya Shekhawati Univ)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Pandit Deendayal Upadhyaya Shekhawati Univ', id, 27.6094, 75.1398, 280.0, 160.0, 25.0, 90.0
FROM districts WHERE code = 'SIKR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Pandit Deendayal Upadhyaya Shekhawati Univ');

-- Campus 9: Bharatpur (Maharaja Surajmal Brij Univ)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Maharaja Surajmal Brij Univ', id, 27.2152, 77.5030, 250.0, 150.0, 15.0, 80.0
FROM districts WHERE code = 'BHR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Maharaja Surajmal Brij Univ');

-- Campus 10: Banswara (Govind Guru Tribal Univ (GGTU))
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govind Guru Tribal Univ (GGTU)', id, 23.5461, 74.4349, 220.0, 140.0, 20.0, 70.0
FROM districts WHERE code = 'BWA'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govind Guru Tribal Univ (GGTU)');

-- Campus 11: Bhilwara (MLV Textile & Engineering College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'MLV Textile & Engineering College', id, 25.3407, 74.6313, 380.0, 260.0, 40.0, 150.0
FROM districts WHERE code = 'BHL'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'MLV Textile & Engineering College');

-- Campus 12: Churu (Government Lohia College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Government Lohia College', id, 28.2900, 74.9600, 260.0, 180.0, 35.0, 100.0
FROM districts WHERE code = 'CUR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Government Lohia College');

-- Campus 13: Jhalawar (Govt PG College / Medical Campus)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt PG College / Medical Campus', id, 24.5973, 76.1610, 240.0, 150.0, 20.0, 80.0
FROM districts WHERE code = 'JHW'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt PG College / Medical Campus');

-- Campus 14: Sri Ganganagar (Govt National College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt National College', id, 29.9038, 73.8772, 250.0, 170.0, 30.0, 90.0
FROM districts WHERE code = 'SGNR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt National College');

-- Campus 15: Chittorgarh (Govt PG College Chittorgarh)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt PG College Chittorgarh', id, 24.8887, 74.6269, 230.0, 140.0, 20.0, 70.0
FROM districts WHERE code = 'COR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt PG College Chittorgarh');

-- Campus 16: Jhunjhunu (Seth Motilal Govt College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Seth Motilal Govt College', id, 28.1289, 75.3995, 220.0, 130.0, 25.0, 70.0
FROM districts WHERE code = 'JJN'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Seth Motilal Govt College');

-- Campus 17: Pali (Bangur Govt College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Bangur Govt College', id, 25.7711, 73.3234, 240.0, 160.0, 30.0, 80.0
FROM districts WHERE code = 'PALI'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Bangur Govt College');

-- Campus 18: Nagaur (Govt B.R. Mirdha College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt B.R. Mirdha College', id, 27.2000, 73.7400, 230.0, 150.0, 30.0, 75.0
FROM districts WHERE code = 'NGO'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt B.R. Mirdha College');

-- Campus 19: Hanumangarh (Govt Nehru Memorial PG College)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt Nehru Memorial PG College', id, 29.5800, 74.3200, 220.0, 140.0, 25.0, 70.0
FROM districts WHERE code = 'HMH'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt Nehru Memorial PG College');

-- Campus 20: Barmer (Govt PG College Barmer)
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt PG College Barmer', id, 25.7521, 71.3967, 280.0, 220.0, 50.0, 110.0
FROM districts WHERE code = 'BME'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt PG College Barmer');
