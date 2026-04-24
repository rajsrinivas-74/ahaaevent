"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventType, VenueType, JoinCodeMode, FormFieldType } from "@/lib/types";
import { PublicEventView } from "@/components/public-event-view";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardState {
  // Step 1 — Details
  name: string;
  type: EventType;
  theme: string;
  tagline: string;
  description: string;
  // Step 2 — Schedule & Venue
  startDate: string;
  endDate: string;
  timezone: string;
  venueType: VenueType | "";
  meetingLink: string;
  maxParticipants: string;
  joinCodeMode: JoinCodeMode;
  joinCode: string;
  // Step 3 — Branding
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  fontPreset: string;
  // Step 4 — Evaluation
  criteria: { name: string; weight: number; expectations: string }[];
  prizes: { place: number; label: string; value: string }[];
  // Step 5 — Form fields (quick-add only)
  formFields: { label: string; type: FormFieldType; required: boolean }[];
  // Step 6 — FAQ
  faqs: { question: string; answer: string }[];
  publishNow: boolean;
}

const DEFAULTS: WizardState = {
  name: "", type: "hackathon", theme: "", tagline: "", description: "",
  startDate: "", endDate: "", timezone: "Asia/Kolkata",
  venueType: "", meetingLink: "", maxParticipants: "",
  joinCodeMode: "auto", joinCode: "",
  primaryColor: "#3b82a6", backgroundColor: "#020617", accentColor: "#6b5fa7",
  fontPreset: "Inter",
  criteria: [], prizes: [],
  formFields: [], faqs: [], publishNow: false,
};

const STEPS = [
  { label: "Details",    emoji: "📋" },
  { label: "Schedule",   emoji: "📅" },
  { label: "Branding",   emoji: "🎨" },
  { label: "Evaluation", emoji: "⭐" },
  { label: "Form",       emoji: "📝" },
  { label: "FAQ",        emoji: "❓" },
  { label: "Preview",    emoji: "👁" },
  { label: "Publish",    emoji: "🚀" },
];

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
  { value: "hybrid",    label: "Hybrid",    emoji: "🔀", desc: "Both" },
];

const TIMEZONES = [
  "Asia/Kolkata", "Asia/Singapore", "Asia/Dubai", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles",
  "Australia/Sydney", "UTC",
];

const FONT_PRESETS = ["Inter", "Poppins", "Space Grotesk", "Playfair Display", "JetBrains Mono"];

const FIELD_PRESETS: Record<EventType, { label: string; type: FormFieldType; required: boolean }[]> = {
  hackathon: [
    { label: "Team Name", type: "short_text", required: true },
    { label: "Project Name", type: "short_text", required: true },
    { label: "Team Size", type: "radio", required: true },
    { label: "Tech Stack", type: "short_text", required: false },
    { label: "GitHub Repository", type: "short_text", required: false },
    { label: "Project Description", type: "long_text", required: true },
  ],
  ideathon: [
    { label: "Idea Title", type: "short_text", required: true },
    { label: "Problem Statement", type: "long_text", required: true },
    { label: "Proposed Solution", type: "long_text", required: true },
    { label: "Target Audience", type: "short_text", required: false },
  ],
  pitch_competition: [
    { label: "Startup Name", type: "short_text", required: true },
    { label: "Pitch Deck URL", type: "short_text", required: true },
    { label: "Stage", type: "dropdown", required: true },
    { label: "Funding Raised", type: "short_text", required: false },
  ],
  innovation_challenge: [
    { label: "Solution Name", type: "short_text", required: true },
    { label: "Challenge Area", type: "dropdown", required: true },
    { label: "Description", type: "long_text", required: true },
  ],
  workshop: [
    { label: "Full Name", type: "short_text", required: true },
    { label: "Organization", type: "short_text", required: false },
    { label: "Experience Level", type: "radio", required: true },
    { label: "Why are you interested?", type: "long_text", required: false },
  ],
  other: [
    { label: "Full Name", type: "short_text", required: true },
    { label: "Email", type: "short_text", required: true },
    { label: "Message", type: "long_text", required: false },
  ],
};

const FAQ_PRESETS: Record<EventType, { question: string; answer: string }[]> = {
  hackathon: [
    { question: "Who can participate?", answer: "Anyone passionate about building — students, professionals, and hobbyists are welcome." },
    { question: "Can I participate solo?", answer: "Yes, solo participation is allowed. Teams of up to 4 members are also accepted." },
    { question: "Will there be mentors?", answer: "Yes, mentors will be available throughout the event to help guide your project." },
  ],
  ideathon: [
    { question: "Do I need a complete solution?", answer: "No — we're looking for strong ideas and problem statements, not finished products." },
    { question: "Can I pitch an existing idea?", answer: "Ideas that are not yet built or funded are eligible." },
  ],
  pitch_competition: [
    { question: "What stage should my startup be at?", answer: "We accept ideas, MVPs, and early-stage startups." },
    { question: "How long is the pitch?", answer: "Each team gets 5 minutes to pitch followed by 3 minutes of Q&A." },
  ],
  innovation_challenge: [
    { question: "Is this open to all industries?", answer: "Yes — we welcome solutions from any domain that address the challenge areas." },
    { question: "Can teams from different cities participate?", answer: "Absolutely. This is an open challenge." },
  ],
  workshop: [
    { question: "Do I need prior experience?", answer: "No prior experience is needed. The workshop is beginner-friendly." },
    { question: "What should I bring?", answer: "Bring your laptop and enthusiasm. We'll handle the rest." },
  ],
  other: [
    { question: "How do I register?", answer: "Click the Register Now button on this page to sign up." },
    { question: "Who can I contact for more info?", answer: "Reach out to the organiser via the contact details on this page." },
  ],
};

// ─── Shared input style ────────────────────────────────────────────────────────

const inp = "w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none";
const inpStyle = { background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" };

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

// ─── Main wizard ───────────────────────────────────────────────────────────────

export default function CreateEventWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(DEFAULTS);
  const [eventId, setEventId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [joinCodeAvailable, setJoinCodeAvailable] = useState<boolean | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  const set = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }));
  const needsJoinCode = state.venueType === "online" || state.venueType === "hybrid";

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 0 && !state.name.trim()) e.name = "Event name is required";
    if (step === 1 && state.endDate && state.startDate && state.endDate < state.startDate)
      e.endDate = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Join code check ───────────────────────────────────────────────────────
  async function checkJoinCode(code: string) {
    if (!code.trim()) { setJoinCodeAvailable(null); return; }
    setCheckingCode(true);
    const res = await fetch(`/api/events/check-join-code?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    setJoinCodeAvailable(data.available);
    setCheckingCode(false);
  }

  // ── Create event (Step 0 → 1 transition) ─────────────────────────────────
  async function createEvent(): Promise<string | null> {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.name, type: state.type,
        theme: state.theme || null,
        tagline: state.tagline || null,
        description: state.description || null,
        join_code_mode: "auto",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.id as string;
  }

  // ── Save branding ─────────────────────────────────────────────────────────
  async function saveBranding(id: string) {
    await fetch(`/api/events/${id}/branding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primary_color: state.primaryColor,
        background_color: state.backgroundColor,
        accent_color: state.accentColor,
        font_preset: state.fontPreset,
      }),
    });
  }

  // ── Save evaluation ───────────────────────────────────────────────────────
  async function saveEvaluation(id: string) {
    const total = state.criteria.reduce((s, c) => s + c.weight, 0);
    const normalised = total > 0
      ? state.criteria.map(c => ({ ...c, weight: Math.round((c.weight / total) * 100) }))
      : state.criteria;
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        judging_criteria: normalised.length > 0 ? normalised : null,
        prizes: state.prizes.length > 0 ? state.prizes : null,
      }),
    });
  }

  // ── Save form fields ──────────────────────────────────────────────────────
  async function saveFormFields(id: string) {
    for (let i = 0; i < state.formFields.length; i++) {
      const f = state.formFields[i];
      await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "field", event_id: id,
          label: f.label, field_type: f.type, required: f.required,
        }),
      });
    }
  }

  // ── Save FAQs ─────────────────────────────────────────────────────────────
  async function saveFaqs(id: string) {
    for (const faq of state.faqs) {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: id, question: faq.question, answer: faq.answer }),
      });
    }
  }

  // ── Next step ─────────────────────────────────────────────────────────────
  async function handleNext() {
    if (!validate()) return;
    setSaving(true);

    if (step === 0) {
      // Create the event
      const id = await createEvent();
      if (!id) { setSaving(false); return; }
      setEventId(id);
    }

    if (step === 1 && eventId) {
      // Save schedule + venue
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: state.startDate || null,
          end_date: state.endDate || null,
          timezone: state.timezone,
          venue_type: state.venueType || null,
          meeting_link: needsJoinCode ? (state.meetingLink || null) : null,
          max_participants: state.maxParticipants ? parseInt(state.maxParticipants) : null,
          join_code_mode: needsJoinCode ? state.joinCodeMode : "auto",
          join_code: needsJoinCode && state.joinCodeMode === "custom" ? state.joinCode : undefined,
        }),
      });
    }

    if (step === 2 && eventId) await saveBranding(eventId);
    if (step === 3 && eventId) await saveEvaluation(eventId);
    if (step === 4 && eventId) await saveFormFields(eventId);
    if (step === 5 && eventId) await saveFaqs(eventId);

    setSaving(false);
    setStep(s => s + 1);
  }

  // ── Publish (final step) ──────────────────────────────────────────────────
  async function handlePublish() {
    if (!eventId) return;
    setSaving(true);
    if (state.publishNow) {
      await fetch(`/api/events/${eventId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      });
    }
    setSaving(false);
    router.push(`/events/${eventId}/preview`);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: i < step ? "#00c758" : i === step ? "linear-gradient(135deg,var(--color-blue),var(--color-purple))" : "var(--color-card)",
                  border: `1px solid ${i <= step ? "transparent" : "var(--color-border)"}`,
                  color: i <= step ? "#fff" : "var(--color-text-muted)",
                }}
              >
                {i < step ? "✓" : s.emoji}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: i === step ? "var(--color-text)" : "var(--color-text-muted)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {/* Connector bar */}
        <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(step / (STEPS.length - 1)) * 100}%`,
              background: "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
            }}
          />
        </div>
      </div>

      {/* Step title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{STEPS[step].emoji} {STEPS[step].label}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {step === 0 && <StepDetails state={state} set={set} errors={errors} />}
        {step === 1 && <StepSchedule state={state} set={set} errors={errors} needsJoinCode={needsJoinCode}
          joinCodeAvailable={joinCodeAvailable} checkingCode={checkingCode} checkJoinCode={checkJoinCode} />}
        {step === 2 && <StepBranding state={state} set={set} />}
        {step === 3 && <StepEvaluation state={state} set={set} />}
        {step === 4 && <StepForm state={state} set={set} />}
        {step === 5 && <StepFaq state={state} set={set} />}
        {step === 6 && <StepPreview state={state} />}
        {step === 7 && <StepPublish state={state} set={set} eventId={eventId} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn-secondary"
          style={{ opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? "none" : "auto" }}
        >
          ← Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={handleNext} disabled={saving} className="btn-primary px-6">
            {saving ? "Saving…" : "Next →"}
          </button>
        ) : (
          (() => {
            const requiredDone = !!(state.name.trim() && state.description.trim() && state.startDate && state.endDate && state.venueType && state.formFields.length > 0);
            const blocked = state.publishNow && !requiredDone;
            return (
              <button onClick={blocked ? undefined : handlePublish} disabled={saving || blocked}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                title={blocked ? "Complete required fields to publish" : undefined}>
                {saving ? "Finishing…" : blocked ? "Complete required fields" : state.publishNow ? "Publish Event 🚀" : "Save as Draft"}
              </button>
            );
          })()
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Details ──────────────────────────────────────────────────────────
function StepDetails({ state, set, errors }: { state: WizardState; set: (p: Partial<WizardState>) => void; errors: Record<string, string> }) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  async function handleGenerate() {
    if (!state.name.trim()) { setGenError("Enter an event name first"); return; }
    setGenError("");
    setGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_event", name: state.name, type: state.type, theme: state.theme }),
      });
      const data = await res.json();
      if (data.error) { setGenError(data.error); return; }
      set({
        description: data.description || state.description,
        tagline: data.tagline || state.tagline,
        faqs: data.faqs?.length ? data.faqs : state.faqs,
      });
    } catch {
      setGenError("AI request failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card space-y-5">
        <Field label="Event Name *" error={errors.name}>
          <input value={state.name} onChange={e => set({ name: e.target.value })}
            placeholder="e.g. HackFest 2025" className={inp} style={inpStyle} autoFocus />
        </Field>

        <Field label="Event Type *">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EVENT_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => set({ type: t.value, formFields: [], faqs: [] })}
                className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: state.type === t.value ? "rgba(59,130,166,0.15)" : "var(--color-bg)",
                  border: `1px solid ${state.type === t.value ? "rgba(59,130,166,0.5)" : "var(--color-border)"}`,
                  color: state.type === t.value ? "var(--color-blue)" : "var(--color-text-sec)",
                }}>
                <span className="text-lg">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Theme" hint="e.g. Sustainability, FinTech, AI for Good">
          <input value={state.theme} onChange={e => set({ theme: e.target.value })}
            placeholder="Optional focus area" className={inp} style={inpStyle} />
        </Field>

        {/* AI generate button */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(107,95,167,0.08)", border: "1px solid rgba(107,95,167,0.25)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">✨ AI Auto-fill</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Generates description, tagline &amp; 3 FAQs from your event name</p>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="btn-secondary text-xs"
              style={{ minWidth: "110px", opacity: generating ? 0.7 : 1 }}
            >
              {generating ? "Generating…" : "✨ Generate"}
            </button>
          </div>
          {genError && <p className="text-xs" style={{ color: "#ff6568" }}>{genError}</p>}
          {!generating && state.description && (
            <p className="text-xs" style={{ color: "#00c758" }}>✓ Content generated — review and edit below</p>
          )}
        </div>

        <Field label="Tagline" hint="Short punchy line — under 100 characters">
          <input value={state.tagline} onChange={e => set({ tagline: e.target.value })}
            placeholder="e.g. Build. Break. Innovate." className={inp} style={inpStyle} maxLength={100} />
          <p className="text-xs text-right" style={{ color: "var(--color-text-muted)" }}>{state.tagline.length}/100</p>
        </Field>

        <Field label="Description">
          <textarea value={state.description} onChange={e => set({ description: e.target.value })}
            rows={4} placeholder="Tell participants what your event is about…"
            className={inp} style={{ ...inpStyle, resize: "none" }} />
        </Field>
      </div>
    </div>
  );
}

// ─── Step 2: Schedule & Venue ─────────────────────────────────────────────────
function StepSchedule({ state, set, errors, needsJoinCode, joinCodeAvailable, checkingCode, checkJoinCode }: {
  state: WizardState; set: (p: Partial<WizardState>) => void; errors: Record<string, string>;
  needsJoinCode: boolean; joinCodeAvailable: boolean | null; checkingCode: boolean;
  checkJoinCode: (code: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Schedule</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start Date & Time">
            <input type="datetime-local" value={state.startDate} onChange={e => set({ startDate: e.target.value })}
              className={inp} style={inpStyle} />
          </Field>
          <Field label="End Date & Time" error={errors.endDate}>
            <input type="datetime-local" value={state.endDate} onChange={e => set({ endDate: e.target.value })}
              min={state.startDate} className={inp} style={inpStyle} />
          </Field>
        </div>
        <Field label="Timezone">
          <select value={state.timezone} onChange={e => set({ timezone: e.target.value })} className={inp} style={inpStyle}>
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </Field>
      </div>

      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Venue</p>
        <Field label="Format">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VENUE_TYPES.map(v => (
              <button key={v.value} type="button"
                onClick={() => set({ venueType: v.value, joinCodeMode: "auto" })}
                className="flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all"
                style={{
                  background: state.venueType === v.value ? "rgba(107,95,167,0.15)" : "var(--color-bg)",
                  border: `1px solid ${state.venueType === v.value ? "rgba(107,95,167,0.5)" : "var(--color-border)"}`,
                }}>
                <span className="text-lg">{v.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: state.venueType === v.value ? "var(--color-purple)" : "var(--color-text)" }}>{v.label}</span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{v.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        {needsJoinCode && (
          <Field label="Meeting Link">
            <input type="url" value={state.meetingLink} onChange={e => set({ meetingLink: e.target.value })}
              placeholder="https://" className={inp} style={inpStyle} />
          </Field>
        )}

        <Field label="Max Participants" hint="Leave blank for unlimited">
          <input type="number" value={state.maxParticipants} onChange={e => set({ maxParticipants: e.target.value })}
            min={1} placeholder="Unlimited" className={inp} style={inpStyle} />
        </Field>
      </div>

      {needsJoinCode && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Join Code</p>
            <span className="text-xs px-2 py-0.5 rounded-full badge badge-draft">Online / Hybrid only</span>
          </div>
          <div className="flex gap-4">
            {(["auto", "custom"] as JoinCodeMode[]).map(m => (
              <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="jcm" value={m} checked={state.joinCodeMode === m}
                  onChange={() => set({ joinCodeMode: m })} className="accent-blue-500" />
                {m === "auto" ? "Auto-generate" : "Custom code"}
              </label>
            ))}
          </div>
          {state.joinCodeMode === "custom" && (
            <Field label="Custom Code">
              <input value={state.joinCode}
                onChange={e => set({ joinCode: e.target.value.toUpperCase() })}
                onBlur={() => checkJoinCode(state.joinCode)}
                placeholder="e.g. HACK2025" className={inp} style={inpStyle} maxLength={20} />
              {checkingCode && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Checking…</p>}
              {joinCodeAvailable === true && <p className="text-xs mt-1" style={{ color: "#00c758" }}>✓ Available</p>}
              {joinCodeAvailable === false && <p className="text-xs mt-1" style={{ color: "#ff6568" }}>✗ Taken</p>}
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Branding ─────────────────────────────────────────────────────────
function StepBranding({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-4">
      <div className="card space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Colours</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { label: "Primary", key: "primaryColor" as const },
            { label: "Background", key: "backgroundColor" as const },
            { label: "Accent", key: "accentColor" as const },
          ] as const).map(c => (
            <div key={c.key}>
              <label className="block text-xs font-medium mb-2">{c.label}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={state[c.key]} onChange={e => set({ [c.key]: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 flex-shrink-0" />
                <input type="text" value={state[c.key]} onChange={e => set({ [c.key]: e.target.value })}
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs min-w-0"
                  style={inpStyle} maxLength={7} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium mb-2">Font</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONT_PRESETS.map(f => (
              <button key={f} type="button" onClick={() => set({ fontPreset: f })}
                className="py-2 px-3 rounded-xl text-xs transition-all"
                style={{
                  fontFamily: f,
                  background: state.fontPreset === f ? "rgba(59,130,166,0.15)" : "var(--color-bg)",
                  border: `1px solid ${state.fontPreset === f ? "rgba(59,130,166,0.5)" : "var(--color-border)"}`,
                  color: state.fontPreset === f ? "var(--color-blue)" : "var(--color-text-sec)",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live mini-preview */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>Preview</p>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <div className="px-6 py-8 text-center" style={{ background: state.backgroundColor, fontFamily: state.fontPreset }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#f8fafc" }}>{state.name || "Your Event Name"}</h2>
            {state.tagline && <p className="text-sm" style={{ color: state.primaryColor }}>{state.tagline}</p>}
            <div className="mt-4 inline-block px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${state.primaryColor}, ${state.accentColor})` }}>
              Register Now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Evaluation ───────────────────────────────────────────────────────
function StepEvaluation({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  function addCriterion() {
    set({ criteria: [...state.criteria, { name: "", weight: 20, expectations: "" }] });
  }
  function addPrize() {
    const ordinal = ["1st", "2nd", "3rd"][state.prizes.length] ?? `${state.prizes.length + 1}th`;
    set({ prizes: [...state.prizes, { place: state.prizes.length + 1, label: `${ordinal} Place`, value: "" }] });
  }
  const total = state.criteria.reduce((s, c) => s + c.weight, 0);

  return (
    <div className="space-y-4">
      {/* Judging Criteria */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Judging Criteria</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Weights auto-normalise to 100% — used by Ahaa IQ</p>
          </div>
          <button type="button" onClick={addCriterion} className="btn-secondary px-3 py-1 text-xs">+ Add</button>
        </div>
        {state.criteria.length === 0 ? (
          <div className="text-center py-6 rounded-xl" style={{ border: "1px dashed var(--color-border)" }}>
            <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>No criteria yet</p>
            <button onClick={addCriterion} className="btn-primary text-xs px-4 py-1.5">Add First Criterion</button>
          </div>
        ) : (
          <div className="space-y-4">
            {state.criteria.map((c, i) => (
              <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <div className="flex gap-2 items-center">
                  <input type="text" value={c.name}
                    onChange={e => { const next = [...state.criteria]; next[i] = { ...next[i], name: e.target.value }; set({ criteria: next }); }}
                    placeholder="Criterion name e.g. Innovation"
                    className={inp} style={{ ...inpStyle, flex: "1 1 auto" }} />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" value={c.weight} min={1} max={100}
                      onChange={e => { const next = [...state.criteria]; next[i] = { ...next[i], weight: parseInt(e.target.value) || 1 }; set({ criteria: next }); }}
                      className={inp} style={{ ...inpStyle, width: "70px", textAlign: "right" }} />
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>pts</span>
                  </div>
                  <button onClick={() => set({ criteria: state.criteria.filter((_, j) => j !== i) })}
                    className="flex-shrink-0 px-2 py-2 rounded-xl text-sm"
                    style={{ background: "rgba(255,101,104,0.1)", color: "#ff6568", border: "1px solid rgba(255,101,104,0.2)" }}>✕</button>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                    What are you looking for? <span style={{ fontStyle: "italic" }}>(used by Ahaa IQ to score)</span>
                  </label>
                  <textarea
                    value={c.expectations}
                    onChange={e => { const next = [...state.criteria]; next[i] = { ...next[i], expectations: e.target.value }; set({ criteria: next }); }}
                    rows={2}
                    placeholder={`Describe what a strong ${c.name || "submission"} looks like — e.g. "Is the problem novel? Does it address an unmet need?"`}
                    className="w-full rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
                    style={inpStyle}
                  />
                </div>
              </div>
            ))}
            {state.criteria.length > 1 && (
              <div className="space-y-1.5 pt-1">
                {state.criteria.filter(c => c.name.trim()).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs w-28 truncate" style={{ color: "var(--color-text-sec)" }}>{c.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${total > 0 ? Math.round((c.weight / total) * 100) : 0}%`, background: "linear-gradient(90deg,var(--color-blue),var(--color-purple))" }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "var(--color-blue)", minWidth: "32px", textAlign: "right" }}>
                      {total > 0 ? Math.round((c.weight / total) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prizes */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Prizes</p>
          <button type="button" onClick={addPrize} className="btn-secondary px-3 py-1 text-xs">+ Add Prize</button>
        </div>
        {state.prizes.length === 0 ? (
          <p className="text-sm py-2" style={{ color: "var(--color-text-muted)" }}>No prizes yet — optional but shown on the public page</p>
        ) : (
          <div className="space-y-3">
            {state.prizes.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="flex-shrink-0 text-lg">{i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖"}</span>
                <input type="text" value={p.label}
                  onChange={e => { const next = [...state.prizes]; next[i] = { ...next[i], label: e.target.value }; set({ prizes: next }); }}
                  placeholder="Label" className={inp} style={{ ...inpStyle, flex: "1 1 35%" }} />
                <input type="text" value={p.value}
                  onChange={e => { const next = [...state.prizes]; next[i] = { ...next[i], value: e.target.value }; set({ prizes: next }); }}
                  placeholder="e.g. ₹50,000 + Cloud Credits" className={inp} style={{ ...inpStyle, flex: "1 1 50%" }} />
                <button onClick={() => set({ prizes: state.prizes.filter((_, j) => j !== i).map((x, j) => ({ ...x, place: j + 1 })) })}
                  className="flex-shrink-0 px-2 py-2 rounded-xl text-sm"
                  style={{ background: "rgba(255,101,104,0.1)", color: "#ff6568", border: "1px solid rgba(255,101,104,0.2)" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Form Builder ─────────────────────────────────────────────────────
function StepForm({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const presets = FIELD_PRESETS[state.type];

  function addField(f: typeof presets[0]) {
    const already = state.formFields.some(x => x.label === f.label && x.type === f.type);
    if (!already) set({ formFields: [...state.formFields, { ...f }] });
  }

  function loadPresets() {
    set({ formFields: [...presets] });
  }

  function removeField(i: number) {
    set({ formFields: state.formFields.filter((_, idx) => idx !== i) });
  }

  function toggleRequired(i: number) {
    const updated = [...state.formFields];
    updated[i] = { ...updated[i], required: !updated[i].required };
    set({ formFields: updated });
  }

  function updateLabel(i: number, label: string) {
    const updated = [...state.formFields];
    updated[i] = { ...updated[i], label };
    set({ formFields: updated });
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Suggested fields for {state.type.replace("_", " ")}
          </p>
          <button onClick={loadPresets} className="btn-primary" style={{ fontSize: "0.75rem" }}>
            ✨ Load all
          </button>
        </div>
        <div className="space-y-2">
          {presets.map((f, i) => {
            const added = state.formFields.some(x => x.label === f.label && x.type === f.type);
            return (
              <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <span className="flex-1">{f.label}</span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{f.type.replace("_", " ")}</span>
                {f.required && <span className="text-xs" style={{ color: "#ff6568" }}>required</span>}
                <button onClick={() => addField(f)} disabled={added}
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: added ? "var(--color-card)" : "rgba(99,102,241,0.15)", color: added ? "var(--color-text-muted)" : "var(--color-blue)", border: `1px solid ${added ? "var(--color-border)" : "rgba(99,102,241,0.3)"}`, cursor: added ? "default" : "pointer" }}>
                  {added ? "added" : "+ add"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {state.formFields.length > 0 && (
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Your form fields ({state.formFields.length})
          </p>
          {state.formFields.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm py-2 px-3 rounded-xl"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <input
                value={f.label}
                onChange={e => updateLabel(i, e.target.value)}
                className="flex-1 bg-transparent font-medium outline-none"
                style={{ color: "var(--color-text)", fontSize: "0.875rem", minWidth: 0 }}
              />
              <button onClick={() => toggleRequired(i)} className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: f.required ? "rgba(255,101,104,0.1)" : "var(--color-card)", color: f.required ? "#ff6568" : "var(--color-text-muted)", border: `1px solid ${f.required ? "#ff656840" : "var(--color-border)"}` }}>
                {f.required ? "required" : "optional"}
              </button>
              <button onClick={() => removeField(i)} className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>✕</button>
            </div>
          ))}
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            You can add more fields later in the Form Builder.
          </p>
        </div>
      )}

      {state.formFields.length === 0 && (
        <div className="text-center py-6" style={{ border: "1px dashed var(--color-border)", borderRadius: "1rem" }}>
          <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>Load presets or skip — you can build the form later</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: FAQ ──────────────────────────────────────────────────────────────
function StepFaq({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const presets = FAQ_PRESETS[state.type];

  function loadPresets() { set({ faqs: [...presets] }); }
  function removeFaq(i: number) { set({ faqs: state.faqs.filter((_, idx) => idx !== i) }); }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Suggested FAQs
          </p>
          <button onClick={loadPresets} className="btn-primary" style={{ fontSize: "0.75rem" }}>
            ✨ Load presets
          </button>
        </div>
        <div className="space-y-2">
          {presets.map((f, i) => (
            <div key={i} className="text-sm py-2 px-3 rounded-lg" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <p className="font-medium">{f.question}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{f.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {state.faqs.length > 0 && (
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Your FAQs ({state.faqs.length})
          </p>
          {state.faqs.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm py-2 px-3 rounded-xl"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex-1">
                <p className="font-medium">{f.question}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{f.answer}</p>
              </div>
              <button onClick={() => removeFaq(i)} className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Publish ──────────────────────────────────────────────────────────
// ─── Step 6: Preview ──────────────────────────────────────────────────────────
function StepPreview({ state }: { state: WizardState }) {
  const mockEvent = {
    id: "preview",
    organiser_id: "",
    name: state.name || "Your Event Name",
    type: state.type,
    theme: state.theme || null,
    description: state.description || null,
    tagline: state.tagline || null,
    start_date: state.startDate || null,
    end_date: state.endDate || null,
    timezone: state.timezone,
    venue_type: state.venueType || null,
    meeting_link: state.meetingLink || null,
    max_participants: state.maxParticipants ? parseInt(state.maxParticipants) : null,
    join_code: "PREVIEW",
    join_code_mode: state.joinCodeMode,
    status: "draft" as const,
    expires_at: null,
    visitor_count: 0,
    registration_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    registration_start: null,
    registration_end: null,
    submission_deadline: null,
    team_min: null,
    team_max: null,
    eligibility: null,
    contact_email: null,
    tracks: null,
    prizes: state.prizes.length > 0 ? state.prizes : null,
    judging_criteria: state.criteria.length > 0 ? state.criteria : null,
  };

  const mockBranding = {
    id: "preview",
    event_id: "preview",
    logo_url: null,
    banner_url: null,
    primary_color: state.primaryColor,
    background_color: state.backgroundColor,
    accent_color: state.accentColor,
    font_preset: state.fontPreset,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockFaq = state.faqs.map((f, i) => ({
    id: String(i),
    event_id: "preview",
    question: f.question,
    answer: f.answer,
    order: i,
  }));

  const mockFields = state.formFields.map((f, i) => ({
    id: String(i),
    event_id: "preview",
    section_id: null,
    label: f.label,
    type: f.type,
    helper_text: null,
    required: f.required,
    char_limit: null,
    options: null,
    order: i,
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "var(--color-blue)" }}>
        👁 This is how your public event page will look. Branding, logos, and banner can be refined after creation.
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", maxHeight: "600px", overflowY: "auto" }}>
        <PublicEventView event={mockEvent} branding={mockBranding} faq={mockFaq} fields={mockFields} preview />
      </div>
    </div>
  );
}

function StepPublish({ state, set, eventId }: { state: WizardState; set: (p: Partial<WizardState>) => void; eventId: string | null }) {
  const joinCodeUrl = eventId ? `/e/[join-code]` : "";

  const REQUIRED = [
    { label: "Event name",        done: !!state.name.trim() },
    { label: "Description",       done: !!state.description.trim() },
    { label: "Start date",        done: !!state.startDate },
    { label: "End date",          done: !!state.endDate },
    { label: "Venue / format",    done: !!state.venueType },
    { label: "Submission form",   done: state.formFields.length > 0 },
  ];

  const OPTIONAL = [
    { label: "Judging criteria",  done: state.criteria.length > 0 },
    { label: "FAQs",              done: state.faqs.length > 0 },
  ];

  const canPublish = REQUIRED.every(c => c.done);
  const missingRequired = REQUIRED.filter(c => !c.done);

  return (
    <div className="space-y-5">
      {/* Required checklist */}
      <div className="card space-y-3" style={{
        border: canPublish ? "1px solid rgba(0,199,88,0.3)" : "1px solid rgba(255,101,104,0.4)",
        background: canPublish ? "rgba(0,199,88,0.04)" : "rgba(255,101,104,0.04)",
      }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Required to publish</p>
          {canPublish
            ? <span className="text-xs font-semibold" style={{ color: "#00c758" }}>✓ All set</span>
            : <span className="text-xs" style={{ color: "#ff6568" }}>{missingRequired.length} missing</span>
          }
        </div>
        {REQUIRED.map(item => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span style={{ color: item.done ? "#00c758" : "#ff6568" }}>{item.done ? "✓" : "✗"}</span>
            <span style={{ color: item.done ? "var(--color-text-muted)" : "var(--color-text)", textDecoration: item.done ? "line-through" : "none" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Optional checklist */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Optional (recommended)</p>
        {OPTIONAL.map(item => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span style={{ color: item.done ? "#00c758" : "#f99c00" }}>{item.done ? "✓" : "○"}</span>
            <span style={{ color: "var(--color-text-sec)" }}>{item.label}</span>
            {!item.done && <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>can add later</span>}
          </div>
        ))}
      </div>

      {/* Publish toggle */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Go Live?</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => set({ publishNow: false })}
            className="flex flex-col items-start gap-1 p-4 rounded-xl transition-all"
            style={{
              background: !state.publishNow ? "rgba(59,130,166,0.1)" : "var(--color-bg)",
              border: `1px solid ${!state.publishNow ? "rgba(59,130,166,0.4)" : "var(--color-border)"}`,
            }}>
            <span className="text-lg">📄</span>
            <span className="text-sm font-semibold" style={{ color: !state.publishNow ? "var(--color-blue)" : "var(--color-text)" }}>Save as Draft</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Only you can see it</span>
          </button>
          <button
            onClick={() => canPublish && set({ publishNow: true })}
            className="flex flex-col items-start gap-1 p-4 rounded-xl transition-all"
            style={{
              background: state.publishNow ? "rgba(0,199,88,0.1)" : "var(--color-bg)",
              border: `1px solid ${state.publishNow ? "rgba(0,199,88,0.4)" : canPublish ? "var(--color-border)" : "rgba(255,101,104,0.2)"}`,
              opacity: canPublish ? 1 : 0.45,
              cursor: canPublish ? "pointer" : "not-allowed",
            }}>
            <span className="text-lg">🚀</span>
            <span className="text-sm font-semibold" style={{ color: state.publishNow ? "#00c758" : "var(--color-text)" }}>Publish Now</span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {canPublish ? "Public page goes live" : "Complete required fields first"}
            </span>
          </button>
        </div>

        {!canPublish && (
          <p className="text-xs" style={{ color: "#ff6568" }}>
            Complete the required fields above before you can publish. You can save as Draft and publish later.
          </p>
        )}
        {state.publishNow && canPublish && (
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Your event will be live at <code className="px-1 rounded" style={{ background: "var(--color-bg)", color: "var(--color-blue)" }}>{joinCodeUrl}</code>
          </p>
        )}
      </div>
    </div>
  );
}
