import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const DEMO_EMAIL = "demo@ahaaevent.in";

const EVENTS = [
  {
    name: "HackFest 2025",
    type: "hackathon",
    theme: "AI for Social Good",
    tagline: "Build. Break. Change the World.",
    description: "HackFest 2025 is a 48-hour hackathon bringing together developers, designers, and domain experts to build AI-powered solutions for real social challenges. From healthcare to climate — hack what matters.",
    venue_type: "hybrid",
    timezone: "Asia/Kolkata",
    start_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 16 * 86400000).toISOString(),
    max_participants: 200,
    join_code: "HACKFEST25",
    join_code_mode: "custom",
    status: "live",
    visitor_count: 142,
    registration_count: 38,
    branding: { primary_color: "#6366f1", background_color: "#0f0a2e", accent_color: "#a855f7", font_preset: "Space Grotesk" },
    faq: [
      { question: "Who can participate?", answer: "Anyone 18+ with a passion for technology. Teams of 2–5 members." },
      { question: "Is it free?", answer: "Yes, completely free to register and participate." },
      { question: "What do I need to bring?", answer: "Your laptop, charger, enthusiasm, and an open mind." },
      { question: "What are the prizes?", answer: "₹1,00,000 total prize pool across 3 tracks." },
    ],
    sections: [{ title: "Team Details", order: 0 }, { title: "Project Idea", order: 1 }],
    fields: [
      { label: "Team Name", type: "short_text", required: true, order: 0, section: 0 },
      { label: "Team Size", type: "dropdown", required: true, options: ["2","3","4","5"], order: 1, section: 0 },
      { label: "Project Title", type: "short_text", required: true, order: 2, section: 1 },
      { label: "Problem Statement", type: "long_text", required: true, order: 3, section: 1, char_limit: 500 },
      { label: "Tech Stack", type: "checkbox", required: false, options: ["React","Python","Node.js","Flutter","Rust","Other"], order: 4, section: 1 },
    ],
  },
  {
    name: "IdeaSprint — FinTech Edition",
    type: "ideathon",
    theme: "Financial Inclusion",
    tagline: "Ideas that bank on everyone.",
    description: "A one-day ideathon focused on financial inclusion. Pitch your idea for making banking, lending, and investing accessible to the unbanked and underserved populations across India.",
    venue_type: "online",
    timezone: "Asia/Kolkata",
    start_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000 + 8 * 3600000).toISOString(),
    max_participants: 100,
    join_code: "FINTECH25",
    join_code_mode: "custom",
    status: "draft",
    visitor_count: 27,
    registration_count: 0,
    branding: { primary_color: "#10b981", background_color: "#022c22", accent_color: "#34d399", font_preset: "Poppins" },
    faq: [
      { question: "Do I need a working product?", answer: "No — a well-structured pitch deck is enough." },
      { question: "How long is the pitch?", answer: "5 minutes presentation + 3 minutes Q&A." },
    ],
    sections: [{ title: "Your Idea", order: 0 }],
    fields: [
      { label: "Idea Title", type: "short_text", required: true, order: 0, section: 0 },
      { label: "Problem you are solving", type: "long_text", required: true, order: 1, section: 0 },
      { label: "Target audience", type: "short_text", required: true, order: 2, section: 0 },
      { label: "Revenue model", type: "radio", required: false, options: ["Subscription","Transaction fee","Freemium","B2B SaaS","Other"], order: 3, section: 0 },
    ],
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
    end_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    max_participants: 10,
    join_code: "PITCHNIGHT",
    join_code_mode: "custom",
    status: "closed",
    visitor_count: 89,
    registration_count: 10,
    branding: { primary_color: "#f59e0b", background_color: "#1c1007", accent_color: "#fbbf24", font_preset: "Playfair Display" },
    faq: [
      { question: "What stage should my startup be?", answer: "Pre-seed to Series A with an MVP or working prototype." },
      { question: "Is there a participation fee?", answer: "₹500 refundable deposit to confirm your slot." },
    ],
    sections: [{ title: "Startup Info", order: 0 }],
    fields: [
      { label: "Startup Name", type: "short_text", required: true, order: 0, section: 0 },
      { label: "One-line pitch", type: "short_text", required: true, order: 1, section: 0, char_limit: 120 },
      { label: "Funding raised so far", type: "dropdown", required: true, options: ["Bootstrapped","< ₹10L","₹10L–₹1Cr","> ₹1Cr"], order: 2, section: 0 },
      { label: "Pitch deck link", type: "short_text", required: true, order: 3, section: 0 },
    ],
  },
];

export async function POST() {
  const supabase = createServiceRoleClient();

  // Find demo user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const demoUser = users.find(u => u.email === DEMO_EMAIL);
  if (!demoUser) return NextResponse.json({ error: "Demo user not found" }, { status: 404 });

  const userId = demoUser.id;

  // Wipe existing demo events (cascade deletes branding, form, faq)
  await supabase.schema("ahaa").from("events").delete().eq("organiser_id", userId);

  // Re-seed
  for (const ev of EVENTS) {
    const { sections, fields, faq, branding, ...eventData } = ev;

    const { data: created } = await supabase.schema("ahaa").from("events")
      .insert({ ...eventData, organiser_id: userId })
      .select().single();

    if (!created) continue;
    const eventId = created.id;

    await supabase.schema("ahaa").from("event_branding").insert({ event_id: eventId, ...branding });

    if (faq.length) {
      await supabase.schema("ahaa").from("event_faq")
        .insert(faq.map((f, i) => ({ event_id: eventId, ...f, order: i })));
    }

    const sectionIds: string[] = [];
    for (const sec of sections) {
      const { data: s } = await supabase.schema("ahaa").from("form_sections")
        .insert({ event_id: eventId, title: sec.title, order: sec.order })
        .select().single();
      sectionIds.push(s?.id ?? "");
    }

    if (fields.length) {
      await supabase.schema("ahaa").from("form_fields").insert(
        fields.map(f => ({
          event_id: eventId,
          section_id: sectionIds[f.section] ?? null,
          label: f.label,
          type: f.type,
          required: f.required,
          order: f.order,
          char_limit: (f as { char_limit?: number }).char_limit ?? null,
          options: (f as { options?: string[] }).options ?? null,
          helper_text: null,
        }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}
