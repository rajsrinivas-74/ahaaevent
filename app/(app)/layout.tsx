import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { ToastProvider } from "@/components/toast";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.schema("ahaa").from("organisers")
    .select("name").eq("id", user.id).single();
  const displayName = profile?.name || user.email || "";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="w-7 h-7 rounded-lg gradient-icon-bg flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span className="font-bold text-sm gradient-text">Ahaa Event Hub</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: "var(--color-text-muted)" }}>Events</p>
        <Link href="/dashboard" className="sidebar-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </Link>
        <Link href="/events/new" className="sidebar-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Create Event
        </Link>
        <div className="pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-3" style={{ color: "var(--color-text-muted)" }}>Event Setup</p>
        </div>
        <SidebarNav />
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid var(--color-border)" }}>
        <ThemeToggle />
        <Link href="/profile" className="sidebar-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </Link>
        <a href="https://ahaahub.aiorchestrator.in" target="_blank" rel="noopener noreferrer" className="sidebar-link text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Ahaa Hub
        </a>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="sidebar-link w-full text-left">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex w-60 flex-shrink-0 flex-col"
          style={{ borderRight: "1px solid var(--color-border)", background: "var(--color-bg)" }}
        >
          {sidebarContent}
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            {/* Mobile hamburger */}
            <MobileSidebar>{sidebarContent}</MobileSidebar>

            {/* Desktop spacer */}
            <div className="hidden md:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold gradient-icon-bg">
                {displayName[0]?.toUpperCase()}
              </div>
              <span className="text-sm hidden sm:block" style={{ color: "var(--color-text-sec)" }}>{displayName}</span>
            </div>
          </header>
          <main className="flex-1 px-4 md:px-6 py-6 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
