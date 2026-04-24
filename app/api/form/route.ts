import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: sections }, { data: fields }] = await Promise.all([
    supabase.schema("ahaa").from("form_sections").select("*").eq("event_id", eventId).order("order"),
    supabase.schema("ahaa").from("form_fields").select("*").eq("event_id", eventId).order("order"),
  ]);

  return NextResponse.json({ sections: sections || [], fields: fields || [] });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.type === "section") {
    const { data: last } = await supabase.schema("ahaa").from("form_sections")
      .select("order").eq("event_id", body.event_id).order("order", { ascending: false }).limit(1).single();

    const { data, error } = await supabase.schema("ahaa").from("form_sections")
      .insert({ event_id: body.event_id, title: body.title, order: last ? last.order + 1 : 0 })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // field
  const { data: last } = await supabase.schema("ahaa").from("form_fields")
    .select("order").eq("event_id", body.event_id).order("order", { ascending: false }).limit(1).single();

  const { data, error } = await supabase.schema("ahaa").from("form_fields")
    .insert({
      event_id: body.event_id,
      section_id: body.section_id || null,
      label: body.label,
      type: body.field_type,
      helper_text: body.helper_text || null,
      required: body.required || false,
      char_limit: body.char_limit || null,
      options: body.options || null,
      order: last ? last.order + 1 : 0,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
