"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inp = "w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none";
const inpStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError("Invalid email or password"); setLoading(false); return; }
    router.push("/dashboard");
  }

  async function handleDemo() {
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: "demo@ahaaevent.in",
      password: "Demo@12345",
    });
    if (authError) { setError("Demo account not set up yet — run the seed script first."); setLoading(false); return; }
    await fetch("/api/demo/reset", { method: "POST" });
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-icon-bg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="font-bold gradient-text">Ahaa Event Hub</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Sign in to manage your events</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(255,101,104,0.1)", border: "1px solid rgba(255,101,104,0.3)", color: "#ff6568" }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className={inp} style={inpStyle} required />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className={inp} style={inpStyle} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Demo access */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or explore first</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          </div>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              border: "1px solid rgba(96,165,250,0.5)",
              color: "#60a5fa",
              background: "rgba(96,165,250,0.08)",
            }}
          >
            {loading ? "Signing in…" : "✨ Try Demo Account"}
          </button>
          <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
            3 sample events pre-loaded · no signup needed
          </p>
        </div>

        <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--color-blue)" }} className="font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
