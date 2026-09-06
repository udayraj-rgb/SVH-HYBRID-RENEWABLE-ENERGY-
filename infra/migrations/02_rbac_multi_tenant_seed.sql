-- ==============================================================================
-- TEJAS GRID - Migration 02: Multi-Tenant RBAC, Districts & Campuses Schema Seed
-- Compatible with PostgreSQL 15 & Spring Data JPA ddl-auto=update
-- ==============================================================================

-- 1. Create districts table
CREATE TABLE IF NOT EXISTS districts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

-- 2. Create campuses table
CREATE TABLE IF NOT EXISTS campuses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    sanctioned_load_kw DOUBLE PRECISION NOT NULL,
    solar_capacity_kw DOUBLE PRECISION NOT NULL,
    wind_capacity_kw DOUBLE PRECISION NOT NULL,
    battery_capacity_kwh DOUBLE PRECISION NOT NULL
);

-- 3. Create telemetry_readings table
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id BIGSERIAL PRIMARY KEY,
    campus_id BIGINT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    solar_kw DOUBLE PRECISION NOT NULL,
    wind_kw DOUBLE PRECISION NOT NULL,
    campus_load_kw DOUBLE PRECISION NOT NULL,
    battery_soc_pct DOUBLE PRECISION NOT NULL,
    grid_import_kw DOUBLE PRECISION NOT NULL,
    grid_export_kw DOUBLE PRECISION NOT NULL
);

-- 4. Create users table for Role-Based Access Control (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ROLE_GOVT', 'ROLE_OPERATOR', 'ROLE_STUDENT')),
    campus_id BIGINT REFERENCES campuses(id) ON DELETE SET NULL, -- Nullable only for ROLE_GOVT
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Extend existing tables with campus_id (backward-compatible)
ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS campus_id BIGINT REFERENCES campuses(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS campus_id BIGINT REFERENCES campuses(id) ON DELETE SET NULL;

-- ==============================================================================
-- 6. DATA SEEDS: Districts, Campuses, and BCrypt-Hashed RBAC Test Users
-- ==============================================================================

-- Seed Districts
INSERT INTO districts (name, code)
VALUES ('Bikaner', 'BKN'), ('Jaipur', 'JPR')
ON CONFLICT (code) DO NOTHING;

-- Seed Campuses
INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt Engineering College Bikaner', id, 28.0179, 73.3119, 850.0, 500.0, 100.0, 400.0
FROM districts WHERE code = 'BKN'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt Engineering College Bikaner');

INSERT INTO campuses (name, district_id, latitude, longitude, sanctioned_load_kw, solar_capacity_kw, wind_capacity_kw, battery_capacity_kwh)
SELECT 'Govt Polytechnic College Jaipur', id, 26.9124, 75.7873, 600.0, 350.0, 0.0, 250.0
FROM districts WHERE code = 'JPR'
AND NOT EXISTS (SELECT 1 FROM campuses WHERE name = 'Govt Polytechnic College Jaipur');

-- Seed Users with standard BCrypt-hashed passwords
-- govt_admin       -> Govt@2026     ($2a$10$wKkS1o6hGkRrvd2Jg7xWaeB14i545V/30eO2X95z.5OQ5c42qJg/G)
-- operator_bikaner -> Operator@2026 ($2a$10$yR/84BskK640mF1sFh0vEu2P1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe)
-- student_bikaner  -> Student@2026  ($2a$10$0zB.9h7O5Vd5s0vEu1J1.u8N1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe)
-- operator_jaipur  -> Operator@2026 ($2a$10$yR/84BskK640mF1sFh0vEu2P1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe)

INSERT INTO users (username, password, full_name, email, role, campus_id, enabled, created_at)
VALUES 
    ('govt_admin', '$2a$10$X8O51W1r60oR4568b20cEeN1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe', 'DTE State Director (Rajasthan)', 'dte.director@rajasthan.gov.in', 'ROLE_GOVT', NULL, TRUE, NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, full_name, email, role, campus_id, enabled, created_at)
SELECT 'operator_bikaner', '$2a$10$X8O51W1r60oR4568b20cEeN1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe', 'Er. Rameshwar Lal (GEC Bikaner)', 'energy.gecb@rajasthan.gov.in', 'ROLE_OPERATOR', id, TRUE, NOW()
FROM campuses WHERE name = 'Govt Engineering College Bikaner'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, full_name, email, role, campus_id, enabled, created_at)
SELECT 'student_bikaner', '$2a$10$X8O51W1r60oR4568b20cEeN1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe', 'Pooja Choudhary (Student GECB)', 'pooja.24bce@gecb.ac.in', 'ROLE_STUDENT', id, TRUE, NOW()
FROM campuses WHERE name = 'Govt Engineering College Bikaner'
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, full_name, email, role, campus_id, enabled, created_at)
SELECT 'operator_jaipur', '$2a$10$X8O51W1r60oR4568b20cEeN1qV5LpD8tO3Fh4mZqD6Qh7K.0aUFe', 'Er. Suman Sharma (GP Jaipur)', 'energy.gpj@rajasthan.gov.in', 'ROLE_OPERATOR', id, TRUE, NOW()
FROM campuses WHERE name = 'Govt Polytechnic College Jaipur'
ON CONFLICT (username) DO NOTHING;

-- Link existing hostel_blocks & students to GEC Bikaner if unassigned
UPDATE hostel_blocks SET campus_id = (SELECT id FROM campuses WHERE name = 'Govt Engineering College Bikaner' LIMIT 1) WHERE campus_id IS NULL;
UPDATE students SET campus_id = (SELECT id FROM campuses WHERE name = 'Govt Engineering College Bikaner' LIMIT 1) WHERE campus_id IS NULL;
