import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "Missing event_id" }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .schema("ahaa")
    .from("event_faq")
    .select("*")
    .eq("event_id", eventId)
    .order("order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data: existing } = await supabase
    .schema("ahaa")
    .from("event_faq")
    .select("order")
    .eq("event_id", body.event_id)
    .order("order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = existing ? existing.order + 1 : 0;

  const { data, error } = await supabase
    .schema("ahaa")
    .from("event_faq")
    .insert({ event_id: body.event_id, question: body.question, answer: body.answer, order: nextOrder })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
