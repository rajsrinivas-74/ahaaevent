import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { joinCode: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: event } = await supabase.schema("ahaa").from("events")
    .select("*").eq("join_code", params.joinCode).single();

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: branding }, { data: faq }, { data: sections }, { data: fields }] = await Promise.all([
    supabase.schema("ahaa").from("event_branding").select("*").eq("event_id", event.id).single(),
    supabase.schema("ahaa").from("event_faq").select("*").eq("event_id", event.id).order("order"),
    supabase.schema("ahaa").from("form_sections").select("*").eq("event_id", event.id).order("order"),
    supabase.schema("ahaa").from("form_fields").select("*").eq("event_id", event.id).order("order"),
  ]);

  // increment visitor count
  await supabase.schema("ahaa").from("events")
    .update({ visitor_count: (event.visitor_count || 0) + 1 })
    .eq("id", event.id);

  return NextResponse.json({ event, branding, faq: faq || [], sections: sections || [], fields: fields || [] });
}
