-- ==============================================================================
-- TEJAS GRID - Migration 04: Operational Advisories & RERC ToD Configuration
-- ==============================================================================

CREATE TABLE IF NOT EXISTS operational_advisories (
    id BIGSERIAL PRIMARY KEY,
    campus_id BIGINT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    level VARCHAR(30) NOT NULL CHECK (level IN ('INFO', 'RECOMMENDED_ACTION', 'CRITICAL_WARNING')),
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    message_en TEXT NOT NULL,
    message_hi TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITHOUT TIME ZONE,
    acknowledged_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_advisories_campus_acknowledged ON operational_advisories(campus_id, acknowledged);
