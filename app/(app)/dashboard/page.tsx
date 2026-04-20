import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import type { Event } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: events } = await supabase
    .schema("eventmanager")
    .from("events")
    .select("*")
    .eq("organiser_id", user.id)
    .order("created_at", { ascending: false });

  const typedEvents = (events || []) as Event[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Events</h1>
          <p className="text-gray-400 mt-1">Manage and create event pages</p>
        </div>
        <Link
          href="/events/new"
          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Create New Event
        </Link>
      </div>

      {typedEvents.length === 0 ? (
        <div className="text-center py-16 border border-gray-800 rounded-xl">
          <p className="text-gray-400 mb-4">You haven&apos;t created any events yet</p>
          <Link
            href="/events/new"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {typedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
