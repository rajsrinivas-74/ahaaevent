"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/types";
import type { EventCompletion } from "./page";
import { EventCard } from "@/components/event-card";

const STATUS_COLORS: Record<string, string> = {
  draft:  "var(--color-text-muted)",
  live:   "#00c758",
  closed: "#ff6568",
};

function ListRow({ event, completion }: { event: Event; completion?: EventCompletion }) {
  const doneCount = completion ? [completion.hasDetails, completion.hasBranding, completion.hasEvaluation, completion.hasForm, completion.hasFaq, completion.hasPreviewed, completion.isPublished].filter(Boolean).length : 0;

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl group"
      style={{ border: "1px solid var(--color-border)", background: "var(--color-card)", textDecoration: "none" }}
    >
      {/* Status dot */}
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[event.status] }} />

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:underline">{event.name}</p>
        <p className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>{event.type.replace("_", " ")}</p>
      </div>

      {/* Date */}
      {event.start_date && (
        <p className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "var(--color-text-muted)" }}>
          {new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}

      {/* Progress */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-16 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(doneCount / 6) * 100}%`,
              background: doneCount === 5 ? "#00c758" : "linear-gradient(90deg, var(--color-blue), var(--color-purple))",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{doneCount}/7</span>
      </div>

      {/* Status badge */}
      <span
        className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
        style={{ background: `${STATUS_COLORS[event.status]}22`, color: STATUS_COLORS[event.status], border: `1px solid ${STATUS_COLORS[event.status]}44` }}
      >
        {event.status}
      </span>

      <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>→</span>
    </Link>
  );
}

export function DashboardClient({ events, completionMap }: { events: Event[]; completionMap: Record<string, EventCompletion> }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          {(["grid", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: view === v ? "var(--color-card)" : "transparent",
                color: view === v ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              {v === "grid" ? (
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Grid
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  List
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.id} event={event} completion={completionMap[event.id]} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <ListRow key={event.id} event={event} completion={completionMap[event.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
