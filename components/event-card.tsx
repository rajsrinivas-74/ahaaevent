import Link from "next/link";
import type { Event } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-yellow-900/30 text-yellow-300 border-yellow-700",
  live: "bg-green-900/30 text-green-300 border-green-700",
  closed: "bg-gray-800 text-gray-400 border-gray-700",
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.draft;

  return (
    <div className="rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg truncate mr-2">{event.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${statusStyle}`}>
          {event.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-400 mb-4">
        <p className="capitalize">{event.type.replace("_", " ")}</p>
        {event.start_date && (
          <p>{new Date(event.start_date).toLocaleDateString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/events/${event.id}/edit`}
          className="text-sm px-3 py-1 rounded border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors"
        >
          Edit
        </Link>
        <Link
          href={`/events/${event.id}/branding`}
          className="text-sm px-3 py-1 rounded border border-gray-700 text-gray-300 hover:border-gray-500 transition-colors"
        >
          Branding
        </Link>
      </div>
    </div>
  );
}
