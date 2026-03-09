-- ============================================================
-- Sales OS — Full Database Migration
-- Run this in Supabase SQL Editor for a fresh project
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

-- Users (app-level user records, separate from Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'rep', 'member')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitations (invite-only signup tokens)
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'rep', 'member')),
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by INTEGER NOT NULL REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  firm_size TEXT,
  website TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'Prospect' CHECK (status IN ('Prospect', 'Customer', 'Former')),
  lead_status TEXT NOT NULL DEFAULT 'MQL' CHECK (lead_status IN ('MQL', 'SQL', 'Qualified', 'Unqualified')),
  unqualify_reason TEXT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  role TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Qualification Checks (BANT)
CREATE TABLE IF NOT EXISTS qualification_checks (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  pain_and_value TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  budget_pricing_fit TEXT NOT NULL DEFAULT '',
  person_in_position TEXT NOT NULL DEFAULT '',
  qualified_at TIMESTAMPTZ,
  qualified_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales Stages
CREATE TABLE IF NOT EXISTS sales_stages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stage_order INTEGER NOT NULL UNIQUE,
  definition TEXT,
  entry_criteria TEXT,
  exit_criteria TEXT,
  required_fields TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Loss Reasons
CREATE TABLE IF NOT EXISTS loss_reasons (
  id SERIAL PRIMARY KEY,
  reason TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  primary_contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  stage_id INTEGER NOT NULL REFERENCES sales_stages(id),
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('New', 'Upsell', 'Renewal', 'Pilot')),
  service_description TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  deal_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  forecast_category TEXT CHECK (forecast_category IN ('Pipeline', 'Best Case', 'Commit', NULL)),
  expected_close_date DATE NOT NULL,
  contract_value NUMERIC(14,2),
  contract_start_date DATE,
  contract_end_date DATE,
  closed_reason_id INTEGER REFERENCES loss_reasons(id),
  closed_reason_notes TEXT,
  closed_at TIMESTAMPTZ,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stage Transitions
CREATE TABLE IF NOT EXISTS stage_transitions (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  from_stage_id INTEGER REFERENCES sales_stages(id),
  to_stage_id INTEGER NOT NULL REFERENCES sales_stages(id),
  transitioned_by INTEGER NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stage_transitions_opp ON stage_transitions(opportunity_id, created_at DESC);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  related_opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch')),
  notes TEXT,
  attachments JSONB NOT NULL DEFAULT '[]',
  logged_by INTEGER NOT NULL REFERENCES users(id),
  activity_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_opp ON activities(related_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);

-- Inactivity Flags
CREATE TABLE IF NOT EXISTS inactivity_flags (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  related_opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('no_activity', 'deal_aging', 'past_expected_close', 'stage_stale')),
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flags_open ON inactivity_flags(resolved_at) WHERE resolved_at IS NULL;

-- ────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inactivity_flags ENABLE ROW LEVEL SECURITY;

-- Users: authenticated can do everything (app handles role logic)
CREATE POLICY "auth_users_select" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_users_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_users_update" ON users FOR UPDATE TO authenticated USING (true);
-- Anon can read users (for signup validation)
CREATE POLICY "anon_users_select" ON users FOR SELECT TO anon USING (true);
-- Anon can insert users (during signup)
CREATE POLICY "anon_users_insert" ON users FOR INSERT TO anon WITH CHECK (true);

-- Invitations: both anon + authenticated (anon needs it for signup token validation)
CREATE POLICY "invitations_select" ON invitations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "invitations_insert" ON invitations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "invitations_update" ON invitations FOR UPDATE TO anon, authenticated USING (true);

-- All other tables: authenticated full access (app enforces role-based logic)
CREATE POLICY "companies_all" ON companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "contacts_all" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "qualification_checks_all" ON qualification_checks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sales_stages_all" ON sales_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "loss_reasons_all" ON loss_reasons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "opportunities_all" ON opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "stage_transitions_all" ON stage_transitions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activities_all" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "inactivity_flags_all" ON inactivity_flags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- 3. SEED DATA: Sales Stages
-- ────────────────────────────────────────────────────────────

INSERT INTO sales_stages (name, stage_order, definition, entry_criteria, exit_criteria, required_fields) VALUES
  ('Discovery', 1,
   'Initial engagement — understanding the prospect''s needs, pain points, and business context.',
   'MQL qualified, first contact made',
   'Clear understanding of needs, next meeting scheduled',
   ARRAY['service_description', 'source']),
  ('Scoping', 2,
   'Defining the solution — aligning services to the prospect''s specific requirements.',
   'Needs identified, stakeholders engaged',
   'Scope documented, pricing discussed',
   ARRAY['deal_value', 'primary_contact_id']),
  ('Proposal', 3,
   'Formal proposal delivered — pricing, terms, and deliverables presented.',
   'Scope agreed, budget range confirmed',
   'Proposal delivered, feedback received',
   ARRAY['expected_close_date']),
  ('Negotiation', 4,
   'Active negotiation — refining terms, handling objections, finalizing agreement.',
   'Proposal reviewed, decision maker engaged',
   'Terms agreed, verbal commitment or loss',
   ARRAY['forecast_category']),
  ('Verbal', 5,
   'Verbal commitment received — awaiting signed contract or final approval.',
   'Decision maker verbally committed',
   'Contract signed (Won) or deal falls through (Loss)',
   ARRAY['contract_value']),
  ('Won', 6,
   'Deal closed and won — contract signed, revenue recognized.',
   'Contract signed',
   NULL,
   ARRAY[]::TEXT[]),
  ('Loss', 7,
   'Deal closed and lost — prospect chose not to proceed.',
   'Prospect declined or went with competitor',
   NULL,
   ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 4. SEED DATA: Loss Reasons
-- ────────────────────────────────────────────────────────────

INSERT INTO loss_reasons (reason) VALUES
  ('Price too high'),
  ('Chose competitor'),
  ('No budget'),
  ('Timing not right'),
  ('No decision made'),
  ('Lost contact / Ghosted'),
  ('Scope mismatch'),
  ('Internal change at prospect'),
  ('Regulatory / Compliance issue'),
  ('Other')
ON CONFLICT (reason) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 5. VIEWS (analytics)
-- ────────────────────────────────────────────────────────────

-- Pipeline by stage
CREATE OR REPLACE VIEW v_pipeline_by_stage AS
SELECT
  ss.name AS stage_name,
  ss.stage_order,
  COUNT(o.id)::INTEGER AS deal_count,
  COALESCE(SUM(o.deal_value), 0) AS total_value,
  COALESCE(AVG(o.deal_value), 0) AS avg_value,
  COALESCE(AVG(EXTRACT(EPOCH FROM (now() - o.created_at)) / 86400), 0)::INTEGER AS avg_age_days
FROM sales_stages ss
LEFT JOIN opportunities o ON o.stage_id = ss.id AND o.closed_at IS NULL
WHERE ss.name NOT IN ('Won', 'Loss')
GROUP BY ss.name, ss.stage_order
ORDER BY ss.stage_order;

-- Activity leaderboard
CREATE OR REPLACE VIEW v_activity_leaderboard AS
SELECT
  u.id AS user_id,
  u.first_name || ' ' || u.last_name AS rep_name,
  COUNT(a.id)::INTEGER AS total_activities,
  COUNT(a.id) FILTER (WHERE a.activity_type = 'Call')::INTEGER AS calls,
  COUNT(a.id) FILTER (WHERE a.activity_type = 'Email')::INTEGER AS emails,
  COUNT(a.id) FILTER (WHERE a.activity_type = 'Meeting')::INTEGER AS meetings,
  COUNT(a.id) FILTER (WHERE a.activity_type = 'Prospecting Touch')::INTEGER AS prospecting
FROM users u
LEFT JOIN activities a ON a.logged_by = u.id
WHERE u.is_active = true
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_activities DESC;

-- At-risk deals
CREATE OR REPLACE VIEW v_at_risk_deals AS
SELECT
  o.id AS opportunity_id,
  c.name AS company_name,
  ss.name AS stage_name,
  o.deal_value,
  o.expected_close_date,
  o.owner_id,
  u.first_name || ' ' || u.last_name AS owner_name,
  EXTRACT(EPOCH FROM (now() - o.created_at))::INTEGER / 86400 AS deal_age_days,
  (SELECT EXTRACT(EPOCH FROM (now() - MAX(st.created_at)))::INTEGER / 86400
   FROM stage_transitions st WHERE st.opportunity_id = o.id) AS days_in_stage,
  (SELECT MAX(a.activity_timestamp)
   FROM activities a WHERE a.company_id = o.company_id) AS last_activity_at
FROM opportunities o
JOIN companies c ON c.id = o.company_id
JOIN sales_stages ss ON ss.id = o.stage_id
JOIN users u ON u.id = o.owner_id
WHERE o.closed_at IS NULL
  AND (
    o.expected_close_date < CURRENT_DATE
    OR EXTRACT(EPOCH FROM (now() - o.created_at)) / 86400 > 90
  )
ORDER BY o.deal_value DESC;

-- Sales cycle
CREATE OR REPLACE VIEW v_sales_cycle AS
SELECT
  o.id AS opportunity_id,
  c.name AS company_name,
  o.deal_value,
  o.closed_at,
  EXTRACT(EPOCH FROM (COALESCE(o.closed_at, now()) - o.created_at))::INTEGER / 86400 AS cycle_days
FROM opportunities o
JOIN companies c ON c.id = o.company_id
JOIN sales_stages ss ON ss.id = o.stage_id
WHERE ss.name = 'Won'
ORDER BY o.closed_at DESC;

-- ────────────────────────────────────────────────────────────
-- 6. FIRST ADMIN USER
-- After running this migration:
--   1. Sign up via Supabase Auth (Dashboard > Authentication > Users > Add user)
--      or use the app's normal signup flow
--   2. Insert the user record below (replace values):
-- ────────────────────────────────────────────────────────────

-- INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
-- VALUES ('your-admin@email.com', '', 'Admin', 'User', 'admin', true);

-- ────────────────────────────────────────────────────────────
-- 7. SUPABASE AUTH SETTINGS (do these in Supabase Dashboard)
-- ────────────────────────────────────────────────────────────
--
-- Go to: Authentication > URL Configuration
--   Site URL:           https://sales-os-eight.vercel.app
--   Redirect URLs:      https://sales-os-eight.vercel.app
--                       https://sales-os-eight.vercel.app/**
--
-- Go to: Authentication > Email Templates
--   Paste the HTML from emails/forgot-password.html into "Reset Password"
--   Paste the HTML from emails/invite.html into "Invite User" (if used)
--
-- Go to: Authentication > Providers > Email
--   Enable "Confirm email" (enabled by default)
--   Enable "Secure email change"
--
-- IMPORTANT: The redirect URL setting is what fixes the localhost:3000 issue.
-- Supabase defaults to localhost:3000 if Site URL is not set.
-- ────────────────────────────────────────────────────────────
