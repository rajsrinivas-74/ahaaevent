"use client";

import { useEffect, useRef, useState } from "react";
import type { Event, EventType, VenueType, JoinCodeMode } from "@/lib/types";


const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: "hackathon",            label: "Hackathon",            emoji: "⚡" },
  { value: "ideathon",             label: "Ideathon",             emoji: "💡" },
  { value: "pitch_competition",    label: "Pitch Competition",    emoji: "🎤" },
  { value: "innovation_challenge", label: "Innovation Challenge", emoji: "🚀" },
  { value: "workshop",             label: "Workshop",             emoji: "🛠️" },
  { value: "other",                label: "Other",                emoji: "📌" },
];

const VENUE_TYPES: { value: VenueType; label: string; emoji: string; desc: string }[] = [
  { value: "online",    label: "Online",    emoji: "🌐", desc: "Fully virtual" },
  { value: "in_person", label: "In Person", emoji: "📍", desc: "Physical venue" },
  { value: "hybrid",    label: "Hybrid",    emoji: "🔀", desc: "Both online & offline" },
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Singapore", "Asia/Dubai", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles",
  "Australia/Sydney", "UTC",
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EventFormProps {
  initialData?: Event | null;
  mode?: "create" | "edit";
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{hint}</p>}
      {error && <p className="text-xs" style={{ color: "#ff6568" }}>{error}</p>}
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map: Record<Exclude<SaveStatus, "idle">, { text: string; color: string }> = {
    saving: { text: "Saving draft…",  color: "var(--color-text-muted)" },
    saved:  { text: "Draft saved ✓",  color: "#00c758" },
    error:  { text: "Save failed",    color: "#ff6568" },
  };
  const { text, color } = map[status as Exclude<SaveStatus, "idle">];
  return (
    <span className="text-xs font-medium transition-opacity" style={{ color }}>
      {text}
    </span>
  );
}

const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors";
const inputStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };

export function EventForm({ initialData, mode = "create", onSubmit }: EventFormProps) {
  const isPublished = initialData?.status === "live";
  const isEdit = mode === "edit";

  const [name, setName]               = useState(initialData?.name || "");
  const [type, setType]               = useState<EventType>(initialData?.type || "hackathon");
  const [theme, setTheme]             = useState(initialData?.theme || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagline, setTagline]         = useState(initialData?.tagline || "");
  const [regStart, setRegStart]       = useState(initialData?.registration_start?.slice(0, 16) || "");
  const [regEnd, setRegEnd]           = useState(initialData?.registration_end?.slice(0, 16) || "");
  const [startDate, setStartDate]     = useState(initialData?.start_date?.slice(0, 16) || "");
  const [endDate, setEndDate]         = useState(initialData?.end_date?.slice(0, 16) || "");
  const [timezone, setTimezone]       = useState(initialData?.timezone || "Asia/Kolkata");
  const [venueType, setVenueType]     = useState<VenueType | "">(initialData?.venue_type || "");
  const [meetingLink, setMeetingLink] = useState(initialData?.meeting_link || "");
  const [maxParticipants, setMaxParticipants] = useState(initialData?.max_participants?.toString() || "");
  const [joinCodeMode, setJoinCodeMode] = useState<JoinCodeMode>(initialData?.join_code_mode || "auto");
  const [joinCode, setJoinCode]       = useState(initialData?.join_code || "");
  const [joinCodeAvailable, setJoinCodeAvailable] = useState<boolean | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  // Participation
  const [teamMin, setTeamMin]           = useState(initialData?.team_min?.toString() || "");
  const [teamMax, setTeamMax]           = useState(initialData?.team_max?.toString() || "");
  const [eligibility, setEligibility]   = useState(initialData?.eligibility || "");
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || "");
  const [tracks, setTracks]             = useState<string[]>(initialData?.tracks || []);
  const [trackInput, setTrackInput]     = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState(initialData?.submission_deadline?.slice(0, 16) || "");
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  const needsJoinCode = venueType === "online" || venueType === "hybrid";

  function buildPayload() {
    return {
      name, type,
      theme: theme || null,
      description: description || null,
      tagline: tagline || null,
      registration_start: regStart || null,
      registration_end: regEnd || null,
      start_date: startDate || null,
      end_date: endDate || null,
      submission_deadline: submissionDeadline || null,
      timezone,
      venue_type: venueType || null,
      meeting_link: (venueType === "online" || venueType === "hybrid") ? (meetingLink || null) : null,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      join_code_mode: needsJoinCode ? joinCodeMode : "auto",
      join_code: needsJoinCode && joinCodeMode === "custom" ? joinCode : undefined,
      team_min: teamMin ? parseInt(teamMin) : null,
      team_max: teamMax ? parseInt(teamMax) : null,
      eligibility: eligibility || null,
      contact_email: contactEmail || null,
      tracks: tracks.length > 0 ? tracks : null,
    };
  }

  async function autoSave(payload: Record<string, unknown>) {
    setSaveStatus("saving");
    try {
      await onSubmit(payload);
      setSaveStatus("saved");
      if (savedRef.current) clearTimeout(savedRef.current);
      savedRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  }

  // Auto-save on change — only in edit mode, 2s debounce
  useEffect(() => {
    if (!isEdit) return;
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (!name.trim()) return; // don't auto-save without a name
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => autoSave(buildPayload()), 2000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, type, theme, description, tagline, regStart, regEnd, startDate, endDate, submissionDeadline, timezone, venueType, meetingLink, maxParticipants, teamMin, teamMax, eligibility, contactEmail, tracks]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Event name is required";
    if (endDate && startDate && endDate < startDate) e.endDate = "End date must be after start date";
    if (needsJoinCode && joinCodeMode === "custom" && !joinCode.trim()) e.joinCode = "Enter a custom join code";
    if (needsJoinCode && joinCodeMode === "custom" && joinCodeAvailable === false) e.joinCode = "This join code is already taken";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function checkJoinCode(code: string) {
    if (!code.trim() || code === initialData?.join_code) { setJoinCodeAvailable(null); return; }
    setCheckingCode(true);
    const res = await fetch(`/api/events/check-join-code?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    setJoinCodeAvailable(data.available);
    setCheckingCode(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSubmit(buildPayload());
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {isPublished && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: "rgba(59,130,166,0.1)", border: "1px solid rgba(59,130,166,0.3)", color: "var(--color-blue)" }}>
          <span>🔒</span>
          <span>This event is live. Some fields are locked — edit description, tagline, and dates freely.</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Basic Info</p>

        <Field label="Event Name *" error={errors.name}>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            disabled={isPublished} placeholder="e.g. HackFest 2025"
            className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
          />
        </Field>

        <Field label="Event Type *">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EVENT_TYPES.map(t => (
              <button
                key={t.value} type="button"
                onClick={() => !isPublished && setType(t.value)}
                disabled={isPublished}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: type === t.value ? "rgba(96,165,250,0.15)" : "var(--color-bg)",
                  border: `1px solid ${type === t.value ? "rgba(96,165,250,0.5)" : "var(--color-border)"}`,
                  color: type === t.value ? "var(--color-blue)" : "var(--color-text-sec)",
                  cursor: isPublished ? "not-allowed" : "pointer",
                  opacity: isPublished ? 0.5 : 1,
                }}
              >
                <span className="text-lg">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Theme" hint="e.g. Sustainability, FinTech, AI for Good">
          <input
            type="text" value={theme} onChange={e => setTheme(e.target.value)}
            disabled={isPublished} placeholder="Optional focus area"
            className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
          />
        </Field>

        <Field label="Tagline" hint="A short punchy line shown on your event page">
          <input
            type="text" value={tagline} onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Build. Break. Innovate."
            className={inputClass} style={inputStyle}
            maxLength={100}
          />
          <p className="text-xs text-right" style={{ color: "var(--color-text-muted)" }}>{tagline.length}/100</p>
        </Field>

        <Field label="Description" hint="Shown on the public event page">
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            rows={4} placeholder="Tell participants what your event is about…"
            className={inputClass} style={{ ...inputStyle, resize: "none" }}
          />
        </Field>
      </div>

      {/* Schedule */}
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Schedule</p>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>Registration Window</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Registration Opens">
              <input
                type="datetime-local" value={regStart} onChange={e => setRegStart(e.target.value)}
                className={inputClass} style={inputStyle}
              />
            </Field>
            <Field label="Registration Closes">
              <input
                type="datetime-local" value={regEnd} onChange={e => setRegEnd(e.target.value)}
                min={regStart}
                className={inputClass} style={inputStyle}
              />
            </Field>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>Event Dates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Event Start">
              <input
                type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={inputClass} style={inputStyle}
              />
            </Field>
            <Field label="Event End" error={errors.endDate}>
              <input
                type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className={inputClass} style={inputStyle}
              />
            </Field>
          </div>
        </div>

        <Field label="Timezone">
          <select
            value={timezone} onChange={e => setTimezone(e.target.value)}
            disabled={isPublished}
            className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </Field>
      </div>

      {/* Venue */}
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Venue</p>

        <Field label="Format">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VENUE_TYPES.map(v => (
              <button
                key={v.value} type="button"
                onClick={() => { if (!isPublished) { setVenueType(v.value); if (v.value === "in_person") setJoinCodeMode("auto"); } }}
                disabled={isPublished}
                className="flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all"
                style={{
                  background: venueType === v.value ? "rgba(167,139,250,0.15)" : "var(--color-bg)",
                  border: `1px solid ${venueType === v.value ? "rgba(167,139,250,0.5)" : "var(--color-border)"}`,
                  cursor: isPublished ? "not-allowed" : "pointer",
                  opacity: isPublished ? 0.5 : 1,
                }}
              >
                <span className="text-lg">{v.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: venueType === v.value ? "var(--color-purple)" : "var(--color-text)" }}>{v.label}</span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{v.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        {(venueType === "online" || venueType === "hybrid") && (
          <Field label="Meeting Link" hint="Zoom, Google Meet, Teams, etc.">
            <input
              type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
              disabled={isPublished} placeholder="https://"
              className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
            />
          </Field>
        )}

        <Field label="Max Participants" hint="Leave blank for unlimited">
          <input
            type="number" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)}
            disabled={isPublished} min={1} placeholder="Unlimited"
            className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
          />
        </Field>
      </div>

      {/* Participation */}
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Participation</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Min Team Size" hint="1 = solo allowed">
            <input
              type="number" value={teamMin} onChange={e => setTeamMin(e.target.value)}
              disabled={isPublished} min={1} max={teamMax || undefined} placeholder="1"
              className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
            />
          </Field>
          <Field label="Max Team Size" hint="Leave blank for no limit">
            <input
              type="number" value={teamMax} onChange={e => setTeamMax(e.target.value)}
              disabled={isPublished} min={teamMin || 1} placeholder="Unlimited"
              className={inputClass} style={{ ...inputStyle, opacity: isPublished ? 0.5 : 1 }}
            />
          </Field>
        </div>

        <Field label="Eligibility" hint="e.g. Open to all, College students only, 18+ only">
          <input
            type="text" value={eligibility} onChange={e => setEligibility(e.target.value)}
            placeholder="Who can participate?"
            className={inputClass} style={inputStyle}
          />
        </Field>

        <Field label="Contact Email" hint="Shown on public page for participant queries">
          <input
            type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
            placeholder="support@yourevent.in"
            className={inputClass} style={inputStyle}
          />
        </Field>

        <Field label="Submission Deadline" hint="When participants must submit their work">
          <input
            type="datetime-local" value={submissionDeadline} onChange={e => setSubmissionDeadline(e.target.value)}
            className={inputClass} style={inputStyle}
          />
        </Field>

        <div>
          <label className="block text-sm font-medium mb-1.5">Tracks / Categories</label>
          <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>Add tracks participants choose from (e.g. FinTech, HealthTech)</p>
          <div className="flex gap-2 flex-wrap mb-2">
            {tracks.map((t, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(96,165,250,0.15)", color: "var(--color-blue)", border: "1px solid rgba(96,165,250,0.3)" }}>
                {t}
                <button type="button" onClick={() => setTracks(tracks.filter((_, j) => j !== i))}
                  className="ml-0.5 opacity-60 hover:opacity-100" style={{ lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={trackInput} onChange={e => setTrackInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = trackInput.trim(); if (v && !tracks.includes(v)) setTracks([...tracks, v]); setTrackInput(""); }}}
              placeholder="Type a track and press Enter"
              className={inputClass} style={inputStyle}
            />
            <button type="button"
              onClick={() => { const v = trackInput.trim(); if (v && !tracks.includes(v)) setTracks([...tracks, v]); setTrackInput(""); }}
              className="btn-secondary px-3 text-sm flex-shrink-0">Add</button>
          </div>
        </div>
      </div>

      {/* Join Code */}
      {needsJoinCode && !isPublished && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Join Code</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(96,165,250,0.15)", color: "var(--color-blue)", border: "1px solid rgba(96,165,250,0.3)" }}>
              Online / Hybrid only
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-sec)" }}>
            The join code becomes your public event URL: <code className="px-1 rounded" style={{ background: "var(--color-bg)", color: "var(--color-blue)" }}>/e/[join-code]</code>
          </p>
          <div className="flex gap-3">
            {(["auto", "custom"] as JoinCodeMode[]).map(m => (
              <label key={m} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                <input type="radio" name="joinCodeMode" value={m} checked={joinCodeMode === m}
                  onChange={() => { setJoinCodeMode(m); setJoinCodeAvailable(null); }}
                  className="accent-blue-500" />
                {m === "auto" ? "Auto-generate" : "Custom code"}
              </label>
            ))}
          </div>
          {joinCodeMode === "custom" && (
            <Field label="Custom Join Code" error={errors.joinCode}>
              <input
                type="text" value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinCodeAvailable(null); }}
                onBlur={() => checkJoinCode(joinCode)}
                placeholder="e.g. HACK2025"
                className={inputClass} style={inputStyle}
                maxLength={20}
              />
              {checkingCode && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Checking availability…</p>}
              {joinCodeAvailable === true && <p className="text-xs mt-1" style={{ color: "#00c758" }}>✓ Available</p>}
              {joinCodeAvailable === false && <p className="text-xs mt-1" style={{ color: "#ff6568" }}>✗ Already taken</p>}
            </Field>
          )}
        </div>
      )}

      {venueType === "in_person" && (
        <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(71,85,105,0.2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
          Join codes are used for online events. Your in-person event will get an auto-generated code for the public URL.
        </div>
      )}

      {/* Submit row */}
      <div className="flex items-center gap-4">
        <button
          type="submit" disabled={loading}
          className="btn-primary py-3 px-8 text-base font-semibold"
        >
          {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Event →"}
        </button>
        {isEdit && <SaveIndicator status={saveStatus} />}
      </div>
    </form>
  );
}
