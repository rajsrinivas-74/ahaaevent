"use client";

import { EventForm } from "@/components/event-form";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch(`/api/events/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard");
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  if (!event) {
    return <div className="text-red-400">Event not found</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <EventForm
        initialData={event}
        mode="edit"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
