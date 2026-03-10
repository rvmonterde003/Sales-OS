# Sales OS

A firm-centric sales CRM built for law firm SEO/marketing agencies. Track leads from first touch through closed deal with qualification workflows, pipeline management, and revenue analytics.

**Live:** https://sales-os-eight.vercel.app

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Attio-inspired design)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Backend:** Supabase (Auth + PostgreSQL)
- **Hosting:** Vercel (SPA with rewrites)

## Role System

| Role | Access |
|------|--------|
| **exec** | Super admin. Only one. Cannot be demoted or deleted. Full access to everything including user management. |
| **admin** | Can manage reps (change role, remove). Cannot change other admins or exec. |
| **rep** | Can only see/edit their own data (companies they own). |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/rvmonterde003/Sales-OS.git
cd Sales-OS
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your [Supabase Dashboard](https://supabase.com/dashboard) under **Settings > API**.

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`.

---

## Database Setup (Supabase)

All SQL files are in the `sql/` directory.

### Fresh setup (new project)

1. Go to **Supabase Dashboard > SQL Editor**
2. Paste and run `sql/full-migration.sql`
3. (Optional) Paste and run `sql/mock-data.sql` to load sample data

### What the migration creates

**11 tables:**
- `users` — app-level user records (separate from Supabase auth.users)
- `invitations` — invite-only signup tokens
- `companies` — law firms / prospects
- `contacts` — people at companies
- `qualification_checks` — BANT qualification per company
- `sales_stages` — configurable pipeline stages
- `loss_reasons` — configurable loss reasons
- `opportunities` — deals linked to companies
- `stage_transitions` — audit trail of stage changes
- `activities` — calls, emails, meetings, notes, prospecting touches
- `inactivity_flags` — automated risk alerts

**4 views:**
- `v_pipeline_by_stage` — deal count and value per stage
- `v_activity_leaderboard` — activity counts per rep
- `v_at_risk_deals` — deals past expected close or aging >90 days
- `v_sales_cycle` — won deal cycle time analysis

**9 sales stages (in order):**
1. Discovery
2. Demonstration/Audit
3. Evaluation
4. Proposal
5. Negotiation
6. Contract
7. Verbal
8. Won
9. Loss

### Adding the first user (exec)

The very first user must be bootstrapped manually:

**Step 1 — Create auth user:**
1. Supabase Dashboard > **Authentication > Users > Add user**
2. Enter email + password
3. Check **Auto Confirm User**
4. Click **Create user**

**Step 2 — Insert matching app user:**
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('your-email@example.com', '', 'First', 'Last', 'exec', true);
```

All subsequent users should be invited through the app.

---

## Dropping Tables (Full Reset)

If you need to completely wipe and rebuild the database, run this in SQL Editor:

```sql
-- Drop all views first
DROP VIEW IF EXISTS v_sales_cycle, v_at_risk_deals, v_activity_leaderboard, v_pipeline_by_stage;

-- Drop all tables
DROP TABLE IF EXISTS
  inactivity_flags,
  activities,
  stage_transitions,
  opportunities,
  qualification_checks,
  contacts,
  companies,
  invitations,
  loss_reasons,
  sales_stages,
  users
CASCADE;
```

Then re-run `sql/full-migration.sql` and optionally `sql/mock-data.sql`.

## Truncating Data (Keep Tables)

If you want to keep the table structure but wipe all data and reset auto-increment IDs:

```sql
TRUNCATE
  inactivity_flags,
  activities,
  stage_transitions,
  opportunities,
  qualification_checks,
  contacts,
  companies,
  invitations,
  users,
  loss_reasons,
  sales_stages
RESTART IDENTITY CASCADE;
```

After truncating, re-run the seed data sections of `sql/full-migration.sql` (sections 3 and 4: sales stages and loss reasons) since those get wiped too.

---

## Vercel Deployment

### 1. Import project

- Go to [vercel.com](https://vercel.com) > **Add New Project**
- Import from GitHub: `rvmonterde003/Sales-OS`
- Framework preset: **Vite**

### 2. Environment variables

Add these in Vercel **Settings > Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### 3. Build settings

These should auto-detect, but verify:

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4. SPA routing

The `vercel.json` in the repo already handles SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

No additional configuration needed.

---

## Supabase Auth Settings

Configure these in your Supabase Dashboard:

### URL Configuration
**Authentication > URL Configuration:**
- **Site URL:** `https://sales-os-eight.vercel.app`
- **Redirect URLs:**
  - `https://sales-os-eight.vercel.app`
  - `https://sales-os-eight.vercel.app/**`

### Email Templates
**Authentication > Email Templates:**
- **Reset Password:** paste HTML from `emails/forgot-password.html`
- **Invite User:** paste HTML from `emails/invite.html`

### Providers
**Authentication > Providers > Email:**
- Enable "Confirm email" (default)
- Enable "Secure email change"

> **Important:** Setting the Site URL is what prevents invite/reset emails from linking to `localhost:3000` instead of your production domain.

---

## Architecture

This is a **firm-centric** CRM:

- **Company** is the primary entity — all activities, qualifications, and opportunities roll up to the firm
- **Contacts** are reference data linked to companies (no per-contact pipelines)
- **BANT Qualification** is per-company, not per-contact
- **Pre-deal stages** (MQL > SQL > Qualified) are tracked on `companies.lead_status`
- **Deal stages** (Discovery through Won/Loss) are tracked on `opportunities.stage_id`
- Opportunities cannot be created until qualification is complete
- Stage advancement requires logging an activity first

## Navigation

- **Business Metrics** — Dashboard with pipeline charts, funnel, KPIs, tracker
- **Activities** — Global activity feed with search and type filter
- **Risk Flags** — Inactivity and deal aging alerts
- **Companies** — Company list with status, lead status, industry
- **People** — Contact directory
- **Deals** — Kanban pipeline board with drag-and-drop
- **Revenue** — Won deal revenue timeline and team breakdown
- **Profile** — User management, invitations, role assignment

## Mock Data

The `sql/mock-data.sql` file contains sample data for 10 law firms across various practice areas (Personal Injury, Criminal Defense, Family Law, Immigration, Employment Law, Estate Planning, Corporate Law, Bankruptcy) with realistic SEO/marketing service descriptions, contacts, qualification checks, opportunities at various pipeline stages, stage transitions, and activity logs.

To load: run `sql/mock-data.sql` in Supabase SQL Editor after `sql/full-migration.sql`.

A human-readable CSV version is also available at `sql/mock-data.csv`.
