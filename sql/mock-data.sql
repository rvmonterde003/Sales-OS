-- ============================================================
-- Sales OS — Mock Data (Law Firm SEO/Marketing Vertical)
-- Run AFTER full-migration.sql in Supabase SQL Editor
-- All data attributed to exec user: rommel@primelive.ai
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES
  (1, 'rommel@primelive.ai', '', 'Mel', 'Monterde', 'exec', true),
  (2, 'nate@primelive.ai', '', 'Nate', 'Geraldez', 'admin', true),
  (3, 'ginny@primelive.ai', '', 'Ginny', 'Evangelista', 'rep', true),
  (4, 'evan@primelive.ai', '', 'Evan', 'Magdadaro', 'rep', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

-- Reset the sequence so future inserts continue from id=5
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ────────────────────────────────────────────────────────────
-- 2. COMPANIES (Law Firms)
-- ────────────────────────────────────────────────────────────
INSERT INTO companies (name, industry, firm_size, website, source, status, lead_status, owner_id, last_activity_at) VALUES
  ('Hartwell & Associates',       'Personal Injury',      '11-50',    'hartwelllaw.com',          'Inbound',    'Prospect', 'SQL',         1, now() - interval '2 days'),
  ('Sterling Defense Group',      'Criminal Defense',     '11-50',    'sterlingdefense.com',      'Referral',   'Prospect', 'Qualified',   1, now() - interval '1 day'),
  ('Baxter Family Law',           'Family Law',           '2-10',     'baxterfamilylaw.com',      'Outbound',   'Prospect', 'MQL',         3, now() - interval '5 days'),
  ('Caldwell Immigration PLLC',   'Immigration',          '11-50',    'caldwellimmigration.com',  'Referral',   'Customer', 'Qualified',   2, now() - interval '3 days'),
  ('Rivera & Nguyen LLP',        'Employment Law',       '51-200',   'riveranguyen.com',         'Inbound',    'Prospect', 'SQL',         3, now() - interval '7 days'),
  ('Pinnacle Estate Planning',    'Estate Planning',      '2-10',     'pinnacleestatelaw.com',    'Outbound',   'Prospect', 'MQL',         4, now() - interval '10 days'),
  ('Blackstone Injury Lawyers',   'Personal Injury',      '51-200',   'blackstoneinjury.com',     'Inbound',    'Customer', 'Qualified',   1, now() - interval '1 day'),
  ('Garrison & Park LLP',        'Corporate Law',        '51-200',   'garrisonpark.com',         'Event',      'Former',   'Unqualified', 2, now() - interval '30 days'),
  ('Torres Criminal Defense',     'Criminal Defense',     '11-50',    'torresdefense.com',        'Referral',   'Prospect', 'SQL',         1, now() - interval '4 days'),
  ('Meridian Bankruptcy Law',     'Bankruptcy',           '2-10',     'meridianbankruptcy.com',   'Outbound',   'Prospect', 'MQL',         4, now() - interval '14 days');

-- ────────────────────────────────────────────────────────────
-- 3. CONTACTS
-- ────────────────────────────────────────────────────────────
INSERT INTO contacts (company_id, first_name, last_name, email, phone, title, role, linkedin_url) VALUES
  (1, 'Michael',  'Hartwell',    'mhartwell@hartwelllaw.com',         '+1-213-555-0101', 'Managing Partner',     'Decision Maker',  'linkedin.com/in/michaelhartwell'),
  (1, 'Karen',    'Orozco',      'korozco@hartwelllaw.com',           '+1-213-555-0102', 'Marketing Director',   'Champion',        'linkedin.com/in/karenorozco'),
  (2, 'James',    'Sterling',    'jsterling@sterlingdefense.com',     '+1-312-555-0201', 'Founding Partner',     'Decision Maker',  'linkedin.com/in/jamessterling'),
  (2, 'Priya',    'Desai',       'pdesai@sterlingdefense.com',        '+1-312-555-0202', 'Office Manager',       'Evaluator',       'linkedin.com/in/priyadesai'),
  (3, 'Linda',    'Baxter',      'lbaxter@baxterfamilylaw.com',       '+1-602-555-0301', 'Solo Practitioner',    'Decision Maker',  'linkedin.com/in/lindabaxter'),
  (4, 'Daniel',   'Caldwell',    'dcaldwell@caldwellimmigration.com', '+1-305-555-0401', 'Managing Attorney',    'Decision Maker',  'linkedin.com/in/danielcaldwell'),
  (4, 'Sofia',    'Reyes',       'sreyes@caldwellimmigration.com',    '+1-305-555-0402', 'Intake Coordinator',   'Champion',        'linkedin.com/in/sofiareyes'),
  (5, 'Angela',   'Rivera',      'arivera@riveranguyen.com',          '+1-415-555-0501', 'Senior Partner',       'Decision Maker',  'linkedin.com/in/angelarivera'),
  (6, 'Howard',   'Finch',       'hfinch@pinnacleestatelaw.com',      '+1-480-555-0601', 'Principal Attorney',   'Decision Maker',  'linkedin.com/in/howardfinch'),
  (7, 'Victoria', 'Blackstone',  'vblackstone@blackstoneinjury.com',  '+1-214-555-0701', 'Senior Partner',       'Decision Maker',  'linkedin.com/in/victoriablackstone'),
  (7, 'Ryan',     'Matsuda',     'rmatsuda@blackstoneinjury.com',     '+1-214-555-0702', 'Marketing Manager',    'Champion',        'linkedin.com/in/ryanmatsuda'),
  (8, 'Theodore', 'Garrison',    'tgarrison@garrisonpark.com',        '+1-212-555-0801', 'Name Partner',         'Decision Maker',  'linkedin.com/in/theodoregarrison'),
  (9, 'Marco',    'Torres',      'mtorres@torresdefense.com',         '+1-713-555-0901', 'Managing Partner',     'Decision Maker',  'linkedin.com/in/marcotorres'),
  (9, 'Alicia',   'Vega',        'avega@torresdefense.com',           '+1-713-555-0902', 'Business Development', 'Champion',        'linkedin.com/in/aliciavega'),
  (10,'Gregory',  'Owens',       'gowens@meridianbankruptcy.com',     '+1-404-555-1001', 'Principal',            'Decision Maker',  'linkedin.com/in/gregoryowens');

-- ────────────────────────────────────────────────────────────
-- 4. QUALIFICATION CHECKS (BANT)
-- ────────────────────────────────────────────────────────────
INSERT INTO qualification_checks (company_id, pain_and_value, timeline, budget_pricing_fit, person_in_position, qualified_at, qualified_by) VALUES
  (1, 'Website ranks page 5+ for "personal injury lawyer LA." Losing cases to competitors with stronger SEO. Estimates $300K+ in missed revenue yearly.', 'Want to see results within 90 days. Q2 launch target.', 'Approved $3,500/mo marketing budget. Open to $4K-$5K if ROI clear.', 'Managing Partner makes final call. Marketing Director is champion driving this internally.', now() - interval '10 days', 1),
  (2, 'No Google presence for "criminal defense attorney Chicago." All leads come from referrals — want to diversify. Competitors outranking them on every keyword.', 'Immediate start — losing leads weekly.', '$4,000/mo confirmed. Partner signed off.', 'Founding Partner is decision maker and very engaged. Wants weekly updates.', now() - interval '5 days', 1),
  (4, 'Website outdated, no blog, zero local SEO. Missing "immigration lawyer Miami" entirely. Intake team says 60% of callers found competitors online first.', 'Started 2 months ago — already a client.', '$3,000/mo retainer active. Upsell to $4,500 for PPC add-on.', 'Managing Attorney approves all marketing spend. Intake Coordinator tracks lead sources.', now() - interval '20 days', 2),
  (5, 'Large firm but digital presence is weak. No content strategy, blog dormant since 2023. Competitor firm ranking #1 for all target keywords in their market.', 'Within 60 days. Partners meeting end of month to decide.', 'Budget likely $5K-$7K/mo. Need to justify to partnership.', 'Senior Partner interested but needs buy-in from other partners.', NULL, NULL),
  (7, 'Strong brand offline but website underperforms. Only 200 organic visits/mo. Paid ads costing $15K/mo with poor conversion. Want to shift to organic.', 'Next quarter — want to reduce PPC spend by Q3.', '$6,000/mo approved. Want to reallocate from PPC budget.', 'Senior Partner authorized. Marketing Manager driving implementation.', now() - interval '15 days', 1),
  (9, 'New firm, 2 years old. Zero organic traffic. Relying entirely on paid ads at $8K/mo. Want sustainable lead gen.', 'ASAP — ad costs unsustainable.', '$3,500/mo confirmed. Can go to $4K if includes content.', 'Managing Partner is sole decision maker. BD lead is champion.', now() - interval '8 days', 1);

-- ────────────────────────────────────────────────────────────
-- 5. OPPORTUNITIES
-- ────────────────────────────────────────────────────────────
INSERT INTO opportunities (company_id, primary_contact_id, stage_id, opportunity_type, service_description, source, deal_value, forecast_category, expected_close_date, contract_value, contract_start_date, contract_end_date, closed_reason_id, closed_reason_notes, closed_at, owner_id) VALUES
  -- Active pipeline
  (1,  1,  3, 'New',     'Full SEO + local SEO package — keyword strategy, on-page optimization, GBP management, link building, monthly reporting',  'Inbound',  42000.00,  'Pipeline',   '2026-05-15', NULL, NULL, NULL, NULL, NULL, NULL, 1),
  (2,  3,  4, 'New',     'SEO retainer + content marketing — blog posts, practice area pages, local citations, review management',                    'Referral', 48000.00,  'Best Case',  '2026-04-01', NULL, NULL, NULL, NULL, NULL, NULL, 1),
  (3,  5,  1, 'New',     'Website SEO audit + local search optimization for solo family law practice',                                                'Outbound', 18000.00,  'Pipeline',   '2026-06-30', NULL, NULL, NULL, NULL, NULL, NULL, 3),
  (5,  8,  1, 'New',     'Enterprise SEO strategy — multi-location optimization, content hub, authority building for employment law',                  'Inbound',  84000.00,  'Pipeline',   '2026-07-15', NULL, NULL, NULL, NULL, NULL, NULL, 3),
  (9, 13,  3, 'New',     'SEO + PPC transition plan — organic growth strategy to reduce paid ad dependency, local SEO, content creation',             'Referral', 42000.00,  'Best Case',  '2026-05-30', NULL, NULL, NULL, NULL, NULL, NULL, 1),
  (6,  9,  1, 'New',     'Local SEO + content strategy for estate planning niche — blog, FAQ pages, Google Business Profile optimization',            'Outbound', 24000.00,  'Pipeline',   '2026-08-01', NULL, NULL, NULL, NULL, NULL, NULL, 4),
  (10, 15, 1, 'New',     'SEO foundation package — site audit, keyword research, on-page fixes, GBP setup for bankruptcy attorney',                   'Outbound', 21000.00,  'Pipeline',   '2026-09-01', NULL, NULL, NULL, NULL, NULL, NULL, 4),

  -- Won deals (stage 8 = Won)
  (4,  6,  8, 'New',     'Full SEO retainer — bilingual content, local SEO for 3 office locations, immigration-specific keyword strategy',            'Referral', 36000.00,  'Commit',     '2026-02-15', 36000.00, '2026-03-01', '2027-02-28', NULL, NULL, '2026-02-14 10:00:00+00', 2),
  (7, 10,  8, 'New',     'SEO + content marketing — practice area page overhaul, blog strategy, link building, PPC-to-organic transition plan',       'Inbound',  72000.00,  'Commit',     '2026-02-28', 72000.00, '2026-03-15', '2027-03-14', NULL, NULL, '2026-02-27 14:30:00+00', 1),

  -- Lost deal (stage 9 = Loss)
  (8, 12,  9, 'New',     'SEO and digital marketing overhaul for corporate law firm — full website redesign, content, local SEO',                     'Event',    60000.00,   NULL,         '2026-01-31', NULL, NULL, NULL, 1, 'Partners felt $5K/mo was too high. Went with cheaper freelancer. May revisit when results disappoint.', '2026-01-28 09:00:00+00', 2);

-- ────────────────────────────────────────────────────────────
-- 6. STAGE TRANSITIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO stage_transitions (opportunity_id, from_stage_id, to_stage_id, transitioned_by, notes, created_at) VALUES
  -- Opp 1 (Hartwell): Discovery → Demo/Audit → Evaluation
  (1, NULL, 1, 1, 'Discovery call with Michael. Firm gets zero leads from Google.', now() - interval '14 days'),
  (1, 1,    2, 1, 'Ran full SEO audit — showed competitor gap analysis and keyword opportunities', now() - interval '10 days'),
  (1, 2,    3, 1, 'Audit results shared. Karen reviewing with partners this week.', now() - interval '7 days'),

  -- Opp 2 (Sterling): Discovery → Demo/Audit → Evaluation → Proposal
  (2, NULL, 1, 1, 'Referral intro from Caldwell. James frustrated with lack of online leads.', now() - interval '21 days'),
  (2, 1,    2, 1, 'Walked through competitor rankings and content gap analysis for criminal defense keywords', now() - interval '16 days'),
  (2, 2,    3, 1, 'James impressed with audit. Wants proposal with content + SEO combined.', now() - interval '10 days'),
  (2, 3,    4, 1, 'Proposal sent — $4K/mo, 12-month retainer, SEO + content marketing', now() - interval '5 days'),

  -- Opp 3 (Baxter): Discovery
  (3, NULL, 1, 3, 'Cold outreach to Linda. Solo practitioner, no marketing budget history.', now() - interval '5 days'),

  -- Opp 5 (Torres): Discovery → Demo/Audit → Evaluation
  (5, NULL, 1, 1, 'Referral from local bar association event. Marco spending $8K/mo on ads.', now() - interval '12 days'),
  (5, 1,    2, 1, 'Showed organic vs paid cost comparison. Demonstrated ROI of SEO over 12 months.', now() - interval '8 days'),
  (5, 2,    3, 1, 'Marco and Alicia reviewing proposal internally. Very motivated to cut ad spend.', now() - interval '6 days'),

  -- Opp 8 (Caldwell — Won): Full cycle
  (8, NULL, 1, 2, 'Referral from immigration attorney network. Daniel has no web presence.', now() - interval '70 days'),
  (8, 1,    2, 2, 'Site audit presented — 47 technical issues, zero local citations, no GBP', now() - interval '60 days'),
  (8, 2,    3, 2, 'Daniel shared audit with partner. Both agreed they need help ASAP.', now() - interval '52 days'),
  (8, 3,    4, 2, 'Proposal: $3K/mo SEO retainer, bilingual content, 3 office locations', now() - interval '44 days'),
  (8, 4,    5, 2, 'Negotiating scope — want to add Spanish-language landing pages', now() - interval '36 days'),
  (8, 5,    6, 2, 'Contract drafted with 12-month term and 90-day performance review clause', now() - interval '28 days'),
  (8, 6,    7, 2, 'Daniel verbally committed — waiting on partner co-signature', now() - interval '20 days'),
  (8, 7,    8, 2, 'Contract signed! Onboarding starts March 1.', now() - interval '14 days'),

  -- Opp 9 (Blackstone — Won): Full cycle
  (9, NULL, 1, 1, 'Inbound inquiry — Victoria saw our case study on PI firm SEO', now() - interval '55 days'),
  (9, 1,    2, 1, 'Full audit: site has authority but terrible on-page SEO and no content strategy', now() - interval '45 days'),
  (9, 2,    3, 1, 'Ryan (marketing mgr) evaluating — comparing us vs current PPC agency', now() - interval '38 days'),
  (9, 3,    4, 1, 'Proposal: $6K/mo, SEO + content + PPC transition over 6 months', now() - interval '30 days'),
  (9, 4,    5, 1, 'Negotiating — want quarterly reviews and performance guarantees', now() - interval '22 days'),
  (9, 5,    6, 1, 'Contract under legal review by their in-house counsel', now() - interval '16 days'),
  (9, 6,    7, 1, 'Victoria gave verbal go-ahead. Ryan coordinating start date.', now() - interval '12 days'),
  (9, 7,    8, 1, 'Signed! 12-month engagement starting March 15.', now() - interval '10 days'),

  -- Opp 10 (Garrison — Lost): Discovery → Demo/Audit → Evaluation → Proposal → Loss
  (10, NULL, 1, 2, 'Met at legal tech conference. Theodore interested in SEO.', now() - interval '50 days'),
  (10, 1,    2, 2, 'Audit presented — firm has decent DA but zero local SEO or content', now() - interval '44 days'),
  (10, 2,    3, 2, 'Partners reviewing audit findings. Slow internal process.', now() - interval '40 days'),
  (10, 3,    4, 2, 'Proposal: $5K/mo full-service SEO + content for corporate law', now() - interval '35 days'),
  (10, 4,    9, 2, 'Lost — partners chose a freelancer at $1,500/mo. Price was primary concern.', now() - interval '30 days');

-- ────────────────────────────────────────────────────────────
-- 7. ACTIVITIES
-- ────────────────────────────────────────────────────────────
INSERT INTO activities (company_id, contact_id, related_opportunity_id, activity_type, notes, logged_by, activity_timestamp) VALUES
  -- Hartwell & Associates
  (1, 1, 1, 'Call',    'Discovery call with Michael. Firm ranks nowhere for "personal injury lawyer Los Angeles." All leads from billboards and TV.', 1, now() - interval '14 days'),
  (1, 2, 1, 'Email',   'Sent SEO audit report and competitor analysis to Karen. Highlighted 3 competitors outranking them.', 1, now() - interval '13 days'),
  (1, 1, 1, 'Meeting', 'Presented full audit findings to Michael and Karen. Showed keyword opportunity worth est. $50K/mo in traffic value.', 1, now() - interval '7 days'),
  (1, 2, 1, 'Email',   'Sent proposed keyword strategy and content calendar for review.', 1, now() - interval '6 days'),
  (1, 2, 1, 'Call',    'Karen confirmed partners are interested. Scheduling proposal review meeting for next week.', 1, now() - interval '2 days'),

  -- Sterling Defense Group
  (2, 3, 2, 'Call',    'Intro call via Caldwell referral. James says firm gets 90% of cases from referrals, wants online channel.', 1, now() - interval '21 days'),
  (2, 4, 2, 'Meeting', 'Audit walkthrough with Priya. Showed how competitor firms rank for "DUI lawyer Chicago" and "criminal defense attorney near me."', 1, now() - interval '14 days'),
  (2, 3, 2, 'Email',   'Sent proposal — $4K/mo retainer, 12 months: SEO, content (2 blogs/mo), local citations, review management.', 1, now() - interval '5 days'),
  (2, 3, 2, 'Call',    'James reviewing proposal with partner. Expects decision by Friday.', 1, now() - interval '1 day'),

  -- Baxter Family Law
  (3, 5, 3, 'Prospecting Touch', 'LinkedIn message to Linda — mentioned how solo family law attorneys are winning with local SEO.', 3, now() - interval '10 days'),
  (3, 5, 3, 'Call',    'Cold call — Linda interested but cautious. No marketing budget currently. Booked discovery call.', 3, now() - interval '7 days'),
  (3, 5, 3, 'Meeting', 'Discovery meeting. Linda gets 1-2 leads/mo from website. Showed her competitors getting 30+/mo with proper SEO.', 3, now() - interval '5 days'),

  -- Caldwell Immigration (Won)
  (4, 6, 8, 'Meeting', 'Final contract review with Daniel. Added Spanish-language content deliverables.', 2, now() - interval '16 days'),
  (4, 7, 8, 'Email',   'Sent signed contract and onboarding questionnaire to Sofia for intake data.', 2, now() - interval '14 days'),
  (4, 6, 8, 'Call',    'Kick-off call — reviewed GBP optimization plan and content calendar for 3 locations.', 2, now() - interval '10 days'),

  -- Rivera & Nguyen
  (5, 8, 4, 'Call',    'Initial call with Angela. Firm has 8 attorneys but only 200 organic visits/mo. Huge untapped potential.', 3, now() - interval '8 days'),
  (5, 8, 4, 'Email',   'Sent overview of our employment law SEO approach — case studies from similar-sized firms.', 3, now() - interval '7 days'),

  -- Pinnacle Estate Planning
  (6, 9, 6, 'Prospecting Touch', 'Cold email to Howard — "How estate planning attorneys are getting 5x more leads with local SEO."', 4, now() - interval '12 days'),
  (6, 9, 6, 'Call',    'Intro call. Howard says he gets most clients from financial advisor referrals. Open to exploring online leads.', 4, now() - interval '10 days'),

  -- Blackstone Injury Lawyers (Won)
  (7, 10, 9, 'Meeting', 'Contract signing with Victoria. Reviewed 12-month roadmap and KPIs.', 1, now() - interval '10 days'),
  (7, 11, 9, 'Call',    'Onboarding call with Ryan — coordinating website access, GBP credentials, analytics setup.', 1, now() - interval '5 days'),
  (7, 10, 9, 'Email',   'Sent Month 1 deliverables timeline: technical audit fixes, initial keyword mapping, content calendar.', 1, now() - interval '1 day'),

  -- Garrison & Park (Lost)
  (8, 12, 10, 'Email',  'Post-loss follow-up. Theodore mentioned they went with a freelancer. Offered to reconnect in 6 months if results underperform.', 2, now() - interval '30 days'),

  -- Torres Criminal Defense
  (9, 13, 5, 'Call',    'Referral follow-up. Marco spending $8K/mo on Google Ads with poor ROI. Wants sustainable alternative.', 1, now() - interval '12 days'),
  (9, 14, 5, 'Meeting', 'Audit presentation with Alicia. Showed organic vs paid cost analysis — SEO would save $50K+/yr at scale.', 1, now() - interval '8 days'),
  (9, 13, 5, 'Call',    'Marco confirmed budget. Wants proposal that includes PPC wind-down plan over 6 months.', 1, now() - interval '4 days'),

  -- Meridian Bankruptcy Law
  (10, 15, 7, 'Prospecting Touch', 'LinkedIn outreach to Gregory — shared article on SEO for bankruptcy attorneys.', 4, now() - interval '16 days'),
  (10, 15, 7, 'Call',   'First call — Gregory interested in getting found for "bankruptcy lawyer Atlanta." Currently invisible online.', 4, now() - interval '14 days');

-- ────────────────────────────────────────────────────────────
-- 8. INACTIVITY FLAGS
-- ────────────────────────────────────────────────────────────
INSERT INTO inactivity_flags (company_id, related_opportunity_id, flag_type, flagged_at, resolved_at, resolved_by) VALUES
  (6,  6, 'no_activity',      now() - interval '3 days', NULL, NULL),
  (10, 7, 'no_activity',      now() - interval '5 days', NULL, NULL),
  (5,  4, 'no_activity',      now() - interval '2 days', now() - interval '1 day', 3),
  (3,  3, 'stage_stale',      now() - interval '1 day',  NULL, NULL);

-- ────────────────────────────────────────────────────────────
-- 9. INVITATIONS (sent by exec)
-- ────────────────────────────────────────────────────────────
INSERT INTO invitations (email, role, invited_by, accepted_at) VALUES
  ('nate@primelive.ai',  'admin', 1, now() - interval '25 days'),
  ('ginny@primelive.ai', 'rep',   1, now() - interval '20 days'),
  ('evan@primelive.ai',  'rep',   1, now() - interval '18 days');
