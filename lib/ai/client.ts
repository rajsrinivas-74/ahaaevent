const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function tryAnthropic(systemPrompt: string, userMessage: string): Promise<string | null> {
  try {
    const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    console.log(`[Anthropic] status=${res.status} model=${model} error=${JSON.stringify(data.error)}`);
    if (!res.ok) return null;
    return data.content?.[0]?.text || null;
  } catch (e) {
    console.log("[Anthropic] threw:", e);
    return null;
  }
}

async function tryOpenRouter(systemPrompt: string, userMessage: string): Promise<string | null> {
  try {
    const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Ahaa Event Hub",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    console.log(`[OpenRouter] ${model} status=${res.status} error=${JSON.stringify(data.error)}`);
    if (!res.ok) return null;
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.log("[OpenRouter] threw:", e);
    return null;
  }
}

export async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  // Prefer Anthropic direct if key is set, fall back to OpenRouter
  if (process.env.ANTHROPIC_API_KEY) {
    const result = await tryAnthropic(systemPrompt, userMessage);
    if (result) return result;
    console.log("[AI] Anthropic failed, falling back to OpenRouter");
  }

  if (process.env.OPENROUTER_API_KEY) {
    const result = await tryOpenRouter(systemPrompt, userMessage);
    if (result) return result;
  }

  return "";
}
