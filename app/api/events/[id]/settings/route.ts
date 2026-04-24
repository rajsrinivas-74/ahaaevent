import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase.schema("ahaa").from("events")
    .select("organiser_id, join_code").eq("id", params.id).single();

  if (!existing || existing.organiser_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.status) updates.status = body.status;
  if (body.join_code_mode) updates.join_code_mode = body.join_code_mode;
  if (body.join_code) {
    // check uniqueness
    const { data: conflict } = await supabase.schema("ahaa").from("events")
      .select("id").eq("join_code", body.join_code).neq("id", params.id).single();
    if (conflict) return NextResponse.json({ error: "Join code already taken" }, { status: 409 });
    updates.join_code = body.join_code;
  }
  if (body.max_participants !== undefined) updates.max_participants = body.max_participants;
  if ("expires_at" in body) updates.expires_at = body.expires_at;

  const { data, error } = await supabase.schema("ahaa").from("events")
    .update(updates).eq("id", params.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
