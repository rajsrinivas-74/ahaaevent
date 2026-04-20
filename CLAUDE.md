# CLAUDE.md — Ahaa Event Hub

AI Orchestrator · Proprietary · AI Orchestration Labs Private Limited

---

## What This Product Is

**Ahaa Event Hub** is a standalone organizer-side event setup tool. It lets event organizers (college fests, accelerators, corporate innovation teams) create a fully branded, shareable event page with a custom submission form — in minutes.

This product covers only the **organizer setup layer**. Participant registration, judging, scoring, and leaderboard are handled by Ahaa Hub (Phase 1 integration) and are explicitly out of scope here.

**Submission for:** Gen AI Training Certification (standalone), eventually merges into Ahaa Hub as the Events module.

---

## What This Product Does

```
Organiser creates account
        ↓
Creates event (type · timezone · venue · join code)
        ↓
Brands the event (logo · colors · font · banner · live preview)
        ↓
Builds custom submission form (drag-drop · sections · field types)
        ↓
Adds FAQ
        ↓
Previews + publishes → shareable public event page goes live
```

---

## Scope — In / Out

| Module | Status |
|---|---|
| Organiser auth + profile (with social links) | ✅ In |
| Event creation (all types, timezone, venue, meeting link) | ✅ In |
| Event branding per event (logo, colors, font, banner, live preview) | ✅ In |
| Custom submission form builder (drag-drop, sections, field types) | ✅ In |
| FAQ editor | ✅ In |
| Branded public event page (SEO, countdown, FAQ, visitor + registration count) | ✅ In |
| AI assist (refine description, suggest tagline) | ✅ In |
| Participant registration + login + submission | ❌ Out — Ahaa Hub |
| Judge portal | ❌ Out — Ahaa Hub Phase 1 |
| Scoring + leaderboard | ❌ Out — Ahaa Hub Phase 1 |
| Email notifications | ❌ Out — Phase 2 |
| Custom domain | ❌ Out — Phase 2 |
| Payment / ticketing | ❌ Out — Phase 2 |

---

## Screen List

| Screen | Route | Purpose |
|---|---|---|
| Landing page | `/` | Product marketing + signup CTA |
| Organiser signup | `/auth/signup` | Create account |
| Organiser login | `/auth/login` | Login |
| Organiser dashboard | `/dashboard` | All events — Draft · Live · Ended |
| Create event | `/events/new` | Step 1 — event details |
| Edit event details | `/events/[id]/edit` | Edit core details |
| Branding editor | `/events/[id]/branding` | Logo · colors · font · banner · live preview |
| Form builder | `/events/[id]/form` | Drag-drop custom submission form |
| FAQ editor | `/events/[id]/faq` | Add/edit FAQ pairs |
| Event preview | `/events/[id]/preview` | Full branded page preview before publish |
| Publish / settings | `/events/[id]/settings` | Join code · max participants · status toggle |
| Public event page | `/e/[join-code]` | Branded page — countdown · FAQ · register CTA |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React · TypeScript · Tailwind CSS |
| Database | Supabase (schema: `eventmanager`) |
| Auth | Supabase Auth — email + password |
| AI | OpenRouter API — model-agnostic via `OPENROUTER_MODEL` env var |
| File storage | Supabase Storage — logo + banner uploads |
| Deployment | Vercel (dev) · Docker (production) |
| Repo | Separate GitHub repo |

---

## AI Layer Rules

- AI calls use OpenRouter — **never** import Anthropic SDK directly in this project.
- Model is configured via `OPENROUTER_MODEL` env var. Default fallback: `openai/gpt-4o-mini`.
- All AI calls are server-side only (API routes). Never call AI from client components.
- System prompts live in `lib/ai/prompts.ts`. Add new prompts there, not inline.
- AI assist scope: refine event description, suggest tagline. Nothing else in Phase 1.

---

## Database Schema

All tables live in the `eventmanager` Postgres schema inside the shared Supabase project.

```sql
-- Organiser accounts
organisers
  id, email, name, organisation
  website, linkedin, twitter, instagram
  created_at

-- Events
events
  id, organiser_id
  name, type, theme, description, tagline
  start_date, end_date, timezone, venue_type
  meeting_link, max_participants
  join_code, join_code_mode (auto | custom)
  status (draft | live | closed), expires_at
  visitor_count (page hits), registration_count (webhook from Ahaa Hub)
  created_at, updated_at

-- Per-event branding
event_branding
  id, event_id
  logo_url, banner_url
  primary_color, background_color, accent_color
  font_preset
  created_at, updated_at

-- Form sections (grouping)
form_sections
  id, event_id, title, order

-- Form fields
form_fields
  id, event_id, section_id
  label, type (short_text | long_text | dropdown | radio | checkbox | file)
  helper_text, required, char_limit, options (jsonb)
  order

-- FAQ
event_faq
  id, event_id, question, answer, order
```

**Rules:**
- `join_code` must be unique across the `events` table.
- `visitor_count` increments on every public page load (server action or API route — not client-side).
- `registration_count` increments via webhook/API call from Ahaa Hub when a participant registers.
- Do not modify schema without updating `lib/types.ts` to match.
- RLS enabled. Server-side calls use server Supabase client; client-side calls use browser client.

---

## Form Builder — Field Types

| Type | Notes |
|---|---|
| `short_text` | Single line, optional char limit |
| `long_text` | Textarea, optional char limit |
| `dropdown` | Options stored as `jsonb` array |
| `radio` | Options stored as `jsonb` array |
| `checkbox` | Multi-select, options stored as `jsonb` array |
| `file` | Upload via Supabase Storage, allowed types configurable |

---

## Join Code Rules

- Mode toggle per event: `auto` (system generates 6-char alphanumeric) or `custom` (organizer types their own).
- Uniqueness validated on save — error shown inline if taken.
- Join code is the URL key for the public event page: `/e/[join-code]`.

---

## Public Event Page Rules

- Two counters displayed: 👁 **Visitors** (page load hits) · ✅ **Registrations** (confirmed via Ahaa Hub webhook).
- Countdown timer to event start date.
- FAQ section rendered from `event_faq` table.
- Full branding applied: logo, colors, font, banner.
- SEO: `<title>` and `<meta description>` from event name + tagline.
- Register CTA links out to Ahaa Hub participant flow (URL configurable via env: `AHAA_HUB_URL`).

---

## 4-Week Build Plan

| Week | Focus | Deliverable |
|---|---|---|
| Week 1 | Auth + Event creation + DB schema | Organiser can sign up, create and manage events |
| Week 2 | Branding editor + live preview + file uploads | Branded event page renders with organiser's assets |
| Week 3 | Form builder (drag-drop + sections + field types) + FAQ editor | Full form builder working |
| Week 4 | Public event page + AI assist + Docker + polish | Shareable branded page live, ready for Ahaa Hub merge |

---

## Project Structure (target)

```
app/
  (app)/
    dashboard/          ← organiser dashboard
    events/
      new/              ← create event
      [id]/
        edit/           ← edit core details
        branding/       ← branding editor
        form/           ← form builder
        faq/            ← FAQ editor
        preview/        ← full page preview
        settings/       ← publish + join code + status
  auth/
    login/
    signup/
  e/[join-code]/        ← public event page (no auth)
  api/
    events/             ← CRUD
    branding/           ← upload + save branding
    form/               ← form section + field CRUD
    faq/                ← FAQ CRUD
    ai/                 ← refine description, suggest tagline
    public/             ← visitor count increment, registration webhook

components/
lib/
  ai/
    client.ts           ← OpenRouter wrapper
    prompts.ts          ← all AI system prompts
  supabase/
    client.ts
    server.ts
  types.ts
```

---

## Code Rules

- TypeScript strict mode on. Zero `any` unless unavoidable and explicitly commented.
- Tailwind only — no inline styles, no CSS modules.
- Dark theme default. Use CSS variables, not hardcoded colors.
- All new components go in `components/`. Pages are thin orchestrators.
- No comments describing what code does. Only comment non-obvious WHY.
- No error handling for impossible cases. Validate only at API route boundaries.
- No feature flags or stubs for out-of-scope phases.

---

## What NOT to Build (without explicit instruction)

- Participant registration or login
- Judge portal or scoring
- Leaderboard
- Email notifications
- Custom domain / CNAME
- Payment or ticketing
- AI screening or pre-reads (that's Ahaa Hub's job)
- Analytics dashboard beyond visitor + registration counts
