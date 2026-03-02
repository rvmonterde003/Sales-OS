# Sales Operating System — Architecture Flow

## Data Flow (Top → Bottom)

### 1. Data Ingestion
```
External Sources
  ├── Website (WordPress) → Google Analytics → Website Visitors
  ├── Gmail → Inbound Leads / Email Activities
  ├── Calendly → Meeting Activities
  ├── Grain (Zoom) → Call Recordings linked to Activities
  ├── Stripe → Contract Values (Closed Won)
  ├── Beehive → Newsletter Subscribers → Lead Source
  └── Slack / Notion → Internal Signals (referenced, not managed)
```

### 2. Operational CRM (Write Layer — Source of Truth)
```
Inbound Data
  │
  ▼
┌─────────────────────────────────────────────────┐
│  COMPANIES (Accounts)                           │
│  → Law firms, prospects, customers              │
│  → Status: Prospect | Customer | Former         │
└──────────────────┬──────────────────────────────┘
                   │ 1:Many
                   ▼
┌─────────────────────────────────────────────────┐
│  CONTACTS                                       │
│  → People at companies                          │
│  → Type: Lead | Customer | Other                │
│  → last_activity_at (derived from Activities)   │
└──────────────────┬──────────────────────────────┘
                   │ 1:Many
                   ▼
┌─────────────────────────────────────────────────┐
│  ACTIVITIES (Immutable Log)                     │
│  → Call | Email | Meeting | Note | Prospecting  │
│  → Linked to Contact OR Opportunity             │
│  → Drives stage progression eligibility         │
└──────────────────┬──────────────────────────────┘
                   │ Feeds
                   ▼
┌─────────────────────────────────────────────────┐
│  OPPORTUNITIES (Deals)                          │
│  → Created ONLY at Stage 3 (Qualified)          │
│  → Type: New | Upsell | Renewal | Pilot         │
│  → Forecast: Pipeline | Best Case | Commit      │
│  → deal_age, stage_duration (derived)           │
└─────────────────────────────────────────────────┘
```

### 3. Sales Stage Enforcement (Gated Progression)
```
Stage 1: Lead
  │  Gate: ≥1 activity logged + qualification scheduled
  ▼
Stage 2: Sales Working Lead (SWL)
  │  Gate: BANT qualified (Budget, Authority, Need, Timing)
  │  Rule: Inactivity flags triggered at intervals
  ▼
Stage 3: Opportunity (Qualified) ← Opportunity record CREATED here
  │  Gate: Qualification checklist complete + meeting held
  │  Rule: Expected close date required, deal age tracking starts
  ▼
Stage 4: Evaluation / Demo / Proposal
  │  Gate: Demo, audit, or proposal delivered
  │  Rule: Forecast category required, AOV required, stage aging monitored
  ▼
Stage 5: Commit
  │  Gate: Verbal commitment received
  │  Rule: Close date within expected range, heightened dashboard visibility
  ▼
Stage 6: Closed Won / Closed Lost
  │  Won: Contract value + start date + end date required
  │  Lost: Loss reason (from standardized list) required
  ▼
  END
```

### 4. Analytics & Dashboard Layer (Read Layer — Computed Only)
```
Operational CRM Data
  │
  ▼
┌─────────────────────────────────────────────────┐
│  DERIVED METRICS (zero manual entry)            │
│                                                 │
│  Funnel:                                        │
│    Website Visitors → MQLs → SQLs →             │
│    Opportunities → Wins/Losses                  │
│                                                 │
│  Pipeline:                                      │
│    Pipeline Value by Stage                      │
│    Pipeline Coverage vs Targets                 │
│                                                 │
│  Performance:                                   │
│    Average Order Value (AOV)                    │
│    Sales Cycle Length                            │
│    Activity vs Outcome Correlation              │
│    Funnel Conversion Rates                      │
│                                                 │
│  Risk:                                          │
│    Stale Deals (aging > threshold)              │
│    Inactive Contacts (no recent activity)       │
│    Commit Deals Past Expected Close             │
└─────────────────────────────────────────────────┘
```

### 5. Sales Knowledge Layer (Embedded)
```
Embedded directly into CRM UI at decision points:
  → Stage definitions visible on stage transition
  → Qualification criteria shown during BANT check
  → ICP logic displayed during lead scoring
  → Required-field rules enforced inline
```

### 6. Integration Map (n8n as orchestrator)
```
n8n Workflow Engine
  │
  ├── WordPress → Lead Capture → CRM (Company + Contact)
  ├── Google Analytics → Visitor Metrics → Dashboard
  ├── Gmail → Email Activity Logging → CRM
  ├── Calendly → Meeting Activity Logging → CRM
  ├── Grain → Call Recording Links → Activity Notes
  ├── Stripe → Payment Events → Closed Won Updates
  ├── Beehive → Subscriber Events → Lead Source Tagging
  ├── Slack → Notifications (deal stage changes, inactivity alerts)
  ├── Loom → Video Links → Activity Notes
  └── Claude API → AI Enrichment (summaries, next-step suggestions)
```

## Execution Flow Summary

```
Lead enters system
  → Activity logged against Contact
  → Stage gates enforced on progression
  → Opportunity created only after qualification
  → Deal tracked through Evaluation → Commit → Close
  → All metrics derived automatically
  → Dashboards reflect real-time truth
  → Alerts surface risk (inactivity, aging, slippage)
```
