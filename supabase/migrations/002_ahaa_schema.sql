-- Migration: full ahaa schema (run in Supabase SQL Editor)

CREATE SCHEMA IF NOT EXISTS ahaa;

-- Organiser accounts
CREATE TABLE IF NOT EXISTS ahaa.organisers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  organisation  TEXT,
  website       TEXT,
  linkedin      TEXT,
  twitter       TEXT,
  instagram     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS ahaa.events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id         UUID NOT NULL REFERENCES ahaa.organisers(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'hackathon',
  theme                TEXT,
  description          TEXT,
  tagline              TEXT,
  registration_start   TIMESTAMPTZ,
  registration_end     TIMESTAMPTZ,
  start_date           TIMESTAMPTZ,
  end_date             TIMESTAMPTZ,
  submission_deadline  TIMESTAMPTZ,
  timezone             TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  venue_type           TEXT,
  meeting_link         TEXT,
  max_participants     INTEGER,
  team_min             SMALLINT,
  team_max             SMALLINT,
  eligibility          TEXT,
  contact_email        TEXT,
  tracks               JSONB,
  prizes               JSONB,
  judging_criteria     JSONB,
  join_code            TEXT NOT NULL UNIQUE,
  join_code_mode       TEXT NOT NULL DEFAULT 'auto',
  status               TEXT NOT NULL DEFAULT 'draft',
  expires_at           TIMESTAMPTZ,
  visitor_count        INTEGER NOT NULL DEFAULT 0,
  registration_count   INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-event branding
CREATE TABLE IF NOT EXISTS ahaa.event_branding (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL UNIQUE REFERENCES ahaa.events(id) ON DELETE CASCADE,
  logo_url         TEXT,
  banner_url       TEXT,
  primary_color    TEXT NOT NULL DEFAULT '#3b82f6',
  background_color TEXT NOT NULL DEFAULT '#020617',
  accent_color     TEXT NOT NULL DEFAULT '#6366f1',
  font_preset      TEXT NOT NULL DEFAULT 'Inter',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Form sections
CREATE TABLE IF NOT EXISTS ahaa.form_sections (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES ahaa.events(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  "order"   INTEGER NOT NULL DEFAULT 0
);

-- Form fields
CREATE TABLE IF NOT EXISTS ahaa.form_fields (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES ahaa.events(id) ON DELETE CASCADE,
  section_id   UUID REFERENCES ahaa.form_sections(id) ON DELETE SET NULL,
  label        TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'short_text',
  helper_text  TEXT,
  required     BOOLEAN NOT NULL DEFAULT false,
  char_limit   INTEGER,
  options      JSONB,
  "order"      INTEGER NOT NULL DEFAULT 0
);

-- FAQ
CREATE TABLE IF NOT EXISTS ahaa.event_faq (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES ahaa.events(id) ON DELETE CASCADE,
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  "order"   INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE ahaa.organisers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahaa.events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahaa.event_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahaa.form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahaa.form_fields   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ahaa.event_faq     ENABLE ROW LEVEL SECURITY;

-- If upgrading an existing ahaa.events table, add missing columns:
ALTER TABLE ahaa.events
  ADD COLUMN IF NOT EXISTS registration_start  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_end    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submission_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS team_min            SMALLINT,
  ADD COLUMN IF NOT EXISTS team_max            SMALLINT,
  ADD COLUMN IF NOT EXISTS eligibility         TEXT,
  ADD COLUMN IF NOT EXISTS contact_email       TEXT,
  ADD COLUMN IF NOT EXISTS tracks              JSONB,
  ADD COLUMN IF NOT EXISTS prizes              JSONB,
  ADD COLUMN IF NOT EXISTS judging_criteria    JSONB;
