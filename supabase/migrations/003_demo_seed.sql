-- Demo seed data for Ahaa Event Hub
-- Run in Supabase SQL Editor AFTER 002_ahaa_schema.sql
-- Demo login: demo@ahaaevent.in / Demo@12345
-- Prerequisite: create auth user manually in Dashboard → Authentication → Users → Add User
--   Email: demo@ahaaevent.in  |  Password: Demo@12345  |  Auto Confirm: ON

DO $$
DECLARE
  demo_id  UUID;
  ev1_id   UUID;
  ev2_id   UUID;
  ev3_id   UUID;
  sec1a_id UUID;
  sec1b_id UUID;
  sec2a_id UUID;
  sec3a_id UUID;
BEGIN

  -- ── Find demo auth user ─────────────────────────────────────────────────
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@ahaaevent.in';

  IF demo_id IS NULL THEN
    RAISE EXCEPTION 'Demo auth user not found. Go to Dashboard → Authentication → Users → Add User (demo@ahaaevent.in / Demo@12345, enable Auto Confirm).';
  END IF;

  -- ── Clean previous demo data ────────────────────────────────────────────
  DELETE FROM ahaa.events    WHERE organiser_id = demo_id;
  DELETE FROM ahaa.organisers WHERE id = demo_id;

  -- ── Organiser profile ───────────────────────────────────────────────────
  INSERT INTO ahaa.organisers (id, email, name, organisation, website)
  VALUES (demo_id, 'demo@ahaaevent.in', 'Demo Organiser', 'Ahaa Event Hub', 'https://ahaahub.aiorchestrator.in');

  -- ════════════════════════════════════════════════════════════════════════
  -- EVENT 1 — HackFest 2025 (Live)
  -- ════════════════════════════════════════════════════════════════════════
  INSERT INTO ahaa.events (
    organiser_id, name, type, theme, tagline, description,
    venue_type, timezone,
    registration_start, registration_end,
    start_date, end_date, submission_deadline,
    max_participants, team_min, team_max,
    eligibility, contact_email,
    tracks, prizes, judging_criteria,
    join_code, join_code_mode, status,
    visitor_count, registration_count
  ) VALUES (
    demo_id,
    'HackFest 2025', 'hackathon', 'AI for Social Good',
    'Build. Break. Change the World.',
    'HackFest 2025 is a 48-hour hackathon bringing together developers, designers, and domain experts to build AI-powered solutions for real social challenges. From healthcare to climate — hack what matters.',
    'hybrid', 'Asia/Kolkata',
    now() - interval '7 days',  now() + interval '12 days',
    now() + interval '14 days', now() + interval '16 days',
    now() + interval '15 days 20 hours',
    200, 2, 5,
    'Open to all — 18+ with a passion for technology',
    'hackfest@ahaaevent.in',
    '["HealthTech","ClimaTech","EdTech","FinTech","Open Innovation"]'::jsonb,
    '[{"place":1,"label":"Winner","value":"₹50,000 + Cloud Credits"},{"place":2,"label":"Runner-up","value":"₹25,000 + Mentorship"},{"place":3,"label":"2nd Runner-up","value":"₹10,000"},{"place":4,"label":"Best Social Impact","value":"Special Award"}]'::jsonb,
    '[{"name":"Innovation","weight":30,"expectations":"Is the idea novel? Does it solve a problem in a new or unexpected way?"},{"name":"Technical Complexity","weight":25,"expectations":"How technically challenging is the implementation? Is the architecture sound?"},{"name":"Social Impact","weight":25,"expectations":"Does the solution address a real-world problem? Who benefits and how many?"},{"name":"Presentation","weight":20,"expectations":"Is the demo clear? Does the team articulate the problem, solution, and impact well?"}]'::jsonb,
    'HACKFEST25', 'custom', 'live', 142, 38
  ) RETURNING id INTO ev1_id;

  INSERT INTO ahaa.event_branding (event_id, primary_color, background_color, accent_color, font_preset)
  VALUES (ev1_id, '#6366f1', '#0f0a2e', '#a855f7', 'Space Grotesk');

  INSERT INTO ahaa.event_faq (event_id, question, answer, "order") VALUES
    (ev1_id, 'Who can participate?',     'Anyone 18+ with a passion for technology. Teams of 2–5 members.', 0),
    (ev1_id, 'Is it free?',              'Yes, completely free to register and participate.', 1),
    (ev1_id, 'What do I need to bring?', 'Your laptop, charger, enthusiasm, and an open mind. We provide food, internet, and APIs.', 2),
    (ev1_id, 'What are the prizes?',     '₹85,000 total prize pool across tracks. Top teams also get mentorship and cloud credits.', 3);

  INSERT INTO ahaa.form_sections (event_id, title, "order") VALUES (ev1_id, 'Team Details', 0) RETURNING id INTO sec1a_id;
  INSERT INTO ahaa.form_sections (event_id, title, "order") VALUES (ev1_id, 'Project Idea',  1) RETURNING id INTO sec1b_id;

  INSERT INTO ahaa.form_fields (event_id, section_id, label, type, required, options, "order") VALUES
    (ev1_id, sec1a_id, 'Team Name',         'short_text', true,  null,                                                    0),
    (ev1_id, sec1a_id, 'Team Size',         'dropdown',   true,  '["2","3","4","5"]'::jsonb,                              1),
    (ev1_id, sec1b_id, 'Project Title',     'short_text', true,  null,                                                    2),
    (ev1_id, sec1b_id, 'Problem Statement', 'long_text',  true,  null,                                                    3),
    (ev1_id, sec1b_id, 'Tech Stack',        'checkbox',   false, '["React","Python","Node.js","Flutter","Rust","Other"]'::jsonb, 4);

  -- ════════════════════════════════════════════════════════════════════════
  -- EVENT 2 — IdeaSprint FinTech (Draft)
  -- ════════════════════════════════════════════════════════════════════════
  INSERT INTO ahaa.events (
    organiser_id, name, type, theme, tagline, description,
    venue_type, timezone,
    registration_start, registration_end,
    start_date, end_date, submission_deadline,
    max_participants, team_min, team_max,
    eligibility, contact_email,
    tracks, prizes, judging_criteria,
    join_code, join_code_mode, status,
    visitor_count, registration_count
  ) VALUES (
    demo_id,
    'IdeaSprint — FinTech Edition', 'ideathon', 'Financial Inclusion',
    'Ideas that bank on everyone.',
    'A one-day ideathon focused on financial inclusion. Pitch your idea for making banking, lending, and investing accessible to the unbanked and underserved populations across India.',
    'online', 'Asia/Kolkata',
    now() + interval '7 days',  now() + interval '28 days',
    now() + interval '30 days', now() + interval '30 days 8 hours',
    now() + interval '30 days 6 hours',
    100, 1, 3,
    'College students and recent graduates (graduated after 2022)',
    'ideasprint@ahaaevent.in',
    '["Payments","Lending","Insurance","Wealth Management"]'::jsonb,
    '[{"place":1,"label":"Best Idea","value":"₹15,000 + Incubation Opportunity"},{"place":2,"label":"Runner-up","value":"₹7,500"}]'::jsonb,
    '[{"name":"Originality","weight":35,"expectations":"Is the idea fresh? Does it take a unique angle on the problem space?"},{"name":"Feasibility","weight":30,"expectations":"Can this be built within 6 months with a small team? Are the technical assumptions realistic?"},{"name":"Market Potential","weight":35,"expectations":"Is there a large addressable market? Is there evidence of demand or early traction?"}]'::jsonb,
    'FINTECH25', 'custom', 'draft', 27, 0
  ) RETURNING id INTO ev2_id;

  INSERT INTO ahaa.event_branding (event_id, primary_color, background_color, accent_color, font_preset)
  VALUES (ev2_id, '#10b981', '#022c22', '#34d399', 'Poppins');

  INSERT INTO ahaa.event_faq (event_id, question, answer, "order") VALUES
    (ev2_id, 'Do I need a working product?', 'No — this is an ideathon. A well-structured pitch deck is enough.', 0),
    (ev2_id, 'How long is the pitch?',        '5 minutes presentation + 3 minutes Q&A.', 1);

  INSERT INTO ahaa.form_sections (event_id, title, "order") VALUES (ev2_id, 'Your Idea', 0) RETURNING id INTO sec2a_id;

  INSERT INTO ahaa.form_fields (event_id, section_id, label, type, required, options, "order") VALUES
    (ev2_id, sec2a_id, 'Idea Title',              'short_text', true,  null,                                                               0),
    (ev2_id, sec2a_id, 'Problem you are solving', 'long_text',  true,  null,                                                               1),
    (ev2_id, sec2a_id, 'Target audience',         'short_text', true,  null,                                                               2),
    (ev2_id, sec2a_id, 'Revenue model',           'radio',      false, '["Subscription","Transaction fee","Freemium","B2B SaaS","Other"]'::jsonb, 3);

  -- ════════════════════════════════════════════════════════════════════════
  -- EVENT 3 — Startup Pitch Night (Closed)
  -- ════════════════════════════════════════════════════════════════════════
  INSERT INTO ahaa.events (
    organiser_id, name, type, theme, tagline, description,
    venue_type, timezone,
    start_date, end_date, submission_deadline,
    max_participants, team_min, team_max,
    eligibility, contact_email,
    prizes, judging_criteria,
    join_code, join_code_mode, status,
    visitor_count, registration_count
  ) VALUES (
    demo_id,
    'Startup Pitch Night', 'pitch_competition', 'Deep Tech',
    'Where bold ideas meet serious capital.',
    'Monthly pitch night for early-stage deep tech startups. Present to a panel of VCs, angels, and industry veterans. Limited to 10 startups per session.',
    'in_person', 'Asia/Kolkata',
    now() - interval '5 days', now() - interval '4 days',
    now() - interval '6 days',
    10, 1, 3,
    'Pre-seed to Series A startups with an MVP',
    'pitchnight@ahaaevent.in',
    '[{"place":1,"label":"Audience Choice","value":"Fast-track to VC intro"},{"place":2,"label":"Jury Pick","value":"3-month mentorship programme"}]'::jsonb,
    '[{"name":"Problem–Solution Fit","weight":30,"expectations":"Is the problem clearly defined? Does the solution directly address it? Are assumptions validated?"},{"name":"Traction","weight":25,"expectations":"Any early users, revenue, pilots, or letters of intent? Show momentum."},{"name":"Team","weight":25,"expectations":"Does the team have the right mix of skills? Is there a compelling reason this team will succeed?"},{"name":"Pitch Quality","weight":20,"expectations":"Is the narrative crisp and compelling? Does the deck tell a clear story from problem to ask?"}]'::jsonb,
    'PITCHNIGHT', 'custom', 'closed', 89, 10
  ) RETURNING id INTO ev3_id;

  INSERT INTO ahaa.event_branding (event_id, primary_color, background_color, accent_color, font_preset)
  VALUES (ev3_id, '#f59e0b', '#1c1007', '#fbbf24', 'Playfair Display');

  INSERT INTO ahaa.event_faq (event_id, question, answer, "order") VALUES
    (ev3_id, 'What stage should my startup be?', 'Pre-seed to Series A. You should have an MVP or at least a working prototype.', 0),
    (ev3_id, 'Is there a participation fee?',     '₹500 refundable deposit to confirm your slot.', 1);

  INSERT INTO ahaa.form_sections (event_id, title, "order") VALUES (ev3_id, 'Startup Info', 0) RETURNING id INTO sec3a_id;

  INSERT INTO ahaa.form_fields (event_id, section_id, label, type, required, options, char_limit, "order") VALUES
    (ev3_id, sec3a_id, 'Startup Name',         'short_text', true,  null,                                                      null, 0),
    (ev3_id, sec3a_id, 'One-line pitch',        'short_text', true,  null,                                                      120,  1),
    (ev3_id, sec3a_id, 'Funding raised so far', 'dropdown',   true,  '["Bootstrapped","< ₹10L","₹10L–₹1Cr","> ₹1Cr"]'::jsonb, null, 2),
    (ev3_id, sec3a_id, 'Pitch deck link',       'short_text', true,  null,                                                      null, 3);

  RAISE NOTICE 'Demo seed complete! Events: % | % | %', ev1_id, ev2_id, ev3_id;

END $$;
