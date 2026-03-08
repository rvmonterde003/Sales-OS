-- ============================================================
-- SALES OS — COMPLETE SQL SCHEMA (V3)
-- ============================================================
-- Run this on a CLEAN Supabase project (no prior tables).
-- If migrating, drop all tables/views/triggers first:
--
--   DROP VIEW IF EXISTS v_sales_cycle, v_at_risk_deals, v_activity_leaderboard, v_pipeline_by_stage CASCADE;
--   DROP TABLE IF EXISTS inactivity_flags, stage_transitions, activities, opportunities, qualification_checks, loss_reasons, sales_stages, contacts, companies, users CASCADE;
--   DROP FUNCTION IF EXISTS update_company_last_activity, check_qualification_complete, check_company_status_on_close, generate_inactivity_flags CASCADE;
-- ============================================================

-- ============================================================
-- 1. USERS (Internal Team)
-- ============================================================

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'rep'
                    CHECK (role IN ('rep', 'manager', 'admin', 'executive')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. COMPANIES (The Firm — Primary Unit)
-- ============================================================

CREATE TABLE companies (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    firm_size       VARCHAR(50),
    website         VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'Prospect'
                    CHECK (status IN ('Prospect', 'Customer', 'Former')),
    lead_status     VARCHAR(30) NOT NULL DEFAULT 'MQL'
                    CHECK (lead_status IN ('MQL', 'SQL', 'Qualified', 'Unqualified')),
    unqualify_reason TEXT,
    owner_id        INTEGER NOT NULL REFERENCES users(id),
    last_activity_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. CONTACTS (Reference Directory)
-- ============================================================

CREATE TABLE contacts (
    id              SERIAL PRIMARY KEY,
    company_id      INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    title           VARCHAR(150),
    role            VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. QUALIFICATION CHECKS (Per Firm — Text Fields)
-- ============================================================

CREATE TABLE qualification_checks (
    id              SERIAL PRIMARY KEY,
    company_id      INTEGER NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    pain_and_value  TEXT NOT NULL DEFAULT '',
    timeline        TEXT NOT NULL DEFAULT '',
    budget_pricing_fit TEXT NOT NULL DEFAULT '',
    person_in_position TEXT NOT NULL DEFAULT '',
    qualified_at    TIMESTAMPTZ,
    qualified_by    INTEGER REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. SALES STAGES (System Config)
-- ============================================================

CREATE TABLE sales_stages (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    stage_order     INTEGER NOT NULL UNIQUE,
    definition      TEXT,
    entry_criteria  TEXT,
    exit_criteria   TEXT,
    required_fields TEXT[] NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stage 0 (MQL -> SQL -> Qualify/Unqualify) is handled via companies.lead_status
-- Stages 1-7 are the deal pipeline. Stages 8-9 are terminal.

INSERT INTO sales_stages (name, stage_order, definition, entry_criteria, exit_criteria, required_fields) VALUES
('Discovery',             1, 'Initial discovery and needs assessment.',
    'Company qualified (all 4 qualification fields confirmed).',
    'Clear understanding of prospect needs.',
    '{}'),
('Demonstration/Audit',  2, 'Product demo or service audit.',
    'Discovery completed.',
    'Prospect has seen solution in action.',
    '{}'),
('Evaluation',           3, 'Prospect evaluating the solution.',
    'Demo/Audit completed.',
    'Prospect confirms fit.',
    '{}'),
('Proposal',             4, 'Formal proposal submitted.',
    'Evaluation positive.',
    'Proposal delivered and reviewed.',
    ARRAY['deal_value', 'expected_close_date']),
('Negotiation',          5, 'Terms being negotiated.',
    'Proposal accepted in principle.',
    'Agreement on terms.',
    '{}'),
('Contract',             6, 'Contract drafting and review.',
    'Terms agreed.',
    'Contract signed.',
    '{}'),
('Verbal',               7, 'Verbal commitment received.',
    'Contract reviewed.',
    'Awaiting formal signature.',
    '{}'),
('Won',                  8, 'Deal closed and won.',
    'Contract signed.',
    NULL,
    ARRAY['contract_value', 'contract_start_date', 'contract_end_date']),
('Loss',                 9, 'Deal closed and lost.',
    'Deal abandoned or lost at any stage.',
    NULL,
    ARRAY['closed_reason']);

-- ============================================================
-- 6. LOSS REASONS (Standardized List)
-- ============================================================

CREATE TABLE loss_reasons (
    id              SERIAL PRIMARY KEY,
    reason          VARCHAR(255) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO loss_reasons (reason) VALUES
('Price too high'),
('Chose competitor'),
('No budget'),
('Timing not right'),
('No response / went dark'),
('Internal decision to not proceed'),
('Bad fit'),
('Other');

-- ============================================================
-- 7. OPPORTUNITIES (Deals)
-- ============================================================

CREATE TABLE opportunities (
    id                    SERIAL PRIMARY KEY,
    company_id            INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    primary_contact_id    INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    stage_id              INTEGER NOT NULL REFERENCES sales_stages(id),
    opportunity_type      VARCHAR(20) NOT NULL
                          CHECK (opportunity_type IN ('New', 'Upsell', 'Renewal', 'Pilot')),
    service_description   VARCHAR(500) NOT NULL,
    source                VARCHAR(100) NOT NULL,
    deal_value            NUMERIC(12,2) NOT NULL,
    forecast_category     VARCHAR(20)
                          CHECK (forecast_category IN ('Pipeline', 'Best Case', 'Commit')),
    expected_close_date   DATE NOT NULL,
    contract_value        NUMERIC(12,2),
    contract_start_date   DATE,
    contract_end_date     DATE,
    closed_reason_id      INTEGER REFERENCES loss_reasons(id),
    closed_reason_notes   TEXT,
    closed_at             TIMESTAMPTZ,
    owner_id              INTEGER NOT NULL REFERENCES users(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. STAGE TRANSITIONS (Immutable Audit Trail)
-- ============================================================

CREATE TABLE stage_transitions (
    id              SERIAL PRIMARY KEY,
    opportunity_id  INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage_id   INTEGER REFERENCES sales_stages(id),
    to_stage_id     INTEGER NOT NULL REFERENCES sales_stages(id),
    transitioned_by INTEGER NOT NULL REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. ACTIVITIES (Immutable Log — Firm + Contact Level)
-- ============================================================

CREATE TABLE activities (
    id                      SERIAL PRIMARY KEY,
    company_id              INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id              INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    related_opportunity_id  INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    activity_type           VARCHAR(30) NOT NULL
                            CHECK (activity_type IN ('Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch')),
    notes                   TEXT,
    attachments             JSONB NOT NULL DEFAULT '[]',
    logged_by               INTEGER NOT NULL REFERENCES users(id),
    activity_timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. INACTIVITY FLAGS (System Generated)
-- ============================================================

CREATE TABLE inactivity_flags (
    id                    SERIAL PRIMARY KEY,
    company_id            INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    related_opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    flag_type             VARCHAR(50) NOT NULL
                          CHECK (flag_type IN ('no_activity', 'deal_aging', 'past_expected_close', 'stage_stale')),
    flagged_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at           TIMESTAMPTZ,
    resolved_by           INTEGER REFERENCES users(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_lead_status ON companies(lead_status);
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_last_activity ON companies(last_activity_at);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_qualification_company ON qualification_checks(company_id);
CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage_id);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_transitions_opportunity ON stage_transitions(opportunity_id);
CREATE INDEX idx_transitions_by ON stage_transitions(transitioned_by);
CREATE INDEX idx_activities_company ON activities(company_id);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_opportunity ON activities(related_opportunity_id);
CREATE INDEX idx_activities_logged_by ON activities(logged_by);
CREATE INDEX idx_activities_timestamp ON activities(activity_timestamp);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_flags_company ON inactivity_flags(company_id);
CREATE INDEX idx_flags_opportunity ON inactivity_flags(related_opportunity_id);
CREATE INDEX idx_flags_resolved ON inactivity_flags(resolved_at);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update companies.last_activity_at on new activity
CREATE OR REPLACE FUNCTION update_company_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE companies
    SET last_activity_at = NEW.activity_timestamp,
        updated_at = NOW()
    WHERE id = NEW.company_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_activity_update_company
AFTER INSERT ON activities
FOR EACH ROW
EXECUTE FUNCTION update_company_last_activity();

-- Auto-set qualified_at when all 4 qualification fields are filled
CREATE OR REPLACE FUNCTION check_qualification_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF TRIM(COALESCE(NEW.pain_and_value, '')) != ''
       AND TRIM(COALESCE(NEW.timeline, '')) != ''
       AND TRIM(COALESCE(NEW.budget_pricing_fit, '')) != ''
       AND TRIM(COALESCE(NEW.person_in_position, '')) != '' THEN
        IF NEW.qualified_at IS NULL THEN
            NEW.qualified_at = NOW();
        END IF;
    ELSE
        NEW.qualified_at = NULL;
        NEW.qualified_by = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qualification_check
BEFORE INSERT OR UPDATE ON qualification_checks
FOR EACH ROW
EXECUTE FUNCTION check_qualification_complete();

-- Flip company status to Customer on Won
CREATE OR REPLACE FUNCTION check_company_status_on_close()
RETURNS TRIGGER AS $$
DECLARE
    won_stage_id INTEGER;
BEGIN
    SELECT id INTO won_stage_id FROM sales_stages WHERE name = 'Won' LIMIT 1;
    IF NEW.stage_id = won_stage_id THEN
        UPDATE companies
        SET status = 'Customer', updated_at = NOW()
        WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_company_status_on_close
AFTER UPDATE OF stage_id ON opportunities
FOR EACH ROW
EXECUTE FUNCTION check_company_status_on_close();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW v_pipeline_by_stage AS
SELECT
    ss.name AS stage_name,
    ss.stage_order,
    COUNT(o.id) AS deal_count,
    COALESCE(SUM(o.deal_value), 0) AS total_value,
    COALESCE(AVG(o.deal_value), 0) AS avg_value,
    COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 86400), 0) AS avg_age_days
FROM sales_stages ss
LEFT JOIN opportunities o ON o.stage_id = ss.id AND o.closed_at IS NULL
WHERE ss.is_active = TRUE AND ss.name NOT IN ('Won', 'Loss')
GROUP BY ss.id, ss.name, ss.stage_order
ORDER BY ss.stage_order;

CREATE VIEW v_activity_leaderboard AS
SELECT
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS rep_name,
    COUNT(a.id) AS total_activities,
    COUNT(CASE WHEN a.activity_type = 'Call' THEN 1 END) AS calls,
    COUNT(CASE WHEN a.activity_type = 'Email' THEN 1 END) AS emails,
    COUNT(CASE WHEN a.activity_type = 'Meeting' THEN 1 END) AS meetings,
    COUNT(CASE WHEN a.activity_type = 'Prospecting Touch' THEN 1 END) AS prospecting
FROM users u
LEFT JOIN activities a ON a.logged_by = u.id
WHERE u.is_active = TRUE
GROUP BY u.id, u.first_name, u.last_name;

CREATE VIEW v_at_risk_deals AS
SELECT
    o.id AS opportunity_id,
    c.name AS company_name,
    ss.name AS stage_name,
    o.deal_value,
    o.expected_close_date,
    o.owner_id,
    u.first_name || ' ' || u.last_name AS owner_name,
    EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 86400 AS deal_age_days,
    EXTRACT(EPOCH FROM (NOW() - COALESCE(st.last_transition, o.created_at))) / 86400 AS days_in_stage,
    c.last_activity_at
FROM opportunities o
JOIN companies c ON c.id = o.company_id
JOIN sales_stages ss ON ss.id = o.stage_id
JOIN users u ON u.id = o.owner_id
LEFT JOIN (
    SELECT opportunity_id, MAX(created_at) AS last_transition
    FROM stage_transitions
    GROUP BY opportunity_id
) st ON st.opportunity_id = o.id
WHERE o.closed_at IS NULL
AND ss.name NOT IN ('Won', 'Loss')
AND (
    o.expected_close_date < CURRENT_DATE
    OR EXTRACT(EPOCH FROM (NOW() - COALESCE(st.last_transition, o.created_at))) / 86400 > 14
    OR EXTRACT(EPOCH FROM (NOW() - c.last_activity_at)) / 86400 > 14
)
ORDER BY o.expected_close_date ASC;

CREATE VIEW v_sales_cycle AS
SELECT
    o.id AS opportunity_id,
    c.name AS company_name,
    o.deal_value,
    o.closed_at,
    EXTRACT(EPOCH FROM (o.closed_at - o.created_at)) / 86400 AS cycle_days
FROM opportunities o
JOIN companies c ON c.id = o.company_id
JOIN sales_stages ss ON ss.id = o.stage_id
WHERE ss.name = 'Won'
AND o.closed_at IS NOT NULL
ORDER BY o.closed_at DESC;

-- ============================================================
-- RISK FLAGS: Auto-generation function + pg_cron schedule
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION generate_inactivity_flags()
RETURNS void AS $$
DECLARE
    won_stage_id INTEGER;
    lost_stage_id INTEGER;
BEGIN
    SELECT id INTO won_stage_id FROM sales_stages WHERE name = 'Won' LIMIT 1;
    SELECT id INTO lost_stage_id FROM sales_stages WHERE name = 'Loss' LIMIT 1;

    -- 1. no_activity: Companies with no touchpoint in 14+ days
    INSERT INTO inactivity_flags (company_id, flag_type, flagged_at)
    SELECT c.id, 'no_activity', NOW()
    FROM companies c
    WHERE c.status != 'Former'
    AND (c.last_activity_at IS NULL OR c.last_activity_at < NOW() - INTERVAL '14 days')
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.company_id = c.id AND f.flag_type = 'no_activity' AND f.resolved_at IS NULL
    );

    -- 2. past_expected_close
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'past_expected_close', NOW()
    FROM opportunities o
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND o.expected_close_date < CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id AND f.flag_type = 'past_expected_close' AND f.resolved_at IS NULL
    );

    -- 3. stage_stale: Same stage for 14+ days
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'stage_stale', NOW()
    FROM opportunities o
    LEFT JOIN (
        SELECT opportunity_id, MAX(created_at) AS last_transition
        FROM stage_transitions GROUP BY opportunity_id
    ) st ON st.opportunity_id = o.id
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND EXTRACT(EPOCH FROM (NOW() - COALESCE(st.last_transition, o.created_at))) / 86400 > 14
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id AND f.flag_type = 'stage_stale' AND f.resolved_at IS NULL
    );

    -- 4. deal_aging: Open deals older than 30 days
    INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at)
    SELECT o.company_id, o.id, 'deal_aging', NOW()
    FROM opportunities o
    WHERE o.closed_at IS NULL
    AND o.stage_id NOT IN (won_stage_id, lost_stage_id)
    AND EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 86400 > 30
    AND NOT EXISTS (
        SELECT 1 FROM inactivity_flags f
        WHERE f.related_opportunity_id = o.id AND f.flag_type = 'deal_aging' AND f.resolved_at IS NULL
    );

    -- Auto-resolve

    UPDATE inactivity_flags SET resolved_at = NOW()
    WHERE flag_type = 'no_activity' AND resolved_at IS NULL
    AND company_id IN (SELECT id FROM companies WHERE last_activity_at >= NOW() - INTERVAL '14 days');

    UPDATE inactivity_flags SET resolved_at = NOW()
    WHERE flag_type = 'past_expected_close' AND resolved_at IS NULL
    AND related_opportunity_id IN (SELECT id FROM opportunities WHERE closed_at IS NOT NULL);

    UPDATE inactivity_flags SET resolved_at = NOW()
    WHERE flag_type = 'stage_stale' AND resolved_at IS NULL
    AND related_opportunity_id IN (
        SELECT st.opportunity_id FROM (
            SELECT opportunity_id, MAX(created_at) AS last_transition
            FROM stage_transitions GROUP BY opportunity_id
        ) st WHERE EXTRACT(EPOCH FROM (NOW() - st.last_transition)) / 86400 <= 14
    );

    UPDATE inactivity_flags SET resolved_at = NOW()
    WHERE flag_type = 'deal_aging' AND resolved_at IS NULL
    AND related_opportunity_id IN (SELECT id FROM opportunities WHERE closed_at IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('generate-risk-flags', '0 * * * *', 'SELECT generate_inactivity_flags()');

-- ============================================================
-- STORAGE: Activity attachments bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('activity-attachments', 'activity-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'activity-attachments');

CREATE POLICY "Allow public reads on attachments" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'activity-attachments');

-- ============================================================
-- RLS: Disable for now (all users see all data)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inactivity_flags ENABLE ROW LEVEL SECURITY;

-- Permissive policies: all authenticated users can do everything
CREATE POLICY "Allow all for authenticated" ON users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON qualification_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON sales_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON loss_reasons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON stage_transitions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON inactivity_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DONE. Your Sales OS database is ready.
-- ============================================================

-- ============================================================
-- AFTER RUNNING THIS SCHEMA:
-- ============================================================
--
-- 1. Create a Supabase Auth user in Dashboard > Authentication > Users > Add User
--    (email + password of your choice)
--
-- 2. Insert a matching row in the users table:
--
--    INSERT INTO users (email, password_hash, first_name, last_name, role)
--    VALUES ('your@email.com', 'managed-by-supabase-auth', 'Your', 'Name', 'admin');
--
--    The email MUST match the Supabase Auth user. The password_hash value is not used
--    (Supabase Auth handles authentication). This row gives the app a user ID for
--    ownership tracking on companies, activities, opportunities, etc.
--
-- 3. Set your environment variables (Vercel or .env.local):
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- ============================================================
