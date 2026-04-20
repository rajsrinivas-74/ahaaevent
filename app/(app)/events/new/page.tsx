"use client";

import { EventForm } from "@/components/event-form";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
