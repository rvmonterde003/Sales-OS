-- ============================================================
-- SALES OPERATING SYSTEM — SQL SCHEMA
-- ============================================================

-- --------------------------------------------------------
-- 1. COMPANIES (Accounts / Law Firms)
-- --------------------------------------------------------
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    firm_size       VARCHAR(50),          -- e.g. 'Solo', '2-10', '11-50', '51-200', '200+'
    headcount       INTEGER,
    website         VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'Prospect'
                    CHECK (status IN ('Prospect', 'Customer', 'Former')),
    source          VARCHAR(100),         -- e.g. 'Website', 'Referral', 'Podcast', 'Beehive'
    owner           VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);

-- --------------------------------------------------------
-- 2. CONTACTS
-- --------------------------------------------------------
CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    title           VARCHAR(150),
    contact_type    VARCHAR(20) NOT NULL DEFAULT 'Lead'
                    CHECK (contact_type IN ('Lead', 'Customer', 'Other')),
    source          VARCHAR(100),
    last_activity_at TIMESTAMPTZ,         -- DERIVED: updated by activity trigger
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_last_activity ON contacts(last_activity_at);

-- --------------------------------------------------------
-- 3. SALES STAGES (Reference Table)
-- --------------------------------------------------------
CREATE TABLE sales_stages (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    stage_order     INTEGER NOT NULL UNIQUE,
    definition      TEXT,
    entry_criteria  TEXT,
    exit_criteria   TEXT,
    required_fields JSONB,                -- fields required at this stage
    is_terminal     BOOLEAN DEFAULT FALSE -- true for Closed Won / Closed Lost
);

INSERT INTO sales_stages (name, stage_order, definition, required_fields, is_terminal) VALUES
('Lead',                    1, 'Contact exists, not yet qualified.',
    '["source"]'::jsonb, FALSE),
('Sales Working Lead',      2, 'Active engagement underway, qualification incomplete.',
    '["source"]'::jsonb, FALSE),
('Opportunity (Qualified)', 3, 'Legitimate qualified deal.',
    '["expected_close_date","opportunity_type"]'::jsonb, FALSE),
('Evaluation / Demo / Proposal', 4, 'Buyer actively evaluating.',
    '["expected_close_date","forecast_category","deal_value"]'::jsonb, FALSE),
('Commit',                  5, 'Verbal commitment pending paperwork.',
    '["expected_close_date","forecast_category","deal_value"]'::jsonb, FALSE),
('Closed Won',              6, 'Deal won.',
    '["deal_value","contract_start_date","contract_end_date"]'::jsonb, TRUE),
('Closed Lost',             7, 'Deal lost.',
    '["closed_reason"]'::jsonb, TRUE);

-- --------------------------------------------------------
-- 4. OPPORTUNITIES (Deals)
-- --------------------------------------------------------
CREATE TABLE opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL REFERENCES companies(id),
    primary_contact_id  UUID NOT NULL REFERENCES contacts(id),
    opportunity_type    VARCHAR(20) NOT NULL DEFAULT 'New'
                        CHECK (opportunity_type IN ('New', 'Upsell', 'Renewal', 'Pilot')),
    stage_id            INTEGER NOT NULL REFERENCES sales_stages(id),
    source              VARCHAR(100),
    deal_value          NUMERIC(12,2),     -- ARR or total contract value
    forecast_category   VARCHAR(20)
                        CHECK (forecast_category IN ('Pipeline', 'Best Case', 'Commit')),
    expected_close_date DATE,
    contract_start_date DATE,
    contract_end_date   DATE,
    closed_at           TIMESTAMPTZ,
    closed_reason       VARCHAR(255),      -- standardized loss reason
    closed_notes        TEXT,
    owner               VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- DERIVED (computed by trigger or view)
    deal_age_days       INTEGER GENERATED ALWAYS AS
                        (EXTRACT(DAY FROM (COALESCE(closed_at, now()) - created_at))::INTEGER) STORED,
    stage_entered_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opp_company ON opportunities(company_id);
CREATE INDEX idx_opp_stage ON opportunities(stage_id);
CREATE INDEX idx_opp_forecast ON opportunities(forecast_category);
CREATE INDEX idx_opp_close_date ON opportunities(expected_close_date);

-- --------------------------------------------------------
-- 5. ACTIVITIES (Immutable Log)
-- --------------------------------------------------------
CREATE TABLE activities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type       VARCHAR(20) NOT NULL
                        CHECK (activity_type IN ('Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch')),
    related_object_type VARCHAR(20) NOT NULL
                        CHECK (related_object_type IN ('Contact', 'Opportunity')),
    related_object_id   UUID NOT NULL,
    owner               VARCHAR(100) NOT NULL,
    notes               TEXT,
    timestamp           TIMESTAMPTZ NOT NULL DEFAULT now()
    -- NO updated_at: activities are immutable
);

CREATE INDEX idx_act_related ON activities(related_object_type, related_object_id);
CREATE INDEX idx_act_type ON activities(activity_type);
CREATE INDEX idx_act_owner ON activities(owner);
CREATE INDEX idx_act_timestamp ON activities(timestamp);

-- --------------------------------------------------------
-- 6. STAGE TRANSITION LOG (Audit Trail)
-- --------------------------------------------------------
CREATE TABLE stage_transitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id  UUID NOT NULL REFERENCES opportunities(id),
    from_stage_id   INTEGER REFERENCES sales_stages(id),
    to_stage_id     INTEGER NOT NULL REFERENCES sales_stages(id),
    transitioned_by VARCHAR(100) NOT NULL,
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes           TEXT
);

CREATE INDEX idx_st_opp ON stage_transitions(opportunity_id);

-- --------------------------------------------------------
-- 7. QUALIFICATION CHECKLIST (BANT)
-- --------------------------------------------------------
CREATE TABLE qualification_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id      UUID NOT NULL REFERENCES contacts(id),
    opportunity_id  UUID REFERENCES opportunities(id),
    budget          BOOLEAN DEFAULT FALSE,
    authority       BOOLEAN DEFAULT FALSE,
    need            BOOLEAN DEFAULT FALSE,
    timing          BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    qualified_at    TIMESTAMPTZ,          -- set when all four = TRUE
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qual_contact ON qualification_checks(contact_id);

-- --------------------------------------------------------
-- 8. INACTIVITY FLAGS
-- --------------------------------------------------------
CREATE TABLE inactivity_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    related_object_type VARCHAR(20) NOT NULL
                    CHECK (related_object_type IN ('Contact', 'Opportunity')),
    related_object_id UUID NOT NULL,
    flag_type       VARCHAR(50) NOT NULL,  -- e.g. 'No Activity 7d', 'Stale Deal', 'Past Close Date'
    flagged_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at     TIMESTAMPTZ,
    resolved_by     VARCHAR(100)
);

CREATE INDEX idx_flags_object ON inactivity_flags(related_object_type, related_object_id);
CREATE INDEX idx_flags_open ON inactivity_flags(resolved_at) WHERE resolved_at IS NULL;

-- --------------------------------------------------------
-- 9. INTEGRATION SYNC LOG
-- --------------------------------------------------------
CREATE TABLE integration_sync_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source          VARCHAR(50) NOT NULL,  -- 'Gmail', 'Calendly', 'Stripe', etc.
    event_type      VARCHAR(100),
    payload         JSONB,
    status          VARCHAR(20) DEFAULT 'success'
                    CHECK (status IN ('success', 'failed', 'skipped')),
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VIEWS — ANALYTICS LAYER (Read-Only Computed Metrics)
-- ============================================================

-- Pipeline Summary by Stage
CREATE VIEW v_pipeline_by_stage AS
SELECT
    ss.name              AS stage_name,
    ss.stage_order,
    COUNT(o.id)          AS deal_count,
    COALESCE(SUM(o.deal_value), 0) AS total_value,
    ROUND(AVG(o.deal_value), 2)    AS avg_deal_value,
    ROUND(AVG(o.deal_age_days), 1) AS avg_deal_age_days
FROM sales_stages ss
LEFT JOIN opportunities o ON o.stage_id = ss.id
    AND o.closed_at IS NULL
GROUP BY ss.id, ss.name, ss.stage_order
ORDER BY ss.stage_order;

-- Funnel Conversion Rates
CREATE VIEW v_funnel_conversions AS
SELECT
    (SELECT COUNT(*) FROM contacts)                                        AS total_leads,
    (SELECT COUNT(*) FROM contacts WHERE contact_type = 'Lead')            AS active_leads,
    (SELECT COUNT(*) FROM qualification_checks WHERE qualified_at IS NOT NULL) AS sqls,
    (SELECT COUNT(*) FROM opportunities)                                   AS total_opportunities,
    (SELECT COUNT(*) FROM opportunities o
        JOIN sales_stages ss ON o.stage_id = ss.id
        WHERE ss.name = 'Closed Won')                                      AS wins,
    (SELECT COUNT(*) FROM opportunities o
        JOIN sales_stages ss ON o.stage_id = ss.id
        WHERE ss.name = 'Closed Lost')                                     AS losses;

-- Sales Cycle Length (Closed Deals)
CREATE VIEW v_sales_cycle AS
SELECT
    o.id,
    o.deal_value,
    o.opportunity_type,
    o.created_at,
    o.closed_at,
    EXTRACT(DAY FROM (o.closed_at - o.created_at))::INTEGER AS cycle_days
FROM opportunities o
WHERE o.closed_at IS NOT NULL;

-- Activity Leaderboard
CREATE VIEW v_activity_leaderboard AS
SELECT
    owner,
    activity_type,
    COUNT(*)                                        AS total_activities,
    COUNT(*) FILTER (WHERE timestamp >= now() - INTERVAL '7 days')  AS last_7_days,
    COUNT(*) FILTER (WHERE timestamp >= now() - INTERVAL '30 days') AS last_30_days
FROM activities
GROUP BY owner, activity_type
ORDER BY owner, total_activities DESC;

-- Stale / At-Risk Deals
CREATE VIEW v_at_risk_deals AS
SELECT
    o.id,
    o.deal_value,
    o.expected_close_date,
    o.deal_age_days,
    ss.name AS current_stage,
    EXTRACT(DAY FROM (now() - o.stage_entered_at))::INTEGER AS days_in_stage,
    (SELECT MAX(a.timestamp) FROM activities a
        WHERE a.related_object_type = 'Opportunity'
        AND a.related_object_id = o.id)                     AS last_activity,
    o.owner
FROM opportunities o
JOIN sales_stages ss ON o.stage_id = ss.id
WHERE o.closed_at IS NULL
  AND (
    o.expected_close_date < CURRENT_DATE
    OR EXTRACT(DAY FROM (now() - o.stage_entered_at)) > 14
  )
ORDER BY o.deal_value DESC;
