"use client";

import { BrandingForm } from "@/components/branding-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Event, EventBranding } from "@/lib/types";
import { useToast } from "@/components/toast";
import { CardSkeleton } from "@/components/skeleton";

export default function BrandingPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [branding, setBranding] = useState<EventBranding | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${eventId}/branding`).then(r => r.json()),
      fetch(`/api/events/${eventId}`).then(r => r.json()),
    ]).then(([b, e]) => {
      setBranding(b);
      setEvent(e);
      setLoading(false);
    });
  }, [eventId]);

  async function handleSave(data: Partial<EventBranding>) {
    const res = await fetch(`/api/events/${eventId}/branding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setBranding(updated);
      toast("Branding saved");
    } else {
      toast("Failed to save branding", "error");
    }
  }

  async function handleSuggestPalette() {
    if (!event) return;
    setSuggesting(true);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "suggest_palette",
        name: event.name,
        type: event.type,
        theme: event.theme,
      }),
    });
    const data = await res.json();
    setSuggesting(false);
    if (data.error) { toast(data.error, "error"); return; }

    // Apply palette to branding and save
    const patch = {
      ...(branding || {}),
      primary_color: data.primary_color,
      accent_color: data.accent_color,
      background_color: data.background_color,
    };
    setBranding(patch as EventBranding);
    await handleSave(patch);
    toast(data.rationale ? `✨ ${data.rationale}` : "Palette applied");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Event Branding</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Customise colours, fonts, logo and banner</p>
        </div>
        <button
          onClick={handleSuggestPalette}
          disabled={suggesting || loading}
          className="btn-secondary"
          style={{ fontSize: "0.8rem" }}
        >
          {suggesting ? "Generating…" : "✨ AI Colour Palette"}
        </button>
      </div>
      {loading ? (
        <div className="space-y-4 max-w-2xl">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={3} />
        </div>
      ) : (
        <BrandingForm eventId={eventId} initialData={branding} onSave={handleSave} />
      )}
    </div>
  );
}
