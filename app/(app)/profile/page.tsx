"use client";

import { useEffect, useState } from "react";
import type { Organiser } from "@/lib/types";
import { CardSkeleton } from "@/components/skeleton";
import { useToast } from "@/components/toast";

const inp = "w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none";
const inpStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)" };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Organiser>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  function set(patch: Partial<Organiser>) {
    setProfile(p => ({ ...p, ...patch }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        organisation: profile.organisation,
        website: profile.website,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        instagram: profile.instagram,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      toast("Failed to save profile", "error");
    } else {
      setProfile(data);
      toast("Profile saved");
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="space-y-4 max-w-xl">
      <div className="h-7 w-28 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      <CardSkeleton rows={3} />
      <CardSkeleton rows={4} />
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Your organiser identity shown on event pages</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        {/* Identity */}
        <div className="card space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Identity</p>

          <Field label="Full Name">
            <input value={profile.name || ""} onChange={e => set({ name: e.target.value })}
              placeholder="Your name" className={inp} style={inpStyle} />
          </Field>

          <Field label="Organisation" hint="Company, college, or team name">
            <input value={profile.organisation || ""} onChange={e => set({ organisation: e.target.value })}
              placeholder="e.g. AI Orchestration Labs" className={inp} style={inpStyle} />
          </Field>

          <Field label="Email">
            <input value={profile.email || ""} disabled
              className={inp} style={{ ...inpStyle, opacity: 0.5, cursor: "not-allowed" }} />
          </Field>
        </div>

        {/* Social links */}
        <div className="card space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Social Links</p>

          <Field label="Website">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--color-text-muted)" }}>🌐</span>
              <input value={profile.website || ""} onChange={e => set({ website: e.target.value })}
                placeholder="https://yoursite.com" type="url"
                className={inp} style={{ ...inpStyle, paddingLeft: "2rem" }} />
            </div>
          </Field>

          <Field label="LinkedIn">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--color-text-muted)" }}>in</span>
              <input value={profile.linkedin || ""} onChange={e => set({ linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className={inp} style={{ ...inpStyle, paddingLeft: "2rem" }} />
            </div>
          </Field>

          <Field label="Twitter / X">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>𝕏</span>
              <input value={profile.twitter || ""} onChange={e => set({ twitter: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
                className={inp} style={{ ...inpStyle, paddingLeft: "2rem" }} />
            </div>
          </Field>

          <Field label="Instagram">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--color-text-muted)" }}>📷</span>
              <input value={profile.instagram || ""} onChange={e => set({ instagram: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className={inp} style={{ ...inpStyle, paddingLeft: "2rem" }} />
            </div>
          </Field>
        </div>

        {error && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(255,101,104,0.1)", border: "1px solid rgba(255,101,104,0.3)", color: "#ff6568" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 font-semibold">
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
