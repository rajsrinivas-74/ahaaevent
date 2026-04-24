/**
 * Seed script — creates demo user + sample events
 * Run: node scripts/seed-demo.mjs
 *
 * Requires .env.local to be readable (or set env vars manually)
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "apikey": SERVICE_KEY,
};

async function sb(path, method = "GET", body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      ...headers,
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
      "Accept-Profile": "ahaa",
      "Content-Profile": "ahaa",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!text) return [];
  try { return JSON.parse(text); } catch { return text; }
}

async function sbAuth(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ── Demo data ──────────────────────────────────────────────────────────────

const DEMO_EMAIL    = "demo@ahaaevent.in";
const DEMO_PASSWORD = "Demo@12345";

const EVENTS = [
  {
    name: "HackFest 2025",
    type: "hackathon",
    theme: "AI for Social Good",
    tagline: "Build. Break. Change the World.",
    description: "HackFest 2025 is a 48-hour hackathon bringing together developers, designers, and domain experts to build AI-powered solutions for real social challenges. From healthcare to climate — hack what matters.",
    venue_type: "hybrid",
    timezone: "Asia/Kolkata",
    registration_start: new Date(Date.now() - 7 * 86400000).toISOString(),
    registration_end:   new Date(Date.now() + 12 * 86400000).toISOString(),
    start_date:         new Date(Date.now() + 14 * 86400000).toISOString(),
    end_date:           new Date(Date.now() + 16 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() + 15 * 86400000 + 20 * 3600000).toISOString(),
    max_participants: 200,
    team_min: 2,
    team_max: 5,
    eligibility: "Open to all — 18+ with a passion for technology",
    contact_email: "hackfest@ahaaevent.in",
    tracks: ["HealthTech", "ClimaTech", "EdTech", "FinTech", "Open Innovation"],
    prizes: [
      { place: 1, label: "Winner", value: "₹50,000 + Cloud Credits" },
      { place: 2, label: "Runner-up", value: "₹25,000 + Mentorship" },
      { place: 3, label: "2nd Runner-up", value: "₹10,000" },
      { place: 4, label: "Best Social Impact", value: "Special Award" },
    ],
    judging_criteria: [
      { name: "Innovation", weight: 30, expectations: "Is the idea novel? Does it solve a problem in a new or unexpected way?" },
      { name: "Technical Complexity", weight: 25, expectations: "How technically challenging is the implementation? Is the architecture sound?" },
      { name: "Social Impact", weight: 25, expectations: "Does the solution address a real-world problem? Who benefits and how many?" },
      { name: "Presentation", weight: 20, expectations: "Is the demo clear? Does the team articulate the problem, solution, and impact well?" },
    ],
    join_code: "HACKFEST25",
    join_code_mode: "custom",
    status: "live",
    visitor_count: 142,
    registration_count: 38,
    branding: {
      primary_color: "#6366f1",
      background_color: "#0f0a2e",
      accent_color: "#a855f7",
      font_preset: "Space Grotesk",
    },
    faq: [
      { question: "Who can participate?", answer: "Anyone 18+ with a passion for technology. Teams of 2–5 members." },
      { question: "Is it free?", answer: "Yes, completely free to register and participate." },
      { question: "What do I need to bring?", answer: "Your laptop, charger, enthusiasm, and an open mind. We'll provide food, internet, and APIs." },
      { question: "What are the prizes?", answer: "₹85,000 total prize pool across tracks. Top teams also get mentorship and cloud credits." },
    ],
    form: {
      sections: [{ title: "Team Details", order: 0 }, { title: "Project Idea", order: 1 }],
      fields: [
        { label: "Team Name", type: "short_text", required: true, order: 0, section: 0 },
        { label: "Team Size", type: "dropdown", required: true, options: ["2", "3", "4", "5"], order: 1, section: 0 },
        { label: "Project Title", type: "short_text", required: true, order: 2, section: 1 },
        { label: "Problem Statement", type: "long_text", required: true, order: 3, section: 1, char_limit: 500 },
        { label: "Tech Stack", type: "checkbox", required: false, options: ["React", "Python", "Node.js", "Flutter", "Rust", "Other"], order: 4, section: 1 },
      ],
    },
  },
  {
    name: "IdeaSprint — FinTech Edition",
    type: "ideathon",
    theme: "Financial Inclusion",
    tagline: "Ideas that bank on everyone.",
    description: "A one-day ideathon focused on financial inclusion. Pitch your idea for making banking, lending, and investing accessible to the unbanked and underserved populations across India.",
    venue_type: "online",
    timezone: "Asia/Kolkata",
    registration_start: new Date(Date.now() + 7 * 86400000).toISOString(),
    registration_end:   new Date(Date.now() + 28 * 86400000).toISOString(),
    start_date:         new Date(Date.now() + 30 * 86400000).toISOString(),
    end_date:           new Date(Date.now() + 30 * 86400000 + 8 * 3600000).toISOString(),
    submission_deadline: new Date(Date.now() + 30 * 86400000 + 6 * 3600000).toISOString(),
    max_participants: 100,
    team_min: 1,
    team_max: 3,
    eligibility: "College students and recent graduates (graduated after 2022)",
    contact_email: "ideasprint@ahaaevent.in",
    tracks: ["Payments", "Lending", "Insurance", "Wealth Management"],
    prizes: [
      { place: 1, label: "Best Idea", value: "₹15,000 + Incubation Opportunity" },
      { place: 2, label: "Runner-up", value: "₹7,500" },
    ],
    judging_criteria: [
      { name: "Originality", weight: 35, expectations: "Is the idea fresh? Does it take a unique angle on the problem space?" },
      { name: "Feasibility", weight: 30, expectations: "Can this be built within 6 months with a small team? Are the technical assumptions realistic?" },
      { name: "Market Potential", weight: 35, expectations: "Is there a large addressable market? Is there evidence of demand or early traction?" },
    ],
    join_code: "FINTECH25",
    join_code_mode: "custom",
    status: "draft",
    visitor_count: 27,
    registration_count: 0,
    branding: {
      primary_color: "#10b981",
      background_color: "#022c22",
      accent_color: "#34d399",
      font_preset: "Poppins",
    },
    faq: [
      { question: "Do I need a working product?", answer: "No — this is an ideathon. A well-structured pitch deck is enough." },
      { question: "How long is the pitch?", answer: "5 minutes presentation + 3 minutes Q&A." },
    ],
    form: {
      sections: [{ title: "Your Idea", order: 0 }],
      fields: [
        { label: "Idea Title", type: "short_text", required: true, order: 0, section: 0 },
        { label: "Problem you are solving", type: "long_text", required: true, order: 1, section: 0 },
        { label: "Target audience", type: "short_text", required: true, order: 2, section: 0 },
        { label: "Revenue model", type: "radio", required: false, options: ["Subscription", "Transaction fee", "Freemium", "B2B SaaS", "Other"], order: 3, section: 0 },
      ],
    },
  },
  {
    name: "Startup Pitch Night",
    type: "pitch_competition",
    theme: "Deep Tech",
    tagline: "Where bold ideas meet serious capital.",
    description: "Monthly pitch night for early-stage deep tech startups. Present to a panel of VCs, angels, and industry veterans. Limited to 10 startups per session.",
    venue_type: "in_person",
    timezone: "Asia/Kolkata",
    start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    end_date:   new Date(Date.now() - 4 * 86400000).toISOString(),
    submission_deadline: new Date(Date.now() - 6 * 86400000).toISOString(),
    max_participants: 10,
    team_min: 1,
    team_max: 3,
    eligibility: "Pre-seed to Series A startups with an MVP",
    contact_email: "pitchnight@ahaaevent.in",
    prizes: [
      { place: 1, label: "Audience Choice", value: "Fast-track to VC intro" },
      { place: 2, label: "Jury Pick", value: "3-month mentorship programme" },
    ],
    judging_criteria: [
      { name: "Problem–Solution Fit", weight: 30, expectations: "Is the problem clearly defined? Does the solution directly address it? Are assumptions validated?" },
      { name: "Traction", weight: 25, expectations: "Any early users, revenue, pilots, or letters of intent? Show momentum." },
      { name: "Team", weight: 25, expectations: "Does the team have the right mix of skills? Is there a compelling reason this team will succeed?" },
      { name: "Pitch Quality", weight: 20, expectations: "Is the narrative crisp and compelling? Does the deck tell a clear story from problem to ask?" },
    ],
    join_code: "PITCHNIGHT",
    join_code_mode: "custom",
    status: "closed",
    visitor_count: 89,
    registration_count: 10,
    branding: {
      primary_color: "#f59e0b",
      background_color: "#1c1007",
      accent_color: "#fbbf24",
      font_preset: "Playfair Display",
    },
    faq: [
      { question: "What stage should my startup be?", answer: "Pre-seed to Series A. You should have an MVP or at least a working prototype." },
      { question: "Is there a participation fee?", answer: "₹500 refundable deposit to confirm your slot." },
    ],
    form: {
      sections: [{ title: "Startup Info", order: 0 }],
      fields: [
        { label: "Startup Name", type: "short_text", required: true, order: 0, section: 0 },
        { label: "One-line pitch", type: "short_text", required: true, order: 1, section: 0, char_limit: 120 },
        { label: "Funding raised so far", type: "dropdown", required: true, options: ["Bootstrapped", "< ₹10L", "₹10L–₹1Cr", "> ₹1Cr"], order: 2, section: 0 },
        { label: "Pitch deck link", type: "short_text", required: true, order: 3, section: 0 },
      ],
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────

async function run() {
  console.log("🌱 Seeding demo user and events…\n");

  // 1. Create or fetch demo auth user
  let userId;
  const listRes = await sbAuth("/users?page=1&per_page=100", "GET");
  const existing = listRes.users?.find(u => u.email === DEMO_EMAIL);

  if (existing) {
    userId = existing.id;
    console.log(`✓ Demo user exists: ${userId}`);
  } else {
    const created = await sbAuth("/users", "POST", {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (created.error) { console.error("Auth create failed:", created.error); process.exit(1); }
    userId = created.id;
    console.log(`✓ Created demo user: ${userId}`);
  }

  // 2. Upsert organiser profile
  await sb(`/organisers?id=eq.${userId}`, "DELETE");
  await sb("/organisers", "POST", [{
    id: userId,
    email: DEMO_EMAIL,
    name: "Demo Organiser",
    organisation: "Ahaa Event Hub",
    website: "https://ahaahub.aiorchestrator.in",
    linkedin: null,
    twitter: null,
    instagram: null,
  }]);
  console.log("✓ Organiser profile upserted");

  // 3. Delete existing demo events
  await sb(`/events?organiser_id=eq.${userId}`, "DELETE");

  // 4. Create events
  for (const ev of EVENTS) {
    const { form, branding, faq, ...eventData } = ev;

    const [created] = await sb("/events", "POST", [{
      ...eventData,
      organiser_id: userId,
    }]);
    const eventId = created.id;
    console.log(`✓ Event created: ${eventData.name} (${eventId})`);

    // Branding
    await sb("/event_branding", "POST", [{ event_id: eventId, ...branding }]);

    // FAQ
    if (faq.length) {
      await sb("/event_faq", "POST", faq.map((f, i) => ({ event_id: eventId, ...f, order: i })));
    }

    // Form sections + fields
    const sectionIds = [];
    for (const sec of form.sections) {
      const [s] = await sb("/form_sections", "POST", [{ event_id: eventId, title: sec.title, order: sec.order }]);
      sectionIds.push(s.id);
    }
    if (form.fields.length) {
      await sb("/form_fields", "POST", form.fields.map(f => ({
        event_id: eventId,
        section_id: sectionIds[f.section] ?? null,
        label: f.label,
        type: f.type,
        required: f.required,
        order: f.order,
        char_limit: f.char_limit ?? null,
        options: f.options ?? null,
        helper_text: null,
      })));
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Demo seed complete!

  Email:    ${DEMO_EMAIL}
  Password: ${DEMO_PASSWORD}

  3 events created:
  • HackFest 2025       — Live   (HACKFEST25)
  • IdeaSprint FinTech  — Draft  (FINTECH25)
  • Startup Pitch Night — Closed (PITCHNIGHT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

run().catch(e => { console.error(e); process.exit(1); });
