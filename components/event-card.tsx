"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Event } from "@/lib/types";
import type { EventCompletion } from "@/app/(app)/dashboard/page";
import { useToast } from "@/components/toast";

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onCancel}>
      <div
        className="card max-w-sm w-full space-y-4"
        onClick={e => e.stopPropagation()}
        style={{ border: "1px solid var(--color-border)" }}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            className="text-sm px-4 py-2 rounded-xl font-semibold"
            style={{ background: "rgba(255,101,104,0.15)", border: "1px solid rgba(255,101,104,0.4)", color: "#ff6568" }}
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_CLASS: Record<string, string> = {
  draft: "badge badge-draft",
  live: "badge badge-live",
  closed: "badge badge-closed",
};

const STEPS: { key: keyof EventCompletion; label: string; href: string }[] = [
  { key: "hasDetails",    label: "Details",    href: "edit"       },
  { key: "hasBranding",   label: "Branding",   href: "branding"   },
  { key: "hasEvaluation", label: "Evaluation", href: "evaluation" },
  { key: "hasForm",       label: "Form",       href: "form"       },
  { key: "hasFaq",        label: "FAQ",        href: "faq"        },
  { key: "hasPreviewed",  label: "Preview",    href: "preview"    },
  { key: "isPublished",   label: "Published",  href: "settings"   },
];

interface EventCardProps {
  event: Event;
  completion?: EventCompletion;
}

export function EventCard({ event, completion }: EventCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cloning, setCloning] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const statusClass = STATUS_CLASS[event.status] || STATUS_CLASS.draft;
  const doneCount = completion ? STEPS.filter(s => completion[s.key]).length : 0;
  const pct = (doneCount / STEPS.length) * 100;
  const nextStep = completion ? STEPS.find(s => !completion[s.key]) : STEPS[0];

  async function handleClone() {
    setCloning(true);
    const res = await fetch(`/api/events/${event.id}/clone`, { method: "POST" });
    const data = await res.json();
    setCloning(false);
    if (data.id) {
      toast("Event cloned — opening copy");
      router.push(`/events/${data.id}/edit`);
      router.refresh();
    } else {
      toast("Clone failed", "error");
    }
  }

  async function doArchive() {
    setConfirmOpen(false);
    setArchiving(true);
    const res = await fetch(`/api/events/${event.id}/archive`, { method: "POST" });
    setArchiving(false);
    if (res.ok) {
      toast("Event archived");
      router.refresh();
    } else {
      toast("Archive failed", "error");
    }
  }

  return (
    <>
      {confirmOpen && (
        <ConfirmModal
          message={`Archive "${event.name}"? It will be marked as Closed and hidden from participants.`}
          onConfirm={doArchive}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-base truncate">{event.name}</h3>
        <span className={statusClass}>{event.status}</span>
      </div>

      {/* Meta */}
      <div className="space-y-0.5 text-xs" style={{ color: "var(--color-text-sec)" }}>
        <p className="capitalize">{event.type.replace("_", " ")}</p>
        {event.start_date && (
          <p>{new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        )}
      </div>

      {/* Progress */}
      {completion && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {doneCount}/{STEPS.length} steps complete
            </span>
            {doneCount === STEPS.length && (
              <span className="text-xs font-semibold" style={{ color: "#00c758" }}>✓ Ready</span>
            )}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "#00c758"
                  : "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
              }}
            />
          </div>
          <div className="flex gap-1.5">
            {STEPS.map(step => (
              <Link
                key={step.key}
                href={`/events/${event.id}/${step.href}`}
                title={step.label}
                className="flex-1 h-1 rounded-full transition-all"
                style={{
                  background: completion[step.key]
                    ? step.key === "isPublished" ? "#00c758" : "var(--color-blue)"
                    : "var(--color-border)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Primary actions */}
      <div className="flex gap-2 flex-wrap pt-1">
        {nextStep && doneCount < STEPS.length && (
          <Link
            href={`/events/${event.id}/${nextStep.href}`}
            className="btn-primary"
            style={{ fontSize: "0.72rem", padding: "0.25rem 0.75rem" }}
          >
            → {nextStep.label}
          </Link>
        )}
        <Link
          href={`/events/${event.id}/edit`}
          className="btn-secondary"
          style={{ fontSize: "0.72rem", padding: "0.25rem 0.75rem" }}
        >
          Edit
        </Link>
        {event.status === "live" && (
          <a
            href={`/e/${event.join_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: "0.72rem", padding: "0.25rem 0.75rem" }}
          >
            View ↗
          </a>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2 flex-wrap" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
        <button
          onClick={handleClone}
          disabled={cloning}
          className="btn-secondary"
          style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", opacity: cloning ? 0.6 : 1 }}
        >
          {cloning ? "Cloning…" : "⧉ Clone"}
        </button>
        {event.status !== "closed" && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={archiving}
            className="btn-secondary"
            style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", color: "var(--color-text-muted)", opacity: archiving ? 0.6 : 1 }}
          >
            {archiving ? "Archiving…" : "Archive"}
          </button>
        )}
      </div>
    </div>
    </>
  );
}
