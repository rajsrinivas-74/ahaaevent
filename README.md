# Ahaa Event Hub

**AI Orchestration Labs Private Limited** · Proprietary

Organizer-side event setup tool — create a fully branded, shareable event page with a custom submission form in minutes.

---

## What It Does

```
Sign up → Create event → Brand it → Build form → Add FAQ → Publish → Share
```

Organisers get a branded public event page at `/e/[join-code]` with:
- Live countdown timer
- Visitor + registration counters
- Custom submission form
- FAQ section
- Register CTA linking to Ahaa Hub

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS variables (dark theme) |
| Database | Supabase — schema `ahaa` |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage — bucket `event-assets` (public) |
| AI | OpenRouter — free model chain with Claude fallback |
| OG Images | `next/og` (edge runtime) |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd ahaaevent
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_AHAA_HUB_URL=https://ahaahub.aiorchestrator.in
NEXT_PUBLIC_SITE_URL=http://localhost:3000
WEBHOOK_SECRET=your_shared_secret
```

### 3. Supabase setup

Run the schema SQL in the Supabase SQL editor (all tables in the `ahaa` schema):

```sql
create schema if not exists ahaa;

create table ahaa.organisers (
  id uuid primary key references auth.users(id),
  email text not null,
  name text not null,
  organisation text,
  website text,
  linkedin text,
  twitter text,
  instagram text,
  created_at timestamptz default now()
);

create table ahaa.events (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid references ahaa.organisers(id) on delete cascade,
  name text not null,
  type text not null default 'hackathon',
  theme text,
  description text,
  tagline text,
  start_date timestamptz,
  end_date timestamptz,
  timezone text not null default 'Asia/Kolkata',
  venue_type text,
  meeting_link text,
  max_participants int,
  join_code text unique not null,
  join_code_mode text not null default 'auto',
  status text not null default 'draft',
  expires_at timestamptz,
  visitor_count int not null default 0,
  registration_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ahaa.event_branding (
  id uuid primary key default gen_random_uuid(),
  event_id uuid unique references ahaa.events(id) on delete cascade,
  logo_url text,
  banner_url text,
  primary_color text not null default '#2563EB',
  background_color text not null default '#0F172A',
  accent_color text not null default '#1E40AF',
  font_preset text not null default 'Inter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ahaa.form_sections (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references ahaa.events(id) on delete cascade,
  title text not null,
  "order" int not null default 0
);

create table ahaa.form_fields (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references ahaa.events(id) on delete cascade,
  section_id uuid references ahaa.form_sections(id) on delete set null,
  label text not null,
  type text not null,
  helper_text text,
  required boolean not null default false,
  char_limit int,
  options jsonb,
  "order" int not null default 0
);

create table ahaa.event_faq (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references ahaa.events(id) on delete cascade,
  question text not null,
  answer text not null,
  "order" int not null default 0
);
```

Create the storage bucket in Supabase dashboard:
- **Storage → New bucket → name: `event-assets` → toggle Public → Create**

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## AI Features

All AI is server-side via OpenRouter (`/api/ai`). Set `OPENROUTER_API_KEY` in `.env.local`.

| Action | Trigger | Output |
|---|---|---|
| Refine Description | Button in Edit event | Polished description text |
| Suggest Tagline | Button in Edit event | Short tagline string |
| Suggest Colour Palette | Button in Branding | `primary_color`, `accent_color`, `background_color` + rationale |
| Generate Event Draft | Wizard step | `name`, `description`, `tagline`, `type`, `theme`, sample FAQs |

**Model fallback chain** (in order, first success wins):
1. `meta-llama/llama-3.3-8b-instruct:free`
2. `mistralai/mistral-7b-instruct:free`
3. `google/gemma-3-12b-it:free`
4. `anthropic/claude-haiku-4-5` (paid — final fallback)

Pin a specific model: `OPENROUTER_MODEL=<model-id>` in env.

**Guard rails:** AI blocks requests for adult content, weapons, illegal activities, gambling, and other harmful themes — returns a 422 with a human-readable error.

---

## Registration Webhook

Ahaa Hub calls this endpoint when a participant registers:

```
POST /api/registrations
Content-Type: application/json

{
  "join_code": "ABC123",
  "secret": "<WEBHOOK_SECRET>"
}
```

Increments `registration_count` on the matching event. The shared secret must match `WEBHOOK_SECRET` in env.

---

## Key Routes

| Route | Auth | Description |
|---|---|---|
| `GET /api/events` | Required | List organiser's events |
| `POST /api/events` | Required | Create event |
| `GET /api/events/[id]` | Required | Get single event |
| `PATCH /api/events/[id]` | Required | Update event |
| `POST /api/events/[id]/upload` | Required | Upload logo or banner to Supabase Storage |
| `POST /api/events/[id]/clone` | Required | Deep-copy event |
| `POST /api/events/[id]/archive` | Required | Set status = closed |
| `GET /api/events/[id]/branding` | Required | Get branding |
| `PUT /api/events/[id]/branding` | Required | Save branding |
| `POST /api/ai` | Required | AI actions |
| `GET /api/og` | Public | Dynamic OG image |
| `GET /api/profile` | Required | Get organiser profile |
| `PATCH /api/profile` | Required | Update profile |
| `POST /api/registrations` | Webhook | Increment registration_count |
| `GET /e/[joinCode]` | Public | Branded event page |

---

## Project Structure

```
app/
  (app)/                  ← authenticated organiser shell
    dashboard/
    profile/
    events/[id]/
      page.tsx            ← event overview
      edit/ branding/ form/ faq/ preview/ settings/
  auth/login/ signup/
  e/[join-code]/          ← public event page
  api/                    ← all API routes

components/               ← shared UI components
lib/
  ai/client.ts            ← OpenRouter wrapper + model chain
  ai/prompts.ts           ← all system prompts
  supabase/               ← browser + server + service role clients
  types.ts                ← TypeScript interfaces
```

---

## Out of Scope (Phase 2 / Ahaa Hub)

- Participant registration, login, submission
- Judge portal, scoring, leaderboard
- Email notifications
- Custom domain / CNAME
- Payment / ticketing
