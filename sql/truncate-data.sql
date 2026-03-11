-- ================================================================
-- TRUNCATE ALL DATA (except users, sales_stages, loss_reasons)
-- Run this BEFORE inserting new mock data.
-- ================================================================

TRUNCATE TABLE
  inactivity_flags,
  stage_transitions,
  activities,
  opportunities,
  qualification_checks,
  contacts,
  companies,
  invitations
RESTART IDENTITY CASCADE;
