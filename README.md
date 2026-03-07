# Sales OS CRM

A firm-centric sales CRM built with React, TypeScript, and Tailwind CSS. Designed for Vercel deployment with a Supabase backend.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4, Attio-inspired design
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Backend:** Supabase (Auth + PostgreSQL)
- **Hosting:** Vercel (SPA with rewrites)

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL (e.g. `https://your-project-ref.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous/public API key |

### Where to find these values

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings > API**
4. Copy the **Project URL** and **anon/public** key

### Vercel deployment

When deploying to Vercel, add both environment variables in your project's **Settings > Environment Variables** panel.

## Database Setup

Run the SQL from `Sales OS schema.sql` against your Supabase project to create all required tables, views, triggers, and seed data (sales stages, loss reasons).

The schema creates:
- **10 tables:** users, companies, contacts, qualification_checks, sales_stages, loss_reasons, opportunities, stage_transitions, activities, inactivity_flags
- **4 views:** v_pipeline_by_stage, v_activity_leaderboard, v_at_risk_deals, v_sales_cycle
- **3 triggers:** auto-update last_activity_at, auto-set qualified_at, auto-flip company status on Closed Won

### Supabase Auth

The app uses Supabase Auth with email/password. After a user signs up via the login screen, you need a matching row in the `users` table with the same email for the app to associate the auth session with an internal user record.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Output goes to `dist/`, which Vercel serves automatically.

## Architecture

This is a **firm-centric** CRM:

- **Company** is the primary entity — all activities, qualifications, and opportunities roll up to the firm
- **Contacts** are reference data linked to companies (no per-contact pipelines)
- **BANT Qualification** is per-company, not per-contact
- **Pre-deal stages** (Lead, Sales Working Lead) are tracked on `companies.lead_status`
- **Deal stages** (Opportunity, Evaluation, Commit, Closed Won, Closed Lost) are tracked on `opportunities.stage_id`
- Opportunities cannot be created until qualification is complete

## Navigation

- **Business Metrics** — Dashboard with pipeline charts, funnel, KPIs, at-risk deals
- **Activities** — Global activity feed with search and type filter
- **Risk Flags** — Inactivity and deal aging alerts
- **Companies** — Company list with status, lead status, industry
- **People** — Contact directory
- **Deals** — Kanban pipeline board with drag-and-drop
- **Settings** — Sales stage definitions, BANT criteria, loss reasons
