"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inp = "w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none";
const inpStyle = { background: "var(--color-card)", border: "1px solid var(--color-border)" };

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    if (data.user) {
      const { error: dbError } = await supabase.schema("ahaa").from("organisers")
        .insert({ id: data.user.id, email, name });
      if (dbError) { setError(dbError.message); setLoading(false); return; }
    }

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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Start creating branded events in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(255,101,104,0.1)", border: "1px solid rgba(255,101,104,0.3)", color: "#ff6568" }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" autoComplete="name"
              className={inp} style={inpStyle} required />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className={inp} style={inpStyle} required />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters" autoComplete="new-password"
              minLength={6} className={inp} style={inpStyle} required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--color-blue)" }} className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
