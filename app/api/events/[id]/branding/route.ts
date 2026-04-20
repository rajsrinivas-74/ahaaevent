import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event } = await supabase
    .schema("eventmanager")
    .from("events")
    .select("organiser_id")
    .eq("id", params.id)
    .single();

  if (!event || event.organiser_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let { data: branding } = await supabase
    .schema("eventmanager")
    .from("event_branding")
    .select("*")
    .eq("event_id", params.id)
    .single();

  // Upsert: create with defaults if not exists
  if (!branding) {
    const { data: newBranding } = await supabase
      .schema("eventmanager")
      .from("event_branding")
      .insert({
        event_id: params.id,
        primary_color: "#2563EB",
        background_color: "#0F172A",
        accent_color: "#1E40AF",
        font_preset: "Inter",
      })
      .select()
      .single();
    branding = newBranding;
  }

  return NextResponse.json(branding);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: event } = await supabase
    .schema("eventmanager")
    .from("events")
    .select("organiser_id")
    .eq("id", params.id)
    .single();

  if (!event || event.organiser_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .schema("eventmanager")
    .from("event_branding")
    .upsert({
      event_id: params.id,
      logo_url: body.logo_url ?? null,
      banner_url: body.banner_url ?? null,
      primary_color: body.primary_color || "#2563EB",
      background_color: body.background_color || "#0F172A",
      accent_color: body.accent_color || "#1E40AF",
      font_preset: body.font_preset || "Inter",
      updated_at: new Date().toISOString(),
    }, { onConflict: "event_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
