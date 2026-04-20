CREATE SCHEMA IF NOT EXISTS eventmanager;

-- Organiser accounts
CREATE TABLE eventmanager.organisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organisation TEXT,
  website TEXT,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE eventmanager.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id UUID NOT NULL REFERENCES eventmanager.organisers(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hackathon',
  theme TEXT,
  description TEXT,
  tagline TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  venue_type TEXT,
  meeting_link TEXT,
  max_participants INTEGER,
  join_code TEXT NOT NULL UNIQUE,
  join_code_mode TEXT NOT NULL DEFAULT 'auto',
  status TEXT NOT NULL DEFAULT 'draft',
  expires_at TIMESTAMPTZ,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  registration_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-event branding
CREATE TABLE eventmanager.event_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES eventmanager.events(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563EB',
  background_color TEXT NOT NULL DEFAULT '#0F172A',
  accent_color TEXT NOT NULL DEFAULT '#1E40AF',
  font_preset TEXT NOT NULL DEFAULT 'Inter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Form sections
CREATE TABLE eventmanager.form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES eventmanager.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Form fields
CREATE TABLE eventmanager.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES eventmanager.events(id) ON DELETE CASCADE,
  section_id UUID REFERENCES eventmanager.form_sections(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'short_text',
  helper_text TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  char_limit INTEGER,
  options JSONB,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- FAQ
CREATE TABLE eventmanager.event_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES eventmanager.events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE eventmanager.organisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventmanager.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventmanager.event_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventmanager.form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventmanager.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventmanager.event_faq ENABLE ROW LEVEL SECURITY;
