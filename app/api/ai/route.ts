import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai/client";
import { REFINE_DESCRIPTION_PROMPT, SUGGEST_TAGLINE_PROMPT, GENERATE_EVENT_PROMPT, SUGGEST_PALETTE_PROMPT } from "@/lib/ai/prompts";

function parseJSON(raw: string) {
  // Strip markdown code fences and find the JSON object/array
  let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  // Extract first {...} block in case model added preamble text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  console.log("[AI] raw:", raw.slice(0, 300));
  console.log("[AI] cleaned:", cleaned.slice(0, 300));
  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENROUTER_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { action, name, description, type, theme } = body;

  if (action === "refine_description") {
    if (!description) return NextResponse.json({ error: "Missing description" }, { status: 400 });
    const result = await callAI(REFINE_DESCRIPTION_PROMPT, description);
    return NextResponse.json({ result });
  }

  if (action === "suggest_tagline") {
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const input = `Event name: ${name}\nDescription: ${description || ""}`;
    const result = await callAI(SUGGEST_TAGLINE_PROMPT, input);
    return NextResponse.json({ result });
  }

  if (action === "suggest_palette") {
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const input = `Event name: ${name}\nEvent type: ${type || "event"}\nTheme: ${theme || "none"}`;
    const raw = await callAI(SUGGEST_PALETTE_PROMPT, input);
    try {
      const parsed = parseJSON(raw);
      if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 422 });
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }
  }

  if (action === "generate_event") {
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const input = `Event name: ${name}\nEvent type: ${type || "event"}\nTheme: ${theme || "none"}`;
    const raw = await callAI(GENERATE_EVENT_PROMPT, input);
    try {
      const parsed = parseJSON(raw);
      if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 422 });
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
