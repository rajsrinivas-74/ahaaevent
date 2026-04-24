import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .schema("ahaa")
    .from("events")
    .select("*")
    .eq("organiser_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const joinCode = body.join_code_mode === "custom" && body.join_code
    ? body.join_code
    : generateJoinCode();

  const { data, error } = await supabase
    .schema("ahaa")
    .from("events")
    .insert({
      organiser_id: user.id,
      name: body.name,
      type: body.type || "hackathon",
      theme: body.theme || null,
      description: body.description || null,
      tagline: body.tagline || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      timezone: body.timezone || "Asia/Kolkata",
      venue_type: body.venue_type || null,
      meeting_link: body.meeting_link || null,
      max_participants: body.max_participants || null,
      join_code: joinCode,
      join_code_mode: body.join_code_mode || "auto",
      status: "draft",
      submission_deadline: body.submission_deadline || null,
      team_min: body.team_min || null,
      team_max: body.team_max || null,
      eligibility: body.eligibility || null,
      contact_email: body.contact_email || null,
      tracks: body.tracks || null,
      prizes: body.prizes || null,
      judging_criteria: body.judging_criteria || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
