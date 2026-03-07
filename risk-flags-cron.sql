-- ============================================================
-- RISK FLAGS: Auto-generation function + pg_cron schedule
-- Run this in your Supabase SQL Editor after the main schema.
-- ============================================================

-- Enable pg_cron if not already enabled (Supabase has it available)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- Function: Generate inactivity flags automatically
-- ============================================================

CREATE OR REPLACE FUNCTION generate_inactivity_flags()
RETURNS void AS $$
DECLARE
    won_stage_id INTEGER;
    lost_stage_id INTEGER;
BEGIN
    -- Get terminal stage IDs
    SELECT id INTO won_stage_id FROM sales_stages WHERE name = 'Closed Won' LIMIT 1;
    SELECT id INTO lost_stage_id FROM sales_stages WHERE name = 'Closed Lost' LIMIT 1;

    -- ── 1. no_activity: Companies with no activity in 7+ days ──
    INSERT INTO inactivity_flags (company_id, flag_type, flagged_at)
    SELECT c.id, 'no_activity', NOW()
    FROM companies c
    WHERE c.status != 'Former'
    AND (
        c.last_activity_at IS NULL
        OR c.last_activity_at < NOW() - INTERVAL '7 days'
    )
    -- Don't duplicate: skip if an unresolved flag of same type already exists
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.company_id = c.id
        AND f.flag_type = 'no_activity'
        AND f.resolved_at IS NULL
    );

    -- ── 2. past_expected_close: Open deals past their expected close date ──
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'past_expected_close', NOW()
    FROM opportunities o
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND o.expected_close_date < CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id
        AND f.flag_type = 'past_expected_close'
        AND f.resolved_at IS NULL
    );

    -- ── 3. stage_stale: Open deals in the same stage for 14+ days ──
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'stage_stale', NOW()
    FROM opportunities o
    LEFT JOIN (
        SELECT opportunity_id, MAX(created_at) AS last_transition
        FROM stage_transitions
        GROUP BY opportunity_id
    ) st ON st.opportunity_id = o.id
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND EXTRACT(EPOCH FROM (NOW() - COALESCE(st.last_transition, o.created_at))) / 86400 > 14
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id
        AND f.flag_type = 'stage_stale'
        AND f.resolved_at IS NULL
    );

    -- ── 4. deal_aging: Open deals older than 30 days ──
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'deal_aging', NOW()
    FROM opportunities o
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 86400 > 30
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id
        AND f.flag_type = 'deal_aging'
        AND f.resolved_at IS NULL
    );

    -- ── Auto-resolve stale flags that no longer apply ──

    -- Resolve no_activity flags if company had recent activity
    UPDATE inactivity_flags
    SET resolved_at = NOW()
    WHERE flag_type = 'no_activity'
    AND resolved_at IS NULL
    AND company_id IN (
        SELECT id FROM companies
        WHERE last_activity_at >= NOW() - INTERVAL '7 days'
    );

    -- Resolve past_expected_close if deal was closed
    UPDATE inactivity_flags
    SET resolved_at = NOW()
    WHERE flag_type = 'past_expected_close'
    AND resolved_at IS NULL
    AND related_opportunity_id IN (
        SELECT id FROM opportunities WHERE closed_at IS NOT NULL
    );

    -- Resolve stage_stale if deal moved stages recently
    UPDATE inactivity_flags
    SET resolved_at = NOW()
    WHERE flag_type = 'stage_stale'
    AND resolved_at IS NULL
    AND related_opportunity_id IN (
        SELECT st.opportunity_id
        FROM (
            SELECT opportunity_id, MAX(created_at) AS last_transition
            FROM stage_transitions
            GROUP BY opportunity_id
        ) st
        WHERE EXTRACT(EPOCH FROM (NOW() - st.last_transition)) / 86400 <= 14
    );

    -- Resolve deal_aging if deal was closed
    UPDATE inactivity_flags
    SET resolved_at = NOW()
    WHERE flag_type = 'deal_aging'
    AND resolved_at IS NULL
    AND related_opportunity_id IN (
        SELECT id FROM opportunities WHERE closed_at IS NOT NULL
    );

END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Schedule: Run every hour
-- ============================================================

SELECT cron.schedule(
    'generate-risk-flags',        -- job name
    '0 * * * *',                  -- every hour at minute 0
    'SELECT generate_inactivity_flags()'
);

-- ============================================================
-- To run it immediately for the first time:
-- ============================================================
-- SELECT generate_inactivity_flags();

-- ============================================================
-- To unschedule if needed:
-- ============================================================
-- SELECT cron.unschedule('generate-risk-flags');
