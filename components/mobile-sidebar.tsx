"use client";

import { useState } from "react";

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ border: "1px solid var(--color-border)" }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col w-64 md:hidden transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
        {children}
      </aside>
    </>
  );
}
