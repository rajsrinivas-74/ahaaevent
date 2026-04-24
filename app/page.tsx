import Link from "next/link";
import { DemoButton } from "@/components/demo-button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-icon-bg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            </svg>
          </div>
          <div>
            <span className="font-bold gradient-text">AI Orchestrator</span>
            <span className="ml-1 font-bold" style={{ color: "var(--color-text-muted)" }}>Platform</span>
          </div>
        </div>
        <Link href="/auth/login" className="btn-secondary" style={{ height: "2.25rem", fontSize: "0.8rem" }}>
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center text-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-icon-bg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-2xl md:text-3xl font-bold gradient-text">Ahaa Event Hub</span>
        </div>

        <h1 className="text-base md:text-2xl font-bold mb-4 max-w-3xl leading-tight">
          You have an event. Let&apos;s make it{" "}
          <span className="gradient-text">unforgettable.</span>
        </h1>
        <p className="text-base md:text-lg mb-3 max-w-2xl leading-relaxed" style={{ color: "var(--color-text-sec)" }}>
          Create fully branded, shareable event pages with custom submission forms — in minutes.
        </p>
        <p className="text-sm mb-10 max-w-xl" style={{ color: "var(--color-text-muted)" }}>
          For college fests, accelerators, and corporate innovation teams.
        </p>

        {/* Feature cards */}
        <div className="w-full max-w-2xl mx-auto space-y-6 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>
            What you can do
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                ),
                color: "var(--color-blue)",
                title: "Brand Your Event",
                desc: "Custom logo, colors, fonts, and banner with live preview",
                tag: "Logo · Colors · Font · Banner",
              },
              {
                icon: (
                  <>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </>
                ),
                color: "var(--color-purple)",
                title: "Build Submission Forms",
                desc: "Drag-drop form builder with sections and field types",
                tag: "Drag-drop · Sections · Fields",
              },
              {
                icon: (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </>
                ),
                color: "var(--color-pink)",
                title: "Publish & Share",
                desc: "One join code, one link — your branded event goes live",
                tag: "Join code · Public page · SEO",
              },
              {
                icon: (
                  <>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </>
                ),
                color: "var(--color-blue)",
                title: "Add FAQs & AI Assist",
                desc: "Refine your event description and tagline with AI",
                tag: "FAQ · AI refine · Tagline",
              },
            ].map((f) => (
              <div key={f.title} className="card flex flex-col items-start gap-3 text-left">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}20` }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm mb-0.5">{f.title}</p>
                  <p className="text-xs leading-snug mb-2" style={{ color: "var(--color-text-sec)" }}>{f.desc}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}
                  >
                    {f.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="w-full max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted)" }}>
            How it works
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {["Create Event", "Brand It", "Build Form", "Add FAQ", "Publish"].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-text-sec)" }}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/auth/signup" className="btn-primary px-6 py-2.5 w-full sm:w-auto justify-center">
            Get Started Free
          </Link>
          <Link href="/auth/login" className="btn-secondary px-6 py-2.5 w-full sm:w-auto justify-center">
            Sign In
          </Link>
        </div>

        {/* Demo shortcut */}
        <DemoButton />

        <p className="mt-6 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Part of the{" "}
          <a href="https://ahaahub.aiorchestrator.in" className="hover:underline" style={{ color: "var(--color-blue)" }}>
            AI Orchestrator Platform
          </a>
        </p>
      </main>
    </div>
  );
}
