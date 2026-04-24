"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DemoButton() {
  const [status, setStatus] = useState<"idle" | "signing-in" | "resetting" | "done">("idle");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleDemo() {
    setError("");
    setStatus("signing-in");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: "demo@ahaaevent.in",
      password: "Demo@12345",
    });

    if (authError) {
      setError("Demo not available right now.");
      setStatus("idle");
      return;
    }

    setStatus("resetting");
    await fetch("/api/demo/reset", { method: "POST" });

    setStatus("done");
    router.push("/dashboard");
  }

  const label = {
    idle:       "✨ Try Demo — no signup needed",
    "signing-in": "Signing in…",
    resetting:  "Resetting demo data…",
    done:       "Loading dashboard…",
  }[status];

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        onClick={handleDemo}
        disabled={status !== "idle"}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
        style={{
          border: "1px solid rgba(96,165,250,0.5)",
          color: "#60a5fa",
          background: "rgba(96,165,250,0.08)",
        }}
      >
        {label}
      </button>
      {error && <p className="text-xs" style={{ color: "#ff6568" }}>{error}</p>}
      {status !== "idle" && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Fresh demo data loading…
        </p>
      )}
    </div>
  );
}
