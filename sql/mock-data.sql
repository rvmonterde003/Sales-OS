-- ============================================================
-- Sales OS — Mock Data v2 (Law Firm SEO/Marketing Vertical)
-- Run AFTER full-migration.sql in Supabase SQL Editor
-- Truncates all data tables first, preserves schema config
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. TRUNCATE DATA (preserve sales_stages & loss_reasons)
-- ────────────────────────────────────────────────────────────
TRUNCATE
  inactivity_flags,
  activities,
  stage_transitions,
  opportunities,
  qualification_checks,
  contacts,
  companies,
  invitations
RESTART IDENTITY CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES
  (1, 'rommel@primelive.ai', '', 'Mel',   'Monterde',    'exec',  true),
  (2, 'nate@primelive.ai',   '', 'Nate',  'Geraldez',    'admin', true),
  (3, 'ginny@primelive.ai',  '', 'Ginny', 'Evangelista',  'rep',   true),
  (4, 'evan@primelive.ai',   '', 'Evan',  'Magdadaro',    'rep',   true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES
--    MQL  = brand-new leads, only firm name & source
--    SQL  = firm info being added, BANT in progress
--    Qualified = ready for opportunity creation
--    Customer  = active clients (status = Customer)
--    Former    = churned client
-- ────────────────────────────────────────────────────────────
INSERT INTO companies (id, name, industry, firm_size, website, source, status, lead_status, owner_id, last_activity_at) VALUES
  -- MQL leads (no firm info yet — just name + source)
  (1,  'Baxter Family Law',           NULL,                NULL,      NULL,                          'Outbound',   'Prospect', 'MQL', 3, now() - interval '2 days'),
  (2,  'Pinnacle Estate Planning',    NULL,                NULL,      NULL,                          'Outbound',   'Prospect', 'MQL', 4, now() - interval '5 days'),
  (3,  'Meridian Bankruptcy Law',     NULL,                NULL,      NULL,                          'Inbound',    'Prospect', 'MQL', 4, now() - interval '3 days'),

  -- SQL leads (firm info populated, BANT in progress)
  (4,  'Hartwell & Associates',       'Personal Injury',   '11-50',   'hartwelllaw.com',             'Inbound',    'Prospect', 'SQL', 1, now() - interval '1 day'),
  (5,  'Rivera & Nguyen LLP',         'Employment Law',    '51-200',  'riveranguyen.com',            'Inbound',    'Prospect', 'SQL', 3, now() - interval '4 days'),
  (6,  'Torres Criminal Defense',     'Criminal Defense',  '11-50',   'torresdefense.com',           'Referral',   'Prospect', 'SQL', 1, now() - interval '2 days'),

  -- Qualified leads (BANT complete, awaiting opportunity creation → still in Leads tab)
  (7,  'Whitfield Immigration Group', 'Immigration',       '11-50',   'whitfieldimmigration.com',    'Referral',   'Prospect', 'Qualified', 2, now() - interval '1 day'),

  -- Qualified + has opportunity → shows in Law Firms tab
  (8,  'Sterling Defense Group',      'Criminal Defense',  '11-50',   'sterlingdefense.com',         'Referral',   'Prospect', 'Qualified', 1, now() - interval '1 day'),
  (9,  'Ashford Labor Law',           'Employment Law',    '51-200',  'ashfordlaborlaw.com',         'Event',      'Prospect', 'Qualified', 3, now() - interval '3 days'),
  (10, 'Chen & Partners PLLC',        'Corporate Law',     '51-200',  'chenpartners.com',            'Inbound',    'Prospect', 'Qualified', 1, now() - interval '2 days'),

  -- Customers (won deals)
  (11, 'Caldwell Immigration PLLC',   'Immigration',       '11-50',   'caldwellimmigration.com',     'Referral',   'Customer', 'Qualified', 2, now() - interval '1 day'),
  (12, 'Blackstone Injury Lawyers',   'Personal Injury',   '51-200',  'blackstoneinjury.com',        'Inbound',    'Customer', 'Qualified', 1, now() - interval '2 days'),

  -- Former client (lost / churned)
  (13, 'Garrison & Park LLP',         'Corporate Law',     '51-200',  'garrisonpark.com',            'Event',      'Former',   'Qualified', 2, now() - interval '30 days');

SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- ────────────────────────────────────────────────────────────
-- 3. CONTACTS
-- ────────────────────────────────────────────────────────────
INSERT INTO contacts (id, company_id, first_name, last_name, email, phone, title, role, linkedin_url) VALUES
  -- MQL contacts (required: first + last name, rest optional)
  (1,  1,  'Linda',    'Baxter',     'lbaxter@baxterfamilylaw.com',       '+1-602-555-0301', NULL,                    NULL,             NULL),
  (2,  2,  'Howard',   'Finch',      NULL,                                '+1-480-555-0601', NULL,                    NULL,             'linkedin.com/in/howardfinch'),
  (3,  3,  'Gregory',  'Owens',      'gowens@meridianbankruptcy.com',     NULL,              NULL,                    NULL,             NULL),

  -- SQL contacts
  (4,  4,  'Michael',  'Hartwell',   'mhartwell@hartwelllaw.com',         '+1-213-555-0101', 'Managing Partner',      'Decision Maker', 'linkedin.com/in/michaelhartwell'),
  (5,  4,  'Karen',    'Orozco',     'korozco@hartwelllaw.com',           '+1-213-555-0102', 'Marketing Director',    'Champion',       'linkedin.com/in/karenorozco'),
  (6,  5,  'Angela',   'Rivera',     'arivera@riveranguyen.com',          '+1-415-555-0501', 'Senior Partner',        'Decision Maker', 'linkedin.com/in/angelarivera'),
  (7,  6,  'Marco',    'Torres',     'mtorres@torresdefense.com',         '+1-713-555-0901', 'Managing Partner',      'Decision Maker', 'linkedin.com/in/marcotorres'),
  (8,  6,  'Alicia',   'Vega',       'avega@torresdefense.com',           '+1-713-555-0902', 'Business Development',  'Champion',       'linkedin.com/in/aliciavega'),

  -- Qualified contacts
  (9,  7,  'Rebecca',  'Whitfield',  'rwhitfield@whitfieldimmigration.com','+1-305-555-0701', 'Managing Attorney',    'Decision Maker', 'linkedin.com/in/rebeccawhitfield'),
  (10, 8,  'James',    'Sterling',   'jsterling@sterlingdefense.com',     '+1-312-555-0201', 'Founding Partner',      'Decision Maker', 'linkedin.com/in/jamessterling'),
  (11, 8,  'Priya',    'Desai',      'pdesai@sterlingdefense.com',        '+1-312-555-0202', 'Office Manager',        'Evaluator',      'linkedin.com/in/priyadesai'),
  (12, 9,  'Nathan',   'Ashford',    'nashford@ashfordlaborlaw.com',      '+1-415-555-0801', 'Name Partner',          'Decision Maker', 'linkedin.com/in/nathanashford'),
  (13, 10, 'Diane',    'Chen',       'dchen@chenpartners.com',            '+1-212-555-0901', 'Managing Partner',      'Decision Maker', 'linkedin.com/in/dianechen'),

  -- Customer contacts
  (14, 11, 'Daniel',   'Caldwell',   'dcaldwell@caldwellimmigration.com', '+1-305-555-0401', 'Managing Attorney',     'Decision Maker', 'linkedin.com/in/danielcaldwell'),
  (15, 11, 'Sofia',    'Reyes',      'sreyes@caldwellimmigration.com',    '+1-305-555-0402', 'Intake Coordinator',    'Champion',       'linkedin.com/in/sofiareyes'),
  (16, 12, 'Victoria', 'Blackstone', 'vblackstone@blackstoneinjury.com',  '+1-214-555-0701', 'Senior Partner',        'Decision Maker', 'linkedin.com/in/victoriablackstone'),
  (17, 12, 'Ryan',     'Matsuda',    'rmatsuda@blackstoneinjury.com',     '+1-214-555-0702', 'Marketing Manager',     'Champion',       'linkedin.com/in/ryanmatsuda'),

  -- Former client contact
  (18, 13, 'Theodore', 'Garrison',   'tgarrison@garrisonpark.com',        '+1-212-555-0801', 'Name Partner',          'Decision Maker', 'linkedin.com/in/theodoregarrison');

SELECT setval('contacts_id_seq', (SELECT MAX(id) FROM contacts));

-- ────────────────────────────────────────────────────────────
-- 4. QUALIFICATION CHECKS (BANT)
--    SQL leads: partially filled
--    Qualified leads: fully filled
-- ────────────────────────────────────────────────────────────
INSERT INTO qualification_checks (company_id, pain_and_value, timeline, budget_pricing_fit, person_in_position, qualified_at, qualified_by) VALUES
  -- SQL leads — partial BANT (in progress)
  (4, 'Website ranks page 5+ for "personal injury lawyer LA." Losing cases to competitors with stronger SEO.', 'Want to see results within 90 days. Q2 launch target.', '', '', NULL, NULL),
  (5, 'Large firm but digital presence is weak. No content strategy, blog dormant since 2023.', '', 'Budget likely $5K-$7K/mo. Need to justify to partnership.', '', NULL, NULL),
  (6, 'New firm, 2 years old. Zero organic traffic. Relying entirely on paid ads at $8K/mo.', 'ASAP — ad costs unsustainable.', '', '', NULL, NULL),

  -- Qualified leads — all 4 fields filled
  (7,  'No Google presence for "immigration lawyer Miami." Intake team says 60% of callers found competitors first.', 'Immediate start — losing leads weekly.', '$3,500/mo confirmed. Partner signed off.', 'Managing Attorney is sole decision maker.', now() - interval '3 days', 2),
  (8,  'No Google presence for "criminal defense attorney Chicago." All leads from referrals — want to diversify.', 'Immediate start — losing leads weekly.', '$4,000/mo confirmed. Partner signed off.', 'Founding Partner is decision maker and very engaged. Wants weekly updates.', now() - interval '7 days', 1),
  (9,  'Employment law firm with 12 attorneys but only 200 organic visits/mo. Competitor ranking #1 for all keywords.', 'Within 60 days. Partners meeting end of month to decide.', '$5K-$7K/mo approved by partnership.', 'Senior Partner interested, has full authority.', now() - interval '5 days', 3),
  (10, 'Corporate law firm expanding to 3 offices. Zero local SEO presence. Want to dominate "corporate attorney" in tri-state.', 'Q2 launch target. Board approved digital budget.', '$6,000/mo confirmed. CFO approved.', 'Managing Partner makes final call. CMO championing internally.', now() - interval '4 days', 1),

  -- Customers — already qualified long ago
  (11, 'Website outdated, no blog, zero local SEO. Missing "immigration lawyer Miami" entirely.', 'Started 2 months ago — already a client.', '$3,000/mo retainer active. Upsell to $4,500 for PPC add-on.', 'Managing Attorney approves all marketing spend.', now() - interval '60 days', 2),
  (12, 'Strong brand offline but website underperforms. Only 200 organic visits/mo. Paid ads costing $15K/mo.', 'Next quarter — want to reduce PPC spend by Q3.', '$6,000/mo approved. Reallocating from PPC budget.', 'Senior Partner authorized. Marketing Manager driving implementation.', now() - interval '45 days', 1),
  (13, 'Corporate law firm needed SEO overhaul but went with cheaper freelancer.', 'Was Q1 target.', 'Partners felt $5K/mo was too high.', 'Name Partner was decision maker.', now() - interval '90 days', 2);

-- ────────────────────────────────────────────────────────────
-- 5. OPPORTUNITIES
--    Only for Qualified companies with deals + Customers
-- ────────────────────────────────────────────────────────────
INSERT INTO opportunities (id, company_id, primary_contact_id, stage_id, opportunity_type, service_description, source, deal_value, forecast_category, expected_close_date, contract_value, contract_start_date, contract_end_date, closed_reason_id, closed_reason_notes, closed_at, owner_id) VALUES
  -- Qualified + active pipeline
  (1,  8,  10, 4, 'New',     'SEO retainer + content marketing — blog posts, practice area pages, local citations, review management',                    'Referral', 48000.00,  'Best Case',  '2026-04-15', NULL, NULL, NULL, NULL, NULL, NULL, 1),
  (2,  9,  12, 2, 'New',     'Enterprise SEO strategy — multi-location optimization, content hub, authority building for employment law',                  'Event',    84000.00,  'Pipeline',   '2026-06-01', NULL, NULL, NULL, NULL, NULL, NULL, 3),
  (3,  10, 13, 3, 'New',     'Full SEO + local SEO package — keyword strategy, on-page optimization, GBP management for 3 offices',                       'Inbound',  72000.00,  'Best Case',  '2026-05-15', NULL, NULL, NULL, NULL, NULL, NULL, 1),

  -- Customer — won deals
  (4,  11, 14, 8, 'New',     'Full SEO retainer — bilingual content, local SEO for 3 office locations, immigration-specific keyword strategy',             'Referral', 36000.00,  'Commit',     '2026-02-15', 36000.00, '2026-03-01', '2027-02-28', NULL, NULL, '2026-02-14 10:00:00+00', 2),
  (5,  12, 16, 8, 'New',     'SEO + content marketing — practice area page overhaul, blog strategy, link building, PPC-to-organic transition plan',        'Inbound',  72000.00,  'Commit',     '2026-02-28', 72000.00, '2026-03-15', '2027-03-14', NULL, NULL, '2026-02-27 14:30:00+00', 1),

  -- Customer — upsell in pipeline
  (6,  11, 15, 1, 'Upsell',  'PPC management add-on — Google Ads for immigration keywords, landing page optimization, monthly reporting',                 'Referral', 18000.00,  'Pipeline',   '2026-05-01', NULL, NULL, NULL, NULL, NULL, NULL, 2),

  -- Former — lost deal
  (7,  13, 18, 9, 'New',     'SEO and digital marketing overhaul for corporate law firm — full website redesign, content, local SEO',                      'Event',    60000.00,   NULL,         '2026-01-31', NULL, NULL, NULL, 1, 'Partners felt $5K/mo was too high. Went with cheaper freelancer.', '2026-01-28 09:00:00+00', 2);

SELECT setval('opportunities_id_seq', (SELECT MAX(id) FROM opportunities));

-- ────────────────────────────────────────────────────────────
-- 6. STAGE TRANSITIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO stage_transitions (opportunity_id, from_stage_id, to_stage_id, transitioned_by, notes, created_at) VALUES
  -- Opp 1 (Sterling): Discovery → Demo → Eval → Proposal
  (1, NULL, 1, 1, 'Discovery call with James. Firm gets zero leads from Google.', now() - interval '21 days'),
  (1, 1,    2, 1, 'Walked through competitor rankings and content gap analysis', now() - interval '16 days'),
  (1, 2,    3, 1, 'James impressed with audit. Wants proposal with content + SEO combined.', now() - interval '10 days'),
  (1, 3,    4, 1, 'Proposal sent — $4K/mo, 12-month retainer, SEO + content marketing', now() - interval '5 days'),

  -- Opp 2 (Ashford): Discovery → Demo
  (2, NULL, 1, 3, 'Met Nathan at employment law conference. Interested in SEO.', now() - interval '10 days'),
  (2, 1,    2, 3, 'Ran full SEO audit — multi-location gaps identified', now() - interval '5 days'),

  -- Opp 3 (Chen): Discovery → Demo → Eval
  (3, NULL, 1, 1, 'Inbound inquiry from Diane after seeing our case study.', now() - interval '14 days'),
  (3, 1,    2, 1, 'Full audit: decent domain authority but zero local SEO', now() - interval '10 days'),
  (3, 2,    3, 1, 'Diane reviewing with CMO. Comparing us vs current agency.', now() - interval '6 days'),

  -- Opp 4 (Caldwell — Won): Full cycle
  (4, NULL, 1, 2, 'Referral from immigration attorney network.', now() - interval '70 days'),
  (4, 1,    2, 2, 'Site audit — 47 technical issues, zero citations, no GBP', now() - interval '60 days'),
  (4, 2,    3, 2, 'Daniel shared audit with partner. Both agreed to proceed.', now() - interval '52 days'),
  (4, 3,    4, 2, 'Proposal: $3K/mo retainer, bilingual content, 3 locations', now() - interval '44 days'),
  (4, 4,    5, 2, 'Negotiating scope — adding Spanish-language landing pages', now() - interval '36 days'),
  (4, 5,    6, 2, 'Contract drafted with 12-month term and 90-day review', now() - interval '28 days'),
  (4, 6,    7, 2, 'Daniel verbally committed — partner co-signature pending', now() - interval '20 days'),
  (4, 7,    8, 2, 'Contract signed! Onboarding starts March 1.', now() - interval '14 days'),

  -- Opp 5 (Blackstone — Won): Full cycle
  (5, NULL, 1, 1, 'Inbound — Victoria saw our PI firm SEO case study', now() - interval '55 days'),
  (5, 1,    2, 1, 'Full audit: authority but terrible on-page SEO', now() - interval '45 days'),
  (5, 2,    3, 1, 'Ryan evaluating — comparing us vs PPC agency', now() - interval '38 days'),
  (5, 3,    4, 1, 'Proposal: $6K/mo, SEO + content + PPC transition', now() - interval '30 days'),
  (5, 4,    5, 1, 'Negotiating — quarterly reviews and performance guarantees', now() - interval '22 days'),
  (5, 5,    6, 1, 'Contract under legal review', now() - interval '16 days'),
  (5, 6,    7, 1, 'Victoria gave verbal go-ahead', now() - interval '12 days'),
  (5, 7,    8, 1, 'Signed! 12-month engagement starting March 15.', now() - interval '10 days'),

  -- Opp 6 (Caldwell upsell): Discovery
  (6, NULL, 1, 2, 'Sofia mentioned they want PPC to complement SEO efforts.', now() - interval '5 days'),

  -- Opp 7 (Garrison — Lost): Discovery → Demo → Eval → Proposal → Loss
  (7, NULL, 1, 2, 'Met at legal tech conference. Theodore interested.', now() - interval '50 days'),
  (7, 1,    2, 2, 'Audit — decent DA but zero local SEO or content', now() - interval '44 days'),
  (7, 2,    3, 2, 'Partners reviewing. Slow internal process.', now() - interval '40 days'),
  (7, 3,    4, 2, 'Proposal: $5K/mo full-service SEO + content', now() - interval '35 days'),
  (7, 4,    9, 2, 'Lost — chose freelancer at $1,500/mo.', now() - interval '30 days');

-- ────────────────────────────────────────────────────────────
-- 7. ACTIVITIES
-- ────────────────────────────────────────────────────────────
INSERT INTO activities (company_id, contact_id, related_opportunity_id, activity_type, notes, logged_by, activity_timestamp) VALUES
  -- MQL leads (minimal touch)
  (1, 1,  NULL, 'Prospecting Touch', 'LinkedIn message to Linda — mentioned how solo family law attorneys are winning with local SEO.', 3, now() - interval '3 days'),
  (1, 1,  NULL, 'Call',              'Cold call — Linda interested but cautious. No marketing budget currently. Booked follow-up.', 3, now() - interval '2 days'),
  (2, 2,  NULL, 'Prospecting Touch', 'Cold email to Howard — "How estate planning attorneys are getting 5x more leads with local SEO."', 4, now() - interval '6 days'),
  (2, 2,  NULL, 'Call',              'Intro call. Howard gets most clients from financial advisor referrals. Open to exploring online leads.', 4, now() - interval '5 days'),
  (3, 3,  NULL, 'Prospecting Touch', 'LinkedIn outreach to Gregory — shared article on SEO for bankruptcy attorneys.', 4, now() - interval '4 days'),
  (3, 3,  NULL, 'Call',              'First call — Gregory interested in getting found for "bankruptcy lawyer Atlanta."', 4, now() - interval '3 days'),

  -- SQL leads (discovery + audit work)
  (4, 4,  NULL, 'Call',    'Discovery call with Michael. Firm ranks nowhere for "personal injury lawyer Los Angeles."', 1, now() - interval '8 days'),
  (4, 5,  NULL, 'Email',   'Sent SEO audit report and competitor analysis to Karen.', 1, now() - interval '6 days'),
  (4, 4,  NULL, 'Meeting', 'Presented audit findings. Showed keyword opportunity worth est. $50K/mo in traffic value.', 1, now() - interval '3 days'),
  (4, 5,  NULL, 'Email',   'Sent proposed keyword strategy and content calendar for review.', 1, now() - interval '1 day'),
  (5, 6,  NULL, 'Call',    'Initial call with Angela. Firm has 8 attorneys but only 200 organic visits/mo.', 3, now() - interval '5 days'),
  (5, 6,  NULL, 'Email',   'Sent overview of our employment law SEO approach — case studies from similar firms.', 3, now() - interval '4 days'),
  (6, 7,  NULL, 'Call',    'Referral follow-up. Marco spending $8K/mo on Google Ads with poor ROI.', 1, now() - interval '5 days'),
  (6, 8,  NULL, 'Meeting', 'Audit presentation with Alicia. Showed organic vs paid cost analysis.', 1, now() - interval '3 days'),
  (6, 7,  NULL, 'Call',    'Marco confirmed budget. Wants proposal that includes PPC wind-down plan.', 1, now() - interval '2 days'),

  -- Qualified lead without opportunity (Whitfield)
  (7, 9,  NULL, 'Call',    'Intro call via referral. Rebecca has no web presence, losing leads to competitors.', 2, now() - interval '8 days'),
  (7, 9,  NULL, 'Meeting', 'Full audit walkthrough. Zero local citations, no GBP claimed.', 2, now() - interval '5 days'),
  (7, 9,  NULL, 'Email',   'Sent qualification summary. Rebecca confirmed budget and timeline.', 2, now() - interval '3 days'),
  (7, 9,  NULL, 'Call',    'Qualification complete — discussing service options before creating formal opportunity.', 2, now() - interval '1 day'),

  -- Sterling (Qualified + pipeline)
  (8,  10, 1, 'Call',    'Intro call via Caldwell referral. James frustrated with lack of online leads.', 1, now() - interval '21 days'),
  (8,  11, 1, 'Meeting', 'Audit walkthrough with Priya. Competitors rank for all target keywords.', 1, now() - interval '14 days'),
  (8,  10, 1, 'Email',   'Sent proposal — $4K/mo retainer, 12 months: SEO, content, citations, reviews.', 1, now() - interval '5 days'),
  (8,  10, 1, 'Call',    'James reviewing proposal with partner. Expects decision by Friday.', 1, now() - interval '1 day'),

  -- Ashford (Qualified + pipeline)
  (9,  12, 2, 'Call',    'Met Nathan at conference. Firm has 12 attorneys but weak digital presence.', 3, now() - interval '10 days'),
  (9,  12, 2, 'Meeting', 'SEO audit presentation — multi-location gaps, no content strategy.', 3, now() - interval '5 days'),
  (9,  12, 2, 'Email',   'Sent detailed findings and proposed SEO roadmap.', 3, now() - interval '3 days'),

  -- Chen (Qualified + pipeline)
  (10, 13, 3, 'Call',    'Inbound inquiry from Diane — saw our corporate law case study.', 1, now() - interval '14 days'),
  (10, 13, 3, 'Meeting', 'Full audit presentation: decent DA but terrible local SEO for 3 offices.', 1, now() - interval '10 days'),
  (10, 13, 3, 'Email',   'Diane reviewing with CMO. Comparing our proposal vs current agency.', 1, now() - interval '6 days'),
  (10, 13, 3, 'Call',    'CMO on board. Diane finalizing budget approval with CFO.', 1, now() - interval '2 days'),

  -- Caldwell (Customer — won + upsell)
  (11, 14, 4, 'Meeting', 'Final contract review with Daniel. Added Spanish-language content deliverables.', 2, now() - interval '16 days'),
  (11, 15, 4, 'Email',   'Sent signed contract and onboarding questionnaire to Sofia.', 2, now() - interval '14 days'),
  (11, 14, 4, 'Call',    'Kick-off call — reviewed GBP optimization plan and content calendar.', 2, now() - interval '10 days'),
  (11, 15, 6, 'Call',    'Sofia asked about adding PPC to complement SEO. Exploring upsell.', 2, now() - interval '5 days'),
  (11, 14, 6, 'Meeting', 'Presented PPC proposal — $1,500/mo Google Ads management.', 2, now() - interval '3 days'),

  -- Blackstone (Customer — won)
  (12, 16, 5, 'Meeting', 'Contract signing with Victoria. Reviewed 12-month roadmap.', 1, now() - interval '10 days'),
  (12, 17, 5, 'Call',    'Onboarding call with Ryan — coordinating access and analytics setup.', 1, now() - interval '5 days'),
  (12, 16, 5, 'Email',   'Sent Month 1 deliverables: technical audit fixes, keyword mapping, content calendar.', 1, now() - interval '2 days'),

  -- Garrison (Former — lost)
  (13, 18, 7, 'Email',   'Post-loss follow-up. Theodore went with freelancer. Offered to reconnect in 6 months.', 2, now() - interval '30 days');

-- ────────────────────────────────────────────────────────────
-- 8. INACTIVITY FLAGS
-- ────────────────────────────────────────────────────────────
INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at, resolved_at, resolved_by) VALUES
  (9,  2, 'no_activity',      now() - interval '2 days', NULL, NULL),
  (10, 3, 'stage_stale',      now() - interval '1 day',  NULL, NULL),
  (5, NULL, 'no_activity',    now() - interval '3 days', now() - interval '1 day', 3);

-- ────────────────────────────────────────────────────────────
-- 9. INVITATIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO invitations (email, role, invited_by, accepted_at) VALUES
  ('nate@primelive.ai',  'admin', 1, now() - interval '25 days'),
  ('ginny@primelive.ai', 'rep',   1, now() - interval '20 days'),
  ('evan@primelive.ai',  'rep',   1, now() - interval '18 days');
