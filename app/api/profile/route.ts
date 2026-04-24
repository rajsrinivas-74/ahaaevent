import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.schema("ahaa").from("organisers")
    .select("*").eq("id", user.id).single();

  return NextResponse.json(data || { id: user.id, email: user.email, name: "", organisation: null, website: null, linkedin: null, twitter: null, instagram: null });
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["name", "organisation", "website", "linkedin", "twitter", "instagram"];
  const patch: Record<string, string | null> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key] || null;
  }

  const { data: existing } = await supabase.schema("ahaa").from("organisers")
    .select("id").eq("id", user.id).single();

  if (existing) {
    const { data, error } = await supabase.schema("ahaa").from("organisers")
      .update(patch).eq("id", user.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase.schema("ahaa").from("organisers")
      .insert({ id: user.id, email: user.email, ...patch }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
