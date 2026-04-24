"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { useToast } from "@/components/toast";
import { CardSkeleton } from "@/components/skeleton";

const STATUS_OPTIONS = [
  { value: "draft",  label: "Draft",  desc: "Only you can see this event",             color: "var(--color-blue)" },
  { value: "live",   label: "Live",   desc: "Public event page is visible and shareable", color: "#00c758" },
  { value: "closed", label: "Closed", desc: "Event has ended, page shows as closed",    color: "#ff6568" },
];

const CHECKLIST: { key: keyof CheckFlags; label: string; href: string }[] = [
  { key: "hasName",        label: "Event name set",            href: "edit"     },
  { key: "hasDescription", label: "Description added",         href: "edit"     },
  { key: "hasStartDate",   label: "Start date set",            href: "edit"     },
  { key: "hasEndDate",     label: "End date set",              href: "edit"     },
  { key: "hasVenue",       label: "Venue / format selected",   href: "edit"     },
  { key: "hasCriteria",    label: "Judging criteria defined",  href: "evaluation" },
  { key: "hasBranding",    label: "Branding configured",       href: "branding" },
  { key: "hasForm",        label: "Submission form built",     href: "form"     },
];

interface CheckFlags {
  hasName: boolean;
  hasDescription: boolean;
  hasStartDate: boolean;
  hasEndDate: boolean;
  hasVenue: boolean;
  hasCriteria: boolean;
  hasBranding: boolean;
  hasForm: boolean;
}

function ShareButtons({ url, name }: { url: string; name: string }) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(`Join "${name}" — register now!`);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => { navigator.clipboard.writeText(url); }}
        className="btn-secondary text-xs px-3 py-1.5"
      >
        Copy Link
      </button>
      <a
        href={`https://wa.me/?text=${text}%20${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="btn-secondary text-xs px-3 py-1.5"
        style={{ color: "#25d366" }}
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encoded}`}
        target="_blank" rel="noopener noreferrer"
        className="btn-secondary text-xs px-3 py-1.5"
        style={{ color: "#1d9bf0" }}
      >
        𝕏 Twitter
      </a>
      <a
        href={`mailto:?subject=${encodeURIComponent(name)}&body=${text}%20${encoded}`}
        className="btn-secondary text-xs px-3 py-1.5"
      >
        Email
      </a>
    </div>
  );
}

export default function SettingsPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("draft");
  const [joinCodeMode, setJoinCodeMode] = useState("auto");
  const [joinCode, setJoinCode] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  const [checks, setChecks] = useState<CheckFlags>({ hasName: false, hasDescription: false, hasStartDate: false, hasEndDate: false, hasVenue: false, hasCriteria: false, hasBranding: false, hasForm: false });
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.json()),
      fetch(`/api/events/${eventId}/branding`).then(r => r.json()),
      fetch(`/api/events/${eventId}/form`).then(r => r.json()),
    ]).then(([d, branding, form]: [Event, { primary_color?: string }, { fields?: unknown[] }]) => {
      setEvent(d);
      setStatus(d.status);
      setJoinCodeMode(d.join_code_mode);
      setJoinCode(d.join_code);
      setMaxParticipants(d.max_participants?.toString() || "");
      setExpiresAt(d.expires_at?.slice(0, 16) || "");
      setChecks({
        hasName:        !!d.name,
        hasDescription: !!d.description,
        hasStartDate:   !!d.start_date,
        hasEndDate:     !!d.end_date,
        hasVenue:       !!d.venue_type,
        hasCriteria:    !!(d.judging_criteria && (d.judging_criteria as unknown[]).length > 0),
        hasBranding:    !!(branding?.primary_color && branding.primary_color !== "#2563EB"),
        hasForm:        !!(Array.isArray(form) ? form.length : (form as { fields?: unknown[] })?.fields?.length),
      });
      setLoading(false);
    });
  }, [eventId]);

  async function checkJoinCode(code: string) {
    if (!code || code === event?.join_code) { setCodeAvailable(null); return; }
    setCheckingCode(true);
    const res = await fetch(`/api/events/check-join-code?code=${code}`);
    const { available } = await res.json();
    setCodeAvailable(available);
    setCheckingCode(false);
  }

  async function handleSave() {
    setError("");
    if (joinCodeMode === "custom" && codeAvailable === false)
      return setError("That join code is already taken.");

    setSaving(true);
    const res = await fetch(`/api/events/${eventId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        join_code_mode: joinCodeMode,
        join_code: joinCodeMode === "custom" ? joinCode : undefined,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        expires_at: expiresAt || null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setEvent(updated);
      setJoinCode(updated.join_code);
      toast("Settings saved");
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      toast("Event deleted");
      router.push("/dashboard");
    } else {
      toast("Delete failed", "error");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <div className="h-7 w-48 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      <CardSkeleton rows={3} /><CardSkeleton rows={2} /><CardSkeleton rows={1} />
    </div>
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/e/${event?.join_code}`;
  const failedChecks = CHECKLIST.filter(c => !checks[c.key]);
  const readyToLive = failedChecks.length === 0;
  const goingLive = status === "live" && event?.status !== "live";
  const blocked = goingLive && !readyToLive;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish & Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Control visibility, join code, and participant limits</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{event?.visitor_count ?? 0}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>👁 Visitors</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold">{event?.registration_count ?? 0}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>✅ Registrations</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(255,101,104,0.1)", border: "1px solid rgba(255,101,104,0.3)", color: "#ff6568" }}>
          {error}
        </div>
      )}

      {/* Pre-publish checklist — always visible, hard-blocks when going live with failures */}
      <div className="card space-y-3" style={{
        border: blocked ? "1px solid rgba(255,101,104,0.5)" : readyToLive ? "1px solid rgba(0,199,88,0.3)" : "1px solid var(--color-border)",
        background: blocked ? "rgba(255,101,104,0.05)" : readyToLive ? "rgba(0,199,88,0.05)" : undefined,
      }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Publish Checklist
          </p>
          {readyToLive
            ? <span className="text-xs font-semibold" style={{ color: "#00c758" }}>✓ Ready to publish</span>
            : <span className="text-xs" style={{ color: "#fbbf24" }}>{failedChecks.length} item{failedChecks.length > 1 ? "s" : ""} missing</span>
          }
        </div>
        <ul className="space-y-2">
          {CHECKLIST.map(c => (
            <li key={c.key} className="flex items-center gap-2 text-sm">
              <span className="flex-shrink-0 w-4 text-center" style={{ color: checks[c.key] ? "#00c758" : "#ff6568" }}>
                {checks[c.key] ? "✓" : "✗"}
              </span>
              <span style={{ color: checks[c.key] ? "var(--color-text-muted)" : "var(--color-text)", textDecoration: checks[c.key] ? "line-through" : "none" }}>
                {c.label}
              </span>
              {!checks[c.key] && (
                <Link href={`/events/${eventId}/${c.href}`} className="ml-auto text-xs flex-shrink-0"
                  style={{ color: "var(--color-blue)" }}>Fix →</Link>
              )}
            </li>
          ))}
        </ul>
        {blocked && (
          <p className="text-xs pt-1" style={{ color: "#ff6568" }}>
            Fix the items above before switching to Live.
          </p>
        )}
      </div>

      {/* Status */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Event Status</p>
        <div className="space-y-2">
          {STATUS_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer rounded-xl p-3 transition-colors"
              style={{ background: status === opt.value ? `${opt.color}12` : "transparent", border: `1px solid ${status === opt.value ? `${opt.color}50` : "var(--color-border)"}` }}>
              <input type="radio" name="status" value={opt.value} checked={status === opt.value}
                onChange={() => setStatus(opt.value)} className="mt-0.5 accent-blue-500" />
              <div>
                <p className="text-sm font-medium" style={{ color: status === opt.value ? opt.color : "var(--color-text)" }}>{opt.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Public URL — always shown */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Public URL</p>
          {event?.status !== "live" && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.12)", color: "var(--color-blue)", border: "1px solid rgba(96,165,250,0.3)" }}>
              Visible after publishing
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs px-3 py-2 rounded-xl truncate" style={{ background: "var(--color-bg)", color: "var(--color-blue)", border: "1px solid var(--color-border)" }}>
            {publicUrl}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(publicUrl); toast("URL copied", "info"); }}
            className="btn-secondary flex-shrink-0 text-xs px-3 py-2"
          >
            Copy
          </button>
        </div>
        {event?.status === "live" && <ShareButtons url={publicUrl} name={event.name} />}
      </div>

      {/* Join code */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Join Code</p>
        <div className="flex gap-4">
          {["auto", "custom"].map(mode => (
            <label key={mode} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="join_code_mode" value={mode} checked={joinCodeMode === mode}
                onChange={() => { setJoinCodeMode(mode); setCodeAvailable(null); }} className="accent-blue-500" />
              {mode === "auto" ? "Auto-generate" : "Custom"}
            </label>
          ))}
        </div>
        {joinCodeMode === "auto" ? (
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono px-3 py-1.5 rounded-xl" style={{ background: "var(--color-bg)", color: "var(--color-blue)", border: "1px solid var(--color-border)" }}>{joinCode}</code>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>auto-generated</span>
          </div>
        ) : (
          <div>
            <input
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setCodeAvailable(null); }}
              onBlur={e => checkJoinCode(e.target.value)}
              placeholder="e.g. HACK2025"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
              maxLength={20}
            />
            {checkingCode && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Checking…</p>}
            {codeAvailable === true  && <p className="text-xs mt-1" style={{ color: "#00c758" }}>✓ Available</p>}
            {codeAvailable === false && <p className="text-xs mt-1" style={{ color: "#ff6568" }}>✗ Already taken</p>}
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Limits & Expiry</p>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Max Participants</label>
          <input
            type="number" value={maxParticipants}
            onChange={e => setMaxParticipants(e.target.value)}
            placeholder="Leave blank for unlimited" min={1}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Auto-close Date</label>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Event automatically moves to Closed after this date</p>
          <input
            type="datetime-local" value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          />
        </div>
      </div>

      <button
        onClick={blocked ? undefined : handleSave}
        disabled={saving || blocked}
        className="btn-primary w-full py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        title={blocked ? "Complete the checklist before going Live" : undefined}
      >
        {saving ? "Saving…" : blocked ? "Complete checklist to publish" : "Save Settings"}
      </button>

      {/* Danger zone */}
      <div className="card space-y-3 mt-8" style={{ border: "1px solid rgba(255,101,104,0.3)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#ff6568" }}>Danger Zone</p>
        <p className="text-sm" style={{ color: "var(--color-text-sec)" }}>
          Permanently delete this event, its branding, form, and FAQ. This cannot be undone.
        </p>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: "rgba(255,101,104,0.1)", border: "1px solid rgba(255,101,104,0.4)", color: "#ff6568" }}
          >
            Delete Event
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "#ff6568" }}>Are you sure? Type the event name to confirm.</p>
            <DeleteConfirm eventName={event?.name || ""} onConfirm={handleDelete} onCancel={() => setDeleteConfirm(false)} deleting={deleting} />
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteConfirm({ eventName, onConfirm, onCancel, deleting }: { eventName: string; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-2">
      <input
        type="text" value={value} onChange={e => setValue(e.target.value)}
        placeholder={eventName}
        className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        style={{ background: "var(--color-bg)", border: "1px solid rgba(255,101,104,0.4)", color: "var(--color-text)" }}
      />
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={value !== eventName || deleting}
          className="text-sm px-4 py-2 rounded-xl font-semibold disabled:opacity-40"
          style={{ background: "rgba(255,101,104,0.15)", border: "1px solid rgba(255,101,104,0.4)", color: "#ff6568" }}
        >
          {deleting ? "Deleting…" : "Confirm Delete"}
        </button>
      </div>
    </div>
  );
}
