-- RLS Policies for ahaa schema
-- Idempotent: drops existing policies before recreating

-- ── organisers ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "organisers: own row" ON ahaa.organisers;
CREATE POLICY "organisers: own row" ON ahaa.organisers
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── events ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "events: organiser owns"   ON ahaa.events;
DROP POLICY IF EXISTS "events: public read live" ON ahaa.events;

CREATE POLICY "events: organiser owns" ON ahaa.events
  USING (organiser_id = auth.uid())
  WITH CHECK (organiser_id = auth.uid());

CREATE POLICY "events: public read live" ON ahaa.events
  FOR SELECT
  USING (status = 'live');

-- ── event_branding ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "branding: organiser owns"   ON ahaa.event_branding;
DROP POLICY IF EXISTS "branding: public read live" ON ahaa.event_branding;

CREATE POLICY "branding: organiser owns" ON ahaa.event_branding
  USING (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()));

CREATE POLICY "branding: public read live" ON ahaa.event_branding
  FOR SELECT
  USING (event_id IN (SELECT id FROM ahaa.events WHERE status = 'live'));

-- ── form_sections ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "form_sections: organiser owns"   ON ahaa.form_sections;
DROP POLICY IF EXISTS "form_sections: public read live" ON ahaa.form_sections;

CREATE POLICY "form_sections: organiser owns" ON ahaa.form_sections
  USING (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()));

CREATE POLICY "form_sections: public read live" ON ahaa.form_sections
  FOR SELECT
  USING (event_id IN (SELECT id FROM ahaa.events WHERE status = 'live'));

-- ── form_fields ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "form_fields: organiser owns"   ON ahaa.form_fields;
DROP POLICY IF EXISTS "form_fields: public read live" ON ahaa.form_fields;

CREATE POLICY "form_fields: organiser owns" ON ahaa.form_fields
  USING (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()));

CREATE POLICY "form_fields: public read live" ON ahaa.form_fields
  FOR SELECT
  USING (event_id IN (SELECT id FROM ahaa.events WHERE status = 'live'));

-- ── event_faq ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "faq: organiser owns"   ON ahaa.event_faq;
DROP POLICY IF EXISTS "faq: public read live" ON ahaa.event_faq;

CREATE POLICY "faq: organiser owns" ON ahaa.event_faq
  USING (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM ahaa.events WHERE organiser_id = auth.uid()));

CREATE POLICY "faq: public read live" ON ahaa.event_faq
  FOR SELECT
  USING (event_id IN (SELECT id FROM ahaa.events WHERE status = 'live'));
