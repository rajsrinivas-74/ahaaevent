"use client";

import { EventForm } from "@/components/event-form";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { CardSkeleton } from "@/components/skeleton";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<"description" | "tagline" | null>(null);
  const [aiResult, setAiResult] = useState<{ field: string; value: string } | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(r => r.json())
      .then(data => { setEvent(data); setLoading(false); });
  }, [params.id]);

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch(`/api/events/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Save failed");
    const updated = await res.json();
    setEvent(updated);
  }

  async function runAI(action: "refine_description" | "suggest_tagline") {
    if (!event) return;
    setAiLoading(action === "refine_description" ? "description" : "tagline");
    setAiResult(null);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, name: event.name, description: event.description }),
    });
    const data = await res.json();
    if (data.result) {
      setAiResult({
        field: action === "refine_description" ? "description" : "tagline",
        value: data.result,
      });
    }
    setAiLoading(null);
  }

  function applyAiResult() {
    if (!aiResult || !event) return;
    setEvent({ ...event, [aiResult.field]: aiResult.value });
    setAiResult(null);
  }

  if (loading) return (
    <div className="max-w-2xl space-y-4">
      <div className="h-7 w-40 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      <CardSkeleton rows={4} />
      <CardSkeleton rows={3} />
      <CardSkeleton rows={2} />
    </div>
  );
  if (!event) return <div className="text-sm" style={{ color: "#ff6568" }}>Event not found</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Event Details</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runAI("refine_description")}
            disabled={!!aiLoading || !event.description}
            className="btn-secondary flex-1 sm:flex-none"
            style={{ fontSize: "0.75rem" }}
            title={!event.description ? "Add a description first" : ""}
          >
            {aiLoading === "description" ? "Refining…" : "✨ Refine Description"}
          </button>
          <button
            onClick={() => runAI("suggest_tagline")}
            disabled={!!aiLoading}
            className="btn-secondary flex-1 sm:flex-none"
            style={{ fontSize: "0.75rem" }}
          >
            {aiLoading === "tagline" ? "Thinking…" : "✨ Suggest Tagline"}
          </button>
        </div>
      </div>

      {/* AI result banner */}
      {aiResult && (
        <div className="card mb-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-blue)" }}>
            ✨ AI Suggestion — {aiResult.field === "description" ? "Refined Description" : "Tagline"}
          </p>
          <p className="text-sm leading-relaxed">{aiResult.value}</p>
          <div className="flex gap-2">
            <button onClick={applyAiResult} className="btn-primary" style={{ fontSize: "0.75rem" }}>
              Use this
            </button>
            <button onClick={() => setAiResult(null)} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
              Discard
            </button>
          </div>
        </div>
      )}

      <EventForm initialData={event} mode="edit" onSubmit={handleSubmit} />
    </div>
  );
}
