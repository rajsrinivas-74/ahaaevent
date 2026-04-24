import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicEventView } from "@/components/public-event-view";
import type { Event, EventBranding, EventFaq, FormField, FormSection } from "@/lib/types";

async function getEventData(joinCode: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/public/${joinCode}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json() as Promise<{ event: Event; branding: EventBranding | null; faq: EventFaq[]; sections: FormSection[]; fields: FormField[] }>;
}

export async function generateMetadata({ params }: { params: { joinCode: string } }): Promise<Metadata> {
  const data = await getEventData(params.joinCode);
  if (!data) return { title: "Event Not Found" };

  const { event, branding } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const ogParams = new URLSearchParams({
    name:    event.name,
    tagline: event.tagline || "",
    type:    event.type,
    date:    event.start_date
      ? new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "",
    primary: branding?.primary_color    || "#3b82a6",
    accent:  branding?.accent_color     || "#6b5fa7",
    bg:      branding?.background_color || "#020617",
    logo:    branding?.logo_url         || "",
    banner:  branding?.banner_url       || "",
  });

  const ogImageUrl = `${siteUrl}/api/og?${ogParams.toString()}`;

  return {
    title: event.name,
    description: event.tagline || event.description || undefined,
    openGraph: {
      title: event.name,
      description: event.tagline || event.description || undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: event.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: event.tagline || event.description || undefined,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicEventPage({ params }: { params: { joinCode: string } }) {
  const data = await getEventData(params.joinCode);
  if (!data) notFound();

  if (data.event.status === "draft") {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#020617", color: "#f8fafc" }}>
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">Coming Soon</p>
          <p className="text-sm" style={{ color: "#ffffff60" }}>This event hasn&apos;t been published yet.</p>
        </div>
      </main>
    );
  }

  return <PublicEventView event={data.event} branding={data.branding} faq={data.faq} sections={data.sections} fields={data.fields} />;
}
