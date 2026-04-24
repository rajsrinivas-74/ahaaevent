import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch source event
  const { data: src } = await supabase.schema("ahaa").from("events")
    .select("*").eq("id", params.id).eq("organiser_id", user.id).single();
  if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate unique join code
  const newCode = `${src.join_code.slice(0, 4)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Create cloned event
  const { data: cloned, error } = await supabase.schema("ahaa").from("events").insert({
    organiser_id: user.id,
    name: `${src.name} (Copy)`,
    type: src.type,
    theme: src.theme,
    description: src.description,
    tagline: src.tagline,
    timezone: src.timezone,
    venue_type: src.venue_type,
    meeting_link: src.meeting_link,
    max_participants: src.max_participants,
    join_code: newCode,
    join_code_mode: "auto",
    status: "draft",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clone branding
  const { data: branding } = await supabase.schema("ahaa").from("event_branding")
    .select("*").eq("event_id", params.id).single();
  if (branding) {
    await supabase.schema("ahaa").from("event_branding").insert({
      event_id: cloned.id,
      logo_url: branding.logo_url,
      banner_url: branding.banner_url,
      primary_color: branding.primary_color,
      background_color: branding.background_color,
      accent_color: branding.accent_color,
      font_preset: branding.font_preset,
    });
  }

  // Clone form fields
  const { data: fields } = await supabase.schema("ahaa").from("form_fields")
    .select("*").eq("event_id", params.id).order("order");
  if (fields?.length) {
    await supabase.schema("ahaa").from("form_fields").insert(
      fields.map(f => ({
        event_id: cloned.id,
        section_id: null,
        label: f.label,
        type: f.type,
        helper_text: f.helper_text,
        required: f.required,
        char_limit: f.char_limit,
        options: f.options,
        order: f.order,
      }))
    );
  }

  // Clone FAQs
  const { data: faqs } = await supabase.schema("ahaa").from("event_faq")
    .select("*").eq("event_id", params.id).order("order");
  if (faqs?.length) {
    await supabase.schema("ahaa").from("event_faq").insert(
      faqs.map(f => ({
        event_id: cloned.id,
        question: f.question,
        answer: f.answer,
        order: f.order,
      }))
    );
  }

  return NextResponse.json({ id: cloned.id });
}
