"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Event, EventBranding } from "@/lib/types";
import { CardSkeleton } from "@/components/skeleton";

const STEPS = [
  { key: "edit",       label: "Details",    icon: "📋", desc: "Name, type, dates, venue" },
  { key: "branding",   label: "Branding",   icon: "🎨", desc: "Logo, colours, banner" },
  { key: "evaluation", label: "Evaluation", icon: "⭐", desc: "Judging criteria and prizes" },
  { key: "form",       label: "Form",       icon: "📝", desc: "Submission form fields" },
  { key: "faq",        label: "FAQ",        icon: "❓", desc: "Frequently asked questions" },
  { key: "preview",    label: "Preview",    icon: "👁",  desc: "Review before publishing" },
  { key: "settings",   label: "Publish",    icon: "🚀", desc: "Join code and status" },
];

const STATUS_COLORS: Record<string, string> = {
  draft:  "var(--color-text-muted)",
  live:   "#00c758",
  closed: "#ff6568",
};

export default function EventOverviewPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<Event | null>(null);
  const [branding, setBranding] = useState<EventBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then(r => r.json()),
      fetch(`/api/events/${id}/branding`).then(r => r.json()),
    ]).then(([e, b]) => {
      setEvent(e);
      setBranding(b?.id ? b : null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <div className="h-7 w-48 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      <CardSkeleton rows={3} />
      <CardSkeleton rows={5} />
    </div>
  );
  if (!event) return <p className="text-sm" style={{ color: "#ff6568" }}>Event not found.</p>;

  const hasBranding = !!(branding?.primary_color);
  const hasBanner   = !!(branding?.banner_url || branding?.logo_url);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: `${STATUS_COLORS[event.status]}22`, color: STATUS_COLORS[event.status], border: `1px solid ${STATUS_COLORS[event.status]}44` }}
          >
            {event.status}
          </span>
        </div>
        {event.tagline && (
          <p className="text-sm" style={{ color: "var(--color-text-sec)" }}>{event.tagline}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Visitors",      value: event.visitor_count },
          { label: "Registrations", value: event.registration_count },
          { label: "Join Code",     value: event.join_code },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-3">
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Branding mini-preview */}
      {hasBranding && (
        <div
          className="rounded-2xl h-16 flex items-center px-4 gap-3"
          style={{
            background: branding?.banner_url
              ? `linear-gradient(90deg, ${branding.background_color}ee, ${branding.background_color}88), url(${branding.banner_url}) center/cover`
              : branding?.background_color,
            border: "1px solid var(--color-border)",
          }}
        >
          {branding?.logo_url && (
            <img src={branding.logo_url} alt="logo" className="h-8 w-8 rounded object-contain" style={{ background: "#fff", padding: "2px" }} />
          )}
          <div className="flex gap-2">
            {[branding?.primary_color, branding?.accent_color].map((c, i) => (
              <div key={i} title={c ?? ""} className="w-5 h-5 rounded-full border-2" style={{ background: c ?? "#000", borderColor: "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
          <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.6)", fontFamily: branding?.font_preset }}>
            {branding?.font_preset}
          </span>
        </div>
      )}

      {/* Setup steps */}
      <div className="card divide-y" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
        <p className="text-xs font-semibold uppercase tracking-widest pb-3" style={{ color: "var(--color-text-muted)" }}>
          Setup Steps
        </p>
        {STEPS.map(step => {
          const done =
            step.key === "edit"       ? !!(event.name && event.type && event.start_date && event.end_date && event.venue_type) :
            step.key === "branding"   ? hasBranding || hasBanner :
            step.key === "evaluation" ? !!(event.judging_criteria && (event.judging_criteria as unknown[]).length > 0) :
            step.key === "preview"    ? !!(event.name && event.description) :
            step.key === "settings"   ? event.status !== "draft" :
            false;

          return (
            <Link
              key={step.key}
              href={`/events/${id}/${step.key}`}
              className="flex items-center gap-3 py-3 group"
              style={{ textDecoration: "none" }}
            >
              <span className="text-lg w-7 text-center flex-shrink-0">{step.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:underline">{step.label}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{step.desc}</p>
              </div>
              <span className="text-xs flex-shrink-0" style={{ color: done ? "#00c758" : "var(--color-text-muted)" }}>
                {done ? "✓ Done" : "→"}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/events/${id}/edit`} className="btn-primary text-sm px-4 py-2">Edit Details</Link>
        {event.status === "live" && (
          <a href={`/e/${event.join_code}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm px-4 py-2">
            View Public Page ↗
          </a>
        )}
        <Link href={`/events/${id}/preview`} className="btn-secondary text-sm px-4 py-2">Preview</Link>
        <Link href={`/events/${id}/settings`} className="btn-secondary text-sm px-4 py-2">Settings</Link>
      </div>
    </div>
  );
}
