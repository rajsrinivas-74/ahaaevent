import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Webhook called by Ahaa Hub when a participant registers for an event.
// Expected body: { join_code: string, secret: string }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { join_code, secret } = body;

  // Simple shared secret auth — set WEBHOOK_SECRET in env
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!join_code) return NextResponse.json({ error: "Missing join_code" }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: event } = await supabase.schema("ahaa").from("events")
    .select("id, registration_count").eq("join_code", join_code).single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const { error } = await supabase.schema("ahaa").from("events")
    .update({ registration_count: (event.registration_count || 0) + 1 })
    .eq("id", event.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, registration_count: (event.registration_count || 0) + 1 });
}
