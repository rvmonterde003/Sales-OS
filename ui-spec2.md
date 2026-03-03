# Sales Operating System — UI Specification

> Every screen maps directly to the SQL schema. No orphan UI. No manual data.

---

## Screen 1: Companies List

**Source:** `companies` table

| Column         | SQL Field       | Behavior                          |
|---------------|-----------------|-----------------------------------|
| Company Name  | `name`          | Click → Company Detail            |
| Industry      | `industry`      | Filter dropdown                   |
| Firm Size     | `firm_size`     | Filter dropdown                   |
| Status        | `status`        | Color badge: Prospect / Customer / Former |
| Contacts      | COUNT from `contacts` | Derived count                |
| Open Deals    | COUNT from `opportunities` WHERE not closed | Derived |
| Last Activity | MAX(`activities.timestamp`) via contacts | Derived    |
| Owner         | `owner`         | Filter dropdown                   |

**Actions:** Add Company, Edit, Archive

---

## Screen 2: Company Detail

**Source:** `companies` + related `contacts`, `opportunities`, `activities`

**Sections (top → bottom):**

1. **Header** — Company name, status badge, industry, website, firm size
2. **Pipeline Status** — From `opportunities WHERE company_id = ? AND stage NOT IN ('Closed Won', 'Closed Lost')`
   - For each open opportunity: horizontal stage progress bar (same component as Screen 6)
   - Shows: deal value, current stage highlighted, expected close date, deal age
   - Each bar clickable → Opportunity Detail
   - If zero open deals: display "No active opportunities" with visual prompt
   - If multiple open deals: stacked vertically, ordered by expected close date
3. **Contacts Panel** — Table from `contacts WHERE company_id = ?`
   - Name, title, email, phone, contact_type, last_activity_at
   - Click → Contact Detail
4. **Opportunities Panel** — Table from `opportunities WHERE company_id = ?`
   - Stage, deal value, forecast category, expected close date, deal age
   - Click → Opportunity Detail
5. **Activity Timeline** — From `activities` joined through contacts/opportunities
   - Chronological feed: type icon, owner, timestamp, notes
6. **Add Activity Button** — Opens activity log form

---

## Screen 3: Contacts List

**Source:** `contacts` table

| Column          | SQL Field          | Behavior                       |
|----------------|--------------------|---------------------------------|
| Name           | `first_name + last_name` | Click → Contact Detail    |
| Company        | JOIN `companies.name` | Click → Company Detail       |
| Title          | `title`            | Display                        |
| Type           | `contact_type`     | Badge: Lead / Customer / Other |
| Last Activity  | `last_activity_at` | Red if > 7 days ago            |
| Source         | `source`           | Filter dropdown                |

**Actions:** Add Contact, Bulk Import

---

## Screen 4: Contact Detail

**Source:** `contacts` + `qualification_checks` + `activities` + `opportunities`

**Sections (top → bottom):**

1. **Header** — Name, title, company (linked), email, phone, contact type
2. **Current Stage** — Derived from `opportunities` and `qualification_checks`
   - If contact is primary on an open opportunity: show stage progress bar (same component as Screen 6), clickable to Opportunity Detail
   - If no opportunity exists: show pre-opportunity status derived from activity count and qualification completion
     - No activities logged → "Lead (Unworked)"
     - Activities logged, BANT incomplete → "Sales Working Lead" with qualification progress shown
     - BANT complete, no opportunity created yet → "Ready to Qualify" (action prompt to create opportunity)
   - Source: `opportunities WHERE primary_contact_id = ? AND stage NOT IN ('Closed Won', 'Closed Lost')` + `qualification_checks WHERE contact_id = ?`
3. **Qualification Card** — From `qualification_checks WHERE contact_id = ?`
   - Four checkboxes: Budget ☐ Authority ☐ Need ☐ Timing ☐
   - Qualified timestamp shown when all four = TRUE
   - Visual: green bar fills as checks complete
4. **Activity Timeline** — From `activities WHERE related_object_id = contact.id`
5. **Linked Opportunities** — From `opportunities WHERE primary_contact_id = ?`
6. **Log Activity Button**

---

## Screen 5: Pipeline Board (Kanban)

**Source:** `opportunities` JOIN `sales_stages`

**Layout:** Columns = `sales_stages` ordered by `stage_order`

Each card shows:
- Company name (from `companies`)
- Deal value (`deal_value`)
- Expected close date (`expected_close_date`)
- Deal age (`deal_age_days`) — red if > threshold
- Owner
- Forecast category badge

**Drag behavior:** Dragging a card to the next column triggers stage transition validation:
- System checks `sales_stages.required_fields` for target stage
- If missing fields → modal popup to complete them
- On success → write to `stage_transitions` log
- On fail → card snaps back, error shown

**Filters:** Owner, Forecast Category, Expected Close Date range

---

## Screen 6: Opportunity Detail

**Source:** `opportunities` + `stage_transitions` + `activities` + `qualification_checks`

**Sections (top → bottom):**

1. **Header** — Company, primary contact, stage badge, deal value, forecast category
2. **Stage Progress Bar** — Visual from `sales_stages`, current stage highlighted
3. **Key Fields Panel**
   - Opportunity type, source, expected close date
   - Contract dates (shown only at Closed Won)
   - Closed reason (shown only at Closed Lost)
4. **Stage Transition History** — From `stage_transitions WHERE opportunity_id = ?`
   - Table: from → to, transitioned_by, timestamp, notes
5. **Activity Timeline** — From `activities WHERE related_object_id = opp.id`
6. **Qualification Summary** — Read-only view from `qualification_checks`
7. **Risk Flags** — From `inactivity_flags WHERE related_object_id = opp.id`
   - Active flags shown as red banners at top of screen

**Actions:** Log Activity, Advance Stage, Mark Won, Mark Lost

---

## Screen 7: Activity Log Form (Modal)

**Source:** Writes to `activities` table

| Field               | SQL Field              | Input Type          |
|--------------------|------------------------|---------------------|
| Activity Type      | `activity_type`        | Dropdown: Call / Email / Meeting / Note / Prospecting Touch |
| Related To         | `related_object_type` + `related_object_id` | Search picker (Contact or Opportunity) |
| Owner              | `owner`                | Auto-filled, editable |
| Notes              | `notes`                | Text area           |
| Timestamp          | `timestamp`            | Datetime picker, defaults to now |

**On save:**
- Record inserted into `activities` (immutable)
- `contacts.last_activity_at` updated via trigger
- Stage progression eligibility recalculated

---

## Screen 8: Dashboard — Executive View

**Source:** SQL Views (read-only, zero manual entry)

### Row 1: Funnel Metrics
**View:** `v_funnel_conversions`
- Cards: Total Leads → SQLs → Opportunities → Wins → Losses
- Conversion percentages between each step

### Row 2: Pipeline Summary
**View:** `v_pipeline_by_stage`
- Horizontal bar chart: deal count and total value per stage
- Table below: stage name, deal count, total value, avg deal value, avg age

### Row 3: Performance
**View:** `v_sales_cycle` + `v_activity_leaderboard`
- Left: Average sales cycle length (trend line over time)
- Right: Activity leaderboard — calls, emails, meetings per rep

### Row 4: Risk
**View:** `v_at_risk_deals`
- Table: deal name, value, stage, days in stage, last activity, owner
- Red rows: past expected close date
- Orange rows: > 14 days in current stage

**Filters:** Date range, Owner, Forecast Category

---

## Screen 9: Inactivity & Risk Flags

**Source:** `inactivity_flags` table

| Column           | SQL Field              | Behavior                    |
|-----------------|------------------------|-----------------------------|
| Record          | `related_object_type` + link | Click → Contact or Opp Detail |
| Flag Type       | `flag_type`            | Badge                       |
| Flagged At      | `flagged_at`           | Timestamp                   |
| Status          | `resolved_at`          | Open (red) / Resolved (green) |
| Resolved By     | `resolved_by`          | Display                     |

**Actions:** Resolve flag (sets `resolved_at` + `resolved_by`)

---

## Screen 10: Settings — Sales Knowledge (Admin)

**Source:** `sales_stages` table

Editable table:
- Stage name, definition, entry criteria, exit criteria, required fields (JSON editor)
- ICP definitions (stored as system config or separate reference table)
- Qualification criteria descriptions
- Standardized loss reason list

**Access:** Admin only. Changes propagate immediately to enforcement logic.

---

## Navigation Structure

```
Sidebar
  ├── Dashboard (Screen 8)
  ├── Pipeline Board (Screen 5)
  ├── Companies (Screen 1)
  ├── Contacts (Screen 3)
  ├── Risk Flags (Screen 9)
  └── Settings (Screen 10, admin only)
```

## UI Principles

- Every field maps to a SQL column or derived view
- No freeform data entry outside defined fields
- Stage transitions are gated — UI enforces the schema constraints
- Dashboards are read-only — no editable metric fields
- Activity is always logged, never assumed
- Risk surfaces automatically — no one has to go looking for problems
