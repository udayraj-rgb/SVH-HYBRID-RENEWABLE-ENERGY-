-- =============================================================
--  TEJAS GRID - PostgreSQL Schema Bootstrap
--  Database : tejasdb
--  Created  : Phase 1 Infrastructure
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
--  campus_asset - Solar / Wind / BESS physical assets
-- =============================================================
CREATE TABLE campus_asset (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  asset_type    VARCHAR(20)   NOT NULL CHECK (asset_type IN ('SOLAR','WIND','BESS')),
  capacity_kw   DECIMAL(10,2) NOT NULL,
  location      VARCHAR(200),
  is_active     BOOLEAN       DEFAULT true,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- =============================================================
--  hostel_block - Campus residential blocks
-- =============================================================
CREATE TABLE hostel_block (
  id                     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                   VARCHAR(100)  NOT NULL UNIQUE,
  total_students         INT           NOT NULL DEFAULT 0,
  current_points         BIGINT        NOT NULL DEFAULT 0,
  total_energy_saved_kwh DECIMAL(12,4) DEFAULT 0.0,
  created_at             TIMESTAMPTZ   DEFAULT NOW()
);

-- =============================================================
--  student_profile - Individual student gamification record
-- =============================================================
CREATE TABLE student_profile (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(150)  NOT NULL,
  phone_number    VARCHAR(20)   NOT NULL UNIQUE,
  hostel_id       UUID          NOT NULL REFERENCES hostel_block(id) ON DELETE RESTRICT,
  karma_points    BIGINT        NOT NULL DEFAULT 0,
  whatsapp_opt_in BOOLEAN       NOT NULL DEFAULT false,
  badge_level     VARCHAR(30)   DEFAULT 'NEWCOMER',
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- =============================================================
--  dispatch_event - VPP demand-response dispatch records
-- =============================================================
CREATE TABLE dispatch_event (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_timestamp   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  event_type        VARCHAR(50)   NOT NULL,
  trigger_condition VARCHAR(200),
  peak_reduction_kw DECIMAL(10,2) DEFAULT 0.0,
  cost_saved_inr    DECIMAL(12,2) DEFAULT 0.0,
  carbon_avoided_kg DECIMAL(10,4) DEFAULT 0.0,
  status            VARCHAR(20)   DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','ACKNOWLEDGED','EXECUTED','EXPIRED')),
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- =============================================================
--  reward - Redeemable reward catalogue
-- =============================================================
CREATE TABLE reward (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  points_cost  INT          NOT NULL,
  is_available BOOLEAN      DEFAULT true
);

-- =============================================================
--  redemption_log - Student reward redemptions
-- =============================================================
CREATE TABLE redemption_log (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID        NOT NULL REFERENCES student_profile(id),
  reward_id    UUID        NOT NULL REFERENCES reward(id),
  redeemed_at  TIMESTAMPTZ DEFAULT NOW(),
  points_spent INT         NOT NULL
);

-- =============================================================
--  Indexes
-- =============================================================
CREATE INDEX idx_student_hostel     ON student_profile(hostel_id);
CREATE INDEX idx_student_opt_in     ON student_profile(whatsapp_opt_in);
CREATE INDEX idx_dispatch_timestamp ON dispatch_event(event_timestamp DESC);
CREATE INDEX idx_hostel_points      ON hostel_block(current_points DESC);

-- =============================================================
--  Seed Data - Hostel Blocks
-- =============================================================
INSERT INTO hostel_block (name, total_students) VALUES
  ('Brahmaputra House', 240),
  ('Ganga House',       220),
  ('Yamuna House',      200),
  ('Kaveri House',      180),
  ('Godavari House',    160);

-- =============================================================
--  Seed Data - Campus Assets
-- =============================================================
INSERT INTO campus_asset (name, asset_type, capacity_kw, location) VALUES
  ('Rooftop Solar Array - Block A', 'SOLAR', 150.00, 'Main Academic Block'),
  ('Rooftop Solar Array - Block B', 'SOLAR', 100.00, 'Hostel Zone'),
  ('Wind Turbine - T1',             'WIND',   25.00, 'Campus Perimeter North'),
  ('Wind Turbine - T2',             'WIND',   25.00, 'Campus Perimeter South'),
  ('BESS Unit 1',                   'BESS',  200.00, 'Central Energy Storage'),
  ('BESS Unit 2',                   'BESS',  100.00, 'Hostel Zone Storage');

-- =============================================================
--  Seed Data - Reward Catalogue
-- =============================================================
INSERT INTO reward (name, description, points_cost) VALUES
  ('High-Speed Wi-Fi Token (24h)',
   'Unlimited 100 Mbps access for 24 hours', 200),
  ('Cafeteria Voucher (Rs.50)',
   'Redeemable at main campus cafeteria', 150),
  ('Stationery Pack',
   'Eco-branded pen, notebook, and sticker set', 300),
  ('Movie Night Pass',
   'Entry to campus movie screening', 500),
  ('Merit Certificate',
   'Eco-Champion recognition certificate', 1000);
