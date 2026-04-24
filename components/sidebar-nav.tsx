"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const EVENT_NAV = [
  {
    href: "edit",
    label: "Details",
    icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
  },
  {
    href: "branding",
    label: "Branding",
    icon: (
      <>
        <circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </>
    ),
  },
  {
    href: "evaluation",
    label: "Evaluation",
    icon: (
      <>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </>
    ),
  },
  {
    href: "form",
    label: "Form Builder",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
  },
  {
    href: "faq",
    label: "FAQ",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  {
    href: "preview",
    label: "Preview",
    icon: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    href: "settings",
    label: "Publish & Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const match = pathname.match(/\/events\/([^/]+)(?:\/([^/]+))?/);
  const eventId = match?.[1];
  const activeSection = match?.[2];
  const hasEvent = !!(eventId && eventId !== "new");

  return (
    <div className="space-y-0.5">
      {EVENT_NAV.map((item) => {
        const isActive = hasEvent && activeSection === item.href;
        const href = hasEvent ? `/events/${eventId}/${item.href}` : "#";

        return (
          <Link
            key={item.href}
            href={href}
            onClick={!hasEvent ? e => e.preventDefault() : undefined}
            className="sidebar-link"
            style={{
              color: isActive ? "var(--color-text)" : hasEvent ? undefined : "var(--color-text-muted)",
              background: isActive ? "var(--color-card-hover)" : undefined,
              opacity: hasEvent ? 1 : 0.45,
              cursor: hasEvent ? "pointer" : "default",
              fontSize: "0.8rem",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            {item.label}
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full gradient-icon-bg flex-shrink-0" />}
          </Link>
        );
      })}
      {!hasEvent && (
        <p className="px-2 pt-2 text-xs" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>
          Select an event to enable
        </p>
      )}
    </div>
  );
}
