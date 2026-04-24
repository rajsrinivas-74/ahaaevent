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
| Organiser auth + profile (with social links) | ✅ Built |
| Event creation (all types, timezone, venue, meeting link) | ✅ Built |
| Event overview page per event | ✅ Built |
| Event branding (logo, colors, font, banner, live preview) | ✅ Built |
| Real file upload to Supabase Storage (`event-assets` bucket) | ✅ Built |
| Custom submission form builder (drag-drop, sections, field types) | ✅ Built |
| FAQ editor | ✅ Built |
| Branded public event page (SEO, OG image, countdown, FAQ, visitor + registration count) | ✅ Built |
| AI assist (refine description, suggest tagline, suggest colour palette, generate event) | ✅ Built |
| Clone event | ✅ Built |
| Archive event (styled modal, no window.confirm) | ✅ Built |
| Registration webhook from Ahaa Hub | ✅ Built |
| Mobile-responsive layout (hamburger drawer, touch targets, iOS zoom fix) | ✅ Built |
| Toast notification system | ✅ Built |
| Skeleton loading states | ✅ Built |
| OG share card (dynamic, edge runtime) | ✅ Built |
| Participant registration + login + submission | ❌ Out — Ahaa Hub |
| Judge portal | ❌ Out — Ahaa Hub Phase 1 |
| Scoring + leaderboard | ❌ Out — Ahaa Hub Phase 1 |
| Email notifications | ❌ Out — Phase 2 |
| Custom domain | ❌ Out — Phase 2 |
| Payment / ticketing | ❌ Out — Phase 2 |

---

## Screen List

| Screen | Route | Status | Purpose |
|---|---|---|---|
| Landing page | `/` | ✅ | Product marketing + signup CTA |
| Organiser signup | `/auth/signup` | ✅ | Create account |
| Organiser login | `/auth/login` | ✅ | Login |
| Organiser dashboard | `/dashboard` | ✅ | All events — Draft · Live · Ended |
| Event overview | `/events/[id]` | ✅ | Stats, setup checklist, quick actions |
| Create event | `/events/new` | ✅ | Step 1 — event details |
| Edit event details | `/events/[id]/edit` | ✅ | Edit core details + AI assist |
| Branding editor | `/events/[id]/branding` | ✅ | Logo · colors · font · banner · live preview |
| Form builder | `/events/[id]/form` | ✅ | Drag-drop custom submission form |
| FAQ editor | `/events/[id]/faq` | ✅ | Add/edit FAQ pairs |
| Event preview | `/events/[id]/preview` | ✅ | Full branded page preview + countdown |
| Publish / settings | `/events/[id]/settings` | ✅ | Join code · max participants · status toggle |
| Public event page | `/e/[join-code]` | ✅ | Branded page — countdown · FAQ · register CTA |
| Profile | `/profile` | ✅ | Name, org, social links |
| OG image | `/api/og` | ✅ | Edge-rendered share card |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React · TypeScript · Tailwind CSS + CSS variables |
| Database | Supabase (schema: `ahaa`) |
| Auth | Supabase Auth — email + password |
| AI | OpenRouter API — free model fallback chain, Claude as paid last resort |
| File storage | Supabase Storage bucket: `event-assets` (must be public) |
| Deployment | Vercel (dev) · Docker (production) |
| Repo | Separate GitHub repo |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          ← used for file uploads + admin writes
OPENROUTER_API_KEY=
# OPENROUTER_MODEL=                 ← pin a model; omit to use fallback chain
NEXT_PUBLIC_AHAA_HUB_URL=           ← Register CTA destination
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WEBHOOK_SECRET=                     ← shared secret for registration webhook
```

---

## AI Layer Rules

- AI calls use OpenRouter — **never** import Anthropic SDK directly in this project.
- Default model chain (free first, paid last): `llama-3.3-8b:free` → `mistral-7b:free` → `gemma-3-12b:free` → `anthropic/claude-haiku-4-5`.
- Pin a specific model by setting `OPENROUTER_MODEL` env var (bypasses the chain).
- All AI calls are server-side only (`/api/ai` route). Never call AI from client components.
- System prompts live in `lib/ai/prompts.ts`. Add new prompts there, not inline.
- Guard rails in prompts block adult content, weapons, illegal activities — return structured `{"error":"..."}` JSON.
- AI assist scope: refine description · suggest tagline · suggest colour palette · generate full event draft.

---

## Database Schema

All tables live in the `ahaa` Postgres schema inside the shared Supabase project.

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
- `registration_count` increments via `POST /api/registrations` webhook from Ahaa Hub (validated with `WEBHOOK_SECRET`).
- Do not modify schema without updating `lib/types.ts` to match.
- RLS enabled. Server-side calls use `createServerSupabaseClient()`; file uploads use `createServiceRoleClient()`.

---

## Supabase Storage

- Bucket name: `event-assets` — must exist and be set to **Public**.
- Upload endpoint: `POST /api/events/[id]/upload` — accepts `FormData` with `file` and `type` (`logo` | `banner`).
- Files stored at path: `{userId}/{eventId}/{type}.{ext}` — `upsert: true` so re-uploads overwrite cleanly.
- Returns `{ url: string }` — the public URL saved into `event_branding`.

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
- Countdown timer to event start date (ticking DD:HH:MM:SS, flips to "Event is live" when started).
- FAQ section rendered from `event_faq` table.
- Full branding applied: logo, colors, font, banner.
- SEO: `<title>` and `<meta description>` from event name + tagline.
- Dynamic OG image via `/api/og` (edge runtime, 1200×630) — brand colours + banner.
- Register CTA links out to Ahaa Hub participant flow (URL: `NEXT_PUBLIC_AHAA_HUB_URL`).

---

## Design System

- Dark theme only. Background: `#020617`. CSS variables defined in `globals.css`.
- Key variables: `--color-bg`, `--color-card`, `--color-border`, `--color-blue`, `--color-purple`, `--color-pink`, `--color-text-sec`, `--color-text-muted`.
- Never use hardcoded Tailwind color classes (`bg-gray-*`, `border-gray-*`, `text-gray-*`). Always use CSS variables via `style={{}}`.
- Gradient brand accent: `linear-gradient(135deg, var(--color-blue), var(--color-purple), var(--color-pink))`.
- Button classes: `btn-primary`, `btn-secondary` — defined in globals.css.
- Card class: `card` — rounded-2xl, border, background, padding.
- Badge classes: `badge`, `badge-draft`, `badge-live`, `badge-closed`.
- Input font-size must be `16px` minimum (prevents iOS zoom).

---

## Project Structure (actual)

```
app/
  (app)/
    dashboard/          ← organiser dashboard (event cards + completion progress)
    profile/            ← organiser profile edit
    events/
      new/              ← create event wizard
      [id]/
        page.tsx        ← event overview (stats + setup checklist)
        edit/           ← edit core details + AI assist
        branding/       ← branding editor + AI colour palette + live preview
        form/           ← form builder (drag-drop, sections, field types)
        faq/            ← FAQ editor
        preview/        ← full branded page preview + countdown
        settings/       ← join code · max participants · status toggle
  auth/
    login/
    signup/
  e/[join-code]/        ← public event page (no auth required)
  api/
    events/             ← CRUD (GET list, POST create)
      [id]/             ← GET, PATCH, DELETE single event
        branding/       ← GET, PUT event branding
        upload/         ← POST file to Supabase Storage → returns URL
        clone/          ← POST deep-copy event + branding + form + FAQ
        archive/        ← POST set status = closed
        settings/       ← PATCH join code + max participants + status
      check-join-code/  ← GET uniqueness check
    ai/                 ← POST: refine_description | suggest_tagline | suggest_palette | generate_event
    og/                 ← GET dynamic OG image (edge runtime)
    profile/            ← GET + PATCH organiser profile
    registrations/      ← POST webhook from Ahaa Hub (increments registration_count)
    auth/
      logout/           ← POST sign out

components/
  branding-form.tsx     ← colour pickers + file upload + live preview panel
  event-card.tsx        ← dashboard card (progress bar, clone, archive modal)
  event-form.tsx        ← shared event details form
  sidebar-nav.tsx       ← active-link aware nav (highlights current event section)
  mobile-sidebar.tsx    ← hamburger + slide-in drawer
  skeleton.tsx          ← CardSkeleton, ListSkeleton pulse loaders
  toast.tsx             ← ToastProvider + useToast hook

lib/
  ai/
    client.ts           ← OpenRouter wrapper with model fallback chain
    prompts.ts          ← all system prompts (guard rails included)
  supabase/
    client.ts           ← browser Supabase client
    server.ts           ← server client + service role client
  types.ts              ← all TypeScript interfaces
```

---

## Code Rules

- TypeScript strict mode on. Zero `any` unless unavoidable and explicitly commented.
- Tailwind utilities for layout/spacing. CSS variables via `style={{}}` for all colours.
- Never use hardcoded Tailwind colour classes — design system breaks on dark theme.
- All new components go in `components/`. Pages are thin orchestrators.
- No comments describing what code does. Only comment non-obvious WHY.
- No error handling for impossible cases. Validate only at API route boundaries.
- No feature flags or stubs for out-of-scope phases.
- Mobile-first. All pages must work on 375px viewport. Touch targets min 2.5rem.

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
