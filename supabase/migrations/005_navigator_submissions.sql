-- Migration: navigator_submissions table for AhaaIQ training data collection

CREATE TABLE IF NOT EXISTS ahaa.navigator_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Consent
  consent_data        BOOLEAN NOT NULL DEFAULT false,
  wants_report        BOOLEAN NOT NULL DEFAULT false,

  -- Identity (only populated when wants_report = true)
  first_name          TEXT,
  email               TEXT,

  -- About
  source              TEXT NOT NULL,

  -- Problem
  problem_statement   TEXT NOT NULL,
  domain              TEXT NOT NULL,
  duration            TEXT NOT NULL,

  -- Approach
  pre_ai_thinking     TEXT NOT NULL,
  ai_tools            TEXT[] NOT NULL DEFAULT '{}',
  brief_quality       TEXT NOT NULL,
  ai_redirections     TEXT NOT NULL,
  self_tested         TEXT NOT NULL,

  -- Repo
  repo_url            TEXT NOT NULL,
  extra_context       TEXT,

  -- Processing
  status              TEXT NOT NULL DEFAULT 'submitted'
                      CHECK (status IN ('submitted', 'parsed', 'scored'))
);

-- Prevent duplicate repo submissions
CREATE UNIQUE INDEX IF NOT EXISTS navigator_submissions_repo_url_idx
  ON ahaa.navigator_submissions (repo_url);

-- Prevent duplicate email submissions (only when email is present)
CREATE UNIQUE INDEX IF NOT EXISTS navigator_submissions_email_idx
  ON ahaa.navigator_submissions (email)
  WHERE email IS NOT NULL;

-- RLS — no public reads; service role writes only
ALTER TABLE ahaa.navigator_submissions ENABLE ROW LEVEL SECURITY;

-- No RLS policy = only service role can read/write (intended)
-- Admins query via service role client
