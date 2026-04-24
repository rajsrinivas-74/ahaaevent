import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { DashboardClient } from "./client";

export interface EventCompletion {
  hasDetails: boolean;
  hasBranding: boolean;
  hasEvaluation: boolean;
  hasForm: boolean;
  hasFaq: boolean;
  hasPreviewed: boolean;
  isPublished: boolean;
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: events } = await supabase
    .schema("ahaa")
    .from("events")
    .select("*")
    .eq("organiser_id", user.id)
    .order("created_at", { ascending: false });

  const typedEvents = (events || []) as Event[];

  let completionMap: Record<string, EventCompletion> = {};

  if (typedEvents.length > 0) {
    const eventIds = typedEvents.map(e => e.id);

    const [{ data: brandings }, { data: fields }, { data: faqs }] = await Promise.all([
      supabase.schema("ahaa").from("event_branding").select("event_id, logo_url, primary_color").in("event_id", eventIds),
      supabase.schema("ahaa").from("form_fields").select("event_id").in("event_id", eventIds),
      supabase.schema("ahaa").from("event_faq").select("event_id").in("event_id", eventIds),
    ]);

    completionMap = Object.fromEntries(typedEvents.map(e => {
      const branding = brandings?.find(b => b.event_id === e.id);
      const hasBranding = !!(branding && (branding.logo_url || branding.primary_color !== "#2563EB"));
      const hasForm = !!(fields?.some(f => f.event_id === e.id));
      const hasFaq = !!(faqs?.some(f => f.event_id === e.id));

      return [e.id, {
        hasDetails:    !!(e.name && e.description && e.start_date && e.end_date && e.venue_type),
        hasBranding,
        hasEvaluation: !!(e.judging_criteria && (e.judging_criteria as unknown[]).length > 0),
        hasForm,
        hasFaq,
        hasPreviewed:  !!(e.name && e.description),
        isPublished:   e.status === "live",
      }];
    }));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Events</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-sec)" }}>Manage and create event pages</p>
        </div>
        <Link href="/events/new" className="btn-primary">+ Create Event</Link>
      </div>

      {typedEvents.length === 0 ? (
        <div className="text-center py-16" style={{ border: "1px dashed var(--color-border)", borderRadius: "1rem" }}>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>You haven&apos;t created any events yet</p>
          <Link href="/events/new" className="btn-primary">Create Your First Event</Link>
        </div>
      ) : (
        <DashboardClient events={typedEvents} completionMap={completionMap} />
      )}
    </div>
  );
}
