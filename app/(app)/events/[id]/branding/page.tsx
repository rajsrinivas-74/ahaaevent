"use client";

import { BrandingForm } from "@/components/branding-form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { EventBranding } from "@/lib/types";

export default function BrandingPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [branding, setBranding] = useState<EventBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}/branding`)
      .then((res) => res.json())
      .then((data) => {
        setBranding(data);
        setLoading(false);
      });
  }, [eventId]);

  async function handleSave(data: Partial<EventBranding>) {
    setSaved(false);
    const res = await fetch(`/api/events/${eventId}/branding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const updated = await res.json();
      setBranding(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Event Branding</h1>
      {saved && (
        <div className="rounded-lg bg-green-900/30 border border-green-700 p-3 text-sm text-green-300 mb-4">
          Branding saved successfully
        </div>
      )}
      <BrandingForm
        eventId={eventId}
        initialData={branding}
        onSave={handleSave}
      />
    </div>
  );
}
