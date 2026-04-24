"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: "rgba(0,199,88,0.12)",  border: "rgba(0,199,88,0.35)",  icon: "✓" },
    error:   { bg: "rgba(255,101,104,0.12)", border: "rgba(255,101,104,0.35)", icon: "✕" },
    info:    { bg: "rgba(59,130,166,0.12)", border: "rgba(59,130,166,0.35)", icon: "ℹ" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50" style={{ maxWidth: "320px" }}>
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: "#f8fafc",
                animation: "slideIn 0.2s ease",
              }}
            >
              <span className="text-xs font-bold flex-shrink-0"
                style={{ color: t.type === "success" ? "#00c758" : t.type === "error" ? "#ff6568" : "var(--color-blue)" }}>
                {c.icon}
              </span>
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}
