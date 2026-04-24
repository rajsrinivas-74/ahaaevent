import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ available: false, error: "No code provided" });
  }

  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .schema("ahaa")
    .from("events")
    .select("id")
    .eq("join_code", code)
    .single();

  return NextResponse.json({ available: !data });
}
