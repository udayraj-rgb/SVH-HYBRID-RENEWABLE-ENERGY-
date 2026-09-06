-- ==============================================================================
-- TEJAS GRID - Migration 05: 20 Campuses Hostels, Students & Student Users Seed
-- Compatible with PostgreSQL 15 & Spring Boot JPA
-- Every campus has 3 unique hostels, 3 unique students, and dedicated user accounts.
-- ==============================================================================

-- 1. SEED HOSTELS FOR CAMPUSES 2 TO 20 (Campus 1 already has IDs 1, 2, 3)
INSERT INTO hostel_blocks (name, campus_id, total_residents, cumulative_saved_kwh, current_karma_points, leaderboard_rank)
VALUES
    -- Campus 2: Jaipur (MNIT / UNIRAJ)
    ('Gargi Bhawan - MNIT Jaipur', 2, 180, 2450.0, 1280, 1),
    ('Tagore Bhawan - MNIT Jaipur', 2, 210, 2120.0, 1150, 2),
    ('Raman Bhawan - MNIT Jaipur', 2, 190, 1890.0, 980, 3),

    -- Campus 3: Jodhpur (IIT Jodhpur / JNVU)
    ('Kalpana Chawla Hall - IIT Jodhpur', 3, 160, 2680.0, 1420, 1),
    ('Mehrangarh Residency - JNVU Jodhpur', 3, 240, 2310.0, 1210, 2),
    ('Marwar Student Wing - IIT Jodhpur', 3, 175, 1940.0, 1040, 3),

    -- Campus 4: Kota (RTU / Govt Poly)
    ('Chambal Bhawan - RTU Kota', 4, 220, 2590.0, 1360, 1),
    ('Ramanujan Hall - RTU Kota', 4, 195, 2240.0, 1190, 2),
    ('Kota Barrage Wing - Poly Kota', 4, 180, 1820.0, 950, 3),

    -- Campus 5: Udaipur (MLSU / CTAE)
    ('Maharana Pratap Bhawan - CTAE Udaipur', 5, 205, 2740.0, 1450, 1),
    ('Saheliyon Bhawan - MLSU Udaipur', 5, 170, 2380.0, 1250, 2),
    ('Fateh Sagar Wing - CTAE Udaipur', 5, 160, 1910.0, 1010, 3),

    -- Campus 6: Ajmer (GEC Ajmer)
    ('Ana Sagar Bhawan - GEC Ajmer', 6, 150, 1950.0, 1050, 1),
    ('Prithviraj Chauhan Hall - GEC Ajmer', 6, 180, 1780.0, 970, 2),
    ('Taragarh Student Wing - GEC Ajmer', 6, 140, 1520.0, 830, 3),

    -- Campus 7: Alwar (RRBMU)
    ('Sariska Eco Bhawan - RRBMU Alwar', 7, 140, 1880.0, 1020, 1),
    ('Bala Qila Hall - Govt College Alwar', 7, 160, 1690.0, 920, 2),
    ('Matsya Student Hostel - RRBMU Alwar', 7, 130, 1410.0, 790, 3),

    -- Campus 8: Sikar (PDUSU)
    ('Shekhawati Bhawan - Sikar Campus', 8, 155, 1830.0, 990, 1),
    ('Khatu Shyam Hall - PDUSU Sikar', 8, 170, 1640.0, 890, 2),
    ('Jeendmata Wing - Sikar Campus', 8, 135, 1390.0, 760, 3),

    -- Campus 9: Bharatpur (MSBU)
    ('Lohagarh Bhawan - MSBU Bharatpur', 9, 145, 1770.0, 960, 1),
    ('Keoladeo Eco Wing - MSBU Bharatpur', 9, 160, 1590.0, 860, 2),
    ('Surajmal Hall - Govt College Bharatpur', 9, 130, 1340.0, 740, 3),

    -- Campus 10: Banswara (GGTU)
    ('Mahi Dam Residency - GGTU Banswara', 10, 130, 1710.0, 930, 1),
    ('Vagad Tribal Bhawan - GGTU Banswara', 10, 150, 1540.0, 840, 2),
    ('Tripura Sundari Hall - GGTU Banswara', 10, 120, 1290.0, 710, 3),

    -- Campus 11: Bhilwara (MLV Textile)
    ('Cotton Blossom Bhawan - MLV Bhilwara', 11, 165, 1980.0, 1070, 1),
    ('Harni Mahadev Hall - MLV Bhilwara', 11, 180, 1740.0, 940, 2),
    ('Textile Tech Wing - MLV Bhilwara', 11, 140, 1470.0, 810, 3),

    -- Campus 12: Churu (Govt Lohia)
    ('Seth Lohia Bhawan - Churu College', 12, 135, 1690.0, 910, 1),
    ('Tal Chhapar Eco Wing - Lohia Churu', 12, 150, 1510.0, 820, 2),
    ('Dudhwa Khara Hall - Lohia Churu', 12, 125, 1280.0, 700, 3),

    -- Campus 13: Jhalawar (Govt PG Jhalawar)
    ('Gagron Fort Bhawan - Jhalawar Campus', 13, 140, 1750.0, 950, 1),
    ('Chandrabhaga Hall - Jhalawar College', 13, 155, 1560.0, 850, 2),
    ('Jhalrapatan Wing - Jhalawar Campus', 13, 120, 1310.0, 720, 3),

    -- Campus 14: Sri Ganganagar (Govt National)
    ('Gang Canal Bhawan - National Ganganagar', 14, 150, 1860.0, 1010, 1),
    ('Green Valley Hall - Ganganagar College', 14, 165, 1620.0, 880, 2),
    ('Suratgarh Energy Wing - Ganganagar', 14, 130, 1380.0, 750, 3),

    -- Campus 15: Chittorgarh (Govt PG Chittor)
    ('Padmini Bhawan - Chittorgarh Campus', 15, 145, 1810.0, 980, 1),
    ('Vijay Stambh Hall - Chittorgarh PG', 15, 160, 1600.0, 870, 2),
    ('Rana Kumbha Wing - Chittorgarh College', 15, 130, 1350.0, 740, 3),

    -- Campus 16: Jhunjhunu (Seth Motilal)
    ('Motilal Heritage Bhawan - Jhunjhunu', 16, 135, 1720.0, 930, 1),
    ('Khetri Copper Hall - Jhunjhunu College', 16, 150, 1530.0, 830, 2),
    ('Rani Sati Wing - Jhunjhunu Campus', 16, 120, 1270.0, 690, 3),

    -- Campus 17: Pali (Bangur Govt)
    ('Bangur Heritage Bhawan - Pali College', 17, 140, 1760.0, 960, 1),
    ('Jawai Eco Hall - Pali Campus', 17, 155, 1570.0, 850, 2),
    ('Ranakpur Wing - Pali College', 17, 125, 1320.0, 720, 3),

    -- Campus 18: Nagaur (Govt B.R. Mirdha)
    ('Baldev Ram Mirdha Bhawan - Nagaur', 18, 145, 1790.0, 970, 1),
    ('Ahichhatragarh Hall - Nagaur Campus', 18, 160, 1580.0, 860, 2),
    ('Kharnal Wing - Mirdha Nagaur', 18, 125, 1300.0, 710, 3),

    -- Campus 19: Hanumangarh (Govt Nehru Memorial)
    ('Bhatner Fort Bhawan - Hanumangarh', 19, 140, 1740.0, 940, 1),
    ('Ghaggar Basin Hall - Nehru Hanumangarh', 19, 155, 1550.0, 840, 2),
    ('Kalibangan Wing - Hanumangarh PG', 19, 125, 1290.0, 700, 3),

    -- Campus 20: Barmer (Govt PG Barmer)
    ('Thar Solar Bhawan - Barmer Campus', 20, 150, 2050.0, 1110, 1),
    ('Kiradu Heritage Hall - Barmer PG', 20, 165, 1790.0, 970, 2),
    ('Siwana Desert Wing - Barmer College', 20, 135, 1480.0, 800, 3)
ON CONFLICT (name) DO NOTHING;

-- 2. SEED 19 STUDENT USER ACCOUNTS IN `users` TABLE
-- BCrypt hash for 'Student@2026' is $2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm
INSERT INTO users (username, password, full_name, email, role, campus_id, enabled, created_at)
VALUES
    ('student_jaipur', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Priya Sharma', 'priya.sharma@campus.tejas.edu', 'ROLE_STUDENT', 2, TRUE, NOW()),
    ('student_jodhpur', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Kunal Rathore', 'kunal.rathore@campus.tejas.edu', 'ROLE_STUDENT', 3, TRUE, NOW()),
    ('student_kota', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Siddharth Mittal', 'siddharth.mittal@campus.tejas.edu', 'ROLE_STUDENT', 4, TRUE, NOW()),
    ('student_udaipur', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Vikramaditya Rawat', 'vikramaditya.rawat@campus.tejas.edu', 'ROLE_STUDENT', 5, TRUE, NOW()),
    ('student_ajmer', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Saurabh Tanwar', 'saurabh.tanwar@campus.tejas.edu', 'ROLE_STUDENT', 6, TRUE, NOW()),
    ('student_alwar', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Tarun Yadav', 'tarun.yadav@campus.tejas.edu', 'ROLE_STUDENT', 7, TRUE, NOW()),
    ('student_sikar', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Vikas Nehra', 'vikas.nehra@campus.tejas.edu', 'ROLE_STUDENT', 8, TRUE, NOW()),
    ('student_bharatpur', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Mohit Faujdar', 'mohit.faujdar@campus.tejas.edu', 'ROLE_STUDENT', 9, TRUE, NOW()),
    ('student_banswara', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Rameshwar Damor', 'rameshwar.damor@campus.tejas.edu', 'ROLE_STUDENT', 10, TRUE, NOW()),
    ('student_bhilwara', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Prateek Somani', 'prateek.somani@campus.tejas.edu', 'ROLE_STUDENT', 11, TRUE, NOW()),
    ('student_churu', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Devendra Saran', 'devendra.saran@campus.tejas.edu', 'ROLE_STUDENT', 12, TRUE, NOW()),
    ('student_jhalawar', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Gaurav Patidar', 'gaurav.patidar@campus.tejas.edu', 'ROLE_STUDENT', 13, TRUE, NOW()),
    ('student_ganganagar', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Jashanpreet Singh', 'jashanpreet.singh@campus.tejas.edu', 'ROLE_STUDENT', 14, TRUE, NOW()),
    ('student_chittorgarh', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Digvijay Jhala', 'digvijay.jhala@campus.tejas.edu', 'ROLE_STUDENT', 15, TRUE, NOW()),
    ('student_jhunjhunu', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Naveen Sheoran', 'naveen.sheoran@campus.tejas.edu', 'ROLE_STUDENT', 16, TRUE, NOW()),
    ('student_pali', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Mayank Sirvi', 'mayank.sirvi@campus.tejas.edu', 'ROLE_STUDENT', 17, TRUE, NOW()),
    ('student_nagaur', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Hanuman Ram Godara', 'hanuman.godara@campus.tejas.edu', 'ROLE_STUDENT', 18, TRUE, NOW()),
    ('student_hanumangarh', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Arshdeep Sidhu', 'arshdeep.sidhu@campus.tejas.edu', 'ROLE_STUDENT', 19, TRUE, NOW()),
    ('student_barmer', '$2a$10$Pc.vmo61hh2a427XdDrd9Ou0/vwH93h4ivXDodXL5nYHPlIGBZXbm', 'Joga Ram Meghwal', 'joga.meghwal@campus.tejas.edu', 'ROLE_STUDENT', 20, TRUE, NOW())
ON CONFLICT (username) DO NOTHING;

-- 3. SEED 3 STUDENTS PER CAMPUS (60 STUDENTS TOTAL)

-- Campus 1 (Bikaner)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Udayraj Suthar', '24BTU101', '+91 82388 93551', 'udayraj.btu@campus.tejas.edu', 1170, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Block A (Aryabhata)'), 1),
    ('Aniket Gawai', '24BTU102', '+91 94140 11002', 'aniket.btu@campus.tejas.edu', 780, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Block B (Bhaskara)'), 1),
    ('Pooja Choudhary', '24BTU103', '+91 94140 11003', 'pooja.btu@campus.tejas.edu', 540, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Block C (Charaka)'), 1)
ON CONFLICT (email) DO NOTHING;

-- Campus 2 (Jaipur)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Priya Sharma', '24MNIT201', '+91 94140 12001', 'priya.sharma@campus.tejas.edu', 1280, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Gargi Bhawan - MNIT Jaipur'), 2),
    ('Rahul Verma', '24MNIT202', '+91 94140 12002', 'rahul.verma@campus.tejas.edu', 920, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Tagore Bhawan - MNIT Jaipur'), 2),
    ('Aditi Saxena', '24MNIT203', '+91 94140 12003', 'aditi.saxena@campus.tejas.edu', 610, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Raman Bhawan - MNIT Jaipur'), 2)
ON CONFLICT (email) DO NOTHING;

-- Campus 3 (Jodhpur)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Kunal Rathore', '24IITJ301', '+91 94140 13001', 'kunal.rathore@campus.tejas.edu', 1420, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Kalpana Chawla Hall - IIT Jodhpur'), 3),
    ('Meera Shekhawat', '24IITJ302', '+91 94140 13002', 'meera.shekhawat@campus.tejas.edu', 1050, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Mehrangarh Residency - JNVU Jodhpur'), 3),
    ('Harshvardhan Bhati', '24IITJ303', '+91 94140 13003', 'harsh.bhati@campus.tejas.edu', 730, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Marwar Student Wing - IIT Jodhpur'), 3)
ON CONFLICT (email) DO NOTHING;

-- Campus 4 (Kota)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Siddharth Mittal', '24RTU401', '+91 94140 14001', 'siddharth.mittal@campus.tejas.edu', 1360, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Chambal Bhawan - RTU Kota'), 4),
    ('Neha Khandelwal', '24RTU402', '+91 94140 14002', 'neha.khandelwal@campus.tejas.edu', 980, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Ramanujan Hall - RTU Kota'), 4),
    ('Aman Maheshwari', '24RTU403', '+91 94140 14003', 'aman.maheshwari@campus.tejas.edu', 640, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Kota Barrage Wing - Poly Kota'), 4)
ON CONFLICT (email) DO NOTHING;

-- Campus 5 (Udaipur)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Vikramaditya Rawat', '24CTAE501', '+91 94140 15001', 'vikramaditya.rawat@campus.tejas.edu', 1450, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Maharana Pratap Bhawan - CTAE Udaipur'), 5),
    ('Divya Menaria', '24CTAE502', '+91 94140 15002', 'divya.menaria@campus.tejas.edu', 1120, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Saheliyon Bhawan - MLSU Udaipur'), 5),
    ('Bhavik Jain', '24CTAE503', '+91 94140 15003', 'bhavik.jain@campus.tejas.edu', 810, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Fateh Sagar Wing - CTAE Udaipur'), 5)
ON CONFLICT (email) DO NOTHING;

-- Campus 6 (Ajmer)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Saurabh Tanwar', '24GECA601', '+91 94140 16001', 'saurabh.tanwar@campus.tejas.edu', 1050, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Ana Sagar Bhawan - GEC Ajmer'), 6),
    ('Ritu Tak', '24GECA602', '+91 94140 16002', 'ritu.tak@campus.tejas.edu', 840, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Prithviraj Chauhan Hall - GEC Ajmer'), 6),
    ('Mohit Vaishnav', '24GECA603', '+91 94140 16003', 'mohit.vaishnav@campus.tejas.edu', 620, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Taragarh Student Wing - GEC Ajmer'), 6)
ON CONFLICT (email) DO NOTHING;

-- Campus 7 (Alwar)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Tarun Yadav', '24RRB701', '+91 94140 17001', 'tarun.yadav@campus.tejas.edu', 1020, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Sariska Eco Bhawan - RRBMU Alwar'), 7),
    ('Sneha Naruka', '24RRB702', '+91 94140 17002', 'sneha.naruka@campus.tejas.edu', 790, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Bala Qila Hall - Govt College Alwar'), 7),
    ('Lokesh Gurjar', '24RRB703', '+91 94140 17003', 'lokesh.gurjar@campus.tejas.edu', 580, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Matsya Student Hostel - RRBMU Alwar'), 7)
ON CONFLICT (email) DO NOTHING;

-- Campus 8 (Sikar)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Vikas Nehra', '24PDU801', '+91 94140 18001', 'vikas.nehra@campus.tejas.edu', 990, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Shekhawati Bhawan - Sikar Campus'), 8),
    ('Payal Dhayal', '24PDU802', '+91 94140 18002', 'payal.dhayal@campus.tejas.edu', 760, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Khatu Shyam Hall - PDUSU Sikar'), 8),
    ('Deepak Saini', '24PDU803', '+91 94140 18003', 'deepak.saini@campus.tejas.edu', 530, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Jeendmata Wing - Sikar Campus'), 8)
ON CONFLICT (email) DO NOTHING;

-- Campus 9 (Bharatpur)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Mohit Faujdar', '24MSB901', '+91 94140 19001', 'mohit.faujdar@campus.tejas.edu', 960, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Lohagarh Bhawan - MSBU Bharatpur'), 9),
    ('Renu Sinsinwar', '24MSB902', '+91 94140 19002', 'renu.sinsinwar@campus.tejas.edu', 740, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Keoladeo Eco Wing - MSBU Bharatpur'), 9),
    ('Kapil Sharma', '24MSB903', '+91 94140 19003', 'kapil.sharma@campus.tejas.edu', 510, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Surajmal Hall - Govt College Bharatpur'), 9)
ON CONFLICT (email) DO NOTHING;

-- Campus 10 (Banswara)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Rameshwar Damor', '24GGT1001', '+91 94140 20001', 'rameshwar.damor@campus.tejas.edu', 930, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Mahi Dam Residency - GGTU Banswara'), 10),
    ('Anita Maida', '24GGT1002', '+91 94140 20002', 'anita.maida@campus.tejas.edu', 710, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Vagad Tribal Bhawan - GGTU Banswara'), 10),
    ('Suresh Ninama', '24GGT1003', '+91 94140 20003', 'suresh.ninama@campus.tejas.edu', 490, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Tripura Sundari Hall - GGTU Banswara'), 10)
ON CONFLICT (email) DO NOTHING;

-- Campus 11 (Bhilwara)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Prateek Somani', '24MLV1101', '+91 94140 21001', 'prateek.somani@campus.tejas.edu', 1070, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Cotton Blossom Bhawan - MLV Bhilwara'), 11),
    ('Anjali Rathi', '24MLV1102', '+91 94140 21002', 'anjali.rathi@campus.tejas.edu', 830, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Harni Mahadev Hall - MLV Bhilwara'), 11),
    ('Yash Toshniwal', '24MLV1103', '+91 94140 21003', 'yash.toshniwal@campus.tejas.edu', 570, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Textile Tech Wing - MLV Bhilwara'), 11)
ON CONFLICT (email) DO NOTHING;

-- Campus 12 (Churu)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Devendra Saran', '24GLC1201', '+91 94140 22001', 'devendra.saran@campus.tejas.edu', 910, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Seth Lohia Bhawan - Churu College'), 12),
    ('Sunita Kaswan', '24GLC1202', '+91 94140 22002', 'sunita.kaswan@campus.tejas.edu', 690, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Tal Chhapar Eco Wing - Lohia Churu'), 12),
    ('Amit Poonia', '24GLC1203', '+91 94140 22003', 'amit.poonia@campus.tejas.edu', 480, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Dudhwa Khara Hall - Lohia Churu'), 12)
ON CONFLICT (email) DO NOTHING;

-- Campus 13 (Jhalawar)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Gaurav Patidar', '24GPJ1301', '+91 94140 23001', 'gaurav.patidar@campus.tejas.edu', 950, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Gagron Fort Bhawan - Jhalawar Campus'), 13),
    ('Pooja Nagar', '24GPJ1302', '+91 94140 23002', 'pooja.nagar@campus.tejas.edu', 730, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Chandrabhaga Hall - Jhalawar College'), 13),
    ('Manish Dangi', '24GPJ1303', '+91 94140 23003', 'manish.dangi@campus.tejas.edu', 500, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Jhalrapatan Wing - Jhalawar Campus'), 13)
ON CONFLICT (email) DO NOTHING;

-- Campus 14 (Sri Ganganagar)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Jashanpreet Singh', '24GNC1401', '+91 94140 24001', 'jashanpreet.singh@campus.tejas.edu', 1010, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Gang Canal Bhawan - National Ganganagar'), 14),
    ('Simranjeet Kaur', '24GNC1402', '+91 94140 24002', 'simranjeet.kaur@campus.tejas.edu', 780, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Green Valley Hall - Ganganagar College'), 14),
    ('Gurpreet Brar', '24GNC1403', '+91 94140 24003', 'gurpreet.brar@campus.tejas.edu', 520, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Suratgarh Energy Wing - Ganganagar'), 14)
ON CONFLICT (email) DO NOTHING;

-- Campus 15 (Chittorgarh)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Digvijay Jhala', '24GPC1501', '+91 94140 25001', 'digvijay.jhala@campus.tejas.edu', 980, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Padmini Bhawan - Chittorgarh Campus'), 15),
    ('Komal Chundawat', '24GPC1502', '+91 94140 25002', 'komal.chundawat@campus.tejas.edu', 750, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Vijay Stambh Hall - Chittorgarh PG'), 15),
    ('Rajendra Shaktawat', '24GPC1503', '+91 94140 25003', 'rajendra.shaktawat@campus.tejas.edu', 510, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Rana Kumbha Wing - Chittorgarh College'), 15)
ON CONFLICT (email) DO NOTHING;

-- Campus 16 (Jhunjhunu)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Naveen Sheoran', '24SMJ1601', '+91 94140 26001', 'naveen.sheoran@campus.tejas.edu', 930, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Motilal Heritage Bhawan - Jhunjhunu'), 16),
    ('Manisha Kadian', '24SMJ1602', '+91 94140 26002', 'manisha.kadian@campus.tejas.edu', 710, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Khetri Copper Hall - Jhunjhunu College'), 16),
    ('Sandeep Pilania', '24SMJ1603', '+91 94140 26003', 'sandeep.pilania@campus.tejas.edu', 490, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Rani Sati Wing - Jhunjhunu Campus'), 16)
ON CONFLICT (email) DO NOTHING;

-- Campus 17 (Pali)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Mayank Sirvi', '24BGC1701', '+91 94140 27001', 'mayank.sirvi@campus.tejas.edu', 960, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Bangur Heritage Bhawan - Pali College'), 17),
    ('Varsha Deora', '24BGC1702', '+91 94140 27002', 'varsha.deora@campus.tejas.edu', 740, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Jawai Eco Hall - Pali Campus'), 17),
    ('Chetan Gehlot', '24BGC1703', '+91 94140 27003', 'chetan.gehlot@campus.tejas.edu', 520, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Ranakpur Wing - Pali College'), 17)
ON CONFLICT (email) DO NOTHING;

-- Campus 18 (Nagaur)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Hanuman Ram Godara', '24BRM1801', '+91 94140 28001', 'hanuman.godara@campus.tejas.edu', 970, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Baldev Ram Mirdha Bhawan - Nagaur'), 18),
    ('Saroj Khileri', '24BRM1802', '+91 94140 28002', 'saroj.khileri@campus.tejas.edu', 750, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Ahichhatragarh Hall - Nagaur Campus'), 18),
    ('Mukesh Beniwal', '24BRM1803', '+91 94140 28003', 'mukesh.beniwal@campus.tejas.edu', 510, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Kharnal Wing - Mirdha Nagaur'), 18)
ON CONFLICT (email) DO NOTHING;

-- Campus 19 (Hanumangarh)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Arshdeep Sidhu', '24GNM1901', '+91 94140 29001', 'arshdeep.sidhu@campus.tejas.edu', 940, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Bhatner Fort Bhawan - Hanumangarh'), 19),
    ('Harleen Pannu', '24GNM1902', '+91 94140 29002', 'harleen.pannu@campus.tejas.edu', 720, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Ghaggar Basin Hall - Nehru Hanumangarh'), 19),
    ('Sukhwinder Gill', '24GNM1903', '+91 94140 29003', 'sukhwinder.gill@campus.tejas.edu', 490, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Kalibangan Wing - Hanumangarh PG'), 19)
ON CONFLICT (email) DO NOTHING;

-- Campus 20 (Barmer)
INSERT INTO students (name, registration_number, phone_number, email, karma_points, whatsapp_opt_in, hostel_id, campus_id)
VALUES
    ('Joga Ram Meghwal', '24GPB2001', '+91 94140 30001', 'joga.meghwal@campus.tejas.edu', 1110, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Thar Solar Bhawan - Barmer Campus'), 20),
    ('Chanda Rathore', '24GPB2002', '+91 94140 30002', 'chanda.rathore@campus.tejas.edu', 860, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Kiradu Heritage Hall - Barmer PG'), 20),
    ('Jaswant Dudi', '24GPB2003', '+91 94140 30003', 'jaswant.dudi@campus.tejas.edu', 610, TRUE, (SELECT id FROM hostel_blocks WHERE name = 'Siwana Desert Wing - Barmer College'), 20)
ON CONFLICT (email) DO NOTHING;
